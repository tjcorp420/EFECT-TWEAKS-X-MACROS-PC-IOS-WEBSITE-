(() => {
  "use strict";
  const sent = new Set();
  let sessionId;
  try {
    sessionId = sessionStorage.getItem("emx_store_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("emx_store_session", sessionId);
    }
  } catch {
    sessionId = crypto.randomUUID();
  }
  function track(type, productId = "store") {
    if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true)
      return;
    const key = type + ":" + productId;
    if (sent.has(key)) return;
    sent.add(key);
    fetch("/api/affiliate-track?store=1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
      body: JSON.stringify({
        type,
        productId,
        sessionId,
        page: location.pathname,
      }),
    }).catch(() => {});
  }
  function observe(root = document) {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            observer.unobserve(entry.target);
            track(
              "product_view",
              entry.target.dataset.storeProduct ||
                entry.target.id.replace(/^product-/, ""),
            );
          }
        }),
      { threshold: 0.5 },
    );
    root
      .querySelectorAll("[data-store-product],.product-card")
      .forEach((card) => observer.observe(card));
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    if (link.dataset.storeProductLink)
      track("product_view", link.dataset.storeProductLink);
    try {
      if (
        new URL(link.href).hostname === "payhip.com" &&
        link.dataset.productId
      )
        track("checkout_open", link.dataset.productId);
    } catch {}
  });
  window.EMXStoreAnalytics = { track, observe };
  track("page_view");
})();
