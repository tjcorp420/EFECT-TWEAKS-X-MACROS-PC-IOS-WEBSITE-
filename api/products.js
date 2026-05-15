const PRODUCTS_KEY = "emx_products";

const STARTER_PRODUCTS = [
  {
    id: "optimizer",
    key: "KQLzN",
    productUrl: "https://payhip.com/b/KQLzN",
    title: "Efect Zero Delay Optimizer",
    eyebrow: "Optimization Pack",
    price: 25.0,
    oldPrice: 50.0,
    image: "./app-screenshots/optimizer-01-dashboard.png",
    gallery: [
      "./app-screenshots/optimizer-01-dashboard.png",
      "./app-screenshots/optimizer-02-benchmark.png",
      "./app-screenshots/optimizer-03-appearance.png",
      "./app-screenshots/optimizer-04-emx-link.png",
      "./app-screenshots/optimizer-05-net-route.png",
      "./app-screenshots/optimizer-06-tweaks-fortnite.png",
      "./app-screenshots/optimizer-07-gpu-tweaks.png",
      "./app-screenshots/optimizer-08-advanced.png",
      "./app-screenshots/optimizer-09-network-opt.png",
      "./app-screenshots/optimizer-10-system-disk.png",
      "./app-screenshots/optimizer-11-services.png",
      "./zero-delay-optimizer.png"
    ],
    previewType: "image",
    previewSrc: "./app-screenshots/optimizer-01-dashboard.png",
    fallbackPreview: "./zero-delay-optimizer.png",
    description:
      "Windows optimization pack focused on reducing background load, cleaning startup behavior, tightening process priority, and applying performance presets for a smoother low-latency desktop and gaming setup.",
    features: [
      "Startup and background load cleanup",
      "Process priority and service presets",
      "Network and responsiveness tuning",
      "Step-by-step performance setup"
    ],
    visible: true
  },
  {
    id: "macro",
    key: "0TOjr",
    productUrl: "https://payhip.com/b/0TOjr",
    title: "Efect Pro Keyboard Macro",
    eyebrow: "Control Pack",
    price: 15.0,
    oldPrice: 30.0,
    image: "./app-screenshots/emx-tweaks-full-03-macros.png",
    gallery: [
      "./app-screenshots/emx-tweaks-full-03-macros.png",
      "./app-screenshots/emx-tweaks-full-04-keybinds.png",
      "./app-screenshots/emx-tweaks-full-05-crosshair.png",
      "./app-screenshots/emx-tweaks-full-01-dashboard.png",
      "./app-screenshots/emx-tweaks-full-02-emx-link.png",
      "./app-screenshots/emx-tweaks-full-06-settings.png",
      "./keyboard-macro.png"
    ],
    previewType: "image",
    previewSrc: "./app-screenshots/emx-tweaks-full-03-macros.png",
    fallbackPreview: "./keyboard-macro.png",
    description:
      "EFECT keyboard profile interface built for saved binds, clean toggle controls, delay adjustment, and fast profile switching. Designed for simple setup, organized controls, and a polished EMX dashboard feel.",
    features: [
      "Saved keybind profile system",
      "Toggle-based macro controls",
      "Adjustable delay settings",
      "Clean EFECT dashboard interface"
    ],
    visible: true
  },
  {
    id: "fps",
    key: "EQIrd",
    productUrl: "https://payhip.com/b/EQIrd",
    title: "FPS Booster",
    eyebrow: "Performance Pack",
    price: 10.99,
    oldPrice: 21.98,
    image: "./app-screenshots/fps-booster-01-boost.png",
    gallery: [
      "./app-screenshots/fps-booster-01-boost.png",
      "./app-screenshots/fps-booster-02-system.png",
      "./app-screenshots/fps-booster-03-network.png",
      "./app-screenshots/fps-booster-04-profiles.png",
      "./app-screenshots/fps-booster-05-logs.png",
      "./app-screenshots/fps-booster-06-settings.png",
      "./fps-booster-emx.png"
    ],
    previewType: "image",
    previewSrc: "./app-screenshots/fps-booster-01-boost.png",
    fallbackPreview: "./fps-booster-emx.png",
    description:
      "Performance booster pack made for smoother gameplay feel through game profile tuning, background app reduction, display-priority settings, and lightweight optimization presets.",
    features: [
      "Game-focused performance presets",
      "Background app reduction guide",
      "Display and smoothness tuning",
      "Lightweight setup workflow"
    ],
    visible: true
  },
  {
    id: "bundle",
    key: "bundle",
    productUrl: "https://payhip.com/buy?link=Bundle",
    title: "EMX Ultimate Tweak Pack",
    eyebrow: "Best Value Bundle",
    price: 59.99,
    oldPrice: 109.99,
    image: "./emx-ultimate-bundle.png",
    gallery: [
      "./emx-ultimate-bundle.png",
      "./app-screenshots/optimizer-01-dashboard.png",
      "./app-screenshots/emx-tweaks-full-03-macros.png",
      "./app-screenshots/fps-booster-01-boost.png"
    ],
    previewType: "image",
    previewSrc: "./emx-ultimate-bundle.png",
    fallbackPreview: "./emx-ultimate-bundle.png",
    description:
      "Built for buyers who want the full EMX setup in one pack. Includes the Zero Delay Optimizer, FPS Booster, and keyboard macro dashboard in one checkout flow.",
    features: [
      "Zero Delay Optimizer",
      "FPS Booster",
      "Keyboard Macro dashboard",
      "One EMX bundle checkout"
    ],
    visible: true
  }
];

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function getEnv() {
  return {
    url:
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_REST_API_URL,

    token:
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN,

    adminPassword: process.env.ADMIN_PASSWORD
  };
}

