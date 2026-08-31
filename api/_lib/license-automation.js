const crypto = require("crypto");
const {
  recordAffiliateConversion,
  recordAffiliateRefund
} = require("./affiliate-program");

const LICENSE_POOL_PATH = "licensePool";
const LICENSES_PATH = "licenses";
const CUSTOMERS_PATH = "customersByEmailHash";
const ORDERS_PATH = "orders";

const BASE_PRODUCT_MAP = {
  Isg28: ["EMX_OS"],
  KQLzN: ["EMX_ZERO_DELAY"],
  "0TOjr": ["EMX_MACRO"],
  TJFav: ["EMX_TWEAK_DASHBOARD"],
  Oqz73: ["EMX_VOLT"],
  EQIrd: ["EMX_FPS"],
  By7FV: ["EMX_TWEAK_DASHBOARD", "EMX_VOLT"],
  OS_MACRO_BUNDLE_TEST: ["EMX_TWEAK_DASHBOARD", "EMX_VOLT"],
  Bundle: ["EMX_ZERO_DELAY", "EMX_MACRO", "EMX_FPS"]
};

const PRODUCT_LABELS = {
  EMX_OS: "EMX Custom OS",
  EMX_ZERO_DELAY: "EMX Ultimate Tweak Utility",
  EMX_MACRO: "EMX Premium KBM Macro",
  EMX_TWEAK_DASHBOARD: "EMX Windows Tweak Dashboard",
  EMX_VOLT: "EMX VOLT Macro",
  EMX_FPS: "EMX FPS Booster",
  EMX_CONTROLLER_MACRO: "EMX Controller Macro"
};

function getProductMap() {
  const productMap = { ...BASE_PRODUCT_MAP };
  const osMacroBundleKey = String(
    process.env.EMX_OS_MACRO_BUNDLE_PAYHIP_KEY
      || process.env.EMX_OS_MACRO_BUNDLE_PRODUCT_KEY
      || ""
  ).trim();

  if (osMacroBundleKey) {
    productMap[osMacroBundleKey] = ["EMX_OS", "EMX_MACRO"];
  }

  return productMap;
}

function sendJson(res, response, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(response));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashEmail(email) {
  return crypto.createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

function normalizeLicenseKey(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 80);
}

function safeFirebaseKey(value) {
  return String(value || "")
    .trim()
    .replace(/[.#$/[\]]/g, "_")
    .slice(0, 160);
}

function maskEmail(email) {
  const clean = normalizeEmail(email);
  const [name, domain] = clean.split("@");
  if (!name || !domain) return "";

  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(2, name.length - visible.length))}@${domain}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function generatedKeysEnabled() {
  const value = String(process.env.EMX_ALLOW_GENERATED_KEYS || "true").trim().toLowerCase();
  return !["0", "false", "no", "off"].includes(value);
}

function verifyPayhipSignature(payload) {
  const apiKey = process.env.PAYHIP_API_KEY || "";
  if (!apiKey) {
    return { ok: false, error: "PAYHIP_API_KEY is not configured." };
  }

  const expected = sha256(apiKey);
  const actual = String(payload && payload.signature ? payload.signature : "").trim();
  if (!actual || actual !== expected) {
    return { ok: false, error: "Invalid Payhip webhook signature." };
  }

  return { ok: true };
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return null;
    }
  }

  return {};
}

function getDb() {
  const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.EMX_FIREBASE_DATABASE_URL || "";
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.EMX_FIREBASE_SERVICE_ACCOUNT_JSON || "";

  if (!databaseURL || !serviceAccountRaw) {
    throw new Error("Firebase Admin is not configured. Set FIREBASE_DATABASE_URL and FIREBASE_SERVICE_ACCOUNT_JSON.");
  }

  let credentialJson;
  try {
    credentialJson = JSON.parse(serviceAccountRaw);
  } catch (error) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }

  const { cert, getApps, initializeApp } = require("firebase-admin/app");
  const { getDatabase } = require("firebase-admin/database");
  const appName = "emx-license-automation";
  const app = getApps().find(candidate => candidate.name === appName)
    || initializeApp({ credential: cert(credentialJson), databaseURL }, appName);
  return getDatabase(app);
}

