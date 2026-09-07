const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "controller.html"), "utf8");

test("controller landing links and local assets resolve", () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) assert.ok(ids.has(match[1]), match[1]);
  for (const match of html.matchAll(/\b(?:src|href)="(\/(?!\/)[^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, match[1])), match[1]);
  }
  assert.match(html, /https:\/\/payhip\.com\/b\/0STfj/);
  assert.match(html, /https:\/\/emxtweaks\.com\/license/);
  assert.match(html, /https:\/\/controller\.emxtweaks\.com\//);
});

test("controller subdomain routing preserves the main homepage", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  const route = config.rewrites.find(item => item.source === "/" && item.destination === "/controller.html");
  assert.deepEqual(route.has, [{ type: "host", value: "controller.emxtweaks.com" }]);
});

test("published controller entry keeps correct pricing and known-limit disclosure", () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "products.js"), "utf8"), context);
  const product = context.window.EMX_PRODUCTS.find(item => item.id === "emx_controller_macro");
  assert.equal(product.price, 20);
  assert.equal(product.key, "0STfj");
  assert.equal(product.visible, true);
  assert.match(html, /AVAILABLE NOW/); assert.match(html, /experimental, off by default/);
});
