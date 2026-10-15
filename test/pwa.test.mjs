import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pwaOptions } from '../src/pwa/config.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url));

test('installable manifest uses real PNG icons with separate maskable and Apple icons', () => {
  const { manifest } = pwaOptions;
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.name && manifest.short_name && manifest.id);
  for (const icon of manifest.icons) {
    const png = read(`public${icon.src}`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192' && icon.purpose === 'any'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose === 'maskable'));
  const apple = read('public/pwa/apple-touch-icon.png');
  assert.equal(apple.readUInt32BE(16), 180);
  assert.match(read('index.html').toString(), /rel="apple-touch-icon"/);
});

test('PWA caches app assets only, excludes API navigation and never forces an update reload', () => {
  assert.deepEqual(pwaOptions.workbox.runtimeCaching, []);
  for (const path of ['/api', '/api/v1/barang', '/api/v1/pengambilan/execute', '/socket.io/']) {
    assert.ok(pwaOptions.workbox.navigateFallbackDenylist.some(pattern => pattern.test(path)));
  }
  assert.equal(pwaOptions.workbox.navigateFallback, '/index.html');
  assert.equal(pwaOptions.registerType, 'prompt');
  assert.equal(pwaOptions.workbox.skipWaiting, false);
  assert.equal(pwaOptions.workbox.clientsClaim, false);
});

test('hosting serves API before the SPA fallback and revalidates the service worker', () => {
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.rewrites.at(-1).destination, '/index.html');
  assert.equal(config.rewrites[0].source, '/api/:path*');
  assert.match(config.headers.find(rule => rule.source === '/sw.js').headers.find(header => header.key === 'Cache-Control').value, /no-cache/);
});
