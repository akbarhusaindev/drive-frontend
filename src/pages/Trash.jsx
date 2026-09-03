import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Loader2, Trash2, RefreshCw, X, AlertOctagon } from 'lucide-react';

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
      toast.success(`"${item.originalName || item.name}" restored to Drive`);
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
            background: resolvedTheme === 'dark' ? '#14162d' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            boxShadow: '0 16px 36px -8px rgba(0,0,0,0.25)',
            fontSize: '13px',
            fontWeight: 600,
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

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-grid-pattern">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 shadow-md">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight text-text-primary">
                Trash
              </h1>
              <p className="text-xs text-text-muted mt-0.5 font-medium">
                Deleted items are safely stored here and can be restored or permanently removed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fadeInUp">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 shadow-md">
                <Loader2 className="h-7 w-7 animate-spin text-rose-500" />
              </div>
              <p className="text-xs font-bold text-text-muted">Loading trash items...</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState type="trash" />
          ) : (
            <div className="space-y-3">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <div className="col-span-5">Name</div>
                <div className="col-span-2 hidden sm:block">Size</div>
                <div className="col-span-3 hidden md:block">Deleted Timestamp</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {items.map((item) => {
                const { Icon, color, bg, border } = getFileIconInfo(item);
                return (
                  <div
                    key={item.id}
                    className="glass grid grid-cols-12 gap-4 items-center rounded-2xl px-5 py-3.5 opacity-85 hover:opacity-100 transition-all animate-fadeInUp border border-border/70"
                  >
                    {/* Name */}
                    <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl grayscale opacity-75"
                        style={{ background: bg, border: `1px solid ${border}` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <span className="truncate text-xs font-bold text-text-muted line-through" title={item.originalName || item.name}>
                        {item.originalName || item.name}
                      </span>
                    </div>

                    {/* Size */}
                    <div className="col-span-2 hidden sm:block text-xs font-medium text-text-muted">
                      {item.type !== 'folder' ? formatSize(item.size) : '—'}
                    </div>

                    {/* Deleted date */}
                    <div className="col-span-3 hidden md:block text-xs text-text-muted font-medium">
                      {formatDate(item.updatedAt)}
                    </div>

                    {/* Action buttons */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(item)}
                        title="Restore item"
                        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/30 transition-all cursor-pointer"
                        aria-label="Restore item"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        title="Delete permanently"
                        className="rounded-xl p-2 text-text-muted hover:bg-rose-500/15 hover:text-rose-500 transition-all cursor-pointer"
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