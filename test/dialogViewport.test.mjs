import test from 'node:test';
import assert from 'node:assert/strict';
import { bindDialogViewport } from '../src/lib/dialogViewport.js';

function setup({ visual = true } = {}) {
  const styles = new Map();
  const content = Object.assign(new EventTarget(), {
    style: { setProperty: (key,value) => styles.set(key,value), removeProperty: key => styles.delete(key) },
    contains: target => target === field,
  });
  const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0 });
  const media = Object.assign(new EventTarget(), { matches: true });
  const scroller = { scrollTop: 0, getBoundingClientRect: () => ({ top: 100, bottom: 500 }), querySelector: () => null };
  const field = { matches: () => true, closest: () => scroller, getBoundingClientRect: () => ({ top: 450, bottom: 490 }) };
  let pending;
  const browser = Object.assign(new EventTarget(), {
    visualViewport: visual ? viewport : undefined, innerHeight: 844,
    matchMedia: () => media, document: { activeElement: null },
    requestAnimationFrame: callback => { pending = callback; return 1; },
    cancelAnimationFrame: () => { pending = null; },
    getComputedStyle: () => ({ position: 'static' }),
  });
  return { styles, content, viewport, media, browser, field, scroller, flush: () => { const callback = pending; pending = null; callback?.(); } };
}

test('modal uses the visible keyboard viewport on first open, adjusts when panned, and restores on close', () => {
  const env = setup();
  env.viewport.height = 430;
  const cleanup = bindDialogViewport(env.content, env.browser);
  assert.equal(env.styles.get('--dialog-viewport-height'), '430px');
  assert.equal(env.styles.get('--dialog-viewport-bottom'), '414px');
  env.viewport.offsetTop = 35;
  env.viewport.dispatchEvent(new Event('scroll')); env.flush();
  assert.equal(env.styles.get('--dialog-viewport-top'), '35px');
  assert.equal(env.styles.get('--dialog-viewport-bottom'), '379px');
  env.viewport.height = 844; env.viewport.offsetTop = 0;
  env.viewport.dispatchEvent(new Event('resize')); env.flush();
  assert.equal(env.styles.get('--dialog-viewport-bottom'), '0px');
  cleanup();
  assert.equal(env.styles.size, 0);
  env.viewport.dispatchEvent(new Event('resize')); env.flush();
  assert.equal(env.styles.size, 0);
});

test('focus scrolls only the form body to keep a field above the keyboard and sticky footer', () => {
  const env = setup();
  env.viewport.height = 430;
  const footer = { contains: () => false, getBoundingClientRect: () => ({ top: 380 }) };
  env.scroller.querySelector = () => footer;
  env.browser.getComputedStyle = () => ({ position: 'sticky' });
  env.browser.document.activeElement = env.field;
  const cleanup = bindDialogViewport(env.content, env.browser);
  assert.equal(env.scroller.scrollTop, 122);
  cleanup();
});

test('desktop keeps its original sizing and browsers without VisualViewport use the resized window', () => {
  const env = setup({ visual: false });
  env.browser.innerHeight = 420;
  const cleanup = bindDialogViewport(env.content, env.browser);
  assert.equal(env.styles.get('--dialog-viewport-height'), '420px');
  assert.equal(env.styles.get('--dialog-viewport-bottom'), '0px');
  env.media.matches = false;
  env.media.dispatchEvent(new Event('change')); env.flush();
  assert.equal(env.styles.size, 0);
  cleanup();
});


test('initial opening animation resizes the modal before scrolling the focused field', () => {
  const env = setup();
  env.viewport.height = 430;
  env.browser.document.activeElement = env.field;
  let running = true;
  env.content.getAnimations = () => running ? [{ playState: 'running', effect: { target: env.content } }] : [];
  const cleanup = bindDialogViewport(env.content, env.browser);
  assert.equal(env.styles.get('--dialog-viewport-height'), '430px');
  assert.equal(env.scroller.scrollTop, 0);
  running = false;
  env.content.dispatchEvent(new Event('animationend')); env.flush();
  assert.equal(env.scroller.scrollTop, 72);
  cleanup();
});
