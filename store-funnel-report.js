(() => {
  "use strict";
  const form = document.getElementById("funnel-form");
  const status = document.getElementById("funnel-status");
  const report = document.getElementById("funnel-report");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("funnel-password");
    const button = form.querySelector("button");
    button.disabled = true;
    status.textContent = "Loading report…";
    report.replaceChildren();
    try {
      const response = await fetch("/api/affiliate-track?store=1", {
        headers: { "x-admin-password": password.value },
        signal: AbortSignal.timeout(10000),
      });
      password.value = "";
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Report unavailable.");
      const table = document.createElement("table");
      const header = document.createElement("tr");
      for (const label of [
        "Day",
        "Store visits",
        "Product views",
        "Checkout opens",
      ]) {
        const cell = document.createElement("th");
        cell.textContent = label;
        header.append(cell);
      }
      table.append(header);
      for (const day of data.days) {
        const row = document.createElement("tr");
        for (const value of [
          day.day,
          day.counts.page_view || 0,
          day.counts.product_view || 0,
          day.counts.checkout_open || 0,
        ]) {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        }
        table.append(row);
      }
      report.append(table);
      const details = document.createElement("pre");
      details.textContent = JSON.stringify(
        data.days.map((day) => ({ day: day.day, products: day.products })),
        null,
        2,
      );
      report.append(details);
      status.textContent = data.days.length
        ? "Report loaded. Counts begin when tracking was deployed."
        : "No events recorded yet.";
    } catch (error) {
      password.value = "";
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
})();
