const API_URL = "/api/products";
const CHECKOUT_BASE = "https://payhip.com/buy";

let products = [];
let selectedIndex = 0;
let adminPassword = sessionStorage.getItem("emx_admin_password") || "";

const loginBox = document.getElementById("loginBox");
const adminApp = document.getElementById("adminApp");
const statusPill = document.getElementById("statusPill");
const productList = document.getElementById("productList");
const previewBox = document.getElementById("previewBox");

const fields = {
  id: document.getElementById("idField"),
  key: document.getElementById("keyField"),
  title: document.getElementById("titleField"),
  eyebrow: document.getElementById("eyebrowField"),
  price: document.getElementById("priceField"),
  oldPrice: document.getElementById("oldPriceField"),
  productUrl: document.getElementById("urlField"),
  image: document.getElementById("imageField"),
  gallery: document.getElementById("galleryField"),
  previewType: document.getElementById("previewTypeField"),
  previewSrc: document.getElementById("previewSrcField"),
  fallbackPreview: document.getElementById("fallbackField"),
  description: document.getElementById("descriptionField"),
  features: document.getElementById("featuresField"),
  visible: document.getElementById("visibleField")
};

function toast(message){
  const el = document.getElementById("toast");
  el.innerHTML = message;
  el.classList.add("show");

  clearTimeout(window.__emxToast);
  window.__emxToast = setTimeout(() => {
    el.classList.remove("show");
  }, 3000);
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value){
  return "$" + Number(value || 0).toFixed(2);
}

function cleanId(value){
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function setStatus(text){
  statusPill.textContent = text;
}

function newProduct(){
  const stamp = Date.now();

  return {
    id: "new-product-" + stamp,
    key: "",
    productUrl: "",
    title: "New EMX Product",
    eyebrow: "EMX Product",
    price: 0,
    oldPrice: 0,
    image: "./emx-logo.png",
  gallery: [
    "./emx-logo.png"
  ],
  previewType: "image",
    previewSrc: "./emx-logo.png",
    fallbackPreview: "",
    description: "New product description goes here.",
    features: [
      "Feature one",
      "Feature two",
      "Feature three"
    ],
    visible: true
  };
}

async function loadProducts(){
  setStatus("Loading");

  const response = await fetch(API_URL, {
    cache: "no-store"
  });

  if(!response.ok){
    throw new Error("Could not load products from /api/products");
  }

  const data = await response.json();

  if(!Array.isArray(data)){
    throw new Error("API did not return a product array.");
  }

  products = data;

  if(products.length === 0){
    products.push(newProduct());
  }

  selectedIndex = Math.min(selectedIndex, products.length - 1);

  setStatus("Connected");
  renderProductList();
  loadSelectedProduct();
  renderPreview();
}

async function saveProducts(){
  applySelected(false);
  setStatus("Saving");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": adminPassword
    },
    body: JSON.stringify({
      products: products
    })
  });

  const data = await response.json().catch(() => null);

  if(!response.ok || !data || data.ok !== true){
    throw new Error(data && data.error ? data.error : "Save failed.");
  }

  products = data.products || products;

  setStatus("Saved Live");
  renderProductList();
  loadSelectedProduct();
  renderPreview();

  toast("<b>Saved live.</b><br>Your Vercel database was updated.");
}

