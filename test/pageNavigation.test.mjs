import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QueryObserver, InfiniteQueryObserver } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient.js';
import { pageMemory } from '../src/lib/pageMemory.js';
import { invalidateListCache } from '../src/lib/listCache.js';

const tick = () => new Promise(resolve => setTimeout(resolve, 5));

test('leaving and revisiting a list retains data without initial loading or another request', async () => {
  let calls = 0;
  const options = { queryKey: ['navigation-test'], queryFn: async () => { calls++; return [{ id: 1 }]; } };
  const first = new QueryObserver(queryClient, options);
  const unsubscribe = first.subscribe(() => {});
  try {
    await first.refetch();
    unsubscribe();
    first.destroy();
    await tick();
    const second = new QueryObserver(queryClient, options);
    const stop = second.subscribe(() => {});
    try {
      assert.deepEqual(second.getCurrentResult().data, [{ id: 1 }]);
      assert.equal(second.getCurrentResult().isPending, false);
      assert.equal(second.getCurrentResult().isFetching, false);
      await tick();
      assert.equal(calls, 1);
    } finally { stop(); second.destroy(); }
  } finally { unsubscribe(); first.destroy(); queryClient.clear(); }
});

test('returning to an infinite list keeps every loaded page and its next-page cursor', async () => {
  const requests = [];
  const options = {
    queryKey: ['barang', 'infinite', { search: 'oreo', limit: 2 }], initialPageParam: 1,
    queryFn: async ({ pageParam }) => { requests.push(pageParam); return { data: [{ id: pageParam }], next: pageParam < 3 ? pageParam + 1 : undefined }; },
    getNextPageParam: page => page.next,
  };
  const first = new InfiniteQueryObserver(queryClient, options);
  const stop = first.subscribe(() => {});
  try {
    await first.refetch();
    await first.fetchNextPage();
    stop(); first.destroy();
    await tick();
    const second = new InfiniteQueryObserver(queryClient, options);
    const stopSecond = second.subscribe(() => {});
    try {
      assert.equal(second.getCurrentResult().isPending, false);
      assert.deepEqual(second.getCurrentResult().data.pageParams, [1, 2]);
      assert.equal(second.getCurrentResult().hasNextPage, true);
      await second.fetchNextPage();
      assert.deepEqual(requests, [1, 2, 3]);
    } finally { stopSecond(); second.destroy(); }
  } finally { stop(); first.destroy(); queryClient.clear(); }
});

test('invalidated pages refresh on return while continuing to show cached rows', async () => {
  const queryKey = ['kartu-stok', 'infinite'];
  queryClient.setQueryData(queryKey, ['old']);
  invalidateListCache(queryClient, '/pengambilan/execute', 'post');
  let finish;
  const observer = new QueryObserver(queryClient, { queryKey, queryFn: () => new Promise(resolve => { finish = resolve; }) });
  const stop = observer.subscribe(() => {});
  try {
    assert.deepEqual(observer.getCurrentResult().data, ['old']);
    assert.equal(observer.getCurrentResult().isPending, false);
    assert.equal(observer.getCurrentResult().isFetching, true);
    finish(['updated']);
    await tick();
    assert.deepEqual(observer.getCurrentResult().data, ['updated']);
  } finally { stop(); observer.destroy(); queryClient.clear(); }
});

test('reads and rack scans keep cached lists fresh', () => {
  const key = ['barang', 'infinite'];
  try {
    queryClient.setQueryData(key, { pages: [] });
    for (const [url, method] of [['/barang', 'get'], ['/rak/scan', 'post'], ['/rak/items', 'post']]) {
      invalidateListCache(queryClient, url, method);
      assert.equal(queryClient.getQueryState(key).isInvalidated, false);
    }
  } finally { queryClient.clear(); }
});

test('page state restores selections, drafts and functional updates across remounts and clears for logout', () => {
  const source = readFileSync(new URL('../src/hooks/usePageState.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace('export default ', '');
  const hook = new Function('useCallback', 'useRef', 'useState', 'pageMemory', source + '\nreturn usePageState;')(
    callback => callback, value => ({ current: value }), initial => [initial(), () => {}], pageMemory,
  );
  try {
    const [, setSearch] = hook('search', '');
    setSearch('oreo');
    assert.equal(hook('search', '')[0], 'oreo');
    const [, setSelected] = hook('selected', []);
    setSelected(current => [...current, 2]);
    setSelected(current => [...current, 3]);
    assert.deepEqual(hook('selected', [])[0], [2, 3]);
    const [, setDraft] = hook('draft', null);
    setDraft({ nama: 'Draft', stok: 15 });
    assert.deepEqual(hook('draft', null)[0], { nama: 'Draft', stok: 15 });
    assert.equal(hook('another-page:search', '')[0], '');
    pageMemory.clear();
    assert.equal(hook('search', '')[0], '');
    assert.deepEqual(hook('selected', [])[0], []);
  } finally { pageMemory.clear(); }
});

test('route scroll positions restore independently when returning to a page', () => {
  const source = readFileSync(new URL('../src/hooks/usePageScroll.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace('export default ', '');
  let pathname = '/master-barang';
  let cleanup;
  const listeners = new Set();
  const browser = {
    history: { scrollRestoration: 'auto' }, scrollX: 0, scrollY: 0,
    scrollTo({ left, top }) { this.scrollX = left; this.scrollY = top; },
    addEventListener(type, callback) { listeners.add(callback); },
    removeEventListener(type, callback) { listeners.delete(callback); },
  };
  const hook = new Function('useLayoutEffect', 'useLocation', 'pageMemory', 'window', source + '\nreturn usePageScroll;')(
    callback => { cleanup = callback(); }, () => ({ pathname }), pageMemory, browser,
  );
  try {
    hook();
    browser.scrollY = 1250;
    listeners.forEach(callback => callback());
    cleanup();
    pathname = '/kartu-stok'; hook();
    assert.equal(browser.scrollY, 0);
    browser.scrollY = 500;
    listeners.forEach(callback => callback());
    cleanup();
    pathname = '/master-barang'; hook();
    assert.equal(browser.scrollY, 1250);
  } finally { cleanup(); pageMemory.clear(); }
});


test('settings, notification settings, and read actions invalidate the audit cache without refetch loops', () => {
  const key = ['log-activity', { search: '', limit: 5 }];
  try {
    for (const [url, method] of [['/settings/tampilan', 'put'], ['/notifications/settings', 'put'], ['/notifications/test-email', 'post'], ['/barang', 'get'], ['/rak/scan', 'post']]) {
      queryClient.setQueryData(key, []);
      invalidateListCache(queryClient, url, method);
      assert.equal(queryClient.getQueryState(key).isInvalidated, true, url);
    }
    for (const url of ['/log-activity', '/log-activity/events', '/auth/session', '/settings/runtime']) {
      queryClient.setQueryData(key, []);
      invalidateListCache(queryClient, url, 'get');
      assert.equal(queryClient.getQueryState(key).isInvalidated, false, url);
    }
  } finally { queryClient.clear(); }
});
