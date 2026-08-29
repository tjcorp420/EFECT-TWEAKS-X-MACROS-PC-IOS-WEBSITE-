const { getDb, hasValidOrigin, sendJson } = require("./_lib/affiliate-program");
const { recordAffiliateEvent } = require("./_lib/affiliate-analytics");

function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(String(req.body || "{}")); } catch (error) { return {}; }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") { res.setHeader("allow", "POST"); return sendJson(res, { ok: false, error: "Method not allowed." }, 405); }
    if (!hasValidOrigin(req)) return sendJson(res, { ok: false, error: "Request origin was not accepted." }, 403);
    return sendJson(res, { ok: true, ...(await recordAffiliateEvent(getDb(), body(req))) });
  } catch (error) {
    return sendJson(res, { ok: false, error: "Analytics event could not be recorded." }, 503);
  }
};
