import {
  FileText, Image, Film, Music, Archive, FileCode, FileSpreadsheet,
  File, Folder, Presentation, Database
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
  if (item.type === 'folder' || (!item.mimeType && !item.originalName?.includes('.'))) {
    return {
      Icon: Folder,
      color: '#818cf8',
      bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
      border: 'rgba(99, 102, 241, 0.35)',
      badge: 'Folder',
      category: 'folder',
      previewGradient: 'from-indigo-600/20 via-purple-600/15 to-transparent',
    };
  }

  const m = (item.mimeType || '').toLowerCase();
  const ext = (item.originalName || item.name || '').split('.').pop()?.toLowerCase();

  // Images
  if (m.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return {
      Icon: Image,
      color: '#34d399',
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
      border: 'rgba(16, 185, 129, 0.35)',
      badge: 'Image',
      category: 'image',
      previewGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    };
  }

  // Videos
  if (m.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'].includes(ext)) {
    return {
      Icon: Film,
      color: '#f472b6',
      bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.1) 100%)',
      border: 'rgba(236, 72, 153, 0.35)',
      badge: 'Video',
      category: 'media',
      previewGradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    };
  }

  // Audio
  if (m.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return {
      Icon: Music,
      color: '#a78bfa',
      bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
      border: 'rgba(139, 92, 246, 0.35)',
      badge: 'Audio',
      category: 'media',
      previewGradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    };
  }

  // PDF
  if (m === 'application/pdf' || ext === 'pdf') {
    return {
      Icon: FileText,
      color: '#fb923c',
      bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.1) 100%)',
      border: 'rgba(249, 115, 22, 0.35)',
      badge: 'PDF',
      category: 'document',
      previewGradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    };
  }

  // Spreadsheet
  if (
    m.includes('spreadsheet') ||
    m.includes('excel') ||
    ['csv', 'xlsx', 'xls', 'numbers', 'tsv'].includes(ext)
  ) {
    return {
      Icon: FileSpreadsheet,
      color: '#4ade80',
      bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
      border: 'rgba(34, 197, 94, 0.35)',
      badge: 'Spreadsheet',
      category: 'document',
      previewGradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    };
  }

  // Presentation / Slides
  if (
    m.includes('presentation') ||
    m.includes('powerpoint') ||
    ['ppt', 'pptx', 'key'].includes(ext)
  ) {
    return {
      Icon: Presentation,
      color: '#f87171',
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
      border: 'rgba(239, 68, 68, 0.35)',
      badge: 'Slides',
      category: 'document',
      previewGradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    };
  }

  // Archives
  if (
    m.includes('zip') ||
    m.includes('tar') ||
    m.includes('compressed') ||
    ['zip', 'tar', 'gz', 'rar', '7z', 'bz2'].includes(ext)
  ) {
    return {
      Icon: Archive,
      color: '#facc15',
      bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.1) 100%)',
      border: 'rgba(234, 179, 8, 0.35)',
      badge: 'Archive',
      category: 'archive',
      previewGradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    };
  }

  // Code / Web files
  if (
    m.includes('javascript') ||
    m.includes('typescript') ||
    m.includes('html') ||
    m.includes('css') ||
    m.includes('json') ||
    m.includes('xml') ||
    m.includes('python') ||
    m.includes('java') ||
    m.includes('code') ||
    ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'rs', 'go', 'php', 'sql', 'sh', 'md'].includes(ext)
  ) {
    return {
      Icon: FileCode,
      color: '#22d3ee',
      bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.1) 100%)',
      border: 'rgba(6, 182, 212, 0.35)',
      badge: (ext || 'Code').toUpperCase(),
      category: 'code',
      previewGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    };
  }

  // Generic document / file
  return {
    Icon: File,
    color: '#94a3b8',
    bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.18) 0%, rgba(100, 116, 139, 0.1) 100%)',
    border: 'rgba(148, 163, 184, 0.28)',
    badge: (ext || 'File').toUpperCase(),
    category: 'other',
    previewGradient: 'from-slate-500/15 via-slate-600/5 to-transparent',
  };
}

/** Get display name for MIME type */
export function getMimeLabel(mimeType) {
  if (!mimeType) return 'Folder';
  const map = {
    'application/pdf': 'PDF Document',
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
    'text/plain': 'Text Document',
    'text/csv': 'CSV Spreadsheet',
    'application/zip': 'ZIP Archive',
    'application/json': 'JSON Document',
  };
  return map[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'File';
}
