(() => {
  "use strict";

  const joinPanel = document.getElementById("joinPanel");
  const loginPanel = document.getElementById("loginPanel");
  const dashboardPanel = document.getElementById("dashboardPanel");
  const joinForm = document.getElementById("joinForm");
  const loginForm = document.getElementById("loginForm");
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  let lastDashboardData = null;

  function onboardingKey(code, step) {
    return `emx_affiliate_onboarding_${code}_${step}`;
  }
  function locallyComplete(code, step) {
    try {
      return localStorage.getItem(onboardingKey(code, step)) === "1";
    } catch (error) {
      return false;
    }
  }
  function markComplete(code, step) {
    try {
      localStorage.setItem(onboardingKey(code, step), "1");
    } catch (error) {
      /* Checklist state remains optional when storage is blocked. */
    }
  }

  function renderOnboarding(affiliate, stats) {
    const approved =
      affiliate.status === "active" || affiliate.status === "approved";
    const panel = document.getElementById("affiliateOnboarding");
    const pending = document.getElementById("onboardingPending");
    panel.hidden = !approved;
    pending.hidden = approved;
    if (!approved) return;
    const states = [
      locallyComplete(affiliate.code, "copy"),
      Number(stats.clicks || 0) > 0 || Number(stats.conversions || 0) > 0,
      locallyComplete(affiliate.code, "eligibility"),
    ];
    [
      "onboardingCopyStep",
      "onboardingShareStep",
      "onboardingEligibilityStep",
    ].forEach((id, index) =>
      document
        .getElementById(id)
        ?.classList.toggle("is-complete", states[index]),
    );
    document.getElementById("onboardingProgress").textContent =
      `${states.filter(Boolean).length} / 3 complete`;
  }

  function showPanel(panel) {
    [joinPanel, loginPanel, dashboardPanel].forEach((item) => {
      if (item) item.hidden = item !== panel;
    });
    panel?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  }

  function setStatus(target, message, state = "") {
    if (!target) return;
    target.textContent = message;
    target.dataset.state = state;
  }

  async function request(body) {
    const response = await fetch("/api/affiliate-auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok !== true)
      throw new Error(data.error || "Affiliate request failed.");
    return data;
  }

  function maskedOrder(orderId) {
    const value = String(orderId || "");
    if (value.length < 6) return "Sale record";
    return `Sale •••${value.slice(-4)}`;
  }

  function renderDashboard(data) {
    lastDashboardData = data;
    const affiliate = data.affiliate || {};
    const stats = affiliate.stats || {};
    document.getElementById("dashboardName").textContent =
      affiliate.displayName || "Affiliate dashboard";
    const status = document.getElementById("dashboardStatus");
    const active =
      affiliate.status === "active" || affiliate.status === "approved";
    status.textContent = active
      ? "Active. Your link tracks visits, product interest, free downloads, and eligible sales."
      : `Account ${affiliate.status || "inactive"}. Contact EMX support if you need help.`;
    document.getElementById("referralLink").value =
      `${window.location.origin}/r/${encodeURIComponent(affiliate.code || "")}`;
    document.getElementById("metricClicks").textContent = Number(
      stats.clicks || 0,
    ).toLocaleString();
    document.getElementById("metricProductViews").textContent = Number(
      stats.productViews || 0,
    ).toLocaleString();
    document.getElementById("metricConversions").textContent = Number(
      stats.conversions || 0,
    ).toLocaleString();
    document.getElementById("metricFreeConversions").textContent = Number(
      stats.freeConversions || 0,
    ).toLocaleString();
    document.getElementById("metricPending").textContent = currency.format(
      Number(stats.pendingCommissionCents || 0) / 100,
    );
    document.getElementById("metricPaid").textContent = currency.format(
      Number(stats.paidCommissionCents || 0) / 100,
    );
    document.getElementById("metricRate").textContent =
      active && Number(affiliate.rateBps || 0) > 0
        ? `${(Number(affiliate.rateBps) / 100).toFixed(2).replace(/\.00$/, "")}% approved rate`
        : "Rate set after approval";
    renderOnboarding(affiliate, stats);

    const list = document.getElementById("conversionList");
    const conversions = Array.isArray(data.conversions) ? data.conversions : [];
    if (!conversions.length) {
      list.innerHTML =
        '<p class="empty-state">No attributed conversions yet.</p>';
    } else {
      list.replaceChildren(
        ...conversions.map((item) => {
          const row = document.createElement("article");
          row.className = "conversion-row";
          const name = document.createElement("strong");
          name.textContent =
            item.type === "free_download"
              ? `Free download · ${item.productId || "EMX tool"}`
              : maskedOrder(item.orderId);
          const amount = document.createElement("span");
          amount.textContent = currency.format(
            Number(item.commissionCents || 0) / 100,
          );
          const details = document.createElement("small");
          details.textContent = `${item.status || "pending"} • ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "date unavailable"}`;
          row.append(name, amount, details);
          return row;
        }),
      );
    }
    showPanel(dashboardPanel);
  }

  async function loadSession() {
    try {
      const response = await fetch("/api/affiliate-auth", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await response.json();
      if (response.ok && data.authenticated) renderDashboard(data);
    } catch (error) {
      // The public application form remains usable when the dashboard check is unavailable.
    }
  }

  document
    .getElementById("showJoinButton")
    ?.addEventListener("click", () => showPanel(joinPanel));
  document
    .getElementById("showLoginButton")
    ?.addEventListener("click", () => showPanel(loginPanel));
  document
    .getElementById("showLoginHeroButton")
    ?.addEventListener("click", () => showPanel(loginPanel));

  document
    .getElementById("referralCode")
    ?.addEventListener("input", (event) => {
      const value = String(event.currentTarget.value || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-{2,}/g, "-")
        .slice(0, 40);
      if (event.currentTarget.value !== value)
        event.currentTarget.value = value;
      const example = document.getElementById("referralCodeExample");
      if (example) example.textContent = value || "your-name";
    });

  joinForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("joinStatus");
    const button = joinForm.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(joinForm));
    button.disabled = true;
    setStatus(status, "Creating your secure EMX affiliate account...");
    try {
      renderDashboard(await request({ action: "signup", ...values }));
      setStatus(
        status,
        "Application received. Your dashboard and referral link are ready; EMX sets paid commission eligibility after review.",
        "success",
      );
      joinForm.reset();
    } catch (error) {
      setStatus(status, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("loginStatus");
    const button = loginForm.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(loginForm));
    button.disabled = true;
    setStatus(status, "Signing in...");
    try {
      renderDashboard(await request({ action: "login", ...values }));
      setStatus(status, "Signed in.", "success");
      loginForm.reset();
    } catch (error) {
      setStatus(status, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  document
    .getElementById("logoutButton")
    ?.addEventListener("click", async () => {
      try {
        await request({ action: "logout" });
      } finally {
        showPanel(loginPanel);
      }
    });

  document
    .getElementById("copyReferralButton")
    ?.addEventListener("click", async (event) => {
      const input = document.getElementById("referralLink");
      try {
        await navigator.clipboard.writeText(input.value);
        const affiliate = lastDashboardData?.affiliate || {};
        markComplete(affiliate.code, "copy");
        renderOnboarding(affiliate, affiliate.stats || {});
        event.currentTarget.textContent = "Copied";
        window.setTimeout(() => {
          event.currentTarget.textContent = "Copy link";
        }, 1600);
      } catch (error) {
        input.select();
      }
    });

  document
    .getElementById("onboardingCopyButton")
    ?.addEventListener("click", () =>
      document.getElementById("copyReferralButton")?.click(),
    );
  document
    .getElementById("onboardingUnderstandButton")
    ?.addEventListener("click", (event) => {
      const affiliate = lastDashboardData?.affiliate || {};
      markComplete(affiliate.code, "eligibility");
      event.currentTarget.textContent = "Understood";
      renderOnboarding(affiliate, affiliate.stats || {});
    });

  loadSession();
})();
