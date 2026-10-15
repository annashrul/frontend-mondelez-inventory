import { usePwaStore } from '@/stores/pwaStore';

export function setupPwa() {
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  usePwaStore.setState({ iosInstall: ios && !standalone() });
  window.addEventListener('beforeinstallprompt', event => {
    if (standalone()) return;
    event.preventDefault();
    usePwaStore.setState({ installPrompt: event, installDismissed: false });
  });
  window.addEventListener('appinstalled', () => {
    usePwaStore.setState({ installPrompt: null, iosInstall: false, installDismissed: true });
  });
  window.addEventListener('online', () => usePwaStore.setState({ offline: false }));
  window.addEventListener('offline', () => usePwaStore.setState({ offline: true }));

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    void import('virtual:pwa-register').then(({ registerSW }) => {
      const updateServiceWorker = registerSW({
        immediate: true,
        onNeedRefresh() {
          usePwaStore.setState({ updateAvailable: true, updateDismissed: false, applyUpdate: () => updateServiceWorker(true) });
        },
        onRegisteredSW(_url, registration) {
          if (!registration) return;
          const check = () => {
            if (navigator.onLine && document.visibilityState === 'visible') void registration.update().catch(() => {});
          };
          window.setInterval(check, 60 * 60 * 1000);
          document.addEventListener('visibilitychange', check);
          window.addEventListener('online', check);
        },
        onRegisterError() {
          console.error('Gagal mengaktifkan PWA');
        },
      });
    }).catch(() => console.error('Gagal mengaktifkan PWA'));
  }
}
