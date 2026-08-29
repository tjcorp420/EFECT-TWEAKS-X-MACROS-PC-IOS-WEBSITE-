const {
  clearSession,
  createAffiliate,
  createSession,
  getAffiliateDashboard,
  getDb,
  getSessionAffiliate,
  hasValidOrigin,
  loginAffiliate,
  sendJson
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
    const db = getDb();
    if (req.method === "GET") {
      const affiliate = await getSessionAffiliate(db, req);
      if (!affiliate) return sendJson(res, { ok: true, authenticated: false });
      return sendJson(res, { ok: true, authenticated: true, ...(await getAffiliateDashboard(db, affiliate)) });
    }
    if (req.method !== "POST") {
      res.setHeader("allow", "GET, POST");
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }
    if (!hasValidOrigin(req)) return sendJson(res, { ok: false, error: "Request origin was not accepted." }, 403);

    const body = readBody(req);
    const action = String(body.action || "").toLowerCase();
    if (action === "signup") {
      const affiliate = await createAffiliate(db, body);
      await createSession(db, req, res, affiliate.id);
      return sendJson(res, { ok: true, authenticated: true, ...(await getAffiliateDashboard(db, affiliate)) }, 201);
    }
    if (action === "login") {
      const affiliate = await loginAffiliate(db, body.email, body.password);
      if (!affiliate) return sendJson(res, { ok: false, error: "Email or password was not accepted." }, 401);
      if (["suspended", "rejected", "banned", "disabled"].includes(affiliate.status)) return sendJson(res, { ok: false, error: `This affiliate account is ${affiliate.status}. Contact EMX support.` }, 403);
      await createSession(db, req, res, affiliate.id);
      return sendJson(res, { ok: true, authenticated: true, ...(await getAffiliateDashboard(db, affiliate)) });
    }
    if (action === "logout") {
      await clearSession(db, req, res);
      return sendJson(res, { ok: true, authenticated: false });
    }
    return sendJson(res, { ok: false, error: "Unknown affiliate action." }, 400);
  } catch (error) {
    const status = Number(error.statusCode || 0) || (/already|taken/i.test(error.message || "") ? 409 : 400);
    return sendJson(res, { ok: false, error: error instanceof Error ? error.message : "Affiliate account request failed." }, status);
  }
};
