(() => {
  "use strict";

  const themeKey = "emx-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  function savedTheme() {
    try {
      const value = window.localStorage.getItem(themeKey);
      if (value === "light" || value === "dark") return value;
    } catch (_) {
      // Storage may be unavailable in hardened or private browser contexts.
    }
    return systemTheme.matches ? "light" : "dark";
  }

  function applyTheme(theme, persist = false) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    document.querySelectorAll("[data-emx-theme-toggle]").forEach(toggle => {
      const nextLabel = nextTheme === "dark" ? "Light mode" : "Dark mode";
      toggle.setAttribute("aria-label", `Switch to ${nextLabel.toLowerCase()}`);
      toggle.setAttribute("title", `Switch to ${nextLabel.toLowerCase()}`);
      toggle.setAttribute("aria-pressed", String(nextTheme === "light"));
      const icon = toggle.querySelector(".emx-theme-icon");
      const label = toggle.querySelector(".emx-theme-label");
      if (icon) icon.textContent = nextTheme === "dark" ? "☀" : "☾";
      if (label) label.textContent = nextLabel;
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = nextTheme === "light" ? "#f6f2fb" : "#090511";
    });
    if (persist) {
      try { window.localStorage.setItem(themeKey, nextTheme); } catch (_) { /* See savedTheme. */ }
    }
  }

  applyTheme(savedTheme());

  document.documentElement.classList.add("foundation-ready");

  document.addEventListener("click", event => {
    const toggle = event.target.closest("[data-emx-theme-toggle]");
    if (!toggle) return;
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true);
  });

  systemTheme.addEventListener("change", event => {
    try { if (window.localStorage.getItem(themeKey)) return; } catch (_) { /* Apply system preference. */ }
    applyTheme(event.matches ? "light" : "dark");
  });

  document.querySelectorAll("[data-emx-nav-toggle]").forEach(toggle => {
    const navId = toggle.getAttribute("aria-controls");
    const nav = navId ? document.getElementById(navId) : null;
    if (!nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", event => { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 721px)").addEventListener("change", event => { if (event.matches) setOpen(false); });
  });
})();
