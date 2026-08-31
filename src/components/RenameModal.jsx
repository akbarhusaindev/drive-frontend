import { useState, useEffect } from 'react';
import { X, Edit2, Loader2 } from 'lucide-react';
import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import toast from 'react-hot-toast';

export default function RenameModal({ isOpen, onClose, item, onRenamed }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) setName(item.originalName || item.name || '');
  }, [item]);

  const handleRename = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !item) return;

    setLoading(true);
    try {
      if (item.type === 'folder') {
        await folderService.renameFolder(item.id, trimmed);
      } else {
        await fileService.renameFile(item.id, trimmed);
      }
      toast.success('Renamed successfully');
      onRenamed && onRenamed();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to rename');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop">
      <div className="glass w-full max-w-sm rounded-2xl p-6 animate-fadeInUp border border-white/10 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20">
              <Edit2 className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Rename</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleRename}>
          <input
            id="rename-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="input-dark w-full rounded-xl px-4 py-3 text-sm mb-4"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
