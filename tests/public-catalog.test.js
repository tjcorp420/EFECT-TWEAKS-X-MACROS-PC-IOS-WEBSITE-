const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function context(fetch, seeds = []) {
  const ctx = { window: { EMX_PRODUCTS: seeds }, location: { href: "https://emxtweaks.com/compare.html" }, URL, AbortController, setTimeout, clearTimeout, fetch, Intl };
  vm.runInNewContext(fs.readFileSync(path.join(root, "public-catalog.js"), "utf8"), ctx);
  return ctx.window.EMXPublicCatalog;
}
test("public catalog excludes unpublished and malformed records", () => {
  const api = context();
  const base = { id: "app", title: "App" };
  const items = [base, null, {}, { ...base, visible: false }, { ...base, retired: true }, ...["draft", "archived", "coming-soon"].map((publishStatus) => ({ ...base, publishStatus }))];
  assert.equal(api.publicProducts(items).length, 1);
});
test("successful empty live catalog never resurrects fallback listings", async () => {
  const api = context(async () => ({ ok: true, json: async () => [] }), [{ id: "seed", title: "Seed" }]);
  const result = await api.load();
  assert.equal(result.fallback, false);
  assert.equal(result.products.length, 0);
});
test("network and invalid payload failures use filtered fallback", async () => {
  for (const fetch of [async () => { throw new Error("offline"); }, async () => ({ ok: true, json: async () => ({ products: [] }) })]) {
    const api = context(fetch, [{ id: "public", title: "Public" }, { id: "private", title: "Private", publishStatus: "draft" }]);
    const result = await api.load();
    assert.equal(result.fallback, true);
    assert.equal(result.products.length, 1);
  }
});
test("catalog links reject active protocols and preserve safe URLs", () => {
  const api = context();
  assert.equal(api.safeUrl("javascript:alert(1)"), "");
  assert.equal(api.safeUrl("data:text/html,test"), "");
  assert.equal(api.safeUrl(""), "");
  assert.equal(api.safeUrl("./help.html"), "https://emxtweaks.com/help.html");
});
test("bundled Tweaks Pro remains private for offline storefronts", () => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "products.js"), "utf8"), ctx);
  const pro = ctx.window.EMX_PRODUCTS.find((item) => item.id === "emx_tweaks_pro");
  assert.equal(pro.visible, false);
  assert.equal(pro.publishStatus, "draft");
});

test("Payhip reconciliation hides withdrawn listings and includes ReelFree", () => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "products.js"), "utf8"), ctx);
  const api = context();
  const publicItems = api.publicProducts(ctx.window.EMX_PRODUCTS);
  for (const id of ["control_hub", "window_deck", "emx_tweaks_pro"]) {
    assert.equal(publicItems.some((item) => item.id === id), false);
  }
  const reel = publicItems.find((item) => item.id === "emx_reelfree");
  assert.equal(reel.price, 1);
  assert.equal(reel.productUrl, "https://payhip.com/b/LJsj3");
  assert.equal(reel.deliveryType, "external");
});

test("shared navigation promotes free Clips and keeps menus above page content", () => {
  const shell = fs.readFileSync(path.join(root, "site-shell.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "site.css"), "utf8");
  assert.match(shell, /\["clips", "https:\/\/clips\.emxtweaks\.com\/", "Clips · Free"\]/);
  assert.match(shell, /class="site-clips-link"/);
  assert.match(css, /body:not\(\.deck-page\) \.site-header \{ position: relative; z-index: 50; \}/);
});
