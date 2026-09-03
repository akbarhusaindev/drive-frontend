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
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/95 p-7 shadow-2xl backdrop-blur-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500 shadow-xs">
              <FolderPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">Create Folder</h2>
              <p className="text-xs text-text-muted">Create a new directory to organize files</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="mb-6">
            <label className="block text-xs font-bold text-text-secondary mb-2">Folder Name</label>
            <input
              id="folder-name-input"
              type="text"
              placeholder="e.g. Design Assets, Invoices, Project 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="input-theme w-full rounded-2xl px-4 py-3 text-xs font-medium shadow-xs"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary rounded-2xl py-3 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 btn-primary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}