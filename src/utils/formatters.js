import {
  FileText, Image, Film, Music, Archive, FileCode, FileSpreadsheet,
  File, Folder,
} from 'lucide-react';

/** Format bytes to human-readable size */
export function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Format ISO date to readable string */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Get icon component + color for a file based on MIME type */
export function getFileIconInfo(item) {
  if (item.type === 'folder' || !item.mimeType) {
    return { Icon: Folder, color: '#818cf8', bg: 'rgba(129,140,248,0.15)' };
  }

  const m = item.mimeType;

  if (m.startsWith('image/'))
    return { Icon: Image, color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
  if (m.startsWith('video/'))
    return { Icon: Film, color: '#f472b6', bg: 'rgba(244,114,182,0.12)' };
  if (m.startsWith('audio/'))
    return { Icon: Music, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' };
  if (m === 'application/pdf')
    return { Icon: FileText, color: '#fb923c', bg: 'rgba(251,146,60,0.12)' };
  if (m.includes('spreadsheet') || m.includes('excel') || m === 'text/csv')
    return { Icon: FileSpreadsheet, color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
  if (m.includes('zip') || m.includes('tar') || m.includes('gz') || m.includes('rar'))
    return { Icon: Archive, color: '#facc15', bg: 'rgba(250,204,21,0.12)' };
  if (m.includes('javascript') || m.includes('typescript') || m.includes('html') || m.includes('css') || m.includes('json'))
    return { Icon: FileCode, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' };

  return { Icon: File, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
}

/** Get display name for MIME type */
export function getMimeLabel(mimeType) {
  if (!mimeType) return 'Folder';
  const map = {
    'application/pdf': 'PDF',
    'image/png': 'PNG Image',
    'image/jpeg': 'JPEG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'video/mp4': 'MP4 Video',
    'audio/mpeg': 'MP3 Audio',
    'text/plain': 'Text File',
    'text/csv': 'CSV',
    'application/zip': 'ZIP Archive',
    'application/json': 'JSON',
  };
  return map[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'File';
}
