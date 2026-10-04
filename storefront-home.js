(() => {
  "use strict";
  const grid = document.getElementById("store-featured");
  const status = document.getElementById("featured-status");
  const goals = {
    fps: [
      "Tune your gaming PC",
      "A focused Windows performance pack with system, network, and profile controls.",
    ],
    windows_tweak_dashboard: [
      "Manage Windows changes",
      "Guided Windows tuning with backups, an Undo Center, and action logs.",
    ],
    volt: [
      "Configure your macros",
      "Keyboard and mouse macros with timing profiles, saved binds, and emergency stop.",
    ],
  };
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
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
      const image = el("img");
      image.src = product.image;
      image.alt = product.title + " interface";
      image.loading = "lazy";
      image.width = 1280;
      image.height = 720;
      const content = el("div", null, "store-product-copy");
      content.append(el("small", goal), el("h3", product.title), el("p", copy));
      const actions = el("div", null, "store-product-actions");
      const link = el("a", "Explore product →", "deck-btn deck-btn-ghost");
      link.href = "products.html#product-" + encodeURIComponent(id);
      link.dataset.storeProductLink = id;
      actions.append(
        el(
          "strong",
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(product.price),
        ),
        link,
      );
      content.append(actions);
      card.append(image, content);
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
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(bundle.price),
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
