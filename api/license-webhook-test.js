const {
  parseBody,
  processPayhipPayload,
  sendJson
} = require("./_lib/license-automation");

function isAllowed(req, body) {
  const expected = process.env.EMX_LICENSE_TEST_SECRET || process.env.ADMIN_PASSWORD || "";
  const actual = req.headers["x-emx-test-secret"] || req.headers["x-admin-password"] || body.secret || "";
  return Boolean(expected && actual && expected === actual);
}

function samplePayload(overrides = {}) {
  return {
    id: overrides.id || `TEST-${Date.now()}`,
    email: overrides.email || "buyer@example.com",
    currency: "USD",
    price: 2099,
    items: [
      {
        product_id: "test",
        product_name: overrides.product_name || "EMX Custom OS",
        product_key: overrides.product_key || "Isg28",
        product_permalink: `https://payhip.com/b/${overrides.product_key || "Isg28"}`,
        quantity: "1"
      }
    ],
    date: Math.floor(Date.now() / 1000),
    type: "paid",
    signature: "test"
  };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, { ok: true });
    }

    if (req.method !== "POST") {
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }

    const body = parseBody(req);
    if (!body) {
      return sendJson(res, { ok: false, error: "Invalid JSON payload." }, 400);
    }

    if (!isAllowed(req, body)) {
      return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
    }

    const dryRun = body.commit !== true;
    const payload = body.payload || samplePayload(body);
    const result = await processPayhipPayload(payload, {
      dryRun,
      previewLicenseKey: body.previewLicenseKey || "EMX-TEST-KEY"
    });

    return sendJson(res, {
      ok: true,
      dryRun,
      result,
      note: dryRun
        ? "Dry run only. Send commit:true with configured Firebase Admin secrets to write."
        : "Committed to Firebase."
    });
  } catch (error) {
    return sendJson(res, {
      ok: false,
      error: error instanceof Error ? error.message : "License webhook test failed."
    }, 500);
  }
};
