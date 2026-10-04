const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getOrCreateProductLicenseKey,
  getProductMap,
  processPayhipPayload,
  requireProductLicenseSync,
  syncDesktopFlowLiteLicense
} = require("../api/_lib/license-automation");

function emptyLicenseDb() {
  return {
    ref() {
      return {
        async once() {
          return { exists: () => false, val: () => null };
        }
      };
    }
  };
}

test("Payhip Desktop Flow Lite product maps to the isolated entitlement", () => {
  assert.deepEqual(getProductMap().t2qKl, ["EMX_DESKTOP_FLOW_LITE"]);
});

test("Desktop Flow Lite gets a product-specific key instead of a shared pool key", async () => {
  const result = await getOrCreateProductLicenseKey(
    emptyLicenseDb(),
    {},
    "EMX_DESKTOP_FLOW_LITE",
    "ORDER-LITE-1"
  );
  assert.match(result.licenseKey, /^EMXDFL-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/);
});

test("Lite sync sends the correct product and one-PC entitlement", async () => {
  const originalFetch = global.fetch;
  let captured;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return { ok: true, status: 200, json: async () => ({ ok: true, created: true, licenseId: "lite-id" }) };
  };
  try {
    const result = await syncDesktopFlowLiteLicense({
      licenseKey: "EMXDFL-12345678-90ABCDEF-A1B2C3D4",
      ownerEmail: "buyer@example.com",
      productIds: ["EMX_DESKTOP_FLOW_LITE"]
    }, { endpoint: "https://lite.example", secret: "test-secret" });
    assert.equal(result.status, "synced");
    assert.equal(captured.url, "https://lite.example/internal/licenses/sync");
    assert.equal(captured.options.headers.authorization, "Bearer test-secret");
    const body = JSON.parse(captured.options.body);
    assert.equal(body.productId, "emx-desktop-flow-lite");
    assert.equal(body.maxDevices, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test("Lite fulfillment requires a successful backend sync", () => {
  assert.throws(() => requireProductLicenseSync({
    EMX_DESKTOP_FLOW_LITE: { desktopFlowLite: { status: "failed" } }
  }, ["EMX_DESKTOP_FLOW_LITE"]), /Desktop Flow Lite license activation sync failed/);

  assert.doesNotThrow(() => requireProductLicenseSync({
    EMX_DESKTOP_FLOW_LITE: { desktopFlowLite: { status: "synced" } }
  }, ["EMX_DESKTOP_FLOW_LITE"]));
});

test("a signed Payhip-style 100 percent coupon order remains eligible", async () => {
  const payload = {
    type: "paid",
    id: "LITE-COUPON-TEST",
    email: "buyer@example.com",
    price: "0.00",
    items: [{
      product_key: "t2qKl",
      product_name: "EMX DESKTOP FLOW lite",
      used_coupon: true,
      quantity: "1"
    }]
  };
  const result = await processPayhipPayload(payload, { dryRun: true });
  assert.deepEqual(result.productIds, ["EMX_DESKTOP_FLOW_LITE"]);
  assert.equal(result.dryRun, true);
});
