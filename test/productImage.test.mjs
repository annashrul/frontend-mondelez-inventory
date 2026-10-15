import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/productImage.js', import.meta.url), 'utf8').replaceAll('export ', '');
function setup({ width = 4000, height = 3000, encode, broken = false } = {}) {
  const draws = [];
  const revoked = [];
  const context = { fillRect() {}, drawImage(...args) { draws.push(args.slice(1)); } };
  const canvas = { getContext: () => context, toDataURL: (type, quality) => encode?.(canvas, quality) || 'data:image/jpeg;base64,YQ==' };
  class Image {
    naturalWidth = width;
    naturalHeight = height;
    set src(value) { queueMicrotask(() => broken ? this.onerror() : this.onload()); }
  }
  const prepare = new Function('Blob', 'URL', 'Image', 'document', source + '\nreturn prepareProductImage;')(
    Blob, { createObjectURL: () => 'blob:test', revokeObjectURL: value => revoked.push(value) }, Image, { createElement: () => canvas },
  );
  return { prepare, canvas, draws, revoked };
}

test('gallery files and camera data URLs use the same bounded JPEG processing', async () => {
  const env = setup();
  const file = await env.prepare(new Blob(['photo'], { type: 'image/png' }));
  const camera = await env.prepare('data:image/jpeg;base64,YQ==');
  assert.equal(file, camera);
  assert.deepEqual(env.draws, [[0, 0, 1280, 960], [0, 0, 1280, 960]]);
  assert.deepEqual(env.revoked, ['blob:test']);
  assert.ok(Buffer.byteLength(JSON.stringify({ image: file, limit: 5 })) < 1024 * 1024);
});

test('complex images reduce JPEG quality and dimensions until the complete JSON fits 1 MiB', async () => {
  const attempts = [];
  const env = setup({ encode: (canvas, quality) => {
    attempts.push([canvas.width, quality]);
    return 'data:image/jpeg;base64,' + 'a'.repeat(canvas.width >= 1280 ? 900000 : 600000);
  } });
  const image = await env.prepare(new Blob(['photo']));
  assert.deepEqual(attempts, [[1280, 0.9], [1280, 0.8], [1280, 0.7], [960, 0.9]]);
  assert.ok(Buffer.byteLength(JSON.stringify({ image, limit: 5 })) < 1024 * 1024);
});

test('small photos are not enlarged and invalid files release their object URLs', async () => {
  const small = setup({ width: 320, height: 240 });
  await small.prepare('data:image/jpeg;base64,YQ==');
  assert.equal(small.canvas.width, 320);
  assert.equal(small.canvas.height, 240);
  const invalid = setup({ broken: true });
  await assert.rejects(invalid.prepare(new Blob(['broken'])), /Gagal membaca gambar/);
  assert.deepEqual(invalid.revoked, ['blob:test']);
});
