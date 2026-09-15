import { create } from 'zustand';

export const useAppStore = create((set) => ({
  menus: [],
  setMenus: (menus) => set({ menus }),
}));
