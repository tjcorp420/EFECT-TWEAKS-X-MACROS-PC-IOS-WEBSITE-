(() => {
  "use strict";
  const products = new Map(
    (window.EMX_PRODUCTS || []).map((product) => [product.id, product]),
  );
  document.querySelectorAll("[data-product-version]").forEach((label) => {
    const version = products.get(label.dataset.productVersion)?.version;
    if (version) label.textContent = version;
  });
})();
