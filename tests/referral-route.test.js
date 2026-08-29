const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));

test("referral routes keep attribution while homepage assets resolve from root", () => {
  assert.match(index, /<base href="\/">/);
  assert.ok(
    vercel.rewrites.some(
      route => route.source === "/r/:creator" && route.destination === "/index.html",
    ),
  );
  const documentBase = new URL("/", "https://efect-macros-x-tweaks.vercel.app/r/tester");
  assert.equal(new URL("foundation.css", documentBase).pathname, "/foundation.css");
  assert.equal(new URL("affiliate-ref.js", documentBase).pathname, "/affiliate-ref.js");
});
