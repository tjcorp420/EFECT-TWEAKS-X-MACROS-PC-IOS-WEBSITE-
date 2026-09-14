// EMX Account Hub API — one serverless function, routed by `action`.
// Backed by the site's existing Vercel KV (Upstash) store. Self-contained: email + password
// accounts (scrypt-hashed), HMAC session tokens, saved license keys per product. CRU keys are
// verified live against Payhip v2; other products' keys are stored as the user provides them
// until each product's secret is wired.
//
// Env: KV_REST_API_URL, KV_REST_API_TOKEN (existing), ACCOUNT_SECRET (session signing),
//      PAYHIP_SECRET_LWDBV (CRU product secret, optional — enables CRU key verification).

const crypto = require("crypto");

const KV_PREFIX = "emx:acct:";
const SESSION_TTL_DAYS = 30;
// productId -> { link (Payhip permalink), secretEnv } for products we can verify.
const VERIFIABLE = {
  emx_cru: { link: "LwdbV", secretEnv: "PAYHIP_SECRET_LWDBV" }
};

module.exports = async (req, res) => {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed." });

  let body;
  try { body = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}"); }
  catch { return send(res, 400, { ok: false, error: "Bad request." }); }

  const action = String(body.action || "");
  try {
    if (!process.env.KV_REST_API_URL || !process.env.ACCOUNT_SECRET) {
      return send(res, 500, { ok: false, error: "Account service not configured." });
    }
    switch (action) {
      case "signup": return await signup(res, body);
      case "login": return await login(res, body);
      case "me": return await me(res, body);
      case "addKey": return await addKey(res, body);
      case "removeKey": return await removeKey(res, body);
      default: return send(res, 400, { ok: false, error: "Unknown action." });
    }
  } catch (err) {
    return send(res, 500, { ok: false, error: err && err.message ? err.message : "Server error." });
  }
};

// ---- actions ----

async function signup(res, body) {
  const email = normEmail(body.email);
  const password = String(body.password || "");
  if (!email.includes("@")) return send(res, 400, { ok: false, error: "Enter a valid email." });
  if (password.length < 8) return send(res, 400, { ok: false, error: "Password must be at least 8 characters." });

  const key = KV_PREFIX + emailHash(email);
  const existing = await kvGetJson(key);
  if (existing) return send(res, 409, { ok: false, error: "An account with that email already exists. Log in instead." });

  const salt = crypto.randomBytes(16).toString("hex");
  const account = {
    emailHash: emailHash(email),
    emailMasked: maskEmail(email),
    pwSalt: salt,
    pwHash: scrypt(password, salt),
    keys: {},
    createdAt: Date.now()
  };
  await kvSetJson(key, account);
  return send(res, 200, { ok: true, token: makeSession(account.emailHash), account: await withOwns(account) });
}

async function login(res, body) {
  const email = normEmail(body.email);
  const password = String(body.password || "");
  const account = await kvGetJson(KV_PREFIX + emailHash(email));
  if (!account || scrypt(password, account.pwSalt) !== account.pwHash) {
    return send(res, 401, { ok: false, error: "Wrong email or password." });
  }
  return send(res, 200, { ok: true, token: makeSession(account.emailHash), account: await withOwns(account) });
}

async function me(res, body) {
  const hash = verifySession(body.token);
  if (!hash) return send(res, 401, { ok: false, error: "Session expired. Log in again." });
  const account = await kvGetJson(KV_PREFIX + hash);
  if (!account) return send(res, 404, { ok: false, error: "Account not found." });
  return send(res, 200, { ok: true, account: await withOwns(account) });
}

