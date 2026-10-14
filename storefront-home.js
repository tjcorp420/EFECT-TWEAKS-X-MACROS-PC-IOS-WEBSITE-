(() => {
  "use strict";
  const grid = document.getElementById("store-featured");
  const status = document.getElementById("featured-status");
  // Desktop Flow Lite and Taskbar Studio lead as the two spotlight apps.
  const spotlight = new Set(["emx_desktop_flow_lite", "emx_taskbar_studio"]);
  const goals = {
    emx_desktop_flow_lite: [
      "DESKTOP CUSTOMIZATION",
      "Shape your desktop with live wallpapers, rotation, custom cursors, and focused visual controls.",
    ],
    emx_taskbar_studio: [
      "TASKBAR CUSTOMIZATION",
      "Build your own Windows taskbar with floating layouts, icon shapes, image or MP4 backgrounds, saved profiles, and an audio panel.",
    ],
    volt: [
      "MACRO CONTROL",
      "Configure keyboard and mouse macros, timing profiles, and saved binds from one Windows app.",
    ],
    windows_tweak_dashboard: [
      "WINDOWS TUNING",
      "Guided Windows tuning with backups, an Undo Center, and action logs.",
    ],
    clips: [
      "FREE CAPTURE APP",
      "Keep replay ready, save a moment with your hotkey, and manage finished clips locally.",
    ],
  };
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const accents = {
    volt: "lime",
    emx_desktop_flow_lite: "violet",
    emx_taskbar_studio: "cyan",
    windows_tweak_dashboard: "cyan",
    clips: "lime",
  };
  const optimizedImage =
    /(?:app-screenshots\/emx-windows-tweak-dashboard|assets\/emx-clips\/|assets\/emx-volt-v0\.1\.76\/dashboard|assets\/emx-desktop-flow-lite\/cover|assets\/emx-taskbar-studio\/appearance)[^/]*\.png$/;
  function productImage(product) {
    const image = el("img");
    image.src = product.image;
    image.alt = product.title + " interface";
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 1280;
    image.height = 720;
    if (!optimizedImage.test(product.image)) return image;
    const stem = product.image.replace(/\.png$/i, "");
    const picture = el("picture");
    const webp = el("source");
    webp.type = "image/webp";
    webp.srcset = `${stem}-640.webp 640w, ${stem}-960.webp 960w`;
    webp.sizes = spotlight.has(product.id) ? "(max-width: 760px) 92vw, 600px" : "(max-width: 760px) 92vw, (max-width: 1080px) 46vw, 400px";
    picture.append(webp, image);
    return picture;
  }
  function render(products, fallback = false) {
    grid.replaceChildren();
    for (const [id, [goal, copy]] of Object.entries(goals)) {
      const product = products.find(
        (p) =>
          p.id === id &&
          p.visible !== false &&
          p.publishStatus !== "draft" &&
          p.publishStatus !== "archived",
      );
      if (!product) continue;
      const card = el("article", null, "store-product");
      card.dataset.storeProduct = id;
      card.dataset.accent = accents[id] || "lime";
      card.dataset.tilt = "";
      if (spotlight.has(id)) card.classList.add("is-spotlight");
      const media = el("div", null, "store-product-media");
      media.append(productImage(product), el("span", null, "store-product-glare"));
      if (product.saleBadge)
        media.append(el("span", product.saleBadge, "store-product-badge"));
      const content = el("div", null, "store-product-copy");
      content.append(el("small", goal), el("h3", product.title), el("p", copy));
      const facts = el("dl", null, "store-product-facts");
      for (const [label, value] of [
        ["Version", product.version],
        ["Platform", product.platform],
      ]) {
        if (!value) continue;
        const row = el("div");
        row.append(el("dt", label), el("dd", value));
        facts.append(row);
      }
      if (facts.children.length) content.append(facts);
      const actions = el("div", null, "store-product-actions");
      const price = el(
        "strong",
        Number(product.price || 0) <= 0
          ? "Free"
          : money.format(Number(product.price)),
        "store-product-price",
      );
      if (Number(product.oldPrice || 0) > Number(product.price || 0))
        price.append(el("del", money.format(Number(product.oldPrice))));
      const link = el("a", "Explore product", "deck-btn deck-btn-ghost");
      link.href = "products.html#product-" + encodeURIComponent(id);
      link.dataset.storeProductLink = id;
      link.setAttribute("aria-label", "Explore " + product.title);
      actions.append(price, link);
      content.append(actions);
      card.append(media, content);
      grid.append(card);
    }
    status.textContent = fallback
      ? "Showing the saved catalog. Confirm current price at checkout."
      : grid.children.length
        ? ""
        : "Browse the catalog for current availability.";
    const bundle = products.find(
      (p) =>
        p.id === "os_macro_bundle" &&
        p.visible !== false &&
        p.publishStatus !== "draft" &&
        p.publishStatus !== "archived",
    );
    const panel = document.getElementById("store-bundle");
    panel.replaceChildren();
    panel.hidden = !bundle;
    if (bundle) {
      const copy = el("div");
      copy.append(
        el("p", "WINDOWS TUNING + MACRO CONTROL", "deck-kicker"),
        el("h2", "Want both? Start with the bundle."),
        el("p", bundle.description),
      );
      const link = el("a", "Explore the bundle →", "deck-btn deck-btn-primary");
      link.href = "bundles.html";
      copy.append(
        el(
          "strong",
          money.format(bundle.price),
        ),
      );
      panel.append(copy, link);
    }
    window.EMXStoreAnalytics?.observe(grid);
  }
  render(window.EMX_PRODUCTS || [], true);
  fetch("/api/products", { signal: AbortSignal.timeout(6000) })
    .then((r) => {
      if (!r.ok) throw Error("Catalog unavailable");
      return r.json();
    })
    .then((data) => {
      const products = Array.isArray(data) ? data : data.products;
      if (!Array.isArray(products)) throw Error("Invalid catalog");
      render(products);
    })
    .catch(() => {});
  document.querySelectorAll("video:not(#store-header-video)").forEach((video) =>
    video.addEventListener(
      "play",
      () => {
        document.querySelectorAll("video:not(#store-header-video)").forEach((other) => {
          if (other !== video) other.pause();
        });
      },
      { passive: true },
    ),
  );
})();
