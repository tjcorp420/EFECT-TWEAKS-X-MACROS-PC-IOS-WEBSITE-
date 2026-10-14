const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function element(tag) {
  return {
    tag,
    children: [],
    dataset: {},
    attributes: {},
    style: { setProperty() {} },
    classList: { names: new Set(), add(n) { this.names.add(n); } },
    hidden: false,
    textContent: "",
    append(...nodes) { this.children.push(...nodes); },
    replaceChildren(...nodes) { this.children = nodes; },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener() {},
  };
}
const flatten = (node) => [node, ...(node.children || []).flatMap(flatten)];

function renderFeatured() {
  const nodes = { "store-featured": element("div"), "featured-status": element("p"), "store-bundle": element("section") };
  const context = {
    window: {},
    document: {
      getElementById: (id) => nodes[id],
      createElement: element,
      querySelectorAll: () => [],
    },
    fetch: () => Promise.reject(new Error("offline")),
    AbortSignal: { timeout: () => undefined },
    Intl,
  };
  context.window.window = context.window;
  vm.runInNewContext(read("products.js"), context);
  context.window.EMX_PRODUCTS ||= context.EMX_PRODUCTS;
  vm.runInNewContext(read("storefront-home.js"), context);
  return { nodes, products: context.window.EMX_PRODUCTS };
}

test("featured display cases render catalog facts and prices without inventing values", () => {
  const { nodes, products } = renderFeatured();
  const cards = nodes["store-featured"].children;
  assert.deepEqual(cards.map((card) => card.dataset.storeProduct), ["emx_desktop_flow_lite", "emx_taskbar_studio", "volt", "windows_tweak_dashboard", "clips"]);
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  for (const card of cards) {
    const product = products.find((item) => item.id === card.dataset.storeProduct);
    const parts = flatten(card);
    const price = parts.find((node) => node.className === "store-product-price");
    assert.equal(price.textContent, Number(product.price) <= 0 ? "Free" : money.format(product.price));
    const struck = price.children.find((node) => node.tag === "del");
    assert.equal(Boolean(struck), Number(product.oldPrice || 0) > Number(product.price || 0));
    const facts = parts.filter((node) => node.tag === "dd").map((node) => node.textContent);
    assert.deepEqual(facts, [product.version, product.platform].filter(Boolean));
    const link = parts.find((node) => node.dataset?.storeProductLink);
    assert.equal(link.href, `products.html#product-${product.id}`);
  }
  assert.match(nodes["featured-status"].textContent, /saved catalog/);
});

test("showroom scene is decorative and every control stays real HTML", () => {
  const home = read("index.html");
  const css = read("software-redesign.css");
  assert.match(home, /<div class="showroom-scene" aria-hidden="true">/);
  assert.match(home, /<h1 id="store-title"><em>EMX<\/em> Software\.<\/h1>/);
  assert.match(home, /assets\/brand\/emx-software-wordmark-1200\.webp/);
  assert.match(home, /<nav class="store-paths" aria-label="Explore EMX Software">/);
  assert.match(css, /\.showroom-scene \{[^}]*pointer-events: none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /html\.store-intro-active \.store-hero \*/);
  const scene = home.slice(home.indexOf('class="showroom-scene"'), home.indexOf('class="store-hero-copy"'));
  assert.doesNotMatch(scene, /<(?:a|button|input|select)\b/);
  assert.doesNotMatch(home, /apps\.microsoft\.com|chromewebstore\.google\.com/);
});

test("showroom motion is skipped for reduced-motion visitors", () => {
  for (const reduce of [true, false]) {
    const classes = new Set();
    const listeners = [];
    const context = {
      document: {
        documentElement: { classList: { add: (name) => classes.add(name) }, addEventListener() {} },
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: (type) => listeners.push(type),
      },
      matchMedia: (query) => ({ matches: query.includes("reduce") ? reduce : false }),
      addEventListener() {},
      window: { scrollY: 0 },
      IntersectionObserver: class { observe() {} unobserve() {} },
    };
    vm.runInNewContext(read("software-showroom.js"), context);
    assert.equal(classes.has("showroom-motion"), !reduce);
  }
});