function getProductsFromItems(items = []) {
  const productMap = getProductMap();
  const productIds = new Set();
  const seenProductKeys = [];

  for (const item of items) {
    const rawKey = String(item.product_key || item.product_link || item.key || "").trim();
    if (rawKey) seenProductKeys.push(rawKey);

    const mapped = productMap[rawKey];
    if (mapped) {
      mapped.forEach(productId => productIds.add(productId));
    }
  }

  return {
    productIds: Array.from(productIds),
    productKeys: seenProductKeys
  };
}

function buildProductsObject(productIds = []) {
  return productIds.reduce((memo, productId) => {
    memo[productId] = true;
    return memo;
  }, {});
}

function buildOrderProductsObject(productIds = []) {
  return productIds.reduce((memo, productId) => {
    memo[productId] = {
      enabled: true,
      label: PRODUCT_LABELS[productId] || productId
    };
    return memo;
  }, {});
}

function makeRandomLicenseKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const groups = [];

  for (let g = 0; g < 4; g += 1) {
    let part = "";
    for (let i = 0; i < 5; i += 1) {
      part += alphabet[crypto.randomInt(0, alphabet.length)];
    }
    groups.push(part);
  }

  return `EMX-${groups.join("-")}`;
}

function getLicenseClaimUrl() {
  return String(
    process.env.EMX_LICENSE_CLAIM_URL
      || "https://activate.emxtweaks.com"
  ).trim();
}

