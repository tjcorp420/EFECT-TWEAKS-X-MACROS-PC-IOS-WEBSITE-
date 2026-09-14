const crypto = require("crypto");
const {
  parseBody,
  processPayhipPayload,
  sendJson,
  verifyPayhipSignature
} = require("./_lib/license-automation");

// Records product OWNERSHIP into the Account Hub's KV store (emx:owns:<emailHash>) so a buyer's
// products show as Owned in the hub automatically. Payhip's webhook does not include the license
// key itself, so the user still pastes the key once (from their Payhip email) to copy/activate.
async function recordOwnershipToKV(payload) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return;
    const email = String(payload.email || payload.customer_email || "").trim().toLowerCase();
    if (!email.includes("@")) return;
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) return;

    const hash = crypto.createHash("sha256").update(email).digest("hex");
    const kvKey = "emx:owns:" + hash;
    const owns = (await kvGetJson(kvKey)) || {};
    const now = Date.now();
    for (const item of items) {
      const link = String(item.product_key || item.product_link || item.key || "").trim();
      if (!link) continue;
      owns[link] = { name: String(item.product_name || "").slice(0, 120), date: now };
    }
    await kvSetJson(kvKey, owns);
  } catch (err) {
    // Ownership capture is best-effort; never fail the webhook over it.
    console.error("recordOwnershipToKV failed:", err && err.message);
  }
}

async function kvCmd(cmd) {
  const r = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd)
  });
  return r.json();
}
async function kvGetJson(key) {
  const r = await kvCmd(["GET", key]);
  if (!r || !r.result) return null;
  try { return JSON.parse(r.result); } catch { return null; }
}
async function kvSetJson(key, value) { await kvCmd(["SET", key, JSON.stringify(value)]); }

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, { ok: true });
    }

    if (req.method === "GET") {
      return sendJson(res, {
        ok: true,
        endpoint: "EMX Payhip webhook",
        status: "live",
        note: "Paste this lowercase URL into Payhip. Payhip will send POST events here after checkout."
      });
    }

    if (req.method !== "POST") {
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }

    const payload = parseBody(req);
    if (!payload) {
      return sendJson(res, { ok: false, error: "Invalid JSON payload." }, 400);
    }

    const signature = verifyPayhipSignature(payload);
    if (!signature.ok) {
      return sendJson(res, { ok: false, error: signature.error }, 401);
    }

    // Capture ownership for the Account Hub first (works with just KV).
    await recordOwnershipToKV(payload);

    // Then run the legacy Firebase license automation if it's configured; if not, don't fail
    // the webhook — ownership was already recorded above.
    let result = null;
    try {
      result = await processPayhipPayload(payload, { dryRun: false });
    } catch (automationError) {
      result = { automationSkipped: automationError instanceof Error ? automationError.message : "unavailable" };
    }
    return sendJson(res, { ok: true, result });
  } catch (error) {
    return sendJson(res, {
      ok: false,
      error: error instanceof Error ? error.message : "Payhip webhook failed."
    }, 500);
  }
};
