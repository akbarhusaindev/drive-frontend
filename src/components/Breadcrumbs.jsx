import { ChevronRight, HardDrive, Folder } from 'lucide-react';

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="flex items-center gap-1.5 mb-5 flex-wrap" aria-label="Breadcrumb navigation">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer border border-transparent hover:border-border"
      >
        <HardDrive className="h-3.5 w-3.5 text-primary" />
        <span>My Drive</span>
      </button>

      {path.map((folder, idx) => {
        const isLast = idx === path.length - 1;
        return (
          <span key={folder.id} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            <button
              onClick={() => onNavigate(folder)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isLast
                  ? 'text-primary bg-primary/10 border border-primary/20 font-semibold'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-transparent hover:border-border'
              }`}
            >
              <Folder className="h-3 w-3 text-primary" />
              <span>{folder.name}</span>
            </button>
          </span>
        );
      })}
    </nav>
  );
}