async function syncVoltLicense(details, options = {}) {
  const productIds = Array.isArray(details.productIds) ? details.productIds : [];
  if (!productIds.includes("EMX_VOLT")) {
    return { status: "skipped", reason: "volt-not-in-order" };
  }

  const endpoint = String(
    options.endpoint || process.env.EMX_VOLT_LICENSE_SYNC_URL || ""
  ).trim().replace(/\/$/, "");
  const secret = String(
    options.secret || process.env.EMX_LICENSE_SYNC_SECRET || ""
  ).trim();

  if (!endpoint || !secret) {
    return { status: "skipped", reason: "volt-sync-not-configured" };
  }

  if (typeof fetch !== "function") {
    return { status: "failed", reason: "fetch-unavailable" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${endpoint}/internal/licenses/sync`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        licenseKey: normalizeLicenseKey(details.licenseKey),
        ownerEmail: normalizeEmail(details.ownerEmail),
        plan: "lifetime",
        maxDevices: 1
      }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.ok) {
      return {
        status: "failed",
        statusCode: response.status,
        reason: body.error || "volt-sync-failed"
      };
    }

    return {
      status: "synced",
      created: Boolean(body.created),
      licenseId: String(body.licenseId || "")
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error && error.name === "AbortError" ? "volt-sync-timeout" : "volt-sync-unavailable"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function syncUnifiedLicense(details, options = {}) {
  const productIds = Array.isArray(details.productIds) ? details.productIds : [];
  if (!productIds.length) {
    return { status: "skipped", reason: "no-products" };
  }

  const endpoint = String(
    options.endpoint || process.env.EMX_UNIFIED_LICENSE_SYNC_URL || ""
  ).trim().replace(/\/$/, "");
  const secret = String(
    options.secret || process.env.EMX_LICENSE_SYNC_SECRET || ""
  ).trim();
  if (!endpoint || !secret) {
    return { status: "skipped", reason: "unified-sync-not-configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${endpoint}/api/licenses/internal/sync`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        licenseKey: normalizeLicenseKey(details.licenseKey),
        ownerEmail: normalizeEmail(details.ownerEmail),
        externalReference: String(details.externalReference || "").trim(),
        productIds,
        source: "payhip-webhook"
      }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) {
      return {
        status: "failed",
        statusCode: response.status,
        reason: body.error || "unified-sync-failed"
      };
    }
    return {
      status: "synced",
      created: Boolean(body.created),
      licenseId: String(body.licenseId || ""),
      productIds: Array.isArray(body.productIds) ? body.productIds : []
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error && error.name === "AbortError"
        ? "unified-sync-timeout"
        : "unified-sync-unavailable"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function syncProductLicenses(details) {
  const licenseKeys = details.licenseKeys && typeof details.licenseKeys === "object"
    ? details.licenseKeys
    : Object.fromEntries(
      (details.productIds || []).map(productId => [productId, details.licenseKey])
    );
  const entries = Object.entries(licenseKeys)
    .map(([productId, licenseKey]) => ({
      productId,
      licenseKey: normalizeLicenseKey(licenseKey)
    }))
    .filter(entry => entry.licenseKey);

  const results = await Promise.all(entries.map(async entry => {
    const scopedDetails = {
      licenseKey: entry.licenseKey,
      ownerEmail: details.ownerEmail,
      externalReference: details.orderId,
      productIds: [entry.productId]
    };
    const [unified, volt] = await Promise.all([
      syncUnifiedLicense(scopedDetails),
      syncVoltLicense(scopedDetails)
    ]);
    return [entry.productId, { unified, volt }];
  }));

  return Object.fromEntries(results);
}

async function sendLicenseEmail(email, details) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(
    process.env.EMX_LICENSE_EMAIL_FROM
      || process.env.EMX_EMAIL_FROM
      || ""
  ).trim();

  if (!apiKey || !from) {
    return {
      status: "skipped",
      reason: "email-provider-not-configured"
    };
  }

  if (typeof fetch !== "function") {
    return {
      status: "failed",
      reason: "fetch-unavailable"
    };
  }

  const orderId = String(details.orderId || "");
  const licenseKeys = details.licenseKeys && typeof details.licenseKeys === "object"
    ? details.licenseKeys
    : Object.fromEntries(
      (details.productIds || []).map(productId => [productId, details.licenseKey])
    );
  const productLabels = (details.productIds || [])
    .map(productId => PRODUCT_LABELS[productId] || productId)
    .filter(Boolean);
  const productText = productLabels.length ? productLabels.join(", ") : "EMX product access";
  const claimUrl = getLicenseClaimUrl();
  const supportUrl = String(process.env.EMX_DISCORD_SUPPORT_URL || "https://discord.gg/puaZFNfNKW").trim();
  const replyTo = String(process.env.EMX_LICENSE_REPLY_TO || process.env.EMX_SUPPORT_EMAIL || "").trim();

  const licenseCards = Object.entries(licenseKeys).map(([productId, rawKey]) => {
    const licenseKey = normalizeLicenseKey(rawKey);
    const label = PRODUCT_LABELS[productId] || productId;
    return `<div style="margin:12px 0;padding:18px;border-radius:14px;background:#000;border:1px solid #263b28;text-align:center;">
      <div style="font-size:12px;color:#9aa0a6;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(label)}</div>
      <div style="font-size:22px;font-weight:800;color:#24ff24;letter-spacing:1px;margin-top:8px;">${escapeHtml(licenseKey)}</div>
    </div>`;
  }).join("");
  const textLicenseLines = Object.entries(licenseKeys).map(([productId, rawKey]) =>
    `${PRODUCT_LABELS[productId] || productId}: ${normalizeLicenseKey(rawKey)}`
  );

  const html = `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#ffffff;padding:28px;">
      <div style="max-width:620px;margin:0 auto;border:1px solid #1fdc35;border-radius:18px;padding:24px;background:#0b0d10;">
        <h1 style="margin:0 0 12px;font-size:28px;color:#24ff24;">Your EMX license is ready</h1>
        <p style="color:#d8d8d8;line-height:1.55;">Thanks for your purchase. Each product has its own one-PC license key: <strong>${escapeHtml(productText)}</strong>.</p>
        ${licenseCards}
        <p style="color:#cfcfcf;line-height:1.55;">Order ID: <strong>${escapeHtml(orderId)}</strong></p>
        <p style="color:#cfcfcf;line-height:1.55;">If you ever need to recover it, use your Payhip email and transaction ID here:</p>
        <p><a href="${escapeHtml(claimUrl)}" style="display:inline-block;background:#24ff24;color:#000;padding:13px 18px;border-radius:999px;text-decoration:none;font-weight:800;">Claim / Recover Key</a></p>
        <p style="color:#9aa0a6;line-height:1.55;">Need help installing or activating? Join support: <a href="${escapeHtml(supportUrl)}" style="color:#8ea2ff;">${escapeHtml(supportUrl)}</a></p>
      </div>
    </div>
  `;

  const text = [
    "Your EMX license is ready.",
    "",
    `Products: ${productText}`,
    "Each product has its own one-PC license key:",
    ...textLicenseLines,
    `Order ID: ${orderId}`,
    "",
    `Recover key: ${claimUrl}`,
    `Support: ${supportUrl}`
  ].join("\n");

  const payload = {
    from,
    to: [email],
    subject: "Your EMX license key",
    html,
    text
  };

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": `emx-license-${orderId}`
    },
    body: JSON.stringify(payload)
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      status: "failed",
      provider: "resend",
      statusCode: response.status,
      reason: responseBody.message || responseBody.error || "email-send-failed"
    };
  }

  return {
    status: "sent",
    provider: "resend",
    id: responseBody.id || ""
  };
}

