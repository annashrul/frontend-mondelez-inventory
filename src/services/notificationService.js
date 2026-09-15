import api from '@/services/api';

export function notificationSocketUrl() {
  const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
  return new URL(baseUrl.replace(/\/api\/v1\/?$/, ''), window.location.origin).toString();
}

export const notificationService = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  getSettings: () => api.get('/notifications/settings'),
  saveSettings: (payload) => api.put('/notifications/settings', payload),
};
