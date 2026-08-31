(() => {
  "use strict";
  const form = document.getElementById("setupFinderForm");
  const result = document.getElementById("setupFinderResult");
  if (!form || !result) return;

  const catalog = {
    tune: { name: "EMX Windows Tweak Dashboard", label: "Recommended starting point", copy: "Start with guided Windows profiles, backups, logs, and an Undo Center before considering broader setup changes.", href: "./products.html#product-windows_tweak_dashboard", image: "app-screenshots/emx-windows-tweak-dashboard-01-overview.png", price: "$20.99" },
    macro: { name: "EMX VOLT Macro", label: "Recommended for macro control", copy: "Use the current coordinated profiles, binds, focus safety, emergency stop, and in-app setup guidance.", href: "./macros.html", image: "app-screenshots/volt-current/profiles.png", price: "$25.00" },
    capture: { name: "EMX Clips", label: "Recommended for local replay", copy: "A local-first instant replay workflow for supported Windows and NVIDIA NVENC setups. Confirm capture compatibility before access.", href: "./products.html#product-clips", image: "assets/emx-clips/emx-clips-cover.png", price: "Free" },
    train: { name: "EMX Aim Trainer", label: "Recommended free trainer", copy: "Start with the free Windows trainer for flick, tracking, precision, and reaction sessions with local reports.", href: "./aim-trainer.html", image: "emx-aim-trainer-command-center.png", price: "Free" },
    organize: { name: "EMX Window Deck", label: "Recommended free utility", copy: "Use the animated command wheel to launch apps, restore windows, open shortcuts, and reach PC controls.", href: "/downloads/EMX-Window-Deck_0.4.2_CUSTOMER-PACKAGE.zip", image: "assets/free-tools/window-deck-wheel.jpg", price: "Free" }
  };

  function loadingView() {
    result.dataset.state = "loading";
    result.innerHTML = `<div class="finder-loading"><div class="scan-core" aria-hidden="true"><i></i><i></i><b>EMX</b></div><p class="eyebrow"><span></span> MATCHING YOUR ANSWERS</p><h3>Building your starting point…</h3><ol><li class="is-active">Reading your goal</li><li>Checking current catalog paths</li><li>Preparing the recommendation</li></ol></div>`;
    const steps = [...result.querySelectorAll("li")];
    window.setTimeout(() => { steps[0]?.classList.remove("is-active"); steps[0]?.classList.add("is-done"); steps[1]?.classList.add("is-active"); }, 360);
    window.setTimeout(() => { steps[1]?.classList.remove("is-active"); steps[1]?.classList.add("is-done"); steps[2]?.classList.add("is-active"); }, 720);
  }

  function recommendation(item, values) {
    const goal = values.get("goal");
    const freeOverride = values.get("price") === "free" && !["train", "organize"].includes(goal);
    const notes = [];
    if (values.get("windows") === "older") notes.push("The current catalog is built around Windows 10/11. Confirm compatibility before downloading or buying.");
    if (values.get("windows") === "unknown") notes.push("Confirm your Windows version on the product requirements before continuing.");
    if (goal === "capture" && values.get("gpu") !== "nvidia") notes.push(values.get("gpu") === "unknown" ? "EMX Clips currently documents an NVIDIA NVENC path; confirm your GPU before access." : "This GPU path is not currently confirmed for EMX Clips. Review compatibility before access.");
    if (goal === "macro" && values.get("input") === "playstation") notes.push("The current VOLT build documents Xbox/XInput setup. Direct PlayStation controller support is not currently confirmed.");
    if (goal === "macro" && values.get("input") === "xinput") notes.push("Xbox/XInput matches the controller path shown in the current VOLT interface.");
    const noteMarkup = notes.length ? `<ul class="finder-notes">${notes.map(note => `<li>${note}</li>`).join("")}</ul>` : "";
    result.dataset.state = "ready";
    result.innerHTML = `<article class="finder-recommendation"><div class="recommendation-media"><img src="${item.image}" alt="${item.name} interface"></div><div class="recommendation-copy"><p class="eyebrow"><span></span> ${freeOverride ? "FREE ALTERNATIVE AVAILABLE" : item.label.toUpperCase()}</p><h3>${freeOverride ? "Start with the free EMX tools" : item.name}</h3><p>${freeOverride ? "You selected free only. Start with Window Deck or Aim Trainer, then compare paid products only if you need their specific workflow." : item.copy}</p>${noteMarkup}<div><strong>${freeOverride ? "Free" : item.price}</strong><a class="emx-button emx-button-primary" href="${freeOverride ? "#free-tools" : item.href}">${freeOverride ? "See free tools" : "View recommendation"}</a></div><button type="button" class="finder-reset">Change answers</button></div></article>`;
    result.querySelector(".finder-reset")?.addEventListener("click", () => { form.reset(); form.querySelector("input")?.focus(); result.removeAttribute("data-state"); result.innerHTML = `<div class="finder-idle"><span class="finder-orbit" aria-hidden="true"><i></i><i></i><i></i></span><p class="eyebrow"><span></span> READY WHEN YOU ARE</p><h3>Your recommendation appears here.</h3><p>Choose a goal and priority. Optional setup answers make the match more useful without pretending to scan your PC.</p></div>`; });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const item = catalog[values.get("goal")];
    if (!item) return;
    loadingView();
    window.setTimeout(() => recommendation(item, values), 1120);
  });
})();
