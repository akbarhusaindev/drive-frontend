import { ChevronRight, HardDrive } from 'lucide-react';

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="flex items-center gap-1 mb-6 flex-wrap">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
      >
        <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
        My Drive
      </button>

      {path.map((folder, idx) => (
        <span key={folder.id} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <button
            onClick={() => onNavigate(folder)}
            className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
              idx === path.length - 1
                ? 'text-white bg-white/5'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {folder.name}
          </button>
        </span>
      ))}
    </nav>
  );
}