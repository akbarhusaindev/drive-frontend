import api from './api';

export const searchService = {
  search: (query, page = 0, size = 10) =>
    api.get('/search', { params: { query, page, size } }),
};
