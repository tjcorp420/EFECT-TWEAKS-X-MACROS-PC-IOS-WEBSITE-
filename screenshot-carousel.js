(() => {
  "use strict";
  document.querySelectorAll("[data-screenshot-carousel]").forEach((root) => {
    const items = [...root.querySelectorAll(".carousel-thumbnails button")];
    const image = root.querySelector("[data-carousel-image]");
    const source = root.querySelector("[data-carousel-source]");
    const full = root.querySelector("[data-carousel-full]");
    const title = root.querySelector("[data-carousel-title]");
    const copy = root.querySelector("[data-carousel-copy]");
    const count = root.querySelector("[data-carousel-count]");
    let index = 0;
    function select(next) {
      index = (next + items.length) % items.length;
      const item = items[index];
      const png = item.dataset.src;
      const stem = png.replace(/\.png$/i, "");
      image.src = png;
      image.alt = `Current EMX VOLT ${item.dataset.title} tab`;
      source.srcset = `${stem}-640.webp 640w, ${stem}-960.webp 960w`;
      full.href = png;
      title.textContent = item.dataset.title;
      copy.textContent = item.dataset.copy;
      count.textContent = `${index + 1} / ${items.length}`;
      items.forEach((button, position) => button.setAttribute("aria-current", String(position === index)));
      item.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    items.forEach((item, position) => item.addEventListener("click", () => select(position)));
    root.querySelector("[data-carousel-prev]")?.addEventListener("click", () => select(index - 1));
    root.querySelector("[data-carousel-next]")?.addEventListener("click", () => select(index + 1));
    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        select(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
  });
})();
