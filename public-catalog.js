(() => {
  "use strict";
  const publicProducts = (items) => (Array.isArray(items) ? items : []).filter(
    (item) => item && typeof item.id === "string" && typeof item.title === "string" &&
      item.visible !== false && item.retired !== true &&
      !["draft", "archived", "coming-soon"].includes(item.publishStatus),
  );
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };
  async function load() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch("/api/products", { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Catalog unavailable");
      const items = await response.json();
      if (!Array.isArray(items)) throw new Error("Invalid catalog");
      return { products: publicProducts(items), fallback: false };
    } catch {
      return { products: publicProducts(window.EMX_PRODUCTS), fallback: true };
    } finally { clearTimeout(timer); }
  }
  const value = (text) => typeof text === "string" && text.trim() ? text : "Not listed";
  const list = (items) => Array.isArray(items) ? items.filter((item) => typeof item === "string" && item.trim()) : [];
  const price = (item) => Number.isFinite(Number(item.price)) && item.price !== "" && item.price != null
    ? Number(item.price) === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(item.price))
    : "See product";
  window.EMXPublicCatalog = { publicProducts, safeUrl, load, value, list, price };
})();
