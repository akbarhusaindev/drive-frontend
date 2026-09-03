import { HardDrive, Search, Trash2, Users, Upload, FolderPlus, Sparkles } from 'lucide-react';

const ICONS = {
  drive: HardDrive,
  search: Search,
  trash: Trash2,
  shared: Users,
};

const DESCRIPTIONS = {
  drive: 'Upload files, documents, or create folders to start organizing your cloud storage.',
  search: 'No files or folders matched your query. Try searching with different keywords.',
  trash: 'Your trash bin is empty. Items you delete will be kept here safely.',
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
      : 'This directory is empty';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeInUp">
      {/* Icon with glowing aura */}
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 shadow-xl backdrop-blur-xl group">
        <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <Icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-bold font-heading text-text-primary mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-text-muted max-w-sm mb-7 leading-relaxed font-medium">
        {DESCRIPTIONS[type]}
      </p>

      {/* Quick Action buttons for drive empty state */}
      {type === 'drive' && (onUploadClick || onCreateFolderClick) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="btn-primary flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
          )}
          {onCreateFolderClick && (
            <button
              onClick={onCreateFolderClick}
              className="btn-secondary flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold cursor-pointer"
            >
              <FolderPlus className="h-4 w-4 text-primary" />
              <span>Create Folder</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
