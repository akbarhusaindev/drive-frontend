import { useState, useEffect } from 'react';
import { X, Folder, Loader2, ArrowRight } from 'lucide-react';
import { folderService } from '../services/folderService';
import { fileService } from '../services/fileService';
import toast from 'react-hot-toast';

export default function MoveModal({ isOpen, onClose, item, onMoved }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('root'); // 'root' or UUID
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;

    const fetchFolders = async () => {
      setFetching(true);
      try {
        const { data } = await folderService.getRootFolders();
        setFolders(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load folders');
      } finally {
        setFetching(false);
      }
    };

    fetchFolders();
    setSelectedFolderId('root');
  }, [isOpen, item]);

  const handleMove = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const targetId = selectedFolderId === 'root' ? null : selectedFolderId;
      await fileService.moveFile(item.id, targetId);
      toast.success('File moved successfully');
      onMoved && onMoved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to move file');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeInUp">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/95 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Move Item</h2>
              <p className="text-xs text-text-muted truncate max-w-xs">{item.originalName || item.name}</p>
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

        {/* Folder selection list */}
        <div className="max-h-60 overflow-y-auto mb-6 space-y-1.5 pr-1">
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Root option */}
              <button
                type="button"
                onClick={() => setSelectedFolderId('root')}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs transition-all text-left cursor-pointer ${
                  selectedFolderId === 'root'
                    ? 'bg-primary/15 border border-primary/40 text-primary font-semibold'
                    : 'border border-border bg-surface-2/60 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
                  <Folder className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">My Drive (Root Directory)</p>
                  <p className="text-[11px] text-text-muted">Move to the top level folder</p>
                </div>
              </button>

              {/* Folders */}
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs transition-all text-left cursor-pointer ${
                    selectedFolderId === f.id
                      ? 'bg-primary/15 border border-primary/40 text-primary font-semibold'
                      : 'border border-border bg-surface-2/60 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500">
                    <Folder className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{f.name}</p>
                    <p className="text-[11px] text-text-muted">Folder</p>
                  </div>
                </button>
              ))}

              {folders.length === 0 && (
                <p className="text-center text-xs text-text-muted py-6">
                  No subfolders found. You can move files to the root directory.
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary rounded-xl py-2.5 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={loading || fetching}
            className="flex-1 btn-primary rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Move Here'}
          </button>
        </div>
      </div>
    </div>
  );
}
