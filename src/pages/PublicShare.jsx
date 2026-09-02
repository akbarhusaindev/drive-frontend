import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Cloud, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { formatSize, getFileIconInfo } from '../utils/formatters';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Public endpoint - no authentication token required
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
          setError('Unable to load shared file. The link may be invalid.');
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
      className="relative flex min-h-screen flex-col items-center justify-center p-6 selection:bg-primary/20 selection:text-primary transition-colors duration-300"
      style={{ background: 'var(--auth-bg)' }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#16172e' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '14px',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.2)',
            fontSize: '13px',
            fontWeight: 500,
          },
        }}
      />

      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle variant="dropdown" showLabel={false} />
      </div>

      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[120px] dark:bg-indigo-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[120px] dark:bg-purple-600/20" />
      </div>

      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30">
          <Cloud className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold gradient-text tracking-tight">Cloud Drive</span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface/85 p-8 text-center shadow-2xl backdrop-blur-2xl animate-fadeInUp">
        {/* Loading state */}
        {loading && (
          <div className="py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <p className="text-xs font-semibold text-text-muted">Fetching file details...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="mb-1.5 text-base font-bold text-text-primary">Link Unavailable</h2>
            <p className="text-xs text-text-muted mb-6">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface-3 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
            </Link>
          </div>
        )}

        {/* File information & Download state */}
        {!loading && !error && file && (
          <>
            {(() => {
              const { Icon, color, bg, border } = getFileIconInfo({
                ...file,
                type: 'file',
              });

              return (
                <div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg transition-transform duration-200 hover:scale-105"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <Icon className="h-10 w-10" style={{ color }} />
                </div>
              );
            })()}

            {/* File name & size */}
            <h2 className="mb-1 break-all text-lg font-bold text-text-primary tracking-tight" title={file.originalName}>
              {file.originalName || 'File'}
            </h2>
            <p className="mb-6 text-xs text-text-muted">{formatSize(file.size)}</p>

            {/* Download button */}
            <button
              id="download-btn"
              type="button"
              onClick={handleDownload}
              disabled={downloading || !file.downloadUrl}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-md shadow-indigo-500/25"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparing download...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Download File
                </>
              )}
            </button>

            {/* Footer notice */}
            <p className="mt-5 text-[11px] text-text-muted">
              Shared securely via Cloud Drive · Direct access download
            </p>
          </>
        )}
      </div>
    </div>
  );
}