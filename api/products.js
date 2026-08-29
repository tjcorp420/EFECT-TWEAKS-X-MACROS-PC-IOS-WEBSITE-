const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { requireAdmin } = require("./_lib/admin-auth");

const PRODUCTS_KEY = "emx:products:v1";
const CHECKOUT_BASE = "https://payhip.com/buy";
const DEFAULT_BUNDLE_ITEMS = {
  os_macro_bundle: ["custom_os", "macro"],
  bundle: ["windows_tweak_dashboard", "macro", "fps"]
};
const RETIRED_PRODUCT_IDS = new Set(["macro", "controller_macro", "bundle"]);

function sendJson(res, response, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(response));
}

function assertKvConfigured() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error("Vercel KV is not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.");
  }
}

async function kvGet(key) {
  assertKvConfigured();

  const response = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
    headers: {
      authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Product database read failed.");
  }

  const raw = await response.text();
  let payload = null;

  try {
    payload = JSON.parse(raw);
  } catch (error) {
    return null;
  }

  if (!payload || payload.error || payload.result == null) return null;
  if (typeof payload.result !== "string") return payload.result;

  try {
    return JSON.parse(payload.result);
  } catch (error) {
    return null;
  }
}

async function kvSet(key, value) {
  assertKvConfigured();

  const response = await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(value)
  });

  if (!response.ok) {
    throw new Error("Product database write failed.");
  }
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return {};
}

function cleanString(value, limit = 500) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, limit);
}

