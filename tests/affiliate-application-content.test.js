const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "affiliate.html"), "utf8");

test("affiliate application explains the referral code and post-application flow", () => {
  assert.match(page, /This is not a code you need to find\./);
  assert.match(page, /efect-macros-x-tweaks\.vercel\.app\/r\//);
  assert.match(page, /Your dashboard opens immediately/);
  assert.match(page, /EMX reviews the account and sets the commission rate/);
  assert.match(page, /\$0 conversion/);
  assert.match(page, /Payouts are recorded after EMX sends them separately/);
});
