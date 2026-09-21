const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getOrCreateProductLicenseKey,
  processPayhipPayload,
  requireLicenseEmailDelivery,
  requireProductLicenseSync,
  syncDesktopFlowLicense
} = require("../api/_lib/license-automation");

function createLicensePoolDb(keys) {
  const pool = Object.fromEntries(keys.map(key => [key, { key, status: "unused" }]));
  const makeSnapshot = (value, key = null) => ({
    key,
    val: () => value,
    exists: () => value !== null && value !== undefined,
    forEach(callback) {
      if (!value || typeof value !== "object") return;
      Object.entries(value).forEach(([childKey, childValue]) => {
        callback(makeSnapshot(childValue, childKey));
      });
    }
  });

  return {
    ref(path) {
      if (path === "licensePool") {
        return {
          orderByChild() { return this; },
          equalTo() { return this; },
          limitToFirst(limit) {
            this.limit = limit;
            return this;
          },
          async once() {
            const unused = Object.fromEntries(
              Object.entries(pool).filter(([, value]) => value.status === "unused").slice(0, this.limit || 10)
            );
            return makeSnapshot(unused);
          }
        };
      }

      const key = path.slice("licensePool/".length);
      return {
        async once() { return makeSnapshot(pool[key] || null, key); },
        async update(value) { pool[key] = { ...(pool[key] || {}), ...value }; }
      };
    }
  };
}

test("Desktop Flow 100-percent coupon orders remain valid paid receipts", async () => {
  const result = await processPayhipPayload({
    id: "TEST-DESKTOP-FLOW-COUPON",
    email: "buyer@example.com",
    currency: "USD",
    price: 0,
    items: [{
      product_id: "desktop-flow-test",
      product_name: "EMX Desktop Flow",
      product_key: "5BxNV",
      product_permalink: "https://payhip.com/b/5BxNV",
      quantity: "1",
      used_coupon: true
    }],
    type: "paid"
  }, {
    dryRun: true,
    previewLicenseKey: "EMX-TEST-KEY"
  });

  assert.equal(result.type, "paid");
  assert.deepEqual(result.productIds, ["EMX_DESKTOP_FLOW"]);
  assert.equal(result.licenseKeys.EMX_DESKTOP_FLOW, "EMX-TEST-KEY");
});

test("Desktop Flow activation sync reports a failed isolated-worker write", async () => {
  const previousFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 503,
    json: async () => ({ ok: false, error: "temporary_failure" })
  });

  try {
    const result = await syncDesktopFlowLicense({
      licenseKey: "EMX-AAAAA-BBBBB-CCCCC-DDDDD",
      ownerEmail: "buyer@example.com",
      productIds: ["EMX_DESKTOP_FLOW"]
    }, { secret: "test-secret" });

    assert.deepEqual(result, {
      status: "failed",
      statusCode: 503,
      reason: "temporary_failure"
    });
  } finally {
    global.fetch = previousFetch;
  }
});

test("Desktop Flow fulfillment rejects a failed activation sync so Payhip retries", () => {
  assert.throws(() => requireProductLicenseSync({
    EMX_DESKTOP_FLOW: {
      desktopFlow: { status: "failed", reason: "temporary_failure" }
    }
  }, ["EMX_DESKTOP_FLOW"]), /activation sync failed/i);

  assert.doesNotThrow(() => requireProductLicenseSync({
    EMX_DESKTOP_FLOW: {
      desktopFlow: { status: "synced" }
    }
  }, ["EMX_DESKTOP_FLOW"]));
});

test("license email failure is fatal so Payhip retries the receipt", () => {
  assert.throws(
    () => requireLicenseEmailDelivery({ status: "failed", reason: "provider unavailable" }),
    /email delivery failed/i
  );
  assert.throws(
    () => requireLicenseEmailDelivery({ status: "skipped", reason: "email-provider-not-configured" }),
    /email delivery failed/i
  );
  assert.doesNotThrow(() => requireLicenseEmailDelivery({ status: "sent" }));
});

test("two Desktop Flow orders with the same email reserve different one-PC keys", async () => {
  const db = createLicensePoolDb([
    "EMX-AAAAA-BBBBB-CCCCC-DDDDD",
    "EMX-EEEEE-FFFFF-GGGGG-HHHHH"
  ]);
  const existingCustomer = {
    licenseKeys: { EMX_DESKTOP_FLOW: "EMX-LEGACY-KEY" },
    products: { EMX_DESKTOP_FLOW: true }
  };

  const first = await getOrCreateProductLicenseKey(
    db,
    existingCustomer,
    "EMX_DESKTOP_FLOW",
    "ORDER-ONE"
  );
  const second = await getOrCreateProductLicenseKey(
    db,
    existingCustomer,
    "EMX_DESKTOP_FLOW",
    "ORDER-TWO"
  );

  assert.equal(first.isNewLicense, true);
  assert.equal(second.isNewLicense, true);
  assert.notEqual(first.licenseKey, second.licenseKey);
  assert.notEqual(first.licenseKey, existingCustomer.licenseKeys.EMX_DESKTOP_FLOW);
  assert.notEqual(second.licenseKey, existingCustomer.licenseKeys.EMX_DESKTOP_FLOW);
});
