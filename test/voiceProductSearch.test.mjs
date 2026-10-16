import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/VoiceProductSearch.jsx', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').replace('export default function', 'function');
const logic = source.slice(0, source.indexOf('  return <div')) + 'return { start, cancel, close }; }\nreturn VoiceProductSearch;';
function setup({ unsupported = false, startError = false, languages = ['id-ID'] } = {}) {
  const calls = { queries: [], searches: [], messages: [], listening: [], aborts: 0, alternatives: [] };
  const cleanups = [];
  const timers = new Map();
  let recognition;
  class Recognition {
    constructor() { recognition = this; }
    start() { if (startError) throw new Error('denied'); }
    abort() { calls.aborts++; this.onend?.(); }
  }
  let state = 0;
  const component = new Function('useState', 'useRef', 'useEffect', 'window', 'document', 'setTimeout', 'clearTimeout', logic)(
    initial => {
      const index = state++;
      return [typeof initial === 'function' ? initial() : initial, value => { if (index === 1) calls.listening.push(value); if (index === 2) calls.messages.push(value); if (index === 3) calls.alternatives.push(value); }];
    },
    current => ({ current }), effect => cleanups.push(effect()),
    unsupported ? {} : { webkitSpeechRecognition: Recognition, navigator: { languages } },
    { addEventListener() {}, removeEventListener() {} },
    callback => { const id = timers.size + 1; timers.set(id, callback); return id; }, id => timers.delete(id),
  );
  const controls = component({ value: '', onChange: value => calls.queries.push(value), onSearch: value => calls.searches.push(value), disabled: false, onListeningChange() {} });
  return { calls, controls, timers, get recognition() { return recognition; }, unmount: () => cleanups.forEach(cleanup => cleanup?.()) };
}
const result = (text, final) => ({ results: [Object.assign([{ transcript: text }], { isFinal: final })] });

test('voice search previews text and waits for confirmation before searching', () => {
  const env = setup();
  env.controls.start();
  assert.equal(env.recognition.lang, 'id-ID');
  env.recognition.onresult(result('modular', false));
  assert.deepEqual(env.calls.searches, []);
  env.recognition.onresult(result(' modular chain ', true));
  env.recognition.onresult(result('modular chain', true));
  assert.deepEqual(env.calls.searches, []);
  assert.equal(env.calls.queries.at(-1), 'modular chain');
  assert.equal(env.recognition.maxAlternatives, 5);
  assert.equal(env.calls.aborts, 1);
  assert.equal(env.timers.size, 0);
});

test('permission errors and unsupported browsers preserve manual search without submitting', () => {
  const denied = setup(); denied.controls.start();
  denied.recognition.onerror({ error: 'not-allowed' });
  assert.match(denied.calls.messages.at(-1), /Izin mikrofon ditolak/);
  denied.recognition.onresult(result('late result', true));
  assert.deepEqual(denied.calls.searches, []);
  const unsupported = setup({ unsupported: true }); unsupported.controls.start();
  assert.match(unsupported.calls.messages.at(-1), /belum mendukung/);
  const broken = setup({ startError: true }); broken.controls.start();
  assert.match(broken.calls.messages.at(-1), /Gagal membuka mikrofon/);
});

test('cancel, timeout, and unmount release the microphone and ignore late results', () => {
  for (const action of ['cancel', 'timeout', 'unmount']) {
    const env = setup(); env.controls.start();
    if (action === 'cancel') env.controls.cancel();
    if (action === 'timeout') [...env.timers.values()][0]();
    if (action === 'unmount') env.unmount();
    env.recognition.onresult(result('late result', true));
    assert.deepEqual(env.calls.searches, []);
    assert.equal(env.calls.aborts, 1);
    assert.equal(env.timers.size, 0);
  }
});

test('a final segment followed by interim speech does not end recognition early', () => {
  const env = setup(); env.controls.start();
  env.recognition.onresult({ results: [result('modular', true).results[0], result('chain', false).results[0]] });
  assert.equal(env.calls.aborts, 0);
  assert.equal(env.calls.queries.at(-1), 'modular chain');
  env.recognition.onresult({ results: [result('modular', true).results[0], result('chain', true).results[0]] });
  assert.equal(env.calls.aborts, 1);
  assert.deepEqual(env.calls.searches, []);
});

test('alternative transcripts preserve the other segments and remove duplicates', () => {
  const env = setup(); env.controls.start();
  const segment = Object.assign([{ transcript: 'chain' }, { transcript: 'change' }, { transcript: 'chain' }], { isFinal: true });
  env.recognition.onresult({ results: [result('modular', true).results[0], segment] });
  assert.deepEqual(env.calls.alternatives.at(-1), ['modular chain', 'modular change']);
  assert.deepEqual(env.calls.searches, []);
});

test('closing the voice modal releases the microphone and ignores subsequent results', () => {
  const env = setup(); env.controls.start();
  env.controls.close();
  assert.equal(env.calls.aborts, 1);
  assert.equal(env.calls.listening.at(-1), false);
  assert.equal(env.timers.size, 0);
  env.recognition.onresult(result('late speech', true));
  assert.deepEqual(env.calls.searches, []);
  assert.deepEqual(env.calls.queries, []);
});

test('selects a supported device language automatically with Indonesian fallback', () => {
  for (const [languages, expected] of [
    [['en-GB', 'id-ID'], 'en-US'],
    [['id-ID', 'en-US'], 'id-ID'],
    [['fr-FR', 'en-AU'], 'en-US'],
    [['ja-JP'], 'id-ID'],
    [[], 'id-ID'],
  ]) {
    const env = setup({ languages }); env.controls.start();
    assert.equal(env.recognition.lang, expected);
    env.controls.close();
  }
});
