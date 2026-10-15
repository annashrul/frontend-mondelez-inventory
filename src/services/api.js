import { queryClient } from '@/lib/queryClient';
import { invalidateListCache } from '@/lib/listCache';
import axios from 'axios';
import { isDashboardMutation } from '@/lib/dashboardRealtime';
import { toast } from '@/lib/toast';

// Base URL dan timeout API diambil dari .env
export const apiBaseUrl = import.meta.env.VITE_API_URL || '/api/v1';

// Timeout request biasa
const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Submit pengambilan includes stock and audit writes; allow more time than CRUD.
export const withdrawalTimeout =
  Number(import.meta.env.VITE_WITHDRAWAL_TIMEOUT) || 120000;

// Endpoint AI (embedding gambar) jauh lebih lama dari request CRUD biasa,
// prosesnya bisa 30-60 detik sehingga memakai timeout terpisah.
export const aiSearchTimeout =
  Number(import.meta.env.VITE_AI_SEARCH_TIMEOUT) || 120000;

// Simpan barang dengan gambar memicu embedding di backend (30-60 detik) plus
// upload ke storage, jadi jauh lebih lama dari CRUD biasa. Pakai timeout
// terpisah agar request tidak dibatalkan saat AI masih memproses.
export const uploadTimeout =
  Number(import.meta.env.VITE_UPLOAD_TIMEOUT) || 180000;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    // Inject token if needed
    const token = localStorage.getItem('token');
    if (token && !['/auth/login', '/auth/verify-otp'].includes(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const user = localStorage.getItem('user');
    if (user && !['/auth/login', '/auth/verify-otp'].includes(config.url)) {
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
  (response) => {
    invalidateListCache(queryClient, response.config?.url, response.config?.method);
    if (isDashboardMutation(response.config?.url, response.config?.method)) {
      window.dispatchEvent(new Event('inventory-dashboard-updated'));
    }
    return response.data;
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return Promise.reject(
        new Error('Server tidak merespons dalam batas waktu. Silakan coba lagi.')
      );
    }
    const message = error.response?.data?.message || (error.message === 'Network Error' ? 'Terjadi kesalahan jaringan' : error.message) || 'Terjadi kesalahan jaringan';
    if (error.response?.status === 401 && !['/auth/login', '/auth/verify-otp'].includes(error.config?.url)) {
      // Handle unauthorized
      toast.error('Sesi berakhir, silakan login kembali');
      window.dispatchEvent(new Event('auth-expired'));
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
