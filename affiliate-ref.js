(() => {
  const REF_KEY = "emx_active_affiliate_ref_v1";
  const CREATOR_KEY = "emx_active_affiliate_creator_v1";
  const query = new URLSearchParams(window.location.search);
  const incomingRef = (query.get("af") || query.get("ref") || query.get("affiliate") || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  const incomingCreator = (query.get("creator") || query.get("support") || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 48);

  if (incomingRef) window.localStorage.setItem(REF_KEY, incomingRef);
  if (incomingCreator) window.localStorage.setItem(CREATOR_KEY, incomingCreator);

  const activeRef = incomingRef || window.localStorage.getItem(REF_KEY) || "";
  if (!activeRef) return;

  document.querySelectorAll('a[href^="https://payhip.com/"]').forEach(link => {
    const checkout = new URL(link.href);
    checkout.searchParams.set("af", activeRef);
    link.href = checkout.toString();
  });
})();
