(() => {
  "use strict";

  const page = document.body.dataset.page || "";

  // Every destination the site has. `primaryKeys` decides which of them sit in
  // the main bar; everything else stays reachable under Explore, so no existing
  // store page becomes unreachable when the game takes the front of the nav.
  const navigation = [
    ["home", "./index.html", "Project EMX"],
    ["news", "./news.html", "News"],
    ["game", "./game.html", "Game Info"],
    ["community", "./community.html", "Community"],
    ["playtesting", "./playtesting.html", "Playtesting"],
    ["products", "./products.html", "Store"],
    ["help", "./help.html", "Support"],
    ["roadmap", "./roadmap.html", "Roadmap"],
    ["extensions", "./extensions", "Extensions"],
    ["clips", "https://clips.emxtweaks.com/", "Clips · Free"],
    ["compare", "./compare.html", "Compare"],
    ["updates", "./updates.html", "Updates"],
    ["hub", "./index.html#emx-hub", "Community hub"],
    ["bundles", "./bundles.html", "Bundles"],
    ["macros", "./macros.html", "Macros"],
    ["free", "./index.html?free=1#free-tools", "Free"],
    ["links", "./links.html", "Network"],
    ["about", "./about.html", "About"],
    ["vouches", "./vouches.html", "Reviews"],
    ["license", "https://activate.emxtweaks.com/activate", "Claim"],
    ["affiliate", "./affiliate.html", "Affiliate"],
    ["faq", "./faq.html", "FAQ"],
  ];
  const primaryKeys = new Set([
    "home",
    "news",
    "game",
    "community",
    "playtesting",
    "products",
    "help",
  ]);
  const navLink = ([key, href, label]) =>
    `<a href="${href}"${key === "clips" ? ' class="site-clips-link"' : ""}${page === key ? ' aria-current="page"' : ""}>${label}</a>`;

  // The JOIN DISCORD control ships disabled and says so. project-emx.js turns it
  // into a real link only once content/project-emx.json carries an invite code,
  // so the site never shows a button that goes nowhere.
  const discordButton = `
    <a class="site-discord" data-pe-discord data-pe-discord-ready="Join Discord" aria-disabled="true">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.3 5.3A16.5 16.5 0 0 0 15.1 4l-.2.4a12.5 12.5 0 0 1 3.7 1.9 13.3 13.3 0 0 0-11.2 0 12.5 12.5 0 0 1 3.7-1.9L10.9 4a16.5 16.5 0 0 0-4.2 1.3C4.1 9.2 3.4 13 3.8 16.7a16.7 16.7 0 0 0 5.1 2.6l1.1-1.7a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.6 0l.4.3a10.8 10.8 0 0 1-1.7.8l1.1 1.7a16.7 16.7 0 0 0 5.1-2.6c.5-4.3-.6-8-2.9-11.4ZM9.7 14.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2c0 1.1-.8 2-1.8 2Z"/></svg>
      <span data-pe-discord-label>Invite coming soon</span>
    </a>`;

  // The game pages wear the PROJECT EMX wordmark; everything else keeps the EMX
  // Software one. The same bar renders on the catalogue and the checkout pages,
  // and branding those with the game would misname the shop someone is buying
  // from.
  const gamePages = new Set(["home", "news", "game", "community", "playtesting", "roadmap"]);
  const brand = gamePages.has(page)
    ? {
        label: "PROJECT EMX home",
        src: "./assets/project-emx/logo-wordmark-320.webp",
        srcset: "./assets/project-emx/logo-wordmark-320.webp 320w, ./assets/project-emx/logo-wordmark-640.webp 640w",
        width: 320,
        height: 98,
      }
    : {
        label: "EMX Software home",
        src: "./assets/brand/emx-software-wordmark-320.webp",
        srcset: "",
        width: 320,
        height: 123,
      };

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <a class="site-brand" href="./index.html" aria-label="${brand.label}">
        <img class="site-brand-wordmark" src="${brand.src}"${brand.srcset ? ` srcset="${brand.srcset}" sizes="150px"` : ""} width="${brand.width}" height="${brand.height}" alt="">
      </a>
      <button class="emx-nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" data-emx-nav-toggle aria-label="Toggle navigation"><span></span></button>
      <nav id="site-navigation" data-emx-mobile-nav aria-label="Primary navigation">
        ${navigation.filter(([key]) => primaryKeys.has(key)).map(navLink).join("")}
        <details class="site-more"><summary${navigation.some(([key]) => !primaryKeys.has(key) && page === key) ? ' class="is-current"' : ""}>Explore <span aria-hidden="true">⌄</span></summary><div class="site-more-links">
          ${navigation.filter(([key]) => !primaryKeys.has(key)).map(navLink).join("")}
          <a href="https://support.emxtweaks.com/">Support center</a>
          <button class="emx-theme-toggle" type="button" data-emx-theme-toggle aria-label="Switch color theme"><span class="emx-theme-icon" aria-hidden="true">☀</span><span class="emx-theme-label">Light mode</span></button>
        </div></details>
      </nav>
      ${discordButton}
    `;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.className = "site-footer";
    // The About page gets a shorter, neutral legal summary; policy pages keep the full note.
    const legalNote =
      page === "about"
        ? `<p class="site-legal-note">Digital products. Licensing and eligibility vary by product. See <a href="./eula.html">License &amp; Keys</a> for details.</p>`
        : `<p class="site-legal-note"><strong>All EMX products are digital — all sales are final.</strong> License keys are machine-bound; an OS reinstall, factory reset, or hardware change can void a key, and keys are not recovered or re-issued for free. Contact <a href="mailto:emxbiz@emxtweaks.com">emxbiz@emxtweaks.com</a>.</p>`;
    footer.innerHTML = `
      <div><a class="site-brand" href="./index.html"><img src="emx-logo-v2.png" width="500" height="500" alt=""><span>EMX <strong>SOFTWARE</strong></span></a><p>Windows apps, creator tools, and real product support.</p>${legalNote}</div>
      <nav aria-label="Footer navigation"><a href="./index.html">Project EMX</a><a href="./news.html">News</a><a href="./game.html">Game Info</a><a href="./playtesting.html">Playtesting</a><a href="./roadmap.html">Roadmap</a><a href="./about.html">About</a><a href="./extensions">Extensions</a><a href="./vouches.html">Reviews</a><a href="./help.html">Help</a><a href="./compare.html">Compare</a><a href="./updates.html">Updates</a><a href="./links.html">EMX Network</a><a href="https://support.emxtweaks.com/">Support</a><a href="./terms.html">Terms</a><a href="./privacy.html">Privacy</a><a href="./refunds.html">Refund Policy</a><a href="./eula.html">License &amp; Keys</a></nav>
    `;
  }

  // One wiring script owns every [data-pe-discord] control, including the one
  // this file just rendered. Pages that already load it are left alone.
  if (!document.querySelector('script[src^="project-emx.js"]')) {
    const script = document.createElement("script");
    script.src = "project-emx.js?v=1";
    script.async = false;
    document.head.appendChild(script);
  }

  // Inject the shared EMX animated background on every shell page (skip if one
  // is already present, e.g. pages that hard-code it or the self-contained hub).
  if (!document.querySelector(".deck-bg")) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="deck-bg" aria-hidden="true"><div class="deck-stars"></div><div class="deck-stars deck-stars-2"></div><div class="deck-aurora"></div><div class="deck-grid"></div><div class="deck-vignette"></div></div>',
    );
  }
})();
