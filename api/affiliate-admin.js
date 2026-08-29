const crypto = require("crypto");
const { requireAdmin } = require("./_lib/admin-auth");
const { createAffiliate, getDb, listAffiliatesForAdmin, publicAffiliate, recordPayoutForAdmin, sendJson, updateAffiliateForAdmin } = require("./_lib/affiliate-program");
const { cleanCode, getAffiliateAnalytics, recordAffiliateEvent, recordFreeDownloadConversion, safeKey, writeAdminAudit } = require("./_lib/affiliate-analytics");

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(String(req.body || "{}")); } catch (error) { return {}; }
}

function summary(affiliates) {
  return affiliates.reduce((totals, item) => {
    const stats = item.stats || {};
    totals.totalAffiliates += 1;
    if (item.status === "active") totals.activeAffiliates += 1;
    totals.clicks += Number(stats.clicks || 0);
    totals.uniqueVisitors += Number(stats.uniqueVisitors || 0);
    totals.productViews += Number(stats.productViews || 0);
    totals.checkoutOpens += Number(stats.checkoutOpens || 0);
    totals.conversions += Number(stats.conversions || 0);
    totals.freeConversions += Number(stats.freeConversions || 0);
    totals.paidConversions += Number(stats.paidConversions || 0);
    totals.revenueCents += Number(stats.grossCents || 0);
    totals.commissionOwedCents += Number(stats.pendingCommissionCents || 0);
    totals.commissionPaidCents += Number(stats.paidCommissionCents || 0);
    totals.conversionRate = totals.uniqueVisitors ? totals.conversions / totals.uniqueVisitors : 0;
    return totals;
  }, { totalAffiliates: 0, activeAffiliates: 0, clicks: 0, uniqueVisitors: 0, productViews: 0, checkoutOpens: 0, conversions: 0, freeConversions: 0, paidConversions: 0, revenueCents: 0, commissionOwedCents: 0, commissionPaidCents: 0, conversionRate: 0 });
}

async function dailyTrends(db) {
  const snap = await db.ref("affiliateProgram/daily").limitToLast(30).once("value");
  const days = [];
  snap.forEach(daySnap => {
    const total = { date: daySnap.key, clicks: 0, productViews: 0, checkoutOpens: 0, conversions: 0, revenueCents: 0 };
    daySnap.forEach(affiliateSnap => Object.keys(total).forEach(key => { if (key !== "date") total[key] += Number(affiliateSnap.val()?.[key] || 0); }));
    days.push(total);
  });
  return days.sort((a,b) => a.date.localeCompare(b.date));
}

async function affiliateRecord(db, id) {
  const snap = await db.ref(`affiliateProgram/affiliates/${safeKey(id)}`).once("value");
  return snap.val() || null;
}

async function createTestAffiliate(db) {
  const suffix = Date.now().toString(36);
  const affiliate = await createAffiliate(db, { email: `affiliate-test-${suffix}@example.invalid`, displayName: `EMX Test ${suffix.slice(-4)}`, code: `emx-test-${suffix}`, password: `Test-${crypto.randomBytes(8).toString("hex")}9` });
  await db.ref(`affiliateProgram/affiliates/${safeKey(affiliate.id)}`).update({ isTest: true, notes: "Temporary affiliate created by Affiliate Command Center test mode." });
  await writeAdminAudit(db, "affiliate.test-created", affiliate.id, { code: affiliate.code });
  return { ...publicAffiliate({ ...affiliate, isTest: true }), isTest: true };
}

async function runDiagnostic(db, affiliate) {
  if (!affiliate || affiliate.status !== "active") throw new Error("The test affiliate must be active.");
  const visitorId = `diagnostic-${crypto.randomBytes(12).toString("hex")}`;
  const sessionId = `session-${crypto.randomBytes(10).toString("hex")}`;
  const click = await recordAffiliateEvent(db, { type: "referral_click", code: affiliate.code, visitorId, sessionId, page: "/", source: "affiliate-command-center" });
  const view = await recordAffiliateEvent(db, { type: "product_view", code: affiliate.code, visitorId, sessionId, page: "/products.html", productId: "window_deck", source: "affiliate-command-center" });
  const conversion = await recordFreeDownloadConversion(db, { code: affiliate.code, visitorId, sessionId, productId: "window_deck" });
  const analytics = await getAffiliateAnalytics(db, affiliate.id);
  const checks = [
    ["Referral Recognition", Boolean(affiliate.code)], ["Click Tracking", click.tracked === true], ["Product Navigation", view.tracked === true],
    ["Free Download Conversion", conversion.tracked === true], ["Affiliate Association", conversion.conversion?.affiliateId === affiliate.id],
    ["Dashboard Update", analytics.conversions.some(item => item.id === conversion.conversion?.id)]
  ].map(([label, passed]) => ({ label, passed }));
  await writeAdminAudit(db, "affiliate.diagnostic-run", affiliate.id, { passed: checks.every(item => item.passed) });
  return { passed: checks.every(item => item.passed), checks, visitorId, conversionId: conversion.conversion?.id || "" };
}

