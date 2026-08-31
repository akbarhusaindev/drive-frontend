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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop">
      <div className="glass w-full max-w-md rounded-2xl p-6 animate-fadeInUp border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
              <Share2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Share</h2>
              <p className="text-xs text-slate-500 truncate max-w-40">{item.originalName || item.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share form */}
        <form onSubmit={handleShare} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
            <input
              id="share-email-input"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Permission</label>
            <div className="flex gap-2">
              {PERMISSIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPermission(p.value)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                    permission === p.value
                      ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                      : 'glass border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
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
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Share</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}