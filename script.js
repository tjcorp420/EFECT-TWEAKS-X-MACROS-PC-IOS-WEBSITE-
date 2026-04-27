const PRODUCTS = [
  {
    id: "optimizer",
    key: "KQLzN",
    productUrl: "https://payhip.com/b/KQLzN",
    title: "Efect Zero Delay Optimizer",
    eyebrow: "Optimization Pack",
    price: 25.00,
    oldPrice: 50.00,
    image: "./optimizer.png",
    previewType: "image",
    previewSrc: "./optimizer.png",
    description: "Windows optimization pack focused on reducing background load, cleaning startup behavior, tightening process priority, and applying performance presets for a smoother low-latency desktop and gaming setup.",
    features: [
      "Startup and background load cleanup",
      "Process priority and service presets",
      "Network and responsiveness tuning",
      "Step-by-step performance setup"
    ]
  },
  {
    id: "macro",
    key: "0TOjr",
    productUrl: "https://payhip.com/b/0TOjr",
    title: "Efect Pro Keyboard Macro",
    eyebrow: "Control Pack",
    price: 15.00,
    oldPrice: 30.00,
    image: "./macro.png",
    previewType: "video",
    previewSrc: "./preview.mp4",
    fallbackPreview: "./macro.png",
    description: "EFECT keyboard profile interface built for saved binds, clean toggle controls, delay adjustment, and fast profile switching. Designed for simple setup, organized controls, and a polished EMX dashboard feel.",
    features: [
      "Saved keybind profile system",
      "Toggle-based macro controls",
      "Adjustable delay settings",
      "Clean EFECT dashboard interface"
    ]
  },
  {
    id: "fps",
    key: "EQIrd",
    productUrl: "https://payhip.com/b/EQIrd",
    title: "FPS Booster",
    eyebrow: "Performance Pack",
    price: 10.99,
    oldPrice: 21.98,
    image: "./fps.png",
    previewType: "image",
    previewSrc: "./fps.png",
    description: "Performance booster pack made for smoother gameplay feel through game profile tuning, background app reduction, display-priority settings, and lightweight optimization presets.",
    features: [
      "Game-focused performance presets",
      "Background app reduction guide",
      "Display and smoothness tuning",
      "Lightweight setup workflow"
    ]
  }
];

const PRODUCT_DETAILS = {
  optimizer: {
    includes: [
      "Windows cleanup checklist and optimization path",
      "Startup and background load reduction steps",
      "Process priority and responsiveness presets",
      "Network and system behavior tuning guidance"
    ],
    setup: [
      "Purchase through secure Payhip checkout",
      "Download or follow delivery instructions",
      "Apply presets carefully and restart when needed",
      "Contact EFECT Discord support for access help"
    ],
    compatibility: [
      "Windows 10 / Windows 11 focused",
      "Best for gaming PCs and laptops",
      "Results depend on hardware and current settings",
      "Use responsibly and follow platform rules"
    ]
  },
  macro: {
    includes: [
      "EFECT keyboard profile dashboard",
      "Saved bind layout and profile controls",
      "Toggle-based interface controls",
      "Delay adjustment and clean UI flow"
    ],
    setup: [
      "Purchase through Payhip",
      "Download the product package",
      "Open the dashboard and configure binds",
      "Save profiles and test settings carefully"
    ],
    compatibility: [
      "Keyboard profile workflow",
      "Windows desktop setup",
      "User is responsible for game and platform rules",
      "Support available for access and setup questions"
    ]
  },
  fps: {
    includes: [
      "Game-focused performance preset guidance",
      "Background app reduction workflow",
      "Display and smoothness tuning checklist",
      "Lightweight setup process"
    ],
    setup: [
      "Purchase and follow Payhip delivery",
      "Close unnecessary background apps",
      "Apply performance-focused settings",
      "Restart, test, and adjust per system"
    ],
    compatibility: [
      "Windows gaming systems",
      "Works best with updated drivers",
      "No fixed FPS number guaranteed",
      "Results vary by PC and game configuration"
    ]
  }
};