async function countUnusedPoolKeys(db, limit = 30) {
  const snap = await db.ref(LICENSE_POOL_PATH)
    .orderByChild("status")
    .equalTo("unused")
    .limitToFirst(limit)
    .once("value");

  let count = 0;
  snap.forEach(() => {
    count += 1;
  });

  return count;
}

async function topUpLicensePool(db, minimumUnused = 30, reason = "auto-topup") {
  const unusedCount = await countUnusedPoolKeys(db, minimumUnused);

  if (unusedCount >= minimumUnused) {
    return {
      created: 0,
      unusedCount
    };
  }

  const now = new Date().toISOString();
  const updates = {};
  const createdKeys = new Set();
  const needed = minimumUnused - unusedCount;

  while (createdKeys.size < needed) {
    const key = makeRandomLicenseKey();
    if (createdKeys.has(key)) continue;

    createdKeys.add(key);
    updates[`${safeFirebaseKey(key)}`] = {
      key,
      licenseKey: key,
      status: "unused",
      source: reason,
      generatedAt: now
    };
  }

  await db.ref(LICENSE_POOL_PATH).update(updates);

  return {
    created: createdKeys.size,
    unusedCount: unusedCount + createdKeys.size
  };
}

async function reserveLicenseFromPool(db, orderId) {
  const snap = await db.ref(LICENSE_POOL_PATH)
    .orderByChild("status")
    .equalTo("unused")
    .limitToFirst(10)
    .once("value");

  if (!snap.exists()) return null;

  const candidates = [];
  snap.forEach(child => {
    candidates.push({ nodeKey: child.key, value: child.val() || {} });
  });

  for (const candidate of candidates) {
    const key = normalizeLicenseKey(candidate.value.key || candidate.nodeKey);
    if (!key) continue;

    const ref = db.ref(`${LICENSE_POOL_PATH}/${safeFirebaseKey(candidate.nodeKey)}`);
    const currentSnap = await ref.once("value");
    const current = currentSnap.val();

    if (!current || current.status !== "unused") continue;

    await ref.update({
      key,
      status: "reserved",
      reservedForOrder: orderId,
      reservedAt: new Date().toISOString()
    });

    return key;
  }

  return null;
}

async function getOrCreateProductLicenseKey(
  db,
  customer,
  productId,
  orderId,
  options = {}
) {
  const productKey = normalizeLicenseKey(
    customer && customer.licenseKeys && customer.licenseKeys[productId]
  );
  if (productKey) {
    return {
      licenseKey: productKey,
      isNewLicense: false
    };
  }

  // Existing customers keep a shared legacy key only for products that key
  // already owned. Newly purchased products always receive a separate key.
  const legacyKey = normalizeLicenseKey(customer && customer.licenseKey);
  if (legacyKey && customer.products && customer.products[productId] === true) {
    return { licenseKey: legacyKey, isNewLicense: false };
  }

  let licenseKey = await reserveLicenseFromPool(db, `${orderId}:${productId}`);

  if (!licenseKey && options.allowGeneratedKeys === true) {
    const minimumGeneratedPool = Number(process.env.EMX_GENERATED_POOL_SIZE || 30);
    await topUpLicensePool(db, Math.max(1, minimumGeneratedPool), "auto-generated-empty-pool");
    licenseKey = await reserveLicenseFromPool(db, `${orderId}:${productId}`);

    if (!licenseKey) {
      licenseKey = makeRandomLicenseKey();
    }
  }

  if (!licenseKey) {
    throw new Error("No unused EMX license keys are available in Firebase licensePool.");
  }

  return {
    licenseKey,
    isNewLicense: true
  };
}

function normalizeOrderLicenseKeys(order, productIds) {
  const stored = order && order.licenseKeys && typeof order.licenseKeys === "object"
    ? order.licenseKeys
    : {};
  const legacyKey = normalizeLicenseKey(order && order.licenseKey);
  return Object.fromEntries(productIds
    .map(productId => [
      productId,
      normalizeLicenseKey(stored[productId]) || legacyKey
    ])
    .filter(([, licenseKey]) => Boolean(licenseKey)));
}

