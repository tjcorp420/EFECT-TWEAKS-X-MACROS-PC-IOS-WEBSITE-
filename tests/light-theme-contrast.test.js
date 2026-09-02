const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("catalog light mode defines readable interactive and modal states", () => {
  const css = read("catalog.css");
  assert.match(css, /:root\[data-theme="light"\] \.filter-row button\[aria-pressed="true"\]/);
  assert.match(css, /background: linear-gradient\(135deg,#7d19bd,#ae39e9\)/);
  assert.match(css, /:root\[data-theme="light"\] \.product-card/);
  assert.match(css, /:root\[data-theme="light"\] \.product-dialog-tabs button\[aria-selected="true"\]/);
  assert.match(css, /:root\[data-theme="light"\] \.coming-soon-dialog/);
});

test("shared and comparison light modes override dark-only hover and data colors", () => {
  const site = read("site.css");
  const compare = read("compare.css");
  assert.match(site, /:root\[data-theme="light"\] \.site-footer a:hover/);
  assert.match(compare, /:root\[data-theme="light"\] \.compare-table thead th/);
  assert.match(compare, /:root\[data-theme="light"\] \.compare-cards dd/);
});

test("free Payhip releases use their verified delivery URL", () => {
  const catalog = read("catalog.js");
  const products = read("products.js");
  assert.match(catalog, /product\.deliveryUrl \|\| product\.productUrl \|\| "#"/);
  assert.match(products, /id: "sprite_tracker"[\s\S]*?deliveryUrl: "https:\/\/payhip\.com\/b\/V90h5"/);
});
