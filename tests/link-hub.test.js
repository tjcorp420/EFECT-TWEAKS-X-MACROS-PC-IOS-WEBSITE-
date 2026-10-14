const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("link hub keeps emxtweaks.com as the home route and preserves required destinations", () => {
  const home = read("index.html");
  const network = read("links.html");
  const manifest = JSON.parse(read("links.webmanifest"));
  assert.match(
    home,
    /<link rel="canonical" href="https:\/\/emxtweaks\.com\/"\s*\/?>/,
  );
  assert.match(home, /https:\/\/discord\.gg\/puaZFNfNKW/);
  assert.match(home, /ur_not_himfr/);
  assert.match(home, /https:\/\/www\.fortnite\.com\/@efect\.lit\?lang=en-US/);
  assert.match(home, /href="products\.html"/);
  assert.match(home, /href="links\.html"/);
  assert.match(home, /ONE LINK · EVERY OFFICIAL EMX DESTINATION/);
  assert.match(home, /Built beyond/);
  assert.match(home, /Explore software/);
  assert.match(home, /assets\/brand\/emx-software-mark\.png/);
  assert.match(home, /Microsoft Store and Chrome Web Store releases are in preparation/);
  assert.match(home, /Developer verification in progress/);
  assert.doesNotMatch(home, /id="(?:emx-splash|store-entry-intro)"/);
  assert.equal(manifest.start_url, "/");
  for (const subdomain of [
    "clips.emxtweaks.com",
    "support.emxtweaks.com",
    "activate.emxtweaks.com",
    "shareclips.emxtweaks.com",
    "notes.emxtweaks.com",
  ])
    assert.match(network, new RegExp(subdomain.replaceAll(".", "\\.")));
});

test("featured software uses current catalog records in the requested order", () => {
  const featured = read("storefront-home.js");
  const catalog = read("products.js");
  const ids = ["volt", "emx_desktop_flow_lite", "windows_tweak_dashboard", "clips"];
  for (const id of ids) assert.match(catalog, new RegExp(`id: "${id}"`));
  const positions = ids.map((id) => featured.indexOf(`${id}: [`));
  assert.ok(positions.every((position) => position >= 0));
  assert.ok(positions.every((position, index) => index === 0 || positions[index - 1] < position));
  assert.match(featured, /p\.visible !== false/);
  assert.match(featured, /p\.publishStatus !== "draft"/);
});

test("future marketplaces are labeled without linking to unpublished listings", () => {
  const home = read("index.html");
  const shell = read("site-shell.js");
  assert.match(home, /MICROSOFT STORE[\s\S]*?Coming soon/);
  assert.match(home, /CHROME WEB STORE[\s\S]*?Coming soon/);
  assert.doesNotMatch(home, /apps\.microsoft\.com\/detail|chromewebstore\.google\.com\/detail/);
  assert.doesNotMatch(shell, /\["account",/);
  assert.ok(fs.existsSync(path.join(root, "account.html")));
});

test("new discovery paths retain the existing software and support pages", () => {
  const routing = JSON.parse(read("vercel.json"));
  const target = (source) => routing.rewrites.find((route) => route.source === source)?.destination;
  assert.equal(target("/software"), "/products.html");
  assert.equal(target("/extensions"), "/extensions.html");
  assert.equal(target("/support"), "/help.html");
  const extensions = read("extensions.html");
  assert.match(extensions, /no published EMX Chrome extension listing/);
  assert.match(extensions, /no EMX app listing is published/);
});

test("public headers share a persistent light and dark theme control", () => {
  const home = read("index.html");
  const affiliate = read("affiliate.html");
  const shell = read("site-shell.js");
  const foundation = read("foundation.js");
  const foundationStyles = read("foundation.css");
  const siteStyles = read("site.css");

  assert.match(home, /data-site-header/);
  assert.match(affiliate, /data-emx-theme-toggle/);
  assert.match(shell, /data-emx-theme-toggle/);
  assert.match(foundation, /localStorage\.setItem\(themeKey, nextTheme\)/);
  assert.match(
    foundation,
    /document\.documentElement\.dataset\.theme = nextTheme/,
  );
  assert.match(foundationStyles, /:root\[data-theme="light"\]/);
  assert.match(
    siteStyles,
    /explicit component colors prevent white-on-white regressions/,
  );
});
