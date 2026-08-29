const { getDb, hasValidOrigin, sendJson } = require("./_lib/affiliate-program");
const { recordDownloadRequest, recordFreeDownloadConversion } = require("./_lib/affiliate-analytics");
const productsApi = require("./products");

function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(String(req.body || "{}")); } catch (error) { return {}; }
}

function safeDownloadUrl(value) {
  const url = String(value || "").trim();
  if (url.startsWith("/downloads/") || url.startsWith("/download/")) return url;
  try { const parsed = new URL(url); return parsed.protocol === "https:" ? parsed.toString() : ""; } catch (error) { return ""; }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") { res.setHeader("allow", "POST"); return sendJson(res, { ok: false, error: "Method not allowed." }, 405); }
    if (!hasValidOrigin(req)) return sendJson(res, { ok: false, error: "Request origin was not accepted." }, 403);
    const input = body(req);
    const products = await productsApi.loadProducts();
    const product = products.find(item => item.id === String(input.productId || "") && item.visible !== false && item.publishStatus !== "archived");
    if (!product) return sendJson(res, { ok: false, error: "This download is not available." }, 404);
    if (!["direct", "external"].includes(product.deliveryType)) return sendJson(res, { ok: false, error: "This product does not use direct delivery." }, 409);
    const downloadUrl = safeDownloadUrl(product.deliveryUrl);
    if (!downloadUrl) return sendJson(res, { ok: false, error: "The product download has not been configured." }, 409);
    let download = { id: "" };
    let affiliateConversion = { tracked: false, duplicate: false };
    let analyticsAvailable = true;
    try {
      const db = getDb();
      download = await recordDownloadRequest(db, { ...input, productId: product.id });
      affiliateConversion = Number(product.price || 0) === 0
        ? await recordFreeDownloadConversion(db, { ...input, productId: product.id })
        : { tracked: false, reason: "paid-direct-delivery" };
    } catch (analyticsError) {
      analyticsAvailable = false;
      console.error("EMX download analytics unavailable", analyticsError instanceof Error ? analyticsError.message : analyticsError);
    }
    return sendJson(res, { ok: true, downloadUrl, fileName: product.deliveryFileName || "", downloadId: download.id, analyticsAvailable, affiliateConversion: { tracked: affiliateConversion.tracked === true, duplicate: affiliateConversion.duplicate === true } });
  } catch (error) {
    return sendJson(res, { ok: false, error: "The download could not be prepared. Try again or contact support." }, 503);
  }
};
