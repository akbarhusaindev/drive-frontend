import { useState, useMemo } from 'react';
import {
  LayoutGrid, List, MoreVertical, Share2, Trash2, Edit2, Link2, Move,
  ArrowUpDown, ArrowUp, ArrowDown, Folder, FileText, Image, Film, Archive,
  FileCode, Layers, Download, Eye, Sparkles
} from 'lucide-react';
import { getFileIconInfo, formatSize, formatDate, getMimeLabel } from '../utils/formatters';

const CATEGORIES = [
  { id: 'all', label: 'All Files', icon: Layers },
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
    return null;
  }

  return (
    <div onClick={closeMenu} className="space-y-5">
      {/* Filter Chips & Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        {!isTrashView && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'btn-primary shadow-sm'
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

        {/* View Controls & Sort Options */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 ml-auto">
          {/* Sorting buttons */}
          <div className="flex items-center gap-1 border border-border bg-surface-2/60 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                sortBy === 'name' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Sort by Name"
            >
              <span>Name</span>
              {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <button
              onClick={() => toggleSort('date')}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                sortBy === 'date' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Sort by Date"
            >
              <span>Date</span>
              {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <button
              onClick={() => toggleSort('size')}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                sortBy === 'size' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Sort by Size"
            >
              <span>Size</span>
              {sortBy === 'size' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
          </div>

          {/* View toggle (Grid / List) */}
          <div className="flex items-center gap-1 border border-border bg-surface-2/60 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setView('grid')}
              className={`rounded-xl p-1.5 transition-all cursor-pointer ${
                view === 'grid' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-xl p-1.5 transition-all cursor-pointer ${
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
      <div className="flex items-center justify-between text-xs font-semibold text-text-muted px-1">
        <span>Showing {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}</span>
        {activeCategory !== 'all' && (
          <button
            onClick={() => setActiveCategory('all')}
            className="text-primary hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
        <div className="flex flex-col gap-2">
          {/* List header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <div className="col-span-6">Name</div>
            <div className="col-span-2 hidden sm:block">Type / Size</div>
            <div className="col-span-3 hidden md:block">Last Modified</div>
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
  const { Icon, color, bg, border, badge, previewGradient } = getFileIconInfo(item);
  const isFolder = item.type === 'folder';

  return (
    <div
      className={`file-card group glass relative rounded-3xl p-4 cursor-pointer animate-fadeInUp flex flex-col justify-between border border-border/70 hover:border-indigo-500/40 transition-all ${
        isTrashView ? 'opacity-70' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div>
        {/* Top Header / Preview Icon Box */}
        <div
          className={`relative mb-3 flex h-24 w-full items-center justify-center rounded-2xl bg-gradient-to-b ${previewGradient} border border-border/40 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300`}
        >
          {/* Ambient Glow */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>

          {/* Badge */}
          <span
            className="absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs"
            style={{ background: bg, color, border: `1px solid ${border}` }}
          >
            {badge}
          </span>

          {/* Quick Hover Action Bar */}
          {!isTrashView && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
              {!isFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareClick && onShareClick(item);
                  }}
                  title="Share"
                  className="rounded-xl p-1.5 bg-surface/90 text-text-muted hover:text-indigo-500 hover:bg-surface border border-border shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === item.id ? null : item.id);
                }}
                className={`rounded-xl p-1.5 bg-surface/90 text-text-muted hover:text-text-primary hover:bg-surface border border-border shadow-xs transition-all cursor-pointer ${
                  activeMenu === item.id ? 'opacity-100 bg-surface text-text-primary' : 'opacity-0 group-hover:opacity-100'
                }`}
                aria-label="More options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Name */}
        <p
          className="truncate text-xs font-bold text-text-primary tracking-tight mb-1"
          title={item.originalName || item.name}
        >
          {item.originalName || item.name}
        </p>
      </div>

      {/* Metadata footer */}
      <div className="flex items-center justify-between text-[11px] font-medium text-text-muted mt-2 pt-2 border-t border-border/40">
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
        position="top-12 right-3"
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
  const { Icon, color, bg, border, badge } = getFileIconInfo(item);
  const isFolder = item.type === 'folder';

  return (
    <div
      className={`file-card glass relative grid grid-cols-12 gap-4 items-center rounded-2xl px-5 py-3.5 cursor-pointer animate-fadeInUp border border-border/60 hover:border-indigo-500/30 ${
        isTrashView ? 'opacity-70' : ''
      }`}
      onClick={() => onItemClick(item)}
    >
      <div className="col-span-6 flex items-center gap-3.5 min-w-0">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-xs"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="truncate text-xs font-bold text-text-primary"
            title={item.originalName || item.name}
          >
            {item.originalName || item.name}
          </span>
          <span className="text-[10px] text-text-muted sm:hidden">
            {isFolder ? 'Folder' : formatSize(item.size)}
          </span>
        </div>
      </div>

      <div className="col-span-2 hidden sm:flex items-center gap-2 text-xs font-medium text-text-muted">
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase"
          style={{ background: bg, color }}
        >
          {badge}
        </span>
        <span>{isFolder ? '—' : formatSize(item.size)}</span>
      </div>

      <div className="col-span-3 hidden md:block text-xs text-text-muted font-medium">
        {formatDate(item.createdAt || item.updatedAt)}
      </div>

      <div className="col-span-1 flex justify-end relative items-center gap-1.5">
        {!isTrashView && (
          <>
            {!isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShareClick && onShareClick(item);
                }}
                title="Share"
                className="hidden sm:inline-flex rounded-xl p-2 text-text-muted hover:bg-surface-3 hover:text-indigo-500 transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === item.id ? null : item.id);
              }}
              className="rounded-xl p-2 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-all cursor-pointer"
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
          position="top-10 right-0"
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
      className={`absolute ${position} z-50 w-52 context-menu p-1.5 animate-scaleIn`}
      onClick={(e) => e.stopPropagation()}
    >
      {isTrashView ? (
        <>
          <MenuItem
            icon={<Move className="h-4 w-4 text-emerald-500" />}
            label="Restore Item"
            onClick={(e) => handleAction(e, onRestoreClick)}
            className="text-emerald-500 hover:bg-emerald-500/10"
          />
          <MenuItem
            icon={<Trash2 className="h-4 w-4 text-rose-500" />}
            label="Delete Forever"
            onClick={(e) => handleAction(e, onDeleteClick)}
            className="text-rose-500 hover:bg-rose-500/10"
          />
        </>
      ) : (
        <>
          {!isFolder && (
            <>
              <MenuItem
                icon={<Share2 className="h-4 w-4 text-indigo-500" />}
                label="Share File"
                onClick={(e) => handleAction(e, onShareClick)}
              />
              <MenuItem
                icon={<Link2 className="h-4 w-4 text-purple-500" />}
                label="Copy Public Link"
                onClick={(e) => handleAction(e, onPublicLinkClick)}
              />
              <MenuItem
                icon={<Move className="h-4 w-4 text-cyan-500" />}
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
            icon={<Trash2 className="h-4 w-4 text-rose-500" />}
            label="Move to Trash"
            onClick={(e) => handleAction(e, onTrashClick)}
            className="text-rose-500 hover:bg-rose-500/10"
          />
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, className = 'text-text-secondary hover:text-text-primary hover:bg-surface-2' }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
