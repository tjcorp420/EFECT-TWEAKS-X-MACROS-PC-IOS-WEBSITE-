const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "affiliate.html"), "utf8");
const program = fs.readFileSync(
  path.join(root, "api", "_lib", "affiliate-program.js"),
  "utf8",
);

test("affiliate application explains the referral code and post-application flow", () => {
  assert.match(page, /This is not a code you need to find\./);
  assert.match(page, /efect-macros-x-tweaks\.vercel\.app\/r\//);
  assert.match(page, /there is no approval wait/);
  assert.match(page, /No separate selling approval is required/);
  assert.match(page, /Customers pay EMX/);
  assert.match(page, /\$0 conversion/);
  assert.match(page, /payouts are recorded after EMX sends them separately/i);
  assert.doesNotMatch(page, /sale becomes eligible only after approval/i);
  assert.match(program, /status:\s*"active"/);
});
