/* PROJECT EMX live dashboard and Discord wiring.
 *
 * The one rule this file enforces everywhere: a tile shows a number only when
 * that number came back from /api/project-emx-status in this browser session.
 * There are no defaults, no last-known values and no placeholders. A tile is in
 * exactly one of four states, and the state is written to data-state so the
 * stylesheet can make an unknown look like an unknown:
 *
 *   loading      - the request is in flight
 *   ok           - a real value arrived (0 is a real value and renders as 0)
 *   empty        - the source answered and genuinely has nothing yet
 *   unavailable  - the source could not be reached, or is not configured
 *
 * The game is in development. Status wording comes from a fixed map that has no
 * "live" and no "operational" in it, so no code path can produce those words.
 */
(() => {
  "use strict";

  const CONTENT_URL = "/content/project-emx.json";
  const STATUS_URL = "/api/project-emx-status";
  const REFRESH_MS = 60000;
  const REQUEST_TIMEOUT_MS = 9000;

  // The only wording the status tile can ever produce.
  const PHASE_LABEL = {
    development: "IN DEVELOPMENT",
    playtesting: "PLAYTESTING",
    "open-beta": "OPEN BETA",
  };

  const numberFormat = new Intl.NumberFormat("en-US");
  const tiles = new Map();
  for (const node of document.querySelectorAll("[data-pe-tile]")) {
    tiles.set(node.dataset.peTile, node);
  }
  const discordTargets = document.querySelectorAll("[data-pe-discord]");
  const feedTargets = document.querySelectorAll("[data-pe-feed]");
  if (!tiles.size && !discordTargets.length && !feedTargets.length) return;

  /* ------------------------------------------------------------- helpers - */

  const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

  async function getJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /** Writes one tile. `value` is rendered verbatim; callers decide the text. */
  function setTile(key, state, value, note) {
    const tile = tiles.get(key);
    if (!tile) return;
    const valueNode = tile.querySelector("[data-pe-value]");
    const noteNode = tile.querySelector("[data-pe-note]");
    tile.dataset.state = state;
    if (valueNode) {
      valueNode.textContent = "";
      if (state === "ok" && tile.hasAttribute("data-pe-pulse")) {
        const dot = document.createElement("span");
        dot.className = "pe-pulse";
        dot.setAttribute("aria-hidden", "true");
        valueNode.appendChild(dot);
      }
      valueNode.appendChild(document.createTextNode(value));
    }
    if (noteNode) noteNode.textContent = note || "";
  }

  function setAllTiles(state, value, note) {
    for (const key of tiles.keys()) setTile(key, state, value, note);
  }

  /** ISO date -> { absolute, relative } or null when the date is unusable. */
  function describeDate(input) {
    if (typeof input !== "string" || !input.trim()) return null;
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return null;
    const absolute = date.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    const diffMs = date.getTime() - Date.now();
    const diffHours = Math.round(diffMs / 3600000);
    let relative;
    if (Math.abs(diffHours) < 1) relative = "within the hour";
    else if (diffHours > 0 && diffHours < 48) relative = `in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
    else if (diffHours >= 48) relative = `in ${Math.round(diffHours / 24)} days`;
    else if (diffHours > -48) relative = `${Math.abs(diffHours)} hour${diffHours === -1 ? "" : "s"} ago`;
    else relative = `${Math.round(Math.abs(diffHours) / 24)} days ago`;
    return { absolute, relative, date };
  }

  /** First entry of a content list that is actually usable, else null. */
  function firstEntry(list) {
    if (!Array.isArray(list)) return null;
    return (
      list.find(
        (item) => item && typeof item.title === "string" && item.title.trim(),
      ) || null
    );
  }

  /* --------------------------------------------------- Discord buttons --- */

  function wireDiscord(content) {
    const code = String(content?.discord?.invite || "").trim();
    for (const node of discordTargets) {
      const label = node.querySelector("[data-pe-discord-label]");
      if (code) {
        node.href = `https://discord.gg/${encodeURIComponent(code)}`;
        node.target = "_blank";
        node.rel = "noopener noreferrer";
        node.removeAttribute("aria-disabled");
        if (label) label.textContent = node.dataset.peDiscordReady || "Join our Discord";
      } else {
        // No invite exists yet, so the control must not pretend to be a link.
        node.removeAttribute("href");
        node.removeAttribute("target");
        node.setAttribute("aria-disabled", "true");
        if (label) label.textContent = "Invite coming soon";
      }
    }
  }

  /* ----------------------------------------------- content-backed tiles -- */

  function renderContentTiles(content) {
    const playtest = firstEntry(content?.playtests);
    if (playtest) {
      const when = describeDate(playtest.startsAt);
      setTile(
        "playtest",
        "ok",
        when ? when.absolute : playtest.title,
        when ? `${playtest.title} - ${when.relative}` : "Time to be confirmed",
      );
    } else {
      setTile(
        "playtest",
        "empty",
        "None scheduled yet",
        "The beta is open now - sessions get posted here and in Discord.",
      );
    }

    const update = firstEntry(content?.updates);
    if (update) {
      const when = describeDate(update.postedAt);
      setTile("update", "ok", update.title, when ? when.absolute : "");
    } else {
      setTile("update", "empty", "No update posted yet", "Patch notes appear here as they ship.");
    }

    const announcement = firstEntry(content?.announcements);
    if (announcement) {
      const when = describeDate(announcement.postedAt);
      setTile("announcement", "ok", announcement.title, when ? when.absolute : "");
    } else {
      setTile("announcement", "empty", "Nothing announced yet", "Announcements appear here first.");
    }
  }

  /* --------------------------------------------------------- list feeds -- */

  /* Renders content/project-emx.json lists into [data-pe-feed] containers on
     the News, Playtesting and Roadmap pages. An empty list renders the
     container's own empty message - never a sample, a teaser or lorem text. */
  function renderFeeds(content) {
    for (const node of document.querySelectorAll("[data-pe-feed]")) {
      const key = node.dataset.peFeed;
      const entries = Array.isArray(content?.[key])
        ? content[key].filter((item) => item && typeof item.title === "string" && item.title.trim())
        : null;

      node.textContent = "";

      if (entries === null) {
        node.appendChild(
          emptyBlock(
            "Unavailable",
            "This list could not be loaded. Refresh the page to try again.",
          ),
        );
        continue;
      }
      if (!entries.length) {
        node.appendChild(
          emptyBlock(
            node.dataset.peFeedEmptyTitle || "Nothing here yet",
            node.dataset.peFeedEmpty || "This will fill in as soon as there is something real to post.",
          ),
        );
        continue;
      }

      const list = document.createElement("ul");
      list.className = "pe-cards";
      for (const entry of entries) {
        const item = document.createElement("li");
        item.className = "pe-card";

        const when = describeDate(entry.startsAt || entry.postedAt);
        const stampText = when ? when.absolute : entry.status;
        if (stampText) {
          const stamp = document.createElement("span");
          stamp.className = "pe-card-time";
          stamp.textContent = when ? `${when.absolute} · ${when.relative}` : String(stampText);
          item.appendChild(stamp);
        }

        const heading = document.createElement("h3");
        heading.textContent = entry.title;
        item.appendChild(heading);

        if (typeof entry.body === "string" && entry.body.trim()) {
          const body = document.createElement("p");
          body.textContent = entry.body;
          item.appendChild(body);
        }
        list.appendChild(item);
      }
      node.appendChild(list);
    }
  }

  function emptyBlock(title, message) {
    const wrap = document.createElement("div");
    wrap.className = "pe-empty";
    const strong = document.createElement("strong");
    strong.textContent = title;
    wrap.appendChild(strong);
    wrap.appendChild(document.createTextNode(message));
    return wrap;
  }

  /* -------------------------------------------------- live status tiles -- */

  function renderStatus(status) {
    const roblox = status?.roblox;
    const discord = status?.discord;

    // Players right now.
    if (roblox?.ok && isNumber(roblox.playing)) {
      const note = isNumber(roblox.visits)
        ? `${numberFormat.format(roblox.visits)} visits all time`
        : "";
      setTile("players", "ok", numberFormat.format(roblox.playing), note);
    } else {
      setTile(
        "players",
        "unavailable",
        "Unavailable",
        roblox?.reason === "not-configured"
          ? "No Roblox universe is configured yet."
          : "Roblox did not answer. Trying again shortly.",
      );
    }

    // Build status. Never "live", never "operational" - the map has no such key.
    const phaseLabel = PHASE_LABEL[status?.phase];
    if (phaseLabel) {
      setTile(
        "status",
        "ok",
        phaseLabel,
        status?.reachable
          ? "Roblox is serving the experience right now."
          : "Roblox status could not be checked just now.",
      );
    } else {
      setTile("status", "unavailable", "Unavailable", "Status could not be read.");
    }

    // Discord members.
    if (discord?.ok && isNumber(discord.memberCount)) {
      const note = isNumber(discord.onlineCount)
        ? `${numberFormat.format(discord.onlineCount)} online now`
        : "";
      setTile("discord", "ok", numberFormat.format(discord.memberCount), note);
    } else if (discord?.reason === "not-configured") {
      setTile(
        "discord",
        "empty",
        "Not connected",
        "The PROJECT EMX invite has not been added to the site yet.",
      );
    } else {
      setTile("discord", "unavailable", "Unavailable", "Discord did not answer.");
    }

    // Extra real figures, shown only when they exist.
    const favourites = document.querySelector("[data-pe-favourites]");
    if (favourites) {
      favourites.textContent =
        roblox?.ok && isNumber(roblox.favorites)
          ? numberFormat.format(roblox.favorites)
          : "--";
    }
    const rating = document.querySelector("[data-pe-rating]");
    if (rating) {
      const up = roblox?.ok ? roblox.upVotes : null;
      const down = roblox?.ok ? roblox.downVotes : null;
      if (isNumber(up) && isNumber(down) && up + down > 0) {
        rating.textContent = `${Math.round((up / (up + down)) * 100)}%`;
      } else if (isNumber(up) && isNumber(down)) {
        rating.textContent = "No ratings yet";
      } else {
        rating.textContent = "--";
      }
    }

    const stamp = document.querySelector("[data-pe-stamp]");
    if (stamp) {
      const fetched = status?.fetchedAt ? new Date(status.fetchedAt) : null;
      stamp.textContent =
        fetched && !Number.isNaN(fetched.getTime())
          ? `Checked ${fetched.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
          : "";
    }
  }

  function renderStatusFailure() {
    for (const key of ["players", "status", "discord"]) {
      setTile(
        key,
        "unavailable",
        "Unavailable",
        "The live status service could not be reached.",
      );
    }
    const stamp = document.querySelector("[data-pe-stamp]");
    if (stamp) stamp.textContent = "Last check failed";
    for (const node of document.querySelectorAll("[data-pe-favourites], [data-pe-rating]")) {
      node.textContent = "--";
    }
  }

  /* ---------------------------------------------------------- lifecycle -- */

  let timer = null;

  async function refreshStatus() {
    try {
      renderStatus(await getJson(STATUS_URL));
    } catch {
      renderStatusFailure();
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!document.hidden) await refreshStatus();
      schedule();
    }, REFRESH_MS);
  }

  async function start() {
    setAllTiles("loading", "Checking...", "");

    let content = null;
    try {
      content = await getJson(CONTENT_URL);
    } catch {
      content = null;
    }

    wireDiscord(content);
    renderFeeds(content);

    // Store pages carry the header Discord button but no dashboard: stop here
    // rather than polling the status service on every page of the site.
    if (!tiles.size) return;

    if (content) {
      renderContentTiles(content);
    } else {
      // Without the content file the site cannot know the invite or the
      // schedule, so it says so rather than guessing.
      for (const key of ["playtest", "update", "announcement"]) {
        setTile(key, "unavailable", "Unavailable", "Site content could not be loaded.");
      }
    }

    await refreshStatus();
    schedule();
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshStatus();
  });

  start();
})();
