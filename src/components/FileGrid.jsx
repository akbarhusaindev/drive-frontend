import { useState } from 'react';
import { LayoutGrid, List, MoreVertical, Share2, Trash2, Edit2, Link2, Move } from 'lucide-react';
import { getFileIconInfo, formatSize, formatDate } from '../utils/formatters';

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

  const closeMenu = () => setActiveMenu(null);

  const handleItemClick = (item) => {
    if (isTrashView) return;
    if (item.type === 'folder') {
      onFolderClick(item);
    } else {
      onFileClick && onFileClick(item);
    }
  };

  if (!items || items.length === 0) {
    return null; // EmptyState rendered by parent
  }

  return (
    <div onClick={closeMenu}>
      {/* View toggle */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-1 glass rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-500 hover:text-white'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-500 hover:text-white'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((item) => (
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
        <div className="flex flex-col gap-1">
          {/* List header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-600">
            <div className="col-span-6">Name</div>
            <div className="col-span-2 hidden sm:block">Size</div>
            <div className="col-span-3 hidden md:block">Modified</div>
            <div className="col-span-1" />
          </div>
          {items.map((item) => (
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
function FileCardGrid({ item, activeMenu, setActiveMenu, onItemClick, onShareClick, onTrashClick, onRenameClick, onPublicLinkClick, onMoveClick, isTrashView, onRestoreClick, onDeleteClick }) {
  const { Icon, color, bg } = getFileIconInfo(item);

  return (
    <div
      className={`file-card group glass glass-hover relative rounded-2xl p-4 cursor-pointer animate-fadeInUp ${isTrashView ? 'opacity-60' : ''}`}
      onClick={() => onItemClick(item)}
    >
      {/* Icon */}
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: bg }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      {/* Name */}
      <p className="truncate text-sm font-medium text-slate-200 mb-1">{item.originalName || item.name}</p>
      <p className="text-xs text-slate-600">{formatSize(item.size)}</p>

      {/* Action buttons */}
      {!isTrashView && (
        <div className="absolute right-2 top-2 flex items-center gap-0.5">
          {item.type !== 'folder' && (
            <button
              onClick={(e) => { e.stopPropagation(); onShareClick(item); }}
              title="Share"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-indigo-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-slate-300 opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
            style={{ opacity: activeMenu === item.id ? 1 : undefined }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
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
        position="top-10 right-2"
      />
    </div>
  );
}

/* ─── List Row ──────────────────────────────────────────────── */
function FileCardList({ item, activeMenu, setActiveMenu, onItemClick, onShareClick, onTrashClick, onRenameClick, onPublicLinkClick, onMoveClick, isTrashView, onRestoreClick, onDeleteClick }) {
  const { Icon, color, bg } = getFileIconInfo(item);

  return (
    <div
      className={`file-card glass glass-hover relative grid grid-cols-12 gap-4 items-center rounded-xl px-4 py-3 cursor-pointer ${isTrashView ? 'opacity-60' : ''}`}
      onClick={() => onItemClick(item)}
    >
      <div className="col-span-6 flex items-center gap-3 min-w-0">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: bg }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color }} />
        </div>
        <span className="truncate text-sm font-medium text-slate-200">{item.originalName || item.name}</span>
      </div>

      <div className="col-span-2 hidden sm:block text-sm text-slate-500">{formatSize(item.size)}</div>
      <div className="col-span-3 hidden md:block text-sm text-slate-500">{formatDate(item.createdAt || item.updatedAt)}</div>

      <div className="col-span-1 flex justify-end relative items-center gap-0.5">
        {!isTrashView && (
          <>
            {item.type !== 'folder' && (
              <button
                onClick={(e) => { e.stopPropagation(); onShareClick(item); }}
                title="Share"
                className="rounded-lg p-1.5 text-slate-600 hover:bg-white/10 hover:text-indigo-400 transition-all"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-white/10 hover:text-slate-300 transition-all"
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
function ContextDropdown({ item, activeMenu, setActiveMenu, onShareClick, onTrashClick, onRenameClick, onPublicLinkClick, onMoveClick, isTrashView, onRestoreClick, onDeleteClick, position }) {
  if (activeMenu !== item.id) return null;

  const handleAction = (e, fn) => {
    e.stopPropagation();
    fn && fn(item);
    setActiveMenu(null);
  };

  return (
    <div
      className={`absolute ${position} z-50 w-48 context-menu py-1.5 animate-fadeInUp`}
      onClick={(e) => e.stopPropagation()}
    >
      {isTrashView ? (
        <>
          <MenuItem icon={<Move className="h-4 w-4 text-emerald-400" />} label="Restore" onClick={(e) => handleAction(e, onRestoreClick)} className="text-emerald-400 hover:text-emerald-300" />
          <MenuItem icon={<Trash2 className="h-4 w-4 text-red-400" />} label="Delete Forever" onClick={(e) => handleAction(e, onDeleteClick)} className="text-red-400 hover:text-red-300" />
        </>
      ) : (
        <>
          {item.type !== 'folder' && (
            <>
              <MenuItem icon={<Share2 className="h-4 w-4 text-indigo-400" />} label="Share" onClick={(e) => handleAction(e, onShareClick)} />
              <MenuItem icon={<Link2 className="h-4 w-4 text-purple-400" />} label="Copy Link" onClick={(e) => handleAction(e, onPublicLinkClick)} />
              <MenuItem icon={<Move className="h-4 w-4 text-emerald-400" />} label="Move to Folder" onClick={(e) => handleAction(e, onMoveClick)} />
            </>
          )}
          <MenuItem icon={<Edit2 className="h-4 w-4 text-blue-400" />} label="Rename" onClick={(e) => handleAction(e, onRenameClick)} />
          <div className="my-1 border-t border-white/5" />
          <MenuItem icon={<Trash2 className="h-4 w-4 text-red-400" />} label="Move to Trash" onClick={(e) => handleAction(e, onTrashClick)} className="text-red-400 hover:text-red-300" />
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, className = 'text-slate-300 hover:text-white' }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