const LEGAL_PAGES = {
  privacy: {
    title: "Privacy Policy",
    html: `
      <h3>1. Information We Collect</h3>
      <p>EFECT does not directly process card payments on this page. Purchases are handled through Payhip checkout. This storefront may store your selected cart items locally in your browser so the cart can stay saved while you browse.</p>

      <h3>2. Payment Information</h3>
      <p>Payment details, billing information, and checkout security are handled by Payhip and its payment partners. EFECT does not receive or store your full payment card information from this website.</p>

      <h3>3. Local Browser Storage</h3>
      <p>This site uses localStorage to remember cart selections. You can clear this data by clearing your browser site data or using the Clear Cart button.</p>

      <h3>4. External Links</h3>
      <p>This site links to Payhip, TikTok, and Discord-related support. Once you leave this website, those platforms operate under their own privacy policies and terms.</p>

      <h3>5. Support</h3>
      <p>For support, contact EFECT through the Discord username shown on this storefront. Do not send private payment card information through Discord messages.</p>
    `
  },
  faq: {
    title: "FAQ",
    html: `
      <div class="faq-item">
        <h3>How do I receive my product?</h3>
        <p>After purchasing through Payhip, follow the download or delivery instructions shown by Payhip. For access help, contact the EFECT Discord username listed on this storefront.</p>
      </div>

      <div class="faq-item">
        <h3>Are purchases instant?</h3>
        <p>Checkout is direct through Payhip. Digital delivery is normally available after payment confirmation, depending on the product setup and verification process.</p>
      </div>

      <div class="faq-item">
        <h3>What does the optimizer do?</h3>
        <p>The optimizer focuses on Windows cleanup, background load reduction, startup behavior, priority presets, and performance-focused settings for smoother system responsiveness.</p>
      </div>

      <div class="faq-item">
        <h3>What does the FPS Booster do?</h3>
        <p>The FPS Booster is focused on smoother gameplay setup through game profile tuning, reduced background usage, display-related adjustments, and performance preset guidance.</p>
      </div>

      <div class="faq-item">
        <h3>What does the macro product include?</h3>
        <p>The macro product focuses on keyboard profile controls, saved binds, toggle controls, delay settings, and a clean EFECT dashboard interface.</p>
      </div>

      <div class="faq-item">
        <h3>Do I need to follow game or platform rules?</h3>
        <p>Yes. You are responsible for using all tools only where allowed and for following the rules of any game, platform, tournament, or service you use.</p>
      </div>

      <div class="faq-item">
        <h3>Are refunds available?</h3>
        <p>Digital products are generally final once delivered or accessed. Contact support if you have a delivery problem or purchased the wrong item.</p>
      </div>
    `
  },
  agreement: {
    title: "User Agreement",
    html: `
      <h3>1. Digital Product Terms</h3>
      <p>All EFECT products are digital items. By purchasing, you understand that access, downloads, files, keys, or setup instructions may be delivered digitally.</p>

      <h3>2. Personal Use License</h3>
      <p>Products are provided for your personal use only. You may not resell, leak, redistribute, re-upload, share license keys, or claim EFECT files as your own.</p>

      <h3>3. Platform Compliance</h3>
      <p>You are responsible for following the rules of any game, platform, tournament, or service where you use EFECT products. Do not use any product in a way that violates third-party terms, laws, or platform rules.</p>

      <h3>4. No Guaranteed Results</h3>
      <p>Performance results can vary depending on your PC, Windows settings, hardware, drivers, background apps, internet connection, and game configuration. EFECT does not guarantee a specific FPS number, ping number, or competitive result.</p>

      <h3>5. Support</h3>
      <p>Support is available through the EFECT contact method shown on this storefront. Support may require proof of purchase, screenshots, or basic system details to help troubleshoot delivery or setup issues.</p>

      <h3>6. Refunds and Chargebacks</h3>
      <p>Because these are digital products, purchases are generally final after access or delivery. Fraudulent chargebacks, unauthorized sharing, or abuse of support may result in access removal.</p>

      <h3>7. Acceptance</h3>
      <p>By purchasing or using an EFECT product, you agree to these terms and understand that product access can be revoked if the terms are violated.</p>
    `
  }
};

