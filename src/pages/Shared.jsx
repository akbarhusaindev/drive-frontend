import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import { shareService } from '../services/shareService';
import { fileService } from '../services/fileService';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import {
  Loader2, Download, Eye, ChevronDown, ChevronRight,
  FolderOpen, Folder, User, Sparkles
} from 'lucide-react';
import AiPdfChatModal from '../components/AiPdfChatModal';
import toast from 'react-hot-toast';

/* ─── Single file row ─────────────────────────────────────────────────── */
function SharedFileRow({ file, sharedBy, onAiChatClick }) {
  const { Icon, color } = getFileIconInfo({ ...file, type: 'file' });
  const isPdf =
    file.mimeType === 'application/pdf' ||
    (file.originalName || file.name || '').toLowerCase().endsWith('.pdf');

  const handleView = async () => {
    try {
      const { data } = await fileService.getDownloadUrl(file.id, 'inline');
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error('Failed to open file');
    }
  };

  const handleDownload = async () => {
    try {
      const { data } = await fileService.getDownloadUrl(file.id, 'attachment');
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
    <div className="grid grid-cols-12 gap-3 items-center px-3 py-2.5 hover:bg-surface-2/60 transition-colors group ml-6">
      {/* Name */}
      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: getFileIconInfo({ ...file, type: 'file' }).bg }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span
          className="truncate text-xs font-medium text-text-primary"
          title={file.originalName}
        >
          {file.originalName}
        </span>
      </div>

      {/* Size */}
      <div className="col-span-2 hidden sm:block text-xs text-text-muted">
        {formatSize(file.size)}
      </div>

      {/* Type */}
      <div className="col-span-2 hidden md:block text-xs text-text-muted capitalize">
        {file.mimeType?.split('/')[1]?.toUpperCase() ?? '—'}
      </div>

      {/* Added */}
      <div className="col-span-1 hidden lg:block text-xs text-text-muted">
        {formatDate(file.createdAt)}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isPdf && (
          <button
            onClick={() => onAiChatClick && onAiChatClick(file)}
            title="Ask Gemini AI about this PDF"
            className="rounded p-1 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            aria-label="Ask AI"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={handleView}
          title="View file"
          className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
          aria-label="View"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDownload}
          title="Download file"
          className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Collapsible sender folder ───────────────────────────────────────── */
function SenderFolderCard({ folder, onAiChatClick }) {
  const [expanded, setExpanded] = useState(true);
  const files = folder.files ?? [];
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;
  const FolderIcon = expanded ? FolderOpen : Folder;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden mb-3">
      {/* Folder header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-2/50 transition-colors cursor-pointer"
      >
        <ChevronIcon className="h-3.5 w-3.5 text-text-muted shrink-0" />
        <FolderIcon className="h-4 w-4 text-primary shrink-0" />

        {/* Sender avatar-chip */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-semibold text-text-primary truncate max-w-[220px]">
            {folder.folderName}
          </span>
        </div>

        <span className="ml-auto text-[11px] text-text-muted shrink-0">
          {files.length} {files.length === 1 ? 'file' : 'files'}
          {folder.createdAt ? ` · ${formatDate(folder.createdAt)}` : ''}
        </span>
      </button>

      {/* File list */}
      {expanded && files.length > 0 && (
        <div className="border-t border-border/60">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-3 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-muted bg-surface-2/30 ml-6">
            <div className="col-span-5">Name</div>
            <div className="col-span-2 hidden sm:block">Size</div>
            <div className="col-span-2 hidden md:block">Type</div>
            <div className="col-span-1 hidden lg:block">Shared</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border/40">
            {files.map((file) => (
              <SharedFileRow
                key={file.id}
                file={file}
                sharedBy={folder.folderName}
                onAiChatClick={onAiChatClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state inside folder */}
      {expanded && files.length === 0 && (
        <div className="py-6 text-center text-xs text-text-muted border-t border-border/60">
          No files in this shared folder yet.
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function Shared() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiChatFile, setAiChatFile] = useState(null);
  const { resolvedTheme } = useTheme();

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await shareService.getSharedFolders();
      setFolders(data ?? []);
    } catch (err) {
      console.error('Failed to load shared folders:', err);
      setFolders([]);
      toast.error('Could not load shared items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const totalFiles = folders.reduce((acc, f) => acc + (f.files?.length ?? 0), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#18181c' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f4f4f5' : '#0f172a',
            border:
              resolvedTheme === 'dark'
                ? '1px solid #27272a'
                : '1px solid #e2e8f0',
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
          {/* Page header */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-text-primary">
                Shared with me
              </h1>
              {!loading && (
                <p className="mt-0.5 text-xs text-text-muted">
                  {folders.length === 0
                    ? 'Nothing shared yet'
                    : `${folders.length} sender${folders.length !== 1 ? 's' : ''} · ${totalFiles} file${totalFiles !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-xs text-text-muted">Loading shared files…</p>
            </div>
          ) : folders.length === 0 ? (
            <EmptyState type="shared" />
          ) : (
            <div>
              {folders.map((folder) => (
                <SenderFolderCard
                  key={folder.folderId}
                  folder={folder}
                  onAiChatClick={setAiChatFile}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <AiPdfChatModal
        isOpen={!!aiChatFile}
        onClose={() => setAiChatFile(null)}
        file={aiChatFile}
      />
    </div>
  );
}
