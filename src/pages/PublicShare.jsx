import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Cloud,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import {
  formatSize,
  getFileIconInfo,
} from '../utils/formatters';

// Public endpoint - no authentication token required
const publicApi = axios.create({
  baseURL: 'https://cloudbackend-ygbk.onrender.com/api',
  timeout: 30000,
});

export default function PublicShare() {
  const { token } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPublicFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await publicApi.get(
          `/public-links/${token}`
        );

        setFile(data);
      } catch (err) {
        console.error('Public link error:', err);

        if (err.response?.status === 410) {
          setError('This link has expired.');
        } else if (err.response?.status === 404) {
          setError('This link is invalid or has been removed.');
        } else {
          setError('This link is invalid or has been removed.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPublicFile();
    } else {
      setError('Invalid public link.');
      setLoading(false);
    }
  }, [token]);

  const handleDownload = () => {
    if (!file?.downloadUrl) {
      return;
    }

    setDownloading(true);

    try {
      const link = document.createElement('a');

      link.href = file.downloadUrl;
      link.setAttribute(
        'download',
        file.originalName || 'download'
      );
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
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(ellipse at top, #1a1a4e 0%, #0f0f23 60%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <Cloud className="h-5 w-5 text-white" />
        </div>

        <span className="text-xl font-bold gradient-text">
          Cloud Drive
        </span>
      </div>

      {/* Card */}
      <div className="glass relative w-full max-w-md rounded-2xl border border-white/10 p-8 text-center shadow-2xl animate-fadeInUp">

        {/* Loading */}
        {loading && (
          <div className="py-8">
            <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-indigo-400" />

            <p className="text-sm text-slate-400">
              Loading file info...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-600/15">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>

            <h2 className="mb-2 text-lg font-semibold text-white">
              Link Unavailable
            </h2>

            <p className="text-sm text-slate-500">
              {error}
            </p>
          </div>
        )}

        {/* File information */}
        {!loading && !error && file && (
          <>
            {/* File icon */}
            {(() => {
              const { Icon, color, bg } = getFileIconInfo({
                ...file,
                type: 'file',
              });

              return (
                <div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{
                    background: bg,
                  }}
                >
                  <Icon
                    className="h-10 w-10"
                    style={{
                      color,
                    }}
                  />
                </div>
              );
            })()}

            {/* File name */}
            <h2 className="mb-1 break-all text-xl font-bold text-white">
              {file.originalName || 'File'}
            </h2>

            {/* File size */}
            <p className="mb-8 text-sm text-slate-500">
              {formatSize(file.size)}
            </p>

            {/* Download button */}
            <button
              id="download-btn"
              type="button"
              onClick={handleDownload}
              disabled={downloading || !file.downloadUrl}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Preparing download...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download File
                </>
              )}
            </button>

            {/* Footer */}
            <p className="mt-4 text-xs text-slate-600">
              Shared via Cloud Drive · Anyone with this link can download
            </p>
          </>
        )}
      </div>
    </div>
  );
}