const ACTIVITY_TOASTS = [
  "<strong>Live Store Activity</strong><br>Zero Delay Optimizer is one of the most viewed packs today.",
  "<strong>Popular Pick</strong><br>FPS Booster is trending with performance-focused setups.",
  "<strong>EMX Notice</strong><br>Keyboard Macro profile pack is getting attention right now.",
  "<strong>Secure Checkout Ready</strong><br>Buy Now and cart checkout are connected to Payhip.",
  "<strong>Support Reminder</strong><br>Need help after purchase? Contact EFECT through Discord."
];

const CHECKOUT_BASE = "https://payhip.com/buy";
const CART_STORAGE_KEY = "efect_cart_v3";

const bootAudio = document.getElementById("bootAudio");
const clickAudio = document.getElementById("clickAudio");

const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");

let cart = loadCart();
let activityIndex = 0;
let activityTimer = null;

function money(value){
  return "$" + Number(value).toFixed(2);
}

function productCheckoutUrl(key){
  return CHECKOUT_BASE + "?link=" + encodeURIComponent(key);
}

function cartCheckoutUrl(){
  const uniqueKeys = [...new Set(cart)];

  if(uniqueKeys.length === 1){
    return productCheckoutUrl(uniqueKeys[0]);
  }

  const query = uniqueKeys
    .map(key => "cart_links[]=" + encodeURIComponent(key))
    .join("&");

  return CHECKOUT_BASE + "?" + query;
}

function loadCart(){
  try{
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  }catch(error){
    return [];
  }
}

