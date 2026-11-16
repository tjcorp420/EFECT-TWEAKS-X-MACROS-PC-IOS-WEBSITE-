const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const content = JSON.parse(read("content/project-emx.json"));
const statusApi = require("../api/_lib/project-emx-status.js");

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
  const code = read("api/_lib/project-emx-status.js")
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
  // The hero lists what the beta actually has, under the names the game's own
  // lobby uses (src/client/Lobby.luau and src/shared/Rules/Match.luau).
  for (const mode of ["Freebuild", "Piece Control", "Speed Realistics", "Zone Wars", "Free For All", "Map maker"]) {
    assert.ok(home.includes(mode), `missing playable mode ${mode}`);
  }
  // Build Zombies exists in the lobby code but ships behind a disabled flag,
  // so it must not be advertised as something to play.
  assert.doesNotMatch(home, /zombies/i);
  assert.match(home, /Playable now/);
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
  // Scoped to the "Not published yet" block, since the planned-modes block
  // above it uses the same flag styling for its own three entries.
  const stubs = game.slice(game.indexOf("Not published yet"));
  assert.equal((stubs.match(/pe-stub-flag/g) || []).length, 3);
  assert.match(stubs, /Empty on purpose/);
  // No fabricated stats sneaking into the stubs.
  assert.doesNotMatch(stubs, /\d+\s*(?:damage|DPS|rounds|HP)/i);
});

test("Battle Royale is only ever shown as planned, never as something to play", () => {
  // There is no Battle Royale in the build. Someone clicking PLAY expecting one
  // and landing in box fights is the failure this guards against.
  const home = read("index.html");
  const game = read("game.html");

  // On the home page the words appear in the tagline and in the planned row,
  // and the planned row must say so.
  assert.match(home, /Coming next[\s\S]{0,400}Battle Royale/);
  const playable = home.slice(home.indexOf("Playable now"), home.indexOf("Coming next"));
  assert.ok(!playable.includes("Battle Royale"), "Battle Royale must not sit in the playable row");
  assert.match(home, /not in the build yet/i);

  // And on Game Info it is a flagged stub, not a feature card.
  assert.match(game, /Planned, not in the build yet/);
  const planned = game.slice(game.indexOf("game-planned"));
  for (const mode of ["Battle Royale", "Reload", "Arena"]) {
    assert.ok(planned.includes(mode), `${mode} should be listed as planned`);
  }
  assert.equal((planned.match(/Not playable yet/g) || []).length, 3);
  assert.ok(!read("playtesting.html").match(/battle royale/i), "playtesting must not promise a BR");
});

test("Game Info describes the beta as it actually is, not as the finished game", () => {
  const game = read("game.html");
  // The live Roblox build is build, edit and box fighting; the Battle Royale is
  // the direction, not the current match loop. Stating it as present-tense fact
  // would be the same kind of overclaim the dashboard rules exist to prevent.
  assert.doesNotMatch(game, /PROJECT EMX is a Battle Royale/i);
  assert.match(game, /heading for a[\s\S]{0,40}Battle Royale/i);
  assert.match(game, /build, edit and box fighting/i);
  assert.match(game, /not in the\s+build yet/i);
  // What is playable is named, and it comes from the game's own Roblox listing.
  for (const detail of ["Piece control drills", "map maker", "EMX Bucks"]) {
    assert.ok(game.includes(detail), `missing beta detail: ${detail}`);
  }
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

test("Game Info shows the real mode cards with the game's own wording", () => {
  const game = read("game.html");
  const dir = path.join(root, "assets/project-emx/modes");
  const cards = [
    ["freebuild", "Freebuild", "Public: up to 5 on one island"],
    ["practice", "Piece Control practice", "Practice drills against the Player bot"],
    ["piece1", "Piece Control 1v1", "Closed box, a new solid layout every round, first to 10"],
    ["piece2", "Piece Control 2v2", "Two a side, closed box, new layout every round, first to 10"],
    ["realistics1", "Speed Realistics 1v1", "30 m apart in the open, anything goes, first to 10"],
    ["realistics2", "Speed Realistics 2v2", "Two a side, 30 m apart, anything goes, first to 10"],
    ["zonewars", "Zone Wars", "Red vs blue, up to 4 a side, the storm closes in"],
    ["ffa", "Free For All", "Box fight, 8 fighters, last one standing"],
  ];
  for (const [file, name, sub] of cards) {
    assert.ok(fs.existsSync(path.join(dir, `${file}.png`)), `missing art ${file}.png`);
    assert.ok(game.includes(`assets/project-emx/modes/${file}.png`), `${file} art not used`);
    assert.ok(game.includes(name), `missing mode name ${name}`);
    // The description is the game's, copied rather than written here.
    assert.ok(game.includes(sub), `description for ${name} does not match the game`);
  }
  assert.doesNotMatch(game, /zombies/i, "Build Zombies is behind a disabled flag");
});

test("the game thumbnail is the current one from Roblox, not the retired art", () => {
  // The old lobby art stopped matching the game. The card and the share image
  // now use the thumbnail Roblox itself serves for the universe.
  assert.ok(fs.existsSync(path.join(root, "assets/roblox/project-emx-768.webp")));
  for (const file of ["assets/roblox/project-emx-640.webp", "assets/roblox/project-emx-1280.webp"]) {
    assert.ok(!fs.existsSync(path.join(root, file)), `${file} should have been retired`);
  }
  for (const page of ["index.html", ...GAME_PAGES]) {
    assert.doesNotMatch(read(page), /project-emx-(?:640|1280)\.webp/, `${page} still points at the old art`);
  }
  assert.match(read("index.html"), /assets\/roblox\/project-emx-768\.webp/);
});

/* ------------------------------------------- deployable on this plan ----- */

test("api/ stays within the Serverless Function budget the deploy allows", () => {
  // Vercel turns every file directly under api/ into a Serverless Function and
  // rejects the deployment past the plan limit - the build succeeds and then
  // fails at "Deploying outputs", which is how a 13th file broke production
  // once already. Shared code belongs in api/_lib/, which is not counted.
  const functions = fs
    .readdirSync(path.join(root, "api"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => entry.name);
  assert.ok(
    functions.length <= 12,
    `api/ has ${functions.length} functions, over the 12 the plan allows: ${functions.join(", ")}`,
  );
  assert.ok(!functions.includes("project-emx-status.js"));
  assert.ok(fs.existsSync(path.join(root, "api/_lib/project-emx-status.js")));
});

test("the public status route reaches the handler through a rewrite", () => {
  const routing = JSON.parse(read("vercel.json"));
  const route = routing.rewrites.find((entry) => entry.source === "/api/project-emx-status");
  assert.ok(route, "missing the /api/project-emx-status rewrite");
  assert.equal(route.destination, "/api/site-settings?resource=project-emx-status");
  // The page must keep calling the public path, not the host function.
  assert.match(read("project-emx.js"), /\/api\/project-emx-status/);
  // And the host function must actually delegate.
  const host = read("api/site-settings.js");
  assert.match(host, /require\("\.\/_lib\/project-emx-status"\)/);
  assert.match(host, /searchParams\.get\("resource"\)/);
  assert.match(host, /=== "project-emx-status"\) return projectEmxStatus\(req, res\)/);
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
