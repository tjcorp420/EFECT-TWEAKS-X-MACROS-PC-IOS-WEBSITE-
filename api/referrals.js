const REFERRALS_KEY = "emx_referrals_v1";
const SITE_BASE_URL = "https://efect-macros-x-tweaks.vercel.app/";

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function getEnv() {
  return {
    url:
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_REST_API_URL,

    token:
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN,

    adminPassword: process.env.ADMIN_PASSWORD
  };
}

async function upstashCommand(command) {
  const { url, token } = getEnv();

  if (!url || !token) {
    throw new Error("Missing Upstash environment variables.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Upstash request failed.");
  }

  return data.result;
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
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function buildReferralLink(key, displayName = "") {
  const display = cleanDisplayName(displayName);
  const slug = creatorSlug(display || key);
  const target = new URL(slug ? `r/${encodeURIComponent(slug)}` : "", SITE_BASE_URL);

  target.searchParams.set("ref", key);
  return target.toString();
}

async function loadReferrals() {
  const saved = await upstashCommand(["GET", REFERRALS_KEY]);

  if (!saved) {
    return {};
  }

  const parsed = JSON.parse(saved);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}

async function saveReferrals(referrals) {
  await upstashCommand(["SET", REFERRALS_KEY, JSON.stringify(referrals)]);
  return referrals;
}

function getPasswordFromRequest(req) {
  return req.headers["x-admin-password"] || "";
}

function publicReferral(referral, options = {}) {
  if (!referral) return null;

  const payload = {
    displayName: cleanDisplayName(referral.displayName),
    displaySlug: creatorSlug(referral.displayName || referral.affiliateKey),
    affiliateKey: referral.affiliateKey,
    referralLink: buildReferralLink(referral.affiliateKey, referral.displayName),
    updatedAt: referral.updatedAt
  };

  if (options.includeEmail !== false) {
    payload.email = referral.email;
  }

  return payload;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const email = normalizeEmail(req.query?.email);
      const key = cleanReferralKey(req.query?.key);
      const slug = creatorSlug(req.query?.slug);
      const referrals = await loadReferrals();

      if (email) {
        const referral = publicReferral(referrals[email]);

        return sendJson(res, 200, {
          ok: true,
          found: Boolean(referral),
          referral
        });
      }

      if (key) {
        const referral = publicReferral(
          Object.values(referrals).find(item => cleanReferralKey(item?.affiliateKey) === key),
          { includeEmail: false }
        );

        return sendJson(res, 200, {
          ok: true,
          found: Boolean(referral),
          referral
        });
      }

      if (slug) {
        const referral = publicReferral(
          Object.values(referrals).find(item => creatorSlug(item?.displayName || item?.affiliateKey) === slug),
          { includeEmail: false }
        );

        return sendJson(res, 200, {
          ok: true,
          found: Boolean(referral),
          referral
        });
      }

      const { adminPassword } = getEnv();
      const sentPassword = getPasswordFromRequest(req);

      if (!adminPassword || sentPassword !== adminPassword) {
        return sendJson(res, 401, {
          ok: false,
          error: "Unauthorized. Wrong or missing admin password."
        });
      }

      return sendJson(res, 200, {
        ok: true,
        referrals: Object.values(referrals)
          .map(publicReferral)
          .filter(Boolean)
          .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
      });
    }

    if (req.method === "POST") {
      const { adminPassword } = getEnv();
      const sentPassword = getPasswordFromRequest(req);

      if (!adminPassword || sentPassword !== adminPassword) {
        return sendJson(res, 401, {
          ok: false,
          error: "Unauthorized. Wrong or missing admin password."
        });
      }

      const body = req.body || {};
      const email = normalizeEmail(body.email);
      const affiliateKey = cleanReferralKey(body.affiliateKey);
      const displayName = cleanDisplayName(body.displayName || body.username);

      if (!email || !email.includes("@")) {
        return sendJson(res, 400, {
          ok: false,
          error: "Enter a valid affiliate email."
        });
      }

      const referrals = await loadReferrals();

      if (body.delete === true) {
        delete referrals[email];
        await saveReferrals(referrals);

        return sendJson(res, 200, {
          ok: true,
          deleted: true,
          email
        });
      }

      if (!affiliateKey) {
        return sendJson(res, 400, {
          ok: false,
          error: "Enter the Payhip affiliate key."
        });
      }

      const referral = {
        email,
        displayName,
        affiliateKey,
        updatedAt: new Date().toISOString()
      };

      referrals[email] = referral;
      await saveReferrals(referrals);

      return sendJson(res, 200, {
        ok: true,
        referral: publicReferral(referral)
      });
    }

    return sendJson(res, 405, {
      ok: false,
      error: "Method not allowed."
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error.message || "Server error."
    });
  }
};
