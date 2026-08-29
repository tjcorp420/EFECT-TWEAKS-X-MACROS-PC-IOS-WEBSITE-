(() => {
  "use strict";
  function toast(message, state = "") {
    let node = document.getElementById("emxDownloadToast");
    if (!node) { node = document.createElement("div"); node.id = "emxDownloadToast"; node.className = "emx-download-toast"; node.setAttribute("role", "status"); document.body.appendChild(node); }
    node.textContent = message; node.dataset.state = state; node.classList.add("is-visible");
    window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => node.classList.remove("is-visible"), 3200);
  }
  document.addEventListener("click", async event => {
    const link = event.target.closest("[data-emx-download][data-product-id]");
    if (!link || link.getAttribute("aria-disabled") === "true") return;
    event.preventDefault();
    if (link.dataset.busy === "true") return;
    link.dataset.busy = "true";
    const previous = link.textContent;
    link.textContent = "Preparing download…";
    toast("Preparing your verified EMX download…");
    try {
      const affiliate = window.EMXAffiliate || {};
      const response = await fetch("/api/download", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ productId: link.dataset.productId, code: affiliate.activeCode || "", visitorId: affiliate.visitorId || "", sessionId: affiliate.sessionId || "" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok !== true || !data.downloadUrl) throw new Error(data.error || "Download could not be prepared.");
      toast(data.affiliateConversion?.tracked ? "Free download conversion recorded. Download starting…" : "Download ready. Starting now…", "success");
      window.location.assign(data.downloadUrl);
    } catch (error) {
      toast(error.message || "Download failed. Try again or contact support.", "error");
    } finally {
      link.dataset.busy = "false";
      link.textContent = previous;
    }
  });
})();
