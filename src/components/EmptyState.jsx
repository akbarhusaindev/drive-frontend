import { HardDrive, Search, Trash2, Users, Upload, FolderPlus, Sparkles } from 'lucide-react';

const ICONS = {
  drive: HardDrive,
  search: Search,
  trash: Trash2,
  shared: Users,
};

const DESCRIPTIONS = {
  drive: 'Upload files or create folders to get started with your secure cloud drive storage.',
  search: 'No files or folders matched your query. Try searching with different keywords.',
  trash: 'Your trash is completely clear. Deleted items will be preserved here.',
  shared: 'When other users share files or documents with you, they will appear here.',
};

export default function EmptyState({
  type = 'drive',
  searchQuery,
  onUploadClick,
  onCreateFolderClick,
}) {
  const Icon = ICONS[type] || HardDrive;
  const title =
    type === 'search'
      ? `No results for "${searchQuery}"`
      : type === 'trash'
      ? 'Trash is empty'
      : type === 'shared'
      ? 'Nothing shared with you'
      : 'This folder is empty';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeInUp">
      {/* Icon with glowing aura */}
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface-2/80 shadow-lg backdrop-blur-xl">
        <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl pointer-events-none" />
        <Icon className="h-9 w-9 text-primary transition-transform duration-300 hover:scale-110" />
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-text-primary mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        {DESCRIPTIONS[type]}
      </p>

      {/* Quick Action buttons for drive empty state */}
      {type === 'drive' && (onUploadClick || onCreateFolderClick) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
          )}
          {onCreateFolderClick && (
            <button
              onClick={onCreateFolderClick}
              className="btn-secondary flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <FolderPlus className="h-4 w-4 text-primary" />
              <span>New Folder</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
