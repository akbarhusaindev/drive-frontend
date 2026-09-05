import { HardDrive, Search, Trash2, Users, Upload, FolderPlus } from 'lucide-react';

const ICONS = {
  drive: HardDrive,
  search: Search,
  trash: Trash2,
  shared: Users,
};

const DESCRIPTIONS = {
  drive: 'Upload files or create folders to organize your cloud storage.',
  search: 'No files or folders matched your query. Try searching with different terms.',
  trash: 'Trash is empty. Deleted files and folders will appear here.',
  shared: 'Files shared with you will appear here.',
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
      ? 'Nothing shared with you yet'
      : 'This folder is empty';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeInUp">
      {/* Clean Icon Badge */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border text-text-muted">
        <Icon className="h-6 w-6" />
      </div>

      {/* Title & Description */}
      <h3 className="text-base font-semibold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-xs text-text-muted max-w-sm mb-5 leading-relaxed">
        {DESCRIPTIONS[type]}
      </p>

      {/* Quick Action buttons */}
      {type === 'drive' && (onUploadClick || onCreateFolderClick) && (
        <div className="flex items-center gap-2">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="btn-primary flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Files</span>
            </button>
          )}
          {onCreateFolderClick && (
            <button
              onClick={onCreateFolderClick}
              className="btn-secondary flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <FolderPlus className="h-3.5 w-3.5 text-text-muted" />
              <span>New Folder</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
