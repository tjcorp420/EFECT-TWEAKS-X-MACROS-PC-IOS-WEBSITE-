const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "storefront-intro.js"),
  "utf8",
);

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

async function renderIntro({
  navigationType = "navigate",
  referrer = "",
  reduced = false,
  search = "",
  session = {},
} = {}) {
  let ready;
  const appended = [];
  class FakeElement {
    constructor() {
      this.attributes = {};
      this.classList = { add() {}, remove() {} };
      this.styleValues = {};
      this.style = {
        setProperty: (key, value) => {
          this.styleValues[key] = value;
        },
      };
      this.innerHTML = "";
    }
    setAttribute(key, value) {
      this.attributes[key] = value;
    }
    querySelector() {
      return { addEventListener() {}, focus() {} };
    }
    remove() {}
  }
  const products = [
    {
      id: "optimizer",
      title: "Retired Optimizer",
      image: "./optimizer.png",
      visible: true,
      showInIntro: true,
      publishStatus: "published",
      introOrder: 1,
    },
    {
      id: "custom_os",
      title: "EMX Custom OS",
      image: "./emx-custom-os-hero.png",
      visible: true,
      showInIntro: true,
      publishStatus: "published",
      introOrder: 2,
    },
    {
      id: "windows_tweak_dashboard",
      title: "EMX Windows Tweak Dashboard",
      image: "./tweak.png",
      visible: true,
      showInIntro: true,
      publishStatus: "published",
      introOrder: 3,
    },
    {
      id: "clips",
      title: "EMX Clips",
      image: "./clips.png",
      visible: true,
      showInIntro: true,
      publishStatus: "published",
      introOrder: 4,
    },
    {
      id: "volt",
      title: "EMX VOLT",
      image: "./volt.png",
      visible: true,
      showInIntro: true,
      publishStatus: "published",
      introOrder: 5,
    },
    {
      id: "fps",
      title: "EMX FPS Booster",
      image: "./fps.png",
      visible: true,
      showInIntro: true,
      publishStatus: "published",
      introOrder: 6,
    },
  ];
  const document = {
    referrer,
    readyState: "loading",
    activeElement: null,
    body: {
      appendChild(element) {
        appended.push(element);
      },
    },
    documentElement: { classList: { add() {}, remove() {} } },
    createElement() {
      return new FakeElement();
    },
    addEventListener(type, callback) {
      if (type === "DOMContentLoaded") ready = callback;
    },
    removeEventListener() {},
  };
  const sandbox = {
    URL,
    URLSearchParams,
    console,
    document,
    HTMLElement: FakeElement,
    localStorage: storage(),
    sessionStorage: storage(session),
    location: { origin: "https://emx.example", search },
    matchMedia: () => ({ matches: reduced }),
    performance: { getEntriesByType: () => [{ type: navigationType }] },
    requestAnimationFrame: (callback) => callback(),
    setTimeout: () => 1,
    clearTimeout() {},
    fetch: async (url) => ({
      ok: true,
      async json() {
        return String(url).includes("site-settings")
          ? {
              settings: {
                introEnabled: true,
                introDurationMs: 7600,
                replayMode: "session",
                replayHours: 24,
                allowSkip: true,
                tagline: "ENGINEERED FOR YOUR SETUP",
              },
            }
          : products;
      },
    }),
    window: null,
  };
  sandbox.window = { EMX_PRODUCTS: products, setTimeout: sandbox.setTimeout };
  vm.runInNewContext(source, sandbox, { filename: "storefront-intro.js" });
  await ready();
  return appended;
}

test("cinematic intro excludes retired optimizer imagery and keeps four flagship scenes", async () => {
  const [intro] = await renderIntro();
  assert.ok(intro);
  assert.doesNotMatch(intro.innerHTML, /Retired Optimizer|optimizer\.png/i);
  assert.match(intro.innerHTML, /EMX Custom OS/);
  assert.match(intro.innerHTML, /emx-custom-os-overview-960\.webp/);
  assert.equal(
    (intro.innerHTML.match(/class="cinematic-product"/g) || []).length,
    4,
  );
  assert.equal(intro.styleValues["--intro-duration"], "17000ms");
});

test("a deliberate desktop reload replays the intro even after session memory", async () => {
  const appended = await renderIntro({
    navigationType: "reload",
    referrer: "https://emx.example/products.html",
    session: { emx_intro_session: String(Date.now()) },
  });
  assert.equal(appended.length, 1);
});

test("a fresh desktop entry plays even when an older session marker exists", async () => {
  const appended = await renderIntro({
    navigationType: "navigate",
    referrer: "https://search.example/results",
    session: { emx_intro_session: String(Date.now()) },
  });
  assert.equal(appended.length, 1);
});

test("same-site navigation does not repeatedly interrupt the visitor", async () => {
  const appended = await renderIntro({
    navigationType: "navigate",
    referrer: "https://emx.example/products.html",
    session: { emx_intro_session: String(Date.now()) },
  });
  assert.equal(appended.length, 0);
});

test("the explicit intro preview URL works even with reduced motion enabled", async () => {
  const appended = await renderIntro({ reduced: true, search: "?intro=1" });
  assert.equal(appended.length, 1);
});

test("a fresh desktop entry is not hidden by the browser motion preference", async () => {
  const [intro] = await renderIntro({ reduced: true });
  assert.ok(intro);
  assert.match(intro.className, /force-motion/);
});
