const crypto = require("node:crypto");
const TYPES = new Set(["page_view", "product_view", "checkout_open"]);
function normalizeEvent(input, products) {
  if (
    !input ||
    !TYPES.has(input.type) ||
    !/^[a-zA-Z0-9_-]{12,100}$/.test(input.sessionId || "")
  )
    return null;
  const page = String(input.page || "").split("?")[0];
  if (
    ![
      "/",
      "/index.html",
      "/products.html",
      "/bundles.html",
      "/macros.html",
    ].includes(page) &&
    !/^\/r\/[a-z0-9-]{1,40}$/.test(page)
  )
    return null;
  const productId =
    input.type === "page_view" ? "store" : String(input.productId || "");
  if (
    productId !== "store" &&
    !products.some(
      (p) =>
        p.id === productId &&
        p.visible !== false &&
        !["draft", "archived"].includes(p.publishStatus),
    )
  )
    return null;
  if (input.type !== "page_view" && productId === "store") return null;
  return { type: input.type, page, productId, sessionId: input.sessionId };
}
async function recordStoreEvent(
  db,
  event,
  day = new Date().toISOString().slice(0, 10),
) {
  const token = crypto
    .createHash("sha256")
    .update(`${day}:${event.sessionId}:${event.type}:${event.productId}`)
    .digest("hex");
  const result = await db
    .ref(`storeFunnel/daily/${day}`)
    .transaction((current) => {
      const next = current || { seen: {}, counts: {}, products: {} };
      if (next.seen?.[token] || Object.keys(next.seen || {}).length >= 20000)
        return;
      next.seen ||= {};
      next.counts ||= {};
      next.products ||= {};
      next.seen[token] = true;
      next.counts[event.type] = Number(next.counts[event.type] || 0) + 1;
      if (event.productId !== "store") {
        next.products[event.productId] ||= {};
        next.products[event.productId][event.type] =
          Number(next.products[event.productId][event.type] || 0) + 1;
      }
      return next;
    });
  return { tracked: result.committed };
}
module.exports = { normalizeEvent, recordStoreEvent };
