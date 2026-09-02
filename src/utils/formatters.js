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

/** Get icon component + vibrant color for a file based on MIME type */
export function getFileIconInfo(item) {
  if (item.type === 'folder' || !item.mimeType) {
    return {
      Icon: Folder,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.25)',
      category: 'folder',
    };
  }

  const m = item.mimeType.toLowerCase();

  if (m.startsWith('image/')) {
    return {
      Icon: Image,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      category: 'image',
    };
  }
  if (m.startsWith('video/')) {
    return {
      Icon: Film,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.12)',
      border: 'rgba(236, 72, 153, 0.25)',
      category: 'media',
    };
  }
  if (m.startsWith('audio/')) {
    return {
      Icon: Music,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.25)',
      category: 'media',
    };
  }
  if (m === 'application/pdf') {
    return {
      Icon: FileText,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.25)',
      category: 'document',
    };
  }
  if (m.includes('spreadsheet') || m.includes('excel') || m === 'text/csv') {
    return {
      Icon: FileSpreadsheet,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.25)',
      category: 'document',
    };
  }
  if (m.includes('zip') || m.includes('tar') || m.includes('gz') || m.includes('rar') || m.includes('7z')) {
    return {
      Icon: Archive,
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.12)',
      border: 'rgba(234, 179, 8, 0.25)',
      category: 'archive',
    };
  }
  if (
    m.includes('javascript') ||
    m.includes('typescript') ||
    m.includes('html') ||
    m.includes('css') ||
    m.includes('json') ||
    m.includes('xml') ||
    m.includes('python') ||
    m.includes('java') ||
    m.includes('code')
  ) {
    return {
      Icon: FileCode,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.25)',
      category: 'code',
    };
  }

  return {
    Icon: File,
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.12)',
    border: 'rgba(100, 116, 139, 0.22)',
    category: 'other',
  };
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
    'image/svg+xml': 'SVG Vector',
    'video/mp4': 'MP4 Video',
    'video/webm': 'WebM Video',
    'video/quicktime': 'QuickTime Video',
    'audio/mpeg': 'MP3 Audio',
    'audio/wav': 'WAV Audio',
    'text/plain': 'Text File',
    'text/csv': 'CSV Spreadsheet',
    'application/zip': 'ZIP Archive',
    'application/json': 'JSON Document',
  };
  return map[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'File';
}
