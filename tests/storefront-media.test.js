const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
test("release labels follow catalog versions and preserve unknown fallbacks", () => {
  const labels = [
    { dataset: { productVersion: "volt" }, textContent: "old" },
    { dataset: { productVersion: "missing" }, textContent: "fallback" },
  ];
  vm.runInNewContext(
    fs.readFileSync(path.join(root, "release-versions.js"), "utf8"),
    {
      window: { EMX_PRODUCTS: [{ id: "volt", version: "v9.8.7" }] },
      document: { querySelectorAll: () => labels },
    },
  );
  assert.equal(labels[0].textContent, "v9.8.7");
  assert.equal(labels[1].textContent, "fallback");
});
test("shopping pages keep policy navigation without the large warning banner", () => {
  for (const name of ["products.html", "bundles.html", "macros.html"]) {
    const html = fs.readFileSync(path.join(root, name), "utf8");
    assert.doesNotMatch(html, /class="buy-policy"/);
    assert.match(html, /data-site-footer/);
  }
  const shell = fs.readFileSync(path.join(root, "site-shell.js"), "utf8");
  assert.match(shell, /refunds\.html/);
  assert.match(shell, /eula\.html/);
});
test("macro and bundle previews reference current supplied screenshots", () => {
  for (const name of ["macros.html", "bundles.html"]) {
    const html = fs.readFileSync(path.join(root, name), "utf8");
    assert.doesNotMatch(html, /volt-current|v0\.1\.7[23]/);
    assert.match(html, /emx-volt-v0\.1\.76\/dashboard\.png/);
    for (const match of html.matchAll(/(?:src|data-src)="(assets\/[^"?]+)"/g))
      assert.ok(fs.existsSync(path.join(root, match[1])), match[1]);
  }
});
