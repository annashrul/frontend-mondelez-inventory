import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function setup() {
  const requests = [];
  const invalidated = [];
  const jobs = new Map();
  let token = 'session-one';
  let timer = 0;
  const source = readFileSync(new URL('../src/services/activityEvents.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
  const service = new Function('api', 'queryClient', 'localStorage', 'window', 'setTimeout', 'clearTimeout', source + '\nreturn {recordUiActivity,recordSearchActivity};')(
    { post: async (...args) => { requests.push(args); return { recorded: true }; } },
    { invalidateQueries: async options => invalidated.push(options) },
    { getItem: () => token }, { location: { pathname: '/pengaturan' } },
    callback => { jobs.set(++timer, callback); return timer; }, id => jobs.delete(id),
  );
  return { ...service, requests, invalidated, jobs, setToken: value => { token = value; } };
}

test('UI actions use authenticated event requests and refresh the activity cache', async () => {
  const env = setup();
  await env.recordUiActivity({ type: 'preference', before: { tema: 'light' }, after: { tema: 'dark' } });
  assert.equal(env.requests[0][0], '/log-activity/events');
  assert.equal(env.requests[0][1].path, '/pengaturan');
  assert.equal(env.requests[0][1].token, undefined);
  assert.equal(env.requests[0][2].headers.Authorization, 'Bearer session-one');
  assert.deepEqual(env.invalidated[0], { queryKey: ['log-activity'], refetchType: 'active' });
  env.setToken(null);
  await env.recordUiActivity({ type: 'navigation' });
  assert.equal(env.requests.length, 1);
});

test('search records the final input once and never attributes delayed input to another session', async () => {
  const env = setup();
  env.recordSearchActivity('o');
  env.recordSearchActivity('oreo');
  assert.equal(env.jobs.size, 1);
  [...env.jobs.values()][0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(env.requests[0][1].search, 'oreo');
  env.recordSearchActivity('old session search');
  env.setToken('session-two');
  [...env.jobs.values()][0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(env.requests.length, 1);
});
