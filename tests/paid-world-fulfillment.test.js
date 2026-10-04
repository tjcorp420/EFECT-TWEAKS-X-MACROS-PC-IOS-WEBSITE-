const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const license = require("../api/_lib/license-automation");

const productId = "EMX_WORLD";
const key = "EMXWD-12345678-90ABCDEF-A1B2C3D4";
const payload = {
  type: "paid", id: "TASKBAR-COUPON-TEST", email: "buyer@example.com",
  price: "0.00", currency: "USD",
  items: [{ product_key: "GUE6H", product_name: "EMX WORLD", used_coupon: true, quantity: "1" }]
};

function memoryDb() {
  const values = {};
  return {
    values,
    ref(name) {
      return {
        async once() { return { exists: () => Object.hasOwn(values, name), val: () => values[name] || null }; },
        async set(value) { values[name] = structuredClone(value); },
        async update(value) { values[name] = { ...values[name], ...structuredClone(value) }; }
      };
    }
  };
}

test("WORLD maps only to its own entitlement and accepts coupon receipts", async () => {
  assert.deepEqual(license.getProductMap().GUE6H, [productId]);
  const result = await license.processPayhipPayload(payload, { dryRun: true });
  assert.deepEqual(result.productIds, [productId]);
  assert.equal(result.dryRun, true);
});

test("new WORLD keys use the app's actual format and never read the shared pool", async () => {
  const db = memoryDb();
  const first = await license.getOrCreateProductLicenseKey(db, {}, productId, "ORDER-1");
  const second = await license.getOrCreateProductLicenseKey(db, {}, productId, "ORDER-2");
  assert.match(first.licenseKey, /^EMXWD-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/);
  assert.notEqual(first.licenseKey, second.licenseKey);
});

test("WORLD sync uses its isolated endpoint, product and one-PC lifetime plan", async () => {
  const previousFetch = global.fetch;
  let captured;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return { ok: true, status: 200, json: async () => ({ ok: true, product: "emx-world", created: true }) };
  };
  try {
    const result = await license.syncPaidDesktopLicense({ licenseKey: key, ownerEmail: "BUYER@example.com", productIds: [productId] }, { secret: "taskbar-test-secret" });
    assert.equal(result.status, "synced");
    assert.equal(captured.url, "https://emx-world-auth.tjcorp420.workers.dev/internal/licenses/sync");
    assert.equal(captured.options.headers.authorization, "Bearer taskbar-test-secret");
    assert.deepEqual(JSON.parse(captured.options.body), {
      licenseKey: key, ownerEmail: "buyer@example.com", productId: "emx-world", plan: "lifetime", maxDevices: 1
    });
  } finally { global.fetch = previousFetch; }
});

test("WORLD sync fails safely on provider errors and incorrect product responses", async () => {
  const previousFetch = global.fetch;
  try {
    for (const body of [{ ok: true, product: "emx-desktop-flow-lite" }, { ok: false, error: "private-provider-detail" }, {}]) {
      global.fetch = async () => ({ ok: true, status: 200, json: async () => body });
      const result = await license.syncPaidDesktopLicense({ licenseKey: key, productIds: [productId] }, { secret: "test" });
      assert.equal(result.status, "failed");
      assert.doesNotMatch(result.reason, /private-provider-detail/);
    }
    global.fetch = async () => { throw new Error("private network detail"); };
    assert.equal((await license.syncPaidDesktopLicense({ licenseKey: key, productIds: [productId] }, { secret: "test" })).reason, "paid-desktop-sync-unavailable");
    global.fetch = async () => { const error = new Error(); error.name = "AbortError"; throw error; };
    assert.equal((await license.syncPaidDesktopLicense({ licenseKey: key, productIds: [productId] }, { secret: "test" })).reason, "paid-desktop-sync-timeout");
  } finally { global.fetch = previousFetch; }
});

test("missing WORLD secret cannot fall back to another product's shared secret", async () => {
  const previous = process.env.EMX_WORLD_SYNC_SECRET;
  const shared = process.env.EMX_LICENSE_SYNC_SECRET;
  delete process.env.EMX_WORLD_SYNC_SECRET;
  process.env.EMX_LICENSE_SYNC_SECRET = "unrelated-secret";
  try {
    const result = await license.syncPaidDesktopLicense({ licenseKey: key, productIds: [productId] });
    assert.equal(result.status, "skipped");
    assert.throws(() => license.requireProductLicenseSync({ [productId]: { paidDesktop: result } }, [productId]), /WORLD license activation sync failed/);
  } finally {
    if (previous === undefined) delete process.env.EMX_WORLD_SYNC_SECRET; else process.env.EMX_WORLD_SYNC_SECRET = previous;
    if (shared === undefined) delete process.env.EMX_LICENSE_SYNC_SECRET; else process.env.EMX_LICENSE_SYNC_SECRET = shared;
  }
});

test("fulfillment retries reuse the original key and do not email before activation sync", async () => {
  const previousFetch = global.fetch;
  const names = ["EMX_WORLD_SYNC_SECRET", "RESEND_API_KEY", "EMX_LICENSE_EMAIL_FROM", "EMX_UNIFIED_LICENSE_SYNC_URL"];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  process.env.EMX_WORLD_SYNC_SECRET = "test-secret";
  process.env.RESEND_API_KEY = "test-email-secret";
  process.env.EMX_LICENSE_EMAIL_FROM = "EMX <licenses@example.com>";
  delete process.env.EMX_UNIFIED_LICENSE_SYNC_URL;
  const db = memoryDb();
  let rejectSync = true;
  const syncedKeys = [], emails = [];
  global.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    if (url.includes("emx-world-auth")) {
      syncedKeys.push(body.licenseKey);
      return { ok: !rejectSync, status: rejectSync ? 503 : 200, json: async () => ({ ok: !rejectSync, product: "emx-world" }) };
    }
    if (url === "https://api.resend.com/emails") {
      emails.push(body);
      return { ok: true, status: 200, json: async () => ({ id: "test-message" }) };
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  try {
    await assert.rejects(license.applyPaidPurchase(payload, { db }), /WORLD license activation sync failed/);
    assert.equal(emails.length, 0);
    await assert.rejects(license.applyPaidPurchase(payload, { db }), /WORLD license activation sync failed/);
    assert.equal(emails.length, 0);
    rejectSync = false;
    const result = await license.applyPaidPurchase(payload, { db });
    assert.equal(result.alreadyProcessed, true);
    assert.equal(emails.length, 1);
    assert.match(emails[0].text, /EMX WORLD: EMXWD-/);
    assert.equal(new Set(syncedKeys).size, 1);
    await license.applyPaidPurchase(payload, { db });
    assert.equal(emails.length, 1);
    const recovered = await license.lookupLicenseByReceipt(payload.email, payload.id, { db });
    assert.equal(recovered.licenseKeys[productId], result.licenseKeys[productId]);
  } finally {
    global.fetch = previousFetch;
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name];
    }
  }
});

test("WORLD catalog uses the verified price, paid checkout and real screenshots", () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "products.js"), "utf8"), sandbox);
  const product = sandbox.window.EMX_PRODUCTS.find(item => item.id === "emx_world");
  assert.equal(product.price, 5);
  assert.equal(product.key, "GUE6H");
  assert.equal(product.productUrl, "https://payhip.com/b/GUE6H");
  assert.equal(product.deliveryType, "payhip");
  assert.equal(product.version, "v0.5.0");
  assert.ok(product.visible);
  assert.ok(product.gallery.every(image => fs.existsSync(path.join(__dirname, "..", image))));
});
