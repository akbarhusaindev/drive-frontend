import { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { folderService } from '../services/folderService';
import toast from 'react-hot-toast';

export default function CreateFolderModal({ isOpen, onClose, onCreated, parentFolderId }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await folderService.createFolder(trimmed, parentFolderId);
      toast.success(`Folder "${trimmed}" created`);
      setName('');
      onCreated && onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeInUp">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">New Folder</h2>
              <p className="text-xs text-text-muted">Create a directory to organize files</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Folder Name</label>
            <input
              id="folder-name-input"
              type="text"
              placeholder="e.g. Project Documents"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="input-theme w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary rounded-xl py-2.5 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 btn-primary rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}