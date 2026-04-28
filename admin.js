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
const galleryPreviewBox = document.getElementById("galleryPreviewBox");

const adminSections = {
  products: null,
  editor: null,
  media: null,
  preview: null,
  settings: null
};

let activeAdminTab = localStorage.getItem("emx_admin_active_tab") || "products";

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

function lockAdminMobileWidth() {
  const safeWidth = Math.max(280, window.innerWidth - 32) + "px";
  
  document.documentElement.style.width = "100%";
  document.documentElement.style.maxWidth = "100%";
  document.documentElement.style.overflowX = "hidden";
  
  document.body.style.width = "100%";
  document.body.style.maxWidth = "100%";
  document.body.style.overflowX = "hidden";
  
  document.querySelectorAll("*").forEach(element => {
    element.style.maxWidth = "100%";
    element.style.boxSizing = "border-box";
  });
  
  const problemFields = [
    fields.image,
    fields.gallery,
    fields.previewSrc,
    fields.fallbackPreview,
    fields.productUrl
  ];
  
  problemFields.forEach(field => {
    if (!field) return;
    
    field.setAttribute("cols", "1");
    field.setAttribute("spellcheck", "false");
    field.setAttribute("autocomplete", "off");
    field.setAttribute("autocorrect", "off");
    field.setAttribute("autocapitalize", "off");
    
    field.style.display = "block";
    field.style.width = "100%";
    field.style.maxWidth = safeWidth;
    field.style.minWidth = "0";
    field.style.boxSizing = "border-box";
    field.style.overflowX = "auto";
    field.style.whiteSpace = "pre";
    field.style.wordBreak = "normal";
    field.style.overflowWrap = "normal";
  });
  
  if (fields.gallery) {
    fields.gallery.style.whiteSpace = "pre-wrap";
    fields.gallery.style.wordBreak = "break-all";
    fields.gallery.style.overflowWrap = "anywhere";
    fields.gallery.style.overflowX = "hidden";
  }
  
  document.querySelectorAll("section, div, form, label, textarea, input, select, button").forEach(element => {
    element.style.maxWidth = "100%";
    element.style.minWidth = "0";
  });
}

lockAdminMobileWidth();

window.addEventListener("resize", lockAdminMobileWidth);
window.addEventListener("orientationchange", () => {
  setTimeout(lockAdminMobileWidth, 300);
});

const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = "image/*,video/mp4,video/webm,video/quicktime";
uploadInput.style.display = "none";
document.body.appendChild(uploadInput);

let uploadTargetMode = "main";
const MEDIA_LIBRARY_KEY = "emx_recent_uploaded_media_v1";

function getMediaLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(MEDIA_LIBRARY_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveMediaLibrary(items) {
  localStorage.setItem(MEDIA_LIBRARY_KEY, JSON.stringify(items));
}

function addToMediaLibrary(item) {
  const library = getMediaLibrary();
  
  const cleanItem = {
    url: item.url,
    type: item.type || "image",
    name: item.name || "EMX Upload",
    createdAt: Date.now()
  };
  
  const withoutDuplicate = library.filter(media => media.url !== cleanItem.url);
  withoutDuplicate.unshift(cleanItem);
  
  saveMediaLibrary(withoutDuplicate.slice(0, 30));
  renderMediaLibrary();
}

function removeFromMediaLibrary(url) {
  const library = getMediaLibrary().filter(media => media.url !== url);
  saveMediaLibrary(library);
  renderMediaLibrary();
}

function copyText(value) {
  navigator.clipboard.writeText(value).then(() => {
    alert("Copied URL.");
  }).catch(() => {
    alert(value);
  });
}

function cleanGalleryField() {
  fields.gallery.value = fields.gallery.value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");
  
  lockAdminMobileWidth();
  setTimeout(lockAdminMobileWidth, 100);
  setTimeout(lockAdminMobileWidth, 500);
}

function addUrlToGallery(url) {
  const currentLines = fields.gallery.value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
  
  if (!currentLines.includes(url)) {
    currentLines.push(url);
  }
  
  fields.gallery.value = currentLines.join("\n");
  cleanGalleryField();
  
  if (typeof renderPreview === "function") {
    renderPreview();
  }
}

function useMediaAsMain(url) {
  fields.image.value = url;
  
  if (!fields.fallbackPreview.value.trim()) {
    fields.fallbackPreview.value = url;
  }
  
  if (fields.previewType.value !== "video" && !fields.previewSrc.value.trim()) {
    fields.previewType.value = "image";
    fields.previewSrc.value = url;
  }
  
  if (typeof renderPreview === "function") {
    renderPreview();
  }
}

function useMediaAsPreview(media) {
  fields.previewType.value = media.type === "video" ? "video" : "image";
  fields.previewSrc.value = media.url;
  
  if (media.type === "image" && !fields.image.value.trim()) {
    fields.image.value = media.url;
  }
  
  if (fields.image.value.trim() && !fields.fallbackPreview.value.trim()) {
    fields.fallbackPreview.value = fields.image.value.trim();
  }
  
  if (typeof renderPreview === "function") {
    renderPreview();
  }
}

function createUploadButton(text, mode) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "admin-btn upload-btn";
  button.textContent = text;
  
  button.addEventListener("click", () => {
    uploadTargetMode = mode;
    
    if (mode === "video") {
      uploadInput.accept = "video/mp4,video/webm,video/quicktime";
    } else {
      uploadInput.accept = "image/*";
    }
    
    uploadInput.value = "";
    uploadInput.click();
  });
  
  return button;
}

