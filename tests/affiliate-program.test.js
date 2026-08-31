const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const affiliate = require("../api/_lib/affiliate-program");
const license = require("../api/_lib/license-automation");
const { secretMatches } = require("../api/_lib/admin-auth");
const { signatureOk } = require("../api/product-upload");
const siteSettings = require("../api/site-settings");

test("affiliate inputs are normalized at the trust boundary", () => {
  assert.equal(
    affiliate.normalizeEmail("  Creator@Example.COM "),
    "creator@example.com",
  );
  assert.equal(
    affiliate.normalizeDisplayName(" <EMX>   Creator "),
    "EMX Creator",
  );
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
  assert.equal(
    affiliate.extractReferralCode({ metadata: { emx_ref: "EMX-Creator" } }),
    "emx-creator",
  );
  assert.equal(
    affiliate.extractReferralCode({ emx_ref: "second-code" }),
    "second-code",
  );
  assert.equal(affiliate.extractReferralCode({ affiliate: "legacy" }), "");
});

test("current Payhip product keys map to the correct EMX licenses", () => {
  assert.deepEqual(license.getProductMap().TJFav, ["EMX_TWEAK_DASHBOARD"]);
  assert.deepEqual(license.getProductMap().Oqz73, ["EMX_VOLT"]);
  assert.deepEqual(license.getProductMap().By7FV, [
    "EMX_TWEAK_DASHBOARD",
    "EMX_VOLT",
  ]);
});

test("cumulative refunds reverse only the new commission amount", () => {
  const conversion = {
    grossCents: 2000,
    commissionCents: 400,
    reversedCommissionCents: 100,
  };
  assert.deepEqual(
    affiliate.calculateRefundAdjustment(conversion, 1000, 2000),
    {
      originalCents: 2000,
      refundedCents: 1000,
      totalReversedCommissionCents: 200,
      deltaCommissionCents: 100,
      full: false,
    },
  );
  const repeated = affiliate.calculateRefundAdjustment(
    { ...conversion, reversedCommissionCents: 200 },
    1000,
    2000,
  );
  assert.equal(repeated.deltaCommissionCents, 0);
});

test("Payhip webhook signatures follow the configured API key digest", () => {
  const previous = process.env.PAYHIP_API_KEY;
  process.env.PAYHIP_API_KEY = "test-only-key";
  const signature = crypto
    .createHash("sha256")
    .update("test-only-key")
    .digest("hex");
  assert.deepEqual(license.verifyPayhipSignature({ signature }), { ok: true });
  assert.equal(license.verifyPayhipSignature({ signature: "bad" }).ok, false);
  if (previous === undefined) delete process.env.PAYHIP_API_KEY;
  else process.env.PAYHIP_API_KEY = previous;
});

test("VOLT synchronization reuses the shared EMX key and enforces one device", async () => {
  const previousFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true, created: true, licenseId: "abc123" }),
    };
  };

  try {
    const result = await license.syncVoltLicense(
      {
        licenseKey: "emx-aaaaa-bbbbb-ccccc-ddddd",
        ownerEmail: " Buyer@Example.com ",
        productIds: ["EMX_VOLT"],
      },
      {
        endpoint: "https://volt.example/",
        secret: "test-sync-secret",
      },
    );

    assert.equal(result.status, "synced");
    assert.equal(request.url, "https://volt.example/internal/licenses/sync");
    assert.equal(request.options.headers.authorization, "Bearer test-sync-secret");
    assert.deepEqual(JSON.parse(request.options.body), {
      licenseKey: "EMX-AAAAA-BBBBB-CCCCC-DDDDD",
      ownerEmail: "buyer@example.com",
      plan: "lifetime",
      maxDevices: 1,
    });
  } finally {
    global.fetch = previousFetch;
  }
});

test("VOLT synchronization is skipped for orders without a VOLT entitlement", async () => {
  const result = await license.syncVoltLicense({
    licenseKey: "EMX-AAAAA-BBBBB-CCCCC-DDDDD",
    ownerEmail: "buyer@example.com",
    productIds: ["EMX_OS"],
  });
  assert.deepEqual(result, { status: "skipped", reason: "volt-not-in-order" });
});

