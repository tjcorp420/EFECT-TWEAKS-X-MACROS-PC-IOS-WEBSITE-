(() => {
  "use strict";

  const page = document.body.dataset.page || "";
  const navigation = [
    ["home", "./index.html", "Home"],
    ["products", "./products.html", "Products"],
    ["bundles", "./bundles.html", "Bundles"],
    ["macros", "./macros.html", "Macros"],
    ["labs", "./labs.html", "Labs"],
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
      <a class="site-support" href="https://support.emxtweaks.com/"><i></i> Support center</a>
    `;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div><a class="site-brand" href="./index.html"><img src="emx-logo-v2.png" width="500" height="500" alt=""><span>EMX <strong>TWEAKS</strong></span></a><p>Windows software, setup tools, and real product support.</p></div>
      <nav aria-label="Footer navigation"><a href="./about.html">About</a><a href="./compare.html">Compare</a><a href="./updates.html">Updates</a><a href="./labs.html">EMX Labs</a><a href="https://activate.emxtweaks.com/activate">Claim key</a><a href="./affiliate.html">Affiliate</a><a href="https://support.emxtweaks.com/">Support</a></nav>
    `;
  }
})();
