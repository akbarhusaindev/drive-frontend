import api from './api';

export const shareService = {
  /**
   * Share a file with another user.
   * Backend ShareRequest fields: fileId (UUID), targetEmail (String), permission (SharePermission enum)
   * SharePermission enum values: VIEWER | EDITOR
   */
  shareFile: (fileId, targetEmail, permission) =>
    api.post('/shares', { fileId, targetEmail, permission }),

  /** Get all files shared with the current user */
  getSharedWithMe: () => api.get('/shares/me'),

  /**
   * Create a public shareable link.
   * Backend PublicLinkRequest fields: fileId (UUID), permission (SharePermission), expiryDays (Integer?), password (String?)
   */
  createPublicLink: (fileId, permission = 'VIEWER', expiryDays = null) =>
    api.post('/public-links', { fileId, permission, expiryDays }),
};
