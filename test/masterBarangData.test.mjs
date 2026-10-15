import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { InfiniteQueryObserver, QueryObserver, QueryClient, keepPreviousData } from '@tanstack/react-query';

function setup(list) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const observers = [];
  const observe = Type => options => {
    const observer = new Type(client, options);
    observers.push(observer);
    return observer.getCurrentResult();
  };
  const source = readFileSync(new URL('../src/hooks/useMasterBarangData.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  const emptyPagination = { page: 1, has_next: false };
  const hook = new Function('useCallback', 'useInfiniteQuery', 'useMutation', 'useQuery', 'useQueryClient', 'keepPreviousData', 'emptyPagination', 'getList', 'getPagination', 'getBarangList', source + '\nreturn useMasterBarangData;')(
    callback => callback, observe(InfiniteQueryObserver), () => ({}), observe(QueryObserver), () => client,
    keepPreviousData, emptyPagination, response => response?.data || [], response => response?.pagination || emptyPagination, list,
  );
  return {
    render: (options = {}) => hook({ mobile: true, search: '', page: 4, limit: 2, ...options }),
    cleanup: () => { observers.forEach(observer => observer.destroy()); client.clear(); },
  };
}
const response = (page, data, has_next) => ({ data, pagination: { page, has_next } });

test('mobile items start at page one, deduplicate rows and concurrent loads, and stop at the last page', async () => {
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
    await Promise.all([page.loadMore(), page.loadMore()]);
    assert.deepEqual(requests, [1, 2]);
    assert.deepEqual(env.render().data.map(row => row.id), [1, 2, 3]);
    assert.equal(env.render().hasNext, false);
  } finally { env.cleanup(); }
});

test('failed item pagination keeps rows for retry; search and page-size changes reset the list', async () => {
  let fail = true;
  const env = setup(async params => {
    if (params.page === 2 && fail) throw new Error('offline');
    return response(params.page, [{ id: `${params.search}:${params.limit}:${params.page}` }], params.page === 1);
  });
  try {
    await env.render().query.refetch();
    await env.render().loadMore();
    assert.equal(env.render().query.isFetchNextPageError, true);
    assert.equal(env.render().data.length, 1);
    fail = false;
    await env.render().loadMore();
    assert.equal(env.render().data.length, 2);
    const options = { search: 'oreo', limit: 5 };
    assert.deepEqual(env.render(options).data, []);
    await env.render(options).query.refetch();
    assert.deepEqual(env.render(options).data, [{ id: 'oreo:5:1' }]);
  } finally { env.cleanup(); }
});

test('desktop items retain the selected numbered page', async () => {
  const requests = [];
  const env = setup(async params => { requests.push(params.page); return response(params.page, [{ id: 8 }], false); });
  try {
    await env.render({ mobile: false }).query.refetch();
    assert.deepEqual(requests, [4]);
    assert.equal(env.render({ mobile: false }).pagination.page, 4);
  } finally { env.cleanup(); }
});
