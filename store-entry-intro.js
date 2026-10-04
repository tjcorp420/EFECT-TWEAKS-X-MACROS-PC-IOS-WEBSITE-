(() => {
  "use strict";
  const overlay = document.getElementById("store-entry-intro");
  const video = document.getElementById("store-intro-video");
  const skip = document.getElementById("store-intro-skip");
  const play = document.getElementById("store-intro-play");
  if (!overlay || !video) return;
  const reload =
    performance.getEntriesByType("navigation")[0]?.type === "reload";
  let internal = false;
  try {
    internal =
      !!document.referrer &&
      new URL(document.referrer).origin === location.origin;
  } catch {}
  if (
    (internal && !reload) ||
    location.hash ||
    new URLSearchParams(location.search).get("free") === "1" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const main = document.querySelector("main");
  const header = document.querySelector("[data-site-header]");
  overlay.hidden = false;
  main.inert = true;
  header.inert = true;
  document.documentElement.classList.add("store-intro-active");
  let done = false;
  let timer;
  function dismiss() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    video.pause();
    main.inert = false;
    header.inert = false;
    if (overlay.contains(document.activeElement))
      header.querySelector("a")?.focus({ preventScroll: true });
    overlay.hidden = true;
    document.documentElement.classList.remove("store-intro-active");
  }
  function start() {
    play.hidden = true;
    video.muted = true;
    video.play().catch(() => {
      play.hidden = false;
      play.focus();
    });
  }
  skip.addEventListener("click", dismiss);
  play.addEventListener("click", start);
  video.addEventListener("ended", dismiss);
  video.addEventListener("error", dismiss);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismiss();
    if (event.key === "Tab") {
      event.preventDefault();
      if (!play.hidden && document.activeElement === skip) play.focus();
      else skip.focus();
    }
  });
  skip.focus({ preventScroll: true });
  timer = setTimeout(dismiss, 10000);
  start();
})();
