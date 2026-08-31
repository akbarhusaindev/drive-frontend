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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop">
      <div className="glass w-full max-w-md rounded-2xl p-6 animate-fadeInUp border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
              <ArrowRight className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Move file</h2>
              <p className="text-xs text-slate-500 truncate max-w-xs">{item.originalName || item.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Folder selection list */}
        <div className="max-h-60 overflow-y-auto mb-6 space-y-1 pr-1">
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6.5 w-6.5 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Root option */}
              <button
                onClick={() => setSelectedFolderId('root')}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all text-left ${
                  selectedFolderId === 'root'
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                    : 'glass border border-white/5 text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Folder className="h-4.5 w-4.5 text-indigo-400 fill-indigo-400/20" />
                <div>
                  <p className="font-semibold">My Drive (Root)</p>
                  <p className="text-xs text-slate-500">Move to the main directory</p>
                </div>
              </button>

              {/* Folders */}
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all text-left ${
                    selectedFolderId === f.id
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                      : 'glass border border-white/5 text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Folder className="h-4.5 w-4.5 text-purple-400 fill-purple-400/20" />
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-xs text-slate-500">Folder</p>
                  </div>
                </button>
              ))}

              {folders.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6">No folders available. You can move files to the root directory.</p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={loading || fetching}
            className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Move here'}
          </button>
        </div>
      </div>
    </div>
  );
}
