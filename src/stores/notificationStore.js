import { useSettingsStore } from '@/stores/settingsStore';
import { create } from 'zustand';
import { toast } from '@/lib/toast';
import { io } from 'socket.io-client';
import { notificationService, notificationSocketUrl } from '@/services/notificationService';

let socket = null;
let mockListener = null;
let pendingLoad = null;

const pageLimit = 10;
let changeVersion = 0;

function uniqueItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const id = String(item.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export const useNotificationStore = create((set, get) => {
  const fetchPage = (append) => {
    if (pendingLoad) return pendingLoad.promise;
    if (append && (!get().hasMore || !get().nextCursor)) return Promise.resolve();
    const controller = new AbortController();
    const request = { controller, promise: null };
    const existingIds = new Set(get().items.map((item) => String(item.id)));
    const version = changeVersion;
    pendingLoad = request;
    set({ [append ? 'loadingMore' : 'loading']: true, error: null });
    request.promise = (async () => {
      try {
        const response = await notificationService.list({
          signal: controller.signal,
          params: { limit: pageLimit, ...(append ? { cursor: get().nextCursor } : {}) },
        });
        if (controller.signal.aborted) return;
        set((state) => {
          const rows = response.rows || [];
          const currentById = new Map(state.items.map((item) => [String(item.id), item]));
          const updatedRows = rows.map((item) => {
            const current = currentById.get(String(item.id));
            return current?.read_at ? { ...item, read_at: current.read_at } : item;
          });
          // Keep socket arrivals received while the first page was in flight.
          const newer = state.items.filter((item) => !existingIds.has(String(item.id)));
          return {
            items: uniqueItems(append ? [...state.items, ...updatedRows] : [...newer, ...updatedRows]),
            unread: !state.hasLoaded || version === changeVersion ? (response.unread || 0) : state.unread,
            hasLoaded: true,
            hasMore: Boolean(response.pagination?.has_next),
            nextCursor: response.pagination?.next_cursor || null,
          };
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          set({ error: append ? 'more' : 'initial' });
          throw error;
        }
      } finally {
        if (pendingLoad === request) {
          pendingLoad = null;
          set({ loading: false, loadingMore: false });
        }
      }
    })();
    return request.promise;
  };

  const receiveNotification = (notification) => {
    if (get().items.some((item) => String(item.id) === String(notification.id))) return;
    changeVersion += 1;
    set((state) => ({
      items: [{ ...notification, read_at: null }, ...state.items],
      unread: state.unread + 1,
    }));
    toast.info(notification.title, { description: notification.message });
  };

  return {
    items: [],
    unread: 0,
    loading: false,
    loadingMore: false,
    hasLoaded: false,
    hasMore: false,
    nextCursor: null,
    error: null,
    connected: false,
    load: () => fetchPage(false),
    loadMore: () => fetchPage(true),
    connect: () => {
      if (socket || !localStorage.getItem('token')) return;
      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        if (mockListener) return;
        mockListener = (event) => {
          receiveNotification(event.detail);
        };
        window.addEventListener('inventory-notification', mockListener);
        set({ connected: true });
        return;
      }
      socket = io(notificationSocketUrl(), {
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket', 'polling'],
      });
      let hasConnected = false;
      socket.on('connect', () => {
        set({ connected: true });
        window.dispatchEvent(new Event('inventory-dashboard-updated'));
        // Ambil notifikasi yang terlewat hanya setelah koneksi pulih.
        if (hasConnected) get().load().catch(() => {});
        hasConnected = true;
      });
      socket.on('dashboard:updated', () => window.dispatchEvent(new Event('inventory-dashboard-updated')));
      socket.on('notification:new', receiveNotification);
      socket.on('settings:updated', settings => useSettingsStore.getState().apply(settings));
      socket.on('disconnect', () => {
        set({ connected: false });
      });
      socket.on('connect_error', () => {
        set({ connected: false });
      });
    },
    disconnect: () => {
      socket?.removeAllListeners();
      socket?.disconnect();
      socket = null;
      pendingLoad?.controller.abort();
      pendingLoad = null;
      if (mockListener) {
        window.removeEventListener('inventory-notification', mockListener);
        mockListener = null;
      }
      changeVersion += 1;
      set({ connected: false, items: [], unread: 0, loading: false, loadingMore: false, hasLoaded: false, hasMore: false, nextCursor: null, error: null });
    },
    markRead: async (id) => {
      const result = await notificationService.markRead(id);
      if (!result.updated) return;
      changeVersion += 1;
      set((state) => ({
        items: state.items.map((item) => Number(item.id) === Number(id) ? { ...item, read_at: item.read_at || new Date().toISOString() } : item),
        unread: Math.max(0, state.unread - (get().items.find((item) => Number(item.id) === Number(id) && !item.read_at) ? 1 : 0)),
      }));
    },
    markAllRead: async () => {
      await notificationService.markAllRead();
      changeVersion += 1;
      set((state) => ({
        items: state.items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })),
        unread: 0,
      }));
    },
  };
});
