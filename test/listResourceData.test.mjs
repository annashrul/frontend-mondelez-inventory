import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { InfiniteQueryObserver, QueryObserver, QueryClient, keepPreviousData } from '@tanstack/react-query';

function setup(list, queryKey = 'kelompok-barang') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const observers = [];
  const observe = Type => options => {
    const observer = new Type(client, options);
    observers.push(observer);
    return observer.getCurrentResult();
  };
  const source = readFileSync(new URL('../src/hooks/useListResourceData.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  const emptyPagination = { page: 1, has_next: false };
  const hook = new Function('useCallback', 'useInfiniteQuery', 'useQuery', 'keepPreviousData', 'emptyPagination', 'getList', 'getPagination', source + '\nreturn useListResourceData;')(
    callback => callback, observe(InfiniteQueryObserver), observe(QueryObserver),
    keepPreviousData, emptyPagination, response => response?.data || [], response => response?.pagination || emptyPagination,
  );
  return {
    render: ({ mobile = true, ...params } = {}) => hook({
      queryKey, mobile, params: { search: '', page: 4, limit: 2, ...params }, listFn: list,
    }),
    cleanup: () => { observers.forEach(observer => observer.destroy()); client.clear(); },
  };
}
const response = (page, data, has_next) => ({ data, pagination: { page, has_next } });

test('shared mobile lists start at page one, deduplicate rows and concurrent loads, and stop at the last page', async () => {
  const requests = [];
  const env = setup(async (params, { signal }) => {
    assert.ok(signal instanceof AbortSignal);
    requests.push(params.page);
    await new Promise(resolve => setTimeout(resolve, 5));
    return params.page === 1 ? response(1, [{ id: 1 }, { id: 2 }], true) : response(2, [{ id: 2 }, { id: 3 }], false);
  });
  try {
    await env.render().query.refetch();
    const page = env.render();
    await Promise.all([page.query.fetchNextPage({ cancelRefetch: false }), page.query.fetchNextPage({ cancelRefetch: false })]);
    assert.deepEqual(requests, [1, 2]);
    assert.deepEqual(env.render().data.map(row => row.id), [1, 2, 3]);
    assert.equal(env.render().infiniteScroll.hasNext, false);
  } finally { env.cleanup(); }
});

test('failed shared pagination keeps rows for retry; search and page-size changes reset the list', async () => {
  let fail = true;
  const env = setup(async params => {
    if (params.page === 2 && fail) throw new Error('offline');
    return response(params.page, [{ id: `${params.search}:${params.limit}:${params.page}` }], params.page === 1);
  });
  try {
    await env.render().query.refetch();
    await env.render().query.fetchNextPage({ cancelRefetch: false });
    assert.equal(env.render().query.isFetchNextPageError, true);
    assert.equal(env.render().data.length, 1);
    fail = false;
    await env.render().query.fetchNextPage({ cancelRefetch: false });
    assert.equal(env.render().data.length, 2);
    const options = { search: 'oreo', limit: 5 };
    assert.deepEqual(env.render(options).data, []);
    await env.render(options).query.refetch();
    assert.deepEqual(env.render(options).data, [{ id: 'oreo:5:1' }]);
  } finally { env.cleanup(); }
});

test('desktop lists retain the selected numbered page', async () => {
  const requests = [];
  const env = setup(async params => { requests.push(params.page); return response(params.page, [{ id: 8 }], false); });
  try {
    await env.render({ mobile: false }).query.refetch();
    assert.deepEqual(requests, [4]);
    assert.equal(env.render({ mobile: false }).pagination.page, 4);
  } finally { env.cleanup(); }
});

const resources = ['kelompok-barang', 'satuan', 'lokasi', 'rak', 'pengguna', 'level-pengguna', 'adjustment', 'kartu-stok', 'pengambilan-history'];
for (const queryKey of resources) {
  test(`${queryKey}: mobile ignores desktop page and resets when filters change`, async () => {
    const requests = [];
    const env = setup(async params => {
      requests.push(params);
      return response(params.page, [{ id: `${params.tipe}:${params.page}` }], true);
    }, queryKey);
    try {
      const options = { tipe: 'Semua' };
      await env.render(options).query.refetch();
      await env.render(options).query.fetchNextPage();
      assert.equal(env.render(options).data.length, 2);
      // Typing during debounce and changes to desktop page must not reset mobile history.
      assert.equal(env.render({ ...options, page: 7, searchDebouncing: true }).data.length, 2);
      assert.equal(env.render({ ...options, searchDebouncing: true }).infiniteScroll.searchDebouncing, true);
      assert.deepEqual(env.render({ tipe: 'Masuk' }).data, []);
      await env.render({ tipe: 'Masuk' }).query.refetch();
      assert.deepEqual(env.render({ tipe: 'Masuk' }).data, [{ id: 'Masuk:1' }]);
      assert.deepEqual(requests.map(request => request.page), [1, 2, 1]);
      assert.ok(requests.every(request => !Object.hasOwn(request, 'searchDebouncing')));
      assert.equal(env.render({ mobile: false }).infiniteScroll, undefined);
    } finally { env.cleanup(); }
  });
}

test('successful CRUD mutations invalidate both desktop and accumulated mobile pages', async () => {
  const source = readFileSync(new URL('../src/hooks/useCrudResourceData.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  const client = new QueryClient();
  const mutations = [];
  const desktopKey = ['rak', { page: 3, limit: 2 }];
  const mobileKey = ['rak', 'infinite', { limit: 2 }];
  const otherKey = ['lokasi', { page: 1 }];
  const hook = new Function('useMutation', 'useQueryClient', 'useListResourceData', source + '\nreturn useCrudResourceData;')(
    options => { mutations.push(options); return options; }, () => client, () => ({}),
  );
  try {
    hook({ queryKey: 'rak', mobile: true });
    for (const mutation of mutations) {
      client.setQueryData(desktopKey, { data: [{ id: 3 }] });
      client.setQueryData(mobileKey, { pages: [{ data: [{ id: 1 }] }], pageParams: [1] });
      client.setQueryData(otherKey, { data: [] });
      await mutation.onSuccess();
      assert.equal(client.getQueryState(desktopKey).isInvalidated, true);
      assert.equal(client.getQueryState(mobileKey).isInvalidated, true);
      assert.equal(client.getQueryState(otherKey).isInvalidated, false);
    }
  } finally { client.clear(); }
});
