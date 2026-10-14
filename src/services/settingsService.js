import api from '@/services/api';
export const settingsService = {
  get: () => api.get('/settings'),
  save: (section, payload) => api.put(`/settings/${section}`, payload),
  databaseStatus: () => api.get('/settings/database-status'),
  backup: () => api.post('/settings/backup', {}, { timeout: 620000 }),
};