async function upstashCommand(command) {
  const { url, token } = getEnv();

  if (!url || !token) {
    throw new Error("Missing Upstash environment variables.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Upstash request failed.");
  }

  return data.result;
}

async function loadProducts() {
  const saved = await upstashCommand(["GET", PRODUCTS_KEY]);

  if (!saved) {
    await upstashCommand(["SET", PRODUCTS_KEY, JSON.stringify(STARTER_PRODUCTS)]);
    return STARTER_PRODUCTS;
  }

  return JSON.parse(saved);
}

async function saveProducts(products) {
  await upstashCommand(["SET", PRODUCTS_KEY, JSON.stringify(products)]);
  return products;
}

function getPasswordFromRequest(req) {
  return req.headers["x-admin-password"] || "";
}

function cleanProduct(product) {
  return {
    id: String(product.id || crypto.randomUUID()),
    key: String(product.key || ""),
    productUrl: String(product.productUrl || ""),
    title: String(product.title || "Untitled Product"),
    eyebrow: String(product.eyebrow || "EMX Product"),
    price: Number(product.price || 0),
    oldPrice: Number(product.oldPrice || 0),
    image: String(product.image || ""),
  gallery: Array.isArray(product.gallery) ?
  product.gallery.map((item) => String(item)).filter(Boolean) :
  [],
  previewType: String(product.previewType || "image"),
    previewSrc: String(product.previewSrc || product.image || ""),
    fallbackPreview: String(product.fallbackPreview || ""),
    description: String(product.description || ""),
    features: Array.isArray(product.features)
      ? product.features.map((item) => String(item)).filter(Boolean)
      : [],
    visible: product.visible !== false
  };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const products = await loadProducts();
      return sendJson(res, 200, products);
    }

    if (req.method === "POST") {
      const { adminPassword } = getEnv();
      const sentPassword = getPasswordFromRequest(req);

      if (!adminPassword || sentPassword !== adminPassword) {
        return sendJson(res, 401, {
          ok: false,
          error: "Unauthorized. Wrong or missing admin password."
        });
      }

      const body = req.body || {};
      const incomingProducts = Array.isArray(body.products) ? body.products : null;

      if (!incomingProducts) {
        return sendJson(res, 400, {
          ok: false,
          error: "Missing products array."
        });
      }

      const cleaned = incomingProducts.map(cleanProduct);
      await saveProducts(cleaned);

      return sendJson(res, 200, {
        ok: true,
        products: cleaned
      });
    }

    return sendJson(res, 405, {
      ok: false,
      error: "Method not allowed."
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error.message || "Server error."
    });
  }
};
