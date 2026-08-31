import { HardDrive, Search, Trash2, Users } from 'lucide-react';

const ICONS = {
  drive: HardDrive,
  search: Search,
  trash: Trash2,
  shared: Users,
};

const DESCRIPTIONS = {
  drive: 'Upload files to get started',
  search: 'Try a different search term',
  trash: 'Deleted files will appear here',
  shared: 'Files shared with you will appear here',
};

export default function EmptyState({ type = 'drive', searchQuery }) {
  const Icon = ICONS[type] || HardDrive;
  const title = type === 'search'
    ? `No results for "${searchQuery}"`
    : type === 'trash'
    ? 'Trash is empty'
    : type === 'shared'
    ? 'Nothing shared with you'
    : 'This folder is empty';

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl glass">
        <Icon className="h-9 w-9 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 max-w-xs">{DESCRIPTIONS[type]}</p>
    </div>
  );
}
