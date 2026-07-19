(function () {
  "use strict";

  // Control Hub is distributed directly from EMX storage; Sprite Tracker uses its free Payhip product.
  const products = {
    controlHub: {
      title: "EMX Tweaks Control Hub",
      directUrl: "https://x1gzparfdlol2128.public.blob.vercel-storage.com/downloads/EMX-Tweaks-Control-Hub-Setup-1.0.3-x64.exe",
      fileName: "EMX-Tweaks-Control-Hub-Setup-1.0.3-x64.exe"
    },
    spriteTracker: {
      title: "EMX Fortnite Sprite Tracker",
      payhipKey: "V90h5"
    },
    windowDeck: {
      title: "EMX Window Deck",
      directUrl: "/downloads/EMX-Window-Deck_0.4.2_CUSTOMER-PACKAGE.zip",
      fileName: "EMX-Window-Deck_0.4.2_CUSTOMER-PACKAGE.zip"
    }
  };

  function showNotice(message) {
    let notice = document.querySelector(".emx-download-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "emx-download-notice";
      notice.setAttribute("role", "status");
      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.classList.add("is-visible");
    window.clearTimeout(showNotice.timeout);
    showNotice.timeout = window.setTimeout(function () {
      notice.classList.remove("is-visible");
    }, 4200);
  }

  function configureLinks() {
    document.querySelectorAll("[data-free-product]").forEach(function (link) {
      const product = products[link.dataset.freeProduct];
      if (!product || (!product.payhipKey && !product.directUrl)) {
        link.setAttribute("aria-disabled", "true");
        link.dataset.downloadReady = "false";
        link.addEventListener("click", function (event) {
          event.preventDefault();
          showNotice(product ? product.title + " is being connected to its download." : "This free download is being connected.");
        });
        return;
      }

      if (product.directUrl) {
        link.href = product.directUrl;
        link.setAttribute("download", product.fileName || "");
        link.removeAttribute("target");
        link.removeAttribute("rel");
      } else {
        link.href = "https://payhip.com/b/" + encodeURIComponent(product.payhipKey);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.dataset.downloadReady = "true";
    });
  }

  function configureWindowDeckModal() {
    const modal = document.getElementById("window-deck-modal");
    if (!modal) return;

    const openers = document.querySelectorAll("[data-window-deck-modal-open]");
    const closers = modal.querySelectorAll("[data-window-deck-modal-close]");
    const video = modal.querySelector("video");
    let previousFocus = null;

    function openModal(event) {
      if (event) event.preventDefault();
      previousFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("window-deck-modal-open");
      window.requestAnimationFrame(function () {
        modal.classList.add("is-open");
        const closeButton = modal.querySelector("[data-window-deck-modal-close]");
        if (closeButton) closeButton.focus();
      });
    }

    function closeModal() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      document.body.classList.remove("window-deck-modal-open");
      if (video) video.pause();
      window.setTimeout(function () {
        modal.hidden = true;
        if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
      }, 180);
    }

    openers.forEach(function (opener) {
      opener.addEventListener("click", openModal);
    });
    closers.forEach(function (closer) {
      closer.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (event) {
      if (modal.hidden) return;
      if (event.key === "Escape") {
        closeModal();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(modal.querySelectorAll(
        "a[href], button:not([disabled]), video[controls], details summary, [tabindex]:not([tabindex='-1'])"
      )).filter(function (element) {
        return !element.hasAttribute("hidden");
      });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (window.location.hash === "#window-deck-modal") openModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      configureLinks();
      configureWindowDeckModal();
    }, { once: true });
  } else {
    configureLinks();
    configureWindowDeckModal();
  }
})();
