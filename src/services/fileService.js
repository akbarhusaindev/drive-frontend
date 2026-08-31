import api from './api';

export const fileService = {
  /** Step 1: Get presigned PUT URL + storageKey from backend */
  initUpload: (fileName, mimeType) =>
    api.post('/files/init-upload', null, { params: { fileName, mimeType } }),

  /** Step 2: Upload file directly to Supabase S3 via presigned PUT URL */
  uploadToStorage: async (uploadUrl, file) => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status}`);
    }
    return response;
  },

  /** Step 3: Notify backend that upload is complete — saves metadata to DB */
  completeUpload: (fileName, storageKey, size, mimeType, folderId = null) =>
    api.post('/files/complete-upload', null, {
      params: {
        fileName,
        storageKey,
        size,
        mimeType,
        ...(folderId ? { folderId } : {}),
      },
    }),

  /** Get all root-level files (no folder) */
  getRootFiles: () => api.get('/files'),

  /** Get files inside a specific folder */
  getFilesInFolder: (folderId) => api.get(`/files/folder/${folderId}`),

  /** Get a presigned download URL for a file */
  getDownloadUrl: (fileId, disposition = 'inline') =>
    api.get(`/files/${fileId}/download-url`, { params: { disposition } }),

  renameFile: (id, newName) =>
    api.put(`/files/${id}/rename`, null, { params: { newName } }),

  moveFile: (id, folderId = null) =>
    api.put(`/files/${id}/move`, null, { params: folderId ? { folderId } : {} }),

  trashFile: (id) => api.post(`/trash/files/${id}`),

  getStorageUsage: () => api.get('/files/storage'),
};
