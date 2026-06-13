function removeInstantBlackout() {
  sessionStorage.removeItem("emxRouteSwap");
  document.documentElement.classList.remove("emx-route-arrive");
  document.documentElement.classList.add("emx-ready");
  document.documentElement.classList.remove("emx-preboot");
  
  const blackout = document.getElementById("instantBlackout");
  
  if (blackout) {
    setTimeout(() => {
      blackout.remove();
    }, 320);
  }
}

function forceClearIntroOverlays(options = {}) {
  const keepBooting = options.keepBooting === true;

  document.documentElement.classList.add("emx-ready");
  document.documentElement.classList.remove("emx-preboot");
  document.body?.classList.add("app-ready");

  if (!keepBooting) {
    document.body?.classList.remove("booting", "no-scroll");
  }

  ["instantBlackout", "boot-screen", "emxLaunchOverlay"].forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;

    element.classList.add("exit");
    element.classList.remove("show", "cinematic-launch");
    element.style.opacity = "0";
    element.style.visibility = "hidden";
    element.style.pointerEvents = "none";

    if (id === "instantBlackout") {
      element.remove();
    }
  });
}

function scheduleIntroFailOpen() {
  setTimeout(() => {
    if (!document.body?.classList.contains("app-ready")) {
      forceClearIntroOverlays();
    }
  }, 3600);
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(removeInstantBlackout, 450);
  scheduleIntroFailOpen();
});

window.addEventListener("load", () => {
  setTimeout(removeInstantBlackout, 450);
  setTimeout(() => forceClearIntroOverlays({ keepBooting: document.body?.classList.contains("booting") }), 5200);
});

setTimeout(removeInstantBlackout, 1400);
setTimeout(forceClearIntroOverlays, 6500);

window.addEventListener("pageshow", () => {
  setTimeout(forceClearIntroOverlays, 1800);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    setTimeout(forceClearIntroOverlays, 900);
  }
});

