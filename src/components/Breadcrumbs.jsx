import { ChevronRight, HardDrive, Folder } from 'lucide-react';

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="flex items-center gap-1 mb-4 flex-wrap text-xs text-text-secondary" aria-label="Breadcrumbs">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
      >
        <HardDrive className="h-3.5 w-3.5 text-text-muted" />
        <span>My Drive</span>
      </button>

      {path.map((folder, idx) => {
        const isLast = idx === path.length - 1;
        return (
          <span key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-60" />
            <button
              onClick={() => onNavigate(folder)}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors cursor-pointer ${
                isLast
                  ? 'text-text-primary font-semibold bg-surface-2'
                  : 'hover:bg-surface-2 hover:text-text-primary'
              }`}
            >
              <Folder className="h-3.5 w-3.5 text-text-muted" />
              <span>{folder.name}</span>
            </button>
          </span>
        );
      })}
    </nav>
  );
}