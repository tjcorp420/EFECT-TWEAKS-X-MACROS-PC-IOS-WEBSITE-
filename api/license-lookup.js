const {
  lookupLicenseByReceipt,
  parseBody,
  resendLicenseEmailByReceipt,
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

    if (body.action === "resend") {
      const resend = await resendLicenseEmailByReceipt(
        body.email,
        body.orderId || body.transactionId || body.id
      );
      if (resend.status === "not_found") {
        return sendJson(res, { ok: false, error: "No EMX license found for that email and Payhip transaction id." }, 404);
      }
      if (resend.status === "cooldown") {
        res.setHeader("retry-after", String(resend.retryAfterSeconds));
        return sendJson(res, {
          ok: false,
          error: "A license email was already resent recently. Check your inbox and spam folder before trying again."
        }, 429);
      }
      if (resend.status !== "sent") {
        return sendJson(res, {
          ok: false,
          error: "The purchase was found, but its license record needs EMX support."
        }, 409);
      }
      return sendJson(res, {
        ok: true,
        message: "The license email was accepted for delivery. Check the purchase inbox and spam folder."
      });
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
