(() => {
  "use strict";
  // Progressive depth for the EMX showroom homepage. Content and controls are
  // complete without this file; it only adds pointer/scroll depth and reveals.
  const root = document.documentElement;
  const hero = document.querySelector("[data-showroom]");
  const header = document.querySelector("[data-site-header]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const syncHeader = () =>
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  if (reduceMotion) return;
  root.classList.add("showroom-motion");

  const revealed = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0 },
    );
    revealed.forEach((node) => observer.observe(node));
    // Anchored arrivals (for example #marketplaces) must never land on hidden content.
    addEventListener("hashchange", () =>
      document
        .getElementById(decodeURIComponent(location.hash.slice(1)))
        ?.closest("[data-reveal]")
        ?.classList.add("is-revealed"),
    );
  } else {
    revealed.forEach((node) => node.classList.add("is-revealed"));
  }

  if (hero) {
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let inView = true;
    const tick = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      const scroll = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
      hero.style.setProperty("--px", x.toFixed(4));
      hero.style.setProperty("--py", y.toFixed(4));
      hero.style.setProperty("--sy", scroll.toFixed(4));
      frame =
        Math.abs(targetX - x) > 0.001 || Math.abs(targetY - y) > 0.001
          ? requestAnimationFrame(tick)
          : 0;
    };
    const schedule = () => {
      if (!frame && inView) frame = requestAnimationFrame(tick);
    };
    if (finePointer) {
      addEventListener(
        "pointermove",
        (event) => {
          targetX = (event.clientX / innerWidth) * 2 - 1;
          targetY = (event.clientY / innerHeight) * 2 - 1;
          schedule();
        },
        { passive: true },
      );
    }
    addEventListener("scroll", schedule, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        hero.classList.toggle("is-offscreen", !inView);
        if (inView) schedule();
      }).observe(hero);
    }
  }

  if (finePointer) {
    let active = null;
    const reset = (card) => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    };
    document.addEventListener(
      "pointermove",
      (event) => {
        const card = event.target.closest?.("[data-tilt]") || null;
        if (active && active !== card) reset(active);
        active = card;
        if (!card) return;
        const box = card.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        const range = card.classList.contains("store-product") ? 7 : 5;
        card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        card.style.setProperty("--ry", `${((px - 0.5) * range).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${((0.5 - py) * range).toFixed(2)}deg`);
      },
      { passive: true },
    );
    root.addEventListener("pointerleave", () => {
      if (active) reset(active);
      active = null;
    });
  }
})();
