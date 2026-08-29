(() => {
  "use strict";

  const REF_KEY = "emx_active_affiliate_ref_v2";
  const VISITOR_KEY = "emx_affiliate_visitor_v1";
  const SESSION_KEY = "emx_affiliate_session_v1";
  const REF_TIME_KEY = "emx_active_affiliate_ref_time_v1";
  const ATTRIBUTION_MS = 30 * 24 * 60 * 60 * 1000;

  function cleanCode(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
  }

  function referralFromLocation() {
    const query = new URLSearchParams(window.location.search);
    const path = window.location.pathname.split("/").filter(Boolean);
    const pathCode = path[0] === "r" ? path[1] : "";
    return cleanCode(pathCode || query.get("ref") || query.get("affiliate") || query.get("af"));
  }

  function getVisitorId() {
    let value = window.localStorage.getItem(VISITOR_KEY) || "";
    if (!/^[a-zA-Z0-9_-]{12,100}$/.test(value)) {
      const bytes = new Uint8Array(18);
      window.crypto.getRandomValues(bytes);
      value = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
      window.localStorage.setItem(VISITOR_KEY, value);
    }
    return value;
  }

  function getSessionId() {
    let value = window.sessionStorage.getItem(SESSION_KEY) || "";
    if (!/^[a-zA-Z0-9_-]{12,100}$/.test(value)) {
      value = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
      window.sessionStorage.setItem(SESSION_KEY, value);
    }
    return value;
  }

  function deviceCategory() {
    if (window.matchMedia("(max-width: 600px)").matches) return "mobile";
    if (window.matchMedia("(max-width: 1000px)").matches) return "tablet";
    return "desktop";
  }

  function appendReferralMetadata(url, code, productId = "") {
    if (!code) return url;
    try {
      const target = new URL(url, window.location.href);
      if (target.hostname === "payhip.com" || target.hostname.endsWith(".payhip.com")) {
        target.searchParams.delete("af");
        target.searchParams.set("metadata[emx_ref]", code);
        if (productId) target.searchParams.set("metadata[emx_product]", cleanCode(productId));
      }
      return target.toString();
    } catch (error) {
      return url;
    }
  }

  const incomingRef = referralFromLocation();
  if (incomingRef) {
    window.localStorage.setItem(REF_KEY, incomingRef);
    window.localStorage.setItem(REF_TIME_KEY, String(Date.now()));
    document.cookie = `emx_ref=${encodeURIComponent(incomingRef)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  }
  const storedAt = Number(window.localStorage.getItem(REF_TIME_KEY) || 0);
  if (storedAt && Date.now() - storedAt > ATTRIBUTION_MS) {
    window.localStorage.removeItem(REF_KEY);
    window.localStorage.removeItem(REF_TIME_KEY);
  }
  const activeRef = incomingRef || cleanCode(window.localStorage.getItem(REF_KEY));
  if (!activeRef) {
    window.EMXAffiliate = { activeCode: "", visitorId: getVisitorId(), sessionId: getSessionId(), appendReferralMetadata, track: () => Promise.resolve({ ok: false }) };
    return;
  }

  document.documentElement.dataset.emxReferral = activeRef;
  document.querySelectorAll('a[href*="payhip.com/"]').forEach(link => {
    link.href = appendReferralMetadata(link.href, activeRef, link.dataset.productId || "");
  });

  function track(type, details = {}) {
    return fetch(type === "referral_click" ? "/api/affiliate-track" : "/api/analytics-track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
      body: JSON.stringify({ code: activeRef, visitorId: getVisitorId(), sessionId: getSessionId(), type, page: window.location.pathname, referrer: document.referrer, campaign: new URLSearchParams(window.location.search).get("campaign") || "", device: deviceCategory(), ...details })
    }).catch(() => ({ ok: false }));
  }

  if (incomingRef) {
    track("referral_click");
  }

  document.addEventListener("click", event => {
    const checkout = event.target.closest('a[href*="payhip.com/"]');
    if (checkout) track("checkout_open", { productId: checkout.dataset.productId || "paid-product" });
  });

  window.EMXAffiliate = {
    activeCode: activeRef,
    appendReferralMetadata,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    track
  };

  window.localStorage.removeItem("emx_active_affiliate_ref_v1");
  window.localStorage.removeItem("emx_active_affiliate_creator_v1");
  window.localStorage.removeItem("emx_affiliate_profile_v1");
})();
