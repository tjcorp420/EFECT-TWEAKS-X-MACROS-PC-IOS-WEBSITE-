const { requireAdmin } = require("./_lib/admin-auth");
const {
  getDb,
  listAffiliatesForAdmin,
  recordPayoutForAdmin,
  sendJson,
  updateAffiliateForAdmin
} = require("./_lib/affiliate-program");

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (error) { return {}; }
  }
  return {};
}

module.exports = async function handler(req, res) {
  try {
    if (!requireAdmin(req)) return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
    const db = getDb();
    if (req.method === "GET") {
      const affiliates = await listAffiliatesForAdmin(db);
      return sendJson(res, { ok: true, affiliates, referrals: affiliates });
    }
    if (req.method !== "POST") {
      res.setHeader("allow", "GET, POST");
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }
    const body = readBody(req);
    if (body.action === "record-payout") {
      return sendJson(res, { ok: true, payout: await recordPayoutForAdmin(db, body) });
    }
    return sendJson(res, { ok: true, affiliate: await updateAffiliateForAdmin(db, body) });
  } catch (error) {
    return sendJson(res, { ok: false, error: error instanceof Error ? error.message : "Affiliate admin request failed." }, 400);
  }
};
