const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const content = JSON.parse(read("content/project-emx.json"));
const statusApi = require("../api/project-emx-status.js");

const GAME_PAGES = ["news.html", "game.html", "community.html", "playtesting.html", "roadmap.html"];

/* ------------------------------------------------------------ content ---- */

test("the content file is the single source of truth and carries no invented entries", () => {
  assert.equal(typeof content.roblox.universeId, "number");
  assert.equal(content.roblox.universeId, 10775458042);
  assert.equal(content.roblox.placeId, 91734259300852);
  // The game is in development. These two words must never be a valid phase.
  assert.ok(["development", "playtesting", "open-beta"].includes(content.status.phase));
  assert.doesNotMatch(JSON.stringify(content.status), /"live"|"operational"/i);

  for (const key of ["playtests", "updates", "announcements", "roadmap"]) {
    assert.ok(Array.isArray(content[key]), `${key} must be a list`);
    for (const entry of content[key]) {
      // Anything published must at least carry a real title, so a half-written
      // entry cannot render as a blank card.
      assert.equal(typeof entry.title, "string");
      assert.ok(entry.title.trim().length > 0);
    }
  }

  // An invite is either a real code or absent - never a placeholder. The code
  // itself is not pinned here, so rotating the invite does not break the build.
  const invite = content.discord.invite;
  assert.equal(typeof invite, "string");
  assert.doesNotMatch(invite, /example|placeholder|xxx|your-?invite|todo/i);
  assert.doesNotMatch(invite, /^https?:|discord\.gg/i, "store the code only, not the full URL");
  if (invite) assert.match(invite, /^[A-Za-z0-9-]{2,25}$/, "not a Discord invite code");
});

/* ---------------------------------------------------------- status API --- */

test("the status endpoint reports zero players as zero and never as missing", async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => ({
    ok: true,
    json: async () =>
      String(url).includes("/votes")
        ? { data: [{ id: 10775458042, upVotes: 6, downVotes: 0 }] }
        : {
            data: [
              {
                id: 10775458042,
                name: "Project EMX (BETA)",
                playing: 0,
                visits: 74,
                favoritedCount: 7,
                maxPlayers: 50,
                updated: "2026-11-16T21:58:45.723Z",
                created: "2026-11-08T23:05:39.311Z",
              },
            ],
          },
  });
  try {
    const result = await statusApi.readRoblox(10775458042);
    assert.equal(result.ok, true);
    assert.equal(result.playing, 0, "zero players must survive as the number 0");
    assert.equal(result.visits, 74);
    assert.equal(result.upVotes, 6);
    assert.equal(result.downVotes, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("an upstream failure is reported as unavailable instead of a substituted number", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("network down");
  };
  try {
    const roblox = await statusApi.readRoblox(10775458042);
    assert.equal(roblox.ok, false);
    assert.equal(roblox.reason, "upstream-error");
    assert.equal(roblox.playing, undefined, "no fallback player count may be invented");

    const discord = await statusApi.readDiscord("anything");
    assert.equal(discord.ok, false);
    assert.equal(discord.memberCount, undefined);
  } finally {
    global.fetch = originalFetch;
  }
});

test("a universe that answers for a different id is rejected rather than displayed", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ data: [{ id: 123, playing: 900 }] }) });
  try {
    const result = await statusApi.readRoblox(10775458042);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "not-found");
  } finally {
    global.fetch = originalFetch;
  }
});

test("a missing Discord invite is 'not configured', not a zero member count", async () => {
  const result = await statusApi.readDiscord("");
  assert.deepEqual(result, { ok: false, reason: "not-configured" });
});

