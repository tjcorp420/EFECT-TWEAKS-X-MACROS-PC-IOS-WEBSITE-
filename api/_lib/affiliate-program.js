const crypto = require("crypto");
const { getAffiliateAnalytics, isAffiliateActive, recordAffiliateEvent, recordPaidConversionAggregates, writeAdminAudit } = require("./affiliate-analytics");

const AFFILIATES_PATH = "affiliateProgram/affiliates";
const EMAIL_INDEX_PATH = "affiliateProgram/indexByEmail";
const CODE_INDEX_PATH = "affiliateProgram/indexByCode";
const SESSIONS_PATH = "affiliateProgram/sessions";
const CLICKS_PATH = "affiliateProgram/clicks";
const CONVERSIONS_PATH = "affiliateProgram/conversions";
const PAYOUTS_PATH = "affiliateProgram/payouts";
const SESSION_COOKIE = "emx_affiliate_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const MAX_FAILED_LOGINS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

function sendJson(res, response, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-content-type-options", "nosniff");
  res.end(JSON.stringify(response));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 254);
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function normalizeDisplayName(value) {
  return String(value || "")
    .trim()
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 48);
}

function normalizePage(value) {
  const page = String(value || "/").trim().slice(0, 300);
  return page.startsWith("/") && !page.startsWith("//") ? page : "/";
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function maskEmail(email) {
  const [name, domain] = normalizeEmail(email).split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, Math.min(2, name.length))}${"*".repeat(Math.max(2, name.length - 2))}@${domain}`;
}

function safeKey(value) {
  return String(value || "").replace(/[.#$/[\]]/g, "_").slice(0, 180);
}

function getFirebaseAdmin() {
  const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.EMX_FIREBASE_DATABASE_URL || "";
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.EMX_FIREBASE_SERVICE_ACCOUNT_JSON || "";

  if (!databaseURL || !serviceAccountRaw) {
    throw new Error("Affiliate storage is not configured.");
  }

  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    let credentialJson;
    try {
      credentialJson = JSON.parse(serviceAccountRaw);
    } catch (error) {
      throw new Error("Affiliate storage credentials are invalid.");
    }
    admin.initializeApp({
      credential: admin.credential.cert(credentialJson),
      databaseURL
    });
  }
  return admin;
}

function getDb() {
  return getFirebaseAdmin().database();
}

function parseCookies(req) {
  const result = {};
  String(req.headers.cookie || "").split(";").forEach(part => {
    const index = part.indexOf("=");
    if (index < 1) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  });
  return result;
}

function sessionCookie(req, token, maxAge = SESSION_MAX_AGE_SECONDS) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  const secure = forwardedProto === "https" || process.env.VERCEL === "1";
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token || "")}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    `Max-Age=${Math.max(0, maxAge)}`
  ].filter(Boolean).join("; ");
}

function getExpectedOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${proto}://${host}` : "";
}

function hasValidOrigin(req) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return true;
  return origin === getExpectedOrigin(req);
}

function validatePassword(password) {
  const value = String(password || "");
  if (value.length < 10 || value.length > 128) {
    return "Password must be between 10 and 128 characters.";
  }
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return "Password must include at least one letter and one number.";
  }
  return "";
}

function derivePassword(password, salt) {
  return crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
}

function passwordRecord(password) {
  const salt = crypto.randomBytes(18).toString("hex");
  return { salt, hash: derivePassword(password, salt) };
}

