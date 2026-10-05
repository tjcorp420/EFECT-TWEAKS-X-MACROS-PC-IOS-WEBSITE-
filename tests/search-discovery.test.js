const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const sitemap = read("sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

test("sitemap exposes unique canonical public pages without private or redirect routes", () => {
  assert.ok(urls.length >= 15);
  assert.equal(new Set(urls).size, urls.length);
  const rewrites = JSON.parse(read("vercel.json")).rewrites;
  for (const value of urls) {
    const url = new URL(value);
    assert.equal(url.origin, "https://emxtweaks.com");
    assert.equal(url.search, "");
    assert.equal(url.hash, "");
    assert.doesNotMatch(url.pathname, /admin|account|license|labs|store-funnel|\/api\//);
    const file = url.pathname === "/" ? "index.html" :
      url.pathname.endsWith(".html") ? url.pathname.slice(1) :
      rewrites.find((route) => route.source === url.pathname)?.destination.slice(1);
    assert.ok(file, `Missing route for ${value}`);
    const source = read(file);
    assert.doesNotMatch(source, /name="robots"[^>]*content="[^"]*noindex/);
    const canonical = source.match(/<link\s+[^>]*rel="canonical"[^>]*href="([^"]+)"/s);
    assert.equal(canonical?.[1], value);
    assert.match(source, /property="og:site_name" content="EMX TWEAKS"/);
    assert.ok(source.includes(`property="og:url" content="${value}"`));
    for (const property of ["og:title", "og:description", "og:image"]) {
      assert.ok(source.includes(`property="${property}"`));
    }
  }
});

test("robots advertises the sitemap and leaves public assets crawlable", () => {
  const robots = read("robots.txt");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/emxtweaks\.com\/sitemap\.xml/);
  assert.doesNotMatch(robots, /^Disallow: \/$/m);
});
