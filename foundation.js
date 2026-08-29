(() => {
  "use strict";

  document.documentElement.classList.add("foundation-ready");

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