async function applyPaidPurchase(payload, options = {}) {
  const email = normalizeEmail(payload.email || payload.customer_email);
  const orderId = safeFirebaseKey(payload.id || payload.transaction_id || payload.order_id);
  const items = Array.isArray(payload.items) ? payload.items : [];
  const { productIds, productKeys } = getProductsFromItems(items);
  const now = new Date().toISOString();

  if (!email || !email.includes("@")) {
    throw new Error("Payhip webhook is missing buyer email.");
  }

  if (!orderId) {
    throw new Error("Payhip webhook is missing transaction id.");
  }

  if (!productIds.length) {
    throw new Error(`Payhip product key is not mapped to an EMX product: ${productKeys.join(", ") || "none"}`);
  }

  const emailHash = hashEmail(email);
  const plan = {
    type: "paid",
    orderId,
    emailHash,
    buyerEmailMasked: maskEmail(email),
    productKeys,
    productIds,
    products: buildProductsObject(productIds),
    orderProducts: buildOrderProductsObject(productIds)
  };

  if (options.dryRun) {
    const previewKey = options.previewLicenseKey || "EMX-PREVIEW-KEY";
    return {
      ...plan,
      dryRun: true,
      licenseKey: previewKey,
      licenseKeys: Object.fromEntries(
        productIds.map(productId => [productId, previewKey])
      ),
      isNewLicense: "unknown"
    };
  }

  const db = options.db || getDb();
  const orderRef = db.ref(`${ORDERS_PATH}/${orderId}`);
  const orderSnap = await orderRef.once("value");
  const existingOrder = orderSnap.val();
  const affiliateConversion = await recordAffiliateConversion(db, payload, orderId);

  if (existingOrder && existingOrder.processed === true) {
    const licenseKeys = normalizeOrderLicenseKeys(existingOrder, productIds);
    const productSync = await syncProductLicenses({
      licenseKeys,
      ownerEmail: email,
      productIds
    });
    await orderRef.update({
      productSync: {
        ...productSync,
        updatedAt: now
      },
      updatedAt: now
    });
    return {
      ...plan,
      alreadyProcessed: true,
      licenseKey: normalizeLicenseKey(existingOrder.licenseKey || ""),
      licenseKeys,
      isNewLicense: false,
      productSync,
      affiliate: affiliateConversion
        ? { code: affiliateConversion.code, status: affiliateConversion.status }
        : null
    };
  }

  const customerRef = db.ref(`${CUSTOMERS_PATH}/${emailHash}`);
  const customerSnap = await customerRef.once("value");
  const existingCustomer = customerSnap.val() || {};
  const licenseKeys = {};
  const isNewByProduct = {};

  for (const productId of productIds) {
    const result = await getOrCreateProductLicenseKey(
      db,
      existingCustomer,
      productId,
      orderId,
      { allowGeneratedKeys: generatedKeysEnabled() }
    );
    licenseKeys[productId] = result.licenseKey;
    isNewByProduct[productId] = result.isNewLicense;

    const safeLicenseKey = safeFirebaseKey(result.licenseKey);
    const licenseRef = db.ref(`${LICENSES_PATH}/${safeLicenseKey}`);
    const licenseSnap = await licenseRef.once("value");
    const existingLicense = licenseSnap.val() || {};
    await licenseRef.set({
      ...existingLicense,
      key: result.licenseKey,
      licenseKey: result.licenseKey,
      product: existingLicense.product || productId,
      active: existingLicense.active !== false,
      enabled: existingLicense.enabled !== false,
      used: existingLicense.used === true,
      hwid: existingLicense.hwid || "",
      source: existingLicense.source || "payhip-webhook-product-key",
      emailHash,
      buyerEmailMasked: maskEmail(email),
      products: {
        ...(existingLicense.products || {}),
        [productId]: true
      },
      orders: {
        ...(existingLicense.orders || {}),
        [orderId]: true
      },
      createdAt: existingLicense.createdAt || now,
      updatedAt: now
    });
  }

  const licenseKey = licenseKeys[productIds[0]];
  const isNewLicense = Object.values(isNewByProduct).some(Boolean);
  await customerRef.set({
    ...existingCustomer,
    licenseKey: existingCustomer.licenseKey || licenseKey,
    licenseKeys: {
      ...(existingCustomer.licenseKeys || {}),
      ...licenseKeys
    },
    buyerEmailMasked: maskEmail(email),
    products: {
      ...(existingCustomer.products || {}),
      ...buildProductsObject(productIds)
    },
    orders: {
      ...(existingCustomer.orders || {}),
      [orderId]: true
    },
    createdAt: existingCustomer.createdAt || now,
    updatedAt: now
  });

  await orderRef.set({
    processed: true,
    type: "paid",
    emailHash,
    buyerEmailMasked: maskEmail(email),
    licenseKey,
    licenseKeys,
    productKeys,
    products: buildOrderProductsObject(productIds),
    payhipDate: payload.date || null,
    amount: payload.price || null,
    currency: payload.currency || null,
    affiliate: affiliateConversion
      ? {
          affiliateId: affiliateConversion.affiliateId,
          code: affiliateConversion.code,
          commissionCents: affiliateConversion.commissionCents,
          status: affiliateConversion.status
        }
      : null,
    emailDelivery: {
      status: "pending",
      updatedAt: now
    },
    createdAt: now,
    updatedAt: now
  });

  const productSync = await syncProductLicenses({
    licenseKeys,
    ownerEmail: email,
    orderId,
    productIds
  });

  await orderRef.update({
    productSync: {
      ...productSync,
      updatedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  });

  const emailDelivery = await sendLicenseEmail(email, {
    orderId,
    licenseKey,
    licenseKeys,
    productIds
  });

  await orderRef.update({
    emailDelivery: {
      ...emailDelivery,
      updatedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  });

  return {
    ...plan,
    alreadyProcessed: false,
    licenseKey,
    licenseKeys,
    isNewByProduct,
    isNewLicense,
    productSync,
    emailDelivery,
    affiliate: affiliateConversion
      ? { code: affiliateConversion.code, status: affiliateConversion.status }
      : null
  };
}

async function applyRefund(payload, options = {}) {
  const orderId = safeFirebaseKey(payload.id || payload.transaction_id || payload.order_id);
  const now = new Date().toISOString();

  if (!orderId) {
    throw new Error("Payhip refund webhook is missing transaction id.");
  }

  if (options.dryRun) {
    return {
      type: "refunded",
      orderId,
      dryRun: true,
      action: "mark-refunded-only"
    };
  }

  const db = options.db || getDb();
  const affiliateRefund = await recordAffiliateRefund(
    db,
    orderId,
    payload.amount_refunded,
    payload.price
  );
  await db.ref(`${ORDERS_PATH}/${orderId}`).update({
    refunded: true,
    refundType: payload.amount_refunded === payload.price ? "full" : "partial",
    amountRefunded: payload.amount_refunded || null,
    refundedAt: now,
    updatedAt: now
  });

  return {
    type: "refunded",
    orderId,
    action: "marked-refunded",
    affiliate: affiliateRefund
      ? { code: affiliateRefund.code, reversedCommissionCents: affiliateRefund.reversedCommissionCents }
      : null
  };
}

async function processPayhipPayload(payload, options = {}) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid webhook payload.");
  }

  if (payload.type === "paid") {
    return applyPaidPurchase(payload, options);
  }

  if (payload.type === "refunded") {
    return applyRefund(payload, options);
  }

  return {
    ignored: true,
    type: payload.type || "unknown"
  };
}

