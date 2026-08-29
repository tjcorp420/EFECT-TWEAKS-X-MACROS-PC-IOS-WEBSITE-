const { requireAdmin } = require("./_lib/admin-auth");

const KEY = "emx:storefront-settings:v1";
const DEFAULTS = Object.freeze({
  introEnabled: true,
  introDurationMs: 17000,
  replayMode: "session",
  replayHours: 24,
  allowSkip: true,
  tagline: "ENGINEERED FOR YOUR SETUP",
  animationIntensity: "balanced",
  announcement: "",
});

function json(res, body, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}
function clean(value, limit) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, limit);
}
function normalize(value = {}) {
  return {
    introEnabled: value.introEnabled !== false,
    introDurationMs: Math.min(
      26000,
      Math.max(
        17000,
        Number(value.introDurationMs || DEFAULTS.introDurationMs),
      ),
    ),
    replayMode: ["session", "hours", "always", "never"].includes(
      value.replayMode,
    )
      ? value.replayMode
      : DEFAULTS.replayMode,
    replayHours: Math.min(
      720,
      Math.max(1, Number(value.replayHours || DEFAULTS.replayHours)),
    ),
    allowSkip: value.allowSkip !== false,
    tagline: clean(value.tagline || DEFAULTS.tagline, 100),
    animationIntensity: ["calm", "balanced", "high"].includes(
      value.animationIntensity,
    )
      ? value.animationIntensity
      : "balanced",
    announcement: clean(value.announcement, 180),
  };
}
async function read() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN)
    return DEFAULTS;
  const response = await fetch(`${process.env.KV_REST_API_URL}/get/${KEY}`, {
    headers: { authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  if (!response.ok) return DEFAULTS;
  const payload = await response.json();
  if (payload?.result == null) return DEFAULTS;
  let value = payload.result;
  if (typeof value === "string")
    try {
      value = JSON.parse(value);
    } catch (error) {
      return DEFAULTS;
    }
  return normalize(value);
}
async function write(settings) {
  const response = await fetch(`${process.env.KV_REST_API_URL}/set/${KEY}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error("Storefront settings could not be saved.");
}
module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET")
      return json(res, { ok: true, settings: await read() });
    if (req.method !== "POST")
      return json(res, { ok: false, error: "Method not allowed." }, 405);
    if (!requireAdmin(req))
      return json(res, { ok: false, error: "Unauthorized." }, 401);
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN)
      return json(
        res,
        { ok: false, error: "Vercel KV is not configured." },
        500,
      );
    const settings = normalize(
      req.body && typeof req.body === "object" ? req.body : {},
    );
    await write(settings);
    return json(res, { ok: true, settings });
  } catch (error) {
    return json(
      res,
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Storefront settings failed.",
      },
      500,
    );
  }
};
module.exports.DEFAULTS = DEFAULTS;
module.exports.normalize = normalize;
