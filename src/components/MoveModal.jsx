import { useState, useEffect } from 'react';
import { X, Folder, Loader2, HardDrive } from 'lucide-react';
import { folderService } from '../services/folderService';
import { fileService } from '../services/fileService';
import toast from 'react-hot-toast';

export default function MoveModal({ isOpen, onClose, item, onMoved }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('root');
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
      toast.success('File moved');
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
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Move File</h2>
            <p className="text-xs text-text-muted truncate max-w-xs">{item.originalName || item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Folder list */}
        <div className="max-h-56 overflow-y-auto mb-4 space-y-1 pr-1">
          {fetching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Root */}
              <button
                type="button"
                onClick={() => setSelectedFolderId('root')}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                  selectedFolderId === 'root'
                    ? 'bg-surface-2 text-text-primary border border-border-strong font-semibold'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-transparent'
                }`}
              >
                <HardDrive className="h-4 w-4 text-text-muted" />
                <span>My Drive (Root)</span>
              </button>

              {/* Folders */}
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                    selectedFolderId === f.id
                      ? 'bg-surface-2 text-text-primary border border-border-strong font-semibold'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-transparent'
                  }`}
                >
                  <Folder className="h-4 w-4 text-text-muted" />
                  <span>{f.name}</span>
                </button>
              ))}

              {folders.length === 0 && (
                <p className="text-center text-xs text-text-muted py-4">
                  No other folders found.
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={loading || fetching}
            className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Move Here'}
          </button>
        </div>
      </div>
    </div>
  );
}
