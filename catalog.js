(() => {
  "use strict";
  const grid = document.getElementById("productGrid");
  const state = document.getElementById("catalogState");
  const search = document.getElementById("productSearch");
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  let products = [];
  let filter = "all";

  function visible(items) {
    return (Array.isArray(items) ? items : []).filter(
      (item) => item && item.visible !== false && item.retired !== true,
    );
  }
  function checkoutUrl(product) {
    const base = product.key
      ? `https://payhip.com/buy?link=${encodeURIComponent(product.key)}`
      : product.deliveryUrl || product.productUrl || "#";
    const ref =
      window.EMXAffiliate?.activeCode ||
      localStorage.getItem("emx_active_affiliate_ref_v2") ||
      "";
    return window.EMXAffiliate?.appendReferralMetadata
      ? window.EMXAffiliate.appendReferralMetadata(base, ref, product.id)
      : base;
  }
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function priceLabel(product) {
    return Number(product.price || 0) <= 0
      ? "Free"
      : money.format(Number(product.price));
  }
  function responsiveImage(source, alt, loading = "lazy") {
    const optimized = /(?:app-screenshots\/(?:volt-current|emx-windows-tweak-dashboard)|assets\/(?:emx-os|emx-clips|free-tools)|emx-aim-trainer-command-center)/.test(source) && /\.(?:png|jpe?g)$/i.test(source);
    const image = make("img");
    image.src = source;
    image.alt = alt;
    image.loading = loading;
    image.decoding = "async";
    if (!optimized) return image;
    const stem = source.replace(/\.(?:png|jpe?g)$/i, "");
    const picture = make("picture");
    const webp = make("source");
    webp.type = "image/webp";
    webp.srcset = `${stem}-640.webp 640w, ${stem}-960.webp 960w`;
    webp.sizes = "(max-width: 760px) 92vw, (max-width: 1080px) 46vw, 31vw";
    picture.append(webp, image);
    return picture;
  }
  const productDialog = make("dialog", "product-dialog");
  productDialog.setAttribute("aria-label", "Product details");
  document.body.appendChild(productDialog);
  function modalList(items) {
    const list = make("ul", "check-list");
    (Array.isArray(items) ? items : String(items || "").split("\n")).filter(Boolean).forEach(item => list.appendChild(make("li", "", item)));
    return list;
  }
  function openProduct(product) {
    const shell = make("div", "product-dialog-shell");
    const close = make("button", "product-dialog-close", "×");
    close.type = "button"; close.setAttribute("aria-label", "Close product details"); close.onclick = () => productDialog.close();
    const visual = make("div", "product-dialog-visual");
    visual.appendChild(responsiveImage(product.image || "emx-logo-v2.png", `${product.title} preview`, "eager"));
    const content = make("div", "product-dialog-content");
    content.append(make("p", "product-dialog-eyebrow", product.eyebrow || "EMX SOFTWARE"), make("h2", "", product.modalTitle || product.title), make("p", "product-dialog-lead", product.fullDescription || product.description));
    const trust = make("div", "product-dialog-facts");
    [["VERSION", product.version || "Not recorded"],["PLATFORM", product.platform || "See requirements"],["LICENSE", product.licenseType || "See listing"],["RECOVERY", (product.recovery || [])[0] || "See instructions"]].forEach(([label,value]) => { const fact=make("span"); fact.append(make("small","",label),make("b","",value)); trust.appendChild(fact); });
    content.appendChild(trust);
    const tabs = make("div", "product-dialog-tabs");
    const panels = make("div", "product-dialog-panels");
    const sections = [
      ["Features", product.features, "Included capabilities"],
      ["Requirements", product.requirements, "System requirements"],
      ["Install", product.installation, "Installation notes"],
      ["Changelog", product.changelog, "Current release changes"],
      ["Limitations", product.limitations, "Known limitations"]
    ].filter(([,items]) => Array.isArray(items) ? items.length : String(items || "").trim());
    sections.forEach(([label,items,title], index) => { const button=make("button", "", label); button.type="button"; const panel=make("section"); panel.hidden=index!==0; panel.append(make("h3","",title),modalList(items)); button.setAttribute("aria-selected", String(index===0)); button.onclick=()=>{[...tabs.children].forEach(x=>x.setAttribute("aria-selected","false"));[...panels.children].forEach(x=>x.hidden=true);button.setAttribute("aria-selected","true");panel.hidden=false}; tabs.appendChild(button); panels.appendChild(panel); });
    if (sections.length) content.append(tabs, panels);
    const footer = make("div", "product-dialog-footer");
    footer.append(make("strong", "", priceLabel(product)));
    const action = make("a", "emx-button emx-button-primary", product.ctaLabel || (product.deliveryType === "direct" || product.deliveryType === "external" ? "Download now" : "Open official checkout"));
    action.dataset.productId=product.id;
    if (["direct","external"].includes(product.deliveryType)) { action.href=product.deliveryUrl||"#"; action.dataset.emxDownload="true"; } else { action.href=checkoutUrl(product); }
    footer.appendChild(action); content.appendChild(footer); shell.append(close, visual, content); productDialog.replaceChildren(shell); productDialog.showModal();
    window.EMXAffiliate?.track("product_view", { productId: product.id, source: "quick-view" });
  }
  function card(product) {
    const article = make("article", "product-card");
    article.id = `product-${product.id}`;
    const media = make("div", "product-media");
    media.appendChild(responsiveImage(product.image || "emx-logo-v2.png", `${product.title} preview`));
    if (product.saleBadge)
      media.appendChild(make("span", "product-badge", product.saleBadge));
    const body = make("div", "product-body");
    body.append(
      make("p", "", product.eyebrow || "EMX SOFTWARE"),
      make("h2", "", product.title),
      make("p", "product-description", product.description),
    );
    const tags = make("ul", "product-tags");
    (product.tags || [])
      .slice(0, 4)
      .forEach((tag) => tags.appendChild(make("li", "", tag)));
    body.appendChild(tags);
    const quickView = make("button", "product-quick-view", "Explore product");
    quickView.type = "button";
    quickView.addEventListener("click", () => openProduct(product));
    body.appendChild(quickView);
    const actions = make("div", "product-actions");
    const price = make(
      "div",
      "product-price",
      priceLabel(product),
    );
    if (Number(product.oldPrice || 0) > Number(product.price || 0)) {
      const old = make("del", "", money.format(Number(product.oldPrice)));
      price.appendChild(old);
    }
    const details = make("details", "product-details");
    const summary = make("summary", "", "What is included");
    const featureList = make("ul", "check-list");
    (product.features || []).slice(0, 5).forEach((feature) =>
      featureList.appendChild(make("li", "", feature)),
    );
    details.append(summary, featureList);
    const galleryImages = (product.gallery || []).filter(Boolean).slice(0, 24);
    const galleryDetails = make("details", "product-gallery-details");
    const gallerySummary = make(
      "summary",
      "",
      `View ${galleryImages.length || 1} full screenshot${galleryImages.length === 1 ? "" : "s"}`,
    );
    const sources = galleryImages.length ? galleryImages : [product.image || "emx-logo-v2.png"];
    const gallery = make("div", "product-gallery-carousel");
    const stage = make("div", "product-gallery-stage");
    const previous = make("button", "product-gallery-control", "←");
    previous.type = "button";
    previous.setAttribute("aria-label", `Previous ${product.title} screenshot`);
    const fullLink = make("a");
    fullLink.target = "_blank";
    fullLink.rel = "noopener";
    const next = make("button", "product-gallery-control", "→");
    next.type = "button";
    next.setAttribute("aria-label", `Next ${product.title} screenshot`);
    const rail = make("div", "product-gallery-thumbnails");
    let galleryIndex = 0;
    function selectScreenshot(index) {
      galleryIndex = (index + sources.length) % sources.length;
      const selected = sources[galleryIndex];
      fullLink.href = selected;
      fullLink.setAttribute("aria-label", `Open ${product.title} screenshot ${galleryIndex + 1} full size`);
      fullLink.replaceChildren(responsiveImage(selected, `${product.title} screenshot ${galleryIndex + 1}`));
      [...rail.children].forEach((button, position) => button.setAttribute("aria-current", String(position === galleryIndex)));
    }
    sources.forEach((source, index) => {
      const thumbnail = make("button");
      thumbnail.type = "button";
      thumbnail.setAttribute("aria-label", `Show ${product.title} screenshot ${index + 1}`);
      thumbnail.appendChild(responsiveImage(source, ""));
      thumbnail.addEventListener("click", () => selectScreenshot(index));
      rail.appendChild(thumbnail);
    });
    previous.addEventListener("click", () => selectScreenshot(galleryIndex - 1));
    next.addEventListener("click", () => selectScreenshot(galleryIndex + 1));
    stage.append(previous, fullLink, next);
    gallery.append(stage, rail);
    selectScreenshot(0);
    galleryDetails.append(gallerySummary, gallery);
    const trust = make("details", "product-trust");
    trust.appendChild(make("summary", "", "Release, requirements, and recovery"));
    const trustMeta = make("dl", "product-trust-meta");
    [
      ["Current version", product.version || "See current product listing"],
      ["Last verified", product.lastVerified || "Not recorded"],
      ["Requirements", (product.requirements || []).join(" • ") || "Review before checkout"],
      ["Recovery", (product.recovery || []).join(" • ") || "See product instructions"],
      ["Known limitations", (product.limitations || []).join(" • ") || "No additional catalog limitations recorded"],
    ].forEach(([label, value]) => {
      trustMeta.append(make("dt", "", label), make("dd", "", value));
    });
    trust.appendChild(trustMeta);
    const deliveryType = product.deliveryType || (product.key ? "payhip" : "external");
    const checkout = make(
      "a",
      "emx-button emx-button-primary",
      product.ctaLabel || (deliveryType === "direct" || deliveryType === "external" ? "Download" : product.type === "bundle" ? "Open bundle checkout" : "Open official checkout"),
    );
    checkout.dataset.productId = product.id;
    if (deliveryType === "direct" || deliveryType === "external") {
      checkout.href = product.deliveryUrl || "#";
      checkout.dataset.emxDownload = "true";
    } else if (deliveryType === "none") {
      checkout.href = "#";
      checkout.setAttribute("aria-disabled", "true");
      checkout.textContent = "Coming soon";
    } else checkout.href = checkoutUrl(product);
    const checkoutGroup = make("div", "product-checkout-group");
    const affiliateLink = make(
      "a",
      "product-affiliate-link",
      "Earn by sharing EMX →",
    );
    affiliateLink.href = "./affiliate.html";
    checkoutGroup.append(checkout);
    if (deliveryType === "payhip" && Number(product.price || 0) > 0) {
      checkoutGroup.append(affiliateLink);
    }
    actions.append(price, checkoutGroup);
    body.append(galleryDetails, details, trust, actions);
    article.append(media, body);
    return article;
  }
  function render() {
    const query = search.value.trim().toLowerCase();
    const matches = products.filter(
      (product) =>
        (filter === "all" || (product.type || "product") === filter) &&
        (!query ||
          [
            product.title,
            product.eyebrow,
            product.description,
            ...(product.tags || []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)),
    );
    grid.replaceChildren(...matches.map(card));
    if (window.EMXAffiliate?.activeCode && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.55) return;
        observer.unobserve(entry.target);
        window.EMXAffiliate.track("product_view", { productId: entry.target.id.replace(/^product-/, "") });
      }), { threshold: 0.55 });
      grid.querySelectorAll(".product-card").forEach(item => observer.observe(item));
    }
    state.textContent = matches.length
      ? `${matches.length} current EMX listing${matches.length === 1 ? "" : "s"}.`
      : "No current products match this search.";
    if (window.location.hash)
      window.setTimeout(
        () =>
          document
            .querySelector(window.location.hash)
            ?.scrollIntoView({ block: "center" }),
        0,
      );
  }
  search?.addEventListener("input", render);
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      document
        .querySelectorAll("[data-filter]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      render();
    }),
  );
  async function load() {
    const seed = visible(window.EMX_PRODUCTS || []);
    grid.replaceChildren(
      make("div", "catalog-skeleton"),
      make("div", "catalog-skeleton"),
      make("div", "catalog-skeleton"),
    );
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) throw new Error();
      products = visible(await response.json());
      state.textContent = "Current catalog loaded.";
    } catch (error) {
      products = seed;
      state.textContent =
        "Showing the checked-in catalog because the live catalog is unavailable.";
    }
    render();
  }
  load();
  productDialog.addEventListener("click", event => { if (event.target === productDialog) productDialog.close(); });
})();
