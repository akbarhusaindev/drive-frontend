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
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/95 p-7 shadow-2xl backdrop-blur-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 shadow-xs">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">Rename Item</h2>
              <p className="text-xs text-text-muted">Enter a new name for this {item.type === 'folder' ? 'folder' : 'file'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleRename}>
          <div className="mb-6">
            <label className="block text-xs font-bold text-text-secondary mb-2">New Name</label>
            <input
              id="rename-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="input-theme w-full rounded-2xl px-4 py-3 text-xs font-medium shadow-xs"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary rounded-2xl py-3 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 btn-primary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
