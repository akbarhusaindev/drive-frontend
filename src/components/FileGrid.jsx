import { useState, useMemo } from 'react';
import {
  LayoutGrid, List, MoreVertical, Share2, Trash2, Edit2, Link2, Move,
  ArrowUpDown, ArrowUp, ArrowDown, Folder, FileText, Image, Film, Archive,
  FileCode, Layers
} from 'lucide-react';
import { getFileIconInfo, formatSize, formatDate, getMimeLabel } from '../utils/formatters';

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

  // Sort items
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    return list.sort((a, b) => {
      // Keep folders on top in normal view unless sorting by size/date explicitly
      if (sortBy === 'name') {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
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
    });
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
    return null; // EmptyState rendered by parent
  }

  return (
    <div onClick={closeMenu} className="space-y-4">
      {/* Category Pills & Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter categories */}
        {!isTrashView && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-xs font-semibold'
                      : 'border border-border bg-surface-2/60 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* View mode & Sorting */}
        <div className="flex items-center justify-between sm:justify-end gap-2 ml-auto">
          {/* Sorting dropdown button */}
          <div className="flex items-center gap-1 border border-border bg-surface-2/60 rounded-xl p-1">
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'name' ? 'bg-surface text-primary font-semibold shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Sort by Name"
            >
              <span>Name</span>
              {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <button
              onClick={() => toggleSort('date')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'date' ? 'bg-surface text-primary font-semibold shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Sort by Date"
            >
              <span>Date</span>
              {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <button
              onClick={() => toggleSort('size')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'size' ? 'bg-surface text-primary font-semibold shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Sort by Size"
            >
              <span>Size</span>
              {sortBy === 'size' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 border border-border bg-surface-2/60 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                view === 'grid' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                view === 'list' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Item count status */}
      <div className="text-xs font-medium text-text-muted px-0.5">
        Showing {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {sortedItems.map((item) => (
            <FileCardGrid
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
              isTrashView={isTrashView}
              onRestoreClick={onRestoreClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {/* List header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            <div className="col-span-6">Name</div>
            <div className="col-span-2 hidden sm:block">Size</div>
            <div className="col-span-3 hidden md:block">Modified</div>
            <div className="col-span-1 text-right" />
          </div>
          {sortedItems.map((item) => (
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
              isTrashView={isTrashView}
              onRestoreClick={onRestoreClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Grid Card ─────────────────────────────────────────────── */
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
  isTrashView,
  onRestoreClick,
  onDeleteClick,
}) {
  const { Icon, color, bg, border } = getFileIconInfo(item);
  const isFolder = item.type === 'folder';

  return (
    <div
      className={`file-card group glass glass-hover relative rounded-2xl p-4 cursor-pointer animate-fadeInUp flex flex-col justify-between ${
        isTrashView ? 'opacity-70' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div>
        {/* Icon & Category Badge */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>

          {/* Quick Actions (visible on hover or when menu is active) */}
          {!isTrashView && (
            <div className="flex items-center gap-0.5">
              {!isFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareClick && onShareClick(item);
                  }}
                  title="Share"
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-3 hover:text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === item.id ? null : item.id);
                }}
                className={`rounded-lg p-1.5 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-all cursor-pointer ${
                  activeMenu === item.id ? 'opacity-100 bg-surface-3 text-text-primary' : 'opacity-0 group-hover:opacity-100'
                }`}
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Name */}
        <p
          className="truncate text-sm font-semibold text-text-primary mb-1 tracking-tight"
          title={item.originalName || item.name}
        >
          {item.originalName || item.name}
        </p>
      </div>

      {/* Metadata footer */}
      <div className="flex items-center justify-between text-xs text-text-muted mt-2 pt-2 border-t border-border/50">
        <span>{isFolder ? 'Folder' : formatSize(item.size)}</span>
        <span>{formatDate(item.createdAt || item.updatedAt)}</span>
      </div>

      {/* Context Menu Dropdown */}
      <ContextDropdown
        item={item}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onShareClick={onShareClick}
        onTrashClick={onTrashClick}
        onRenameClick={onRenameClick}
        onPublicLinkClick={onPublicLinkClick}
        onMoveClick={onMoveClick}
        isTrashView={isTrashView}
        onRestoreClick={onRestoreClick}
        onDeleteClick={onDeleteClick}
        position="top-11 right-2"
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
  isTrashView,
  onRestoreClick,
  onDeleteClick,
}) {
  const { Icon, color, bg, border } = getFileIconInfo(item);
  const isFolder = item.type === 'folder';

  return (
    <div
      className={`file-card glass glass-hover relative grid grid-cols-12 gap-4 items-center rounded-xl px-4 py-2.5 cursor-pointer animate-fadeInUp ${
        isTrashView ? 'opacity-70' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div className="col-span-6 flex items-center gap-3 min-w-0">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color }} />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="truncate text-sm font-medium text-text-primary"
            title={item.originalName || item.name}
          >
            {item.originalName || item.name}
          </span>
          <span className="text-[10px] text-text-muted sm:hidden">
            {isFolder ? 'Folder' : formatSize(item.size)}
          </span>
        </div>
      </div>

      <div className="col-span-2 hidden sm:block text-xs font-medium text-text-muted">
        {isFolder ? '—' : formatSize(item.size)}
      </div>

      <div className="col-span-3 hidden md:block text-xs text-text-muted">
        {formatDate(item.createdAt || item.updatedAt)}
      </div>

      <div className="col-span-1 flex justify-end relative items-center gap-1">
        {!isTrashView && (
          <>
            {!isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShareClick && onShareClick(item);
                }}
                title="Share"
                className="hidden sm:inline-flex rounded-lg p-1.5 text-text-muted hover:bg-surface-3 hover:text-primary transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === item.id ? null : item.id);
              }}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-all cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </>
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
          isTrashView={isTrashView}
          onRestoreClick={onRestoreClick}
          onDeleteClick={onDeleteClick}
          position="top-8 right-0"
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

  return (
    <div
      className={`absolute ${position} z-50 w-48 context-menu py-1.5 animate-fadeInUp`}
      onClick={(e) => e.stopPropagation()}
    >
      {isTrashView ? (
        <>
          <MenuItem
            icon={<Move className="h-4 w-4 text-emerald-500" />}
            label="Restore"
            onClick={(e) => handleAction(e, onRestoreClick)}
            className="text-emerald-500 hover:text-emerald-600"
          />
          <MenuItem
            icon={<Trash2 className="h-4 w-4 text-red-500" />}
            label="Delete Forever"
            onClick={(e) => handleAction(e, onDeleteClick)}
            className="text-red-500 hover:text-red-600"
          />
        </>
      ) : (
        <>
          {!isFolder && (
            <>
              <MenuItem
                icon={<Share2 className="h-4 w-4 text-indigo-500" />}
                label="Share"
                onClick={(e) => handleAction(e, onShareClick)}
              />
              <MenuItem
                icon={<Link2 className="h-4 w-4 text-purple-500" />}
                label="Copy Link"
                onClick={(e) => handleAction(e, onPublicLinkClick)}
              />
              <MenuItem
                icon={<Move className="h-4 w-4 text-emerald-500" />}
                label="Move to Folder"
                onClick={(e) => handleAction(e, onMoveClick)}
              />
            </>
          )}
          <MenuItem
            icon={<Edit2 className="h-4 w-4 text-blue-500" />}
            label="Rename"
            onClick={(e) => handleAction(e, onRenameClick)}
          />
          <div className="my-1 border-t border-border" />
          <MenuItem
            icon={<Trash2 className="h-4 w-4 text-red-500" />}
            label="Move to Trash"
            onClick={(e) => handleAction(e, onTrashClick)}
            className="text-red-500 hover:text-red-600"
          />
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, className = 'text-text-secondary hover:text-text-primary' }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-surface-2 cursor-pointer ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