function insertAfterField(field, button) {
  if (!field || !field.parentElement) return;
  
  field.insertAdjacentElement("afterend", button);
}

function setUploadBusy(isBusy) {
  document.querySelectorAll(".upload-btn").forEach(button => {
    button.disabled = isBusy;
    button.textContent = isBusy ? "Uploading..." : button.dataset.originalText;
  });
}

function addUploadButtons() {
  const mainButton = createUploadButton("Upload Main Image", "main");
  const galleryButton = createUploadButton("Upload Gallery Image", "gallery");
  const videoButton = createUploadButton("Upload Preview Video", "video");
  
  mainButton.dataset.originalText = "Upload Main Image";
  galleryButton.dataset.originalText = "Upload Gallery Image";
  videoButton.dataset.originalText = "Upload Preview Video";
  
  insertAfterField(fields.image, mainButton);
  insertAfterField(fields.gallery, galleryButton);
  insertAfterField(fields.previewSrc, videoButton);
  
  createMediaLibraryPanel();
}

function createMediaLibraryPanel() {
  if (document.getElementById("mediaLibraryPanel")) return;
  
  const panel = document.createElement("section");
  panel.id = "mediaLibraryPanel";
  panel.className = "media-library-panel";
  
  panel.innerHTML = `
    <div class="media-library-head">
      <div>
        <h2>Media Library</h2>
        <p>Recent uploads saved on this device.</p>
      </div>

      <button class="admin-btn small" type="button" id="clearMediaLibraryBtn">
        Clear
      </button>
    </div>

    <div id="mediaLibraryGrid" class="media-library-grid"></div>
  `;
  
  const previewBoxParent = previewBox?.parentElement;
  
  if (previewBoxParent) {
    previewBoxParent.insertAdjacentElement("beforebegin", panel);
  } else {
    document.body.appendChild(panel);
  }
  
  document.getElementById("clearMediaLibraryBtn")?.addEventListener("click", () => {
    if (confirm("Clear recent uploaded media from this admin device?")) {
      saveMediaLibrary([]);
      renderMediaLibrary();
    }
  });
  
  renderMediaLibrary();
}

