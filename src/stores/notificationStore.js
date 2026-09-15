import { create } from 'zustand';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { notificationService, notificationSocketUrl } from '@/services/notificationService';

let socket = null;
let mockListener = null;
let fallbackTimer = null;

function stopFallback() {
  if (fallbackTimer) clearInterval(fallbackTimer);
  fallbackTimer = null;
}

function startFallback(load) {
  if (fallbackTimer) return;
  fallbackTimer = setInterval(() => {
    load().catch(() => {});
  }, 5000);
}

export const useNotificationStore = create((set, get) => ({
  items: [],
  unread: 0,
  loading: false,
  connected: false,
  load: async () => {
    set({ loading: true });
    try {
      const response = await notificationService.list();
      set({ items: response.rows || [], unread: response.unread || 0 });
    } finally {
      set({ loading: false });
    }
  },
  connect: () => {
    if (socket || !localStorage.getItem('token')) return;
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      if (mockListener) return;
      mockListener = (event) => {
        const notification = event.detail;
        set((state) => ({
          items: [{ ...notification, read_at: null }, ...state.items.filter((item) => item.id !== notification.id)].slice(0, 30),
          unread: state.unread + 1,
        }));
        toast.info(notification.title, { description: notification.message });
      };
      window.addEventListener('inventory-notification', mockListener);
      set({ connected: true });
      return;
    }
    socket = io(notificationSocketUrl(), {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'],
    });
    socket.on('connect', () => {
      stopFallback();
      set({ connected: true });
    });
    socket.on('notification:new', (notification) => {
      set((state) => ({
        items: [{ ...notification, read_at: null }, ...state.items.filter((item) => item.id !== notification.id)].slice(0, 30),
        unread: state.unread + 1,
      }));
      toast.info(notification.title, { description: notification.message });
    });
    socket.on('disconnect', () => {
      set({ connected: false });
      startFallback(get().load);
    });
    socket.on('connect_error', () => {
      set({ connected: false });
      startFallback(get().load);
    });
  },
  disconnect: () => {
    socket?.disconnect();
    socket = null;
    stopFallback();
    if (mockListener) {
      window.removeEventListener('inventory-notification', mockListener);
      mockListener = null;
    }
    set({ connected: false, items: [], unread: 0 });
  },
  markRead: async (id) => {
    await notificationService.markRead(id);
    set((state) => ({
      items: state.items.map((item) => Number(item.id) === Number(id) ? { ...item, read_at: item.read_at || new Date().toISOString() } : item),
      unread: Math.max(0, state.unread - (get().items.find((item) => Number(item.id) === Number(id) && !item.read_at) ? 1 : 0)),
    }));
  },
  markAllRead: async () => {
    await notificationService.markAllRead();
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })),
      unread: 0,
    }));
  },
}));
