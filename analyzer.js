(() => {
  "use strict";
  const form = document.getElementById("compatibilityForm");
  const result = document.getElementById("compatibilityResult");
  if (!form || !result) return;
  const products = {
    tweaks: ["EMX Windows Tweak Dashboard", "Review supported changes and backups before applying."],
    macro: ["EMX VOLT Macro", "Confirm supported inputs and game/platform rules."],
    clips: ["EMX Clips", "The current catalog describes an NVIDIA NVENC path; non-NVIDIA support is not confirmed here."],
    training: ["EMX Aim Trainer", "Free Windows training app with local reports."],
    setup: ["EMX Custom OS", "Review administrator, backup, recovery, driver, and Windows requirements first."]
  };
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const [name, note] = products[data.goal];
    const warnings = [];
    if (data.windows === "older") warnings.push("Current product data targets Windows 10/11; older Windows is not confirmed.");
    if (data.windows === "unknown") warnings.push("Windows compatibility is unavailable until you confirm the installed version.");
    if (data.goal === "clips" && data.graphics !== "nvidia") warnings.push("NVENC compatibility is not confirmed for the selected graphics path.");
    if (data.memory === "8") warnings.push("Lower-memory systems need extra care with background apps and recording workloads.");
    result.replaceChildren();
    const kicker = document.createElement("p"); kicker.className = "eyebrow"; kicker.innerHTML = "<span></span> GUIDANCE";
    const title = document.createElement("h2"); title.textContent = name;
    const copy = document.createElement("p"); copy.textContent = note;
    const list = document.createElement("ul"); list.className = "check-list";
    [
      `Windows: ${data.windows === "unknown" ? "Unavailable" : `Windows ${data.windows}`}`,
      `Memory selection: ${data.memory === "unknown" ? "Unavailable" : `${data.memory} GB${data.memory === "32" ? "+" : ""}`}`,
      `Graphics selection: ${data.graphics === "unknown" ? "Unavailable" : data.graphics.toUpperCase()}`,
      ...warnings
    ].forEach(text => { const item = document.createElement("li"); item.textContent = text; list.appendChild(item); });
    const link = document.createElement("a"); link.className = "emx-button emx-button-secondary"; link.href = "./products.html"; link.textContent = "Review products";
    result.append(kicker, title, copy, list, link);
  });
})();
