import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Loader2, Trash2, RefreshCw, X } from 'lucide-react';

export default function Trash() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();

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
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#16172e' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '14px',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.2)',
            fontSize: '13px',
            fontWeight: 500,
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-500 shadow-sm">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Trash</h1>
              <p className="text-xs text-text-muted mt-0.5">
                Items moved to trash can be restored or permanently deleted
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3 animate-fadeInUp">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-xs font-semibold text-text-muted">Loading trash...</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState type="trash" />
          ) : (
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <div className="col-span-5">Name</div>
                <div className="col-span-2 hidden sm:block">Size</div>
                <div className="col-span-3 hidden md:block">Deleted Date</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {items.map((item) => {
                const { Icon, color, bg, border } = getFileIconInfo(item);
                return (
                  <div
                    key={item.id}
                    className="glass grid grid-cols-12 gap-4 items-center rounded-2xl px-4 py-3 opacity-80 hover:opacity-100 transition-all animate-fadeInUp"
                  >
                    {/* Name */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl grayscale"
                        style={{ background: bg, border: `1px solid ${border}` }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color }} />
                      </div>
                      <span className="truncate text-sm font-medium text-text-muted line-through" title={item.originalName || item.name}>
                        {item.originalName || item.name}
                      </span>
                    </div>

                    {/* Size */}
                    <div className="col-span-2 hidden sm:block text-xs font-medium text-text-muted">
                      {item.type !== 'folder' ? formatSize(item.size) : '—'}
                    </div>

                    {/* Deleted date */}
                    <div className="col-span-3 hidden md:block text-xs text-text-muted">
                      {formatDate(item.updatedAt)}
                    </div>

                    {/* Action buttons */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRestore(item)}
                        title="Restore item"
                        className="rounded-xl p-2 text-text-muted hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
                        aria-label="Restore item"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        title="Delete permanently"
                        className="rounded-xl p-2 text-text-muted hover:bg-red-500/15 hover:text-red-500 transition-all cursor-pointer"
                        aria-label="Delete permanently"
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