import axios from 'axios';
import { toast } from 'sonner';

// Base URL dan timeout API diambil dari .env
export const apiBaseUrl = import.meta.env.VITE_API_URL || '/api/v1';

// Timeout request biasa
const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

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
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return Promise.reject(
        new Error('Server tidak merespons dalam batas waktu. Coba lagi, atau perbesar VITE_API_TIMEOUT / VITE_AI_SEARCH_TIMEOUT di .env.')
      );
    }
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
