(() => {
  "use strict";

  const page = document.body.dataset.page || "";
  const navigation = [
    ["home", "./index.html", "Home"],
    ["products", "./products.html", "Products"],
    ["bundles", "./bundles.html", "Bundles"],
    ["macros", "./macros.html", "Macros"],
    ["free", "./index.html?free=1#free-tools", "Free"],
    ["links", "./links.html", "Network"],
    ["about", "./about.html", "About"],
    ["license", "https://activate.emxtweaks.com/activate", "Claim"],
    ["affiliate", "./affiliate.html", "Affiliate"],
    ["contact", "./contact.html", "Support"],
  ];

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <a class="site-brand" href="./index.html" aria-label="EMX TWEAKS home">
        <img src="emx-logo-v2.png" width="500" height="500" alt="">
        <span>EMX <strong>TWEAKS</strong></span>
      </a>
      <button class="emx-nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" data-emx-nav-toggle aria-label="Toggle navigation"><span></span></button>
      <nav id="site-navigation" data-emx-mobile-nav aria-label="Primary navigation">
        ${navigation.map(([key, href, label]) => `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <div class="site-header-actions">
        <button class="emx-theme-toggle" type="button" data-emx-theme-toggle aria-label="Switch color theme">
          <span class="emx-theme-icon" aria-hidden="true">☀</span><span class="emx-theme-label">Light mode</span>
        </button>
        <a class="site-support" href="https://support.emxtweaks.com/"><i></i> Support center</a>
      </div>
    `;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.className = "site-footer";
    // The About page gets a shorter, neutral legal summary; policy pages keep the full note.
    const legalNote = page === "about"
      ? `<p class="site-legal-note">Digital products. Licensing and eligibility vary by product. See <a href="./eula.html">License &amp; Keys</a> for details.</p>`
      : `<p class="site-legal-note"><strong>All EMX products are digital — all sales are final.</strong> License keys are machine-bound; an OS reinstall, factory reset, or hardware change can void a key, and keys are not recovered or re-issued for free. Contact <a href="mailto:emxbiz@emxtweaks.com">emxbiz@emxtweaks.com</a>.</p>`;
    footer.innerHTML = `
      <div><a class="site-brand" href="./index.html"><img src="emx-logo-v2.png" width="500" height="500" alt=""><span>EMX <strong>TWEAKS</strong></span></a><p>Windows software, setup tools, and real product support.</p>${legalNote}</div>
      <nav aria-label="Footer navigation"><a href="./about.html">About</a><a href="./compare.html">Compare</a><a href="./updates.html">Updates</a><a href="./links.html">EMX Network</a><a href="https://support.emxtweaks.com/">Support</a><a href="./terms.html">Terms</a><a href="./privacy.html">Privacy</a><a href="./refunds.html">Refund Policy</a><a href="./eula.html">License &amp; Keys</a></nav>
    `;
  }

  // Inject the shared EMX animated background on every shell page (skip if one
  // is already present, e.g. pages that hard-code it or the self-contained hub).
  if (!document.querySelector(".deck-bg")) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="deck-bg" aria-hidden="true"><div class="deck-stars"></div><div class="deck-stars deck-stars-2"></div><div class="deck-aurora"></div><div class="deck-grid"></div><div class="deck-vignette"></div></div>'
    );
  }
})();
