import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { create } from 'zustand';

const source = readFileSync(new URL('../src/stores/notificationStore.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replaceAll('import.meta.env', '{}')
  .replace('export const useNotificationStore', 'const useNotificationStore');

function setup(itemsPerPage = 10) {
  const calls = [];
  const sockets = [];
  const service = {
    list(config) {
      return new Promise((resolve, reject) => calls.push({ config, resolve, reject }));
    },
    markRead: async () => ({ updated: 1 }),
    markAllRead: async () => ({ updated: 1 }),
  };
  const io = () => {
    const handlers = {};
    const socket = {
      on: (name, handler) => { handlers[name] = handler; },
      emit: (name, value) => handlers[name]?.(value),
      removeAllListeners: () => { for (const key in handlers) delete handlers[key]; },
      disconnect() {},
    };
    sockets.push(socket);
    return socket;
  };
  const store = new Function('create', 'toast', 'io', 'notificationService', 'notificationSocketUrl', 'localStorage', 'useSettingsStore', source + '\nreturn useNotificationStore;')(
    create, { info() {} }, io, service, () => 'http://local', { getItem: () => 'token' }, { getState: () => ({ apply() {}, settings: { items_per_page: itemsPerPage } }) },
  );
  return { state: () => store.getState(), calls, sockets };
}
const page = (ids, hasMore = false, unread = 55) => ({
  rows: ids.map(id => ({ id, read_at: null })), unread,
  pagination: { has_next: hasMore, next_cursor: hasMore ? String(ids.at(-1)) : null },
});

test('initial load and next pages are deduplicated and stop at the last cursor', async () => {
  const { state, calls } = setup();
  const first = state().load();
  const duplicate = state().load();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].config.params, { limit: 10 });
  calls[0].resolve(page([55, 54], true));
  await Promise.all([first, duplicate]);
  const more = state().loadMore();
  const moreDuplicate = state().loadMore();
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].config.params, { limit: 10, cursor: '54' });
  calls[1].resolve(page(['54', 53]));
  await Promise.all([more, moreDuplicate]);
  assert.deepEqual(state().items.map(item => item.id), [55, 54, 53]);
  assert.equal(state().unread, 55);
  await state().loadMore();
  assert.equal(calls.length, 2);
});

test('socket arrivals preserve loaded history and do not double-count duplicate events', async () => {
  const { state, calls, sockets } = setup();
  const first = state().load();
  calls[0].resolve(page(Array.from({ length: 40 }, (_, i) => 50 - i), true, 40));
  await first;
  state().connect();
  sockets[0].emit('notification:new', { id: 51 });
  sockets[0].emit('notification:new', { id: '51' });
  assert.equal(state().items.length, 41);
  assert.equal(state().unread, 41);
  assert.equal(state().nextCursor, '11');
  const more = state().loadMore();
  sockets[0].emit('notification:new', { id: 52 });
  calls[1].resolve(page([10, 9], false, 40));
  await more;
  assert.equal(state().items.length, 44);
  assert.equal(state().unread, 42);
});

test('logout aborts pagination and ignores late responses', async () => {
  const { state, calls } = setup();
  const request = state().load();
  state().disconnect();
  assert.equal(calls[0].config.signal.aborted, true);
  calls[0].resolve(page([55], true));
  await request;
  assert.deepEqual(state().items, []);
  assert.equal(state().hasMore, false);
  assert.equal(state().loading, false);
});

test('failed next page preserves cursor and loaded rows for a manual retry', async () => {
  const { state, calls } = setup();
  const first = state().load();
  calls[0].resolve(page([55], true));
  await first;
  const more = state().loadMore();
  calls[1].reject(new Error('Network unavailable'));
  await assert.rejects(more);
  assert.equal(state().error, 'more');
  assert.equal(state().nextCursor, '55');
  assert.deepEqual(state().items.map(item => item.id), [55]);
  const retry = state().loadMore();
  calls[2].resolve(page([54]));
  await retry;
  assert.equal(state().error, null);
  assert.deepEqual(state().items.map(item => item.id), [55, 54]);
});

test('mark-read during pagination is not reverted by a stale response', async () => {
  const { state, calls } = setup();
  const first = state().load();
  calls[0].resolve(page([55], true, 2));
  await first;
  const more = state().loadMore();
  await state().markRead(55);
  calls[1].resolve(page([55, 54], false, 2));
  await more;
  assert.ok(state().items[0].read_at);
  assert.equal(state().unread, 1);
});

test('socket failure triggers no REST polling', async () => {
  const { state, sockets, calls } = setup();
  assert.equal(source.includes('setInterval'), false);
  state().connect();
  sockets[0].emit('connect_error');
  sockets[0].emit('disconnect');
  assert.equal(calls.length, 0);
});


test('notification fetches use the configured page size', async () => {
  const { state, calls } = setup(5);
  const pending = state().load();
  assert.equal(calls[0].config.params.limit, 5);
  calls[0].resolve(page([5, 4, 3, 2, 1]));
  await pending;
});
