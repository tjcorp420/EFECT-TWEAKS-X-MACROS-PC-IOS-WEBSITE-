const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Suggest an app stays on emxtweaks.com and opens a dedicated idea section", () => {
  const products = read("products.html");
  const contact = read("contact.html");

  assert.match(products, /href="\.\/contact\.html#suggest-app"[^>]*>Suggest an app/);
  assert.match(contact, /id="suggest-app"/);
  assert.match(contact, /subject=EMX%20App%20Idea/);
  assert.doesNotMatch(products, /support\.emxtweaks\.com\/\?category=Feature%20request/);
});
