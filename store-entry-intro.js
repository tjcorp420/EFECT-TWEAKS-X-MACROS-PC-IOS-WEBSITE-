(() => {
  "use strict";
  // The boot intro is an animated image rather than a <video>: images always
  // animate on their own, including inside Instagram/TikTok in-app browsers
  // that refuse video autoplay or force a native full-screen player.
  const overlay = document.getElementById("store-entry-intro");
  const media = document.getElementById("store-intro-media");
  const audio = document.getElementById("store-intro-audio");
  const skip = document.getElementById("store-intro-skip");
  const sound = document.getElementById("store-intro-sound");
  const main = document.querySelector("main");
  const header = document.querySelector("[data-site-header]");
  if (!overlay || !media || !audio || !skip || !sound || !main || !header) return;
  const params = new URLSearchParams(location.search);
  const preview = params.get("intro") === "1";
  const fromBio = params.get("entry") === "bio";
  const seenKey = "emx-store-intro-seen";
  const animationMs = Number(media.dataset.duration) || 4050;
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
  let startedAt = 0;
  function arm(ms) {
    clearTimeout(timer);
    timer = setTimeout(dismiss, ms);
  }
  function dismiss() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    audio.pause();
    main.inert = false;
    header.inert = false;
    if (overlay.contains(document.activeElement)) {
      const returnTarget = previousFocus?.isConnected && previousFocus !== document.body
        ? previousFocus
        : header.querySelector("a");
      returnTarget?.focus({ preventScroll: true });
    }
    overlay.hidden = true;
    media.removeAttribute("src");
    document.documentElement.classList.remove("store-intro-active");
  }
  // The animation starts when the image finishes loading; release the store
  // when it ends, if it fails, or if it cannot load within a few seconds.
  media.addEventListener("load", () => {
    startedAt = Date.now();
    overlay.classList.add("is-playing");
    arm(animationMs + 250);
  });
  media.addEventListener("error", dismiss);
  skip.addEventListener("click", dismiss);
  sound.addEventListener("click", () => {
    const turnOn = audio.paused;
    if (turnOn) {
      // A tap is a user gesture, so in-app browsers allow this audio to play.
      try {
        audio.currentTime = startedAt ? Math.min((Date.now() - startedAt) / 1000, 3.9) : 0;
      } catch {}
      audio.play()?.catch?.(() => {});
    } else {
      audio.pause();
    }
    sound.setAttribute("aria-pressed", String(turnOn));
    sound.textContent = turnOn ? "Sound off" : "Sound on";
  });
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismiss();
    if (event.key === "Tab") {
      event.preventDefault();
      const controls = [sound, skip];
      const current = controls.indexOf(document.activeElement);
      const next = event.shiftKey ? current - 1 : current + 1;
      controls[(next + controls.length) % controls.length].focus();
    }
  });
  skip.focus({ preventScroll: true });
  arm(7000);
  media.src = media.dataset.src;
})();
