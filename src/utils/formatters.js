import {
  FileText, Image, Film, Music, Archive, FileCode, FileSpreadsheet,
  File, Folder, Presentation
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

/** Get icon component + clean color for a file */
export function getFileIconInfo(item) {
  if (item.type === 'folder' || (!item.mimeType && !item.originalName?.includes('.'))) {
    return {
      Icon: Folder,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.08)',
      badge: 'Folder',
      category: 'folder',
    };
  }

  const m = (item.mimeType || '').toLowerCase();
  const ext = (item.originalName || item.name || '').split('.').pop()?.toLowerCase();

  // Images
  if (m.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return {
      Icon: Image,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
      badge: (ext || 'Image').toUpperCase(),
      category: 'image',
    };
  }

  // Videos
  if (m.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return {
      Icon: Film,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.08)',
      badge: (ext || 'Video').toUpperCase(),
      category: 'media',
    };
  }

  // Audio
  if (m.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return {
      Icon: Music,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.08)',
      badge: (ext || 'Audio').toUpperCase(),
      category: 'media',
    };
  }

  // PDF
  if (m === 'application/pdf' || ext === 'pdf') {
    return {
      Icon: FileText,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      badge: 'PDF',
      category: 'document',
    };
  }

  // Spreadsheet
  if (
    m.includes('spreadsheet') ||
    m.includes('excel') ||
    ['csv', 'xlsx', 'xls', 'tsv'].includes(ext)
  ) {
    return {
      Icon: FileSpreadsheet,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)',
      badge: (ext || 'Sheet').toUpperCase(),
      category: 'document',
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
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.08)',
      badge: (ext || 'Slide').toUpperCase(),
      category: 'document',
    };
  }

  // Archives
  if (
    m.includes('zip') ||
    m.includes('tar') ||
    m.includes('compressed') ||
    ['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)
  ) {
    return {
      Icon: Archive,
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.08)',
      badge: (ext || 'ZIP').toUpperCase(),
      category: 'archive',
    };
  }

  // Code / Web files
  if (
    m.includes('javascript') ||
    m.includes('typescript') ||
    m.includes('html') ||
    m.includes('css') ||
    m.includes('json') ||
    ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'sql', 'sh', 'md'].includes(ext)
  ) {
    return {
      Icon: FileCode,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)',
      badge: (ext || 'Code').toUpperCase(),
      category: 'code',
    };
  }

  // Generic document / file
  return {
    Icon: File,
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.08)',
    badge: (ext || 'File').toUpperCase(),
    category: 'other',
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
    'audio/mpeg': 'MP3 Audio',
    'audio/wav': 'WAV Audio',
    'text/plain': 'Text Document',
    'text/csv': 'CSV Spreadsheet',
    'application/zip': 'ZIP Archive',
    'application/json': 'JSON Document',
  };
  return map[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'File';
}
