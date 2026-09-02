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

test("public navigation routes free utilities through the hub and keeps personal Mail private", () => {
  const shell = read("site-shell.js");
  const home = read("index.html");
  assert.match(shell, /https:\/\/support\.emxtweaks\.com\//);
  assert.match(shell, /\["free", "\.\/index\.html\?free=1#free-tools", "Free"\]/);
  assert.match(shell, /\["links", "\.\/links\.html", "Network"\]/);
  assert.doesNotMatch(shell, /"\.\/labs\.html", "Labs"/);
  assert.match(shell, /https:\/\/activate\.emxtweaks\.com\/activate/);
  assert.doesNotMatch(shell, /href="\.\/license\.html"/);
  assert.doesNotMatch(shell, /mail\.emxtweaks\.com/);
  assert.match(home, /EMX TWEAKS HUB/);
  assert.match(home, /FREE UTILITIES &amp; APPLICATIONS/);
  assert.match(home, /EMX NETWORK/);
  assert.doesNotMatch(home, /EMX Mail/);
});

test("the hub exposes every current free release and Labs resolves to the free panel", () => {
  const home = read("index.html");
  const hubBehavior = read("link-hub.js");
  const products = read("products.js");
  const routing = read("vercel.json");
  const legacyClaim = read("license.html");

  for (const title of ["EMX Clips", "Window Deck", "EMX Aim Trainer", "Control Hub", "EMX Sprite Tracker"]) assert.match(home, new RegExp(title));
  assert.match(home, /id="free-tools"/);
  assert.match(home, /id="free-app-modal"/);
  assert.match(home, /data-free-app="sprite_tracker"/);
  assert.match(hubBehavior, /href: "https:\/\/payhip\.com\/b\/V90h5"/);
  assert.match(hubBehavior, /navigator\.clipboard/);
  assert.match(hubBehavior, /aria-expanded/);
  assert.match(hubBehavior, /showModal\(\)/);
  assert.match(hubBehavior, /window_deck/);
  assert.match(products, /id: "sprite_tracker"[\s\S]*?price: 0/);
  assert.match(products, /deliveryUrl: "https:\/\/payhip\.com\/b\/V90h5"/);
  assert.match(routing, /"source": "\/labs"[\s\S]*?"destination": "\/#free-tools"/);
  assert.match(routing, /"source": "\/license\.html"[\s\S]*?"destination": "https:\/\/activate\.emxtweaks\.com\/activate"/);
  assert.match(legacyClaim, /http-equiv="refresh" content="0;url=https:\/\/activate\.emxtweaks\.com\/activate"/);
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