document.addEventListener("DOMContentLoaded", () => {
      let PRODUCTS = normalizeProductCatalog(window.EMX_PRODUCTS || []);
      const DISCORD_INVITE_URL = "https://discord.gg/puaZFNfNKW";
      const LICENSE_CLAIM_URL = "./license.html";

      function normalizeProductCatalog(products) {
        return (Array.isArray(products) ? products : [])
          .filter(product => product?.id !== "optimizer" && product?.key !== "KQLzN")
          .map(product => {
            if(product?.id !== "bundle") return product;

            const bundleItems = (Array.isArray(product.bundleItems) && product.bundleItems.length
              ? product.bundleItems
              : ["windows_tweak_dashboard", "macro", "fps"])
              .map(item => item === "optimizer" || item === "KQLzN" ? "windows_tweak_dashboard" : item);

            const gallery = (Array.isArray(product.gallery) && product.gallery.length
              ? product.gallery
              : [
                "./app-screenshots/emx-windows-tweak-dashboard-01-overview.png",
                "./macro.png",
                "./fps.png"
              ])
              .map(src => String(src || "").includes("optimizer")
                ? "./app-screenshots/emx-windows-tweak-dashboard-01-overview.png"
                : src);

            return {
              ...product,
              bundleItems,
              gallery,
              description: String(product.description || "")
                .replace(/the optimizer/gi, "the Windows Tweak Dashboard")
                .replace(/optimizer/gi, "Windows Tweak Dashboard"),
              features: Array.isArray(product.features)
                ? product.features.map(feature => String(feature || "")
                    .replace(/Zero Delay Optimizer for cleanup, presets, and system responsiveness/gi, "EMX Windows Tweak Dashboard for safe reversible tuning, profiles, backups, and restore tools")
                    .replace(/optimizer/gi, "Windows Tweak Dashboard"))
                : product.features
            };
          });
      }
      
      async function loadProductsFromApi() {
    try{
      const response = await fetch("/api/products", {
        cache: "no-store"
      });

      if(!response.ok){
        throw new Error("Failed to load live products.");
      }

      const liveProducts = await response.json();

      if(Array.isArray(liveProducts) && liveProducts.length > 0){
        const localProducts = window.EMX_PRODUCTS || [];
        const liveById = new Map(liveProducts.map(product => [product.id, product]));
        const mergedProducts = [];

        localProducts.forEach(localProduct => {
          const liveProduct = liveById.get(localProduct.id);

          if(!liveProduct){
            mergedProducts.push(localProduct);
            return;
          }

          mergedProducts.push({
            ...localProduct,
            ...liveProduct,
            image: liveProduct.image || localProduct.image,
            gallery: Array.isArray(liveProduct.gallery) && liveProduct.gallery.length ? liveProduct.gallery : localProduct.gallery,
            previewType: liveProduct.previewType || localProduct.previewType,
            previewSrc: liveProduct.previewSrc || localProduct.previewSrc,
            fallbackPreview: liveProduct.fallbackPreview || localProduct.fallbackPreview
          });

          liveById.delete(localProduct.id);
        });

        PRODUCTS = normalizeProductCatalog(mergedProducts.concat([...liveById.values()]));
      }
    }catch(error){
      console.warn("Using local products.js fallback:", error);
    }
  }

  const PRODUCT_DETAILS = {
    custom_os: {
      includes: [
        "EMX Custom OS installer package",
        "README-FIRST and SHA256 checksum files",
        "Smart, Safe, Balanced, and Extreme profile controls",
        "EMX branding, wallpaper, launcher, restore, logs, and support export tools"
      ],
      setup: [
        "Purchase through secure Payhip checkout",
        "Claim your EMX license with the same Payhip email and transaction ID from your receipt",
        "Download and unzip the EMX Custom OS package from Payhip delivery",
        "Run EMX-Installer.exe as Administrator",
        "Start with Smart profile, apply, restart when ready, then test games, Discord, OBS, audio, controller, Windows Security, and Windows Update"
      ],
      compatibility: [
        "Windows 11 23H2 or 24H2 recommended",
        "Designed for broad Intel, AMD, NVIDIA, and Radeon gaming PCs",
        "Keeps Defender, Windows Update, audio, Bluetooth, networking, printer, and Xbox/controller compatibility paths",
        "Does not edit game files, inject DLLs, spoof HWIDs, install kernel drivers, or bypass anti-cheat"
      ]
    },
    macro: {
      includes: [
        "EFECT keyboard profile dashboard",
        "Saved bind layout and profile controls",
        "Toggle-based interface controls",
        "Delay adjustment and clean UI flow"
      ],
      setup: [
        "Purchase through Payhip",
        "Claim or recover your EMX license with your Payhip receipt details",
        "Download the product package",
        "Open the dashboard, sign in, and configure binds",
        "Save profiles and test settings carefully"
      ],
      compatibility: [
        "Keyboard profile workflow",
        "Windows desktop setup",
        "User is responsible for game and platform rules",
        "Support available for access and setup questions"
      ]
    },
    controller_macro: {
      includes: [
        "EMX Elite Controller Macro portable Windows EXE",
        "Native controller dashboard with Double Edit preset",
        "Real macro dashboard preview assets",
        "Customer README and setup notes"
      ],
      setup: [
        "Purchase through Payhip and keep your receipt",
        "Download the EMX Elite Controller Macro package from Payhip",
        "Open the portable EXE on Windows",
        "Connect your controller, bind your macro trigger, and test in Creative first",
        "Tune speed/catch controls to match your controller and in-game binds"
      ],
      compatibility: [
        "Windows 10 and Windows 11",
        "Built for native controller input without DS4Windows",
        "Tested path for Hex-style Sony HID and SCUF-style controllers",
        "Use responsibly and follow game, platform, and tournament rules"
      ]
    },
    volt: {
      includes: [
        "EMX VOLT MACRO Windows setup installer",
        "Rust-powered Tauri desktop app with premium EMX glass UI",
        "Saved binds, timing controls, tray controls, and emergency stop",
        "Payhip receipt license key with lifetime single-PC access"
      ],
      setup: [
        "Purchase through secure Payhip checkout",
        "Download and run the EMX VOLT setup file",
        "Paste the Payhip receipt license key into the EMX VOLT Access screen",
        "First successful unlock binds the key to that PC"
      ],
      compatibility: [
        "Windows desktop app",
        "One license key is intended for one user and one PC",
        "Keep your Payhip receipt and license key private",
        "Use responsibly and follow platform rules"
      ]
    },
    windows_tweak_dashboard: {
      includes: [
        "EMX Windows Tweak Dashboard setup installer",
        "Start Here guide, Fortnite settings cheat sheet, wallpapers, and support links",
        "Low-latency, power, timer, startup, network, profile, backup, and log tabs",
        "Payhip license activation for one PC"
      ],
      setup: [
        "Purchase through secure Payhip checkout",
        "Download and unzip the EMX Windows Tweak Dashboard package",
        "Run EMX-Windows-Tweak-Dashboard-Setup-0.3.0.exe",
        "Open EMX from the desktop and activate with your license key",
        "Start with the Profiles tab and apply Fortnite Safe Starter before testing more advanced tools"
      ],
      compatibility: [
        "Windows desktop gaming PCs",
        "Creates backups before changes and includes restore tools",
        "Does not modify game files, bypass anti-cheat, or guarantee specific FPS or ping results",
        "Results vary by hardware, drivers, Windows state, network, and game settings"
      ]
    },
    fps: {
      includes: [
        "Game-focused performance preset guidance",
        "Background app reduction workflow",
        "Display and smoothness tuning checklist",
        "Lightweight setup process"
      ],
      setup: [
        "Purchase through Payhip and keep the receipt transaction ID",
        "Claim or recover your EMX license from the License Claim page",
        "Close unnecessary background apps",
        "Apply performance-focused settings",
        "Restart, test, and adjust per system"
      ],
      compatibility: [
        "Windows gaming systems",
        "Works best with updated drivers",
        "No fixed FPS number guaranteed",
        "Results vary by PC and game configuration"
      ]
    },
    os_macro_bundle: {
      includes: [
        "EMX Custom OS installer package",
        "Smart OS profile controls, updater, restore tools, logs, and support export",
        "EMX Premium KBM Macro dashboard",
        "Saved bind profiles, toggles, and delay controls"
      ],
      setup: [
        "Purchase through the dedicated bundle checkout",
        "Claim one shared EMX license with the Payhip email and transaction ID from your receipt",
        "Download both product packages from Payhip delivery",
        "Install EMX Custom OS first, then restart when ready",
        "Open the macro dashboard, sign in with the same EMX license, and configure binds"
      ],
      compatibility: [
        "Windows 11 gaming PCs for the OS package",
        "Windows desktop setup for the KBM macro dashboard",
        "One shared EMX license can unlock both products after purchase",
        "Use responsibly and follow platform rules"
      ]
    },
    bundle: {
      includes: [
        "EMX Windows Tweak Dashboard access",
        "FPS Booster access",
        "Keyboard Macro dashboard access",
        "Priority setup support path"
      ],
      setup: [
        "Press bundle checkout",
        "Complete secure Payhip cart checkout",
        "Claim or recover your EMX license with the same Payhip email and transaction ID from your receipt",
        "Follow Payhip delivery instructions for each item",
        "Contact EFECT Discord support for help"
      ],
      compatibility: [
        "Windows gaming systems",
        "Digital product bundle",
        "Results vary by PC and setup",
        "Use responsibly and follow platform rules"
      ]
    }
  };

  const LEGAL_PAGES = {
    privacy: {
      title: "Privacy Policy",
      html: `
        <h3>1. Information We Collect</h3>
        <p>EFECT does not directly process card payments on this page. Purchases are handled through Payhip checkout. This storefront may store your selected cart items locally in your browser so the cart can stay saved while you browse.</p>

        <h3>2. Payment Information</h3>
        <p>Payment details, billing information, and checkout security are handled by Payhip and its payment partners. EFECT does not receive or store your full payment card information from this website.</p>

        <h3>3. Local Browser Storage</h3>
        <p>This site uses localStorage to remember cart selections. You can clear this data by clearing your browser site data or using the Clear Cart button.</p>

        <h3>4. External Links</h3>
        <p>This site links to Payhip, TikTok, and Discord-related support. Once you leave this website, those platforms operate under their own privacy policies and terms.</p>

        <h3>5. Support</h3>
        <p>For support, use the EMX Discord server linked on this storefront. Do not send private payment card information through Discord messages.</p>
      `
    },
    faq: {
      title: "FAQ",
      html: `
        <div class="faq-item">
          <h3>How do I receive my product?</h3>
          <p>After purchasing through Payhip, open the EMX License Claim page and enter the same Payhip email plus the transaction ID from your receipt. Payhip still handles downloads and order files, while EMX handles the license key lookup.</p>
        </div>

        <div class="faq-item">
          <h3>Are purchases instant?</h3>
          <p>Checkout is direct through Payhip. Once Payhip confirms the order, the EMX claim page can show the license connected to that receipt. If it does not appear right away, wait a minute and try again or message Discord support.</p>
        </div>

        <div class="faq-item">
          <h3>How does automatic key delivery work?</h3>
          <p>After Payhip confirms the order, EMX connects the buyer email and Payhip transaction ID to a license key. Buyers open the EMX License Claim page, enter the same checkout email plus the order ID from the Payhip receipt, then save the key shown on screen.</p>
        </div>

        <div class="faq-item">
          <h3>Where is the Payhip transaction ID?</h3>
          <p>Payhip shows it in the receipt email and order details. It can be called Order ID, Transaction ID, or purchase ID depending on the Payhip view.</p>
        </div>

        <div class="faq-item">
          <h3>What if the key says not found?</h3>
          <p>Use the exact same email used at checkout, copy the order ID from the receipt, wait around 60 seconds, and try again. If it still does not show, join Discord support with the Payhip email, order ID, and product name.</p>
        </div>

        <div class="faq-item">
          <h3>What does the Windows Tweak Dashboard do?</h3>
          <p>The Windows Tweak Dashboard focuses on safe reversible tuning, low-latency settings, startup cleanup, game session preparation, FPS reporting, network checks, guided profiles, backups, and restore tools.</p>
        </div>

        <div class="faq-item">
          <h3>What does the FPS Booster do?</h3>
          <p>The FPS Booster is focused on smoother gameplay setup through game profile tuning, reduced background usage, display-related adjustments, and performance preset guidance.</p>
        </div>

        <div class="faq-item">
          <h3>What does the macro product include?</h3>
          <p>The macro product focuses on keyboard profile controls, saved binds, toggle controls, delay settings, and a clean EFECT dashboard interface.</p>
        </div>

        <div class="faq-item">
          <h3>Do I need to follow game or platform rules?</h3>
          <p>Yes. You are responsible for using all tools only where allowed and for following the rules of any game, platform, tournament, or service you use.</p>
        </div>

        <div class="faq-item">
          <h3>Are refunds available?</h3>
          <p>Digital products are generally final once delivered or accessed. Contact support if you have a delivery problem or purchased the wrong item.</p>
        </div>
      `
    },
    keys: {
      title: "Product Keys & Access",
      html: `
        <h3>1. Digital Access</h3>
        <p>Payhip handles checkout, receipts, and product delivery. EMX license keys are claimed or recovered on the EMX License Claim page using the same Payhip email and transaction ID from the receipt.</p>

        <h3>2. Keep Access Private</h3>
        <p>Do not share, resell, leak, or repost any download links, private files, access keys, or setup instructions provided after purchase.</p>

        <h3>3. Proof Of Purchase</h3>
        <p>Support may ask for your Payhip email, transaction ID, product name, and screenshots before helping with downloads, missing access, setup issues, or product replacement.</p>

        <h3>4. Lost Access</h3>
        <p>If you lose access, use the License Claim page again with your Payhip receipt details. Never post order details publicly.</p>
      `
    },
    terms: {
      title: "Terms Of Service",
      html: `
        <h3>1. Digital Product Terms</h3>
        <p>All products are digital. Results can vary by hardware, drivers, Windows version, background apps, game settings, and network conditions.</p>

        <h3>2. Responsible Use</h3>
        <p>You are responsible for using EFECT tools only where allowed and for following all game, platform, tournament, and service rules.</p>

        <h3>3. No Result Guarantee</h3>
        <p>EFECT does not guarantee a specific FPS number, ping number, input delay result, rank, earnings, or competitive outcome.</p>

        <h3>4. Support Scope</h3>
        <p>Support covers delivery and reasonable setup help. It does not include account recovery, bypassing platform rules, or modifying third-party services.</p>
      `
    },
    agreement: {
      title: "User Agreement",
      html: `
        <h3>1. Digital Product Terms</h3>
        <p>All EFECT products are digital items. By purchasing, you understand that Payhip handles checkout and delivery while EMX uses your Payhip receipt details to claim or recover your license key.</p>

        <h3>2. Personal Use License</h3>
        <p>Products are provided for your personal use only. You may not resell, leak, redistribute, re-upload, share license keys, or claim EFECT files as your own.</p>

        <h3>3. Platform Compliance</h3>
        <p>You are responsible for following the rules of any game, platform, tournament, or service where you use EFECT products. Do not use any product in a way that violates third-party terms, laws, or platform rules.</p>

        <h3>4. No Guaranteed Results</h3>
        <p>Performance results can vary depending on your PC, Windows settings, hardware, drivers, background apps, internet connection, and game configuration. EFECT does not guarantee a specific FPS number, ping number, or competitive result.</p>

        <h3>5. Support</h3>
        <p>Support is available through the EFECT contact method shown on this storefront. Support may require proof of purchase, screenshots, or basic system details to help troubleshoot delivery or setup issues.</p>

        <h3>6. Refunds and Chargebacks</h3>
        <p>Because these are digital products, purchases are generally final after access or delivery. Fraudulent chargebacks, unauthorized sharing, or abuse of support may result in access removal.</p>

        <h3>7. Acceptance</h3>
        <p>By purchasing or using an EFECT product, you agree to these terms and understand that product access can be revoked if the terms are violated.</p>
      `
    }
  };

  const ACTIVITY_TOASTS = [
    "<strong>Live Store Activity</strong><br>EMX Windows Tweak Dashboard is one of the most viewed packs today.",
    "<strong>Popular Pick</strong><br>FPS Booster is trending with performance-focused setups.",
    "<strong>EMX Notice</strong><br>Keyboard Macro profile pack is getting attention right now.",
    "<strong>Secure Checkout Ready</strong><br>Buy Now and cart checkout are connected to Payhip.",
    "<strong>Auto Keys Live</strong><br>Buyers can claim EMX keys with their Payhip email and order ID.",
    "<strong>Support Reminder</strong><br>Need help after purchase? Contact EFECT through Discord."
  ];

  const CHECKOUT_BASE = "https://payhip.com/buy";
  const SITE_BASE_URL = "https://efect-macros-x-tweaks.vercel.app/";
  const CART_STORAGE_KEY = "efect_cart_v3";
  const INSTALL_POPUP_KEY = "emx_install_popup_seen_v1";
  const AFFILIATE_REF_STORAGE_KEY = "emx_active_affiliate_ref_v1";
  const AFFILIATE_CREATOR_STORAGE_KEY = "emx_active_affiliate_creator_v1";
  const AFFILIATE_PROFILE_STORAGE_KEY = "emx_affiliate_profile_v1";

  const bootAudio = document.getElementById("bootAudio");
  const clickAudio = document.getElementById("clickAudio");

  const EMX_BOOT_VOLUME = 0.14;
  const EMX_CLICK_VOLUME = 0.055;

  if(bootAudio){
    bootAudio.volume = EMX_BOOT_VOLUME;
  }

  if(clickAudio){
    clickAudio.volume = EMX_CLICK_VOLUME;
  }

  const productGrid = document.getElementById("productGrid");
  const cartCount = document.getElementById("cartCount");
  const cartDrawer = document.getElementById("cartDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");

  let cart = loadCart();
  let activityIndex = 0;
  let activityTimer = null;
  let isLaunching = false;
  let analyzerMode = "gaming";
  let currentAnalyzerResult = null;
  let analyzerScanTimer = null;
  let analyzerHasRun = false;

  const ANALYZER_MODES = {
    gaming: {
      label: "Gaming",
      copy: "Lowest practical latency path with Smart profile first, startup trim, GPU checks, and game-session stability.",
      boost: 1.08
    },
    streaming: {
      label: "Gaming + Stream",
      copy: "Keeps OBS, Discord, capture, mic, and audio compatibility while still trimming background load.",
      boost: .92
    },
    safe: {
      label: "Safe Daily",
      copy: "Compatibility-first plan for school, work, controller, Bluetooth, security, updates, and shared PCs.",
      boost: .74
    }
  };

  function applyPerformanceMode(){
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const smallViewport = window.matchMedia?.("(max-width: 430px)")?.matches;
    const lowCoreDevice = Number(navigator.hardwareConcurrency || 8) <= 4;
    const lowMemoryDevice = Number(navigator.deviceMemory || 8) <= 4;
    const liteMode = Boolean(prefersReducedMotion || (smallViewport && (lowCoreDevice || lowMemoryDevice)));

    document.body.classList.toggle("performance-lite", liteMode);
  }

  function money(value){
    return "$" + Number(value || 0).toFixed(2);
  }

  function productCheckoutUrl(key){
    return CHECKOUT_BASE + "?link=" + encodeURIComponent(key);
  }

  function cartCheckoutUrl(){
    const uniqueKeys = [...new Set(cart)];

    if(uniqueKeys.length === 1){
      return productCheckoutUrl(uniqueKeys[0]);
    }

    const query = uniqueKeys
      .map(key => "cart_links[]=" + encodeURIComponent(key))
      .join("&");

    return CHECKOUT_BASE + "?" + query;
  }

  function loadCart(){
    try{
      const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    }catch(error){
      return [];
    }
  }

  function saveCart(){
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  function escapeHtml(value){
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function cleanReferralKey(value) {
    return String(value || "")
      .trim()
      .replace(/^@+/, "")
      .replace(/[^\w.-]/g, "")
      .slice(0, 64);
  }

  function cleanDisplayName(value) {
    return String(value || "")
      .trim()
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 32);
  }

  function creatorSlug(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }

  function referralLinkForKey(key, displayName = "") {
    const cleanKey = cleanReferralKey(key);
    const display = cleanDisplayName(displayName);
    const slug = creatorSlug(display || cleanKey);
    const target = new URL(slug ? "c/" + encodeURIComponent(slug) : "", SITE_BASE_URL);

    target.searchParams.set("af", cleanKey);
    return target.toString();
  }

  function getUrlReferralKey() {
    try {
      const params = new URLSearchParams(window.location.search);
      return cleanReferralKey(params.get("af") || params.get("ref") || params.get("affiliate") || params.get("affiliateKey") || "");
    } catch (error) {
      return "";
    }
  }

  function syncReferralFromUrl() {
    const key = getUrlReferralKey();
    if (!key) return "";

    localStorage.setItem(AFFILIATE_REF_STORAGE_KEY, key);

    const params = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const isCreatorPath = pathParts[0] === "r" || pathParts[0] === "c";
    const creatorFromPath = isCreatorPath ? decodeURIComponent(pathParts[1] || "") : "";
    const creatorName = cleanDisplayName(params.get("creator") || creatorFromPath.replace(/-/g, " "));

    if (creatorName) {
      localStorage.setItem(AFFILIATE_CREATOR_STORAGE_KEY, creatorName);
    }

    return key;
  }

  function getActiveReferralKey() {
    return syncReferralFromUrl() || cleanReferralKey(localStorage.getItem(AFFILIATE_REF_STORAGE_KEY) || "");
  }

  function appendReferralParam(url) {
    const key = getActiveReferralKey();
    if (!key) return url;

    try {
      const target = new URL(url, window.location.href);
      target.searchParams.set("af", key);
      return target.toString();
    } catch (error) {
      return url;
    }
  }

  function getActiveCreatorName() {
    return cleanDisplayName(localStorage.getItem(AFFILIATE_CREATOR_STORAGE_KEY) || "");
  }

  function renderSupportingCreatorBanner() {
    const key = getActiveReferralKey();
    const creatorName = getActiveCreatorName();
    let banner = document.getElementById("supportingCreatorBanner");

    if (document.body.classList.contains("emx-subpage-affiliate") || !key || !creatorName) {
      if (banner) banner.remove();
      return;
    }

    if (!banner) {
      banner = document.createElement("div");
      banner.id = "supportingCreatorBanner";
      banner.className = "supporting-creator-banner";
      banner.innerHTML = `
        <span>Supporting Creator</span>
        <strong></strong>
      `;
      document.body.appendChild(banner);
    }

    const nameTarget = banner.querySelector("strong");
    if (nameTarget) nameTarget.textContent = creatorName;
  }

  function renderAutoKeyGuide() {
    if (document.getElementById("autoKeyGuide")) return;
    if (document.body.classList.contains("emx-subpage-license")) return;

    const anchor = document.querySelector(".trust-strip") || document.querySelector(".hero");
    if (!anchor) return;

    const guide = document.createElement("section");
    guide.id = "autoKeyGuide";
    guide.className = "auto-key-guide emx-reveal";
    guide.setAttribute("aria-label", "Automatic EMX license key checkout flow");
    guide.innerHTML = `
      <div class="auto-key-copy">
        <div class="section-kicker">Auto Keys Are Live</div>
        <h2>Buy On Payhip. <span>Claim Your EMX Key.</span></h2>
        <p>After checkout, Payhip sends a receipt. Use the same Payhip email and order ID on the EMX License Claim page to get or recover your key.</p>
      </div>

      <div class="auto-key-flow" aria-label="Automatic key delivery steps">
        <div>
          <strong>01</strong>
          <span>Checkout</span>
          <p>Pay securely through Payhip.</p>
        </div>
        <div>
          <strong>02</strong>
          <span>Receipt</span>
          <p>Keep the Payhip order ID.</p>
        </div>
        <div>
          <strong>03</strong>
          <span>Claim</span>
          <p>Enter email and order ID.</p>
        </div>
        <div>
          <strong>04</strong>
          <span>Install</span>
          <p>Save your key and setup files.</p>
        </div>
      </div>

      <div class="auto-key-actions">
        <a class="btn-filled play-click" href="${LICENSE_CLAIM_URL}">Claim Key</a>
        <a class="btn-outline play-click" href="${DISCORD_INVITE_URL}" target="_blank" rel="noopener">Discord Help</a>
      </div>

      <div class="auto-key-note">
        <strong>Need-to-know:</strong>
        use the exact checkout email, copy the Payhip order ID from the receipt, and wait around 60 seconds before retrying if Payhip is still processing.
      </div>
    `;

    anchor.insertAdjacentElement("afterend", guide);
  }

  function setupAffiliateNav() {
    const nav = document.querySelector(".site-nav-tabs");

    if (nav && !nav.querySelector("[data-nav-aim-trainer]")) {
      const link = document.createElement("a");
      link.className = "play-click";
      link.href = "./aim-trainer.html";
      link.dataset.navAimTrainer = "true";
      link.textContent = "Aim Trainer";

      if (document.body.classList.contains("emx-subpage-aim-trainer")) {
        link.setAttribute("aria-current", "page");
      }

      const aboutLink = Array.from(nav.querySelectorAll("a")).find(item => item.textContent.trim().toLowerCase() === "about");
      nav.insertBefore(link, aboutLink || null);
    }

    if (nav && !nav.querySelector("[data-nav-affiliate]")) {
      const link = document.createElement("a");
      link.className = "play-click";
      link.href = "./affiliate.html";
      link.dataset.navAffiliate = "true";
      link.textContent = "Ref Link";

      if (document.body.classList.contains("emx-subpage-affiliate")) {
        link.setAttribute("aria-current", "page");
      }

      const faqLink = Array.from(nav.querySelectorAll("a")).find(item => item.textContent.trim().toLowerCase() === "faq");
      nav.insertBefore(link, faqLink || null);
    }

    if (nav && !nav.querySelector("[data-nav-license]")) {
      const link = document.createElement("a");
      link.className = "play-click";
      link.href = "./license.html";
      link.dataset.navLicense = "true";
      link.textContent = "Claim Key";

      if (document.body.classList.contains("emx-subpage-license")) {
        link.setAttribute("aria-current", "page");
      }

      const faqLink = Array.from(nav.querySelectorAll("a")).find(item => item.textContent.trim().toLowerCase() === "faq");
      nav.insertBefore(link, faqLink || null);
    }
  }

  function setupAffiliateGenerator() {
    const form = document.getElementById("affiliateForm");
    if (!form) return;

    const codeInput = document.getElementById("affiliateCodeInput");
    const emailInput = document.getElementById("affiliateEmailInput");
    const usernameInput = document.getElementById("affiliateUsernameInput");
    const linkOutput = document.getElementById("affiliateLinkOutput");
    const copyBtn = document.getElementById("affiliateCopyBtn");
    const openBtn = document.getElementById("affiliateOpenBtn");
    const status = document.getElementById("affiliateStatus");

    try {
      const saved = JSON.parse(localStorage.getItem(AFFILIATE_PROFILE_STORAGE_KEY) || "{}");
      if (codeInput && saved.affiliateKey) codeInput.value = saved.affiliateKey;
      if (emailInput && saved.email) emailInput.value = saved.email;
      if (usernameInput && saved.displayName) usernameInput.value = saved.displayName;
    } catch (error) {}

    const urlKey = getUrlReferralKey();
    if (urlKey && codeInput) {
      codeInput.value = urlKey;
    }

    function setAffiliateStatus(message, state = "") {
      if (!status) return;

      status.textContent = message;
      status.dataset.state = state;
    }

    function setGeneratedLink(link) {
      if (linkOutput) linkOutput.value = link;
      if (copyBtn) copyBtn.disabled = !link;
      if (openBtn) openBtn.disabled = !link;
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const affiliateKey = cleanReferralKey(codeInput?.value);
      const email = normalizeEmail(emailInput?.value);
      const displayName = cleanDisplayName(usernameInput?.value);

      if (!affiliateKey) {
        setAffiliateStatus("Enter the Payhip affiliate code first.", "error");
        codeInput?.focus();
        return;
      }

      if (!email || !email.includes("@")) {
        setAffiliateStatus("Enter the email used for the Payhip affiliate account.", "error");
        emailInput?.focus();
        return;
      }

      if (displayName.length < 2) {
        setAffiliateStatus("Pick a creator username with at least 2 characters.", "error");
        usernameInput?.focus();
        return;
      }

      setAffiliateStatus("Generating Payhip affiliate link...", "");

      const link = referralLinkForKey(affiliateKey, displayName);

      localStorage.setItem(AFFILIATE_REF_STORAGE_KEY, affiliateKey);
      localStorage.setItem(AFFILIATE_CREATOR_STORAGE_KEY, displayName);
      localStorage.setItem(AFFILIATE_PROFILE_STORAGE_KEY, JSON.stringify({
        affiliateKey,
        email,
        displayName
      }));

      setGeneratedLink(link);
      renderSupportingCreatorBanner();
      setAffiliateStatus("Referral link ready. Payhip will credit valid approved affiliate keys at checkout.", "success");
      showToast("<strong>Referral link generated.</strong><br>Payhip tracks the affiliate key when buyers open checkout.");
    });

    copyBtn?.addEventListener("click", () => {
      const link = linkOutput?.value || "";
      if (!link) return;

      navigator.clipboard.writeText(link)
        .then(() => {
          setAffiliateStatus("Referral link copied.", "success");
          showToast("Referral link copied.");
        })
        .catch(() => {
          linkOutput?.select();
          setAffiliateStatus("Copy failed. Select the link and copy it manually.", "error");
        });
    });

    openBtn?.addEventListener("click", () => {
      const link = linkOutput?.value || "";
      if (!link) return;

      window.open(link, "_blank", "noopener");
    });

    if (codeInput?.value && emailInput?.value && usernameInput?.value) {
      const link = referralLinkForKey(codeInput.value, usernameInput.value);
      setGeneratedLink(link);
    }
  }

  function setupLicenseLookup() {
    const form = document.getElementById("licenseLookupForm");
    if (!form) return;

    const emailInput = document.getElementById("licenseEmailInput");
    const orderInput = document.getElementById("licenseOrderInput");
    const keyOutput = document.getElementById("licenseKeyOutput");
    const copyBtn = document.getElementById("licenseCopyBtn");
    const status = document.getElementById("affiliateStatus");
    const submitBtn = document.getElementById("licenseLookupSubmit");

    function setLicenseStatus(message, state = "") {
      if (!status) return;

      status.textContent = message;
      status.dataset.state = state;
    }

    function setLicenseKey(value = "") {
      if (keyOutput) keyOutput.value = value;
      if (copyBtn) copyBtn.disabled = !value;
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const email = normalizeEmail(emailInput?.value);
      const orderId = String(orderInput?.value || "").trim();

      if (!email || !email.includes("@")) {
        setLicenseStatus("Enter the email used at Payhip checkout.", "error");
        emailInput?.focus();
        return;
      }

      if (orderId.length < 4) {
        setLicenseStatus("Enter the Payhip transaction or order ID from the receipt.", "error");
        orderInput?.focus();
        return;
      }

      setLicenseKey("");
      setLicenseStatus("Checking secure EMX license records...", "");
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch("/api/license-lookup", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            email,
            orderId
          })
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok || !result.license?.licenseKey) {
          throw new Error(result.error || "No license found for that receipt yet.");
        }

        setLicenseKey(result.license.licenseKey);
        setLicenseStatus("License found. Copy this key and use it inside your EMX product login.", "success");
        showToast("<strong>License key found.</strong><br>Copy it before opening the installer.");
      } catch (error) {
        setLicenseStatus(error instanceof Error ? error.message : "License lookup failed. Try again or contact Discord support.", "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    copyBtn?.addEventListener("click", () => {
      const key = keyOutput?.value || "";
      if (!key) return;

      navigator.clipboard.writeText(key)
        .then(() => {
          setLicenseStatus("License key copied.", "success");
          showToast("License key copied.");
        })
        .catch(() => {
          keyOutput?.select();
          setLicenseStatus("Copy failed. Select the key and copy it manually.", "error");
        });
    });
  }

  const preloadedPreviewVideos = new Set();

  function preloadPreviewVideos(){
    const liteMode = document.body.classList.contains("performance-lite");
    const saveData = navigator.connection?.saveData === true;
    const fastConnection = !navigator.connection || /^(4g|wifi)$/i.test(navigator.connection.effectiveType || "4g");

    if(liteMode || saveData || !fastConnection) return;

    const videoUrls = PRODUCTS
      .filter(product => product.visible !== false && product.previewType === "video" && product.previewSrc)
      .map(product => product.previewSrc)
      .slice(0, 1);

    if(!videoUrls.length) return;

    const preload = () => {
      videoUrls.forEach(src => {
        if(preloadedPreviewVideos.has(src)) return;

        preloadedPreviewVideos.add(src);

        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "video";
        link.href = src;
        link.type = "video/mp4";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      });
    };

    if("requestIdleCallback" in window){
      window.requestIdleCallback(preload, { timeout: 1800 });
    }else{
      setTimeout(preload, 900);
    }
  }

  function formatTitle(title){
    return title
      .replace("FPS", '<span class="accent">FPS</span>')
      .replace("Efect", '<span class="accent">Efect</span>')
      .replace("EFECT", '<span class="accent">EFECT</span>');
  }

  function getProductByKey(key){
    return PRODUCTS.find(product => product.key === key);
  }

  function getBundleProduct(){
    return PRODUCTS.find(product => product.id === "bundle")
      || PRODUCTS.find(product => product.type === "bundle" && product.page === "bundle");
  }

  const BUNDLE_INCLUDED_PRODUCT_IDS = {
    os_macro_bundle: ["custom_os", "macro"],
    bundle: ["windows_tweak_dashboard", "macro", "fps"]
  };

  function isBundleProduct(product){
    return Boolean(product && (product.type === "bundle" || BUNDLE_INCLUDED_PRODUCT_IDS[product.id]));
  }

  function getBundleIncludedProductIds(product){
    const configuredItems = Array.isArray(product?.bundleItems) ? product.bundleItems : [];
    const rawItems = configuredItems.length ? configuredItems : (BUNDLE_INCLUDED_PRODUCT_IDS[product?.id] || []);

    return rawItems
      .map(item => {
        const cleanItem = String(item || "").trim();
        const matched = PRODUCTS.find(candidate => candidate.id === cleanItem || candidate.key === cleanItem);
        return matched ? matched.id : cleanItem;
      })
      .filter(Boolean);
  }

  function getCartProducts(){
    return cart
      .map(key => PRODUCTS.find(product => product.key === key))
      .filter(Boolean);
  }

  function cartHasBundleSelection(){
    return getCartProducts().some(isBundleProduct);
  }

  function cartBundleCoversProduct(productId){
    return getCartProducts().some(product => getBundleIncludedProductIds(product).includes(productId));
  }

  function getFullPackProducts(){
    const bundle = getBundleProduct();
    const configuredIds = getBundleIncludedProductIds(bundle);
    const fullPackIds = new Set(configuredIds.length ? configuredIds : ["windows_tweak_dashboard", "macro", "fps"]);
    return PRODUCTS.filter(product => fullPackIds.has(product.id) && product.visible !== false);
  }

  function getBundleOptions(){
    const bundleIds = new Set(["bundle", "os_macro_bundle"]);
    return PRODUCTS.filter(product =>
      (bundleIds.has(product.id) || product.type === "bundle" || product.page === "bundle") &&
      product.visible !== false
    );
  }

  function getStoreProducts(){
    return PRODUCTS.filter(product =>
      product.id !== "bundle" &&
      product.page !== "hidden" &&
      product.visible !== false
    );
  }

  function getHomeProducts(){
    return getStoreProducts().filter(product => product.homepage !== false);
  }

  function renderProducts(){
    if(!productGrid) return;

    const homeProducts = getHomeProducts();

    if(!homeProducts.length){
      productGrid.innerHTML = `
        <div class="cart-empty product-empty-state">
          <div>
            <strong>No homepage products are visible.</strong><br><br>
            Open admin, turn on Show On Homepage for at least one product, then Save Live.
          </div>
        </div>
      `;
      return;
    }

    const productsForPage = document.body.classList.contains("emx-subpage-macros")
      ? homeProducts.filter(product => product.id === "macro" || product.id === "controller_macro" || product.id === "volt")
      : homeProducts;

    const productHeading = document.getElementById("productGrid")?.previousElementSibling?.previousElementSibling;
    if(document.body.classList.contains("emx-subpage-macros") && productHeading?.classList.contains("section-head")){
      const kicker = productHeading.querySelector(".section-kicker");
      const title = productHeading.querySelector(".section-title");
      const copy = productHeading.querySelector(".section-copy");

      if(kicker) kicker.textContent = "KBM Macro Pack";
      if(title) title.innerHTML = "EMX <span>Premium Macros</span>";
      if(copy) copy.textContent = "Go straight to the EMX KBM and Controller Macro lineup with previews, details, checkout, and setup support.";
    }

    productGrid.innerHTML = productsForPage.map(product => {
      const oldPrice = Number(product.oldPrice || 0);
      const price = Number(product.price || 0);
      const discount = oldPrice > price && oldPrice > 0
        ? Math.round((1 - price / oldPrice) * 100)
        : 0;
      const previewLabel = product.previewType === "video" ? "Video Preview" : "Image Preview";
      const premiumBadges = [
        product.featured ? "Featured" : "",
        product.bestSeller ? "Best Seller" : "",
        product.saleBadge ? product.saleBadge : ""
      ].filter(Boolean);

      return `
        <article id="product-${escapeHtml(product.id)}" class="product-card premium-product-card ${product.featured ? "is-featured-product" : ""}" data-product-id="${escapeHtml(product.id)}" data-search="${escapeHtml(`${product.title} ${product.description} ${product.eyebrow} ${premiumBadges.join(" ")} ${(product.tags || []).join(" ")}`.toLowerCase())}">
          <div class="product-premium-rail" aria-hidden="true"></div>
          ${premiumBadges.length ? `
            <div class="product-admin-badges">
              ${premiumBadges.map(badge => `<span>${escapeHtml(badge)}</span>`).join("")}
            </div>
          ` : ""}

          <div class="product-top">
            <div class="product-title-wrap">
              <div class="product-eyebrow">${escapeHtml(product.eyebrow)}</div>
              <h2 class="card-title">${formatTitle(escapeHtml(product.title))}</h2>
            </div>

            <button
              class="card-icon-shell play-click"
              type="button"
              data-action="preview"
              data-key="${escapeHtml(product.key)}"
              data-title="${escapeHtml(product.title)}"
              data-preview-type="${escapeHtml(product.previewType || "image")}"
              data-preview-src="${escapeHtml(product.previewSrc || product.image)}"
              data-fallback-preview="${escapeHtml(product.fallbackPreview || product.image)}"
              aria-label="Preview ${escapeHtml(product.title)}"
            >
              <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="card-icon" loading="lazy" decoding="async">
            </button>
          </div>

          <div class="price-row">
            <span class="current-price">${money(product.price)}</span>
            ${oldPrice > price && oldPrice > 0 ? `<span class="old-price">${money(product.oldPrice)}</span>` : ""}
            <span class="discount-badge">${discount > 0 ? discount + "% OFF" : "DEAL"}</span>
          </div>

          <div class="product-value-row">
            <span>License Claim</span>
            <span>${escapeHtml(previewLabel)}</span>
            <span>EMX Support</span>
          </div>

          <div class="meta-info">
  <span>one-time payment</span>
  <span>•</span>
  <strong>Secure Payhip checkout</strong>
</div>

<div class="product-trust-row">
  <span>🔒 Secure Payhip Checkout</span>
  <span>⚡ Key Claim After Checkout</span>
  <span>🛠 Setup Support</span>
  <span>✅ Verified</span>
</div>

          <p class="description-block">${escapeHtml(product.description)}</p>

          <div class="preview-wrap">
            <button
              class="preview-image-btn play-click"
              type="button"
              data-action="preview"
              data-key="${escapeHtml(product.key)}"
              data-title="${escapeHtml(product.title)}"
              data-preview-type="${escapeHtml(product.previewType || "image")}"
              data-preview-src="${escapeHtml(product.previewSrc || product.image)}"
              data-fallback-preview="${escapeHtml(product.fallbackPreview || product.image)}"
              aria-label="Open preview for ${escapeHtml(product.title)}"
            >
              <img src="${escapeHtml(product.image)}" class="preview-img" alt="${escapeHtml(product.title)} preview" loading="lazy" decoding="async">
            </button>

            <span class="preview-label">Open Preview</span>
            <span class="preview-type-pill">${escapeHtml(previewLabel)}</span>

            <button
              class="preview-share play-click"
              type="button"
              data-action="share-product"
              data-key="${escapeHtml(product.key)}"
              aria-label="Share ${escapeHtml(product.title)}"
            >
              ↗
            </button>
          </div>

          ${Array.isArray(product.gallery) && product.gallery.length ? `
            <div class="product-gallery-row">
              ${product.gallery.map(src => `
                <button
                  class="gallery-thumb-btn play-click"
                  type="button"
                  data-action="preview"
                  data-key="${escapeHtml(product.key)}"
                  data-title="${escapeHtml(product.title)}"
                  data-preview-type="image"
                  data-preview-src="${escapeHtml(src)}"
                  data-fallback-preview="${escapeHtml(product.image)}"
                  aria-label="Preview gallery image for ${escapeHtml(product.title)}"
                >
                  <img src="${escapeHtml(src)}" alt="${escapeHtml(product.title)} gallery image" loading="lazy" decoding="async">
                </button>
              `).join("")}
            </div>
          ` : ""}

          <ul class="feature-checklist">
            ${(Array.isArray(product.features) ? product.features : []).map(feature => `
              <li class="feature-item">
                <span class="check-icon">✓</span>
                <span>${escapeHtml(feature)}</span>
              </li>
            `).join("")}
          </ul>

          <div class="button-group-row">
            <button
              class="btn-outline play-click"
              type="button"
              data-action="detail"
              data-key="${escapeHtml(product.key)}"
            >
              ✦ Details
            </button>

            <button class="btn-outline green play-click" type="button" data-action="add" data-key="${escapeHtml(product.key)}">
              🛒 Add
            </button>
          </div>

          <button class="btn-filled play-click" type="button" data-action="buy" data-key="${escapeHtml(product.key)}">
            Buy Now →
          </button>
        </article>
      `;
    }).join("");

    scrollToProductHash();
  }

  function scrollToProductHash(){
    const productId = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).replace(/^product-/, "");

    if(!productId) return;

    const card = document.getElementById(`product-${productId}`);

    if(!card) return;

    setTimeout(() => {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("product-card-pulse");
      setTimeout(() => card.classList.remove("product-card-pulse"), 1600);
    }, 120);
  }

  function addToCart(key){
    const product = getProductByKey(key);

    if(!product || product.id === "bundle"){
      showToast("Product not found.");
      return;
    }

    if(!isBundleProduct(product) && cartBundleCoversProduct(product.id)){
      showToast("<strong>Already covered.</strong><br>" + escapeHtml(product.title) + " is included in your selected bundle.");
      return;
    }

    if(isBundleProduct(product)){
      const includedIds = new Set(getBundleIncludedProductIds(product));
      cart = cart.filter(itemKey => {
        const item = getProductByKey(itemKey);
        return !item || !includedIds.has(item.id);
      });
    }

    if(!cart.includes(key)){
      cart.push(key);
      saveCart();
      updateCartUI();
      showToast("<strong>Added to cart.</strong><br>" + escapeHtml(product.title) + " is ready for secure checkout.");
    }else{
      showToast("<strong>Already in cart.</strong><br>This product is already selected.");
    }
  }

  function removeFromCart(key){
    cart = cart.filter(item => item !== key);
    saveCart();
    updateCartUI();
  }

  function clearCart(){
    cart = [];
    saveCart();
    updateCartUI();
    showToast("Cart cleared.");
  }

  function setCheckoutLoading(button){
    if(!button) return;

    if(!button.dataset.originalText){
      button.dataset.originalText = button.innerHTML;
    }

    button.classList.add("payhip-loading");
    button.disabled = true;

    button.innerHTML = `
      <span class="payhip-loading-label">SECURE PAYHIP CHECKOUT</span>
      <span class="payhip-loading-bar"><i></i></span>
    `;
  }

  function showPayLoadingScreen(url, button){
    const overlay = document.getElementById("emxPayLoading");
    const status = document.getElementById("emxPayStatus");
    const bar = document.getElementById("emxPayBarFill");
    const stepOne = document.getElementById("payStepOne");
    const stepTwo = document.getElementById("payStepTwo");
    const stepThree = document.getElementById("payStepThree");

    setCheckoutLoading(button);

    if(!overlay){
      setTimeout(() => {
        window.location.href = url;
      }, 650);
      return;
    }

    document.body.classList.add("no-scroll");

    overlay.classList.remove("exit");
    overlay.classList.add("show");

    if(status) status.textContent = "Verifying product selection...";
    if(bar) bar.style.width = "0%";

    [stepOne, stepTwo, stepThree].forEach(step => {
      if(step){
        step.classList.remove("active", "done");
      }
    });

    if(stepOne) stepOne.classList.add("active");

    setTimeout(() => {
      if(status) status.textContent = "Product verified.";
      if(bar) bar.style.width = "34%";

      if(stepOne){
        stepOne.classList.remove("active");
        stepOne.classList.add("done");
      }

      if(stepTwo) stepTwo.classList.add("active");
    }, 360);

    setTimeout(() => {
      if(status) status.textContent = "Connecting to official Payhip checkout...";
      if(bar) bar.style.width = "68%";

      if(stepTwo){
        stepTwo.classList.remove("active");
        stepTwo.classList.add("done");
      }

      if(stepThree) stepThree.classList.add("active");
    }, 820);

    setTimeout(() => {
      if(status) status.textContent = "Opening secure checkout...";
      if(bar) bar.style.width = "100%";

      if(stepThree){
        stepThree.classList.remove("active");
        stepThree.classList.add("done");
      }
    }, 1180);

    setTimeout(() => {
      overlay.classList.add("exit");
      overlay.classList.remove("show");
    }, 1450);

    setTimeout(() => {
      window.location.href = url;
    }, 1650);
  }

  function goToPayhip(url, button) {
  if (window.__emxCheckoutLocked) {
    return;
  }
  
  window.__emxCheckoutLocked = true;
  const checkoutUrl = appendReferralParam(url);
  
  setCheckoutLoading(button);
  
  const payOverlay = document.getElementById("emxPayLoading");
  if (payOverlay) {
    payOverlay.classList.remove("show");
    payOverlay.classList.remove("exit");
  }
  
  document.body.classList.remove("no-scroll");
  
  setTimeout(() => {
    window.location.assign(checkoutUrl);
  }, 220);
}

  function buyNow(key, button) {
  const product = getProductByKey(key);
  
  if (!product || product.id === "bundle") {
    showToast("Product not found.");
    return;
  }
  
  const productKey = product.key || key;
  const directCheckoutUrl = productCheckoutUrl(productKey);
  const productPageUrl = product.productUrl || ("https://payhip.com/b/" + encodeURIComponent(productKey));
  
  const fallbackKey = "emx_checkout_fallback_" + productKey;
  const shouldFallback = sessionStorage.getItem(fallbackKey) === "yes";
  
  if (shouldFallback) {
    sessionStorage.removeItem(fallbackKey);
    goToPayhip(productPageUrl, button);
    return;
  }
  
  sessionStorage.setItem(fallbackKey, "yes");
  goToPayhip(directCheckoutUrl, button);
}

  function buyBundle(button){
    cart = getFullPackProducts().map(product => product.key);
    saveCart();
    updateCartUI();
    goToPayhip(cartCheckoutUrl(), button);
  }

  function checkout(button){
    const validKeys = cart
      .map(key => getStoreProducts().find(product => product.key === key)?.key)
      .filter(Boolean);

    cart = [...new Set(validKeys)];
    saveCart();
    updateCartUI();

    if(cart.length === 0){
      showToast("<strong>Cart is empty.</strong><br>Add a product before opening checkout.");
      return;
    }

    goToPayhip(cartCheckoutUrl(), button);
  }

  function addBundleToCart(){
    if(cartHasBundleSelection()){
      showToast("<strong>Bundle already selected.</strong><br>Your cart already has a bundle checkout ready.");
      return;
    }

    getFullPackProducts().forEach(product => {
      if(!cart.includes(product.key)){
        cart.push(product.key);
      }
    });

    saveCart();
    updateCartUI();
    showToast("<strong>EFECT Ultimate Pack added.</strong><br>All products are ready for secure checkout.");
  }

  function updateCartUI(){
    if(!cartCount || !cartList || !cartTotal) return;

    const items = getCartProducts()
      .filter(product => getStoreProducts().some(storeProduct => storeProduct.key === product.key))
      .filter(Boolean);
    const hasBundleInCart = items.some(isBundleProduct);
    const hasFullPackInCart = getFullPackProducts().every(product => cart.includes(product.key));
    const showBundleUpgrade = items.length > 0 && !hasBundleInCart && !hasFullPackInCart;

    cartCount.textContent = items.length;
    cartCount.classList.toggle("show", items.length > 0);

    if(items.length === 0){
      cartList.innerHTML = `
        <div class="cart-empty">
          <div>
            <strong style="color:white;font-size:20px;">Cart is empty</strong><br><br>
            Add a product, then proceed through Payhip and claim your EMX key from the receipt.
          </div>
        </div>
      `;
    }else{
      cartList.innerHTML = items.map(product => `
        <div class="cart-item">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}">
          <div>
            <h4>${escapeHtml(product.title)}</h4>
            <p>${money(product.price)}</p>
            <span class="cart-item-note">Payhip checkout + EMX key claim</span>
          </div>
          <button class="remove-btn play-click" type="button" data-action="remove" data-key="${escapeHtml(product.key)}">×</button>
        </div>
      `).join("") + `
        <div class="cart-upgrade-note ${showBundleUpgrade ? "" : "is-hidden"}">
          <div>
            <strong>Want the full tweaks pack?</strong>
            <span>Add Windows Tweak Dashboard, FPS Booster, and KBM Macro in one tap.</span>
          </div>
          <button class="play-click" type="button" data-action="cart-bundle">Add Bundle</button>
        </div>
      `;
    }

    const total = items.reduce((sum, product) => sum + Number(product.price || 0), 0);
    cartTotal.textContent = money(total);
  }

  function openCart(){
    if(!cartDrawer || !drawerBackdrop) return;

    cartDrawer.classList.add("show");
    drawerBackdrop.classList.add("show");
    document.body.classList.add("no-scroll");
  }

  function closeCart(){
    if(!cartDrawer || !drawerBackdrop) return;

    cartDrawer.classList.remove("show");
    drawerBackdrop.classList.remove("show");
    unlockBodyIfSafe();
  }

  function openPreview(type, src, title, fallbackPreview){
    const modal = document.getElementById("media-modal");
    const img = document.getElementById("modal-img");
    const video = document.getElementById("modal-video");
    const videoSource = document.getElementById("video-source");
    const modalTitle = document.getElementById("modalTitle");
    const previewTypeLabel = document.getElementById("previewTypeLabel");
    const soundHint = document.getElementById("previewSoundHint");

    if(!modal || !img || !video || !videoSource || !modalTitle) return;

    modalTitle.textContent = title || "Product Preview";
    modal.classList.toggle("video-preview-open", type === "video");
    modal.classList.toggle("image-preview-open", type !== "video");

    if(previewTypeLabel){
      previewTypeLabel.textContent = type === "video" ? "Video Preview" : "Image Preview";
    }

    if(soundHint){
      soundHint.textContent = type === "video" ? "Tap video for sound" : "Swipe gallery preview";
      soundHint.style.display = type === "video" ? "inline-flex" : "none";
    }

    modal.classList.add("show");
    document.body.classList.add("no-scroll");

    img.style.display = "none";
    video.style.display = "none";
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("src");
    videoSource.removeAttribute("src");

    if(type === "video"){
      video.preload = "auto";
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      videoSource.src = src;
      video.load();
      video.style.display = "block";

      video.play().catch(() => {});

      return;
    }

    img.src = src;
    img.style.display = "block";
  }

  function closeModal(){
    const modal = document.getElementById("media-modal");
    const video = document.getElementById("modal-video");

    stopPreviewPhotoReel();

    if(modal) modal.classList.remove("show");

    if(video){
      video.pause();
      video.currentTime = 0;
    }

    unlockBodyIfSafe();
  }

 function openProductDetails(key) {
  const product = getProductByKey(key);
  
  if (!product) {
    showToast("Product not found.");
    return;
  }
  
  const detail = PRODUCT_DETAILS[product.id] || {
    includes: product.features || [],
    setup: [
      "Purchase through secure checkout",
      "Claim your EMX license with your Payhip email and receipt transaction ID",
      "Follow Payhip delivery instructions",
      "Contact support if needed"
    ],
    compatibility: [
      "Digital product",
      "Results vary by system",
      "Use responsibly"
    ]
  };
  
  const modal = document.getElementById("detail-modal");
  if (!modal) return;
  
  const detailEyebrow = document.getElementById("detailEyebrow");
  const detailTitle = document.getElementById("detailTitle");
  const detailDescription = document.getElementById("detailDescription");
  const detailImage = document.getElementById("detailImage");
  const detailIncludes = document.getElementById("detailIncludes");
  const detailSetup = document.getElementById("detailSetup");
  const detailCompat = document.getElementById("detailCompat");
  
  if (detailEyebrow) {
    detailEyebrow.textContent = product.eyebrow || "Product Details";
  }
  
  if (detailTitle) {
    detailTitle.innerHTML = escapeHtml(product.modalTitle || product.title || "")
      .replace("EMX", "<span>EMX</span>")
      .replace("Efect", "<span>Efect</span>")
      .replace("EFECT", "<span>EFECT</span>")
      .replace("FPS", "<span>FPS</span>");
  }
  
  if (detailDescription) {
    detailDescription.textContent = product.modalSubtitle || product.description || "";
  }
  
  if (detailImage) {
    detailImage.src = product.image || "./emx-logo.png";
    detailImage.alt = product.title || "Product image";
    detailImage.loading = "lazy";
    detailImage.decoding = "async";
  }
  
  if (detailIncludes) {
    const includes = Array.isArray(product.bundleItems) && product.bundleItems.length
      ? product.bundleItems.map(item => {
        const matched = PRODUCTS.find(candidate => candidate.id === item || candidate.key === item);
        return matched ? matched.title : item;
      })
      : detail.includes;

    detailIncludes.innerHTML = includes
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }
  
  if (detailSetup) {
    detailSetup.innerHTML = detail.setup
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }
  
  if (detailCompat) {
    detailCompat.innerHTML = detail.compatibility
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }
  
  const detailCard = modal.querySelector(".detail-card");
  
  if (detailCard) {
    const oldUpgrade = document.getElementById("detailCheckoutFlow");
    if (oldUpgrade) {
      oldUpgrade.remove();
    }
    
    const upgradePanel = document.createElement("div");
    upgradePanel.id = "detailCheckoutFlow";
    upgradePanel.className = "detail-checkout-upgrade";
    
    upgradePanel.innerHTML = `
      <div class="detail-trust-badges">
        <span>🔒 Secure Payhip</span>
        <span>📲 License Claim</span>
        <span>🛠 Setup Support</span>
        <span>✅ EFECT Verified</span>
      </div>

      <div class="detail-premium-summary">
        <div>
          <span>Best For</span>
          <strong>${escapeHtml(product.bestSeller ? "Popular EMX buyers" : product.featured ? "Featured setups" : "Focused PC upgrades")}</strong>
        </div>
        <div>
          <span>Access</span>
          <strong>License claim</strong>
        </div>
        <div>
          <span>Support</span>
          <strong>Discord path</strong>
        </div>
      </div>

      <div class="detail-after-checkout">
        <div class="detail-after-head">
          <span>POST CHECKOUT FLOW</span>
          <h3>What Happens After Checkout</h3>
          <p>Buyers pay through Payhip, then use the receipt details to claim or recover the EMX license connected to that order.</p>
        </div>

        <div class="detail-flow-grid">
          <div class="detail-flow-step">
            <strong>01</strong>
            <span>Secure Checkout Opens</span>
            <p>Buy Now sends the buyer through the official Payhip checkout flow.</p>
          </div>

          <div class="detail-flow-step">
            <strong>02</strong>
            <span>Claim EMX Key</span>
            <p>Use the same Payhip email and transaction ID on the EMX License Claim page.</p>
          </div>

          <div class="detail-flow-step">
            <strong>03</strong>
            <span>Save Receipt</span>
            <p>Keep the Payhip receipt because it recovers your key and verifies support requests.</p>
          </div>

          <div class="detail-flow-step">
            <strong>04</strong>
            <span>EFECT Support</span>
            <p>Contact EFECT support through Discord if you need access or setup help.</p>
          </div>
        </div>
      </div>
    `;
    
    const detailActions = detailCard.querySelector(".detail-actions");
    
    if (detailActions) {
      detailActions.insertAdjacentElement("beforebegin", upgradePanel);
    } else {
      detailCard.appendChild(upgradePanel);
    }
  }
  
  const addBtn = document.getElementById("detailAddBtn");
  const buyBtn = document.getElementById("detailBuyBtn");
  
  if (addBtn) addBtn.dataset.key = product.key;
  if (buyBtn) buyBtn.dataset.key = product.key;
  
  modal.classList.add("show");
  document.body.classList.add("no-scroll");
}

  function closeProductDetails(){
    const modal = document.getElementById("detail-modal");
    if(modal) modal.classList.remove("show");
    unlockBodyIfSafe();
  }

  function toggleFaq(button){
    const row = button.closest(".faq-row");
    if(!row) return;
    row.classList.toggle("open");
  }

  function openLegal(pageKey){
    const page = LEGAL_PAGES[pageKey] || LEGAL_PAGES.faq;
    const modal = document.getElementById("legal-modal");
    const title = document.getElementById("legalTitle");
    const content = document.getElementById("legalContent");

    if(!modal || !title || !content) return;

    title.innerHTML = "EFECT <span>" + escapeHtml(page.title) + "</span>";
    content.innerHTML = page.html;

    modal.classList.add("show");
    document.body.classList.add("no-scroll");
  }

  function closeLegal(){
    const modal = document.getElementById("legal-modal");
    if(modal) modal.classList.remove("show");
    unlockBodyIfSafe();
  }

  function openPcAnalyzer(runScan = false){
    const modal = document.getElementById("pc-analyzer-modal");
    if(!modal) return;

    modal.classList.add("show");
    document.body.classList.add("no-scroll");

    if(runScan){
      runPcAnalyzer();
    }
  }

  function closePcAnalyzer(){
    const modal = document.getElementById("pc-analyzer-modal");
    if(modal) modal.classList.remove("show");
    unlockBodyIfSafe();
  }

  function getGpuRenderer(){
    try{
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if(!gl) return "Browser GPU details locked";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if(!debugInfo) return "GPU renderer hidden by browser";

      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "GPU renderer unavailable";
    }catch(error){
      return "GPU renderer unavailable";
    }
  }

  function clampNumber(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function percentText(value){
    return String(Math.round(value)) + "%";
  }

  function getBrowserName(ua){
    if(/edg/i.test(ua)) return "Microsoft Edge";
    if(/opr|opera/i.test(ua)) return "Opera";
    if(/firefox/i.test(ua)) return "Firefox";
    if(/crios|chrome/i.test(ua)) return "Chrome";
    if(/safari/i.test(ua)) return "Safari";
    return "Browser hidden";
  }

  function getOsName(ua, platform){
    const raw = `${ua} ${platform}`.toLowerCase();
    if(/iphone|ipad|ipod/.test(raw)) return "iOS / iPadOS";
    if(/android/.test(raw)) return "Android";
    if(/mac/.test(raw)) return "macOS";
    if(/win/.test(raw)) return "Windows";
    if(/linux|cros/.test(raw)) return "Linux / ChromeOS";
    return "OS hidden";
  }

  function metricScore(value, rules){
    for(const rule of rules){
      if(rule.test(value)) return rule.score;
    }

    return 50;
  }

  function estimateBoostRange(score, lowSpec, hasDiscreteGpu, isWindows, isMobile, mode){
    if(isMobile){
      return {
        fps: "Run on Windows PC",
        edit: "Preview only",
        latency: "Preview only",
        note: "Phone scans are great for previewing the flow, but install estimates should be checked on the Windows PC that will use EMX."
      };
    }

    if(!isWindows){
      return {
        fps: "Windows only",
        edit: "Windows only",
        latency: "Windows only",
        note: "EMX Custom OS is a Windows-focused product. Re-run this analyzer on the target Windows PC for the real install plan."
      };
    }

    let fpsLow = lowSpec ? 7 : score < 76 ? 5 : hasDiscreteGpu ? 3 : 4;
    let fpsHigh = lowSpec ? 18 : score < 76 ? 14 : hasDiscreteGpu ? 9 : 11;
    let editLow = lowSpec ? 6 : 3;
    let editHigh = lowSpec ? 15 : hasDiscreteGpu ? 8 : 11;
    let latencyLow = lowSpec ? 4 : 2;
    let latencyHigh = lowSpec ? 10 : hasDiscreteGpu ? 6 : 8;
    const multiplier = ANALYZER_MODES[mode]?.boost || 1;

    fpsLow = Math.max(1, Math.round(fpsLow * multiplier));
    fpsHigh = Math.max(fpsLow + 2, Math.round(fpsHigh * multiplier));
    editLow = Math.max(1, Math.round(editLow * multiplier));
    editHigh = Math.max(editLow + 2, Math.round(editHigh * multiplier));
    latencyLow = Math.max(1, Math.round(latencyLow * multiplier));
    latencyHigh = Math.max(latencyLow + 2, Math.round(latencyHigh * multiplier));

    return {
      fps: `${fpsLow}-${fpsHigh}% smoother FPS potential`,
      edit: `${editLow}-${editHigh}% faster edit feel potential`,
      latency: `${latencyLow}-${latencyHigh}% lower input-delay feel potential`,
      note: "Estimated from browser-visible hardware signals. Not guaranteed; real results depend on drivers, Windows state, games, background apps, and network."
    };
  }

  function buildAnalyzerTweaks(result){
    const modeCopy = ANALYZER_MODES[result.mode]?.label || "Gaming";
    const base = [
      {
        title: "Restore point first",
        impact: "Safety",
        detail: "Create a recovery point before changing Windows settings so the setup stays reversible."
      },
      {
        title: "Smart profile selection",
        impact: "Core plan",
        detail: `${modeCopy} mode starts with Smart so EMX can avoid unsupported or risky changes.`
      },
      {
        title: "Startup and background trim",
        impact: result.lowSpec ? "High" : "Medium",
        detail: "Reduce unnecessary startup load, launchers, overlays, and idle background tasks before gaming."
      },
      {
        title: "Power and responsiveness pass",
        impact: result.isWindows ? "Medium" : "Preview",
        detail: "Tune Windows power behavior and foreground responsiveness without breaking daily-driver compatibility."
      },
      {
        title: "GPU and display check",
        impact: result.hasDiscreteGpu ? "Medium" : "Safe",
        detail: result.hasDiscreteGpu
          ? "Confirm GPU driver path, game mode, hardware scheduling fit, and display refresh behavior."
          : "Keep visual settings conservative until the target PC confirms the real GPU."
      },
      {
        title: "Network stability pass",
        impact: result.connectionQuality === "Weak" ? "High" : "Low",
        detail: "Check adapter, DNS, background downloads, and Discord/game network stability before ranked sessions."
      }
    ];

    if(result.mode === "streaming"){
      base.splice(3, 0, {
        title: "OBS and audio compatibility",
        impact: "High",
        detail: "Preserve capture, microphone, Discord, audio devices, and controller services while tuning."
      });
    }

    if(result.mode === "safe"){
      base.splice(2, 0, {
        title: "Shared PC compatibility",
        impact: "High",
        detail: "Keep Windows Security, updates, Bluetooth, printers, Xbox/controller paths, and school/work basics intact."
      });
    }

    return base;
  }

  function detectPcProfile(mode = analyzerMode){
    const cores = Number(navigator.hardwareConcurrency || 0);
    const memory = Number(navigator.deviceMemory || 0);
    const connection = navigator.connection || {};
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    const gpu = getGpuRenderer();
    const gpuLower = gpu.toLowerCase();
    const hasDiscreteGpu = /nvidia|geforce|rtx|gtx|radeon|amd|arc/i.test(gpuLower);
    const isAppleGpu = /apple|a[0-9]{1,2} gpu|m[0-9]/i.test(gpuLower);
    const isWindows = /win/i.test(platform || ua);
    const isIOS = /iphone|ipad|ipod/i.test(`${ua} ${platform}`);
    const isAndroid = /android/i.test(ua);
    const isMobile = isIOS || isAndroid || /mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && !isWindows);
    const osName = getOsName(ua, platform);
    const browserName = getBrowserName(ua);
    const screenPixels = Math.round((screen.width || 0) * (screen.height || 0) / 1000000);
    const downlink = Number(connection.downlink || 0);
    const connectionQuality = !downlink
      ? "Hidden"
      : downlink >= 60
        ? "Excellent"
        : downlink >= 20
          ? "Good"
          : downlink >= 8
            ? "Usable"
            : "Weak";
    const cpuScore = metricScore(cores, [
      { test: value => value >= 16, score: 95 },
      { test: value => value >= 12, score: 88 },
      { test: value => value >= 8, score: 78 },
      { test: value => value >= 4, score: 62 },
      { test: value => value > 0, score: 48 }
    ]);
    const memoryScore = metricScore(memory, [
      { test: value => value >= 32, score: 96 },
      { test: value => value >= 16, score: 86 },
      { test: value => value >= 8, score: 70 },
      { test: value => value >= 4, score: 54 },
      { test: value => value > 0, score: 46 }
    ]);
    const gpuScore = hasDiscreteGpu ? 86 : isAppleGpu ? 74 : /intel|uhd|iris/i.test(gpuLower) ? 62 : 58;
    const osScore = isWindows ? 94 : isMobile ? 64 : 58;
    const netScore = connectionQuality === "Excellent" ? 90 : connectionQuality === "Good" ? 78 : connectionQuality === "Usable" ? 64 : connectionQuality === "Weak" ? 48 : 60;
    let score = Math.round(cpuScore * .24 + memoryScore * .24 + gpuScore * .20 + osScore * .20 + netScore * .12);

    if(screenPixels >= 2) score += 3;
    if(mode === "streaming" && (memory < 16 || cores < 8)) score -= 5;
    if(mode === "safe") score += 2;
    if(isMobile) score = Math.min(score, 78);
    score = clampNumber(score, 42, 99);

    const lowSpec = (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4);
    const plan = isMobile
      ? "EMX Mobile Preview - Scan Target PC Next"
      : lowSpec
        ? "EMX Custom OS - Smart Safe Path"
        : hasDiscreteGpu
          ? mode === "streaming"
            ? "EMX Custom OS - Smart Stream-Safe Path"
            : "EMX Custom OS - Smart Balanced Path"
          : "EMX Custom OS - Smart Compatibility Path";

    const label = isMobile ? "Preview Scan" : score >= 88 ? "Strong Fit" : score >= 74 ? "Good Fit" : "Safe Fit";
    const reason = isMobile
      ? "This device can preview the analyzer, but the best install recommendation should be generated from the Windows PC that will run EMX."
      : lowSpec
        ? "This PC should start with Smart so EMX can stay conservative and prioritize compatibility."
        : mode === "streaming"
          ? "This PC can tune for gaming while keeping OBS, Discord, audio, and capture stability in the plan."
          : hasDiscreteGpu
            ? "This PC looks ready for Smart to resolve into Balanced after the installer confirms hardware."
            : "This PC should use Smart so EMX can keep daily-driver compatibility first.";
    const boost = estimateBoostRange(score, lowSpec, hasDiscreteGpu, isWindows, isMobile, mode);
    const metrics = [
      { label: "CPU Headroom", value: cpuScore, detail: cores ? `${cores} browser-visible threads` : "Hidden by browser" },
      { label: "Memory Room", value: memoryScore, detail: memory ? `${memory} GB browser estimate` : "Hidden by browser" },
      { label: "Graphics Path", value: gpuScore, detail: hasDiscreteGpu ? "Discrete GPU signal" : isAppleGpu ? "Apple GPU signal" : "Integrated/hidden signal" },
      { label: "OS Fit", value: osScore, detail: osName },
      { label: "Network Hint", value: netScore, detail: `${connection.effectiveType || "hidden"} / ${downlink ? downlink + " Mbps" : "hidden"}` }
    ];
    const bottlenecks = [];

    if(!isWindows) bottlenecks.push("Run again on the target Windows PC before installing EMX.");
    if(memory && memory < 8) bottlenecks.push("Low browser-reported memory: use Smart/Safe first.");
    if(cores && cores < 6) bottlenecks.push("Lower CPU thread count: prioritize startup and background trims.");
    if(!hasDiscreteGpu && !isMobile) bottlenecks.push("GPU is integrated or hidden: keep graphics tweaks conservative.");
    if(connectionQuality === "Weak") bottlenecks.push("Network looks limited: avoid background downloads while gaming.");

    const setupSteps = isMobile
      ? [
        "Use this as a preview scan only.",
        "Open the analyzer on the Windows PC that will use EMX.",
        "Complete Payhip checkout and keep the receipt order ID.",
        "Claim the EMX license with the same Payhip email and order ID.",
        "Run Smart first on the PC, then choose Balanced only if the installer confirms it fits."
      ]
      : [
        "Complete Payhip checkout and keep your receipt order ID.",
        "Claim your EMX license on the License Claim page.",
        "Download EMX Custom OS from Payhip.",
        "Run EMX-Installer.exe as Administrator.",
        mode === "streaming"
          ? "Use Smart Stream-Safe so OBS, Discord, audio, and capture stay working."
          : lowSpec
            ? "Use Smart first and let EMX choose the safer profile."
            : "Use Smart first and let EMX choose Balanced only when it fits.",
        "Restart when ready, then test your game, Discord, OBS/audio, controller, security, and updates."
      ];

    const result = {
      cores,
      memory,
      gpu,
      connection: connection.effectiveType || "browser hidden",
      downlink: connection.downlink ? connection.downlink + " Mbps estimate" : "browser hidden",
      platform: platform || "browser hidden",
      osName,
      browserName,
      screen: `${screen.width || "--"} x ${screen.height || "--"}`,
      score,
      label,
      plan,
      reason,
      boost,
      metrics,
      bottlenecks,
      setupSteps,
      tweaks: [],
      mode,
      modeLabel: ANALYZER_MODES[mode]?.label || "Gaming",
      modeCopy: ANALYZER_MODES[mode]?.copy || "",
      lowSpec,
      hasDiscreteGpu,
      isWindows,
      isMobile,
      connectionQuality
    };

    result.tweaks = buildAnalyzerTweaks(result);
    return result;
  }

  function ensurePcAnalyzerEnhancements(){
    const card = document.querySelector("#pc-analyzer-modal .pc-analyzer-card");
    const actions = document.querySelector("#pc-analyzer-modal .pc-analyzer-actions");

    if(!card || !actions) return;

    if(!document.getElementById("pcAnalyzerModeBar")){
      const modeBar = document.createElement("div");
      modeBar.id = "pcAnalyzerModeBar";
      modeBar.className = "pc-analyzer-modebar";
      modeBar.innerHTML = Object.entries(ANALYZER_MODES).map(([key, mode]) => `
        <button class="play-click ${key === analyzerMode ? "active" : ""}" type="button" data-action="analyzer-mode" data-mode="${escapeHtml(key)}">
          <strong>${escapeHtml(mode.label)}</strong>
          <span>${escapeHtml(mode.copy)}</span>
        </button>
      `).join("");

      const grid = card.querySelector(".pc-analyzer-grid");
      grid?.insertAdjacentElement("beforebegin", modeBar);
    }

    if(!document.getElementById("pcAnalyzerDeepGrid")){
      const deepGrid = document.createElement("div");
      deepGrid.id = "pcAnalyzerDeepGrid";
      deepGrid.className = "pc-analyzer-deep-grid";
      deepGrid.innerHTML = `
        <div class="pc-analyzer-panel pc-analyzer-lift-panel">
          <span>Estimated Performance Lift</span>
          <div id="pcAnalyzerLift" class="pc-analyzer-lift">
            <div><strong>--</strong><p>FPS smoothness</p></div>
            <div><strong>--</strong><p>Edit feel</p></div>
            <div><strong>--</strong><p>Latency feel</p></div>
          </div>
          <p id="pcAnalyzerLiftNote">Run the analyzer for safe estimated ranges. These are never guaranteed numbers.</p>
        </div>

        <div class="pc-analyzer-panel">
          <span>Score Breakdown</span>
          <div id="pcAnalyzerBreakdown" class="pc-analyzer-breakdown">
            <div class="pc-analyzer-meter"><b>Waiting</b><i><em style="width:0%"></em></i><small>Run scan</small></div>
          </div>
        </div>
      `;

      actions.insertAdjacentElement("beforebegin", deepGrid);
    }

    if(!document.getElementById("pcAnalyzerTweaksPanel")){
      const tweaksPanel = document.createElement("div");
      tweaksPanel.id = "pcAnalyzerTweaksPanel";
      tweaksPanel.className = "pc-analyzer-tweaks-panel";
      tweaksPanel.innerHTML = `
        <div class="pc-analyzer-panel">
          <span>Recommended Tweaks</span>
          <div id="pcAnalyzerTweaks" class="pc-analyzer-tweaks">
            <button type="button">Run analyzer to build tweak list</button>
          </div>
        </div>

        <div class="pc-analyzer-panel">
          <span>Risk Notes</span>
          <ul id="pcAnalyzerRisks">
            <li>No scan has been run yet.</li>
          </ul>
        </div>
      `;

      actions.insertAdjacentElement("beforebegin", tweaksPanel);
    }

    if(!document.getElementById("pcAnalyzerDownloadBtn")){
      const downloadBtn = document.createElement("button");
      downloadBtn.id = "pcAnalyzerDownloadBtn";
      downloadBtn.className = "btn-outline green play-click";
      downloadBtn.type = "button";
      downloadBtn.dataset.action = "download-pc-report";
      downloadBtn.textContent = "Download EMX Report PNG";

      const copyBtn = document.createElement("button");
      copyBtn.id = "pcAnalyzerCopyBtn";
      copyBtn.className = "btn-outline play-click";
      copyBtn.type = "button";
      copyBtn.dataset.action = "copy-pc-report";
      copyBtn.textContent = "Copy Report Text";

      actions.append(downloadBtn, copyBtn);
    }
  }

  function updatePcAnalyzerModeButtons(){
    document.querySelectorAll("[data-action='analyzer-mode']").forEach(button => {
      button.classList.toggle("active", button.dataset.mode === analyzerMode);
    });
  }

  function setAnalyzerReportActionsEnabled(enabled){
    document.querySelectorAll("[data-action='download-pc-report'], [data-action='copy-pc-report']").forEach(button => {
      button.disabled = !enabled;
      button.setAttribute("aria-disabled", String(!enabled));
    });
  }

  function renderAnalyzerReadyState(){
    ensurePcAnalyzerEnhancements();
    updatePcAnalyzerModeButtons();
    currentAnalyzerResult = null;
    analyzerHasRun = false;

    const card = document.querySelector("#pc-analyzer-modal .pc-analyzer-card");
    const scoreEl = document.getElementById("pcAnalyzerScore");
    const labelEl = document.getElementById("pcAnalyzerLabel");
    const planEl = document.getElementById("pcAnalyzerPlan");
    const reasonEl = document.getElementById("pcAnalyzerReason");
    const specsEl = document.getElementById("pcAnalyzerSpecs");
    const stepsEl = document.getElementById("pcAnalyzerSteps");
    const breakdown = document.getElementById("pcAnalyzerBreakdown");
    const lift = document.getElementById("pcAnalyzerLift");
    const liftNote = document.getElementById("pcAnalyzerLiftNote");
    const tweaks = document.getElementById("pcAnalyzerTweaks");
    const risks = document.getElementById("pcAnalyzerRisks");

    card?.classList.remove("scanning");
    if(scoreEl) scoreEl.textContent = "--";
    if(labelEl) labelEl.textContent = "Ready";
    if(planEl) planEl.textContent = "Press Analyze";
    if(reasonEl) reasonEl.textContent = "Choose a mode, press Analyze, then EMX will reveal CPU, RAM, GPU, OS, browser, screen, connection hints, tweak recommendations, and report tools.";
    if(specsEl){
      specsEl.innerHTML = [
        "CPU: hidden until scan",
        "GPU: hidden until scan",
        "RAM: hidden until scan",
        "OS / Browser: hidden until scan"
      ].map(item => `<li class="pc-analyzer-locked">${escapeHtml(item)}</li>`).join("");
    }
    if(stepsEl){
      stepsEl.innerHTML = [
        "Pick Gaming, Gaming + Stream, or Safe Daily.",
        "Press Analyze This PC.",
        "Wait for the EMX scan animation to finish.",
        "Review specs, tweaks, and download your report."
      ].map(item => `<li>${escapeHtml(item)}</li>`).join("");
    }
    if(lift){
      lift.innerHTML = `
        <div><strong>Locked</strong><p>FPS smoothness</p></div>
        <div><strong>Locked</strong><p>Edit feel</p></div>
        <div><strong>Locked</strong><p>Latency feel</p></div>
      `;
    }
    if(liftNote) liftNote.textContent = "Estimated ranges unlock after scan. No FPS, ping, or edit-delay number is guaranteed.";
    if(breakdown){
      breakdown.innerHTML = `
        <div class="pc-analyzer-meter"><b>Waiting For Scan</b><i><em style="width:0%"></em></i><small>Press Analyze This PC</small></div>
      `;
    }
    if(tweaks){
      tweaks.innerHTML = `<button type="button" disabled>Analyze first to unlock recommended tweaks</button>`;
    }
    if(risks){
      risks.innerHTML = `<li>No scan has been run yet.</li>`;
    }
    setAnalyzerReportActionsEnabled(false);
  }

  function renderAnalyzerScanningState(){
    ensurePcAnalyzerEnhancements();
    updatePcAnalyzerModeButtons();
    currentAnalyzerResult = null;

    const card = document.querySelector("#pc-analyzer-modal .pc-analyzer-card");
    const scoreEl = document.getElementById("pcAnalyzerScore");
    const labelEl = document.getElementById("pcAnalyzerLabel");
    const planEl = document.getElementById("pcAnalyzerPlan");
    const reasonEl = document.getElementById("pcAnalyzerReason");
    const specsEl = document.getElementById("pcAnalyzerSpecs");
    const stepsEl = document.getElementById("pcAnalyzerSteps");
    const breakdown = document.getElementById("pcAnalyzerBreakdown");
    const lift = document.getElementById("pcAnalyzerLift");
    const liftNote = document.getElementById("pcAnalyzerLiftNote");
    const tweaks = document.getElementById("pcAnalyzerTweaks");
    const risks = document.getElementById("pcAnalyzerRisks");

    card?.classList.add("scanning");
    if(scoreEl) scoreEl.textContent = "...";
    if(labelEl) labelEl.textContent = "Scanning";
    if(planEl) planEl.textContent = "EMX is analyzing this device";
    if(reasonEl) reasonEl.textContent = "Reading safe browser-visible signals. No files are scanned, nothing is installed, and no private files leave the device.";
    if(specsEl){
      specsEl.innerHTML = [
        "Reading CPU thread count",
        "Estimating memory class",
        "Checking browser GPU renderer",
        "Detecting OS, browser, screen, and connection hints"
      ].map(item => `
        <li class="pc-analyzer-loading-row">
          <i></i>
          <span>${escapeHtml(item)}</span>
        </li>
      `).join("");
    }
    if(stepsEl){
      stepsEl.innerHTML = [
        "Building recommended EMX path",
        "Scoring compatibility and performance headroom",
        "Preparing tweak list and report tools"
      ].map(item => `<li class="pc-analyzer-skeleton">${escapeHtml(item)}</li>`).join("");
    }
    if(lift){
      lift.innerHTML = `
        <div class="pc-analyzer-skeleton"><strong>Scanning</strong><p>FPS smoothness</p></div>
        <div class="pc-analyzer-skeleton"><strong>Scanning</strong><p>Edit feel</p></div>
        <div class="pc-analyzer-skeleton"><strong>Scanning</strong><p>Latency feel</p></div>
      `;
    }
    if(liftNote) liftNote.textContent = "Calculating estimated ranges...";
    if(breakdown){
      breakdown.innerHTML = ["CPU Headroom", "Memory Room", "Graphics Path", "OS Fit", "Network Hint"].map((label, index) => `
        <div class="pc-analyzer-meter pc-analyzer-skeleton">
          <b>${escapeHtml(label)}</b>
          <i><em style="width:${18 + index * 13}%"></em></i>
          <small>Scanning...</small>
        </div>
      `).join("");
    }
    if(tweaks){
      tweaks.innerHTML = `
        <button class="pc-analyzer-skeleton" type="button" disabled>Finding safest tweak path...</button>
        <button class="pc-analyzer-skeleton" type="button" disabled>Checking compatibility notes...</button>
      `;
    }
    if(risks){
      risks.innerHTML = `<li class="pc-analyzer-loading-row"><i></i><span>Looking for browser-visible bottlenecks...</span></li>`;
    }
    setAnalyzerReportActionsEnabled(false);
  }

  function renderAnalyzerMetrics(result){
    const breakdown = document.getElementById("pcAnalyzerBreakdown");
    const lift = document.getElementById("pcAnalyzerLift");
    const liftNote = document.getElementById("pcAnalyzerLiftNote");
    const tweaks = document.getElementById("pcAnalyzerTweaks");
    const risks = document.getElementById("pcAnalyzerRisks");

    if(breakdown){
      breakdown.innerHTML = result.metrics.map(metric => `
        <div class="pc-analyzer-meter">
          <b>${escapeHtml(metric.label)}</b>
          <i><em style="width:${clampNumber(metric.value, 0, 100)}%"></em></i>
          <small>${escapeHtml(percentText(metric.value))} - ${escapeHtml(metric.detail)}</small>
        </div>
      `).join("");
    }

    if(lift){
      lift.innerHTML = `
        <div><strong>${escapeHtml(result.boost.fps)}</strong><p>FPS smoothness</p></div>
        <div><strong>${escapeHtml(result.boost.edit)}</strong><p>Edit feel</p></div>
        <div><strong>${escapeHtml(result.boost.latency)}</strong><p>Latency feel</p></div>
      `;
    }

    if(liftNote){
      liftNote.textContent = result.boost.note;
    }

    if(tweaks){
      tweaks.innerHTML = result.tweaks.map((tweak, index) => `
        <button class="play-click" type="button" data-action="analyzer-tweak" data-tweak-index="${index}">
          <span>${escapeHtml(tweak.impact)}</span>
          <strong>${escapeHtml(tweak.title)}</strong>
          <p>${escapeHtml(tweak.detail)}</p>
        </button>
      `).join("");
    }

    if(risks){
      const items = result.bottlenecks.length
        ? result.bottlenecks
        : ["No major browser-visible bottleneck found. Still test after restart before ranked or paid work."];

      risks.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    }
  }

  function buildAnalyzerReportText(result = currentAnalyzerResult){
    if(!result) return "Run the EMX analyzer first.";

    return [
      "EMX PC Analyzer Report",
      `Fit Score: ${result.score} / 100 (${result.label})`,
      `Mode: ${result.modeLabel}`,
      `Recommended Plan: ${result.plan}`,
      `Reason: ${result.reason}`,
      "",
      "Detected:",
      `CPU threads: ${result.cores || "hidden"}`,
      `RAM estimate: ${result.memory ? result.memory + " GB" : "hidden"}`,
      `GPU: ${result.gpu}`,
      `OS: ${result.osName}`,
      `Browser: ${result.browserName}`,
      `Platform: ${result.platform}`,
      `Screen: ${result.screen}`,
      `Connection: ${result.connection} / ${result.downlink}`,
      "",
      "Estimated Lift:",
      `FPS: ${result.boost.fps}`,
      `Edit feel: ${result.boost.edit}`,
      `Latency feel: ${result.boost.latency}`,
      `Note: ${result.boost.note}`,
      "",
      "Recommended Tweaks:",
      ...result.tweaks.map((tweak, index) => `${index + 1}. ${tweak.title} (${tweak.impact}) - ${tweak.detail}`),
      "",
      "Next Steps:",
      ...result.setupSteps.map((step, index) => `${index + 1}. ${step}`),
      "",
      "Generated by EMX Tweaks"
    ].join("\n");
  }

  function downloadAnalyzerReport(){
    if(!currentAnalyzerResult){
      showToast("<strong>Analyze first</strong><br>Run the EMX PC scan before downloading a report.");
      return;
    }

    const result = currentAnalyzerResult;
    const canvas = document.createElement("canvas");
    const width = 1200;
    const height = 1900;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext("2d");

    if(!ctx) return;

    ctx.scale(ratio, ratio);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#061107");
    gradient.addColorStop(.5, "#050607");
    gradient.addColorStop(1, "#17041f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(36,255,36,.14)";
    ctx.lineWidth = 1;
    for(let x = 0; x < width; x += 44){
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for(let y = 0; y < height; y += 44){
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#24ff24";
    ctx.font = "900 34px Arial";
    ctx.fillText("EMX", 70, 82);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 70px Arial";
    ctx.fillText("PC Analyzer Report", 70, 165);
    ctx.font = "900 38px Arial";
    ctx.fillStyle = "#24ff24";
    ctx.fillText(`${result.score}/100 - ${result.label}`, 70, 230);
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.font = "700 26px Arial";
    let yCursor = wrapCanvasText(ctx, result.plan, 70, 285, 1040, 34) + 22;
    yCursor = wrapCanvasText(ctx, result.reason, 70, yCursor, 1040, 32) + 54;

    const boxes = [
      ["Mode", result.modeLabel],
      ["FPS Estimate", result.boost.fps],
      ["Edit Feel", result.boost.edit],
      ["Latency Feel", result.boost.latency]
    ];

    let boxX = 70;
    let boxY = Math.max(470, yCursor);
    boxes.forEach((box, index) => {
      const x = boxX + (index % 2) * 535;
      const y = boxY + Math.floor(index / 2) * 150;
      ctx.fillStyle = "rgba(0,0,0,.42)";
      roundRect(ctx, x, y, 500, 120, 26, true, false);
      ctx.strokeStyle = "rgba(36,255,36,.30)";
      roundRect(ctx, x, y, 500, 120, 26, false, true);
      ctx.fillStyle = "rgba(255,255,255,.58)";
      ctx.font = "900 18px Arial";
      ctx.fillText(box[0].toUpperCase(), x + 26, y + 38);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 28px Arial";
      wrapCanvasText(ctx, box[1], x + 26, y + 78, 445, 30);
    });

    yCursor = boxY + 330;
    ctx.fillStyle = "#24ff24";
    ctx.font = "900 28px Arial";
    ctx.fillText("Detected System", 70, yCursor);
    yCursor += 50;
    ctx.fillStyle = "rgba(255,255,255,.76)";
    ctx.font = "700 22px Arial";
    [
      `CPU threads: ${result.cores || "hidden"}`,
      `RAM estimate: ${result.memory ? result.memory + " GB" : "hidden"}`,
      `GPU: ${result.gpu}`,
      `OS: ${result.osName} / ${result.browserName}`,
      `Platform: ${result.platform}`,
      `Screen: ${result.screen}`,
      `Connection: ${result.connection} / ${result.downlink}`
    ].forEach(line => {
      yCursor = wrapCanvasText(ctx, line, 70, yCursor, 1040, 30) + 8;
    });

    yCursor += 36;
    ctx.fillStyle = "#24ff24";
    ctx.font = "900 28px Arial";
    ctx.fillText("Recommended Tweaks", 70, yCursor);
    yCursor += 48;
    ctx.fillStyle = "rgba(255,255,255,.80)";
    ctx.font = "700 21px Arial";
    result.tweaks.slice(0, 7).forEach((tweak, index) => {
      yCursor = wrapCanvasText(ctx, `${index + 1}. ${tweak.title}: ${tweak.detail}`, 70, yCursor, 1040, 28) + 14;
    });

    yCursor += 26;
    ctx.fillStyle = "#24ff24";
    ctx.font = "900 25px Arial";
    ctx.fillText("Report Note", 70, yCursor);
    yCursor += 42;
    ctx.fillStyle = "rgba(255,255,255,.52)";
    ctx.font = "700 20px Arial";
    yCursor = wrapCanvasText(ctx, result.boost.note, 70, yCursor, 1040, 26) + 14;
    wrapCanvasText(ctx, "Browser-visible estimates only. Real results depend on drivers, Windows state, games, background apps, and network.", 70, yCursor, 1040, 26);

    const link = document.createElement("a");
    link.download = `EMX-PC-Analyzer-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("<strong>EMX report ready</strong><br>Your branded PNG report was downloaded.");
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke){
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    if(fill) ctx.fill();
    if(stroke) ctx.stroke();
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
    const words = String(text || "").trim().split(/\s+/).filter(Boolean);
    let line = "";
    let currentY = y;

    if(!words.length) return currentY;

    words.forEach(word => {
      const test = line ? `${line} ${word}` : word;
      if(ctx.measureText(test).width > maxWidth && line){
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      }else{
        line = test;
      }
    });

    if(line) ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  }

  async function copyAnalyzerReport(){
    if(!currentAnalyzerResult){
      showToast("<strong>Analyze first</strong><br>Run the EMX PC scan before copying a report.");
      return;
    }

    const text = buildAnalyzerReportText();

    try{
      await navigator.clipboard.writeText(text);
      showToast("<strong>Report copied</strong><br>Paste it into Discord or notes.");
    }catch(error){
      showToast("<strong>Copy blocked</strong><br>Your browser blocked clipboard access. Use the PNG download instead.");
    }
  }

  function renderAnalyzerResult(result){
    const card = document.querySelector("#pc-analyzer-modal .pc-analyzer-card");
    const scoreEl = document.getElementById("pcAnalyzerScore");
    const labelEl = document.getElementById("pcAnalyzerLabel");
    const planEl = document.getElementById("pcAnalyzerPlan");
    const reasonEl = document.getElementById("pcAnalyzerReason");
    const specsEl = document.getElementById("pcAnalyzerSpecs");
    const stepsEl = document.getElementById("pcAnalyzerSteps");

    card?.classList.remove("scanning");
    analyzerHasRun = true;
    setAnalyzerReportActionsEnabled(true);

    if(scoreEl) scoreEl.textContent = result.score;
    if(labelEl) labelEl.textContent = result.label;
    if(planEl) planEl.textContent = result.plan;
    if(reasonEl) reasonEl.textContent = result.reason;

    if(specsEl){
      specsEl.innerHTML = [
        `CPU threads: ${result.cores || "hidden"}`,
        `RAM estimate: ${result.memory ? result.memory + " GB" : "hidden"}`,
        `GPU: ${result.gpu}`,
        `OS / Browser: ${result.osName} / ${result.browserName}`,
        `Platform: ${result.platform}`,
        `Screen: ${result.screen}`,
        `Connection: ${result.connection} / ${result.downlink}`
      ].map(item => `<li>${escapeHtml(item)}</li>`).join("");
    }

    if(stepsEl){
      stepsEl.innerHTML = result.setupSteps.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    }

    renderAnalyzerMetrics(result);
  }

  function runPcAnalyzer(){
    ensurePcAnalyzerEnhancements();
    updatePcAnalyzerModeButtons();
    openPcAnalyzer(false);
    renderAnalyzerScanningState();
    showToast("<strong>EMX Analyzer</strong><br>Reading safe browser-visible system signals.");

    if(analyzerScanTimer){
      clearTimeout(analyzerScanTimer);
    }

    analyzerScanTimer = setTimeout(() => {
      currentAnalyzerResult = detectPcProfile(analyzerMode);
      renderAnalyzerResult(currentAnalyzerResult);
      showToast("<strong>Scan complete</strong><br>Specs, tweaks, and report tools are ready.");
    }, 1200);
  }

  function unlockBodyIfSafe(){
    const mediaOpen = document.getElementById("media-modal")?.classList.contains("show");
    const legalOpen = document.getElementById("legal-modal")?.classList.contains("show");
    const detailOpen = document.getElementById("detail-modal")?.classList.contains("show");
    const analyzerOpen = document.getElementById("pc-analyzer-modal")?.classList.contains("show");
    const installOpen = document.getElementById("installAppPopup")?.classList.contains("show");
    const cartOpen = cartDrawer?.classList.contains("show");
    const booting = document.body.classList.contains("booting");
    const payOpen = document.getElementById("emxPayLoading")?.classList.contains("show");

    if(!mediaOpen && !legalOpen && !detailOpen && !analyzerOpen && !installOpen && !cartOpen && !booting && !payOpen){
      document.body.classList.remove("no-scroll");
    }
  }

  function showToast(message){
    const container = document.getElementById("toast-container");
    if(!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 260);
    }, 3900);
  }

  function startActivityToasts(){
    clearInterval(activityTimer);

    activityTimer = setInterval(() => {
      if(!document.body.classList.contains("app-ready")) return;
      if(document.getElementById("media-modal")?.classList.contains("show")) return;
      if(document.getElementById("legal-modal")?.classList.contains("show")) return;
      if(document.getElementById("detail-modal")?.classList.contains("show")) return;
      if(document.getElementById("installAppPopup")?.classList.contains("show")) return;
      if(document.getElementById("emxPayLoading")?.classList.contains("show")) return;
      if(cartDrawer?.classList.contains("show")) return;

      const message = ACTIVITY_TOASTS[activityIndex % ACTIVITY_TOASTS.length];
      activityIndex++;

      showToast(message);
    }, 26000);
  }

  function openDiscordServer(){
    window.open(DISCORD_INVITE_URL, "_blank", "noopener");
    showToast("Opening EMX Discord server.");
  }

  function shareProduct(key){
    const product = getProductByKey(key);

    if(!product){
      showToast("Product not found.");
      return;
    }

    const productLink = product.productUrl || productCheckoutUrl(product.key);
    const shareText = `${product.title} - ${product.eyebrow} by EFECT`;

    if(navigator.share){
      navigator.share({
        title: product.title,
        text: shareText,
        url: productLink
      }).catch(() => {});
    }else{
      navigator.clipboard.writeText(productLink).then(() => {
        showToast("<strong>Product link copied.</strong><br>" + escapeHtml(product.title));
      }).catch(() => {
        showToast("Copy failed.");
      });
    }
  }

  function shareApp(){
    if(navigator.share){
      navigator.share({
        title: "EMX TWEAKS",
        text: "EFECT digital storefront with Payhip checkout and EMX license claim.",
        url: window.location.href
      }).catch(() => {});
    }else{
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast("Store link copied.");
      }).catch(() => {
        showToast("Copy failed.");
      });
    }
  }

  function toggleSearch(){
    const panel = document.getElementById("searchPanel");
    const input = document.getElementById("searchInput");

    if(!panel || !input) return;

    panel.classList.toggle("show");

    if(panel.classList.contains("show")){
      setTimeout(() => input.focus(), 80);
    }else{
      input.value = "";
      filterProducts("");
    }
  }

  function filterProducts(value){
    const query = value.trim().toLowerCase();

    document.querySelectorAll(".product-card").forEach(card => {
      const haystack = card.dataset.search || "";
      card.classList.toggle("hidden", Boolean(query) && !haystack.includes(query));
    });
  }

  function playClickSound(){
    try{
      if(!clickAudio) return;
      clickAudio.volume = EMX_CLICK_VOLUME;
      clickAudio.currentTime = 0;
      clickAudio.play().catch(() => {});
    }catch(error){}
  }

  function spawnScreenStreak(event){
    const target = event?.target?.closest?.("[data-action], .product-card, .custom-os-preview");
    if(!target) return;

    const action = target.dataset?.action || "";
    const shouldLaunch = ["preview", "detail", "buy", "run-pc-analyzer"].includes(action);
    if(!shouldLaunch) return;

    const point = event.touches?.[0] || event;
    const x = Number(point.clientX || window.innerWidth / 2);
    const y = Number(point.clientY || window.innerHeight / 2);
    const streak = document.createElement("span");

    streak.className = "emx-screen-streak";
    streak.style.left = x + "px";
    streak.style.top = y + "px";

    document.body.appendChild(streak);

    setTimeout(() => {
      streak.remove();
    }, 760);
  }

  function isStandaloneApp(){
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function showInstallPopup(force = false){
    const popup = document.getElementById("installAppPopup");

    if(!popup) return;

    if(!force && isStandaloneApp()) return;
    if(!force && localStorage.getItem(INSTALL_POPUP_KEY) === "yes") return;

    popup.classList.add("show");
    document.body.classList.add("no-scroll");
  }

  function closeInstallPopup(){
    const popup = document.getElementById("installAppPopup");

    if(!popup) return;

    popup.classList.remove("show");
    localStorage.setItem(INSTALL_POPUP_KEY, "yes");
    unlockBodyIfSafe();
  }

  function copyInstallName(){
    navigator.clipboard.writeText("EMX TWEAKS").then(() => {
      showToast("<strong>App name copied.</strong><br>Use EMX TWEAKS on the Home Screen.");
    }).catch(() => {
      showToast("App name: <strong>EMX TWEAKS</strong>");
    });
  }

  async function enterDomain(){
    if(isLaunching) return;

    const btn = document.getElementById("enterBtn");
    const launchOverlay = document.getElementById("emxLaunchOverlay");
    const launchStatus = document.getElementById("emxLaunchStatus");
    const launchPercent = document.getElementById("emxLaunchPercent");
    const launchBarFill =
      document.getElementById("emxLaunchBarFill") ||
      document.querySelector(".emx-launch-bar span");

    if(!btn) return;

    isLaunching = true;

    btn.classList.add("booting");
    document.body.classList.add("booting");
    document.body.classList.add("no-scroll");

    try{
      if(bootAudio){
        bootAudio.volume = EMX_BOOT_VOLUME;
        bootAudio.currentTime = 0;
        await bootAudio.play();
      }
    }catch(error){}

    if(launchOverlay){
      launchOverlay.classList.remove("exit", "launch-complete");
      launchOverlay.classList.add("cinematic-launch");
      launchOverlay.classList.add("show");
    }

    if(launchStatus) launchStatus.textContent = "INITIALIZING EMX CORE";
    if(launchPercent) launchPercent.textContent = "0%";
    if(launchBarFill) launchBarFill.style.width = "0%";

    const stages = [
      { percent: 10, text: "WAKING EMX CORE" },
      { percent: 26, text: "LOADING VISUAL ENGINE" },
      { percent: 45, text: "ARMING CUSTOM OS DROP" },
      { percent: 66, text: "SYNCING SMART ANALYZER" },
      { percent: 84, text: "VERIFYING SECURE PAYHIP" },
      { percent: 100, text: "LAUNCHING STORE" }
    ];

    let stageIndex = 0;

    const stageTimer = setInterval(() => {
      const stage = stages[stageIndex];

      if(stage){
        if(launchStatus) launchStatus.textContent = stage.text;
        if(launchPercent) launchPercent.textContent = stage.percent + "%";
        if(launchBarFill) launchBarFill.style.width = stage.percent + "%";
      }

      stageIndex++;

      if(stageIndex >= stages.length){
        clearInterval(stageTimer);

        setTimeout(() => {
          if(launchOverlay){
            launchOverlay.classList.add("launch-complete");
          }
        }, 180);

        setTimeout(() => {
          if(launchOverlay){
            launchOverlay.classList.add("exit");
            launchOverlay.classList.remove("show");
            launchOverlay.classList.remove("cinematic-launch");
          }

          document.body.classList.add("app-ready");
          document.body.classList.add("emx-site-reveal");
          document.body.classList.remove("booting");
          document.body.classList.remove("no-scroll");

          btn.classList.remove("booting");
          isLaunching = false;

          startActivityToasts();
          setTimeout(() => {
            document.body.classList.remove("emx-site-reveal");
          }, 1900);
        }, 620);
      }
    }, 300);
  }

  function scheduleAutoIntro(){
    const btn = document.getElementById("enterBtn");
    if(!btn) return;

    btn.textContent = "Launching EMX Domain";

    setTimeout(() => {
      if(isLaunching || document.body.classList.contains("app-ready")) return;
      enterDomain();
    }, 520);
  }

  function setupSupportWidget(){
    const widget = document.getElementById("supportWidget");
    const fab = document.getElementById("supportFab");
    const faqBtn = document.getElementById("supportOpenFaq");
    const bundleBtn = document.getElementById("supportViewBundle");

    if(fab && widget){
      fab.addEventListener("click", () => {
        widget.classList.toggle("open");
      });
    }

    if(faqBtn){
      faqBtn.addEventListener("click", () => {
        window.location.href = "./faq.html";
      });
    }

    if(bundleBtn){
      bundleBtn.addEventListener("click", () => {
        window.location.href = "./bundle.html";
      });
    }
  }

  function renderBundleFromAdmin(){
    const bundle = getBundleProduct();

    if(!bundle) return;

    const bundleCard = document.querySelector(".bundle-card");
    if(!bundleCard) return;

    const title = bundleCard.querySelector("[data-bundle-title]");
    const eyebrow = bundleCard.querySelector("[data-bundle-eyebrow]");
    const description = bundleCard.querySelector("[data-bundle-description]");
    const priceNodes = bundleCard.querySelectorAll("[data-bundle-price]");
    const oldPriceNodes = bundleCard.querySelectorAll("[data-bundle-old-price]");
    const discount = bundleCard.querySelector("[data-bundle-discount]");
    const features = bundleCard.querySelector("[data-bundle-features]");
    const gallery = bundleCard.querySelector("[data-bundle-gallery]");

    if(title) title.textContent = bundle.title || "EFECT Ultimate Pack";
    if(eyebrow) eyebrow.textContent = bundle.eyebrow || "Best Value Bundle";
    if(description) description.textContent = bundle.description || "";

    priceNodes.forEach(node => {
      node.textContent = money(bundle.price || 0);
    });

    oldPriceNodes.forEach(node => {
      node.textContent = node.classList.contains("bundle-old")
        ? `${money(bundle.oldPrice || 0)} separate value`
        : money(bundle.oldPrice || 0);
    });

    if(discount){
      const oldValue = Number(bundle.oldPrice || 0);
      const newValue = Number(bundle.price || 0);
      const discountValue = oldValue > newValue && oldValue > 0
        ? Math.round((1 - newValue / oldValue) * 100)
        : 0;

      discount.textContent = discountValue > 0 ? `${discountValue}% OFF` : "Bundle Deal";
    }

    if(features){
      features.innerHTML = Array.isArray(bundle.features)
        ? bundle.features.map(feature => `
            <li class="feature-item">
              <span class="check-icon">✓</span>
              <span>${escapeHtml(feature)}</span>
            </li>
          `).join("")
        : "";
    }

    if(gallery){
      const images = Array.isArray(bundle.gallery) && bundle.gallery.length
        ? bundle.gallery
        : [bundle.image].filter(Boolean);

      gallery.innerHTML = images.map(src => `
        <button
          class="bundle-preview-card play-click"
          type="button"
          data-action="preview"
          data-key="${escapeHtml(bundle.key)}"
          data-preview-type="image"
          data-preview-src="${escapeHtml(src)}"
          data-title="${escapeHtml(bundle.title || "EFECT Ultimate Pack")}"
          data-fallback-preview="${escapeHtml(bundle.image || "")}"
        >
          <img src="${escapeHtml(src)}" alt="${escapeHtml(bundle.title || "Bundle image")}" loading="lazy" decoding="async">
        </button>
      `).join("");
    }

    renderBundleOptions();
  }

  function renderBundleOptions(){
    const grid = document.getElementById("bundleChoiceGrid");
    if(!grid) return;

    const options = getBundleOptions();

    grid.innerHTML = options.map(product => {
      const isFullPack = product.id === "bundle";
      const action = isFullPack ? "buy-bundle" : "buy";
      const addAction = isFullPack ? "add-bundle" : "add";
      const image = product.image || product.fallbackPreview || "emx-logo.png";
      const value = product.oldPrice && product.oldPrice > product.price
        ? `${money(product.oldPrice)} value`
        : "Bundle checkout";

      return `
        <article class="bundle-option-card ${isFullPack ? "is-full-pack" : "is-os-macro"}">
          <div class="bundle-option-media">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(product.title || "EMX Bundle")}" loading="lazy" decoding="async">
          </div>

          <div class="bundle-option-copy">
            <span>${escapeHtml(product.eyebrow || "EMX Bundle")}</span>
            <h3>${formatTitle(escapeHtml(product.title || "EMX Bundle"))}</h3>
            <p>${escapeHtml(product.description || "")}</p>
          </div>

          <div class="bundle-option-bottom">
            <div>
              <strong>${money(product.price || 0)}</strong>
              <small>${escapeHtml(value)}</small>
            </div>

            <div class="bundle-option-actions">
              <button class="btn-filled play-click" type="button" data-action="${action}" data-key="${escapeHtml(product.key)}">
                ${isFullPack ? "Buy Full Pack" : "Buy OS + Macro"}
              </button>
              <button class="btn-outline green play-click" type="button" data-action="${addAction}" data-key="${escapeHtml(product.key)}">
                Add
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function setupEvents(){
    const enterBtn = document.getElementById("enterBtn");

    if(enterBtn){
      enterBtn.addEventListener("click", enterDomain);
    }

    function isInternalPageLink(link){
      if(!link || !link.href || link.target || link.hasAttribute("download")) return false;

      const url = new URL(link.href, window.location.href);
      if(url.origin !== window.location.origin) return false;
      if(url.pathname === window.location.pathname && url.hash) return false;

      return /\.(html)?$/i.test(url.pathname) || url.pathname.endsWith("/");
    }

    function animateToPage(href){
      if(document.body.classList.contains("emx-route-leaving")) return;

      sessionStorage.setItem("emxRouteSwap", "1");
      document.body.classList.add("emx-route-leaving");

      let wipe = document.getElementById("emxRouteWipe");

      if(!wipe){
        wipe = document.createElement("div");
        wipe.id = "emxRouteWipe";
        wipe.className = "emx-route-wipe";
        wipe.innerHTML = "<span>EMX</span>";
        document.body.appendChild(wipe);
      }

      requestAnimationFrame(() => {
        wipe.classList.add("show");
      });

      setTimeout(() => {
        window.location.href = href;
      }, 760);
    }

    document.addEventListener("click", event => {
      const clickTarget = event.target.closest(".play-click");

      if(clickTarget && clickTarget.id !== "enterBtn"){
        playClickSound();
      }

      const pageLink = event.target.closest("a.play-click[href]");
      if(pageLink && isInternalPageLink(pageLink)){
        event.preventDefault();
        animateToPage(pageLink.href);
        return;
      }

      spawnScreenStreak(event);

      const actionTarget = event.target.closest("[data-action]");

      if(!actionTarget) return;

      const action = actionTarget.dataset.action;

      if(action === "preview"){
        const productCard = actionTarget.closest(".product-card");
        const productKey =
          actionTarget.dataset.key ||
          productCard?.querySelector("[data-key]")?.dataset.key ||
          actionTarget.dataset.key;

        const mediaSrc = actionTarget.dataset.previewSrc;

        openProductMediaCarousel(productKey, mediaSrc);
      }
      
      if (action === "proof-preview") {
  event.preventDefault();
  event.stopPropagation();
  
  const proofButtons = Array.from(document.querySelectorAll('[data-action="proof-preview"]'))
    .filter(button => button === actionTarget || button.getClientRects().length > 0);
  
  currentPreviewItems = proofButtons.map(button => ({
    type: "image",
    src: button.dataset.previewSrc,
    title: button.dataset.title || "Proof Preview",
    fallback: button.dataset.previewSrc
  })).filter(item => item.src);
  
  const startSrc = actionTarget.dataset.previewSrc;
  const startIndex = currentPreviewItems.findIndex(item => item.src === startSrc);
  
  currentPreviewIndex = startIndex >= 0 ? startIndex : 0;
  
  openPreviewItemByIndex(currentPreviewIndex);
}

      if(action === "share-product"){
        event.preventDefault();
        event.stopPropagation();
        shareProduct(actionTarget.dataset.key);
      }

      if(action === "scroll-top"){
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }

      if(action === "detail"){
        if(actionTarget.closest("#pc-analyzer-modal")){
          closePcAnalyzer();
        }
        openProductDetails(actionTarget.dataset.key);
      }

      if(action === "faq-toggle"){
        toggleFaq(actionTarget);
      }

      if(action === "scroll-products"){
        document.getElementById("productGrid")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      if(action === "scroll-custom-os"){
        document.getElementById("customOsDrop")?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      if(action === "scroll-vouches"){
        document.querySelector(".vouch-proof-hub")?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      if(action === "run-pc-analyzer"){
        runPcAnalyzer();
      }

      if(action === "analyzer-mode"){
        analyzerMode = actionTarget.dataset.mode || "gaming";
        updatePcAnalyzerModeButtons();
        if(analyzerHasRun){
          runPcAnalyzer();
        }else{
          renderAnalyzerReadyState();
        }
      }

      if(action === "download-pc-report"){
        downloadAnalyzerReport();
      }

      if(action === "copy-pc-report"){
        copyAnalyzerReport();
      }

      if(action === "analyzer-tweak"){
        const index = Number(actionTarget.dataset.tweakIndex || 0);
        const tweak = currentAnalyzerResult?.tweaks?.[index];

        if(tweak){
          showToast(`<strong>${escapeHtml(tweak.title)}</strong><br>${escapeHtml(tweak.detail)}`);
        }
      }

      if(action === "scroll-bundle"){
        document.querySelector(".bundle-card")?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      if(action === "add-bundle"){
        addBundleToCart();
      }

      if(action === "cart-bundle"){
        addBundleToCart();
        openCart();
      }

      if(action === "buy-bundle"){
        buyBundle(actionTarget);
      }

      if(action === "add"){
        addToCart(actionTarget.dataset.key);
      }

      if(action === "buy"){
        buyNow(actionTarget.dataset.key, actionTarget);
      }
      
      if (action === "checkout") {
  checkout(actionTarget);
}

      if(action === "remove"){
        removeFromCart(actionTarget.dataset.key);
      }

      if(action === "copy-discord"){
        openDiscordServer();
      }

      if(action === "legal"){
        openLegal(actionTarget.dataset.legal);
      }
    });

    document.getElementById("cartToggle")?.addEventListener("click", openCart);
    document.getElementById("drawerClose")?.addEventListener("click", closeCart);
    document.getElementById("drawerBackdrop")?.addEventListener("click", closeCart);

    document.getElementById("checkoutBtn")?.addEventListener("click", event => checkout(event.currentTarget));
    document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);

    document.getElementById("searchToggle")?.addEventListener("click", toggleSearch);

    document.getElementById("searchInput")?.addEventListener("input", event => {
      filterProducts(event.target.value);
    });

    document.getElementById("menuBtn")?.addEventListener("click", () => {
      openLegal("faq");
    });

    document.getElementById("shareBtn")?.addEventListener("click", shareApp);

    document.getElementById("installTestBtn")?.addEventListener("click", () => {
      localStorage.removeItem(INSTALL_POPUP_KEY);
      showInstallPopup(true);
    });

    document.getElementById("media-modal")?.addEventListener("click", event => {
      if(event.target.id === "media-modal"){
        closeModal();
      }
    });

    document.getElementById("legal-modal")?.addEventListener("click", event => {
      if(event.target.id === "legal-modal"){
        closeLegal();
      }
    });

    document.getElementById("pc-analyzer-modal")?.addEventListener("click", event => {
      if(event.target.id === "pc-analyzer-modal"){
        closePcAnalyzer();
      }
    });

    document.getElementById("detail-modal")?.addEventListener("click", event => {
      if(event.target.id === "detail-modal"){
        closeProductDetails();
      }
    });

    document.getElementById("modalClose")?.addEventListener("click", closeModal);
    document.getElementById("legalClose")?.addEventListener("click", closeLegal);
    document.getElementById("detailClose")?.addEventListener("click", closeProductDetails);
    document.getElementById("pcAnalyzerClose")?.addEventListener("click", closePcAnalyzer);

    document.getElementById("detailAddBtn")?.addEventListener("click", event => {
      addToCart(event.currentTarget.dataset.key);
    });

    document.getElementById("detailBuyBtn")?.addEventListener("click", event => {
      buyNow(event.currentTarget.dataset.key, event.currentTarget);
    });

    document.getElementById("installCloseBtn")?.addEventListener("click", closeInstallPopup);
    document.getElementById("installLaterBtn")?.addEventListener("click", closeInstallPopup);
    document.getElementById("installCopyBtn")?.addEventListener("click", copyInstallName);

    document.getElementById("installAppPopup")?.addEventListener("click", event => {
      if(event.target.id === "installAppPopup"){
        closeInstallPopup();
      }
    });

    document.addEventListener("keydown", event => {
      if(event.key === "Escape"){
        closeModal();
        closeLegal();
        closeProductDetails();
        closePcAnalyzer();
        closeCart();
        closeInstallPopup();
      }
    });

    setupSupportWidget();
  }

  function createGalaxy(canvasId, options = {}){
    const canvas = document.getElementById(canvasId);

    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let particles = [];
    let raf = null;

    const particleCount = options.count || 110;
    const speed = options.speed || .22;
    const glow = options.glow || 11;
    const colors = options.colors || [
      "rgba(36,255,36,.78)",
      "rgba(162,12,255,.76)",
      "rgba(255,255,255,.55)"
    ];

    function resize(){
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      seed();
    }

    function seed(){
      particles = Array.from({ length: particleCount }, () => makeParticle(true));
    }

    function makeParticle(randomY){
      const radius = Math.random() * 1.8 + .45;

      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 20,
        radius,
        vx: (Math.random() - .5) * speed,
        vy: -(Math.random() * speed + .08),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * .65 + .25,
        pulse: Math.random() * Math.PI * 2
      };
    }

    function drawNebula(time){
      const cx = width * .5 + Math.sin(time * .00012) * 90;
      const cy = height * .48 + Math.cos(time * .00010) * 70;

      const purple = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * .62);
      purple.addColorStop(0, "rgba(162,12,255,.15)");
      purple.addColorStop(.42, "rgba(162,12,255,.055)");
      purple.addColorStop(1, "rgba(162,12,255,0)");
      ctx.fillStyle = purple;
      ctx.fillRect(0, 0, width, height);

      const green = ctx.createRadialGradient(width * .23, height * .78, 0, width * .23, height * .78, Math.max(width, height) * .55);
      green.addColorStop(0, "rgba(36,255,36,.115)");
      green.addColorStop(.44, "rgba(36,255,36,.04)");
      green.addColorStop(1, "rgba(36,255,36,0)");
      ctx.fillStyle = green;
      ctx.fillRect(0, 0, width, height);
    }

    function drawConnections(){
      for(let i = 0; i < particles.length; i++){
        for(let j = i + 1; j < particles.length; j++){
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if(dist < 92){
            ctx.globalAlpha = (1 - dist / 92) * .16;
            ctx.strokeStyle = "rgba(255,255,255,.45)";
            ctx.lineWidth = .7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    }

    function draw(time){
      ctx.clearRect(0, 0, width, height);
      drawNebula(time);

      for(const particle of particles){
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += .016;

        if(particle.y < -20 || particle.x < -20 || particle.x > width + 20){
          Object.assign(particle, makeParticle(false));
        }

        const pulseAlpha = particle.alpha + Math.sin(particle.pulse) * .15;

        ctx.save();
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = glow;
        ctx.globalAlpha = Math.max(.12, pulseAlpha);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawConnections();

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  function createEmxRain(){
    const canvas = document.getElementById("emxRainCanvas");
    if(!canvas) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if(reducedMotion) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let drops = [];
    let raf = null;

    const isSmallScreen = window.matchMedia?.("(max-width: 520px)")?.matches;
    const isLite = document.body.classList.contains("performance-lite");
    const count = isLite ? (isSmallScreen ? 16 : 28) : (isSmallScreen ? 34 : 76);
    const colors = [
      "rgba(36,255,36,.74)",
      "rgba(162,12,255,.70)",
      "rgba(255,255,255,.34)"
    ];

    function makeDrop(randomY = true){
      const length = 18 + Math.random() * 44;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -length - Math.random() * 80,
        length,
        speed: .42 + Math.random() * 1.05,
        drift: (Math.random() - .5) * .16,
        alpha: .14 + Math.random() * .42,
        lineWidth: .7 + Math.random() * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    function resize(){
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drops = Array.from({ length: count }, () => makeDrop(true));
    }

    function draw(){
      ctx.clearRect(0, 0, width, height);

      for(const drop of drops){
        drop.y += drop.speed;
        drop.x += drop.drift;

        if(drop.y > height + drop.length || drop.x < -40 || drop.x > width + 40){
          Object.assign(drop, makeDrop(false));
        }

        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(.35, drop.color);
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.save();
        ctx.globalAlpha = drop.alpha;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = drop.lineWidth;
        ctx.shadowColor = drop.color;
        ctx.shadowBlur = 9;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.drift * 22, drop.y + drop.length);
        ctx.stroke();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    document.addEventListener("visibilitychange", () => {
      if(document.hidden && raf){
        cancelAnimationFrame(raf);
        raf = null;
      }else if(!document.hidden && !raf){
        raf = requestAnimationFrame(draw);
      }
    });
  }

  function setupProductCardPolish(){
    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    if(isTouchDevice) return;

    document.addEventListener("mousemove", event => {
      const card = event.target.closest(".product-card");

      document.querySelectorAll(".product-card.card-hovered").forEach(activeCard => {
        if(activeCard !== card){
          activeCard.classList.remove("card-hovered");
          activeCard.style.transform = "";
        }
      });

      if(!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.classList.add("card-hovered");
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    document.addEventListener("mouseout", event => {
      const card = event.target.closest(".product-card");

      if(card && !card.contains(event.relatedTarget)){
        card.classList.remove("card-hovered");
        card.style.transform = "";
      }
    });
  }

  function setupProCommandDock(){
    document.querySelectorAll("[data-dock-action]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.dockAction;

        button.classList.remove("dock-pulse");
        void button.offsetWidth;
        button.classList.add("dock-pulse");

        if(button.matches("a[href]")){
          return;
        }

        if(action === "top"){
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }

        if(action === "products"){
          document.getElementById("productGrid")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }

        if(action === "custom-os"){
          document.getElementById("customOsDrop")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }

        if(action === "bundle"){
          document.querySelector(".bundle-card")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }

        if(action === "faq"){
          openLegal("faq");
        }

        if(action === "install"){
          localStorage.removeItem(INSTALL_POPUP_KEY);
          showInstallPopup(true);
        }
      });
    });
  }

  function setupProductPowerMeters(){
    const productStats = {
      windows_tweak_dashboard: [
        { label: "Safe Reversibility", value: 96 },
        { label: "Game Readiness", value: 94 },
        { label: "Restore Tools", value: 97 },
        { label: "Ease Of Use", value: 93 }
      ],
      macro: [
        { label: "Undetectable", value: 100 },
        { label: "Macro Count", value: 98 },
        { label: "Keybind Setup", value: 99 },
        { label: "Speed & Latency", value: 99 }
      ],
      custom_os: [
        { label: "Smart Scan", value: 96 },
        { label: "Safe Defaults", value: 98 },
        { label: "Game Readiness", value: 94 },
        { label: "Update Support", value: 95 }
      ],
      fps: [
        { label: "Game Smoothness", value: 92 },
        { label: "Background Reduction", value: 90 },
        { label: "FPS Gain", value: 90 },
        { label: "Lightweight Setup", value: 94 }
      ]
    };

    document.querySelectorAll(".product-card").forEach(card => {
      const buyButton = card.querySelector('[data-action="buy"]');
      const key = buyButton?.dataset.key;
      const product = getStoreProducts().find(item => item.key === key);

      if(!product) return;
      if(card.querySelector(".power-meter-panel")) return;

      const stats = productStats[product.id] || [
        { label: "Setup", value: 90 },
        { label: "Performance", value: 90 },
        { label: "Ease Of Use", value: 90 },
        { label: "Support", value: 90 }
      ];

      const panel = document.createElement("div");
      panel.className = "power-meter-panel";

      panel.innerHTML = `
        <div class="power-meter-head">
          <span>EMX Power Readout</span>
          <strong>${escapeHtml(product.eyebrow)}</strong>
        </div>

        <div class="power-meter-grid">
          ${stats.map(stat => `
            <div class="power-meter-row">
              <div class="power-meter-label">
                <span>${escapeHtml(stat.label)}</span>
                <strong>${stat.value}%</strong>
              </div>

              <div class="power-meter-track">
                <i style="--power:${stat.value}%;"></i>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      const checklist = card.querySelector(".feature-checklist");

      if(checklist){
        checklist.insertAdjacentElement("afterend", panel);
      }
    });
  }

  function setupTapParticles(){
    if(document.getElementById("tapParticleLayer")) return;

    const particleLayer = document.createElement("div");
    particleLayer.id = "tapParticleLayer";
    document.body.appendChild(particleLayer);

    function createParticle(x, y, burstIndex){
      const particle = document.createElement("span");

      const angle = Math.random() * Math.PI * 2;
      const distance = 24 + Math.random() * 46;
      const size = 4 + Math.random() * 7;

      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;

      particle.className = "tap-particle";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.setProperty("--tx", moveX + "px");
      particle.style.setProperty("--ty", moveY + "px");
      particle.style.setProperty("--delay", burstIndex * 12 + "ms");

      if(Math.random() > 0.55){
        particle.classList.add("purple");
      }

      if(Math.random() > 0.72){
        particle.classList.add("white");
      }

      particleLayer.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 900);
    }

    function createRing(x, y){
      const ring = document.createElement("span");
      ring.className = "tap-ring";
      ring.style.left = x + "px";
      ring.style.top = y + "px";

      particleLayer.appendChild(ring);

      setTimeout(() => {
        ring.remove();
      }, 650);
    }

    function burst(event){
      const target = event.target.closest(
        "button, a, .play-click, .product-card, .support-action, .bundle-preview-card, .trust-pill, .vouch-card"
      );

      if(!target) return;

      const point = event.touches && event.touches[0] ? event.touches[0] : event;
      const x = point.clientX;
      const y = point.clientY;

      createRing(x, y);

      for(let i = 0; i < 18; i++){
        createParticle(x, y, i);
      }
    }

    document.addEventListener("pointerdown", burst, { passive: true });
  }

  function setupScrollRevealGlow(){
    const revealSelectors = [
      ".hero-card",
      ".trust-pill",
      ".section-head",
      ".product-card",
      ".bundle-card",
      ".proof-card",
      ".trust-metric",
      ".vouch-card",
      ".vouch-discord-card",
      ".faq-row",
      ".legal-card"
    ];

    const revealItems = document.querySelectorAll(revealSelectors.join(","));

    revealItems.forEach((item, index) => {
      item.classList.add("emx-reveal");
      item.style.setProperty("--reveal-delay", Math.min(index * 35, 280) + "ms");
    });

    if(!("IntersectionObserver" in window)){
      revealItems.forEach(item => item.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    });

    revealItems.forEach(item => observer.observe(item));
  }

  let currentPreviewIndex = 0;
  let currentPreviewItems = [];
  let previewReelTimer = null;

  function stopPreviewPhotoReel(){
    if(previewReelTimer){
      clearInterval(previewReelTimer);
      previewReelTimer = null;
    }

    document.getElementById("media-modal")?.classList.remove("preview-reel-open");
  }

  function startPreviewPhotoReel(){
    stopPreviewPhotoReel();

    const modal = document.getElementById("media-modal");
    const imageItems = currentPreviewItems.filter(item => item.type !== "video");

    if(!modal || imageItems.length < 2) return;

    modal.classList.add("preview-reel-open");

    previewReelTimer = setInterval(() => {
      if(!modal.classList.contains("show")){
        stopPreviewPhotoReel();
        return;
      }

      openPreviewItemByIndex(currentPreviewIndex + 1);
    }, 2600);
  }

  function getProductMediaItems(product){
    if(!product) return [];

    const items = [];

    if(product.previewSrc){
      items.push({
        type: product.previewType || "image",
        src: product.previewSrc,
        title: product.title || "Product Preview",
        fallback: product.fallbackPreview || product.image || "",
        productKey: product.key || "",
        productId: product.id || "",
        price: product.price || 0
      });
    }else if(product.image){
      items.push({
        type: "image",
        src: product.image,
        title: product.title || "Product Preview",
        fallback: product.image || "",
        productKey: product.key || "",
        productId: product.id || "",
        price: product.price || 0
      });
    }

    if(Array.isArray(product.gallery)){
      product.gallery.forEach(src => {
        if(!src) return;

        const alreadyAdded = items.some(item => item.src === src);
        if(alreadyAdded) return;

        items.push({
          type: "image",
          src,
          title: product.title || "Product Preview",
          fallback: product.image || "",
          productKey: product.key || "",
          productId: product.id || "",
          price: product.price || 0
        });
      });
    }

    return items;
  }

  function openProductMediaCarousel(productKey, startSrc){
    const product = PRODUCTS.find(item => item.key === productKey);

    if(!product){
      openPreview("image", startSrc || "", "Product Preview", "");
      return;
    }

    currentPreviewItems = getProductMediaItems(product);

    if(!currentPreviewItems.length) return;

    const startIndex = currentPreviewItems.findIndex(item => item.src === startSrc);
    currentPreviewIndex = startIndex >= 0 ? startIndex : 0;

    openPreviewItemByIndex(currentPreviewIndex);
    startPreviewPhotoReel();
  }

  function openPreviewItemByIndex(index){
    if(!currentPreviewItems.length) return;

    if(index < 0){
      index = currentPreviewItems.length - 1;
    }

    if(index >= currentPreviewItems.length){
      index = 0;
    }

    currentPreviewIndex = index;

    const item = currentPreviewItems[currentPreviewIndex];

    openPreview(
      item.type,
      item.src,
      item.title,
      item.fallback
    );

    updatePreviewControls();
  }

  function updatePreviewControls(){
    const counter = document.getElementById("previewCounter");
    const title = document.getElementById("modalTitle");
    const actions = document.getElementById("previewModalActions");
    const addBtn = document.getElementById("previewAddBtn");
    const buyBtn = document.getElementById("previewBuyBtn");
    const typeLabel = document.getElementById("previewTypeLabel");

    const item = currentPreviewItems[currentPreviewIndex];

    if(counter){
      counter.textContent = currentPreviewItems.length
        ? `${currentPreviewIndex + 1} / ${currentPreviewItems.length}`
        : "";
    }

    if(title && item){
      title.textContent = item.title || "Product Preview";
    }

    if(typeLabel && item){
      typeLabel.textContent = item.type === "video" ? "Video Preview" : "Image Preview";
    }

    const canBuy = Boolean(item?.productKey && item.productId !== "bundle");

    if(actions){
      actions.classList.toggle("hidden", !canBuy);
    }

    if(addBtn){
      addBtn.dataset.key = item?.productKey || "";
    }

    if(buyBtn){
      buyBtn.dataset.key = item?.productKey || "";
    }
  }

  function setupPreviewUpgrade(){
    const modal = document.getElementById("media-modal");

    if(!modal) return;

    if(!document.getElementById("previewPrevBtn")){
      const prevBtn = document.createElement("button");
      prevBtn.id = "previewPrevBtn";
      prevBtn.className = "preview-nav-btn preview-prev play-click";
      prevBtn.type = "button";
      prevBtn.setAttribute("aria-label", "Previous preview");
      prevBtn.innerHTML = "‹";

      const nextBtn = document.createElement("button");
      nextBtn.id = "previewNextBtn";
      nextBtn.className = "preview-nav-btn preview-next play-click";
      nextBtn.type = "button";
      nextBtn.setAttribute("aria-label", "Next preview");
      nextBtn.innerHTML = "›";

      const counter = document.createElement("div");
      counter.id = "previewCounter";
      counter.className = "preview-counter";
      counter.textContent = "";

      modal.appendChild(prevBtn);
      modal.appendChild(nextBtn);
      modal.querySelector(".preview-modal-head")?.appendChild(counter) || modal.appendChild(counter);

      document.getElementById("previewAddBtn")?.addEventListener("click", event => {
        event.stopPropagation();
        const key = event.currentTarget.dataset.key;
        if(key) addToCart(key);
      });

      document.getElementById("previewBuyBtn")?.addEventListener("click", event => {
        event.stopPropagation();
        const key = event.currentTarget.dataset.key;
        if(key) buyNow(key, event.currentTarget);
      });

      prevBtn.addEventListener("click", event => {
        event.stopPropagation();
        openPreviewItemByIndex(currentPreviewIndex - 1);
      });

      nextBtn.addEventListener("click", event => {
        event.stopPropagation();
        openPreviewItemByIndex(currentPreviewIndex + 1);
      });
    }

    document.addEventListener("keydown", event => {
      const isPreviewOpen = modal.classList.contains("show");

      if(!isPreviewOpen) return;

      if(event.key === "ArrowLeft"){
        openPreviewItemByIndex(currentPreviewIndex - 1);
      }

      if(event.key === "ArrowRight"){
        openPreviewItemByIndex(currentPreviewIndex + 1);
      }
    });
  }

  function resetEmxPayhipButtonsOnly() {
  window.__emxCheckoutLocked = false;
  
  document.querySelectorAll(".payhip-loading, .btn-loading").forEach(button => {
    button.classList.remove("payhip-loading");
    button.classList.remove("btn-loading");
    button.disabled = false;
    
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  });
  
  const payOverlay = document.getElementById("emxPayLoading");
  const payBar = document.getElementById("emxPayBarFill");
  const payStatus = document.getElementById("emxPayStatus");
  
  if (payOverlay) {
    payOverlay.classList.remove("show");
    payOverlay.classList.remove("exit");
  }
  
  if (payBar) {
    payBar.style.width = "0%";
  }
  
  if (payStatus) {
    payStatus.textContent = "Encrypting checkout session...";
  }
  
  unlockBodyIfSafe();
}

  document.addEventListener("visibilitychange", () => {
    if(!document.hidden){
      resetEmxPayhipButtonsOnly();
    }
  });

  async function initStore(){
    applyPerformanceMode();
    await loadProductsFromApi();
    syncReferralFromUrl();
    setupAffiliateNav();
    renderSupportingCreatorBanner();
    renderAutoKeyGuide();

    renderProducts();
    renderBundleFromAdmin();
    preloadPreviewVideos();
    updateCartUI();
    setupEvents();
    setupProCommandDock();
    setupProductPowerMeters();
    setupProductCardPolish();
    setupTapParticles();
    setupScrollRevealGlow();
    setupPreviewUpgrade();
    setupAffiliateGenerator();
    setupLicenseLookup();

    createGalaxy("galaxyCanvas", {
      count: document.body.classList.contains("performance-lite") ? 58 : 118,
      speed: document.body.classList.contains("performance-lite") ? .16 : .23,
      glow: document.body.classList.contains("performance-lite") ? 7 : 12
    });
    
    createEmxRain();

    createGalaxy("bootGalaxy", {
      count: 92,
      speed: .18,
      glow: 15
    });

    createGalaxy("launchGalaxy", {
      count: 96,
      speed: .20,
      glow: 15
    });

    createGalaxy("payLoadingGalaxy", {
      count: 90,
      speed: .19,
      glow: 15
    });

    if(document.body.classList.contains("emx-subpage-analyzer")){
      renderAnalyzerReadyState();
      forceClearIntroOverlays();
    }else if(document.body.className.includes("emx-subpage-")){
      forceClearIntroOverlays();
    }else{
      scheduleAutoIntro();
    }
  }

  initStore();
});
