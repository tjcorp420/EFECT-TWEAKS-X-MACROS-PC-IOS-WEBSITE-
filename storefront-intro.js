(() => {
  "use strict";

  const INTRO_LIMIT = 4;
  const MIN_SEQUENCE_MS = 17000;
  const MAX_SEQUENCE_MS = 26000;
  const BRAND_SCENE_MS = 2800;
  const FINALE_SCENE_MS = 3100;
  const SCENE_OVERLAP_MS = 420;
  const LEGACY_INTRO_IDS = new Set(["optimizer"]);
  const LEGACY_INTRO_ASSETS =
    /(?:^|\/)(?:optimizer(?:\d+)?|zero-delay-optimizer)(?:[-_.]|$)/i;
  const IMAGE_OVERRIDES = Object.freeze({
    custom_os: {
      src: "./assets/emx-os/emx-os-v1320-home-960.webp",
      srcset:
        "./assets/emx-os/emx-os-v1320-home-640.webp 640w, ./assets/emx-os/emx-os-v1320-home-960.webp 960w",
    },
    windows_tweak_dashboard: {
      src: "./app-screenshots/emx-windows-tweak-dashboard-01-overview-960.webp",
      srcset:
        "./app-screenshots/emx-windows-tweak-dashboard-01-overview-640.webp 640w, ./app-screenshots/emx-windows-tweak-dashboard-01-overview-960.webp 960w",
    },
    clips: {
      src: "./assets/emx-clips/emx-clips-ready-960.webp",
      srcset:
        "./assets/emx-clips/emx-clips-ready-640.webp 640w, ./assets/emx-clips/emx-clips-ready-960.webp 960w",
    },
    volt: {
      src: "./app-screenshots/volt-current/dashboard-960.webp",
      srcset:
        "./app-screenshots/volt-current/dashboard-640.webp 640w, ./app-screenshots/volt-current/dashboard-960.webp 960w",
    },
  });

  const internal = (() => {
    try {
      return (
        document.referrer &&
        new URL(document.referrer).origin === location.origin
      );
    } catch (error) {
      return false;
    }
  })();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forceReplay = new URLSearchParams(location.search).get("intro") === "1";
  const navigation = performance.getEntriesByType?.("navigation")?.[0];
  const deliberateReload = navigation?.type === "reload";

  async function loadJson(url, fallback) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (error) {
      return fallback;
    }
  }

  function eligible(settings) {
    if (!settings.introEnabled || settings.replayMode === "never") return false;
    if (forceReplay) return true;
    if (deliberateReload) return true;
    if (reduced) return false;
    if (internal) return false;
    if (settings.replayMode === "always") return true;
    const key =
      settings.replayMode === "hours" ? "emx_intro_last" : "emx_intro_session";
    const storage =
      settings.replayMode === "hours" ? localStorage : sessionStorage;
    const last = Number(storage.getItem(key) || 0);
    return (
      !last ||
      (settings.replayMode === "hours" &&
        Date.now() - last > settings.replayHours * 3600000)
    );
  }

  function remember(settings) {
    if (forceReplay) return;
    try {
      const storage =
        settings.replayMode === "hours" ? localStorage : sessionStorage;
      const key =
        settings.replayMode === "hours"
          ? "emx_intro_last"
          : "emx_intro_session";
      storage.setItem(key, String(Date.now()));
    } catch (error) {}
  }

  function clean(value, fallback = "") {
    return String(value || fallback)
      .replace(/[<>]/g, "")
      .trim();
  }

  function escapeHtml(value, fallback = "") {
    return clean(value, fallback)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cleanAsset(value) {
    return String(value || "")
      .replace(/["<>]/g, "")
      .trim();
  }

  function productImage(product) {
    const override = IMAGE_OVERRIDES[product.id];
    if (override) return override;
    const gallery = Array.isArray(product.gallery) ? product.gallery : [];
    const candidates = [product.previewSrc, product.image, ...gallery];
    return {
      src: cleanAsset(
        candidates.find(
          (candidate) =>
            candidate && !LEGACY_INTRO_ASSETS.test(String(candidate)),
        ) || "emx-logo-v2.png",
      ),
      srcset: "",
    };
  }

  function productPrice(product) {
    const price = Number(product.price || 0);
    if (!price) return "FREE";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  function selectProducts(catalog) {
    return (Array.isArray(catalog) ? catalog : [])
      .filter((product) => product.visible !== false)
      .filter(
        (product) =>
          product.publishStatus !== "draft" &&
          product.publishStatus !== "archived",
      )
      .filter((product) => product.showInIntro !== false)
      .filter(
        (product) =>
          !LEGACY_INTRO_IDS.has(String(product.id || "").toLowerCase()),
      )
      .filter(
        (product) =>
          !LEGACY_INTRO_ASSETS.test(
            String(product.previewSrc || product.image || ""),
          ),
      )
      .sort((a, b) => Number(a.introOrder || 99) - Number(b.introOrder || 99))
      .slice(0, INTRO_LIMIT);
  }

  function sequenceTiming(settings, productCount) {
    const requested = Number(settings.introDurationMs || MIN_SEQUENCE_MS);
    const total = Math.min(
      MAX_SEQUENCE_MS,
      Math.max(MIN_SEQUENCE_MS, requested),
    );
    const productWindow =
      total - BRAND_SCENE_MS - FINALE_SCENE_MS + SCENE_OVERLAP_MS * 2;
    const slot = Math.max(
      2550,
      Math.floor(productWindow / Math.max(1, productCount)),
    );
    const productDuration = slot + SCENE_OVERLAP_MS;
    const firstProductDelay = BRAND_SCENE_MS - SCENE_OVERLAP_MS;
    const finaleDelay =
      firstProductDelay + slot * productCount - SCENE_OVERLAP_MS;
    const actualTotal = finaleDelay + FINALE_SCENE_MS;
    return {
      actualTotal,
      finaleDelay,
      firstProductDelay,
      productDuration,
      slot,
    };
  }

  function productMarkup(product, index, count, timing) {
    const delay = timing.firstProductDelay + timing.slot * index;
    const label = escapeHtml(
      product.category || product.eyebrow,
      "EMX SOFTWARE",
    );
    const title = escapeHtml(product.title, "EMX Product");
    const version = escapeHtml(product.version, "Current release");
    const preview = productImage(product);
    const srcset = preview.srcset
      ? ` srcset="${cleanAsset(preview.srcset)}" sizes="(max-width:700px) calc(100vw - 52px), min(1050px, calc(100vw - 110px))"`
      : "";
    return `<article class="cinematic-product" style="--scene-delay:${delay}ms;--scene-duration:${timing.productDuration}ms" aria-label="${title}">
      <header class="cinematic-product-head">
        <span>EMX / ${String(index + 1).padStart(2, "0")}</span>
        <small>${label}</small>
        <b>${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}</b>
      </header>
      <div class="cinematic-product-frame">
        <img src="${cleanAsset(preview.src)}"${srcset} alt="${title} application preview" decoding="async" fetchpriority="high">
      </div>
      <footer class="cinematic-product-meta">
        <div><small>${version}</small><strong>${title}</strong></div>
        <span>${productPrice(product)}</span>
      </footer>
    </article>`;
  }

  async function run() {
    const fallbackSettings = {
      introEnabled: true,
      introDurationMs: MIN_SEQUENCE_MS,
      replayMode: "session",
      replayHours: 24,
      allowSkip: true,
      tagline: "ENGINEERED FOR YOUR SETUP",
      animationIntensity: "balanced",
    };
    const [settingsResponse, catalogResponse] = await Promise.all([
      loadJson("/api/site-settings", { settings: fallbackSettings }),
      loadJson("/api/products", window.EMX_PRODUCTS || []),
    ]);
    const settings = settingsResponse.settings || settingsResponse;
    if (!eligible(settings)) return;
    const products = selectProducts(catalogResponse);
    if (!products.length) return;

    const timing = sequenceTiming(settings, products.length);
    remember(settings);
    const intro = document.createElement("div");
    intro.className = `emx-cinematic intensity-${settings.animationIntensity || "balanced"}${forceReplay || deliberateReload ? " force-motion" : ""}`;
    intro.setAttribute("role", "dialog");
    intro.setAttribute("aria-modal", "true");
    intro.setAttribute("aria-label", "EMX product introduction");
    intro.style.setProperty("--intro-duration", `${timing.actualTotal}ms`);
    intro.style.setProperty("--finale-delay", `${timing.finaleDelay}ms`);
    intro.innerHTML = `
      <div class="cinematic-backdrop" aria-hidden="true"><i></i><i></i></div>
      <button class="cinematic-skip" type="button" ${settings.allowSkip === false ? "hidden" : ""}>Skip intro <span>↗</span></button>
      <section class="cinematic-brand" aria-label="EMX Tweaks">
        <span class="cinematic-kicker">EMX SOFTWARE ECOSYSTEM</span>
        <img src="emx-logo-v2.png" alt="" width="500" height="500">
        <strong>EMX TWEAKS</strong>
        <small>${escapeHtml(settings.tagline, "ENGINEERED FOR YOUR SETUP")}</small>
      </section>
      <div class="cinematic-products">${products.map((product, index) => productMarkup(product, index, products.length, timing)).join("")}</div>
      <section class="cinematic-finale" aria-label="Build your EMX setup">
        <span class="cinematic-kicker">THE EMX COLLECTION</span>
        <img src="emx-logo-v2.png" alt="" width="500" height="500">
        <strong>BUILT FOR YOUR SETUP.</strong>
        <small>Real software <i></i> Clear requirements <i></i> Direct support</small>
      </section>
      <div class="cinematic-progress" aria-hidden="true"><i></i></div>`;

    const previousFocus = document.activeElement;
    document.body.appendChild(intro);
    document.documentElement.classList.add("intro-active");
    requestAnimationFrame(() => {
      intro.classList.add("play");
      intro.querySelector(".cinematic-skip")?.focus({ preventScroll: true });
    });

    let finished = false;
    let finishTimer;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(finishTimer);
      document.removeEventListener("keydown", onKeydown);
      intro.classList.add("exit");
      document.documentElement.classList.remove("intro-active");
      window.setTimeout(() => {
        intro.remove();
        if (previousFocus instanceof HTMLElement)
          previousFocus.focus({ preventScroll: true });
      }, 700);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape" && settings.allowSkip !== false) finish();
    };
    intro.querySelector(".cinematic-skip")?.addEventListener("click", finish);
    document.addEventListener("keydown", onKeydown);
    finishTimer = window.setTimeout(finish, timing.actualTotal);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
