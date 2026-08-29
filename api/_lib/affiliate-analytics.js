const crypto = require("crypto");

const ROOT = "affiliateProgram";
const AFFILIATES_PATH = `${ROOT}/affiliates`;
const CODE_INDEX_PATH = `${ROOT}/indexByCode`;
const EVENTS_PATH = `${ROOT}/events`;
const CONVERSIONS_PATH = `${ROOT}/conversions`;
const DOWNLOADS_PATH = `${ROOT}/downloads`;
const DAILY_PATH = `${ROOT}/daily`;
const PRODUCT_PATH = `${ROOT}/productStats`;
const AUDIT_PATH = `${ROOT}/adminAudit`;
const ACTIVE_STATUSES = new Set(["active", "approved"]);
const EVENT_TYPES = new Set(["referral_click", "product_view", "checkout_open"]);

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function safeKey(value) {
  return String(value || "").replace(/[.#$/[\]]/g, "_").slice(0, 180);
}

function cleanCode(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

function cleanProductId(value) {
  return String(value || "unknown-product").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 80) || "unknown-product";
}

function cleanVisitor(value) {
  const visitor = String(value || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return visitor.length >= 12 ? visitor : "";
}

function cleanText(value, limit = 180) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, limit);
}

function normalizePage(value) {
  const page = String(value || "/").trim().slice(0, 300);
  return page.startsWith("/") && !page.startsWith("//") ? page : "/";
}

function normalizeSource(value) {
  const source = cleanText(value, 160);
  if (!source) return "direct";
  try { return new URL(source).hostname.slice(0, 120) || "direct"; } catch (error) { return source.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "direct"; }
}

function isAffiliateActive(affiliate) {
  return Boolean(affiliate && ACTIVE_STATUSES.has(String(affiliate.status || "").toLowerCase()));
}

async function resolveAffiliate(db, codeValue) {
  const code = cleanCode(codeValue);
  if (!code) return null;
  const index = await db.ref(`${CODE_INDEX_PATH}/${safeKey(code)}`).once("value");
  const affiliateId = index.val();
  if (!affiliateId) return null;
  const snap = await db.ref(`${AFFILIATES_PATH}/${safeKey(affiliateId)}`).once("value");
  const affiliate = snap.val();
  return isAffiliateActive(affiliate) ? affiliate : null;
}

async function increment(ref, fields) {
  await ref.transaction(current => {
    const next = current || {};
    Object.entries(fields).forEach(([field, amount]) => { next[field] = Number(next[field] || 0) + Number(amount || 0); });
    return next;
  });
}

async function recordAffiliateEvent(db, input = {}) {
  const type = String(input.type || "referral_click").toLowerCase();
  const visitorId = cleanVisitor(input.visitorId);
  if (!EVENT_TYPES.has(type) || !visitorId) return { tracked: false, reason: "invalid-event" };
  const affiliate = await resolveAffiliate(db, input.code);
  if (!affiliate) return { tracked: false, reason: "inactive-affiliate" };
  const productId = cleanProductId(input.productId);
  const day = new Date().toISOString().slice(0, 10);
  const uniqueScope = type === "referral_click" ? "entry" : productId;
  const eventId = sha256(`${affiliate.id}:${visitorId}:${day}:${type}:${uniqueScope}`);
  const now = new Date().toISOString();
  const event = {
    id: eventId,
    affiliateId: affiliate.id,
    code: affiliate.code,
    type,
    productId: type === "referral_click" ? "" : productId,
    visitorHash: sha256(`${affiliate.id}:${visitorId}`).slice(0, 24),
    sessionHash: sha256(String(input.sessionId || visitorId)).slice(0, 24),
    page: normalizePage(input.page),
    source: normalizeSource(input.referrer || input.source),
    campaign: cleanText(input.campaign, 80),
    device: ["mobile", "tablet", "desktop"].includes(input.device) ? input.device : "unknown",
    createdAt: now
  };
  let inserted = false;
  const created = await db.ref(`${EVENTS_PATH}/${eventId}`).transaction(current => {
    if (current) return;
    inserted = true;
    return event;
  });
  if (!inserted || !created.committed) return { tracked: false, duplicate: true, type };
  const field = type === "referral_click" ? "clicks" : type === "product_view" ? "productViews" : "checkoutOpens";
  await Promise.all([
    increment(db.ref(`${AFFILIATES_PATH}/${safeKey(affiliate.id)}/stats`), { [field]: 1, ...(type === "referral_click" ? { uniqueVisitors: 1 } : {}) }),
    increment(db.ref(`${DAILY_PATH}/${day}/${safeKey(affiliate.id)}`), { [field]: 1 }),
    type === "referral_click" ? Promise.resolve() : increment(db.ref(`${PRODUCT_PATH}/${safeKey(affiliate.id)}/${safeKey(productId)}`), { [field]: 1 })
  ]);
  await db.ref(`${AFFILIATES_PATH}/${safeKey(affiliate.id)}`).update({ lastActivityAt: now, ...(type === "referral_click" ? { lastReferralAt: now } : {}) });
  return { tracked: true, eventId, type, affiliateId: affiliate.id };
}

async function recordFreeDownloadConversion(db, input = {}) {
  const visitorId = cleanVisitor(input.visitorId);
  const productId = cleanProductId(input.productId);
  if (!visitorId || !productId) return { tracked: false, reason: "invalid-download" };
  const affiliate = await resolveAffiliate(db, input.code);
  if (!affiliate) return { tracked: false, reason: "no-active-affiliate" };
  const conversionId = `free-${sha256(`${affiliate.id}:${visitorId}:${productId}`).slice(0, 48)}`;
  const now = new Date().toISOString();
  const conversion = {
    id: conversionId,
    orderId: conversionId,
    affiliateId: affiliate.id,
    code: affiliate.code,
    type: "free_download",
    productId,
    visitorHash: sha256(`${affiliate.id}:${visitorId}`).slice(0, 24),
    grossCents: 0,
    revenueCents: 0,
    rateBps: Number(affiliate.rateBps || 0),
    commissionCents: 0,
    currency: "USD",
    status: "confirmed",
    createdAt: now
  };
  let inserted = false;
  const created = await db.ref(`${CONVERSIONS_PATH}/${safeKey(conversionId)}`).transaction(current => {
    if (current) return;
    inserted = true;
    return conversion;
  });
  if (!inserted || !created.committed) return { tracked: false, duplicate: true, conversion: created.snapshot.val() };
  const day = now.slice(0, 10);
  await Promise.all([
    increment(db.ref(`${AFFILIATES_PATH}/${safeKey(affiliate.id)}/stats`), { conversions: 1, freeConversions: 1 }),
    increment(db.ref(`${DAILY_PATH}/${day}/${safeKey(affiliate.id)}`), { conversions: 1, freeConversions: 1 }),
    increment(db.ref(`${PRODUCT_PATH}/${safeKey(affiliate.id)}/${safeKey(productId)}`), { conversions: 1, freeConversions: 1 })
  ]);
  await db.ref(`${AFFILIATES_PATH}/${safeKey(affiliate.id)}`).update({ lastActivityAt: now, lastConversionAt: now });
  return { tracked: true, conversion };
}

async function recordDownloadRequest(db, input = {}) {
  const visitorId = cleanVisitor(input.visitorId) || crypto.randomUUID();
  const productId = cleanProductId(input.productId);
  const id = crypto.randomUUID();
  const record = { id, productId, visitorHash: sha256(visitorId).slice(0, 24), affiliateCode: cleanCode(input.code), createdAt: new Date().toISOString() };
  await db.ref(`${DOWNLOADS_PATH}/${safeKey(id)}`).set(record);
  return record;
}

async function recordPaidConversionAggregates(db, conversion) {
  const day = String(conversion.createdAt || new Date().toISOString()).slice(0, 10);
  const productId = cleanProductId(conversion.productId);
  await Promise.all([
    increment(db.ref(`${DAILY_PATH}/${day}/${safeKey(conversion.affiliateId)}`), { conversions: 1, paidConversions: 1, revenueCents: Number(conversion.grossCents || 0), commissionCents: Number(conversion.commissionCents || 0) }),
    increment(db.ref(`${PRODUCT_PATH}/${safeKey(conversion.affiliateId)}/${safeKey(productId)}`), { conversions: 1, paidConversions: 1, revenueCents: Number(conversion.grossCents || 0), commissionCents: Number(conversion.commissionCents || 0) })
  ]);
}

async function getAffiliateAnalytics(db, affiliateId) {
  const id = safeKey(affiliateId);
  const [eventsSnap, conversionsSnap, productsSnap] = await Promise.all([
    db.ref(EVENTS_PATH).orderByChild("affiliateId").equalTo(affiliateId).limitToLast(200).once("value"),
    db.ref(CONVERSIONS_PATH).orderByChild("affiliateId").equalTo(affiliateId).limitToLast(200).once("value"),
    db.ref(`${PRODUCT_PATH}/${id}`).once("value")
  ]);
  const events = [], conversions = [];
  eventsSnap.forEach(child => events.push(child.val()));
  conversionsSnap.forEach(child => conversions.push(child.val()));
  events.sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  conversions.sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return { events, conversions, productPerformance: productsSnap.val() || {} };
}

async function writeAdminAudit(db, action, target, metadata = {}) {
  const id = crypto.randomUUID();
  await db.ref(`${AUDIT_PATH}/${safeKey(id)}`).set({ id, action: cleanText(action, 80), target: cleanText(target, 120), metadata, createdAt: new Date().toISOString() });
  return id;
}

module.exports = { cleanCode, cleanProductId, getAffiliateAnalytics, isAffiliateActive, recordAffiliateEvent, recordDownloadRequest, recordFreeDownloadConversion, recordPaidConversionAggregates, resolveAffiliate, safeKey, writeAdminAudit };
