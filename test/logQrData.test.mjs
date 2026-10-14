import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { InfiniteQueryObserver, QueryClient, keepPreviousData } from '@tanstack/react-query';

const source = file => readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
const getList = response => response?.data || [];
const emptyPagination = { page: 1, total: 0, has_next: false };
const getPagination = response => response?.pagination || emptyPagination;
function logsSetup(list) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const observers = [];
  const hook = new Function('useMemo', 'useInfiniteQuery', 'keepPreviousData', 'emptyPagination', 'getList', 'getPagination', 'logActivityService', source('hooks/useLogActivityData.js')+'\nreturn useLogActivityData;')(
    callback => callback(),
    options => { const observer = new InfiniteQueryObserver(client, options); observers.push(observer); return { ...observer.getCurrentResult(), refetch: () => observer.refetch(), fetchNextPage: options => observer.fetchNextPage(options) }; },
    keepPreviousData, emptyPagination, getList, getPagination, { list },
  );
  const render = (search = '', limit = 2) => hook({ search, limit, userId: 1 });
  const cleanup = () => { observers.forEach(observer => observer.destroy()); client.clear(); };
  return { render, cleanup, client };
}
const response = (page, data, has_next) => ({ data, pagination: { page, has_next, total: 3 } });

test('infinite activity queries deduplicate next-page requests and stop at the final page', async () => {
  const requests = [];
  const env = logsSetup(async (params, signal) => {
    requests.push(params);
    assert.ok(signal instanceof AbortSignal);
    await new Promise(resolve => setTimeout(resolve, 5));
    return params.page === 1 ? response(1, [{ id: 1 }, { id: 2 }], true) : response(2, [{ id: 2 }, { id: 3 }], false);
  });
  try {
    assert.equal(env.render().loading, true);
    await env.render().query.refetch();
    assert.equal(env.render().hasNext, true);
    const page = env.render();
    await Promise.all([page.loadMore(), page.loadMore()]);
    assert.deepEqual(requests.map(request => request.page), [1, 2]);
    assert.deepEqual(env.render().logs.map(log => log.id), [1, 2, 3]);
    assert.equal(env.render().hasNext, false);
  } finally { env.cleanup(); }
});

test('failed activity pagination keeps loaded rows and permits an explicit retry', async () => {
  let fail = true;
  const env = logsSetup(async params => {
    if (params.page === 2 && fail) throw new Error('offline');
    return response(params.page, [{ id: params.page }], params.page === 1);
  });
  try {
    await env.render().query.refetch();
    await env.render().loadMore();
    const failed = env.render();
    assert.equal(failed.query.isFetchNextPageError, true);
    assert.deepEqual(failed.logs, [{ id: 1 }]);
    fail = false;
    await failed.loadMore();
    assert.deepEqual(env.render().logs, [{ id: 1 }, { id: 2 }]);
    assert.equal(env.render().query.isError, false);
  } finally { env.cleanup(); }
});

test('search and page-size changes start independent activity histories', async () => {
  const requests = [];
  const env = logsSetup(async params => {
    requests.push(params);
    return response(params.page, [{ id: `${params.search}:${params.limit}:${params.page}` }], true);
  });
  try {
    await env.render().query.refetch();
    await env.render().loadMore();
    await env.render('scan', 5).query.refetch();
    assert.deepEqual(env.render('scan', 5).logs, [{ id: 'scan:5:1' }]);
    assert.deepEqual(requests.at(-1), { search: 'scan', page: 1, limit: 5 });
    assert.equal(env.render().logs.length, 2);
  } finally { env.cleanup(); }
});

test('QR rack loading fetches every page and forwards the query cancellation signal', async () => {
  const requests = [];
  const signal = new AbortController().signal;
  const getQrRacks = new Function('api', 'getList', 'getPagination', source('services/qrRackService.js')+'\nreturn getQrRacks;')(
    { get: async (path, config) => { requests.push({ path, ...config.params }); assert.equal(config.signal, signal); return response(config.params.page, [{ id: config.params.page }], config.params.page === 1); } }, getList, getPagination,
  );
  assert.deepEqual(await getQrRacks({ signal }), [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(requests, [{ path: '/rak', page: 1, limit: 100 }, { path: '/rak', page: 2, limit: 100 }]);
});