function renderMediaLibrary() {
  const grid = document.getElementById("mediaLibraryGrid");
  if (!grid) return;
  
  const library = getMediaLibrary();
  
  if (!library.length) {
    grid.innerHTML = `
      <div class="media-empty">
        Upload images or videos and they will appear here.
      </div>
    `;
    return;
  }
  
  grid.innerHTML = library.map((media, index) => {
    const isVideo = media.type === "video";
    
    return `
      <article class="media-tile">
        <div class="media-thumb">
          ${
            isVideo
              ? `<video src="${escapeHtml(media.url)}" muted playsinline preload="metadata"></video>`
              : `<img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.name)}">`
          }

          <span class="media-type">${isVideo ? "VIDEO" : "IMAGE"}</span>
        </div>

        <div class="media-name">${escapeHtml(media.name)}</div>

        <div class="media-actions">
          <button type="button" data-media-action="main" data-index="${index}">Main</button>
          <button type="button" data-media-action="gallery" data-index="${index}">Gallery</button>
          <button type="button" data-media-action="preview" data-index="${index}">Preview</button>
          <button type="button" data-media-action="copy" data-index="${index}">Copy</button>
          <button type="button" data-media-action="remove" data-index="${index}" class="danger">×</button>
        </div>
      </article>
    `;
  }).join("");
  
  grid.querySelectorAll("[data-media-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.mediaAction;
      const index = Number(button.dataset.index);
      const media = getMediaLibrary()[index];
      
      if (!media) return;
      
      if (action === "main") {
        useMediaAsMain(media.url);
        alert("Set as main image. Press Apply Changes, then Save Live.");
      }
      
      if (action === "gallery") {
        addUrlToGallery(media.url);
        alert("Added to gallery. Press Apply Changes, then Save Live.");
      }
      
      if (action === "preview") {
        useMediaAsPreview(media);
        alert("Set as preview source. Press Apply Changes, then Save Live.");
      }
      
      if (action === "copy") {
        copyText(media.url);
      }
      
      if (action === "remove") {
        removeFromMediaLibrary(media.url);
      }
    });
  });
}

async function uploadSelectedFile(file) {
  if (!file) {
    return;
  }
  
  try {
    setUploadBusy(true);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-file-name": file.name || `emx-upload-${Date.now()}`
      },
      body: file
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.ok || !data.url) {
      throw new Error(data.error || "Upload failed.");
    }
    
    const uploadedUrl = data.url;
    addToMediaLibrary({
  url: uploadedUrl,
  type: file.type && file.type.startsWith("video/") ? "video" : "image",
  name: file.name || "EMX Upload"
});
    
    if (uploadTargetMode === "main") {
      fields.image.value = uploadedUrl;
      
      if (!fields.fallbackPreview.value.trim()) {
        fields.fallbackPreview.value = uploadedUrl;
      }
      
      if (fields.previewType.value !== "video" && !fields.previewSrc.value.trim()) {
        fields.previewSrc.value = uploadedUrl;
        fields.previewType.value = "image";
      }
    }
    
    if (uploadTargetMode === "gallery") {
  const currentLines = fields.gallery.value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
  
  currentLines.push(uploadedUrl);
  fields.gallery.value = currentLines.join("\n");
  cleanGalleryField();
}
    
    if (uploadTargetMode === "video") {
      fields.previewType.value = "video";
      fields.previewSrc.value = uploadedUrl;
      
      if (fields.image.value.trim() && !fields.fallbackPreview.value.trim()) {
        fields.fallbackPreview.value = fields.image.value.trim();
      }
    }
    
    if (typeof renderPreview === "function") {
      renderPreview();
    }
    
    lockAdminMobileWidth();
setTimeout(lockAdminMobileWidth, 100);
setTimeout(lockAdminMobileWidth, 500);

alert("Upload complete. Press Apply Changes, then Save Live.");
  } catch (error) {
    alert(error.message || "Upload failed.");
  } finally {
    setUploadBusy(false);
  }
}

uploadInput.addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  uploadSelectedFile(file);
});

addUploadButtons();
setupAdminTabs();
function setupAdminTabs() {
  if (document.getElementById("adminTabBar")) return;
  
  const productsCard = productList?.closest("section") || productList?.parentElement;
  const editorCard = fields.id?.closest("section") || fields.id?.parentElement;
  const previewCard = previewBox?.closest("section") || previewBox?.parentElement;
  const mediaCard = document.getElementById("mediaLibraryPanel");
  
  adminSections.products = productsCard;
  adminSections.editor = editorCard;
  adminSections.preview = previewCard;
  adminSections.media = mediaCard;
  
  const settingsPanel = document.createElement("section");
  settingsPanel.id = "adminSettingsPanel";
  settingsPanel.className = "admin-settings-panel";
  settingsPanel.innerHTML = `
    <h2>Admin Settings</h2>
    <p>Quick tools for your EMX admin app.</p>

    <div class="settings-grid">
      <button class="admin-btn" type="button" id="settingsReloadBtn">Reload Products</button>
      <button class="admin-btn" type="button" id="settingsSaveBtn">Save Live</button>
      <button class="admin-btn" type="button" id="settingsClearMediaBtn">Clear Media Library</button>
      <button class="admin-btn danger-soft" type="button" id="settingsLogoutBtn">Lock Admin</button>
    </div>

    <div class="settings-note">
      <b>Tip:</b> Use Products to select cards, Editor to change info, Media to reuse uploads, and Preview to check the final card.
    </div>
  `;
  
  if (previewCard && previewCard.parentElement) {
    previewCard.insertAdjacentElement("afterend", settingsPanel);
  } else {
    document.body.appendChild(settingsPanel);
  }
  
  adminSections.settings = settingsPanel;
  
  document.getElementById("settingsReloadBtn")?.addEventListener("click", () => {
    loadProducts()
      .then(() => toast("Reloaded products."))
      .catch(error => toast("<b>Reload failed:</b><br>" + escapeHtml(error.message)));
  });
  
  document.getElementById("settingsSaveBtn")?.addEventListener("click", () => {
    saveProducts()
      .catch(error => {
        setStatus("Save Failed");
        toast("<b>Save failed:</b><br>" + escapeHtml(error.message));
      });
  });
  
  document.getElementById("settingsClearMediaBtn")?.addEventListener("click", () => {
    if (confirm("Clear recent uploaded media from this phone?")) {
      saveMediaLibrary([]);
      renderMediaLibrary();
      toast("Media library cleared.");
    }
  });
  
  document.getElementById("settingsLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("emx_admin_password");
    adminPassword = "";
    adminApp.classList.add("hidden");
    loginBox.classList.remove("hidden");
    toast("Admin locked.");
  });
  
  const tabBar = document.createElement("nav");
  tabBar.id = "adminTabBar";
  tabBar.className = "admin-tab-bar";
  tabBar.innerHTML = `
    <button type="button" data-admin-tab="products">
      <span>▦</span>
      Products
    </button>

    <button type="button" data-admin-tab="editor">
      <span>✎</span>
      Editor
    </button>

    <button type="button" data-admin-tab="media">
      <span>▧</span>
      Media
    </button>

    <button type="button" data-admin-tab="preview">
      <span>◉</span>
      Preview
    </button>

    <button type="button" data-admin-tab="settings">
      <span>⚙</span>
      Settings
    </button>
  `;
  
  document.body.appendChild(tabBar);
  
  tabBar.querySelectorAll("[data-admin-tab]").forEach(button => {
    button.addEventListener("click", () => {
      showAdminTab(button.dataset.adminTab);
    });
  });
  
  showAdminTab(activeAdminTab);
}

function showAdminTab(tabName) {
  activeAdminTab = tabName;
  localStorage.setItem("emx_admin_active_tab", activeAdminTab);
  
  Object.entries(adminSections).forEach(([name, section]) => {
    if (!section) return;
    
    section.classList.toggle("admin-tab-hidden", name !== activeAdminTab);
    section.classList.toggle("admin-tab-active", name === activeAdminTab);
  });
  
  document.querySelectorAll("#adminTabBar [data-admin-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.adminTab === activeAdminTab);
  });
  
  if (activeAdminTab === "preview") {
    renderPreview();
  }
  
  if (activeAdminTab === "media") {
    renderMediaLibrary();
  }
  
  lockAdminMobileWidth();
  
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, 50);
}

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

function renderProductList() {
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
      
      if (typeof showAdminTab === "function") {
        showAdminTab("editor");
      }
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

function renderGalleryPreview() {
  if (!galleryPreviewBox) return;
  
  const galleryItems = fields.gallery.value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);
  
  if (!galleryItems.length) {
    galleryPreviewBox.innerHTML = `
      <div class="gallery-preview-empty">
        No gallery images added yet.
      </div>
    `;
    return;
  }
  
  galleryPreviewBox.innerHTML = galleryItems.map((src, index) => `
    <div class="gallery-preview-item">
      <img src="${escapeHtml(src)}" alt="Gallery image ${index + 1}" onerror="this.src='./emx-logo.png'">
      <span>${index + 1}. ${escapeHtml(src.split("/").pop())}</span>
    </div>
  `).join("");
}

function renderPreview() {
  renderGalleryPreview();
  
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