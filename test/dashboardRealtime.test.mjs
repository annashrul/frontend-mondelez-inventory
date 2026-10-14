import test from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as wait } from 'node:timers/promises';
import { subscribeDashboardRefresh, isDashboardMutation } from '../src/lib/dashboardRealtime.js';

test('realtime bursts refresh once, later writes refresh again, and unmount cancels work', async () => {
  const target = new EventTarget();
  let count = 0;
  const cleanup = subscribeDashboardRefresh(target, () => count++, 10);
  for (let i = 0; i < 10; i++) target.dispatchEvent(new Event('inventory-dashboard-updated'));
  await wait(40);
  assert.equal(count, 1);
  target.dispatchEvent(new Event('inventory-dashboard-updated'));
  await wait(40);
  assert.equal(count, 2);
  target.dispatchEvent(new Event('inventory-dashboard-updated'));
  cleanup();
  await wait(40);
  target.dispatchEvent(new Event('inventory-dashboard-updated'));
  await wait(40);
  assert.equal(count, 2);
});

test('local writes refresh dashboards while reads and scan requests do not', () => {
  assert.equal(isDashboardMutation('/barang/12','put'), true);
  assert.equal(isDashboardMutation('/pengambilan/execute','post'), true);
  assert.equal(isDashboardMutation('/adjustment','post'), true);
  assert.equal(isDashboardMutation('/kelompok-barang/4','delete'), true);
  for (const args of [['/barang','get'], ['/rak/scan','post'], ['/rak/items','post'], ['/notifications/read-all','post'], ['/auth/session','post']]) assert.equal(isDashboardMutation(...args), false);
});
