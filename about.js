(() => {
  "use strict";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = Array.from(document.querySelectorAll(".reveal"));

  // Scroll reveal — staggered, one-shot. Falls back to visible without JS/observer.
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            const sibs = Array.from(el.parentElement ? el.parentElement.children : [el]).filter((n) => n.classList.contains("reveal"));
            const i = Math.max(0, sibs.indexOf(el));
            el.style.transitionDelay = Math.min(i * 70, 350) + "ms";
            el.classList.add("in");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // Hero screenshot: subtle pointer tilt (fine-pointer devices only, motion allowed).
  const hero = document.querySelector(".about-hero-visual");
  if (hero && !reduce && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const MAX = 5; // degrees
    let raf = 0;
    const onMove = (ev) => {
      const r = hero.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        hero.style.transform =
          "perspective(900px) rotateX(" + (-py * MAX).toFixed(2) + "deg) rotateY(" + (px * MAX).toFixed(2) + "deg) translateY(-4px)";
      });
    };
    const reset = () => {
      if (raf) cancelAnimationFrame(raf);
      hero.style.transform = "";
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", reset);
    hero.addEventListener("blur", reset, true);
  }
})();
