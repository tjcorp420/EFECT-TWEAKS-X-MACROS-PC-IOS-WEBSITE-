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
    footer.innerHTML = `
      <div><a class="site-brand" href="./index.html"><img src="emx-logo-v2.png" width="500" height="500" alt=""><span>EMX <strong>TWEAKS</strong></span></a><p>Windows software, setup tools, and real product support.</p></div>
      <nav aria-label="Footer navigation"><a href="./about.html">About</a><a href="./compare.html">Compare</a><a href="./updates.html">Updates</a><a href="./index.html?free=1#free-tools">Free utilities</a><a href="./links.html">EMX Network</a><a href="https://activate.emxtweaks.com/activate">Claim key</a><a href="./affiliate.html">Affiliate</a><a href="https://support.emxtweaks.com/">Support</a></nav>
    `;
  }
})();
