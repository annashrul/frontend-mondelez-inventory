import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { create } from 'zustand';
import { settingsTab, settingsTabParams } from '../src/lib/settingsTabs.js';
import { appearancePayload } from '../src/lib/appearanceSettings.js';

test('settings tabs load from URLs and preserve other search parameters', () => {
  const params = new URLSearchParams('tab=notifikasi&source=header');
  assert.equal(settingsTab(params), 'notifikasi');
  const changed = settingsTabParams(params, 'keamanan');
  assert.equal(changed.get('tab'), 'keamanan');
  assert.equal(changed.get('source'), 'header');
  assert.equal(params.get('tab'), 'notifikasi');
  assert.equal(settingsTab(new URLSearchParams('tab=unknown')), 'umum');
  assert.equal(settingsTab(new URLSearchParams()), 'umum');
});

test('appearance saves only its preferences and validates input before requesting the API', () => {
  const settings = { tema: 'dark', bahasa: 'en', items_per_page: 25, nama_perusahaan: 'Unsaved company name' };
  assert.deepEqual(appearancePayload(settings), { tema: 'dark', bahasa: 'en', items_per_page: 25 });
  assert.equal(settings.nama_perusahaan, 'Unsaved company name');
  for (const items_per_page of [null, 0, 4, 101, 10.5, '10', NaN]) {
    assert.throws(() => appearancePayload({ ...settings, items_per_page }), /5 dan 100/);
  }
  for (const items_per_page of [5, 10, 100]) assert.equal(appearancePayload({ ...settings, items_per_page }).items_per_page, items_per_page);
  assert.throws(() => appearancePayload({ ...settings, tema: 'invalid' }), /Tema/);
  assert.throws(() => appearancePayload({ ...settings, bahasa: 'invalid' }), /Bahasa/);
});

function setup(storedPreferences = null) {
  let savedPreferences = storedPreferences;
  const storage = { getItem: () => savedPreferences, setItem: (key, value) => { assert.equal(key, "inventory-appearance-preferences"); savedPreferences = value; } };
  const appliedThemes = [];
  const document = { documentElement: { classList: { toggle: (...args) => appliedThemes.push(args) }, lang: '' }, title: '' };
  const source = readFileSync(new URL('../src/stores/settingsStore.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  let calls = 0;
  const api = { get: async path => {
    calls++; assert.equal(path, '/settings/runtime');
    return { tema: 'dark', bahasa: 'en', items_per_page: 25, nama_perusahaan: 'Test Company', session_timeout: 15 };
  } };
  const stores = new Function('create', 'api', 'document', 'localStorage', source + '\nreturn { useSettingsStore, withSettingsPageSize };')(create, api, document, storage);
  return { ...stores, document, appliedThemes, calls: () => calls, savedPreferences: () => savedPreferences };
}

test('runtime preferences apply theme, language, identity, and pagination defaults', async () => {
  const { useSettingsStore: settings, withSettingsPageSize, document, appliedThemes } = setup();
  const table = withSettingsPageSize(create(set => ({ limit: 10, page: 3, setLimit: limit => set({ limit, page: 1 }) })));
  await settings.getState().loadRuntime();
  assert.deepEqual(appliedThemes[0], ['dark', true]);
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(document.title, 'Test Company');
  assert.equal(table.getState().limit, 25);
  assert.equal(table.getState().page, 1);
  settings.getState().apply({ tema: 'light', items_per_page: 50 });
  assert.equal(appliedThemes.at(-1)[1], false);
  assert.equal(table.getState().limit, 50);
});

test('simultaneous runtime loads share one request', async () => {
  const { useSettingsStore: settings, calls } = setup();
  await Promise.all([settings.getState().loadRuntime(), settings.getState().loadRuntime()]);
  assert.equal(calls(), 1);
});

test('language preferences translate controls while preserving unknown user content', () => {
  const { useSettingsStore } = setup();
  const source = readFileSync(new URL('../src/lib/i18n.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  const { translate, getAppLocale } = new Function('useSettingsStore', source + '\nreturn { translate, getAppLocale };')(useSettingsStore);
  assert.equal(translate('Simpan'), 'Simpan');
  useSettingsStore.getState().apply({ bahasa: 'en' });
  assert.equal(translate('Simpan'), 'Save');
  assert.equal(translate('My Product Name'), 'My Product Name');
  assert.equal(getAppLocale(), 'en-GB');
});

test('profile preferences persist locally and override runtime updates without API saves', async () => {
  const first = setup();
  await first.useSettingsStore.getState().loadRuntime();
  first.useSettingsStore.getState().setAppearancePreferences({ tema: 'light', bahasa: 'en' });
  assert.equal(first.calls(), 1);
  assert.equal(first.document.documentElement.lang, 'en');
  const next = setup(first.savedPreferences());
  assert.equal(next.document.documentElement.lang, 'en');
  assert.equal(next.appliedThemes.at(-1)[1], false);
  await next.useSettingsStore.getState().loadRuntime();
  assert.equal(next.useSettingsStore.getState().settings.tema, 'light');
  assert.equal(next.useSettingsStore.getState().settings.bahasa, 'en');
  next.useSettingsStore.getState().apply({ tema: 'dark', bahasa: 'id', nama_perusahaan: 'Updated company' });
  assert.equal(next.useSettingsStore.getState().settings.tema, 'light');
  assert.equal(next.useSettingsStore.getState().settings.bahasa, 'en');
  assert.equal(next.document.title, 'Updated company');
});

test('local preference storage only accepts supported theme and language values', () => {
  const env = setup(JSON.stringify({ tema: 'dark', bahasa: 'en', session_timeout: 0 }));
  const settings = env.useSettingsStore;
  assert.equal(settings.getState().settings.session_timeout, 30);
  settings.getState().setAppearancePreferences({ tema: 'invalid', bahasa: 'xx', two_factor: true });
  assert.deepEqual(JSON.parse(env.savedPreferences()), { tema: 'dark', bahasa: 'en' });
  assert.equal(settings.getState().settings.two_factor, false);
  assert.equal(setup('invalid JSON').useSettingsStore.getState().settings.tema, 'light');
});
