import { resetPageSession } from '@/lib/resetPageSession';
import { useSettingsStore } from '@/stores/settingsStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useAppStore } from '@/stores/appStore';

const AuthContext = createContext(null);
let menuCatalogPromise = null;

function loadMenuCatalog(setMenus) {
  if (!menuCatalogPromise) {
    menuCatalogPromise = api.get('/menus').catch((error) => {
      menuCatalogPromise = null;
      throw error;
    });
  }

  return menuCatalogPromise.then((catalog) => {
    setMenus(catalog);
    return catalog;
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const setMenus = useAppStore((state) => state.setMenus);

  useEffect(() => {
    const loadInitialData = async () => {
      await useSettingsStore.getState().loadRuntime().catch(() => {});
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        const last = Number(localStorage.getItem('lastActivity') || Date.now());
        if (Date.now()-last >= useSettingsStore.getState().settings.session_timeout*60000) {
          localStorage.removeItem('user'); localStorage.removeItem('token'); setLoading(false); return;
        }
        try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem('user'); localStorage.removeItem('token'); setLoading(false); return; }
        try {
          await loadMenuCatalog(setMenus);
        } catch (err) {
          console.error('Failed to fetch menus', err);
        }
      }
      setLoading(false);
    };
    
    loadInitialData();
  }, [setMenus]);

  const login = async (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('lastActivity', String(Date.now()));
    setUser(userData);
    try {
      await loadMenuCatalog(setMenus);
    } catch (err) {
      console.error('Failed to fetch menus', err);
    }
  };

  const logout = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    useNotificationStore.getState().disconnect();
    menuCatalogPromise = null;
    resetPageSession();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setMenus([]);
    localStorage.removeItem('lastActivity');
  }, [setMenus]);

  const timeoutMinutes = useSettingsStore(state => state.settings.session_timeout);
  useEffect(() => {
    const expired = () => logout();
    window.addEventListener('auth-expired', expired);
    return () => window.removeEventListener('auth-expired', expired);
  }, [logout]);

  useEffect(() => {
    if (!user) return undefined;
    let timer;
    let lastHeartbeat = 0;
    let lastWrite = 0;
    const schedule = () => {
      clearTimeout(timer);
      const last = Number(localStorage.getItem('lastActivity') || Date.now());
      const remaining = timeoutMinutes*60000-(Date.now()-last);
      if (remaining <= 0) { logout(); return; }
      timer = setTimeout(schedule, remaining);
    };
    const activity = () => {
      const now = Date.now();
      if (now-lastWrite >= 1000) {
        localStorage.setItem('lastActivity', String(now)); lastWrite = now; schedule();
      }
      if (now-lastHeartbeat >= 60000) {
        lastHeartbeat = now;
        api.post('/auth/session').catch(() => {});
      }
    };
    const storage = event => { if (event.key === 'lastActivity') schedule(); if (event.key === 'token' && !event.newValue) logout(); };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, activity, { passive: true, capture: true }));
    window.addEventListener('storage', storage); schedule();
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, activity, true));
      window.removeEventListener('storage', storage);
    };
  }, [user, timeoutMinutes, logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
