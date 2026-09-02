import { useState } from 'react';
import { X, Share2, Loader2, UserPlus } from 'lucide-react';
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
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/95 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Share File</h2>
              <p className="text-xs text-text-muted truncate max-w-xs">{item.originalName || item.name}</p>
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

        {/* Share form */}
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">User Email</label>
            <input
              id="share-email-input"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-theme w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">Access Level</label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPermission(p.value)}
                  className={`rounded-xl py-2.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
                    permission === p.value
                      ? 'bg-primary/15 border border-primary/40 text-primary'
                      : 'border border-border bg-surface-2/60 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary rounded-xl py-2.5 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="flex-1 btn-primary rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Share Access
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}