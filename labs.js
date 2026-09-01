(() => {
  "use strict";

  const grid = document.getElementById("labs-grid");
  const filterRoot = document.getElementById("labs-filter");
  const summary = document.getElementById("labs-summary");
  const empty = document.getElementById("labs-empty");
  if (!grid || !filterRoot || !summary || !empty) return;

  const products = (Array.isArray(window.EMX_PRODUCTS) ? window.EMX_PRODUCTS : [])
    .filter(product => product && product.visible !== false && product.retired !== true && Number(product.price) === 0)
    .sort((left, right) => (Number(left.introOrder) || 99) - (Number(right.introOrder) || 99));

  const categories = ["All tools", ...new Set(products.map(product => product.category || "Utilities"))];
  let activeCategory = "All tools";

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function deliveryNote(product) {
    if (product.id === "clips") return "Free machine-bound activation is requested through the EMX Clips product site.";
    if (product.deliveryType === "direct") return "Direct EMX-hosted package. Review the included instructions before running it.";
    return "Official EMX download route. Requirements remain listed before installation.";
  }

  function makeCard(product) {
    const article = element("article", "lab-card");
    article.dataset.category = product.category || "Utilities";

    const media = element("div", "lab-card-media");
    const badge = element("span", "lab-card-badge", "FREE");
    const image = document.createElement("img");
    image.src = product.image || "./emx-logo-v2.png";
    image.alt = `${product.title || "EMX utility"} interface`;
    image.width = 1280;
    image.height = 720;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.src = "./emx-logo-v2.png";
      image.alt = "EMX logo";
    }, { once: true });
    media.append(image, badge);

    const body = element("div", "lab-card-body");
    const meta = element("div", "lab-card-meta");
    meta.append(
      element("span", "", product.category || "Utilities"),
      element("span", "", product.version || "Current release")
    );
    const title = element("h3", "", product.title || "EMX Utility");
    const description = element("p", "lab-card-description", product.description || "Free EMX utility.");
    const features = element("ul", "lab-card-features");
    (Array.isArray(product.features) ? product.features.slice(0, 3) : []).forEach(feature => {
      features.append(element("li", "", feature));
    });

    const actions = element("div", "lab-card-actions");
    const download = element("a", "emx-button emx-button-primary", product.ctaLabel || "Open free download");
    download.href = product.deliveryUrl || product.productUrl || "./contact.html";
    if (product.deliveryUrl || product.productUrl) {
      download.dataset.emxDownload = "";
      download.dataset.productId = product.id;
    }
    const note = element("p", "lab-card-note", deliveryNote(product));
    actions.append(download, note);
    body.append(meta, title, description, features, actions);
    article.append(media, body);
    return article;
  }

  function renderFilters() {
    filterRoot.replaceChildren();
    categories.forEach(category => {
      const button = element("button", "", category);
      button.type = "button";
      button.setAttribute("aria-pressed", String(category === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = category;
        renderFilters();
        renderProducts();
      });
      filterRoot.append(button);
    });
  }

  function renderProducts() {
    const visible = activeCategory === "All tools"
      ? products
      : products.filter(product => (product.category || "Utilities") === activeCategory);
    grid.replaceChildren(...visible.map(makeCard));
    grid.setAttribute("aria-busy", "false");
    empty.hidden = visible.length > 0;
    grid.hidden = visible.length === 0;
    summary.textContent = `${visible.length} free ${visible.length === 1 ? "release" : "releases"}${activeCategory === "All tools" ? " available now." : ` in ${activeCategory}.`}`;
  }

  renderFilters();
  renderProducts();
})();
