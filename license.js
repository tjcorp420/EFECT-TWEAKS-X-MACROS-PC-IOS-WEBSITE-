(() => {
  "use strict";
  const form = document.getElementById("licenseForm");
  const status = document.getElementById("licenseStatus");
  const result = document.getElementById("licenseResult");
  const key = document.getElementById("licenseKey");
  form?.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true; result.hidden = true; key.value = ""; status.dataset.state = ""; status.textContent = "Checking the EMX receipt record...";
    try {
      const response = await fetch("/api/license-lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: document.getElementById("licenseEmail").value, orderId: document.getElementById("licenseOrder").value }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok !== true || !data.license?.licenseKey) throw new Error(data.error || "License lookup is unavailable.");
      key.value = data.license.licenseKey; result.hidden = false; status.dataset.state = "success"; status.textContent = "License recovered. Save it somewhere private.";
    } catch (error) { status.dataset.state = "error"; status.textContent = error.message; }
    finally { button.disabled = false; }
  });
  document.getElementById("copyLicense")?.addEventListener("click", async () => { try { await navigator.clipboard.writeText(key.value); status.textContent = "Key copied."; } catch (error) { key.select(); } });
})();
