const { getDb, hasValidOrigin, sendJson } = require("./_lib/affiliate-program");
const { recordAffiliateEvent } = require("./_lib/affiliate-analytics");

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (error) { return {}; }
  }
  return {};
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("allow", "POST");
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }
    if (!hasValidOrigin(req)) return sendJson(res, { ok: false, error: "Request origin was not accepted." }, 403);
    const input = readBody(req);
    return sendJson(res, { ok: true, ...(await recordAffiliateEvent(getDb(), { ...input, type: input.type || "referral_click" })) });
  } catch (error) {
    return sendJson(res, { ok: false, error: "Affiliate event could not be recorded." }, 503);
  }
};
