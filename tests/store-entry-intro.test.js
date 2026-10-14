const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'store-entry-intro.js'), 'utf8');
function harness(options = {}) {
  const nodes = {};
  for (const id of ['store-entry-intro', 'store-intro-media', 'store-intro-audio', 'store-intro-skip', 'store-intro-sound', 'main', 'header']) {
    nodes[id] = {
      hidden: true, inert: false, paused: true, currentTime: 0, events: {}, attributes: {}, dataset: {}, textContent: '',
      classList: { names: new Set(), add(n) { this.names.add(n); }, remove(n) { this.names.delete(n); } },
      addEventListener(k, f) { this.events[k] = f; }, setAttribute(k, v) { this.attributes[k] = v; }, removeAttribute(k) { if (k === 'src') this.src = undefined; },
      focus() {}, contains() { return false; }, querySelector() { return null; },
      pause() { this.paused = true; }, play() { this.paused = false; return Promise.resolve(); },
    };
  }
  nodes['store-intro-media'].dataset = { src: 'media/store/emx-software-bio-boot.webp', duration: '4050' };
  let timeout;
  const delays = [];
  const store = new Map(options.seen ? [['emx-store-intro-seen', '1']] : []);
  vm.runInNewContext(source, {
    sessionStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)) },
    performance: { getEntriesByType: () => [{ type: options.navigation || 'navigate' }] },
    document: { getElementById: id => nodes[id], querySelector: s => nodes[s === 'main' ? 'main' : 'header'], referrer: options.internal ? 'https://emxtweaks.com/products.html' : '', activeElement: null, body: {}, documentElement: { classList: { add() {}, remove() {} } } },
    location: { origin: 'https://emxtweaks.com', hash: options.hash || '', search: options.search || '' },
    matchMedia: () => ({ matches: !!options.reduced }), URL, URLSearchParams, Date,
    setTimeout: (f, ms) => { timeout = f; delays.push(ms); return 1; }, clearTimeout() {},
  });
  return { nodes, get timeout() { return timeout; }, store, delays };
}
test('intro shows the animated image immediately with no play step and releases the shop when it ends', () => {
  const h = harness({ search: '?entry=bio' });
  const media = h.nodes['store-intro-media'];
  assert.equal(h.nodes['store-entry-intro'].hidden, false);
  assert.equal(h.nodes.main.inert, true);
  assert.equal(media.src, 'media/store/emx-software-bio-boot.webp');
  media.events.load();
  assert.equal(h.delays.at(-1), 4300);
  h.timeout();
  assert.equal(h.nodes.main.inert, false);
  assert.equal(h.nodes['store-entry-intro'].hidden, true);
});
test('skip, image errors and stalled loading all release the store', () => {
  for (const action of ['skip', 'error', 'timeout']) {
    const h = harness({ search: '?entry=bio' });
    if (action === 'skip') h.nodes['store-intro-skip'].events.click();
    else if (action === 'error') h.nodes['store-intro-media'].events.error();
    else h.timeout();
    assert.equal(h.nodes.main.inert, false);
    assert.equal(h.nodes['store-entry-intro'].hidden, true);
  }
});
test('the plain homepage plays once per session for outside arrivals; the bio link always plays', () => {
  const first = harness();
  assert.equal(first.nodes['store-entry-intro'].hidden, false);
  assert.equal(first.store.get('emx-store-intro-seen'), '1');
  for (const options of [{ seen: true }, { internal: true }, { navigation: 'reload' }, { navigation: 'back_forward' }, { hash: '#free-tools' }, { search: '?free=1' }, { reduced: true }]) assert.equal(harness(options).nodes['store-entry-intro'].hidden, true);
  for (const options of [{ search: '?entry=bio', internal: true }, { search: '?entry=bio', hash: '#emx-hub' }, { search: '?entry=bio', reduced: true }, { search: '?entry=bio&free=1' }]) assert.equal(harness(options).nodes['store-entry-intro'].hidden, true);
  assert.equal(harness({ search: '?entry=bio', seen: true }).nodes['store-entry-intro'].hidden, false);
  assert.equal(harness({ search: '?intro=1', internal: true }).nodes['store-entry-intro'].hidden, false);
});
test('sound is off by default and a tap toggles the boot audio', () => {
  const h = harness({ search: '?entry=bio' });
  const audio = h.nodes['store-intro-audio'];
  assert.equal(audio.paused, true);
  h.nodes['store-intro-sound'].events.click();
  assert.equal(audio.paused, false);
  assert.equal(h.nodes['store-intro-sound'].attributes['aria-pressed'], 'true');
  h.nodes['store-intro-sound'].events.click();
  assert.equal(audio.paused, true);
  h.nodes['store-intro-skip'].events.click();
  assert.equal(audio.paused, true);
});
