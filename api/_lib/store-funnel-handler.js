const { getDb, hasValidOrigin, sendJson } = require("./affiliate-program");
const { requireAdmin } = require("./admin-auth");
const { loadProducts } = require("../products");
const { normalizeEvent, recordStoreEvent } = require("./store-funnel");
module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      if (!requireAdmin(req))
        return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
      const snapshot = await getDb()
        .ref("storeFunnel/daily")
        .orderByKey()
        .limitToLast(30)
        .once("value");
      const days = Object.entries(snapshot.val() || {}).map(([day, value]) => ({
        day,
        counts: value.counts || {},
        products: value.products || {},
      }));
      return sendJson(res, { ok: true, days });
    }
    if (req.method !== "POST") {
      res.setHeader("allow", "GET, POST");
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }
    if (!req.headers.origin || !hasValidOrigin(req))
      return sendJson(
        res,
        { ok: false, error: "Request origin was not accepted." },
        403,
      );
    let input = req.body;
    if (typeof input === "string") {
      if (input.length > 1500)
        return sendJson(res, { ok: false, error: "Event is too large." }, 413);
      try {
        input = JSON.parse(input);
      } catch {
        return sendJson(res, { ok: false, error: "Invalid event." }, 400);
      }
    }
    const event = normalizeEvent(input, await loadProducts());
    if (!event)
      return sendJson(res, { ok: false, error: "Invalid event." }, 400);
    return sendJson(res, {
      ok: true,
      ...(await recordStoreEvent(getDb(), event)),
    });
  } catch {
    return sendJson(
      res,
      { ok: false, error: "Store analytics is temporarily unavailable." },
      503,
    );
  }
};
