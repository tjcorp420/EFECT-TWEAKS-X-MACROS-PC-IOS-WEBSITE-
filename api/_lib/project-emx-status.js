/* PROJECT EMX live status.
 *
 * Roblox's games API and Discord's invite API both refuse browser cross-origin
 * requests, so the page cannot call them directly. This function calls them
 * server-side, once per minute per edge region, and hands the page back only
 * what the upstream services actually returned.
 *
 * It lives in api/_lib/ rather than api/ on purpose: Vercel counts every file
 * under api/ as a Serverless Function, and this project is already at the
 * plan limit. The public route /api/project-emx-status is a rewrite onto
 * api/site-settings.js, which delegates here. Nothing about the response
 * changes.
 *
 * Rules this file exists to enforce:
 *   - Never invent, round, estimate or carry over a number. A source either
 *     answers or is reported as unavailable, with a reason.
 *   - Zero is a real value. `playing: 0` is returned as 0, never hidden,
 *     never replaced with a dash or a "coming soon".
 *   - The game is in development. The phase comes from content/project-emx.json
 *     and is validated against a list that has no "live" or "operational" in it.
 */

const content = require("../../content/project-emx.json");

const UPSTREAM_TIMEOUT_MS = 6000;
const ALLOWED_PHASES = new Set(["development", "playtesting", "open-beta"]);

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function readRoblox(universeId) {
  if (!finiteNumber(universeId)) {
    return { ok: false, reason: "not-configured" };
  }
  // The two calls are independent: details can succeed while votes fail.
  const [details, votes] = await Promise.allSettled([
    getJson(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
    getJson(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`),
  ]);

  if (details.status !== "fulfilled") {
    return { ok: false, reason: "upstream-error" };
  }
  const game = Array.isArray(details.value?.data) ? details.value.data[0] : null;
  if (!game || game.id !== universeId) {
    return { ok: false, reason: "not-found" };
  }

  const vote =
    votes.status === "fulfilled" && Array.isArray(votes.value?.data)
      ? votes.value.data[0]
      : null;

  return {
    ok: true,
    name: typeof game.name === "string" ? game.name : null,
    playing: finiteNumber(game.playing),
    visits: finiteNumber(game.visits),
    favorites: finiteNumber(game.favoritedCount),
    maxPlayers: finiteNumber(game.maxPlayers),
    upVotes: vote ? finiteNumber(vote.upVotes) : null,
    downVotes: vote ? finiteNumber(vote.downVotes) : null,
    updated: typeof game.updated === "string" ? game.updated : null,
    created: typeof game.created === "string" ? game.created : null,
  };
}

async function readDiscord(invite) {
  const code = String(invite || "").trim();
  if (!code) return { ok: false, reason: "not-configured" };
  try {
    const data = await getJson(
      `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`,
    );
    const memberCount = finiteNumber(data?.approximate_member_count);
    const onlineCount = finiteNumber(data?.approximate_presence_count);
    if (memberCount === null) return { ok: false, reason: "no-counts" };
    return {
      ok: true,
      memberCount,
      onlineCount,
      serverName: typeof data?.guild?.name === "string" ? data.guild.name : null,
      invite: code,
    };
  } catch {
    return { ok: false, reason: "upstream-error" };
  }
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("allow", "GET, HEAD");
    response.end();
    return;
  }

  const universeId = finiteNumber(content?.roblox?.universeId);
  const phase = ALLOWED_PHASES.has(content?.status?.phase)
    ? content.status.phase
    : "development";

  const [roblox, discord] = await Promise.all([
    readRoblox(universeId).catch(() => ({ ok: false, reason: "upstream-error" })),
    readDiscord(content?.discord?.invite).catch(() => ({
      ok: false,
      reason: "upstream-error",
    })),
  ]);

  const body = {
    fetchedAt: new Date().toISOString(),
    // Reachability is observed, not assumed: the service is only reported as
    // reachable when Roblox actually answered for this universe.
    phase,
    reachable: roblox.ok,
    roblox,
    discord,
  };

  response.statusCode = 200;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader(
    "cache-control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
  );
  response.end(JSON.stringify(body));
};

module.exports.readRoblox = readRoblox;
module.exports.readDiscord = readDiscord;
module.exports.ALLOWED_PHASES = ALLOWED_PHASES;
