import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import { shareService } from '../services/shareService';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import { Loader2, Users, Download, Eye } from 'lucide-react';
import { fileService } from '../services/fileService';
import toast from 'react-hot-toast';

export default function Shared() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Shared with me</h1>
              <p className="text-sm text-slate-500 mt-0.5">Files other users have shared with you</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : shares.length === 0 ? (
            <EmptyState type="shared" />
          ) : (
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-600">
                <div className="col-span-4">Name</div>
                <div className="col-span-2 hidden sm:block">Size</div>
                <div className="col-span-2 hidden sm:block">Permission</div>
                <div className="col-span-2 hidden md:block">Shared by</div>
                <div className="col-span-2 text-right" />
              </div>

              {shares.map((share) => {
                const file = share.file;
                if (!file) return null;
                const { Icon, color, bg } = getFileIconInfo({ ...file, type: 'file' });
                const canEdit = share.permission === 'EDITOR';

                return (
                  <div
                    key={share.id}
                    className="glass glass-hover grid grid-cols-12 gap-4 items-center rounded-xl px-4 py-3"
                  >
                    {/* File name + icon */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: bg }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <span className="truncate text-sm font-medium text-slate-200">
                        {file.originalName}
                      </span>
                    </div>

                    {/* Size */}
                    <div className="col-span-2 hidden sm:block text-sm text-slate-500">
                      {formatSize(file.size)}
                    </div>

                    {/* Permission badge */}
                    <div className="col-span-2 hidden sm:block">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          canEdit
                            ? 'bg-emerald-600/20 text-emerald-400'
                            : 'bg-indigo-600/20 text-indigo-400'
                        }`}
                      >
                        {canEdit ? 'Can edit' : 'Can view'}
                      </span>
                    </div>

                    {/* Shared by */}
                    <div className="col-span-2 hidden md:block text-sm text-slate-500 truncate">
                      {share.sharedBy?.email || '—'}
                    </div>

                    {/* Actions conditional check */}
                    <div className="col-span-2 flex justify-end gap-1.5">
                      {/* View Action (Available for both VIEWER and EDITOR) */}
                      <button
                        onClick={() => handleView(share)}
                        title="View file"
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-white/10 hover:text-indigo-400 transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Download Action (Only available for EDITOR) */}
                      {canEdit && (
                        <button
                          onClick={() => handleDownload(share)}
                          title="Download file"
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-white/10 hover:text-emerald-400 transition-all"
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