import api from './api';

export const folderService = {
  /** Get all root folders (no parent folder) for the current user */
  getRootFolders: () => api.get('/folders'),

  /** Get child folders inside a specific folder */
  getChildFolders: (folderId) => api.get(`/folders/${folderId}/children`),

  /**
   * Create a new folder.
   * Backend CreateFolderRequest fields: name (String), parentId (String UUID?)
   */
  createFolder: (name, parentFolderId = null) =>
    api.post('/folders', {
      name,
      parentId: parentFolderId ? String(parentFolderId) : null,
    }),

  /** Soft-delete a folder */
  trashFolder: (id) => api.post(`/trash/folders/${id}`),

  /** Rename a folder */
  renameFolder: (id, newName) =>
    api.put(`/folders/${id}/rename`, null, { params: { newName } }),
};