async function lookupLicenseByReceipt(email, orderId) {
  const cleanEmail = normalizeEmail(email);
  const cleanOrderId = safeFirebaseKey(orderId);

  if (!cleanEmail || !cleanEmail.includes("@") || !cleanOrderId) {
    throw new Error("Email and Payhip transaction id are required.");
  }

  const db = getDb();
  const orderSnap = await db.ref(`${ORDERS_PATH}/${cleanOrderId}`).once("value");
  const order = orderSnap.val();
  const emailHash = hashEmail(cleanEmail);

  if (
    !order ||
    order.emailHash !== emailHash ||
    (!order.licenseKey && !order.licenseKeys)
  ) {
    return null;
  }

  const productIds = Object.keys(order.products || {});
  const licenseKeys = normalizeOrderLicenseKeys(order, productIds);

  return {
    licenseKey: normalizeLicenseKey(order.licenseKey),
    licenseKeys,
    products: order.products || {},
    orderId: cleanOrderId
  };
}

module.exports = {
  BASE_PRODUCT_MAP,
  PRODUCT_LABELS,
  applyPaidPurchase,
  getProductMap,
  hashEmail,
  lookupLicenseByReceipt,
  normalizeEmail,
  normalizeLicenseKey,
  parseBody,
  processPayhipPayload,
  sendJson,
  syncProductLicenses,
  syncUnifiedLicense,
  syncVoltLicense,
  verifyPayhipSignature
};