async function addKey(res, body) {
  const hash = verifySession(body.token);
  if (!hash) return send(res, 401, { ok: false, error: "Session expired. Log in again." });
  const productId = String(body.productId || "").trim();
  const licenseKey = String(body.licenseKey || "").trim().toUpperCase();
  if (!productId || !licenseKey) return send(res, 400, { ok: false, error: "Product and license key are required." });

  const kvKey = KV_PREFIX + hash;
  const account = await kvGetJson(kvKey);
  if (!account) return send(res, 404, { ok: false, error: "Account not found." });

  let verified = false;
  const v = VERIFIABLE[productId];
  if (v && process.env[v.secretEnv]) {
    verified = await payhipVerify(v.link, licenseKey, process.env[v.secretEnv]);
    if (!verified) return send(res, 403, { ok: false, error: "That key was not found or is disabled for this product." });
  }

  account.keys = account.keys || {};
  account.keys[productId] = { key: licenseKey, verified, addedAt: Date.now() };
  await kvSetJson(kvKey, account);
  return send(res, 200, { ok: true, account: await withOwns(account) });
}

async function removeKey(res, body) {
  const hash = verifySession(body.token);
  if (!hash) return send(res, 401, { ok: false, error: "Session expired. Log in again." });
  const productId = String(body.productId || "").trim();
  const kvKey = KV_PREFIX + hash;
  const account = await kvGetJson(kvKey);
  if (!account) return send(res, 404, { ok: false, error: "Account not found." });
  if (account.keys) delete account.keys[productId];
  await kvSetJson(kvKey, account);
  return send(res, 200, { ok: true, account: await withOwns(account) });
}

// ---- helpers ----

function publicAccount(a) {
  return { emailMasked: a.emailMasked, keys: a.keys || {}, createdAt: a.createdAt };
}

// Merges auto-captured ownership (written by the Payhip webhook to emx:owns:<hash>) into the
// account payload as `owns` — a map of Payhip product permalink -> { name, date }.
async function withOwns(a) {
  let owns = {};
  try { owns = (await kvGetJson("emx:owns:" + a.emailHash)) || {}; } catch { owns = {}; }
  return { ...publicAccount(a), owns };
}

async function payhipVerify(link, licenseKey, secret) {
  try {
    const url = `https://payhip.com/api/v2/license/verify?product_link=${encodeURIComponent(link)}&license_key=${encodeURIComponent(licenseKey)}`;
    const resp = await fetch(url, { headers: { "product-secret-key": secret } });
    const data = await resp.json().catch(() => ({}));
    return resp.ok && data && data.data && data.data.enabled !== false;
  } catch { return false; }
}

function normEmail(e) { return String(e || "").trim().toLowerCase(); }
function emailHash(e) { return crypto.createHash("sha256").update(normEmail(e)).digest("hex"); }
function maskEmail(e) {
  const [u, d] = normEmail(e).split("@");
  if (!d) return "***";
  return (u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***") + "@" + d;
}
function scrypt(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString("hex");
}
function makeSession(hash) {
  const payload = b64url(Buffer.from(JSON.stringify({ h: hash, exp: Date.now() + SESSION_TTL_DAYS * 864e5 })));
  return payload + "." + hmac(payload);
}
function verifySession(token) {
  try {
    const [payload, sig] = String(token || "").split(".");
    if (!payload || !sig || !timingSafe(sig, hmac(payload))) return null;
    const obj = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    if (!obj.h || !obj.exp || Date.now() > obj.exp) return null;
    return obj.h;
  } catch { return null; }
}
function hmac(s) { return b64url(crypto.createHmac("sha256", process.env.ACCOUNT_SECRET).update(s).digest()); }
function timingSafe(a, b) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}
function b64url(buf) { return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }

async function kvCmd(cmd) {
  const r = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd)
  });
  return r.json();
}
async function kvGetJson(key) {
  const r = await kvCmd(["GET", key]);
  if (!r || !r.result) return null;
  try { return JSON.parse(r.result); } catch { return null; }
}
async function kvSetJson(key, value) { await kvCmd(["SET", key, JSON.stringify(value)]); }

function send(res, status, obj) { res.statusCode = status; res.end(JSON.stringify(obj)); }
