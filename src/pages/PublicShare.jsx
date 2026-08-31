import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Cloud, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { formatSize, getFileIconInfo } from '../utils/formatters';

// Public endpoint - no auth token needed
const publicApi = axios.create({

  baseURL: 'https://cloudbackend-ygbk.onrender.com/api',

});

export default function PublicShare() {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicApi.get(`/public-links/${token}`);
        setFile(data);
      } catch (err) {
        if (err.response?.status === 410) {
          setError('This link has expired.');
        } else {
          setError('This link is invalid or has been removed.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const handleDownload = async () => {
    if (!file?.downloadUrl) return;
    setDownloading(true);
    try {
      // Open the presigned URL in a new tab for download
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.setAttribute('download', file.originalName || 'download');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at top, #1a1a4e 0%, #0f0f23 60%)' }}
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
        <span className="text-xl font-bold gradient-text">Cloud Drive</span>
      </div>

      {/* Card */}
      <div className="glass relative w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-2xl animate-fadeInUp text-center">
        {loading ? (
          <div className="py-8">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading file info...</p>
          </div>
        ) : error ? (
          <div className="py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-600/15">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Link Unavailable</h2>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Dynamic file icon based on MIME type */}
            {(() => {
              const { Icon, color, bg } = getFileIconInfo({ ...file, type: 'file' });
              return (
                <div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{ background: bg }}
                >
                  <Icon className="h-10 w-10" style={{ color }} />
                </div>
              );
            })()}

            <h2 className="text-xl font-bold text-white mb-1 break-all">
              {file?.originalName || 'File'}
            </h2>
            <p className="text-sm text-slate-500 mb-8">{formatSize(file?.size)}</p>

            <button
              id="download-btn"
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary w-full rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              {downloading ? 'Preparing download...' : 'Download File'}
            </button>

            <p className="mt-4 text-xs text-slate-600">
              Shared via Cloud Drive · Anyone with this link can download
            </p>
          </>
        )}
      </div>
    </div>
  );
}