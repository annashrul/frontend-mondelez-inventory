import { create } from 'zustand';

export const usePwaStore = create(() => ({
  installPrompt: null,
  iosInstall: false,
  installDismissed: false,
  updateAvailable: false,
  updateDismissed: false,
  applyUpdate: null,
  offline: typeof navigator !== 'undefined' && navigator.onLine === false,
}));
