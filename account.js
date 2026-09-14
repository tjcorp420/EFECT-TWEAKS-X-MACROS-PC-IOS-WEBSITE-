(() => {
  const $ = (id) => document.getElementById(id);
  const TKEY = "emx_token";
  let mode = "login";
  let account = null;
  let products = [];

  async function api(action, data = {}) {
    const token = localStorage.getItem(TKEY) || "";
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, token, ...data })
    });
    const json = await res.json().catch(() => ({ ok: false, error: "Bad response." }));
    return { status: res.status, ...json };
  }

  function setMsg(text, kind) {
    const el = $("authMsg");
    el.textContent = text || "";
    el.className = "msg" + (kind ? " " + kind : "");
  }

  // ---- auth ----
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
    mode = t.dataset.mode;
    document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === t));
    $("authTitle").textContent = mode === "signup" ? "Create your EMX account" : "Log in to EMX";
    $("authBtn").textContent = mode === "signup" ? "Create account" : "Log in";
    $("password").autocomplete = mode === "signup" ? "new-password" : "current-password";
    setMsg("");
  }));

  $("authBtn").addEventListener("click", doAuth);
  $("password").addEventListener("keydown", e => { if (e.key === "Enter") doAuth(); });

  async function doAuth() {
    const email = $("email").value.trim();
    const password = $("password").value;
    if (!email || !password) return setMsg("Enter your email and password.", "err");
    $("authBtn").disabled = true;
    setMsg(mode === "signup" ? "Creating your account…" : "Logging in…");
    const r = await api(mode, { email, password });
    $("authBtn").disabled = false;
    if (!r.ok) return setMsg(r.error || "Something went wrong.", "err");
    localStorage.setItem(TKEY, r.token);
    account = r.account;
    showDash();
  }

  // ---- dashboard ----
  async function showDash() {
    $("auth").classList.add("hide");
    $("dash").classList.remove("hide");
    $("who").textContent = account.emailMasked || "";
    if (!products.length) {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        products = (Array.isArray(data) ? data : data.products || []).filter(p => p.visible !== false);
      } catch { products = []; }
    }
    renderGrid();
  }

  function ownedKey(id) { return account && account.keys && account.keys[id]; }
  function autoOwned(p) { return !!(account && account.owns && p.key && account.owns[p.key]); }
  function isOwned(p) { return !!ownedKey(p.id) || autoOwned(p); }

  function renderGrid() {
    const grid = $("grid");
    // Owned first (purchased or key added), then paid unowned, then free.
    const rank = (p) => isOwned(p) ? 0 : (p.price > 0 ? 1 : 2);
    const order = [...products].sort((a, b) => rank(a) - rank(b));
    grid.innerHTML = order.map(cardHtml).join("");
    grid.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", onAdd));
    grid.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", onRemove));
    grid.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", onCopy));
  }

  function cardHtml(p) {
    const img = esc(p.image || "./emx-logo-v2.png");
    const buy = esc(p.productUrl || (p.deliveryUrl || "#"));
    const owned = ownedKey(p.id);
    const addRow = `<div class="addrow"><input placeholder="Paste license key" data-key="${esc(p.id)}">
          <button class="btn small" data-add="${esc(p.id)}">Add</button></div>
        <div class="muted" data-msg="${esc(p.id)}"></div>`;
    let action;
    if (p.price <= 0) {
      action = `<span class="badge free">● FREE</span>
        <a class="btn small" href="${esc(p.deliveryUrl || p.productUrl || "#")}" target="_blank" rel="noopener">Open ↗</a>`;
    } else if (owned) {
      action = `<span class="badge owned">● OWNED${owned.verified ? " · <span class='verified'>VERIFIED</span>" : ""}</span>
        <div class="keyrow"><code title="${esc(owned.key)}">${esc(owned.key)}</code>
          <button class="btn ghost small" data-copy="${esc(owned.key)}">Copy</button>
          <button class="btn ghost small" data-remove="${esc(p.id)}">✕</button></div>`;
    } else if (autoOwned(p)) {
      action = `<span class="badge owned">● OWNED</span>
        <div class="muted">Add the key from your Payhip email to copy &amp; activate:</div>
        ${addRow}`;
    } else {
      action = `<a class="btn purple small" href="${buy}" target="_blank" rel="noopener">Get — $${(p.price || 0).toFixed(2)}</a>
        ${addRow}`;
    }
    return `<div class="glass card">
      <img class="thumb" src="${img}" alt="" onerror="this.src='./emx-logo-v2.png'">
      <div class="eye">${esc(p.eyebrow || "EMX")}</div>
      <h3>${esc(p.title || "")}</h3>
      ${action}
    </div>`;
  }

  async function onAdd(e) {
    const id = e.target.dataset.add;
    const input = document.querySelector(`input[data-key="${cssEsc(id)}"]`);
    const msg = document.querySelector(`[data-msg="${cssEsc(id)}"]`);
    const key = (input?.value || "").trim();
    if (!key) { if (msg) msg.textContent = "Paste your license key first."; return; }
    e.target.disabled = true; if (msg) msg.textContent = "Checking…";
    const r = await api("addKey", { productId: id, licenseKey: key });
    e.target.disabled = false;
    if (!r.ok) { if (msg) { msg.textContent = r.error || "Could not add key."; msg.style.color = "var(--danger)"; } return; }
    account = r.account; renderGrid();
  }

  async function onRemove(e) {
    const id = e.target.dataset.remove;
    const r = await api("removeKey", { productId: id });
    if (r.ok) { account = r.account; renderGrid(); }
  }

  function onCopy(e) {
    navigator.clipboard?.writeText(e.target.dataset.copy).then(() => {
      const old = e.target.textContent; e.target.textContent = "Copied!";
      setTimeout(() => (e.target.textContent = old), 1200);
    });
  }

  $("logout").addEventListener("click", () => {
    localStorage.removeItem(TKEY); account = null;
    $("dash").classList.add("hide"); $("auth").classList.remove("hide"); setMsg("");
  });

  // Set this to the hosted EMX_Hub_Setup_1.0.0.exe download URL (e.g. a free Payhip product
  // link, or a GitHub release asset). Until it's set, the button explains it's coming.
  const HUB_DOWNLOAD_URL = "";
  $("downloadApp").addEventListener("click", (e) => {
    e.preventDefault();
    if (HUB_DOWNLOAD_URL) { window.open(HUB_DOWNLOAD_URL, "_blank", "noopener"); return; }
    alert("The free EMX Hub desktop app is ready — it's being hosted for download shortly. It signs in with this same account and launches all your installed EMX products.");
  });

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function cssEsc(s) { return String(s).replace(/["\\]/g, "\\$&"); }

  // ---- boot ----
  (async () => {
    const token = localStorage.getItem(TKEY);
    if (token) {
      const r = await api("me");
      if (r.ok) { account = r.account; showDash(); return; }
      localStorage.removeItem(TKEY);
    }
  })();
})();
