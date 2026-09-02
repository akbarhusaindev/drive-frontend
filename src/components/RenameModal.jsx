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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeInUp">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Rename</h2>
              <p className="text-xs text-text-muted">Enter a new name for this item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleRename}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-text-muted mb-1.5">New Name</label>
            <input
              id="rename-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="input-theme w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary rounded-xl py-2.5 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 btn-primary rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