function saveCart(){
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function escapeHtml(value){
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTitle(title){
  return title
    .replace("FPS", '<span class="accent">FPS</span>')
    .replace("Efect", '<span class="accent">Efect</span>');
}

function renderProducts(){
  productGrid.innerHTML = PRODUCTS.map(product => {
    const discount = Math.round((1 - product.price / product.oldPrice) * 100);

    return `
      <article class="product-card" data-search="${escapeHtml(`${product.title} ${product.description} ${product.eyebrow}`.toLowerCase())}">
        <div class="product-top">
          <div class="product-title-wrap">
            <div class="product-eyebrow">${escapeHtml(product.eyebrow)}</div>
            <h2 class="card-title">${formatTitle(escapeHtml(product.title))}</h2>
          </div>

          <button
            class="card-icon-shell play-click"
            type="button"
            data-action="preview"
            data-title="${escapeHtml(product.title)}"
            data-preview-type="${escapeHtml(product.previewType)}"
            data-preview-src="${escapeHtml(product.previewSrc)}"
            data-fallback-preview="${escapeHtml(product.fallbackPreview || product.image)}"
            aria-label="Preview ${escapeHtml(product.title)}"
          >
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="card-icon">
          </button>
        </div>

        <div class="price-row">
          <span class="current-price">${money(product.price)}</span>
          <span class="old-price">${money(product.oldPrice)}</span>
          <span class="discount-badge">${discount}% OFF</span>
        </div>

        <div class="meta-info">
          <span>one-time payment</span>
          <span>•</span>
          <strong>Secure Payhip checkout</strong>
        </div>

        <p class="description-block">${escapeHtml(product.description)}</p>

        <div class="preview-wrap">
          <button
            class="preview-image-btn play-click"
            type="button"
            data-action="preview"
            data-title="${escapeHtml(product.title)}"
            data-preview-type="${escapeHtml(product.previewType)}"
            data-preview-src="${escapeHtml(product.previewSrc)}"
            data-fallback-preview="${escapeHtml(product.fallbackPreview || product.image)}"
            aria-label="Open preview for ${escapeHtml(product.title)}"
          >
            <img src="${escapeHtml(product.image)}" class="preview-img" alt="${escapeHtml(product.title)} preview">
          </button>

          <span class="preview-label">Tap Image To Preview</span>

          <button
            class="preview-share play-click"
            type="button"
            data-action="share-product"
            data-key="${escapeHtml(product.key)}"
            aria-label="Share ${escapeHtml(product.title)}"
          >
            ↗
          </button>
        </div>

        <ul class="feature-checklist">
          ${product.features.map(feature => `
            <li class="feature-item">
              <span class="check-icon">✓</span>
              <span>${escapeHtml(feature)}</span>
            </li>
          `).join("")}
        </ul>

        <div class="button-group-row">
          <button
            class="btn-outline play-click"
            type="button"
            data-action="detail"
            data-key="${escapeHtml(product.key)}"
          >
            ✦ Details
          </button>

          <button class="btn-outline green play-click" type="button" data-action="add" data-key="${escapeHtml(product.key)}">
            🛒 Add
          </button>
        </div>

        <button class="btn-filled play-click" type="button" data-action="buy" data-key="${escapeHtml(product.key)}">
          Buy Now →
        </button>
      </article>
    `;
  }).join("");
}

function addToCart(key){
  const product = PRODUCTS.find(item => item.key === key);

  if(!product){
    showToast("Product not found.");
    return;
  }

  if(!cart.includes(key)){
    cart.push(key);
    saveCart();
    updateCartUI();
    showToast("<strong>Added to cart.</strong><br>" + escapeHtml(product.title) + " is ready for secure checkout.");
  }else{
    showToast("<strong>Already in cart.</strong><br>This product is already selected.");
  }
}

function removeFromCart(key){
  cart = cart.filter(item => item !== key);
  saveCart();
  updateCartUI();
}

function clearCart(){
  cart = [];
  saveCart();
  updateCartUI();
  showToast("Cart cleared.");
}

function setButtonLoading(button, text){
  if(!button) return;

  button.dataset.originalText = button.innerHTML;
  button.innerHTML = text;
  button.classList.add("btn-loading");
}

function setCheckoutLoading(button) {
  if (!button) return;
  
  button.classList.add("payhip-loading");
  button.disabled = true;
  
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.innerHTML;
  }
  
  button.innerHTML = `
    <span class="payhip-loading-label">SECURE PAYHIP CHECKOUT</span>
    <span class="payhip-loading-bar"><i></i></span>
  `;
}

function goToPayhip(url, button) {
  setCheckoutLoading(button);
  
  setTimeout(() => {
    window.location.assign(url);
  }, 650);
}

function buyNow(key, button) {
  const product = getProductByKey(key);
  
  if (!product) {
    showToast("Product not found.");
    return;
  }
  
  goToPayhip(product.productUrl || productCheckoutUrl(key), button);
}

function checkout(button) {
  if (cart.length === 0) {
    showToast("Your cart is empty. Add a product first.");
    return;
  }
  
  goToPayhip(cartCheckoutUrl(), button);
}

function updateCartUI(){
  const items = cart
    .map(key => PRODUCTS.find(product => product.key === key))
    .filter(Boolean);

  cartCount.textContent = items.length;
  cartCount.classList.toggle("show", items.length > 0);

  if(items.length === 0){
    cartList.innerHTML = `
      <div class="cart-empty">
        <div>
          <strong style="color:white;font-size:20px;">Cart is empty</strong><br><br>
          Add a product, then proceed directly to secure Payhip checkout.
        </div>
      </div>
    `;
  }else{
    cartList.innerHTML = items.map(product => `
      <div class="cart-item">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}">
        <div>
          <h4>${escapeHtml(product.title)}</h4>
          <p>${money(product.price)}</p>
        </div>
        <button class="remove-btn play-click" type="button" data-action="remove" data-key="${escapeHtml(product.key)}">×</button>
      </div>
    `).join("");
  }

  const total = items.reduce((sum, product) => sum + product.price, 0);
  cartTotal.textContent = money(total);
}

function openCart(){
  cartDrawer.classList.add("show");
  drawerBackdrop.classList.add("show");
  document.body.classList.add("no-scroll");
}

function closeCart(){
  cartDrawer.classList.remove("show");
  drawerBackdrop.classList.remove("show");

  if(
    !document.body.classList.contains("booting") &&
    !document.getElementById("media-modal").classList.contains("show") &&
    !document.getElementById("legal-modal").classList.contains("show") &&
    !document.getElementById("detail-modal").classList.contains("show")
  ){
    document.body.classList.remove("no-scroll");
  }
}

function openPreview(type, src, title, fallbackPreview){
  const modal = document.getElementById("media-modal");
  const img = document.getElementById("modal-img");
  const video = document.getElementById("modal-video");
  const videoSource = document.getElementById("video-source");
  const modalTitle = document.getElementById("modalTitle");

  modalTitle.textContent = title || "Product Preview";
  modal.classList.add("show");
  document.body.classList.add("no-scroll");

  img.style.display = "none";
  video.style.display = "none";
  video.pause();
  video.currentTime = 0;

  if(type === "video"){
    videoSource.src = src;
    video.load();
    video.style.display = "block";

    video.play().catch(() => {
      if(fallbackPreview){
        video.style.display = "none";
        img.src = fallbackPreview;
        img.style.display = "block";
      }
    });

    return;
  }

  img.src = src;
  img.style.display = "block";
}

function closeModal(){
  const modal = document.getElementById("media-modal");
  const video = document.getElementById("modal-video");

  modal.classList.remove("show");
  video.pause();
  video.currentTime = 0;

  if(!cartDrawer.classList.contains("show") && !document.body.classList.contains("booting")){
    document.body.classList.remove("no-scroll");
  }
}

function openProductDetails(key){
  const product = getProductByKey(key);

  if(!product){
    showToast("Product not found.");
    return;
  }

  const detail = PRODUCT_DETAILS[product.id] || {
    includes: product.features || [],
    setup: ["Purchase through secure checkout", "Follow delivery instructions", "Contact support if needed"],
    compatibility: ["Digital product", "Results vary by system", "Use responsibly"]
  };

  document.getElementById("detailEyebrow").textContent = product.eyebrow;
  document.getElementById("detailTitle").innerHTML = escapeHtml(product.title).replace("Efect", "<span>Efect</span>").replace("FPS", "<span>FPS</span>");
  document.getElementById("detailDescription").textContent = product.description;
  document.getElementById("detailImage").src = product.image;
  document.getElementById("detailImage").alt = product.title;
  document.getElementById("detailIncludes").innerHTML = detail.includes.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  document.getElementById("detailSetup").innerHTML = detail.setup.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  document.getElementById("detailCompat").innerHTML = detail.compatibility.map(item => `<li>${escapeHtml(item)}</li>`).join("");

  const addBtn = document.getElementById("detailAddBtn");
  const buyBtn = document.getElementById("detailBuyBtn");

  addBtn.dataset.key = product.key;
  buyBtn.dataset.key = product.key;

  document.getElementById("detail-modal").classList.add("show");
  document.body.classList.add("no-scroll");
}

function closeProductDetails(){
  document.getElementById("detail-modal").classList.remove("show");

  if(!cartDrawer.classList.contains("show") && !document.getElementById("media-modal").classList.contains("show") && !document.getElementById("legal-modal").classList.contains("show")){
    document.body.classList.remove("no-scroll");
  }
}

function addBundleToCart(){
  PRODUCTS.forEach(product => {
    if(!cart.includes(product.key)){
      cart.push(product.key);
    }
  });

  saveCart();
  updateCartUI();
  showToast("<strong>EFECT Ultimate Pack added.</strong><br>All products are ready for secure checkout.");
}

function buyBundle(button){
  cart = PRODUCTS.map(product => product.key);
  saveCart();
  updateCartUI();

  setButtonLoading(button, "Connecting To Payhip");
  setTimeout(() => {
    window.location.href = cartCheckoutUrl();
  }, 450);
}

function toggleFaq(button){
  const row = button.closest(".faq-row");
  if(!row) return;
  row.classList.toggle("open");
}

function openLegal(pageKey){
  const page = LEGAL_PAGES[pageKey] || LEGAL_PAGES.faq;
  const modal = document.getElementById("legal-modal");
  const title = document.getElementById("legalTitle");
  const content = document.getElementById("legalContent");

  title.innerHTML = "EFECT <span>" + escapeHtml(page.title) + "</span>";
  content.innerHTML = page.html;

  modal.classList.add("show");
  document.body.classList.add("no-scroll");
}

function closeLegal(){
  const modal = document.getElementById("legal-modal");
  modal.classList.remove("show");

  if(!cartDrawer.classList.contains("show") && !document.getElementById("media-modal").classList.contains("show") && !document.getElementById("detail-modal").classList.contains("show")){
    document.body.classList.remove("no-scroll");
  }
}

function showToast(message){
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");

  toast.className = "toast";
  toast.innerHTML = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 260);
  }, 3900);
}