function passwordMatches(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  const actual = Buffer.from(derivePassword(password, record.salt), "hex");
  const expected = Buffer.from(String(record.hash), "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function publicAffiliate(affiliate) {
  const stats = affiliate.stats || {};
  const conversions = Number(stats.conversions || 0);
  const visitors = Number(stats.uniqueVisitors || stats.clicks || 0);
  return {
    id: affiliate.id,
    displayName: affiliate.displayName,
    code: affiliate.code,
    emailMasked: affiliate.emailMasked,
    status: affiliate.status === "approved" ? "active" : affiliate.status === "disabled" ? "suspended" : affiliate.status,
    rateBps: Number(affiliate.rateBps || 0),
    createdAt: affiliate.createdAt,
    approvedAt: affiliate.approvedAt || "",
    lastActivityAt: affiliate.lastActivityAt || "",
    lastReferralAt: affiliate.lastReferralAt || "",
    lastConversionAt: affiliate.lastConversionAt || "",
    notes: String(affiliate.notes || "").slice(0, 500),
    stats: {
      clicks: Number(stats.clicks || 0), uniqueVisitors: visitors,
      productViews: Number(stats.productViews || 0), checkoutOpens: Number(stats.checkoutOpens || 0),
      conversions, freeConversions: Number(stats.freeConversions || 0),
      paidConversions: Number(stats.paidConversions || Math.max(0, conversions - Number(stats.freeConversions || 0))),
      conversionRate: visitors ? conversions / visitors : 0,
      grossCents: Number(stats.grossCents || 0),
      pendingCommissionCents: Number(stats.pendingCommissionCents || 0),
      approvedCommissionCents: Number(stats.approvedCommissionCents || 0),
      paidCommissionCents: Number(stats.paidCommissionCents || 0),
      reversedCommissionCents: Number(stats.reversedCommissionCents || 0)
    }
  };
}

async function createAffiliate(db, input) {
  const email = normalizeEmail(input.email);
  const displayName = normalizeDisplayName(input.displayName);
  const code = normalizeCode(input.code || displayName);
  const passwordError = validatePassword(input.password);

  if (!email || !email.includes("@")) throw new Error("Enter a valid email address.");
  if (displayName.length < 2) throw new Error("Display name must be at least 2 characters.");
  if (code.length < 3) throw new Error("Referral code must be at least 3 characters.");
  if (passwordError) throw new Error(passwordError);

  const emailHash = sha256(email);
  const emailRef = db.ref(`${EMAIL_INDEX_PATH}/${emailHash}`);
  const emailReservation = `reserved:${crypto.randomUUID()}`;
  const reservedEmail = await emailRef.transaction(current => current || emailReservation);
  if (!reservedEmail.committed || reservedEmail.snapshot.val() !== emailReservation) {
    throw new Error("An affiliate account already exists for that email.");
  }

  const codeRef = db.ref(`${CODE_INDEX_PATH}/${safeKey(code)}`);
  const reservation = `reserved:${crypto.randomUUID()}`;
  const reservedCode = await codeRef.transaction(current => current || reservation);
  if (!reservedCode.committed || reservedCode.snapshot.val() !== reservation) {
    await releaseReservation(emailRef, emailReservation);
    throw new Error("That referral code is already taken.");
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const passwordData = passwordRecord(input.password);
  const affiliate = {
    id,
    displayName,
    code,
    emailHash,
    emailMasked: maskEmail(email),
    password: passwordData,
    status: "active",
    rateBps: Math.min(10000, Math.max(0, Number(process.env.EMX_DEFAULT_AFFILIATE_RATE_BPS || 0))),
    stats: {
      clicks: 0,
      uniqueVisitors: 0,
      productViews: 0,
      checkoutOpens: 0,
      conversions: 0,
      freeConversions: 0,
      paidConversions: 0,
      grossCents: 0,
      pendingCommissionCents: 0,
      paidCommissionCents: 0,
      reversedCommissionCents: 0
    },
    approvedAt: createdAt,
    activatedAt: createdAt,
    createdAt,
    updatedAt: createdAt
  };

  try {
    await db.ref().update({
      [`${AFFILIATES_PATH}/${safeKey(id)}`]: affiliate,
      [`${EMAIL_INDEX_PATH}/${emailHash}`]: id,
      [`${CODE_INDEX_PATH}/${safeKey(code)}`]: id
    });
  } catch (error) {
    await Promise.allSettled([
      releaseReservation(emailRef, emailReservation),
      releaseReservation(codeRef, reservation)
    ]);
    throw error;
  }

  return affiliate;
}

async function releaseReservation(ref, reservation) {
  await ref.transaction(current => current === reservation ? null : current);
}

async function createSession(db, req, res, affiliateId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const now = Date.now();
  await db.ref(`${SESSIONS_PATH}/${tokenHash}`).set({
    affiliateId,
    createdAt: new Date(now).toISOString(),
    expiresAt: now + SESSION_MAX_AGE_SECONDS * 1000
  });
  res.setHeader("set-cookie", sessionCookie(req, token));
  return token;
}

async function clearSession(db, req, res) {
  const token = parseCookies(req)[SESSION_COOKIE] || "";
  if (token) await db.ref(`${SESSIONS_PATH}/${sha256(token)}`).remove().catch(() => {});
  res.setHeader("set-cookie", sessionCookie(req, "", 0));
}

async function getSessionAffiliate(db, req) {
  const token = parseCookies(req)[SESSION_COOKIE] || "";
  if (!token) return null;
  const tokenHash = sha256(token);
  const sessionSnap = await db.ref(`${SESSIONS_PATH}/${tokenHash}`).once("value");
  const session = sessionSnap.val();
  if (!session || Number(session.expiresAt || 0) <= Date.now()) {
    await db.ref(`${SESSIONS_PATH}/${tokenHash}`).remove().catch(() => {});
    return null;
  }
  const affiliateSnap = await db.ref(`${AFFILIATES_PATH}/${safeKey(session.affiliateId)}`).once("value");
  return affiliateSnap.val() || null;
}

async function loginAffiliate(db, emailValue, password) {
  const email = normalizeEmail(emailValue);
  const emailHash = sha256(email);
  const indexSnap = await db.ref(`${EMAIL_INDEX_PATH}/${emailHash}`).once("value");
  const affiliateId = indexSnap.val();
  if (!affiliateId) return null;

  const ref = db.ref(`${AFFILIATES_PATH}/${safeKey(affiliateId)}`);
  const snap = await ref.once("value");
  const affiliate = snap.val();
  if (!affiliate) return null;

  const now = Date.now();
  if (Number(affiliate.loginLockedUntil || 0) > now) {
    const error = new Error("Too many failed attempts. Try again in 15 minutes.");
    error.statusCode = 429;
    throw error;
  }

  if (!passwordMatches(password, affiliate.password)) {
    const failed = Number(affiliate.failedLogins || 0) + 1;
    await ref.update({
      failedLogins: failed >= MAX_FAILED_LOGINS ? 0 : failed,
      loginLockedUntil: failed >= MAX_FAILED_LOGINS ? now + LOGIN_LOCK_MS : 0,
      updatedAt: new Date().toISOString()
    });
    return null;
  }

  await ref.update({ failedLogins: 0, loginLockedUntil: 0, lastLoginAt: new Date().toISOString() });
  return affiliate;
}

async function getAffiliateDashboard(db, affiliate) {
  const conversionsSnap = await db.ref(CONVERSIONS_PATH)
    .orderByChild("affiliateId")
    .equalTo(affiliate.id)
    .limitToLast(50)
    .once("value");
  const conversions = [];
  conversionsSnap.forEach(child => {
    const value = child.val() || {};
    conversions.push({
      orderId: value.orderId,
      type: value.type || "paid_sale",
      productId: value.productId || "",
      grossCents: Number(value.grossCents || 0),
      commissionCents: Number(value.commissionCents || 0),
      currency: value.currency || "USD",
      status: value.status || "pending",
      createdAt: value.createdAt || ""
    });
  });
  conversions.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const analytics = await getAffiliateAnalytics(db, affiliate.id);
  return { affiliate: publicAffiliate(affiliate), conversions, events: analytics.events, productPerformance: analytics.productPerformance };
}

async function trackAffiliateClick(db, input) {
  return recordAffiliateEvent(db, { ...input, type: "referral_click" });
}

function extractReferralCode(payload) {
  const metadata = payload && typeof payload.metadata === "object" ? payload.metadata : {};
  return normalizeCode(metadata.emx_ref || metadata.emxRef || payload.emx_ref || "");
}

async function recordAffiliateConversion(db, payload, orderId) {
  const code = extractReferralCode(payload);
  if (!code || !orderId) return null;
  const conversionRef = db.ref(`${CONVERSIONS_PATH}/${safeKey(orderId)}`);
  const existing = await conversionRef.once("value");
  if (existing.exists()) return existing.val();

  const indexSnap = await db.ref(`${CODE_INDEX_PATH}/${safeKey(code)}`).once("value");
  const affiliateId = indexSnap.val();
  if (!affiliateId) return null;
  const affiliateRef = db.ref(`${AFFILIATES_PATH}/${safeKey(affiliateId)}`);
  const affiliateSnap = await affiliateRef.once("value");
  const affiliate = affiliateSnap.val();
  if (!isAffiliateActive(affiliate)) return null;

  const grossCents = Math.max(0, Math.round(Number(payload.price || 0)));
  const rateBps = Math.min(10000, Math.max(0, Math.round(Number(affiliate.rateBps || 0))));
  const commissionCents = Math.floor(grossCents * rateBps / 10000);
  const metadata = payload && typeof payload.metadata === "object" ? payload.metadata : {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const productId = String(metadata.emx_product || metadata.emxProduct || items[0]?.product_key || items[0]?.product_link || "paid-product").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
  const conversion = {
    orderId,
    affiliateId,
    code,
    type: "paid_sale",
    productId,
    grossCents,
    rateBps,
    commissionCents,
    currency: String(payload.currency || "USD").toUpperCase().slice(0, 8),
    status: "pending",
    createdAt: new Date().toISOString()
  };
  let inserted = false;
  const created = await conversionRef.transaction(current => {
    if (current) return;
    inserted = true;
    return conversion;
  });
  if (!inserted || !created.committed) return created.snapshot.val();

  const statsRef = affiliateRef.child("stats");
  await statsRef.transaction(stats => {
    const next = stats || {};
    next.conversions = Number(next.conversions || 0) + 1;
    next.paidConversions = Number(next.paidConversions || 0) + 1;
    next.grossCents = Number(next.grossCents || 0) + grossCents;
    next.pendingCommissionCents = Number(next.pendingCommissionCents || 0) + commissionCents;
    return next;
  });
  await affiliateRef.update({ lastActivityAt: conversion.createdAt, lastConversionAt: conversion.createdAt });
  await recordPaidConversionAggregates(db, conversion);
  return conversion;
}

async function recordAffiliateRefund(db, orderId, amountRefunded, originalAmount) {
  const ref = db.ref(`${CONVERSIONS_PATH}/${safeKey(orderId)}`);
  const snap = await ref.once("value");
  const conversion = snap.val();
  if (!conversion || conversion.status === "paid") return null;

  const adjustment = calculateRefundAdjustment(conversion, amountRefunded, originalAmount);
  if (adjustment.deltaCommissionCents < 1) return { ...conversion, duplicate: true };
  await ref.update({
    status: adjustment.full ? "reversed" : "partially-refunded",
    amountRefundedCents: adjustment.refundedCents,
    reversedCommissionCents: adjustment.totalReversedCommissionCents,
    updatedAt: new Date().toISOString()
  });

  const statsRef = db.ref(`${AFFILIATES_PATH}/${safeKey(conversion.affiliateId)}/stats`);
  await statsRef.transaction(stats => {
    const next = stats || {};
    next.pendingCommissionCents = Math.max(0, Number(next.pendingCommissionCents || 0) - adjustment.deltaCommissionCents);
    next.reversedCommissionCents = Number(next.reversedCommissionCents || 0) + adjustment.deltaCommissionCents;
    if (adjustment.full && conversion.status !== "reversed") next.conversions = Math.max(0, Number(next.conversions || 0) - 1);
    return next;
  });
  return {
    ...conversion,
    status: adjustment.full ? "reversed" : "partially-refunded",
    reversedCommissionCents: adjustment.totalReversedCommissionCents
  };
}

function calculateRefundAdjustment(conversion, amountRefunded, originalAmount) {
  const originalCents = Math.max(1, Math.round(Number(originalAmount || conversion.grossCents || 1)));
  const refundedCents = Math.min(originalCents, Math.max(0, Math.round(Number(amountRefunded || originalCents))));
  const commissionCents = Math.max(0, Math.round(Number(conversion.commissionCents || 0)));
  const previousReversed = Math.min(commissionCents, Math.max(0, Math.round(Number(conversion.reversedCommissionCents || 0))));
  const totalReversedCommissionCents = Math.min(
    commissionCents,
    Math.floor(commissionCents * refundedCents / originalCents)
  );
  return {
    originalCents,
    refundedCents,
    totalReversedCommissionCents,
    deltaCommissionCents: Math.max(0, totalReversedCommissionCents - previousReversed),
    full: refundedCents >= originalCents
  };
}

async function listAffiliatesForAdmin(db) {
  const snap = await db.ref(AFFILIATES_PATH).once("value");
  const affiliates = [];
  snap.forEach(child => affiliates.push(publicAffiliate(child.val() || {})));
  return affiliates.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function updateAffiliateForAdmin(db, input) {
  const id = safeKey(input.id);
  if (!id) throw new Error("Affiliate ID is required.");
  const ref = db.ref(`${AFFILIATES_PATH}/${id}`);
  const snap = await ref.once("value");
  const current = snap.val();
  if (!current) throw new Error("Affiliate was not found.");

  const requested = String(input.status || "").toLowerCase();
  const status = ["active", "suspended", "rejected", "banned", "pending", "approved", "disabled"].includes(requested)
    ? (requested === "approved" ? "active" : requested === "disabled" ? "suspended" : requested)
    : current.status;
  const rateBps = Math.min(10000, Math.max(0, Math.round(Number(input.rateBps ?? current.rateBps ?? 0))));
  const updates = { status, rateBps, updatedAt: new Date().toISOString() };
  if (status === "active" && !isAffiliateActive(current)) updates.approvedAt = new Date().toISOString();
  if (Object.prototype.hasOwnProperty.call(input, "notes")) updates.notes = String(input.notes || "").replace(/[<>]/g, "").trim().slice(0, 500);
  await ref.update(updates);
  await writeAdminAudit(db, `affiliate.${status}`, id, { rateBps });
  return publicAffiliate({ ...current, ...updates });
}

async function recordPayoutForAdmin(db, input) {
  const affiliateId = safeKey(input.id);
  const amountCents = Math.max(0, Math.round(Number(input.amountCents || 0)));
  if (!affiliateId || amountCents < 1) throw new Error("Affiliate ID and payout amount are required.");
  const affiliateRef = db.ref(`${AFFILIATES_PATH}/${affiliateId}`);
  const snap = await affiliateRef.once("value");
  const affiliate = snap.val();
  if (!affiliate) throw new Error("Affiliate was not found.");
  const pending = Number(affiliate.stats?.pendingCommissionCents || 0);
  if (amountCents > pending) throw new Error("Payout cannot exceed pending commission.");

  const payoutId = crypto.randomUUID();
  const payout = {
    id: payoutId,
    affiliateId,
    amountCents,
    note: String(input.note || "").replace(/[<>]/g, "").trim().slice(0, 180),
    recordedAt: new Date().toISOString()
  };
  await db.ref(`${PAYOUTS_PATH}/${safeKey(payoutId)}`).set(payout);
  await affiliateRef.child("stats").transaction(stats => {
    const next = stats || {};
    next.pendingCommissionCents = Math.max(0, Number(next.pendingCommissionCents || 0) - amountCents);
    next.paidCommissionCents = Number(next.paidCommissionCents || 0) + amountCents;
    return next;
  });
  await writeAdminAudit(db, "affiliate.payout-recorded", affiliateId, { payoutId, amountCents });
  return payout;
}

module.exports = {
  calculateRefundAdjustment,
  clearSession,
  createAffiliate,
  createSession,
  extractReferralCode,
  getAffiliateDashboard,
  getDb,
  getSessionAffiliate,
  hasValidOrigin,
  listAffiliatesForAdmin,
  loginAffiliate,
  normalizeCode,
  normalizeDisplayName,
  normalizeEmail,
  publicAffiliate,
  recordAffiliateConversion,
  recordAffiliateRefund,
  recordPayoutForAdmin,
  sendJson,
  trackAffiliateClick,
  updateAffiliateForAdmin,
  validatePassword
};
