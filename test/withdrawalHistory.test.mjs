import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QueryClient } from '@tanstack/react-query';

const source = readFileSync(new URL('../src/services/withdrawalHistoryService.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
const refresh = new Function('getPagination', 'createCrudService', source + '\nreturn refreshWithdrawalHistory;')(
  response => response.pagination, () => ({}),
);
for (const mobile of [false, true]) {
  test(`${mobile ? 'mobile' : 'desktop'} submit fetches the newest unfiltered history even when page one is cached`, async () => {
    const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, staleTime: 60000, retry: false } } });
    const filters = { search: '', limit: 10, userId: 1 };
    const key = mobile ? ['pengambilan-history', 'infinite', filters] : ['pengambilan-history', { ...filters, page: 1 }];
    const old = { data: [{ id: 1 }], pagination: { page: 1, has_next: false } };
    client.setQueryData(key, mobile ? { pages: [old], pageParams: [1] } : old);
    const filteredKey = ['pengambilan-history', { search: 'old search', page: 3, limit: 10, userId: 1 }];
    client.setQueryData(filteredKey, old);
    const requests = [];
    try {
      const result = await refresh(client, { mobile, limit: 10, userId: 1 }, async (params, { signal }) => {
        requests.push(params);
        assert.ok(signal instanceof AbortSignal);
        return { data: [{ id: 2 }, { id: 1 }], pagination: { page: 1, has_next: false } };
      });
      assert.deepEqual(requests, [{ search: '', page: 1, limit: 10 }]);
      assert.deepEqual((mobile ? result.pages[0] : result).data.map(row => row.id), [2, 1]);
      assert.equal(client.getQueryState(filteredKey).isInvalidated, true);
      assert.equal(client.getQueryState(key).isInvalidated, false);
    } finally { client.clear(); }
  });
}