async function resetTestAffiliate(db, affiliate) {
  if (!affiliate?.isTest) throw new Error("Only temporary test affiliates can be reset.");
  const updates = {
    [`affiliateProgram/affiliates/${safeKey(affiliate.id)}`]: null,
    [`affiliateProgram/indexByCode/${safeKey(affiliate.code)}`]: null,
    [`affiliateProgram/indexByEmail/${safeKey(affiliate.emailHash)}`]: null,
    [`affiliateProgram/productStats/${safeKey(affiliate.id)}`]: null
  };
  for (const path of ["events", "conversions", "payouts"]) {
    const snap = await db.ref(`affiliateProgram/${path}`).orderByChild("affiliateId").equalTo(affiliate.id).once("value");
    snap.forEach(child => { updates[`affiliateProgram/${path}/${child.key}`] = null; });
  }
  await db.ref().update(updates);
  await writeAdminAudit(db, "affiliate.test-reset", affiliate.id, { code: affiliate.code });
}

async function reforgeCode(db, affiliate, requested) {
  const next = cleanCode(requested);
  if (next.length < 3) throw new Error("Referral code must contain at least three characters.");
  if (next === affiliate.code) return next;
  const nextRef = db.ref(`affiliateProgram/indexByCode/${safeKey(next)}`);
  const reserved = await nextRef.transaction(current => current || affiliate.id);
  if (!reserved.committed || reserved.snapshot.val() !== affiliate.id) throw new Error("That referral code is already in use.");
  await db.ref().update({ [`affiliateProgram/indexByCode/${safeKey(affiliate.code)}`]: null, [`affiliateProgram/affiliates/${safeKey(affiliate.id)}/code`]: next, [`affiliateProgram/affiliates/${safeKey(affiliate.id)}/updatedAt`]: new Date().toISOString() });
  await writeAdminAudit(db, "affiliate.code-reforged", affiliate.id, { previous: affiliate.code, next });
  return next;
}

module.exports = async function handler(req, res) {
  try {
    if (!requireAdmin(req)) return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
    const db = getDb();
    if (req.method === "GET") {
      const affiliates = await listAffiliatesForAdmin(db);
      const id = String(req.query?.id || "");
      if (id) {
        const affiliate = affiliates.find(item => item.id === id);
        if (!affiliate) return sendJson(res, { ok: false, error: "Affiliate was not found." }, 404);
        const analytics = await getAffiliateAnalytics(db, id);
        return sendJson(res, { ok: true, affiliate, ...analytics });
      }
      return sendJson(res, { ok: true, affiliates, summary: summary(affiliates), trends: await dailyTrends(db) });
    }
    if (req.method !== "POST") { res.setHeader("allow", "GET, POST"); return sendJson(res, { ok: false, error: "Method not allowed." }, 405); }
    const input = readBody(req);
    if (input.action === "create-test") return sendJson(res, { ok: true, affiliate: await createTestAffiliate(db) }, 201);
    if (input.action === "create-affiliate") return sendJson(res, { ok: true, affiliate: await createAffiliate(db, input) }, 201);
    const affiliate = await affiliateRecord(db, input.id);
    if (!affiliate) throw new Error("Affiliate was not found.");
    if (input.action === "run-test") return sendJson(res, { ok: true, diagnostic: await runDiagnostic(db, affiliate) });
    if (input.action === "reset-test") { await resetTestAffiliate(db, affiliate); return sendJson(res, { ok: true }); }
    if (input.action === "reforge-code") return sendJson(res, { ok: true, code: await reforgeCode(db, affiliate, input.code) });
    if (input.action === "record-payout") return sendJson(res, { ok: true, payout: await recordPayoutForAdmin(db, input) });
    return sendJson(res, { ok: true, affiliate: await updateAffiliateForAdmin(db, input) });
  } catch (error) {
    return sendJson(res, { ok: false, error: error instanceof Error ? error.message : "Affiliate command failed." }, 400);
  }
};
