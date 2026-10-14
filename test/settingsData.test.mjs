import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QueryClient, QueryObserver, MutationObserver } from '@tanstack/react-query';

function setup(overrides = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  const requests = [];
  const applied = [];
  const settings = { nama_perusahaan: 'Company', tema: 'light', bahasa: 'id' };
  const services = {
    settingsService: {
      get: async () => { requests.push('settings'); return settings; },
      save: async (section, payload) => { requests.push({ section, payload }); return { ...settings, ...payload }; },
      databaseStatus: async () => { requests.push('database'); return { connected: true, backup_available: true }; },
      backup: async () => { requests.push('backup'); return { status: 'success' }; },
      ...overrides,
    },
    notificationService: {
      getSettings: async () => { requests.push('notifications'); return { level_ids: ['1'], user_ids: ['2'] }; },
      saveSettings: async payload => { requests.push({ notifications: payload }); return payload; },
      testEmail: async email => { requests.push({ email }); return { message: 'sent' }; },
    },
  };
  const queryOptions = [];
  const observers = [];
  const source = readFileSync(new URL('../src/hooks/useSettingsPageData.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  const hook = new Function('useQuery', 'useMutation', 'useQueryClient', 'api', 'getList', 'settingsService', 'notificationService', 'useSettingsStore', source + '\nreturn useSettingsPageData;')(
    options => {
      queryOptions.push(options);
      const observer = new QueryObserver(client, options);
      observers.push(observer);
      return { ...observer.getCurrentResult(), refetch: () => observer.refetch() };
    },
    options => ({ mutateAsync: variables => new MutationObserver(client, options).mutate(variables) }),
    () => client,
    { get: async path => { requests.push(path); return { data: [{ id: path === '/pengguna' ? 2 : 1 }] }; } },
    response => response.data,
    services.settingsService, services.notificationService,
    { getState: () => ({ apply: value => applied.push(value) }) },
  );
  const render = tab => { queryOptions.length = 0; return hook(tab, 1); };
  const fetchEnabled = () => Promise.all(queryOptions.filter(option => option.enabled !== false).map(option => client.fetchQuery(option)));
  const cleanup = () => { observers.forEach(observer => observer.destroy()); client.clear(); };
  return { client, requests, applied, render, fetchEnabled, queryOptions, cleanup };
}

test('settings requests are deduplicated and notification/database data load only on their tabs', async () => {
  const env = setup();
  try {
    assert.equal(env.render('umum').loading, true);
    await Promise.all([env.fetchEnabled(), env.fetchEnabled()]);
    assert.deepEqual(env.requests, ['settings']);
    assert.equal(env.render('umum').loading, false);
    env.render('notifikasi');
    await env.fetchEnabled();
    const notification = env.render('notifikasi').notificationQuery.data;
    assert.deepEqual(notification.level_ids, [1]);
    assert.deepEqual(notification.user_ids, [2]);
    assert.equal(notification.stock_enabled, true);
    assert.equal(notification.email_enabled, false);
    assert.equal(env.requests.includes('database'), false);
    assert.ok(env.requests.includes('/level-pengguna'));
    assert.ok(env.requests.includes('/pengguna'));
    env.render('database');
    await env.fetchEnabled();
    assert.ok(env.requests.includes('database'));
  } finally { env.cleanup(); }
});

test('save mutations update the correct cache, apply runtime settings, and invalidate status after backup', async () => {
  const env = setup();
  try {
    const page = env.render('database');
    await env.fetchEnabled();
    await page.saveMutation.mutateAsync({ section: 'tampilan', payload: { tema: 'dark' } });
    assert.equal(env.client.getQueryData(['settings', 1]).tema, 'dark');
    assert.equal(env.applied.at(-1).tema, 'dark');
    assert.equal(env.client.getQueryState(['settings', 1]).isInvalidated, true);
    await page.saveMutation.mutateAsync({ section: 'notifikasi', payload: { level_ids: ['2'], email_enabled: true } });
    assert.deepEqual(env.client.getQueryData(['notification-settings', 1]).level_ids, [2]);
    assert.equal(env.applied.length, 1);
    await page.backupMutation.mutateAsync();
    assert.equal(env.client.getQueryState(['settings-database-status', 1]).isInvalidated, true);
    await page.testEmailMutation.mutateAsync('user@example.test');
    assert.deepEqual(env.requests.at(-1), { email: 'user@example.test' });
  } finally { env.cleanup(); }
});

test('failed refresh preserves cached data and failed backups also invalidate their status', async () => {
  const env = setup({ get: async () => { throw new Error('offline'); }, backup: async () => { throw new Error('backup failed'); } });
  try {
    env.client.setQueryData(['settings', 1], { nama_perusahaan: 'Cached company' });
    env.client.setQueryData(['settings-database-status', 1], { connected: true });
    const page = env.render('umum');
    await assert.rejects(env.fetchEnabled(), /offline/);
    const refreshed = env.render('umum');
    assert.equal(refreshed.loading, false);
    assert.equal(refreshed.loadError, undefined);
    assert.equal(refreshed.refreshError.message, 'offline');
    assert.equal(refreshed.settingsQuery.data.nama_perusahaan, 'Cached company');
    await assert.rejects(page.backupMutation.mutateAsync(), /backup failed/);
    assert.equal(env.client.getQueryState(['settings-database-status', 1]).isInvalidated, true);
  } finally { env.cleanup(); }
});
