const {
  parseBody,
  processPayhipPayload,
  sendJson,
  verifyPayhipSignature
} = require("./_lib/license-automation");

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

    const result = await processPayhipPayload(payload, { dryRun: false });
    return sendJson(res, { ok: true, result });
  } catch (error) {
    return sendJson(res, {
      ok: false,
      error: error instanceof Error ? error.message : "Payhip webhook failed."
    }, 500);
  }
};
