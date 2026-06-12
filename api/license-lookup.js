const {
  lookupLicenseByReceipt,
  parseBody,
  sendJson
} = require("./_lib/license-automation");

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

    const result = await lookupLicenseByReceipt(body.email, body.orderId || body.transactionId || body.id);
    if (!result) {
      return sendJson(res, { ok: false, error: "No EMX license found for that email and Payhip transaction id." }, 404);
    }

    return sendJson(res, { ok: true, license: result });
  } catch (error) {
    return sendJson(res, {
      ok: false,
      error: error instanceof Error ? error.message : "License lookup failed."
    }, 500);
  }
};