test("the status phase list cannot express a released game", () => {
  assert.ok(!statusApi.ALLOWED_PHASES.has("live"));
  assert.ok(!statusApi.ALLOWED_PHASES.has("operational"));
  // Checked against the code only, with comments stripped, so that explaining
  // the rule in prose does not look like breaking it.
  const code = read("api/project-emx-status.js")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(code, /["']live["']|["']operational["']/i);
});

/* ------------------------------------------------------- dashboard JS ---- */

test("the dashboard renders only fetched values and has no placeholder numbers", () => {
  const source = read("project-emx.js");
  // The four honest states exist and are written to the DOM.
  for (const state of ["loading", "ok", "empty", "unavailable"]) {
    assert.ok(source.includes(`"${state}"`), `missing ${state} state`);
  }
  // Status wording comes from a closed map with no released-sounding value.
  assert.match(source, /PHASE_LABEL\s*=\s*\{/);
  assert.doesNotMatch(source, /\bLIVE\b|OPERATIONAL|ONLINE NOW/);
  // Numbers are only rendered after a finite-number check.
  assert.match(source, /isNumber\(roblox\.playing\)/);
  assert.match(source, /Number\.isFinite/);
  // No silent fallbacks that would turn an unknown into a figure.
  assert.doesNotMatch(source, /playing\s*\|\|\s*\d/);
  assert.doesNotMatch(source, /memberCount\s*\|\|\s*\d/);
});

/* ------------------------------------------------------------- homepage -- */

test("the homepage leads with PROJECT EMX and keeps the store underneath", () => {
  const home = read("index.html");
  assert.match(home, /<h1 class="pe-title" id="pe-title">/);
  // data-text feeds the sheen overlay on the wordmark; without it the effect
  // silently disappears.
  assert.match(home, /<span class="pe-title-main" data-text="EMX">EMX<\/span>/);
  assert.match(read("project-emx.css"), /content: attr\(data-text\)/);
  assert.match(home, /The island is <em>calling\.<\/em>/);
  assert.match(home, /OG movement\. Modern assets\. Battle Royale reimagined\./);
  for (const mode of ["Build Mode", "Zero Build", "Squads", "Competitive", "Live Events"]) {
    assert.ok(home.includes(mode), `missing mode ${mode}`);
  }
  assert.match(home, /More from EMX/);
  // The store did not move or lose its catalogue entry points.
  assert.match(home, /<h2 id="store-title"><em>EMX<\/em> Software\.<\/h2>/);
  assert.match(home, /href="products\.html"/);
  assert.match(home, /id="free-tools"/);
});

test("every dashboard tile ships in the loading state with no number baked into the markup", () => {
  const home = read("index.html");
  const tiles = [...home.matchAll(/<article class="pe-tile[^"]*"[\s\S]*?<\/article>/g)].map((m) => m[0]);
  assert.equal(tiles.length, 5, "the homepage dashboard should have five tiles");
  for (const tile of tiles) {
    assert.match(tile, /data-state="loading"/);
    const value = tile.match(/<p class="pe-tile-value" data-pe-value>([\s\S]*?)<\/p>/);
    assert.ok(value, "tile must have a value slot");
    assert.doesNotMatch(value[1], /\d/, `a tile shipped with a hardcoded number: ${value[1]}`);
  }
  for (const key of ["players", "status", "playtest", "update", "announcement"]) {
    assert.ok(home.includes(`data-pe-tile="${key}"`), `missing tile ${key}`);
  }
  // The Discord member count is deliberately off the home page while the server
  // is new, but it is hidden rather than removed: Community still carries it.
  assert.ok(!home.includes('data-pe-tile="discord"'), "member count should stay off the home page");
  assert.ok(read("community.html").includes('data-pe-tile="discord"'), "Community should keep the member count");
  // Hiding the count must not hide the way in.
  assert.match(home, /data-pe-discord/);
});

test("the homepage never claims the game is live or released", () => {
  const home = read("index.html");
  const hero = home.slice(home.indexOf('class="pe-scope"'), home.indexOf('class="store-hero"'));
  assert.doesNotMatch(hero, /\bLIVE NOW\b|\bOPERATIONAL\b|fully released|out now/i);
  // Where the game is described as playable, it is described as a beta.
  assert.match(hero, /Open beta/i);
});

/* ---------------------------------------------------------------- nav ---- */

test("the primary navigation is the game nav and still reaches every store page", () => {
  const shell = read("site-shell.js");
  for (const [key, label] of [
    ["home", "Project EMX"],
    ["news", "News"],
    ["game", "Game Info"],
    ["community", "Community"],
    ["playtesting", "Playtesting"],
    ["products", "Store"],
    ["help", "Support"],
  ]) {
    assert.ok(shell.includes(`"${key}"`), `missing nav key ${key}`);
    assert.ok(shell.includes(`"${label}"`), `missing nav label ${label}`);
  }
  // Store destinations that moved into Explore must still be present.
  for (const href of [
    "./products.html",
    "./bundles.html",
    "./macros.html",
    "./compare.html",
    "./updates.html",
    "./links.html",
    "./about.html",
    "./vouches.html",
    "./affiliate.html",
    "./faq.html",
    "./extensions",
  ]) {
    assert.ok(shell.includes(`"${href}"`), `store destination dropped from nav: ${href}`);
  }
  assert.match(shell, /https:\/\/activate\.emxtweaks\.com\/activate/);
});

test("the header Discord button is inert until a real invite exists", () => {
  const shell = read("site-shell.js");
  assert.match(shell, /class="site-discord"/);
  assert.match(shell, /data-pe-discord/);
  assert.match(shell, /aria-disabled="true"/);
  assert.match(shell, /Invite coming soon/);
  // It must not ship with an href, which would be a button that goes nowhere.
  const button = shell.slice(shell.indexOf('class="site-discord"'), shell.indexOf("</a>", shell.indexOf('class="site-discord"')));
  assert.doesNotMatch(button, /href=/);

  const behaviour = read("project-emx.js");
  assert.match(behaviour, /node\.removeAttribute\("href"\)/);
  assert.match(behaviour, /https:\/\/discord\.gg\//);
});

/* --------------------------------------------------------- game pages ---- */

test("every game page uses the shared shell, the game styling and the wiring script", () => {
  for (const page of GAME_PAGES) {
    const source = read(page);
    assert.match(source, /<header data-site-header><\/header>/, `${page} header`);
    assert.match(source, /<footer data-site-footer><\/footer>/, `${page} footer`);
    assert.match(source, /project-emx\.css/, `${page} styling`);
    assert.match(source, /project-emx\.js/, `${page} behaviour`);
    assert.match(source, /class="pe-scope"/, `${page} scope`);
    assert.match(source, /<html lang="en">/, `${page} lang`);
  }
});

test("list pages declare an honest empty state instead of sample content", () => {
  for (const page of ["news.html", "playtesting.html", "roadmap.html", "community.html"]) {
    const source = read(page);
    const feeds = [...source.matchAll(/data-pe-feed="([a-z]+)"/g)].map((m) => m[1]);
    assert.ok(feeds.length > 0, `${page} should render at least one feed`);
    for (const feed of feeds) {
      assert.ok(["announcements", "updates", "playtests", "roadmap"].includes(feed), `${page}: unknown feed ${feed}`);
    }
    assert.match(source, /data-pe-feed-empty="/, `${page} must carry empty-state copy`);
  }
});

test("the stub pages are labelled as empty and name no invented items", () => {
  const game = read("game.html");
  assert.match(game, /Weapon database/);
  assert.match(game, /Cosmetic gallery/);
  assert.match(game, /Interactive island map/);
  assert.equal((game.match(/pe-stub-flag/g) || []).length, 3);
  assert.match(game, /Empty on purpose/);
  // No fabricated stats sneaking into the stubs.
  const stubs = game.slice(game.indexOf("Not published yet"));
  assert.doesNotMatch(stubs, /\d+\s*(?:damage|DPS|rounds|HP)/i);
});

test("playtesting is open to everyone with no application step", () => {
  const page = read("playtesting.html");
  assert.match(page, /no application/i);
  assert.doesNotMatch(page, /apply now|application form|waitlist sign-?up/i);
  assert.match(page, /roblox\.com\/games\/start\?placeId=91734259300852/);
});

/* ------------------------------------------------- store is untouched ---- */

test("the storefront keeps every checkout route and product link", () => {
  const products = read("products.js");
  const checkouts = [...products.matchAll(/https:\/\/payhip\.com\/b\/[A-Za-z0-9]+/g)].map((m) => m[0]);
  assert.ok(checkouts.length >= 20, `expected the full Payhip catalogue, found ${checkouts.length}`);

  const routing = JSON.parse(read("vercel.json"));
  const sources = routing.rewrites.map((route) => route.source);
  for (const route of ["/software", "/extensions", "/support", "/links", "/about", "/affiliate", "/aim-trainer", "/download/aim-trainer"]) {
    assert.ok(sources.includes(route), `lost existing route ${route}`);
  }
  for (const route of ["/news", "/game", "/community", "/playtesting", "/roadmap"]) {
    assert.ok(sources.includes(route), `missing new route ${route}`);
  }
  // The creator referral catch-alls must stay last so they cannot swallow the
  // new game routes.
  const creatorIndex = sources.findIndex((source) => source.startsWith("/c/"));
  const newsIndex = sources.indexOf("/news");
  assert.ok(newsIndex < creatorIndex, "game routes must be declared before /c/:creator");

  const redirects = routing.redirects.map((route) => route.source);
  assert.ok(redirects.includes("/license"));
  assert.ok(redirects.includes("/labs"));
});

/* --------------------------------------------------- the intro is gone --- */

test("the boot intro is fully removed and replaced by a CSS fade", () => {
  assert.ok(!fs.existsSync(path.join(root, "store-entry-intro.js")));
  assert.ok(!fs.existsSync(path.join(root, "tests", "store-entry-intro.test.js")));
  const home = read("index.html");
  assert.doesNotMatch(home, /store-entry-intro|store-intro|emx-software-bio-boot/);
  for (const file of ["software-redesign.css", "storefront-home.css"]) {
    assert.doesNotMatch(read(file), /store-intro/, `${file} still styles the removed overlay`);
  }
  const foundation = read("foundation.css");
  assert.match(foundation, /@keyframes emx-page-fade/);
  assert.match(foundation, /@keyframes emx-page-rise/);
  assert.match(foundation, /prefers-reduced-motion: reduce/);
});
