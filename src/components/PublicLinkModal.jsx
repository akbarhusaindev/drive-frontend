import { useState } from 'react';
import { X, Link2, Loader2, Copy, Check, Globe } from 'lucide-react';
import { shareService } from '../services/shareService';
import toast from 'react-hot-toast';

export default function PublicLinkModal({ isOpen, onClose, item }) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const { data } = await shareService.createPublicLink(item.id, 'VIEWER');
      const url = `${window.location.origin}/share/${data.token}`;
      setLink(url);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setLink(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeInUp">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/95 p-7 shadow-2xl backdrop-blur-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500 shadow-xs">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">Public Share Link</h2>
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

        {!link ? (
          <div className="text-center py-5">
            <p className="text-xs text-text-secondary mb-6 leading-relaxed font-medium">
              Create a secure public link that anyone on the web can use to directly view and download this file without requiring an account.
            </p>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary rounded-2xl px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/25"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              <span>{loading ? 'Generating link...' : 'Generate Public Link'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2">Public Share URL</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={link}
                  className="input-theme flex-1 rounded-2xl px-4 py-3 text-xs truncate font-medium"
                />
                <button
                  onClick={copyLink}
                  className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'btn-primary'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-3 flex items-start gap-2.5">
              <Globe className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-muted leading-relaxed">
                Anyone with this link can view and download this file directly. You can revoke it anytime.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
