const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("link hub keeps emxtweaks.com as the home route and preserves required destinations", () => {
  const home = read("index.html");
  const network = read("links.html");
  const manifest = JSON.parse(read("links.webmanifest"));
  assert.match(home, /<link rel="canonical" href="https:\/\/emxtweaks\.com\/">/);
  assert.match(home, /https:\/\/discord\.gg\/puaZFNfNKW/);
  assert.match(home, /ur_not_himfr/);
  assert.match(home, /https:\/\/www\.fortnite\.com\/@efect\.lit\?lang=en-US/);
  assert.match(home, /href="products\.html"/);
  assert.match(home, /href="links\.html"/);
  assert.match(home, /ALL TWEAKS, MACROS AND UTILITIES IN ONE PLACE/);
  assert.match(home, /EMX TWEAKS<br><em>HUB\.<\/em>/);
  assert.equal(manifest.start_url, "/");
  for (const subdomain of ["clips.emxtweaks.com", "support.emxtweaks.com", "activate.emxtweaks.com", "shareclips.emxtweaks.com", "notes.emxtweaks.com"]) assert.match(network, new RegExp(subdomain.replaceAll(".", "\\.")));
});

test("public headers share a persistent light and dark theme control", () => {
  const home = read("index.html");
  const affiliate = read("affiliate.html");
  const shell = read("site-shell.js");
  const foundation = read("foundation.js");
  const foundationStyles = read("foundation.css");
  const siteStyles = read("site.css");

  assert.match(home, /data-emx-theme-toggle/);
  assert.match(affiliate, /data-emx-theme-toggle/);
  assert.match(shell, /data-emx-theme-toggle/);
  assert.match(foundation, /localStorage\.setItem\(themeKey, nextTheme\)/);
  assert.match(foundation, /document\.documentElement\.dataset\.theme = nextTheme/);
  assert.match(foundationStyles, /:root\[data-theme="light"\]/);
  assert.match(siteStyles, /explicit component colors prevent white-on-white regressions/);
});
