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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop">
      <div className="glass w-full max-w-sm rounded-2xl p-6 animate-fadeInUp border border-white/10 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20">
              <FolderPlus className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">New Folder</h2>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <input
            id="folder-name-input"
            type="text"
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="input-dark w-full rounded-xl px-4 py-3 text-sm mb-4"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}