import api, { apiBaseUrl } from '@/services/api';

// Alamat socket diambil dari .env (VITE_SOCKET_URL).
// Kosongkan di .env agar otomatis mengikuti host dari VITE_API_URL.
export function notificationSocketUrl() {
  return import.meta.env.VITE_SOCKET_URL || new URL(apiBaseUrl, window.location.origin).origin;
}

export const notificationService = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  getSettings: () => api.get('/notifications/settings'),
  saveSettings: (payload) => api.put('/notifications/settings', payload),
};
