import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import FileGrid from '../components/FileGrid';
import Breadcrumbs from '../components/Breadcrumbs';
import UploadModal from '../components/UploadModal';
import CreateFolderModal from '../components/CreateFolderModal';
import ShareModal from '../components/ShareModal';
import RenameModal from '../components/RenameModal';
import PublicLinkModal from '../components/PublicLinkModal';
import MoveModal from '../components/MoveModal';
import EmptyState from '../components/EmptyState';
import { Toaster } from 'react-hot-toast';
import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import { searchService } from '../services/searchService';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  // Folder navigation
  const [currentFolder, setCurrentFolder] = useState(null); // null = root
  const [path, setPath] = useState([]);

  // Content
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [publicLinkItem, setPublicLinkItem] = useState(null);
  const [moveItem, setMoveItem] = useState(null);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      if (debouncedQuery.trim()) {
        // ── SEARCH MODE ──
        const { data } = await searchService.search(debouncedQuery);
        const folders = (data.folders?.content || []).map((f) => ({
          ...f,
          type: 'folder',
          name: f.name,
        }));
        const files = (data.files?.content || []).map((f) => ({
          ...f,
          type: 'file',
          name: f.originalName,
        }));
        setItems([...folders, ...files]);
      } else {
        // ── BROWSE MODE ──
        const folderId = currentFolder?.id ?? null;

        const [foldersRes, filesRes] = await Promise.all([
          folderId
            ? folderService.getChildFolders(folderId)
            : folderService.getRootFolders(),
          folderId
            ? fileService.getFilesInFolder(folderId)
            : fileService.getRootFiles(),
        ]);

        const folders = (foldersRes.data || []).map((f) => ({
          ...f,
          type: 'folder',
          name: f.name,
        }));
        const files = (filesRes.data || []).map((f) => ({
          ...f,
          type: 'file',
          name: f.originalName,
        }));

        setItems([...folders, ...files]);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
      toast.error('Failed to load files');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, debouncedQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Navigation handlers
  const handleFolderClick = (folder) => {
    if (debouncedQuery) {
      setSearchQuery('');
      setDebouncedQuery('');
    }
    setCurrentFolder(folder);
    setPath((prev) => [...prev, folder]);
  };

  const handleBreadcrumbNavigate = (targetFolder) => {
    if (!targetFolder) {
      setCurrentFolder(null);
      setPath([]);
    } else {
      const idx = path.findIndex((f) => f.id === targetFolder.id);
      setCurrentFolder(targetFolder);
      setPath(path.slice(0, idx + 1));
    }
  };

  const handleFileClick = async (file) => {
    try {
      const { data } = await fileService.getDownloadUrl(file.id, 'inline');
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

  const handleTrash = async (item) => {
    try {
      if (item.type === 'folder') {
        await folderService.trashFolder(item.id);
      } else {
        await fileService.trashFile(item.id);
      }
      toast.success(`Moved "${item.originalName || item.name}" to trash`);
      fetchItems();
    } catch {
      toast.error('Failed to move to trash');
    }
  };

  const pageTitle = debouncedQuery
    ? `Search results for "${debouncedQuery}"`
    : currentFolder
    ? currentFolder.name
    : 'My Drive';

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
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '12px',
            fontWeight: 500,
          },
        }}
      />

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onUploadClick={() => setIsUploadOpen(true)}
          onCreateFolderClick={() => setIsCreateFolderOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              {pageTitle}
            </h1>
          </div>

          {/* Breadcrumbs */}
          {!debouncedQuery && (
            <Breadcrumbs path={path} onNavigate={handleBreadcrumbNavigate} />
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-xs text-text-muted">Loading files...</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              type={debouncedQuery ? 'search' : 'drive'}
              searchQuery={debouncedQuery}
              onUploadClick={() => setIsUploadOpen(true)}
              onCreateFolderClick={() => setIsCreateFolderOpen(true)}
            />
          ) : (
            <FileGrid
              items={items}
              onFolderClick={handleFolderClick}
              onFileClick={handleFileClick}
              onShareClick={setShareItem}
              onTrashClick={handleTrash}
              onRenameClick={setRenameItem}
              onPublicLinkClick={setPublicLinkItem}
              onMoveClick={setMoveItem}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={fetchItems}
        currentFolderId={currentFolder?.id}
      />
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreated={fetchItems}
        parentFolderId={currentFolder?.id}
      />
      <ShareModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
      />
      <RenameModal
        isOpen={!!renameItem}
        onClose={() => setRenameItem(null)}
        item={renameItem}
        onRenamed={fetchItems}
      />
      <PublicLinkModal
        isOpen={!!publicLinkItem}
        onClose={() => setPublicLinkItem(null)}
        item={publicLinkItem}
      />
      <MoveModal
        isOpen={!!moveItem}
        onClose={() => setMoveItem(null)}
        item={moveItem}
        onMoved={fetchItems}
      />
    </div>
  );
}