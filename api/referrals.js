const REFERRALS_KEY = "emx:referrals";
const SITE_BASE_URL = "https://efect-macros-x-tweaks.vercel.app/";

function sendJson(res, response, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(response));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanReferralKey(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/[^\w.-]/g, "")
    .slice(0, 64);
}

function cleanDisplayName(value) {
  return String(value || "")
    .trim()
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 32);
}

function creatorSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function referralLinkForKey(key, displayName = "") {
  const cleanKey = cleanReferralKey(key);
  const display = cleanDisplayName(displayName);
  const slug = creatorSlug(display || cleanKey);
  const target = new URL(slug ? "c/" + encodeURIComponent(slug) : "", SITE_BASE_URL);

  target.searchParams.set("af", cleanKey);

  return target.toString();
}

function assertKvConfigured() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error("Vercel KV is not configured.");
  }
}

async function kvGet(key) {
  assertKvConfigured();

  const response = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
    headers: {
      authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("KV read failed.");
  }

  const raw = await response.text();
  let data = null;

  try {
    data = JSON.parse(raw);
  } catch (error) {
    return null;
  }

  if (data && data.error) return null;
  if (!data || data.result == null) return null;

  if (typeof data.result !== "string") return data.result;

  try {
    return JSON.parse(data.result);
  } catch (error) {
    return null;
  }
}

async function kvSet(key, value) {
  assertKvConfigured();

  const response = await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(value)
  });

  if (!response.ok) {
    throw new Error("KV write failed.");
  }
}

async function loadReferrals() {
  const referrals = await kvGet(REFERRALS_KEY);
  return Array.isArray(referrals) ? referrals : [];
}

async function saveReferrals(referrals) {
  await kvSet(REFERRALS_KEY, referrals);
}

function requireAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD || "";
  const actual = req.headers["x-admin-password"] || "";

  return Boolean(expected && actual && expected === actual);
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return {};
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, { ok: true });
    }

    if (req.method === "GET") {
      if (!requireAdmin(req)) {
        return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
      }

      const referrals = await loadReferrals();
      return sendJson(res, { ok: true, referrals });
    }

    if (req.method !== "POST") {
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }

    const body = readBody(req);

    if (body.lookup === true) {
      const email = normalizeEmail(body.email);
      const affiliateKey = cleanReferralKey(body.affiliateKey);

      if (!email || !email.includes("@") || !affiliateKey) {
        return sendJson(res, { ok: false, error: "Email and affiliate code are required." }, 400);
      }

      const referrals = await loadReferrals();
      const referral = referrals.find(item =>
        normalizeEmail(item.email) === email &&
        cleanReferralKey(item.affiliateKey) === affiliateKey
      );

      if (!referral) {
        return sendJson(res, { ok: false, error: "No approved EMX referral found. Payhip can approve the key, but EMX admin still needs this email and affiliate key saved first." }, 404);
      }

      return sendJson(res, {
        ok: true,
        referral: {
          email,
          affiliateKey,
          displayName: cleanDisplayName(referral.displayName || ""),
          referralLink: referralLinkForKey(affiliateKey, referral.displayName || "")
        }
      });
    }

    if (!requireAdmin(req)) {
      return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
    }

    const email = normalizeEmail(body.email);
    const affiliateKey = cleanReferralKey(body.affiliateKey);
    const displayName = cleanDisplayName(body.displayName);

    if (!email || !email.includes("@")) {
      return sendJson(res, { ok: false, error: "Valid affiliate email is required." }, 400);
    }

    const referrals = await loadReferrals();
    const existingIndex = referrals.findIndex(item => normalizeEmail(item.email) === email);

    if (body.delete === true) {
      const nextReferrals = existingIndex === -1
        ? referrals
        : referrals.filter((_, index) => index !== existingIndex);

      await saveReferrals(nextReferrals);
      return sendJson(res, { ok: true, referrals: nextReferrals });
    }

    if (!affiliateKey) {
      return sendJson(res, { ok: false, error: "Payhip affiliate code is required." }, 400);
    }

    const referral = {
      email,
      displayName,
      affiliateKey,
      referralLink: referralLinkForKey(affiliateKey, displayName),
      updatedAt: new Date().toISOString()
    };

    const nextReferrals = [...referrals];
    if (existingIndex === -1) {
      nextReferrals.push(referral);
    } else {
      nextReferrals[existingIndex] = referral;
    }

    await saveReferrals(nextReferrals);

    return sendJson(res, { ok: true, referral, referrals: nextReferrals });
  } catch (error) {
    return sendJson(res, {
      ok: false,
      error: error instanceof Error ? error.message : "Referral API failed."
    }, 500);
  }
};
