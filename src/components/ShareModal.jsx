import { useState } from 'react';
import { X, Share2, Loader2, UserPlus, Shield, Eye, Edit3 } from 'lucide-react';
import { shareService } from '../services/shareService';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { value: 'VIEWER', label: 'Viewer', desc: 'Can view and download only', icon: Eye },
  { value: 'EDITOR', label: 'Editor', desc: 'Can view, edit and delete', icon: Edit3 },
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
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/95 p-7 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500 shadow-xs">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">Share Document</h2>
              <p className="text-xs text-text-muted truncate max-w-[240px] font-medium">{item.originalName || item.name}</p>
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

        {/* Share form */}
        <form onSubmit={handleShare} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold text-text-secondary">Collaborator Email</label>
            <input
              id="share-email-input"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-theme w-full rounded-2xl px-4 py-3 text-xs font-medium shadow-xs"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-text-secondary">Access Permission</label>
            <div className="grid grid-cols-2 gap-2.5">
              {PERMISSIONS.map((p) => {
                const isSelected = permission === p.value;
                const Icon = p.icon;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPermission(p.value)}
                    className={`rounded-2xl p-3 text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary/15 border-primary/40 text-primary shadow-xs'
                        : 'border-border bg-surface-2/60 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-bold">{p.label}</span>
                    </div>
                    <p className="text-[10px] text-text-muted">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary rounded-2xl py-3 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="flex-1 btn-primary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Grant Access
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}