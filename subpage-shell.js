(function () {
  "use strict";

  function installShell() {
    const body = document.body;
    if (!body || body.querySelector(".emx-subnav")) return;

    body.classList.add("emx-clean-subpage");
    const legacyHeader = body.querySelector(":scope > header");
    if (legacyHeader) legacyHeader.classList.add("emx-legacy-header");

    const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const entries = [
      ["index.html", "Home"],
      ["products.html", "Products"],
      ["bundles.html", "Bundles"],
      ["https://emx-macros.vercel.app/", "Macros"],
      ["index.html#free-tools", "Free tools"],
      ["aim-trainer.html", "Aim Trainer"],
      ["license.html", "Claim key"]
    ];

    const isCurrent = function (href) {
      const page = href.split("#")[0];
      return page === current;
    };

    const header = document.createElement("header");
    header.className = "emx-subnav";
    header.innerHTML =
      '<a class="emx-subbrand" href="./index.html" aria-label="EMX Tweaks home"><img src="emx-logo.png" alt=""><span>EMX <strong>TWEAKS</strong></span></a>' +
      '<nav class="emx-subnav-links" aria-label="Primary navigation">' +
      entries.map(function (entry) {
        const external = entry[0].startsWith("http");
        return '<a class="' + (isCurrent(entry[0]) ? "is-current" : "") + '" href="' + (external ? entry[0] : "./" + entry[0]) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + entry[1] + "</a>";
      }).join("") +
      "</nav>" +
      '<a class="emx-subnav-discord" href="https://discord.gg/puaZFNfNKW" target="_blank" rel="noopener noreferrer"><i></i> Join Discord</a>';
    body.insertBefore(header, body.firstChild);

    const main = body.querySelector("main");
    if (main) {
      const footer = document.createElement("footer");
      footer.className = "emx-subfooter";
      footer.innerHTML =
        '<span>EMX performance tools, real previews, and clear access paths.</span>' +
        '<a href="./index.html">Back to EMX</a>' +
        '<div class="emx-subfooter-links"><a href="./about.html">About</a><a href="./vouches.html">Vouches</a><a href="./faq.html">FAQ</a><a href="./contact.html">Support</a></div>';
      main.insertAdjacentElement("afterend", footer);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installShell, { once: true });
  else installShell();
})();
