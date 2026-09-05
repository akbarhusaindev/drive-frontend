import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw, X } from 'lucide-react';

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
            background: resolvedTheme === 'dark' ? '#18181c' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f4f4f5' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid #27272a' : '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '12px',
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
          <div className="mb-4">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Trash
            </h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-xs text-text-muted">Loading trash...</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState type="trash" />
          ) : (
            <div className="flex flex-col">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-text-muted border-b border-border">
                <div className="col-span-5">Name</div>
                <div className="col-span-2 hidden sm:block">Size</div>
                <div className="col-span-3 hidden md:block">Deleted Date</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border/60">
                {items.map((item) => {
                  const { Icon, color } = getFileIconInfo(item);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-3 items-center px-3 py-2.5 hover:bg-surface-2/60 transition-colors opacity-75"
                    >
                      {/* Name */}
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2">
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <span className="truncate text-xs font-medium text-text-muted line-through" title={item.originalName || item.name}>
                          {item.originalName || item.name}
                        </span>
                      </div>

                      {/* Size */}
                      <div className="col-span-2 hidden sm:block text-xs text-text-muted">
                        {item.type !== 'folder' ? formatSize(item.size) : '—'}
                      </div>

                      {/* Deleted date */}
                      <div className="col-span-3 hidden md:block text-xs text-text-muted">
                        {formatDate(item.updatedAt)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleRestore(item)}
                          title="Restore"
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Delete permanently"
                          className="rounded p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}