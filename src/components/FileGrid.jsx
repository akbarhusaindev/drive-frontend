import { useState, useMemo } from 'react';
import {
  LayoutGrid, List, MoreVertical, Share2, Trash2, Edit2, Link2, Move,
  ArrowUp, ArrowDown, Folder, FileText, Image, Film, Archive,
  FileCode, Layers, Download, Sparkles
} from 'lucide-react';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'folder', label: 'Folders', icon: Folder },
  { id: 'document', label: 'Documents', icon: FileText },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'media', label: 'Media', icon: Film },
  { id: 'archive', label: 'Archives', icon: Archive },
  { id: 'code', label: 'Code', icon: FileCode },
];

export default function FileGrid({
  items,
  onFolderClick,
  onFileClick,
  onShareClick,
  onTrashClick,
  onRenameClick,
  onPublicLinkClick,
  onMoveClick,
  onAiChatClick,
  isTrashView = false,
  onRestoreClick,
  onDeleteClick,
}) {
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'size' | 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const closeMenu = () => setActiveMenu(null);

  const handleItemClick = (item) => {
    if (isTrashView) return;
    if (item.type === 'folder') {
      onFolderClick && onFolderClick(item);
    } else {
      onFileClick && onFileClick(item);
    }
  };

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (activeCategory === 'all') return items;

    return items.filter((item) => {
      const { category } = getFileIconInfo(item);
      return category === activeCategory;
    });
  }, [items, activeCategory]);

  // Separate folders and files for clean hierarchical display in grid view
  const { folders, files } = useMemo(() => {
    const fList = [];
    const filesList = [];
    for (const item of filteredItems) {
      if (item.type === 'folder') {
        fList.push(item);
      } else {
        filesList.push(item);
      }
    }

    const sortFn = (a, b) => {
      if (sortBy === 'name') {
        const nameA = (a.originalName || a.name || '').toLowerCase();
        const nameB = (b.originalName || b.name || '').toLowerCase();
        const cmp = nameA.localeCompare(nameB);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'size') {
        const sizeA = a.size || 0;
        const sizeB = b.size || 0;
        return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
      }
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    };

    return {
      folders: fList.sort(sortFn),
      files: filesList.sort(sortFn),
    };
  }, [filteredItems, sortBy, sortOrder]);

  const toggleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div onClick={closeMenu} className="space-y-6">
      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter categories */}
        {!isTrashView && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-surface-2 text-text-primary font-semibold border border-border-strong'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* View Mode & Sorting */}
        <div className="flex items-center justify-between sm:justify-end gap-2 ml-auto">
          {/* Sorting buttons */}
          <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'name' ? 'bg-surface text-text-primary shadow-xs font-semibold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Name</span>
              {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <button
              onClick={() => toggleSort('date')}
              className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'date' ? 'bg-surface text-text-primary shadow-xs font-semibold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Date</span>
              {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <button
              onClick={() => toggleSort('size')}
              className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'size' ? 'bg-surface text-text-primary shadow-xs font-semibold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Size</span>
              {sortBy === 'size' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-surface-2 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setView('grid')}
              className={`rounded p-1 transition-colors cursor-pointer ${
                view === 'grid' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded p-1 transition-colors cursor-pointer ${
                view === 'list' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="space-y-6">
          {/* Folders Section */}
          {folders.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5 px-0.5">
                Folders ({folders.length})
              </h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {folders.map((folder) => (
                  <FolderCardGrid
                    key={folder.id}
                    item={folder}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    onItemClick={handleItemClick}
                    onTrashClick={onTrashClick}
                    onRenameClick={onRenameClick}
                    isTrashView={isTrashView}
                    onRestoreClick={onRestoreClick}
                    onDeleteClick={onDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 && (
            <div>
              {folders.length > 0 && (
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5 px-0.5">
                  Files ({files.length})
                </h2>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {files.map((file) => (
                  <FileCardGrid
                    key={file.id}
                    item={file}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    onItemClick={handleItemClick}
                    onShareClick={onShareClick}
                    onTrashClick={onTrashClick}
                    onRenameClick={onRenameClick}
                    onPublicLinkClick={onPublicLinkClick}
                    onMoveClick={onMoveClick}
                    onAiChatClick={onAiChatClick}
                    isTrashView={isTrashView}
                    onRestoreClick={onRestoreClick}
                    onDeleteClick={onDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col">
          {/* List Table Header */}
          <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-text-muted border-b border-border">
            <div className="col-span-6">Name</div>
            <div className="col-span-2 hidden sm:block">Size</div>
            <div className="col-span-3 hidden md:block">Last Modified</div>
            <div className="col-span-1 text-right" />
          </div>

          <div className="divide-y divide-border/60">
            {[...folders, ...files].map((item) => (
              <FileCardList
                key={item.id}
                item={item}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                onItemClick={handleItemClick}
                onShareClick={onShareClick}
                onTrashClick={onTrashClick}
                onRenameClick={onRenameClick}
                onPublicLinkClick={onPublicLinkClick}
                onMoveClick={onMoveClick}
                onAiChatClick={onAiChatClick}
                isTrashView={isTrashView}
                onRestoreClick={onRestoreClick}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Compact Folder Grid Card ──────────────────────────────── */
function FolderCardGrid({
  item,
  activeMenu,
  setActiveMenu,
  onItemClick,
  onTrashClick,
  onRenameClick,
  isTrashView,
  onRestoreClick,
  onDeleteClick,
}) {
  return (
    <div
      className={`group relative modern-card modern-card-hover rounded-xl p-3 cursor-pointer flex items-center justify-between gap-2.5 animate-fadeInUp ${
        isTrashView ? 'opacity-60' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Folder className="h-4 w-4" />
        </div>
        <span
          className="truncate text-xs font-medium text-text-primary"
          title={item.name}
        >
          {item.name}
        </span>
      </div>

      {!isTrashView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === item.id ? null : item.id);
          }}
          className={`shrink-0 rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer ${
            activeMenu === item.id ? 'opacity-100 bg-surface-2' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Options"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      )}

      <ContextDropdown
        item={item}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onTrashClick={onTrashClick}
        onRenameClick={onRenameClick}
        isTrashView={isTrashView}
        onRestoreClick={onRestoreClick}
        onDeleteClick={onDeleteClick}
        position="top-8 right-1"
      />
    </div>
  );
}

/* ─── File Grid Card ────────────────────────────────────────── */
function FileCardGrid({
  item,
  activeMenu,
  setActiveMenu,
  onItemClick,
  onShareClick,
  onTrashClick,
  onRenameClick,
  onPublicLinkClick,
  onMoveClick,
  onAiChatClick,
  isTrashView,
  onRestoreClick,
  onDeleteClick,
}) {
  const { Icon, color, badge } = getFileIconInfo(item);
  const isPdf =
    item.mimeType === 'application/pdf' ||
    (item.originalName || item.name || '').toLowerCase().endsWith('.pdf');

  return (
    <div
      className={`group relative modern-card modern-card-hover rounded-xl p-3 cursor-pointer flex flex-col justify-between animate-fadeInUp ${
        isTrashView ? 'opacity-60' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div>
        {/* Preview header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: 'var(--bg-surface-2)' }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>

          <div className="flex items-center gap-1">
            {isPdf && !isTrashView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAiChatClick && onAiChatClick(item);
                }}
                className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                title="Ask Gemini AI about this PDF"
              >
                <Sparkles className="h-3 w-3" />
                <span>AI</span>
              </button>
            )}

            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
              {badge}
            </span>

            {!isTrashView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === item.id ? null : item.id);
                }}
                className={`rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer ${
                  activeMenu === item.id ? 'opacity-100 bg-surface-2' : 'opacity-0 group-hover:opacity-100'
                }`}
                aria-label="Options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <p
          className="truncate text-xs font-medium text-text-primary mb-1"
          title={item.originalName || item.name}
        >
          {item.originalName || item.name}
        </p>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border/50">
        <span>{formatSize(item.size)}</span>
        <span>{formatDate(item.createdAt || item.updatedAt)}</span>
      </div>

      <ContextDropdown
        item={item}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onShareClick={onShareClick}
        onTrashClick={onTrashClick}
        onRenameClick={onRenameClick}
        onPublicLinkClick={onPublicLinkClick}
        onMoveClick={onMoveClick}
        onAiChatClick={onAiChatClick}
        isTrashView={isTrashView}
        onRestoreClick={onRestoreClick}
        onDeleteClick={onDeleteClick}
        position="top-8 right-2"
      />
    </div>
  );
}

/* ─── List Row ──────────────────────────────────────────────── */
function FileCardList({
  item,
  activeMenu,
  setActiveMenu,
  onItemClick,
  onShareClick,
  onTrashClick,
  onRenameClick,
  onPublicLinkClick,
  onMoveClick,
  onAiChatClick,
  isTrashView,
  onRestoreClick,
  onDeleteClick,
}) {
  const { Icon, color } = getFileIconInfo(item);
  const isFolder = item.type === 'folder';
  const isPdf =
    !isFolder &&
    (item.mimeType === 'application/pdf' ||
      (item.originalName || item.name || '').toLowerCase().endsWith('.pdf'));

  return (
    <div
      className={`group relative grid grid-cols-12 gap-3 items-center px-3 py-2.5 hover:bg-surface-2/60 transition-colors cursor-pointer ${
        isTrashView ? 'opacity-60' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2">
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <span
          className="truncate text-xs font-medium text-text-primary"
          title={item.originalName || item.name}
        >
          {item.originalName || item.name}
        </span>
        {isPdf && !isTrashView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAiChatClick && onAiChatClick(item);
            }}
            className="hidden sm:inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
            title="Ask Gemini AI about this PDF"
          >
            <Sparkles className="h-2.5 w-2.5" />
            <span>AI</span>
          </button>
        )}
      </div>

      <div className="col-span-2 hidden sm:block text-xs text-text-muted">
        {isFolder ? '—' : formatSize(item.size)}
      </div>

      <div className="col-span-3 hidden md:block text-xs text-text-muted">
        {formatDate(item.createdAt || item.updatedAt)}
      </div>

      <div className="col-span-1 flex justify-end relative items-center gap-1">
        {!isTrashView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === item.id ? null : item.id);
            }}
            className="rounded p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Options"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        )}

        <ContextDropdown
          item={item}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onShareClick={onShareClick}
          onTrashClick={onTrashClick}
          onRenameClick={onRenameClick}
          onPublicLinkClick={onPublicLinkClick}
          onMoveClick={onMoveClick}
          onAiChatClick={onAiChatClick}
          isTrashView={isTrashView}
          onRestoreClick={onRestoreClick}
          onDeleteClick={onDeleteClick}
          position="top-6 right-0"
        />
      </div>
    </div>
  );
}

/* ─── Shared Context Dropdown ────────────────────────────────── */
function ContextDropdown({
  item,
  activeMenu,
  setActiveMenu,
  onShareClick,
  onTrashClick,
  onRenameClick,
  onPublicLinkClick,
  onMoveClick,
  onAiChatClick,
  isTrashView,
  onRestoreClick,
  onDeleteClick,
  position,
}) {
  if (activeMenu !== item.id) return null;

  const handleAction = (e, fn) => {
    e.stopPropagation();
    fn && fn(item);
    setActiveMenu(null);
  };

  const isFolder = item.type === 'folder';
  const isPdf =
    !isFolder &&
    (item.mimeType === 'application/pdf' ||
      (item.originalName || item.name || '').toLowerCase().endsWith('.pdf'));

  return (
    <div
      className={`absolute ${position} z-50 w-44 context-menu p-1 animate-fadeInUp`}
      onClick={(e) => e.stopPropagation()}
    >
      {isTrashView ? (
        <>
          <MenuItem
            icon={<Move className="h-3.5 w-3.5 text-emerald-500" />}
            label="Restore"
            onClick={(e) => handleAction(e, onRestoreClick)}
          />
          <MenuItem
            icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
            label="Delete Forever"
            onClick={(e) => handleAction(e, onDeleteClick)}
            className="text-red-500 hover:bg-red-500/10"
          />
        </>
      ) : (
        <>
          {isPdf && (
            <MenuItem
              icon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
              label="Ask Gemini AI"
              onClick={(e) => handleAction(e, onAiChatClick)}
              className="text-primary font-semibold hover:bg-primary/10"
            />
          )}
          {!isFolder && (
            <>
              <MenuItem
                icon={<Share2 className="h-3.5 w-3.5 text-primary" />}
                label="Share"
                onClick={(e) => handleAction(e, onShareClick)}
              />
              <MenuItem
                icon={<Link2 className="h-3.5 w-3.5 text-text-muted" />}
                label="Copy Link"
                onClick={(e) => handleAction(e, onPublicLinkClick)}
              />
              <MenuItem
                icon={<Move className="h-3.5 w-3.5 text-text-muted" />}
                label="Move"
                onClick={(e) => handleAction(e, onMoveClick)}
              />
            </>
          )}
          <MenuItem
            icon={<Edit2 className="h-3.5 w-3.5 text-text-muted" />}
            label="Rename"
            onClick={(e) => handleAction(e, onRenameClick)}
          />
          <div className="my-1 border-t border-border" />
          <MenuItem
            icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
            label="Move to Trash"
            onClick={(e) => handleAction(e, onTrashClick)}
            className="text-red-500 hover:bg-red-500/10"
          />
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, className = 'text-text-secondary hover:bg-surface-2 hover:text-text-primary' }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
