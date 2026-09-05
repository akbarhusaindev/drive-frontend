import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { formatSize, getFileIconInfo } from '../utils/formatters';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Public endpoint - no auth required
const publicApi = axios.create({
  baseURL: 'https://cloudbackend-ygbk.onrender.com/api',
  timeout: 120000,
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
          setError('This link has expired.');
        } else if (err.response?.status === 404) {
          setError('This file link is invalid or has been deleted.');
        } else {
          setError('Unable to load file. The link may be invalid or expired.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPublicFile();
    } else {
      setError('Invalid link token.');
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
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[var(--bg-app)]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#18181c' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f4f4f5' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid #27272a' : '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 500,
          },
        }}
      />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="button" />
      </div>

      <div className="w-full max-w-sm animate-fadeInUp">
        {/* Header */}
        <div className="mb-6 text-center">
          <Logo size="md" to="/dashboard" className="mb-4" />
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Shared File
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Download files shared via Cloud Drive
          </p>
        </div>

        {/* Card */}
        <div className="modern-card rounded-2xl p-6 shadow-sm text-center">
          {/* Loading */}
          {loading && (
            <div className="py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-text-muted">Fetching file details...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-6">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-text-primary mb-1">Link Unavailable</h2>
              <p className="text-xs text-text-muted mb-4">{error}</p>
              <Link
                to="/login"
                className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Go to Login
              </Link>
            </div>
          )}

          {/* File details & download */}
          {!loading && !error && file && (
            <>
              {(() => {
                const { Icon, color } = getFileIconInfo({
                  ...file,
                  type: 'file',
                });

                return (
                  <div className="mb-4">
                    <div
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 mb-2"
                    >
                      <Icon className="h-7 w-7" style={{ color }} />
                    </div>
                  </div>
                );
              })()}

              <h2 className="text-sm font-semibold text-text-primary mb-1 truncate" title={file.originalName}>
                {file.originalName || 'Shared File'}
              </h2>
              <p className="text-xs text-text-muted mb-5">{formatSize(file.size)}</p>

              <button
                id="download-btn"
                type="button"
                onClick={handleDownload}
                disabled={downloading || !file.downloadUrl}
                className="btn-primary flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing Download...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> Download File
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}