function cleanId(value, fallback) {
  const id = String(value || fallback || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return id || fallback || `product-${Date.now()}`;
}

function cleanPrice(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.round(number * 100) / 100;
}

function normalizeLines(value, limit = 40) {
  const list = Array.isArray(value)
    ? value
    : String(value || "").split(/\r?\n|,/);

  return list
    .map(item => cleanString(item, 220))
    .filter(Boolean)
    .slice(0, limit);
}

function cleanUrl(value) {
  const url = cleanString(value, 900);
  if (!url) return "";
  if (url.startsWith("./") || url.startsWith("/") || /^https?:\/\//i.test(url)) return url;
  return "";
}

function loadSeedProducts() {
  const productsPath = path.join(process.cwd(), "products.js");
  const source = fs.readFileSync(productsPath, "utf8");
  const sandbox = { window: {} };

  vm.runInNewContext(source, sandbox, {
    filename: "products.js",
    timeout: 1000
  });

  return Array.isArray(sandbox.window.EMX_PRODUCTS) ? sandbox.window.EMX_PRODUCTS : [];
}

function normalizeProduct(product, index) {
  const id = cleanId(product.id, `product-${index + 1}`);
  const key = cleanString(product.key, 120);
  const type = cleanString(product.type, 32) || (id.includes("bundle") ? "bundle" : "product");
  const productUrl = cleanUrl(product.productUrl)
    || (key ? `${CHECKOUT_BASE}?link=${encodeURIComponent(key)}` : "");

  const image = cleanUrl(product.image) || "./emx-logo-v2.png";
  const gallery = normalizeLines(product.gallery, 24).map(cleanUrl).filter(Boolean);
  const previewType = product.previewType === "video" ? "video" : "image";
  const previewSrc = cleanUrl(product.previewSrc) || image;
  const fallbackPreview = cleanUrl(product.fallbackPreview) || image;

  return {
    id,
    key,
    productUrl,
    title: cleanString(product.title, 120) || "Untitled EMX Product",
    eyebrow: cleanString(product.eyebrow, 80) || "EMX Product",
    type,
    page: cleanString(product.page, 40),
    price: cleanPrice(product.price),
    oldPrice: cleanPrice(product.oldPrice),
    image,
    gallery,
    previewType,
    previewSrc,
    fallbackPreview,
    description: cleanString(product.description, 900),
    features: normalizeLines(product.features, 18),
    tags: normalizeLines(product.tags, 20),
    bundleItems: normalizeLines(product.bundleItems, 20).length
      ? normalizeLines(product.bundleItems, 20)
      : (DEFAULT_BUNDLE_ITEMS[id] || []),
    visible: product.visible !== false,
    homepage: product.homepage !== false,
    featured: product.featured === true,
    bestSeller: product.bestSeller === true,
    saleBadge: cleanString(product.saleBadge, 40),
    modalTitle: cleanString(product.modalTitle, 120),
    modalSubtitle: cleanString(product.modalSubtitle, 300),
    ctaLabel: cleanString(product.ctaLabel, 40),
    version: cleanString(product.version, 80),
    lastVerified: cleanString(product.lastVerified, 80),
    platform: cleanString(product.platform, 100),
    purpose: cleanString(product.purpose, 180),
    licenseType: cleanString(product.licenseType, 120),
    controllerSupport: cleanString(product.controllerSupport, 180),
    slug: cleanId(product.slug, id),
    category: cleanString(product.category, 80),
    fullDescription: cleanString(product.fullDescription, 4000),
    deliveryType: ["payhip", "direct", "external", "coming-soon", "none"].includes(product.deliveryType) ? product.deliveryType : (key ? "payhip" : "external"),
    deliveryUrl: cleanUrl(product.deliveryUrl || product.downloadUrl),
    deliveryFileName: cleanString(product.deliveryFileName, 160),
    documentationUrl: cleanUrl(product.documentationUrl),
    supportUrl: cleanUrl(product.supportUrl),
    installation: normalizeLines(product.installation, 20),
    changelog: normalizeLines(product.changelog, 30),
    publishStatus: ["published", "draft", "archived", "coming-soon"].includes(product.publishStatus) ? product.publishStatus : (product.visible === false ? "draft" : "published"),
    sortPriority: Math.max(0, Math.round(Number(product.sortPriority || index + 1))),
    showInIntro: product.showInIntro !== false,
    introOrder: Math.max(0, Math.round(Number(product.introOrder || index + 1))),
    requirements: normalizeLines(product.requirements, 12),
    recovery: normalizeLines(product.recovery, 12),
    limitations: normalizeLines(product.limitations, 12),
    updatedAt: cleanString(product.updatedAt, 40) || new Date().toISOString()
  };
}

async function loadProducts() {
  let products = null;
  const seedProducts = loadSeedProducts();

  try {
    products = await kvGet(PRODUCTS_KEY);
  } catch (error) {
    products = null;
  }

  if (!Array.isArray(products) || products.length === 0) {
    products = seedProducts;
  } else {
    const productIds = new Set(products.map(product => cleanId(product.id, "")));
    const missingSeedProducts = seedProducts.filter(product => !productIds.has(cleanId(product.id, "")));
    products = [...products, ...missingSeedProducts];
  }

  const seedById = new Map(seedProducts.map(product => [cleanId(product.id, ""), product]));
  products = products.map(product => {
    const id = cleanId(product.id, "");
    const seed = seedById.get(id);
    if (!seed) return product;
    return {
      ...seed,
      ...product,
      ...( ["volt", "os_macro_bundle"].includes(id) ? {
        image: seed.image,
        gallery: seed.gallery,
        previewSrc: seed.previewSrc,
        fallbackPreview: seed.fallbackPreview
      } : {}),
      version: product.version || seed.version,
      lastVerified: product.lastVerified || seed.lastVerified,
      platform: product.platform || seed.platform,
      purpose: product.purpose || seed.purpose,
      licenseType: product.licenseType || seed.licenseType,
      controllerSupport: product.controllerSupport || seed.controllerSupport,
      requirements: product.requirements?.length ? product.requirements : seed.requirements,
      recovery: product.recovery?.length ? product.recovery : seed.recovery,
      limitations: product.limitations?.length ? product.limitations : seed.limitations
    };
  });

  return products
    .map(normalizeProduct)
    .filter(product => !RETIRED_PRODUCT_IDS.has(product.id));
}

async function saveProducts(products) {
  if (!Array.isArray(products)) {
    throw new Error("Products must be an array.");
  }

  const normalized = products
    .slice(0, 80)
    .map((product, index) => normalizeProduct(product || {}, index))
    .filter(product => !RETIRED_PRODUCT_IDS.has(product.id));

  const seen = new Set();
  for (const product of normalized) {
    if (seen.has(product.id)) {
      throw new Error(`Duplicate product ID: ${product.id}`);
    }
    seen.add(product.id);
    if (product.deliveryType === "direct" && product.price > 0) {
      throw new Error(`Paid product ${product.id} must use an entitlement-protected checkout. Public direct delivery is limited to free products.`);
    }
  }

  await kvSet(PRODUCTS_KEY, normalized);
  return normalized;
}

async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, { ok: true });
    }

    if (req.method === "GET") {
      return sendJson(res, await loadProducts());
    }

    if (req.method !== "POST") {
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }

    if (!requireAdmin(req)) {
      return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
    }

    const body = readBody(req);
    const products = await saveProducts(body.products);

    return sendJson(res, {
      ok: true,
      products
    });
  } catch (error) {
    return sendJson(res, {
      ok: false,
      error: error instanceof Error ? error.message : "Products API failed."
    }, 500);
  }
}

module.exports = handler;
module.exports.loadProducts = loadProducts;
