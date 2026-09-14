import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    // Inject token if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed?.id) config.headers['X-User-Id'] = String(parsed.id);
        if (parsed?.nama || parsed?.username) config.headers['X-User-Name'] = parsed.nama || parsed.username;
      } catch {
        localStorage.removeItem('user');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan';
    if (error.response?.status === 401) {
      // Handle unauthorized
      toast.error('Sesi berakhir, silakan login kembali');
    }
    return Promise.reject(new Error(message));
  }
);

export const emptyPagination = {
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

export function getList(response) {
  return Array.isArray(response) ? response : response?.data || [];
}

export function getPagination(response) {
  return response?.pagination || emptyPagination;
}

export default api;
