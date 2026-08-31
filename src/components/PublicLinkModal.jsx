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
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setLink(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop">
      <div className="glass w-full max-w-md rounded-2xl p-6 animate-fadeInUp border border-white/10 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20">
              <Link2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Public Link</h2>
              <p className="text-xs text-slate-500 truncate max-w-40">{item.originalName || item.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!link ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400 mb-5">Generate a shareable link that anyone can access without signing in.</p>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Generate Link'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-500 mb-2">Share this link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={link}
                className="input-dark flex-1 rounded-xl px-3 py-2.5 text-sm truncate"
              />
              <button
                onClick={copyLink}
                className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-all ${
                  copied ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'btn-primary'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
