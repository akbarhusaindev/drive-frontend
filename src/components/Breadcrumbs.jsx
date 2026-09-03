import { ChevronRight, HardDrive, Folder } from 'lucide-react';

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="flex items-center gap-2 mb-6 flex-wrap" aria-label="Breadcrumb navigation">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all cursor-pointer border border-border/80 bg-surface/80 shadow-xs hover:border-primary/40"
      >
        <HardDrive className="h-3.5 w-3.5 text-primary" />
        <span>My Drive</span>
      </button>

      {path.map((folder, idx) => {
        const isLast = idx === path.length - 1;
        return (
          <div key={folder.id} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-70" />
            <button
              onClick={() => onNavigate(folder)}
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
                isLast
                  ? 'text-primary bg-primary/10 border-primary/30 shadow-sm'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border-border/80 bg-surface/80 hover:border-primary/40'
              }`}
            >
              <Folder className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[140px] truncate">{folder.name}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}