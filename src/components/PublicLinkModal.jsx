import { useState } from 'react';
import { X, Link2, Loader2, Copy, Check } from 'lucide-react';
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
    toast.success('Link copied to clipboard');
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
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Public Link</h2>
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

        {!link ? (
          <div className="text-center py-4">
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Generate a public download link that anyone can access without an account.
            </p>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 mx-auto disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              <span>{loading ? 'Creating...' : 'Generate Public Link'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-text-muted mb-1.5">Share Link</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={link}
                  className="input-theme flex-1 rounded-lg px-3 py-1.5 text-xs truncate"
                />
                <button
                  onClick={copyLink}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    copied
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'btn-primary'
                  }`}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-text-muted">
              Anyone with this link can view and download this file.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
