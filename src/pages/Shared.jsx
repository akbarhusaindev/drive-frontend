import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import { shareService } from '../services/shareService';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { Loader2, Download, Eye } from 'lucide-react';
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
      toast.error('Failed to open file');
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
      toast.error('Failed to download file');
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
              Shared with me
            </h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-xs text-text-muted">Loading shared files...</p>
            </div>
          ) : shares.length === 0 ? (
            <EmptyState type="shared" />
          ) : (
            <div className="flex flex-col">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-text-muted border-b border-border">
                <div className="col-span-4">Name</div>
                <div className="col-span-2 hidden sm:block">Size</div>
                <div className="col-span-2 hidden sm:block">Permission</div>
                <div className="col-span-2 hidden md:block">Shared by</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border/60">
                {shares.map((share) => {
                  const file = share.file;
                  if (!file) return null;
                  const { Icon, color } = getFileIconInfo({ ...file, type: 'file' });
                  const canEdit = share.permission === 'EDITOR';

                  return (
                    <div
                      key={share.id}
                      className="grid grid-cols-12 gap-3 items-center px-3 py-2.5 hover:bg-surface-2/60 transition-colors"
                    >
                      {/* Name */}
                      <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2">
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <span className="truncate text-xs font-medium text-text-primary" title={file.originalName}>
                          {file.originalName}
                        </span>
                      </div>

                      {/* Size */}
                      <div className="col-span-2 hidden sm:block text-xs text-text-muted">
                        {formatSize(file.size)}
                      </div>

                      {/* Permission */}
                      <div className="col-span-2 hidden sm:block">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${
                            canEdit
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-surface-2 text-text-secondary'
                          }`}
                        >
                          {canEdit ? 'Can Edit' : 'Can View'}
                        </span>
                      </div>

                      {/* Shared By */}
                      <div className="col-span-2 hidden md:block text-xs text-text-muted truncate">
                        {share.sharedBy?.email || '—'}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end gap-1">
                        <button
                          onClick={() => handleView(share)}
                          title="View file"
                          className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
                          aria-label="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => handleDownload(share)}
                            title="Download file"
                            className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
                            aria-label="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
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