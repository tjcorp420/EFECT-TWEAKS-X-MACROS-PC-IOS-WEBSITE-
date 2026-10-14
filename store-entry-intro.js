(() => {
  "use strict";
  const overlay = document.getElementById("store-entry-intro");
  const video = document.getElementById("store-intro-video");
  const skip = document.getElementById("store-intro-skip");
  const play = document.getElementById("store-intro-play");
  const sound = document.getElementById("store-intro-sound");
  const main = document.querySelector("main");
  const header = document.querySelector("[data-site-header]");
  if (!overlay || !video || !skip || !play || !sound || !main || !header) return;
  const params = new URLSearchParams(location.search);
  const preview = params.get("intro") === "1";
  const fromBio = params.get("entry") === "bio";
  const seenKey = "emx-store-intro-seen";
  let internal = false;
  try {
    internal =
      !!document.referrer &&
      new URL(document.referrer).origin === location.origin;
  } catch {}
  let seen = false;
  try {
    seen = sessionStorage.getItem(seenKey) === "1";
  } catch {}
  // A plain homepage visit plays the intro once per browser session when it
  // arrives from outside the site; reloads and back/forward never replay it.
  const navigation = performance.getEntriesByType?.("navigation")[0]?.type;
  const freshArrival = navigation !== "reload" && navigation !== "back_forward";
  if (!preview && !fromBio && (seen || !freshArrival)) return;
  if (
    (internal && !preview) ||
    location.hash ||
    params.get("free") === "1" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  try {
    sessionStorage.setItem(seenKey, "1");
  } catch {}
  const previousFocus = document.activeElement;
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
    if (overlay.contains(document.activeElement)) {
      const returnTarget = previousFocus?.isConnected && previousFocus !== document.body
        ? previousFocus
        : header.querySelector("a");
      returnTarget?.focus({ preventScroll: true });
    }
    overlay.hidden = true;
    document.documentElement.classList.remove("store-intro-active");
  }
  function start() {
    play.hidden = true;
    video.muted = true;
    sound.setAttribute("aria-pressed", "false");
    sound.textContent = "Sound on";
    video.play().catch(() => {
      play.hidden = false;
      play.focus();
    });
  }
  skip.addEventListener("click", dismiss);
  play.addEventListener("click", start);
  sound.addEventListener("click", () => {
    video.muted = !video.muted;
    sound.setAttribute("aria-pressed", String(!video.muted));
    sound.textContent = video.muted ? "Sound on" : "Sound off";
  });
  video.addEventListener("ended", dismiss);
  video.addEventListener("error", dismiss);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismiss();
    if (event.key === "Tab") {
      event.preventDefault();
      const controls = [play, sound, skip].filter((button) => !button.hidden);
      const current = controls.indexOf(document.activeElement);
      const next = event.shiftKey ? current - 1 : current + 1;
      controls[(next + controls.length) % controls.length].focus();
    }
  });
  skip.focus({ preventScroll: true });
  timer = setTimeout(dismiss, 9000);
  start();
})();
