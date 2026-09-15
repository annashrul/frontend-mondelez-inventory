import { createContext, useContext, useState, useEffect } from 'react';
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
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
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
    setUser(userData);
    try {
      await loadMenuCatalog(setMenus);
    } catch (err) {
      console.error('Failed to fetch menus', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setMenus([]);
  };

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
