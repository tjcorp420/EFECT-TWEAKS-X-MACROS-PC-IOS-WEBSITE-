(() => {
  "use strict";

  const dialog = document.getElementById("comingSoonDialog");
  const title = document.getElementById("comingSoonDialogTitle");
  const copy = document.getElementById("comingSoonDialogCopy");
  if (!(dialog instanceof HTMLDialogElement) || !title || !copy) return;

  document.querySelectorAll("[data-coming-soon-title]").forEach((button) => {
    button.addEventListener("click", () => {
      title.textContent = button.dataset.comingSoonTitle || "More EMX products";
      copy.textContent =
        button.dataset.comingSoonCopy ||
        "Details will be published after the product is real and verified.";
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
