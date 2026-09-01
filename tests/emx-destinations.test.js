const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("EMX Clips is a free official download with current screenshots", () => {
  const products = read("products.js");
  assert.match(products, /id: "clips"[\s\S]*?price: 0,/);
  assert.match(products, /productUrl: "https:\/\/clips\.emxtweaks\.com\/"/);
  assert.match(products, /deliveryType: "external"/);
  assert.match(products, /version: "v1\.9\.4"/);
  assert.match(products, /emx-clips-capture-ingame\.png/);
  assert.doesNotMatch(products, /payhip\.com\/b\/8vBPZ/);
});

test("public navigation exposes Clips and Support but keeps personal Mail private", () => {
  const shell = read("site-shell.js");
  const home = read("index.html");
  assert.match(shell, /https:\/\/support\.emxtweaks\.com\//);
  assert.match(shell, /https:\/\/clips\.emxtweaks\.com\//);
  assert.doesNotMatch(shell, /mail\.emxtweaks\.com/);
  assert.match(home, /Open EMX Clips/);
  assert.match(home, /Open support/);
  assert.doesNotMatch(home, /EMX Mail/);
});

test("coming-soon previews are accessible and do not invent release details", () => {
  const page = read("products.html");
  const behavior = read("coming-soon.js");
  assert.equal((page.match(/data-coming-soon-title=/g) || []).length, 3);
  assert.match(page, /No placeholder checkout or preorder/);
  assert.match(page, /No release date until the app is tested/);
  assert.match(behavior, /textContent/);
  assert.match(behavior, /showModal\(\)/);
});
