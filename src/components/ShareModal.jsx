import { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { shareService } from '../services/shareService';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { value: 'VIEWER', label: 'Can view' },
  { value: 'EDITOR', label: 'Can edit' },
];

export default function ShareModal({ isOpen, onClose, item }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('VIEWER');
  const [loading, setLoading] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim() || !item) return;

    setLoading(true);
    try {
      await shareService.shareFile(item.id, email.trim(), permission);
      toast.success(`Shared with ${email}`);
      setEmail('');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to share file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeInUp">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Share File</h2>
            <p className="text-xs text-text-muted truncate max-w-xs">{item.originalName || item.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Share form */}
        <form onSubmit={handleShare} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">User Email</label>
            <input
              id="share-email-input"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-theme w-full rounded-lg px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Access Permission</label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPermission(p.value)}
                  className={`rounded-lg py-1.5 px-3 text-xs font-medium transition-colors cursor-pointer ${
                    permission === p.value
                      ? 'bg-surface-2 text-text-primary border border-border-strong font-semibold'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-border'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" /> Share
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}