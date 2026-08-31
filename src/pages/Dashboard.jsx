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
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
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

        // Fetch folders and files in parallel
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

  // ── Navigation handlers ──
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
      toast.error('Failed to view file');
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
    ? `Results for "${debouncedQuery}"`
    : currentFolder
    ? currentFolder.name
    : 'My Drive';

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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onUploadClick={() => setIsUploadOpen(true)}
          onCreateFolderClick={() => setIsCreateFolderOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Page title */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
            {!debouncedQuery && !currentFolder && (
              <p className="text-sm text-slate-500 mt-1">All your files, organized.</p>
            )}
          </div>

          {/* Breadcrumb navigation (only in browse mode) */}
          {!debouncedQuery && (
            <Breadcrumbs path={path} onNavigate={handleBreadcrumbNavigate} />
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500">Loading files...</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              type={debouncedQuery ? 'search' : 'drive'}
              searchQuery={debouncedQuery}
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