function renderProductList(){
  productList.innerHTML = products.map((product, index) => {
    const active = index === selectedIndex ? "active" : "";
    const hiddenClass = product.visible === false ? "hidden-product" : "";
    const status = product.visible === false ? "Hidden" : "Live";

    return `
      <button class="product-btn ${active}" type="button" data-index="${index}">
        <span>
          <b>${escapeHtml(product.title)}</b>
          <small>${escapeHtml(product.eyebrow)} • ${money(product.price)}</small>
        </span>
        <em class="status ${hiddenClass}">${status}</em>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".product-btn").forEach(button => {
    button.addEventListener("click", () => {
      applySelected(false);
      selectedIndex = Number(button.dataset.index);
      renderProductList();
      loadSelectedProduct();
      renderPreview();
    });
  });
}

function loadSelectedProduct(){
  const product = products[selectedIndex];
  if(!product) return;

  fields.id.value = product.id || "";
  fields.key.value = product.key || "";
  fields.title.value = product.title || "";
  fields.eyebrow.value = product.eyebrow || "";
  fields.price.value = product.price ?? 0;
  fields.oldPrice.value = product.oldPrice ?? 0;
  fields.productUrl.value = product.productUrl || "";
  fields.image.value = product.image || "";
fields.gallery.value = Array.isArray(product.gallery) ? product.gallery.join("\n") : "";
fields.previewType.value = product.previewType || "image";
  fields.previewSrc.value = product.previewSrc || "";
  fields.fallbackPreview.value = product.fallbackPreview || "";
  fields.description.value = product.description || "";
  fields.features.value = Array.isArray(product.features) ? product.features.join("\n") : "";
  fields.visible.value = product.visible === false ? "false" : "true";
}

function readProductFromForm(){
  const key = fields.key.value.trim();
  const productUrl = fields.productUrl.value.trim();

  return {
    id: cleanId(fields.id.value) || cleanId(fields.title.value) || ("product-" + Date.now()),
    key: key,
    productUrl: productUrl || (key ? CHECKOUT_BASE + "?link=" + encodeURIComponent(key) : ""),
    title: fields.title.value.trim() || "Untitled Product",
    eyebrow: fields.eyebrow.value.trim() || "EMX Product",
    price: Number(fields.price.value || 0),
    oldPrice: Number(fields.oldPrice.value || 0),
    image: fields.image.value.trim() || "./emx-logo.png",
  gallery: fields.gallery.value
  .split("\n")
  .map(item => item.trim())
  .filter(Boolean),
  previewType: fields.previewType.value || "image",
    previewSrc: fields.previewSrc.value.trim() || fields.image.value.trim() || "./emx-logo.png",
    fallbackPreview: fields.fallbackPreview.value.trim(),
    description: fields.description.value.trim(),
    features: fields.features.value
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean),
    visible: fields.visible.value !== "false"
  };
}

function applySelected(showToast){
  if(!products[selectedIndex]) return;

  products[selectedIndex] = readProductFromForm();

  renderProductList();
  renderPreview();

  if(showToast){
    toast("Applied locally. Press <b>Save Live</b> to publish.");
  }
}

function renderPreview(){
  const product = readProductFromForm();

  const oldPrice = Number(product.oldPrice || 0);
  const price = Number(product.price || 0);
  const discount = oldPrice > price && oldPrice > 0
    ? Math.round((1 - price / oldPrice) * 100)
    : 0;

  previewBox.innerHTML = `
    <div class="preview-top">
      <div>
        <span class="tag">${escapeHtml(product.eyebrow)}</span>
        <h3>${escapeHtml(product.title)}</h3>
      </div>
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" onerror="this.src='./emx-logo.png'">
    </div>

    <div class="price">
      <strong>${money(product.price)}</strong>
      ${oldPrice > 0 ? `<del>${money(product.oldPrice)}</del>` : ""}
      ${discount > 0 ? `<span class="status">${discount}% OFF</span>` : ""}
    </div>

    ${Array.isArray(product.gallery) && product.gallery.length ? `
  <div style="display:flex;gap:8px;overflow-x:auto;margin:14px 0;padding-bottom:6px;">
    ${product.gallery.map(src => `
      <img
        src="${escapeHtml(src)}"
        alt="Gallery image"
        style="width:86px;height:62px;object-fit:cover;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:#000;flex:0 0 auto;"
        onerror="this.src='./emx-logo.png'"
      >
    `).join("")}
  </div>
` : ""}

<p>${escapeHtml(product.description)}</p>

<ul>
  ${product.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}
</ul>
  `;
}

function addProduct(){
  applySelected(false);
  products.push(newProduct());
  selectedIndex = products.length - 1;
  renderProductList();
  loadSelectedProduct();
  renderPreview();
  toast("New product added. Edit it, then press Save Live.");
}

function duplicateProduct(){
  applySelected(false);

  const current = products[selectedIndex];
  if(!current) return;

  const copy = JSON.parse(JSON.stringify(current));
  copy.id = cleanId(copy.id + "-copy-" + Date.now());
  copy.title = copy.title + " Copy";
  copy.visible = false;

  products.splice(selectedIndex + 1, 0, copy);
  selectedIndex++;

  renderProductList();
  loadSelectedProduct();
  renderPreview();

  toast("Product duplicated as hidden.");
}

function deleteProduct(){
  if(products.length <= 1){
    toast("You need at least one product.");
    return;
  }

  const product = products[selectedIndex];
  const ok = confirm("Delete this product?\n\n" + (product ? product.title : "Selected product"));

  if(!ok) return;

  products.splice(selectedIndex, 1);
  selectedIndex = Math.max(0, selectedIndex - 1);

  renderProductList();
  loadSelectedProduct();
  renderPreview();

  toast("Deleted locally. Press Save Live to publish.");
}

function moveSelected(direction){
  applySelected(false);

  const nextIndex = selectedIndex + direction;

  if(nextIndex < 0 || nextIndex >= products.length){
    return;
  }

  const current = products[selectedIndex];
  products[selectedIndex] = products[nextIndex];
  products[nextIndex] = current;
  selectedIndex = nextIndex;

  renderProductList();
  loadSelectedProduct();
  renderPreview();
}

function unlock(){
  const password = document.getElementById("adminPassword").value.trim();

  if(!password){
    toast("Enter your admin password.");
    return;
  }

  adminPassword = password;
  sessionStorage.setItem("emx_admin_password", adminPassword);

  loginBox.classList.add("hidden");
  adminApp.classList.remove("hidden");

  loadProducts()
    .then(() => {
      toast("Admin unlocked. Products loaded.");
    })
    .catch(error => {
      toast("<b>Load error:</b><br>" + escapeHtml(error.message));
      setStatus("Load Failed");
    });
}

Object.values(fields).forEach(field => {
  field.addEventListener("input", renderPreview);
  field.addEventListener("change", renderPreview);
});

document.getElementById("unlockBtn").addEventListener("click", unlock);

document.getElementById("adminPassword").addEventListener("keydown", event => {
  if(event.key === "Enter"){
    unlock();
  }
});

document.getElementById("addBtn").addEventListener("click", addProduct);

document.getElementById("reloadBtn").addEventListener("click", () => {
  loadProducts()
    .then(() => toast("Reloaded products."))
    .catch(error => toast("<b>Reload failed:</b><br>" + escapeHtml(error.message)));
});

document.getElementById("saveBtn").addEventListener("click", () => {
  saveProducts()
    .catch(error => {
      setStatus("Save Failed");
      toast("<b>Save failed:</b><br>" + escapeHtml(error.message));
    });
});

document.getElementById("applyBtn").addEventListener("click", () => applySelected(true));
document.getElementById("duplicateBtn").addEventListener("click", duplicateProduct);
document.getElementById("deleteBtn").addEventListener("click", deleteProduct);
document.getElementById("upBtn").addEventListener("click", () => moveSelected(-1));
document.getElementById("downBtn").addEventListener("click", () => moveSelected(1));
document.getElementById("clearGalleryBtn")?.addEventListener("click", () => {
  fields.gallery.value = "";
  renderPreview();
  toast("Gallery cleared. Press Apply Changes, then Save Live.");
});

document.getElementById("useMainImageBtn")?.addEventListener("click", () => {
  const mainImage = fields.image.value.trim();
  
  if (!mainImage) {
    toast("Main image path is empty.");
    return;
  }
  
  fields.gallery.value = mainImage;
  renderPreview();
  toast("Gallery set to main image. Press Apply Changes, then Save Live.");
});

if(adminPassword){
  document.getElementById("adminPassword").value = adminPassword;
}