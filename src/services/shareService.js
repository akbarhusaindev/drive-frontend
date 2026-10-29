import api from './api';

export const shareService = {
  /**
   * Share a file with another user.
   * The backend will auto-create (or reuse) a sender-named folder
   * in the recipient's root and place the file inside it.
   *
   * Backend ShareRequest fields:
   *   fileId (UUID), targetEmail (String), permission (SharePermission enum)
   * SharePermission enum values: VIEWER | EDITOR
   */
  shareFile: (fileId, targetEmail, permission) =>
    api.post('/shares', { fileId, targetEmail, permission }),

  /** Flat list — all Share records where the current user is the recipient. */
  getSharedWithMe: () => api.get('/shares/me'),

  /**
   * Grouped view — sender-named folders with their files inside.
   * Response shape:
   * [
   *   {
   *     folderId: string,
   *     folderName: "alice@gmail.com",
   *     createdAt: string,
   *     files: [ FileMetadata, ... ]
   *   }
   * ]
   */
  getSharedFolders: () => api.get('/shares/me/folders'),

  /**
   * Create a public shareable link.
   * Backend PublicLinkRequest fields:
   *   fileId (UUID), permission (SharePermission), expiryDays (Integer?), password (String?)
   */
  createPublicLink: (fileId, permission = 'VIEWER', expiryDays = null) =>
    api.post('/public-links', { fileId, permission, expiryDays }),
};