function startActivityToasts(){
  clearInterval(activityTimer);

  activityTimer = setInterval(() => {
    if(!document.body.classList.contains("app-ready")) return;
    if(document.getElementById("media-modal").classList.contains("show")) return;
    if(document.getElementById("legal-modal").classList.contains("show")) return;
    if(document.getElementById("detail-modal").classList.contains("show")) return;
    if(cartDrawer.classList.contains("show")) return;

    const message = ACTIVITY_TOASTS[activityIndex % ACTIVITY_TOASTS.length];
    activityIndex++;

    showToast(message);
  }, 26000);
}

function showDiscordToast(){
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");

  toast.className = "toast";
  toast.innerHTML = `
    <strong style="font-size:18px;">👾 Join the Discord</strong><br><br>
    Add me to ask for access to the server.<br>
    <span style="color:var(--green);font-weight:900;margin:10px 0;display:block;font-size:20px;letter-spacing:.04em;">Ur_not_himfr</span>
    <button class="toast-copy-btn play-click" data-action="copy-discord" type="button">Copy Username</button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    if(toast.parentElement){
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 260);
    }
  }, 8000);
}

function copyDiscord(username){
  navigator.clipboard.writeText(username).then(() => {
    showToast("Discord username copied.");
  }).catch(() => {
    showToast("Copy failed. Username: <strong>" + escapeHtml(username) + "</strong>");
  });
}

function getProductByKey(key){
  return PRODUCTS.find(product => product.key === key);
}

function shareProduct(key){
  const product = getProductByKey(key);

  if(!product){
    showToast("Product not found.");
    return;
  }

  const productLink = product.productUrl || productCheckoutUrl(product.key);
  const shareText = `${product.title} — ${product.eyebrow} by EFECT`;

  if(navigator.share){
    navigator.share({
      title:product.title,
      text:shareText,
      url:productLink
    }).catch(() => {});
  }else{
    navigator.clipboard.writeText(productLink).then(() => {
      showToast("<strong>Product link copied.</strong><br>" + escapeHtml(product.title));
    }).catch(() => {
      showToast("Copy failed.");
    });
  }
}

function shareApp(){
  if(navigator.share){
    navigator.share({
      title:"EMX EFECT MACROS X TWEAKS",
      text:"EFECT digital storefront with direct Payhip checkout.",
      url:window.location.href
    }).catch(() => {});
  }else{
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast("Store link copied.");
    }).catch(() => {
      showToast("Copy failed.");
    });
  }
}

function toggleSearch(){
  const panel = document.getElementById("searchPanel");
  const input = document.getElementById("searchInput");

  panel.classList.toggle("show");

  if(panel.classList.contains("show")){
    setTimeout(() => input.focus(), 80);
  }else{
    input.value = "";
    filterProducts("");
  }
}

function filterProducts(value){
  const query = value.trim().toLowerCase();

  document.querySelectorAll(".product-card").forEach(card => {
    const haystack = card.dataset.search || "";
    card.classList.toggle("hidden", Boolean(query) && !haystack.includes(query));
  });
}

function playClickSound(){
  try{
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }catch(error){}
}

async function enterDomain(){
  const btn = document.getElementById("enterBtn");

  btn.classList.add("booting");
  document.body.classList.add("booting");

  try{
    bootAudio.currentTime = 0;
    await bootAudio.play();
  }catch(error){}

  setTimeout(() => {
    document.body.classList.add("app-ready");
    document.body.classList.remove("no-scroll");
    document.body.classList.remove("booting");
    startActivityToasts();
showInstallPopup();
  }, 560);
}

function setupEvents(){
  document.getElementById("enterBtn").addEventListener("click", enterDomain);

  document.addEventListener("click", event => {
    const clickTarget = event.target.closest(".play-click");

    if(clickTarget && clickTarget.id !== "enterBtn"){
      playClickSound();
    }

    const actionTarget = event.target.closest("[data-action]");

    if(!actionTarget) return;

    const action = actionTarget.dataset.action;

    if(action === "preview"){
      openPreview(
        actionTarget.dataset.previewType,
        actionTarget.dataset.previewSrc,
        actionTarget.dataset.title,
        actionTarget.dataset.fallbackPreview
      );
    }

    if(action === "share-product"){
      event.preventDefault();
      event.stopPropagation();
      shareProduct(actionTarget.dataset.key);
    }

    if(action === "detail"){
      openProductDetails(actionTarget.dataset.key);
    }

    if(action === "faq-toggle"){
      toggleFaq(actionTarget);
    }

    if(action === "add-bundle"){
      addBundleToCart();
    }

    if(action === "buy-bundle"){
      buyBundle(actionTarget);
    }

    if(action === "add"){
      addToCart(actionTarget.dataset.key);
    }

    if (action === "buy") {
  buyNow(actionTarget.dataset.key, actionTarget);
}

    if(action === "remove"){
      removeFromCart(actionTarget.dataset.key);
    }

    if(action === "copy-discord"){
      copyDiscord("Ur_not_himfr");
    }

    if(action === "legal"){
      openLegal(actionTarget.dataset.legal);
    }
  });

  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("drawerClose").addEventListener("click", closeCart);
  document.getElementById("drawerBackdrop").addEventListener("click", closeCart);

  document.getElementById("checkoutBtn").addEventListener("click", event => checkout(event.currentTarget));
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);

  document.getElementById("searchToggle").addEventListener("click", toggleSearch);
  document.getElementById("searchInput").addEventListener("input", event => {
    filterProducts(event.target.value);
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    openLegal("faq");
  });

  document.getElementById("discordBtn").addEventListener("click", showDiscordToast);
  document.getElementById("shareBtn").addEventListener("click", shareApp);

  document.getElementById("media-modal").addEventListener("click", event => {
    if(event.target.id === "media-modal"){
      closeModal();
    }
  });

  document.getElementById("legal-modal").addEventListener("click", event => {
    if(event.target.id === "legal-modal"){
      closeLegal();
    }
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("legalClose").addEventListener("click", closeLegal);
  document.getElementById("detailClose").addEventListener("click", closeProductDetails);
  document.getElementById("detailAddBtn").addEventListener("click", event => addToCart(event.currentTarget.dataset.key));
  document.getElementById("detailBuyBtn").addEventListener("click", event => buyNow(event.currentTarget.dataset.key, event.currentTarget));

  document.getElementById("detail-modal").addEventListener("click", event => {
    if(event.target.id === "detail-modal"){
      closeProductDetails();
    }
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape"){
      closeModal();
      closeLegal();
      closeProductDetails();
      closeCart();
    }
  });
}

function createGalaxy(canvasId, options = {}){
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let particles = [];
  let raf = null;

  const particleCount = options.count || 110;
  const speed = options.speed || .22;
  const glow = options.glow || 11;
  const colors = options.colors || [
    "rgba(36,255,36,.78)",
    "rgba(162,12,255,.76)",
    "rgba(255,255,255,.55)"
  ];

  function resize(){
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    seed();
  }

  function seed(){
    particles = Array.from({ length: particleCount }, () => makeParticle(true));
  }

  function makeParticle(randomY){
    const radius = Math.random() * 1.8 + .45;
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + 20,
      radius,
      vx: (Math.random() - .5) * speed,
      vy: -(Math.random() * speed + .08),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * .65 + .25,
      pulse: Math.random() * Math.PI * 2
    };
  }

  function drawNebula(time){
    const cx = width * .5 + Math.sin(time * .00012) * 90;
    const cy = height * .48 + Math.cos(time * .00010) * 70;

    const purple = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * .62);
    purple.addColorStop(0, "rgba(162,12,255,.15)");
    purple.addColorStop(.42, "rgba(162,12,255,.055)");
    purple.addColorStop(1, "rgba(162,12,255,0)");
    ctx.fillStyle = purple;
    ctx.fillRect(0, 0, width, height);

    const green = ctx.createRadialGradient(width * .23, height * .78, 0, width * .23, height * .78, Math.max(width, height) * .55);
    green.addColorStop(0, "rgba(36,255,36,.115)");
    green.addColorStop(.44, "rgba(36,255,36,.04)");
    green.addColorStop(1, "rgba(36,255,36,0)");
    ctx.fillStyle = green;
    ctx.fillRect(0, 0, width, height);
  }

  function drawConnections(){
    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if(dist < 92){
          ctx.globalAlpha = (1 - dist / 92) * .16;
          ctx.strokeStyle = "rgba(255,255,255,.45)";
          ctx.lineWidth = .7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  function draw(time){
    ctx.clearRect(0, 0, width, height);
    drawNebula(time);

    for(const particle of particles){
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.pulse += .016;

      if(particle.y < -20 || particle.x < -20 || particle.x > width + 20){
        Object.assign(particle, makeParticle(false));
      }

      const pulseAlpha = particle.alpha + Math.sin(particle.pulse) * .15;

      ctx.save();
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = glow;
      ctx.globalAlpha = Math.max(.12, pulseAlpha);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawConnections();

    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

renderProducts();
updateCartUI();
setupEvents();

createGalaxy("galaxyCanvas", {
  count: 118,
  speed: .23,
  glow: 12
});

createGalaxy("bootGalaxy", {
  count: 92,
  speed: .18,
  glow: 15
});

const INSTALL_POPUP_KEY = "emx_install_popup_seen_v1";

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function showInstallPopup() {
  const popup = document.getElementById("installAppPopup");
  
  if (!popup) return;
  if (isStandaloneApp()) return;
  if (localStorage.getItem(INSTALL_POPUP_KEY) === "yes") return;
  
  setTimeout(() => {
    popup.classList.add("show");
    document.body.classList.add("no-scroll");
  }, 1800);
}

function closeInstallPopup() {
  const popup = document.getElementById("installAppPopup");
  
  if (!popup) return;
  
  popup.classList.remove("show");
  localStorage.setItem(INSTALL_POPUP_KEY, "yes");
  
  if (
    !cartDrawer.classList.contains("show") &&
    !document.getElementById("media-modal").classList.contains("show") &&
    !document.getElementById("legal-modal").classList.contains("show") &&
    !document.getElementById("detail-modal").classList.contains("show") &&
    !document.body.classList.contains("booting")
  ) {
    document.body.classList.remove("no-scroll");
  }
}

function copyInstallName() {
  navigator.clipboard.writeText("EMX TWEAKS").then(() => {
    showToast("<strong>App name copied.</strong><br>Use EMX TWEAKS on the Home Screen.");
  }).catch(() => {
    showToast("App name: <strong>EMX TWEAKS</strong>");
  });
}

document.getElementById("installCloseBtn")?.addEventListener("click", closeInstallPopup);
document.getElementById("installLaterBtn")?.addEventListener("click", closeInstallPopup);
document.getElementById("installCopyBtn")?.addEventListener("click", copyInstallName);

document.getElementById("installAppPopup")?.addEventListener("click", event => {
  if (event.target.id === "installAppPopup") {
    closeInstallPopup();
  }
});