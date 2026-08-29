const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const affiliate = require("../api/_lib/affiliate-program");
const license = require("../api/_lib/license-automation");
const { secretMatches } = require("../api/_lib/admin-auth");
const { signatureOk } = require("../api/product-upload");
const siteSettings = require("../api/site-settings");

test("affiliate inputs are normalized at the trust boundary", () => {
  assert.equal(affiliate.normalizeEmail("  Creator@Example.COM "), "creator@example.com");
  assert.equal(affiliate.normalizeDisplayName(" <EMX>   Creator "), "EMX Creator");
  assert.equal(affiliate.normalizeCode(" EMX Creator!! "), "emx-creator");
  assert.equal(affiliate.normalizeCode("---A---B---"), "a-b");
});

test("affiliate password policy rejects weak credentials", () => {
  assert.match(affiliate.validatePassword("short"), /10 and 128 characters/i);
  assert.match(affiliate.validatePassword("abcdefghijkl"), /number/i);
  assert.match(affiliate.validatePassword("123456789012"), /letter/i);
  assert.equal(affiliate.validatePassword("strong-password-42"), "");
});

test("referral code extraction only accepts explicit metadata", () => {
  assert.equal(affiliate.extractReferralCode({ metadata: { emx_ref: "EMX-Creator" } }), "emx-creator");
  assert.equal(affiliate.extractReferralCode({ emx_ref: "second-code" }), "second-code");
  assert.equal(affiliate.extractReferralCode({ affiliate: "legacy" }), "");
});

test("current Payhip product keys map to the correct EMX licenses", () => {
  assert.deepEqual(license.getProductMap().TJFav, ["EMX_TWEAK_DASHBOARD"]);
  assert.deepEqual(license.getProductMap().Oqz73, ["EMX_VOLT"]);
  assert.deepEqual(license.getProductMap().By7FV, ["EMX_TWEAK_DASHBOARD", "EMX_VOLT"]);
});

test("cumulative refunds reverse only the new commission amount", () => {
  const conversion = { grossCents: 2000, commissionCents: 400, reversedCommissionCents: 100 };
  assert.deepEqual(affiliate.calculateRefundAdjustment(conversion, 1000, 2000), {
    originalCents: 2000,
    refundedCents: 1000,
    totalReversedCommissionCents: 200,
    deltaCommissionCents: 100,
    full: false
  });
  const repeated = affiliate.calculateRefundAdjustment({ ...conversion, reversedCommissionCents: 200 }, 1000, 2000);
  assert.equal(repeated.deltaCommissionCents, 0);
});

test("Payhip webhook signatures follow the configured API key digest", () => {
  const previous = process.env.PAYHIP_API_KEY;
  process.env.PAYHIP_API_KEY = "test-only-key";
  const signature = crypto.createHash("sha256").update("test-only-key").digest("hex");
  assert.deepEqual(license.verifyPayhipSignature({ signature }), { ok: true });
  assert.equal(license.verifyPayhipSignature({ signature: "bad" }).ok, false);
  if (previous === undefined) delete process.env.PAYHIP_API_KEY;
  else process.env.PAYHIP_API_KEY = previous;
});

test("admin credentials use length-safe constant-time comparison", () => {
  assert.equal(secretMatches("correct-secret", "correct-secret"), true);
  assert.equal(secretMatches("correct-secret", "wrong-secret"), false);
  assert.equal(secretMatches("correct-secret", "x"), false);
  assert.equal(secretMatches("", ""), false);
});

test("product upload validation checks file signatures instead of MIME alone", () => {
  assert.equal(signatureOk(Buffer.from([0x50, 0x4b, 0x03, 0x04]), "zip"), true);
  assert.equal(signatureOk(Buffer.from([0x4d, 0x5a, 0x00, 0x00]), "exe"), true);
  assert.equal(signatureOk(Buffer.from("not-an-executable"), "exe"), false);
});

test("storefront motion settings are bounded and sanitized", () => {
  const settings = siteSettings.normalize({ introDurationMs: 99999, replayMode: "invalid", tagline: "<EMX>", replayHours: 0 });
  assert.equal(settings.introDurationMs, 12000);
  assert.equal(settings.replayMode, "session");
  assert.equal(settings.tagline, "EMX");
  assert.equal(settings.replayHours, 24);
});
