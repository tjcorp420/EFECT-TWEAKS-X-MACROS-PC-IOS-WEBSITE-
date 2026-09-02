(() => {
  "use strict";
  const freeTrigger = document.getElementById("free-tools-trigger");
  const freePanel = document.getElementById("free-tools");
  const closeFree = document.querySelector("[data-close-free]");
  const copyDiscord = document.getElementById("copy-discord");
  const status = document.getElementById("hub-status");
  const appModal = document.getElementById("free-app-modal");
  const appTitle = document.getElementById("free-app-title");
  const appCategory = document.getElementById("free-app-category");
  const appDescription = document.getElementById("free-app-description");
  const appFeatures = document.getElementById("free-app-features");
  const appImage = document.getElementById("free-app-image");
  const appPlatform = document.getElementById("free-app-platform");
  const appAccess = document.getElementById("free-app-access");
  const appAction = document.getElementById("free-app-action");

  const freeApps = {
    clips: { title: "EMX Clips", category: "FREE CAPTURE APP", image: "assets/emx-clips/emx-clips-capture-ingame.png", platform: "Windows + NVIDIA", access: "Free activation", action: "OPEN EMX CLIPS", href: "https://clips.emxtweaks.com/", external: true, description: "Keep instant replay armed, save the moments that matter with your own hotkey, and manage finished clips from a clean local library.", features: ["Local-first replay and clip library", "NVIDIA NVENC system-audio capture", "In-game ready and saved notifications"] },
    window_deck: { title: "EMX Window Deck", category: "FREE DESKTOP UTILITY", image: "assets/free-tools/window-deck-wheel.jpg", platform: "Windows 10 / 11", access: "Free ZIP", action: "DOWNLOAD WINDOW DECK", href: "/downloads/EMX-Window-Deck_0.4.2_CUSTOMER-PACKAGE.zip", productId: "window_deck", description: "An animated command wheel for launching apps, restoring windows, opening shortcuts, and reaching desktop controls without digging through menus.", features: ["Animated app and shortcut command wheel", "Window restore and desktop controls", "Direct EMX-hosted ZIP package"] },
    aim_trainer: { title: "EMX Aim Trainer", category: "FREE TRAINING SUITE", image: "emx-aim-trainer-command-center.png", platform: "64-bit Windows", access: "Free download", action: "DOWNLOAD AIM TRAINER", href: "/download/aim-trainer", productId: "aim_trainer", description: "Train flicks, tracking, precision, and reactions with focused modules, saved local setup, and session reporting.", features: ["Flick, tracking, precision, and reaction modules", "Saved local setup and session reports", "Official EMX download route"] },
    control_hub: { title: "EMX Control Hub", category: "FREE SETUP ORGANIZER", image: "assets/free-tools/control-hub-dashboard.png", platform: "64-bit Windows", access: "Free EXE", action: "DOWNLOAD CONTROL HUB", href: "https://x1gzparfdlol2128.public.blob.vercel-storage.com/downloads/EMX-Tweaks-Control-Hub-Setup-1.0.3-x64.exe", productId: "control_hub", description: "Search, pin, and organize the launchers, shortcuts, and system tools around your setup from one clean desktop surface.", features: ["Search and pin your setup tools", "Organized launcher workspace", "Official EMX installer delivery"] },
    sprite_tracker: { title: "EMX Fortnite Sprite Tracker", category: "FREE FORTNITE TRACKER", image: "assets/free-tools/sprite-tracker-home.png", platform: "Windows", access: "Free Payhip release", action: "OPEN FREE RELEASE", href: "https://payhip.com/b/V90h5", external: true, description: "Track your Fortnite Sprite collection, mark what you own or master, add notes, and follow your progress from one focused app.", features: ["Searchable Sprite collection catalog", "Owned and mastered progress tracking", "Personal notes and optional sync features"] }
  };

  function setStatus(message) { if (status) status.textContent = message; }
  function setFreePanel(open, shouldFocus = false) {
    if (!freeTrigger || !freePanel) return;
    freePanel.hidden = !open;
    freeTrigger.setAttribute("aria-expanded", String(open));
    if (open) {
      history.replaceState(null, "", "#free-tools");
      setStatus("FREE UTILITY DROP ONLINE — SELECT A RELEASE.");
      if (shouldFocus) freePanel.querySelector("[data-free-app]")?.focus();
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      setStatus("");
      if (shouldFocus) freeTrigger.focus();
    }
  }
  async function copyText(value) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Clipboard command was unavailable.");
  }
  function openAppModal(app, trigger) {
    if (!appModal || !app || !appTitle || !appCategory || !appDescription || !appFeatures || !appImage || !appPlatform || !appAccess || !appAction) return;
    appTitle.textContent = app.title;
    appCategory.textContent = app.category;
    appDescription.textContent = app.description;
    appImage.src = app.image;
    appImage.alt = `${app.title} application preview`;
    appPlatform.textContent = app.platform;
    appAccess.textContent = app.access;
    appFeatures.replaceChildren(...app.features.map(feature => {
      const item = document.createElement("li");
      item.textContent = feature;
      return item;
    }));
    appAction.href = app.href;
    appAction.replaceChildren(document.createTextNode(app.action), Object.assign(document.createElement("span"), { textContent: "↗" }));
    delete appAction.dataset.emxDownload;
    delete appAction.dataset.productId;
    if (app.productId) {
      appAction.dataset.emxDownload = "";
      appAction.dataset.productId = app.productId;
    }
    if (app.external) {
      appAction.target = "_blank";
      appAction.rel = "noopener noreferrer";
    } else {
      appAction.removeAttribute("target");
      appAction.removeAttribute("rel");
    }
    appModal.dataset.trigger = trigger?.dataset.freeApp || "";
    appModal.showModal();
  }

  freeTrigger?.addEventListener("click", () => setFreePanel(freePanel.hidden, true));
  closeFree?.addEventListener("click", () => setFreePanel(false, true));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && freePanel && !freePanel.hidden && !appModal?.open) setFreePanel(false, true); });
  copyDiscord?.addEventListener("click", async () => {
    const handle = copyDiscord.dataset.discordHandle || "ur_not_himfr";
    try { await copyText(handle); setStatus(`COPIED — ${handle}`); copyDiscord.classList.add("is-copied"); window.setTimeout(() => copyDiscord.classList.remove("is-copied"), 1250); }
    catch { setStatus(`COPY FAILED — DISCORD: ${handle}`); }
  });
  document.querySelectorAll("[data-free-app]").forEach(trigger => {
    trigger.addEventListener("click", () => openAppModal(freeApps[trigger.dataset.freeApp], trigger));
  });
  document.querySelector("[data-close-app-modal]")?.addEventListener("click", () => appModal?.close());
  appModal?.addEventListener("click", event => { if (event.target === appModal) appModal.close(); });
  appModal?.addEventListener("close", () => document.querySelector(`[data-free-app="${appModal.dataset.trigger}"]`)?.focus());
  document.querySelectorAll(".hub-link, .hub-free-card, .hub-modal-action").forEach(control => {
    control.addEventListener("pointermove", event => {
      const bounds = control.getBoundingClientRect();
      control.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      control.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    });
    control.addEventListener("pointerleave", () => {
      control.style.removeProperty("--pointer-x");
      control.style.removeProperty("--pointer-y");
    });
  });
  if (location.hash === "#free-tools" || new URLSearchParams(location.search).get("free") === "1") setFreePanel(true);
  document.querySelector("[data-current-year]")?.replaceChildren(String(new Date().getFullYear()));
})();