test("unified synchronization sends every purchased entitlement with one device", async () => {
  const previousFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        created: true,
        licenseId: "abc123",
        productIds: ["EMX_TWEAK_DASHBOARD", "EMX_VOLT"],
      }),
    };
  };

  try {
    const result = await license.syncUnifiedLicense(
      {
        licenseKey: "EMX-AAAAA-BBBBB-CCCCC-DDDDD",
        ownerEmail: "buyer@example.com",
        productIds: ["EMX_TWEAK_DASHBOARD", "EMX_VOLT"],
      },
      {
        endpoint: "https://activate.example/",
        secret: "test-sync-secret",
      },
    );
    assert.equal(result.status, "synced");
    assert.equal(
      request.url,
      "https://activate.example/api/licenses/internal/sync",
    );
    assert.deepEqual(JSON.parse(request.options.body).productIds, [
      "EMX_TWEAK_DASHBOARD",
      "EMX_VOLT",
    ]);
  } finally {
    global.fetch = previousFetch;
  }
});

test("future product synchronization keeps one distinct key per product", async () => {
  const previousFetch = global.fetch;
  const previousUnified = process.env.EMX_UNIFIED_LICENSE_SYNC_URL;
  const previousVolt = process.env.EMX_VOLT_LICENSE_SYNC_URL;
  const previousSecret = process.env.EMX_LICENSE_SYNC_SECRET;
  const requests = [];
  process.env.EMX_UNIFIED_LICENSE_SYNC_URL = "https://activate.example";
  process.env.EMX_VOLT_LICENSE_SYNC_URL = "https://volt.example";
  process.env.EMX_LICENSE_SYNC_SECRET = "test-sync-secret";
  global.fetch = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true, created: true, productIds: [] }),
    };
  };

  try {
    await license.syncProductLicenses({
      ownerEmail: "buyer@example.com",
      productIds: ["EMX_OS", "EMX_VOLT"],
      licenseKeys: {
        EMX_OS: "EMX-OSKEY-AAAAA-BBBBB-CCCCC",
        EMX_VOLT: "EMX-VOLT1-AAAAA-BBBBB-CCCCC",
      },
    });

    const unified = requests.filter((request) =>
      request.url.includes("activate.example"),
    );
    assert.equal(unified.length, 2);
    assert.deepEqual(
      unified.map((request) => ({
        key: request.body.licenseKey,
        products: request.body.productIds,
      })),
      [
        {
          key: "EMX-OSKEY-AAAAA-BBBBB-CCCCC",
          products: ["EMX_OS"],
        },
        {
          key: "EMX-VOLT1-AAAAA-BBBBB-CCCCC",
          products: ["EMX_VOLT"],
        },
      ],
    );
    const volt = requests.find((request) => request.url.includes("volt.example"));
    assert.equal(volt.body.licenseKey, "EMX-VOLT1-AAAAA-BBBBB-CCCCC");
  } finally {
    global.fetch = previousFetch;
    if (previousUnified === undefined)
      delete process.env.EMX_UNIFIED_LICENSE_SYNC_URL;
    else process.env.EMX_UNIFIED_LICENSE_SYNC_URL = previousUnified;
    if (previousVolt === undefined) delete process.env.EMX_VOLT_LICENSE_SYNC_URL;
    else process.env.EMX_VOLT_LICENSE_SYNC_URL = previousVolt;
    if (previousSecret === undefined) delete process.env.EMX_LICENSE_SYNC_SECRET;
    else process.env.EMX_LICENSE_SYNC_SECRET = previousSecret;
  }
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
  const settings = siteSettings.normalize({
    introDurationMs: 99999,
    replayMode: "invalid",
    tagline: "<EMX>",
    replayHours: 0,
  });
  assert.equal(settings.introDurationMs, 26000);
  assert.equal(settings.replayMode, "session");
  assert.equal(settings.tagline, "EMX");
  assert.equal(settings.replayHours, 24);
});
