import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import { shareService } from '../services/shareService';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { Loader2, Users, Download, Eye } from 'lucide-react';
import { fileService } from '../services/fileService';
import toast from 'react-hot-toast';

export default function Shared() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchShares = async () => {
      setLoading(true);
      try {
        const { data } = await shareService.getSharedWithMe();
        setShares(data || []);
      } catch (err) {
        console.error(err);
        setShares([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, []);

  const handleView = async (share) => {
    try {
      const { data } = await fileService.getDownloadUrl(share.file.id, 'inline');
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      toast.error('Failed to view file');
    }
  };

  const handleDownload = async (share) => {
    try {
      const { data } = await fileService.getDownloadUrl(share.file.id, 'attachment');
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.setAttribute('download', data.fileName || 'download');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error('Failed to get download link');
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Shared with me</h1>
              <p className="text-xs text-text-muted mt-0.5">Files and documents other users have collaborated on with you</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3 animate-fadeInUp">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-xs font-semibold text-text-muted">Loading shared files...</p>
            </div>
          ) : shares.length === 0 ? (
            <EmptyState type="shared" />
          ) : (
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <div className="col-span-4">Name</div>
                <div className="col-span-2 hidden sm:block">Size</div>
                <div className="col-span-2 hidden sm:block">Permission</div>
                <div className="col-span-2 hidden md:block">Shared by</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {shares.map((share) => {
                const file = share.file;
                if (!file) return null;
                const { Icon, color, bg, border } = getFileIconInfo({ ...file, type: 'file' });
                const canEdit = share.permission === 'EDITOR';

                return (
                  <div
                    key={share.id}
                    className="glass glass-hover grid grid-cols-12 gap-4 items-center rounded-2xl px-4 py-3 animate-fadeInUp"
                  >
                    {/* File name + icon */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: bg, border: `1px solid ${border}` }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color }} />
                      </div>
                      <span className="truncate text-sm font-semibold text-text-primary" title={file.originalName}>
                        {file.originalName}
                      </span>
                    </div>

                    {/* Size */}
                    <div className="col-span-2 hidden sm:block text-xs font-medium text-text-muted">
                      {formatSize(file.size)}
                    </div>

                    {/* Permission badge */}
                    <div className="col-span-2 hidden sm:block">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          canEdit
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-primary/15 text-primary border border-primary/30'
                        }`}
                      >
                        {canEdit ? 'Can Edit' : 'Can View'}
                      </span>
                    </div>

                    {/* Shared by */}
                    <div className="col-span-2 hidden md:block text-xs text-text-muted truncate">
                      {share.sharedBy?.email || '—'}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-1.5">
                      <button
                        onClick={() => handleView(share)}
                        title="View file"
                        className="rounded-xl p-2 text-text-muted hover:bg-surface-3 hover:text-primary transition-all cursor-pointer"
                        aria-label="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => handleDownload(share)}
                          title="Download file"
                          className="rounded-xl p-2 text-text-muted hover:bg-surface-3 hover:text-emerald-500 transition-all cursor-pointer"
                          aria-label="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
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