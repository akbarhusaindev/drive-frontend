import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
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
      toast.success('Renamed');
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
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Rename</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleRename}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-muted mb-1.5">New Name</label>
            <input
              id="rename-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="input-theme w-full rounded-lg px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
