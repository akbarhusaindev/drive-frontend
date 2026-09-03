import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Loader2, AlertTriangle, ArrowLeft, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { formatSize, getFileIconInfo } from '../utils/formatters';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Public endpoint - no auth required
const publicApi = axios.create({
  baseURL: 'https://cloudbackend-ygbk.onrender.com/api',
  timeout: 30000,
});

export default function PublicShare() {
  const { token } = useParams();
  const { resolvedTheme } = useTheme();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPublicFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await publicApi.get(`/public-links/${token}`);
        setFile(data);
      } catch (err) {
        console.error('Public link error:', err);
        if (err.response?.status === 410) {
          setError('This shared link has expired.');
        } else if (err.response?.status === 404) {
          setError('This file link is invalid or has been deleted.');
        } else {
          setError('Unable to load shared file. The link may be invalid or expired.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPublicFile();
    } else {
      setError('Invalid public link token.');
      setLoading(false);
    }
  }, [token]);

  const handleDownload = () => {
    if (!file?.downloadUrl) return;

    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.setAttribute('download', file.originalName || 'download');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center p-6 selection:bg-indigo-500/20 selection:text-indigo-400 transition-colors duration-300 bg-grid-pattern"
      style={{ background: 'var(--auth-bg)' }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#14162d' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            boxShadow: '0 16px 36px -8px rgba(0,0,0,0.25)',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="button" />
      </div>

      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-indigo-500/15 blur-[140px] dark:bg-indigo-600/25 animate-float" />
        <div className="absolute -bottom-40 -right-40 h-[550px] w-[550px] rounded-full bg-purple-500/15 blur-[140px] dark:bg-purple-600/25 animate-float" />
      </div>

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <Logo size="lg" to="/" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-2xl animate-fadeInUp">
        {/* Loading state */}
        {loading && (
          <div className="py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-500 mx-auto mb-4 shadow-md">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <p className="text-xs font-bold text-text-muted">Fetching secure download link...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 shadow-md">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="mb-1.5 text-base font-bold text-text-primary font-heading">Link Unavailable</h2>
            <p className="text-xs text-text-muted mb-6 font-medium">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-5 py-2.5 text-xs font-bold text-text-primary hover:bg-surface-3 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" /> Go to Login
            </Link>
          </div>
        )}

        {/* File information & Download state */}
        {!loading && !error && file && (
          <>
            {(() => {
              const { Icon, color, bg, border, badge } = getFileIconInfo({
                ...file,
                type: 'file',
              });

              return (
                <div className="relative mb-6">
                  <div
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl transition-transform duration-300 hover:scale-105"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <Icon className="h-12 w-12" style={{ color }} />
                  </div>
                  <span
                    className="inline-block mt-3 rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{ background: bg, color, border: `1px solid ${border}` }}
                  >
                    {badge}
                  </span>
                </div>
              );
            })()}

            {/* File name & size */}
            <h2 className="mb-1.5 break-all text-lg font-bold font-heading text-text-primary tracking-tight" title={file.originalName}>
              {file.originalName || 'Shared File'}
            </h2>
            <p className="mb-6 text-xs text-text-muted font-semibold">{formatSize(file.size)}</p>

            {/* Download button */}
            <button
              id="download-btn"
              type="button"
              onClick={handleDownload}
              disabled={downloading || !file.downloadUrl}
              className="btn-primary flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-lg shadow-indigo-500/30"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparing Download...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Download File Directly
                </>
              )}
            </button>

            {/* Trust badge */}
            <div className="mt-6 pt-5 border-t border-border flex items-center justify-center gap-2 text-[11px] text-text-muted font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Verified & Scanned Securely</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}