(() => {
  "use strict";
  const catalog = window.EMXPublicCatalog;
  const status = document.getElementById("catalogStatus");
  const search = document.getElementById("discoverySearch");
  const category = document.getElementById("discoveryCategory");
  const retry = document.getElementById("catalogRetry");
  const choices = document.getElementById("productChoices");
  const results = document.getElementById("comparisonResults");
  const releases = document.getElementById("releaseGrid");
  let products = [], fallback = false, loading = false;
  const selected = new Set();
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text != null) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function link(label, url) {
    const element = node("a", label, "emx-button emx-button-secondary");
    element.href = url;
    return element;
  }
  function details(card, label, values) {
    const section = node("details");
    section.append(node("summary", label));
    const items = catalog.list(values);
    if (items.length) {
      const list = node("ul");
      items.forEach((item) => list.append(node("li", item)));
      section.append(list);
    } else section.append(node("p", "Not listed in the catalog. Check product instructions or ask support."));
    card.append(section);
  }
  function productCard(item, release) {
    const card = node("article", null, "discovery-card");
    card.append(node("p", item.category || "EMX app", "eyebrow"), node("h3", item.title));
    const badges = node("div", null, "discovery-badges");
    badges.append(node("span", catalog.price(item)), node("span", catalog.value(item.version)));
    card.append(badges, node("p", catalog.value(item.purpose || item.description)));
    const facts = node("dl");
    const fields = release
      ? [["Platform", item.platform], ["Catalog version", item.version], ["License", item.licenseType]]
      : [["Platform", item.platform], ["Controller", item.controllerSupport], ["License", item.licenseType], ["Catalog version", item.version]];
    fields.forEach(([label, value]) => facts.append(node("dt", label), node("dd", catalog.value(value))));
    card.append(facts);
    details(card, "Requirements", item.requirements);
    details(card, "Installation", item.installation);
    details(card, "Recovery", item.recovery);
    details(card, "Known limitations", item.limitations);
    if (release) details(card, "Catalog release notes", item.changelog);
    const actions = node("div", null, "discovery-actions");
    actions.append(link("View product", `./products.html#product-${encodeURIComponent(item.id)}`));
    const docs = catalog.safeUrl(item.documentationUrl);
    if (docs) actions.append(link("Product website", docs));
    const releaseUrl = catalog.safeUrl(item.releaseUrl);
    if (release && releaseUrl) actions.append(link("Official releases", releaseUrl));
    const support = catalog.safeUrl(item.supportUrl) || "https://support.emxtweaks.com/";
    actions.append(link("Support", support));
    card.append(actions);
    return card;
  }
  function renderComparison() {
    if (!results) return;
    results.replaceChildren();
    const items = products.filter((item) => selected.has(item.id));
    results.dataset.count = items.length;
    if (!items.length) results.append(node("p", "Select up to four products above to compare their details."));
    items.forEach((item) => results.append(productCard(item, false)));
  }
  function render() {
    const query = search.value.trim().toLowerCase();
    const filtered = products.filter((item) => (!category.value || (item.category || "Other") === category.value) &&
      [item.title, item.purpose, item.description, item.platform].some((value) => typeof value === "string" && value.toLowerCase().includes(query)));
    status.textContent = `${fallback ? "Live catalog unavailable. Showing bundled data; refresh to retry. " : "Live public catalog loaded. "}${filtered.length} of ${products.length} products shown.${choices ? ` ${selected.size}/4 selected.` : ""}`;
    if (choices) {
      const focusedId = document.activeElement?.dataset.productId;
      choices.replaceChildren();
      filtered.forEach((item) => {
        const label = node("label", null, "product-choice");
        const input = node("input");
        input.type = "checkbox";
        input.dataset.productId = item.id;
        input.checked = selected.has(item.id);
        input.disabled = !input.checked && selected.size >= 4;
        input.addEventListener("change", () => {
          if (input.checked && selected.size < 4) selected.add(item.id);
          else selected.delete(item.id);
          render();
        });
        const copy = node("span");
        copy.append(node("strong", item.title), node("small", `${catalog.price(item)} · ${catalog.value(item.platform)}`));
        label.append(input, copy);
        choices.append(label);
      });
      if (!filtered.length) choices.append(node("p", "No matching products. Try another search or category."));
      if (focusedId) {
        [...choices.querySelectorAll("input")].find((input) => input.dataset.productId === focusedId)?.focus({ preventScroll: true });
      }
      renderComparison();
    }
    if (releases) {
      releases.replaceChildren();
      filtered.forEach((item) => releases.append(productCard(item, true)));
      if (!filtered.length) releases.append(node("p", "No matching public apps. Try another search or category."));
    }
  }
  async function load() {
    if (loading) return;
    loading = true;
    retry.disabled = true;
    status.textContent = "Loading current public catalog…";
    const data = await catalog.load();
    products = data.products.sort((a, b) => a.title.localeCompare(b.title));
    if (releases) products = products.filter((item) => item.type !== "bundle" && !(Array.isArray(item.bundleItems) && item.bundleItems.length));
    fallback = data.fallback;
    for (const id of selected) if (!products.some((item) => item.id === id)) selected.delete(id);
    const previous = category.value;
    category.replaceChildren(node("option", "All categories"));
    category.firstChild.value = "";
    [...new Set(products.map((item) => item.category || "Other"))].sort().forEach((value) => {
      const option = node("option", value);
      option.value = value;
      category.append(option);
    });
    category.value = previous;
    if (category.selectedIndex < 0) category.value = "";
    loading = false;
    retry.disabled = false;
    render();
    if (!products.length) status.textContent = fallback ? "The catalog could not be loaded. Refresh to retry or contact support." : "No public products are currently listed.";
  }
  search.addEventListener("input", render);
  category.addEventListener("change", render);
  retry.addEventListener("click", load);
  load();
})();
