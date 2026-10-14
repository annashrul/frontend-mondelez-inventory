import api from '@/services/api';

export const logActivityService = {
  list: (params, signal) => api.get('/log-activity', { params, signal }),
};
