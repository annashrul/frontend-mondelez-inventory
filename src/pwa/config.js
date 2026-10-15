export const pwaOptions = {
  registerType: 'prompt',
  injectRegister: null,
  includeAssets: ['favicon.svg', 'pwa/apple-touch-icon.png'],
  manifest: {
    id: '/',
    name: 'Mondelez Inventory',
    short_name: 'Inventory',
    description: 'Kelola stok, rak, dan pengambilan barang Mondelez.',
    lang: 'id',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f3f4f8',
    theme_color: '#4f2170',
    icons: [
      { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg,webp,ico,webmanifest}'],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/socket\.io(?:\/|$)/],
    // Cache the app shell only. Stock, auth, notifications and writes use the network.
    runtimeCaching: [],
    cleanupOutdatedCaches: true,
    skipWaiting: false,
    clientsClaim: false,
  },
};
