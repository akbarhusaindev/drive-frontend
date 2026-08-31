import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { Loader2, Trash2, RefreshCw, X } from 'lucide-react';

export default function Trash() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        api.get('/trash/files'),
        api.get('/trash/folders'),
      ]);
      const files = (filesRes.data || []).map((f) => ({ ...f, type: 'file' }));
      const folders = (foldersRes.data || []).map((f) => ({ ...f, type: 'folder' }));
      setItems([...folders, ...files]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (item) => {
    try {
      if (item.type === 'folder') {
        await api.post(`/trash/folders/${item.id}/restore`);
      } else {
        await api.post(`/trash/files/${item.id}/restore`);
      }
      toast.success(`"${item.originalName || item.name}" restored`);
      fetchTrash();
    } catch {
      toast.error('Failed to restore');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Permanently delete "${item.originalName || item.name}"? This cannot be undone.`)) return;
    try {
      if (item.type === 'folder') {
        await api.delete(`/trash/folders/${item.id}`);
      } else {
        await api.delete(`/trash/files/${item.id}`);
      }
      toast.success('Permanently deleted');
      fetchTrash();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f0f23' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e42',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          searchQuery=""
          setSearchQuery={() => {}}
          onUploadClick={() => {}}
          onCreateFolderClick={() => {}}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Trash</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Items moved to trash can be restored or permanently deleted
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState type="trash" />
          ) : (
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-600">
                <div className="col-span-5">Name</div>
                <div className="col-span-2 hidden sm:block">Size</div>
                <div className="col-span-3 hidden md:block">Deleted</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {items.map((item) => {
                const { Icon, color, bg } = getFileIconInfo(item);
                return (
                  <div
                    key={item.id}
                    className="glass grid grid-cols-12 gap-4 items-center rounded-xl px-4 py-3 opacity-75"
                  >
                    {/* Name */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg grayscale"
                        style={{ background: bg }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color }} />
                      </div>
                      <span className="truncate text-sm font-medium text-slate-400 line-through decoration-slate-600">
                        {item.originalName || item.name}
                      </span>
                    </div>

                    {/* Size */}
                    <div className="col-span-2 hidden sm:block text-sm text-slate-600">
                      {item.type !== 'folder' ? formatSize(item.size) : '—'}
                    </div>

                    {/* Deleted date */}
                    <div className="col-span-3 hidden md:block text-sm text-slate-600">
                      {formatDate(item.updatedAt)}
                    </div>

                    {/* Action buttons */}
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleRestore(item)}
                        title="Restore"
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-emerald-600/10 hover:text-emerald-400 transition-all"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        title="Delete permanently"
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-red-600/10 hover:text-red-400 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}