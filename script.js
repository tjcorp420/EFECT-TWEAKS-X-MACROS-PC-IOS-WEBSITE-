function removeInstantBlackout() {
  const bootScreen = document.getElementById("boot-screen");
  const blackout = document.getElementById("instantBlackout");
  
  if (bootScreen) {
    bootScreen.style.display = "";
    bootScreen.style.opacity = "";
    bootScreen.style.visibility = "";
  }
  
  document.body.classList.add("instant-ready");
  
  if (blackout) {
    setTimeout(() => {
      blackout.remove();
    }, 450);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(removeInstantBlackout, 700);
});

window.addEventListener("load", () => {
  setTimeout(removeInstantBlackout, 700);
});

setTimeout(removeInstantBlackout, 1600);

document.addEventListener("DOMContentLoaded", () => {
      let PRODUCTS = window.EMX_PRODUCTS || [];
      
      async function loadProductsFromApi() {
    try{
      const response = await fetch("/api/products", {
        cache: "no-store"
      });

      if(!response.ok){
        throw new Error("Failed to load live products.");
      }

      const liveProducts = await response.json();

      if(Array.isArray(liveProducts) && liveProducts.length > 0){
        PRODUCTS = liveProducts;
      }
    }catch(error){
      console.warn("Using local products.js fallback:", error);
    }
  }

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
    },
    bundle: {
      includes: [
        "Zero Delay Optimizer access",
        "FPS Booster access",
        "Keyboard Macro dashboard access",
        "Priority setup support path"
      ],
      setup: [
        "Press bundle checkout",
        "Complete secure Payhip cart checkout",
        "Follow delivery instructions for each item",
        "Contact EFECT Discord support for help"
      ],
      compatibility: [
        "Windows gaming systems",
        "Digital product bundle",
        "Results vary by PC and setup",
        "Use responsibly and follow platform rules"
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
  const INSTALL_POPUP_KEY = "emx_install_popup_seen_v1";

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
  let isLaunching = false;

  function money(value){
    return "$" + Number(value || 0).toFixed(2);
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
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatTitle(title){
    return title
      .replace("FPS", '<span class="accent">FPS</span>')
      .replace("Efect", '<span class="accent">Efect</span>')
      .replace("EFECT", '<span class="accent">EFECT</span>');
  }

  function getProductByKey(key){
    return PRODUCTS.find(product => product.key === key);
  }

  function getBundleProduct(){
    return PRODUCTS.find(product => product.id === "bundle");
  }

  function getStoreProducts(){
    return PRODUCTS.filter(product => product.id !== "bundle" && product.visible !== false);
  }

  function renderProducts(){
    if(!productGrid) return;

    productGrid.innerHTML = getStoreProducts().map(product => {
      const oldPrice = Number(product.oldPrice || 0);
      const price = Number(product.price || 0);
      const discount = oldPrice > price && oldPrice > 0
        ? Math.round((1 - price / oldPrice) * 100)
        : 0;

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
              data-key="${escapeHtml(product.key)}"
              data-title="${escapeHtml(product.title)}"
              data-preview-type="${escapeHtml(product.previewType || "image")}"
              data-preview-src="${escapeHtml(product.previewSrc || product.image)}"
              data-fallback-preview="${escapeHtml(product.fallbackPreview || product.image)}"
              aria-label="Preview ${escapeHtml(product.title)}"
            >
              <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="card-icon">
            </button>
          </div>

          <div class="price-row">
            <span class="current-price">${money(product.price)}</span>
            <span class="old-price">${money(product.oldPrice)}</span>
            <span class="discount-badge">${discount > 0 ? discount + "% OFF" : "DEAL"}</span>
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
              data-key="${escapeHtml(product.key)}"
              data-title="${escapeHtml(product.title)}"
              data-preview-type="${escapeHtml(product.previewType || "image")}"
              data-preview-src="${escapeHtml(product.previewSrc || product.image)}"
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

          ${Array.isArray(product.gallery) && product.gallery.length ? `
            <div class="product-gallery-row">
              ${product.gallery.map(src => `
                <button
                  class="gallery-thumb-btn play-click"
                  type="button"
                  data-action="preview"
                  data-key="${escapeHtml(product.key)}"
                  data-title="${escapeHtml(product.title)}"
                  data-preview-type="image"
                  data-preview-src="${escapeHtml(src)}"
                  data-fallback-preview="${escapeHtml(product.image)}"
                  aria-label="Preview gallery image for ${escapeHtml(product.title)}"
                >
                  <img src="${escapeHtml(src)}" alt="${escapeHtml(product.title)} gallery image">
                </button>
              `).join("")}
            </div>
          ` : ""}

          <ul class="feature-checklist">
            ${(Array.isArray(product.features) ? product.features : []).map(feature => `
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
    const product = getProductByKey(key);

    if(!product || product.id === "bundle"){
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

  function setCheckoutLoading(button){
    if(!button) return;

    if(!button.dataset.originalText){
      button.dataset.originalText = button.innerHTML;
    }

    button.classList.add("payhip-loading");
    button.disabled = true;

    button.innerHTML = `
      <span class="payhip-loading-label">SECURE PAYHIP CHECKOUT</span>
      <span class="payhip-loading-bar"><i></i></span>
    `;
  }

  function showPayLoadingScreen(url, button){
    const overlay = document.getElementById("emxPayLoading");
    const status = document.getElementById("emxPayStatus");
    const bar = document.getElementById("emxPayBarFill");
    const stepOne = document.getElementById("payStepOne");
    const stepTwo = document.getElementById("payStepTwo");
    const stepThree = document.getElementById("payStepThree");

    setCheckoutLoading(button);

    if(!overlay){
      setTimeout(() => {
        window.location.href = url;
      }, 650);
      return;
    }

    document.body.classList.add("no-scroll");

    overlay.classList.remove("exit");
    overlay.classList.add("show");

    if(status) status.textContent = "Verifying product selection...";
    if(bar) bar.style.width = "0%";

    [stepOne, stepTwo, stepThree].forEach(step => {
      if(step){
        step.classList.remove("active", "done");
      }
    });

    if(stepOne) stepOne.classList.add("active");

    setTimeout(() => {
      if(status) status.textContent = "Product verified.";
      if(bar) bar.style.width = "34%";

      if(stepOne){
        stepOne.classList.remove("active");
        stepOne.classList.add("done");
      }

      if(stepTwo) stepTwo.classList.add("active");
    }, 360);

    setTimeout(() => {
      if(status) status.textContent = "Connecting to official Payhip checkout...";
      if(bar) bar.style.width = "68%";

      if(stepTwo){
        stepTwo.classList.remove("active");
        stepTwo.classList.add("done");
      }

      if(stepThree) stepThree.classList.add("active");
    }, 820);

    setTimeout(() => {
      if(status) status.textContent = "Opening secure checkout...";
      if(bar) bar.style.width = "100%";

      if(stepThree){
        stepThree.classList.remove("active");
        stepThree.classList.add("done");
      }
    }, 1180);

    setTimeout(() => {
      overlay.classList.add("exit");
      overlay.classList.remove("show");
    }, 1450);

    setTimeout(() => {
      window.location.href = url;
    }, 1650);
  }

  function goToPayhip(url, button){
    showPayLoadingScreen(url, button);
  }

  function buyNow(key, button){
    const product = getProductByKey(key);

    if(!product || product.id === "bundle"){
      showToast("Product not found.");
      return;
    }

    goToPayhip(product.productUrl || productCheckoutUrl(key), button);
  }

  function checkout(button){
    if(cart.length === 0){
      showToast("Your cart is empty. Add a product first.");
      return;
    }

    goToPayhip(cartCheckoutUrl(), button);
  }

  function buyBundle(button){
    cart = getStoreProducts().map(product => product.key);
    saveCart();
    updateCartUI();
    goToPayhip(cartCheckoutUrl(), button);
  }

  function addBundleToCart(){
    getStoreProducts().forEach(product => {
      if(!cart.includes(product.key)){
        cart.push(product.key);
      }
    });

    saveCart();
    updateCartUI();
    showToast("<strong>EFECT Ultimate Pack added.</strong><br>All products are ready for secure checkout.");
  }

  function updateCartUI(){
    if(!cartCount || !cartList || !cartTotal) return;

    const items = cart
      .map(key => getStoreProducts().find(product => product.key === key))
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

    const total = items.reduce((sum, product) => sum + Number(product.price || 0), 0);
    cartTotal.textContent = money(total);
  }

  function openCart(){
    if(!cartDrawer || !drawerBackdrop) return;

    cartDrawer.classList.add("show");
    drawerBackdrop.classList.add("show");
    document.body.classList.add("no-scroll");
  }

  function closeCart(){
    if(!cartDrawer || !drawerBackdrop) return;

    cartDrawer.classList.remove("show");
    drawerBackdrop.classList.remove("show");
    unlockBodyIfSafe();
  }

  function openPreview(type, src, title, fallbackPreview){
    const modal = document.getElementById("media-modal");
    const img = document.getElementById("modal-img");
    const video = document.getElementById("modal-video");
    const videoSource = document.getElementById("video-source");
    const modalTitle = document.getElementById("modalTitle");

    if(!modal || !img || !video || !videoSource || !modalTitle) return;

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

    if(modal) modal.classList.remove("show");

    if(video){
      video.pause();
      video.currentTime = 0;
    }

    unlockBodyIfSafe();
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

    const modal = document.getElementById("detail-modal");
    if(!modal) return;

    document.getElementById("detailEyebrow").textContent = product.eyebrow || "";
    document.getElementById("detailTitle").innerHTML = escapeHtml(product.title || "")
      .replace("Efect", "<span>Efect</span>")
      .replace("EFECT", "<span>EFECT</span>")
      .replace("FPS", "<span>FPS</span>");

    document.getElementById("detailDescription").textContent = product.description || "";
    document.getElementById("detailImage").src = product.image || "./emx-logo.png";
    document.getElementById("detailImage").alt = product.title || "Product image";
    document.getElementById("detailIncludes").innerHTML = detail.includes.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    document.getElementById("detailSetup").innerHTML = detail.setup.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    document.getElementById("detailCompat").innerHTML = detail.compatibility.map(item => `<li>${escapeHtml(item)}</li>`).join("");

    const addBtn = document.getElementById("detailAddBtn");
    const buyBtn = document.getElementById("detailBuyBtn");

    if(addBtn) addBtn.dataset.key = product.key;
    if(buyBtn) buyBtn.dataset.key = product.key;

    modal.classList.add("show");
    document.body.classList.add("no-scroll");
  }

  function closeProductDetails(){
    const modal = document.getElementById("detail-modal");
    if(modal) modal.classList.remove("show");
    unlockBodyIfSafe();
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

    if(!modal || !title || !content) return;

    title.innerHTML = "EFECT <span>" + escapeHtml(page.title) + "</span>";
    content.innerHTML = page.html;

    modal.classList.add("show");
    document.body.classList.add("no-scroll");
  }

  function closeLegal(){
    const modal = document.getElementById("legal-modal");
    if(modal) modal.classList.remove("show");
    unlockBodyIfSafe();
  }

  function unlockBodyIfSafe(){
    const mediaOpen = document.getElementById("media-modal")?.classList.contains("show");
    const legalOpen = document.getElementById("legal-modal")?.classList.contains("show");
    const detailOpen = document.getElementById("detail-modal")?.classList.contains("show");
    const installOpen = document.getElementById("installAppPopup")?.classList.contains("show");
    const cartOpen = cartDrawer?.classList.contains("show");
    const booting = document.body.classList.contains("booting");
    const payOpen = document.getElementById("emxPayLoading")?.classList.contains("show");

    if(!mediaOpen && !legalOpen && !detailOpen && !installOpen && !cartOpen && !booting && !payOpen){
      document.body.classList.remove("no-scroll");
    }
  }

  function showToast(message){
    const container = document.getElementById("toast-container");
    if(!container) return;

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
      if(document.getElementById("media-modal")?.classList.contains("show")) return;
      if(document.getElementById("legal-modal")?.classList.contains("show")) return;
      if(document.getElementById("detail-modal")?.classList.contains("show")) return;
      if(document.getElementById("installAppPopup")?.classList.contains("show")) return;
      if(document.getElementById("emxPayLoading")?.classList.contains("show")) return;
      if(cartDrawer?.classList.contains("show")) return;

      const message = ACTIVITY_TOASTS[activityIndex % ACTIVITY_TOASTS.length];
      activityIndex++;

      showToast(message);
    }, 26000);
  }

  function showDiscordToast(){
    const container = document.getElementById("toast-container");
    if(!container) return;

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
        title: product.title,
        text: shareText,
        url: productLink
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
        title: "EMX TWEAKS",
        text: "EFECT digital storefront with direct Payhip checkout.",
        url: window.location.href
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

    if(!panel || !input) return;

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
      if(!clickAudio) return;
      clickAudio.currentTime = 0;
      clickAudio.play().catch(() => {});
    }catch(error){}
  }

  function isStandaloneApp(){
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function showInstallPopup(force = false){
    const popup = document.getElementById("installAppPopup");

    if(!popup) return;

    if(!force && isStandaloneApp()) return;
    if(!force && localStorage.getItem(INSTALL_POPUP_KEY) === "yes") return;

    popup.classList.add("show");
    document.body.classList.add("no-scroll");
  }

  function closeInstallPopup(){
    const popup = document.getElementById("installAppPopup");

    if(!popup) return;

    popup.classList.remove("show");
    localStorage.setItem(INSTALL_POPUP_KEY, "yes");
    unlockBodyIfSafe();
  }

  function copyInstallName(){
    navigator.clipboard.writeText("EMX TWEAKS").then(() => {
      showToast("<strong>App name copied.</strong><br>Use EMX TWEAKS on the Home Screen.");
    }).catch(() => {
      showToast("App name: <strong>EMX TWEAKS</strong>");
    });
  }

  async function enterDomain(){
    if(isLaunching) return;

    const btn = document.getElementById("enterBtn");
    const launchOverlay = document.getElementById("emxLaunchOverlay");
    const launchStatus = document.getElementById("emxLaunchStatus");
    const launchPercent = document.getElementById("emxLaunchPercent");
    const launchBarFill =
      document.getElementById("emxLaunchBarFill") ||
      document.querySelector(".emx-launch-bar span");

    if(!btn) return;

    isLaunching = true;

    btn.classList.add("booting");
    document.body.classList.add("booting");
    document.body.classList.add("no-scroll");

    try{
      if(bootAudio){
        bootAudio.currentTime = 0;
        await bootAudio.play();
      }
    }catch(error){}

    if(launchOverlay){
      launchOverlay.classList.remove("exit", "launch-complete");
      launchOverlay.classList.add("show");
    }

    if(launchStatus) launchStatus.textContent = "INITIALIZING EMX CORE";
    if(launchPercent) launchPercent.textContent = "0%";
    if(launchBarFill) launchBarFill.style.width = "0%";

    const stages = [
      { percent: 8, text: "INITIALIZING EMX CORE" },
      { percent: 22, text: "VERIFYING STORE UI" },
      { percent: 41, text: "LOADING PRODUCT CARDS" },
      { percent: 63, text: "LINKING SECURE PAYHIP" },
      { percent: 82, text: "SYNCING EMX DOMAIN" },
      { percent: 100, text: "LAUNCHING STORE" }
    ];

    let stageIndex = 0;

    const stageTimer = setInterval(() => {
      const stage = stages[stageIndex];

      if(stage){
        if(launchStatus) launchStatus.textContent = stage.text;
        if(launchPercent) launchPercent.textContent = stage.percent + "%";
        if(launchBarFill) launchBarFill.style.width = stage.percent + "%";
      }

      stageIndex++;

      if(stageIndex >= stages.length){
        clearInterval(stageTimer);

        setTimeout(() => {
          if(launchOverlay){
            launchOverlay.classList.add("launch-complete");
          }
        }, 250);

        setTimeout(() => {
          if(launchOverlay){
            launchOverlay.classList.add("exit");
            launchOverlay.classList.remove("show");
          }

          document.body.classList.add("app-ready");
          document.body.classList.remove("booting");
          document.body.classList.remove("no-scroll");

          btn.classList.remove("booting");
          isLaunching = false;

          startActivityToasts();
        }, 900);
      }
    }, 430);
  }

  function setupSupportWidget(){
    const widget = document.getElementById("supportWidget");
    const fab = document.getElementById("supportFab");
    const copyBtn = document.getElementById("supportCopyDiscord");
    const faqBtn = document.getElementById("supportOpenFaq");
    const bundleBtn = document.getElementById("supportViewBundle");

    if(fab && widget){
      fab.addEventListener("click", () => {
        widget.classList.toggle("open");
      });
    }

    if(copyBtn){
      copyBtn.addEventListener("click", () => {
        copyDiscord("Ur_not_himfr");
      });
    }

    if(faqBtn){
      faqBtn.addEventListener("click", () => {
        openLegal("faq");
      });
    }

    if(bundleBtn){
      bundleBtn.addEventListener("click", () => {
        document.querySelector(".bundle-card")?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        if(widget){
          widget.classList.remove("open");
        }
      });
    }
  }

  function renderBundleFromAdmin(){
    const bundle = getBundleProduct();

    if(!bundle) return;

    const bundleCard = document.querySelector(".bundle-card");
    if(!bundleCard) return;

    const title = bundleCard.querySelector("[data-bundle-title]");
    const eyebrow = bundleCard.querySelector("[data-bundle-eyebrow]");
    const description = bundleCard.querySelector("[data-bundle-description]");
    const price = bundleCard.querySelector("[data-bundle-price]");
    const oldPrice = bundleCard.querySelector("[data-bundle-old-price]");
    const discount = bundleCard.querySelector("[data-bundle-discount]");
    const features = bundleCard.querySelector("[data-bundle-features]");
    const gallery = bundleCard.querySelector("[data-bundle-gallery]");

    if(title) title.textContent = bundle.title || "EFECT Ultimate Pack";
    if(eyebrow) eyebrow.textContent = bundle.eyebrow || "Best Value Bundle";
    if(description) description.textContent = bundle.description || "";

    if(price) price.textContent = money(bundle.price || 0);
    if(oldPrice) oldPrice.textContent = money(bundle.oldPrice || 0);

    if(discount){
      const oldValue = Number(bundle.oldPrice || 0);
      const newValue = Number(bundle.price || 0);
      const discountValue = oldValue > newValue && oldValue > 0
        ? Math.round((1 - newValue / oldValue) * 100)
        : 0;

      discount.textContent = discountValue > 0 ? `${discountValue}% OFF` : "Bundle Deal";
    }

    if(features){
      features.innerHTML = Array.isArray(bundle.features)
        ? bundle.features.map(feature => `
            <li class="feature-item">
              <span class="check-icon">✓</span>
              <span>${escapeHtml(feature)}</span>
            </li>
          `).join("")
        : "";
    }

    if(gallery){
      const images = Array.isArray(bundle.gallery) && bundle.gallery.length
        ? bundle.gallery
        : [bundle.image].filter(Boolean);

      gallery.innerHTML = images.map(src => `
        <button
          class="bundle-preview-card play-click"
          type="button"
          data-action="preview"
          data-key="${escapeHtml(bundle.key)}"
          data-preview-type="image"
          data-preview-src="${escapeHtml(src)}"
          data-title="${escapeHtml(bundle.title || "EFECT Ultimate Pack")}"
          data-fallback-preview="${escapeHtml(bundle.image || "")}"
        >
          <img src="${escapeHtml(src)}" alt="${escapeHtml(bundle.title || "Bundle image")}">
        </button>
      `).join("");
    }
  }

  function setupEvents(){
    const enterBtn = document.getElementById("enterBtn");

    if(enterBtn){
      enterBtn.addEventListener("click", enterDomain);
    }

    document.addEventListener("click", event => {
      const clickTarget = event.target.closest(".play-click");

      if(clickTarget && clickTarget.id !== "enterBtn"){
        playClickSound();
      }

      const actionTarget = event.target.closest("[data-action]");

      if(!actionTarget) return;

      const action = actionTarget.dataset.action;

      if(action === "preview"){
        const productCard = actionTarget.closest(".product-card");
        const productKey =
          actionTarget.dataset.key ||
          productCard?.querySelector("[data-key]")?.dataset.key ||
          actionTarget.dataset.key;

        const mediaSrc = actionTarget.dataset.previewSrc;

        openProductMediaCarousel(productKey, mediaSrc);
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

      if(action === "buy"){
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

    document.getElementById("cartToggle")?.addEventListener("click", openCart);
    document.getElementById("drawerClose")?.addEventListener("click", closeCart);
    document.getElementById("drawerBackdrop")?.addEventListener("click", closeCart);

    document.getElementById("checkoutBtn")?.addEventListener("click", event => checkout(event.currentTarget));
    document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);

    document.getElementById("searchToggle")?.addEventListener("click", toggleSearch);

    document.getElementById("searchInput")?.addEventListener("input", event => {
      filterProducts(event.target.value);
    });

    document.getElementById("menuBtn")?.addEventListener("click", () => {
      openLegal("faq");
    });

    document.getElementById("discordBtn")?.addEventListener("click", showDiscordToast);
    document.getElementById("shareBtn")?.addEventListener("click", shareApp);

    document.getElementById("installTestBtn")?.addEventListener("click", () => {
      localStorage.removeItem(INSTALL_POPUP_KEY);
      showInstallPopup(true);
    });

    document.getElementById("media-modal")?.addEventListener("click", event => {
      if(event.target.id === "media-modal"){
        closeModal();
      }
    });

    document.getElementById("legal-modal")?.addEventListener("click", event => {
      if(event.target.id === "legal-modal"){
        closeLegal();
      }
    });

    document.getElementById("detail-modal")?.addEventListener("click", event => {
      if(event.target.id === "detail-modal"){
        closeProductDetails();
      }
    });

    document.getElementById("modalClose")?.addEventListener("click", closeModal);
    document.getElementById("legalClose")?.addEventListener("click", closeLegal);
    document.getElementById("detailClose")?.addEventListener("click", closeProductDetails);

    document.getElementById("detailAddBtn")?.addEventListener("click", event => {
      addToCart(event.currentTarget.dataset.key);
    });

    document.getElementById("detailBuyBtn")?.addEventListener("click", event => {
      buyNow(event.currentTarget.dataset.key, event.currentTarget);
    });

    document.getElementById("installCloseBtn")?.addEventListener("click", closeInstallPopup);
    document.getElementById("installLaterBtn")?.addEventListener("click", closeInstallPopup);
    document.getElementById("installCopyBtn")?.addEventListener("click", copyInstallName);

    document.getElementById("installAppPopup")?.addEventListener("click", event => {
      if(event.target.id === "installAppPopup"){
        closeInstallPopup();
      }
    });

    document.addEventListener("keydown", event => {
      if(event.key === "Escape"){
        closeModal();
        closeLegal();
        closeProductDetails();
        closeCart();
        closeInstallPopup();
      }
    });

    setupSupportWidget();
  }

  function createGalaxy(canvasId, options = {}){
    const canvas = document.getElementById(canvasId);

    if(!canvas) return;

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

  function setupProductCardPolish(){
    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    if(isTouchDevice) return;

    document.addEventListener("mousemove", event => {
      const card = event.target.closest(".product-card");

      document.querySelectorAll(".product-card.card-hovered").forEach(activeCard => {
        if(activeCard !== card){
          activeCard.classList.remove("card-hovered");
          activeCard.style.transform = "";
        }
      });

      if(!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.classList.add("card-hovered");
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    document.addEventListener("mouseout", event => {
      const card = event.target.closest(".product-card");

      if(card && !card.contains(event.relatedTarget)){
        card.classList.remove("card-hovered");
        card.style.transform = "";
      }
    });
  }

  function setupProCommandDock(){
    document.querySelectorAll("[data-dock-action]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.dockAction;

        button.classList.remove("dock-pulse");
        void button.offsetWidth;
        button.classList.add("dock-pulse");

        if(action === "top"){
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }

        if(action === "products"){
          document.getElementById("productGrid")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }

        if(action === "bundle"){
          document.querySelector(".bundle-card")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }

        if(action === "faq"){
          openLegal("faq");
        }

        if(action === "install"){
          localStorage.removeItem(INSTALL_POPUP_KEY);
          showInstallPopup(true);
        }
      });
    });
  }

  function setupProductPowerMeters(){
    const productStats = {
      optimizer: [
        { label: "Setup Speed", value: 90 },
        { label: "System Cleanup", value: 95 },
        { label: "Responsiveness", value: 97 },
        { label: "Ease Of Use", value: 93 }
      ],
      macro: [
        { label: "Undetectable", value: 100 },
        { label: "Macro Count", value: 98 },
        { label: "Keybind Setup", value: 99 },
        { label: "Speed & Latency", value: 99 }
      ],
      fps: [
        { label: "Game Smoothness", value: 92 },
        { label: "Background Reduction", value: 90 },
        { label: "FPS Gain", value: 90 },
        { label: "Lightweight Setup", value: 94 }
      ]
    };

    document.querySelectorAll(".product-card").forEach(card => {
      const buyButton = card.querySelector('[data-action="buy"]');
      const key = buyButton?.dataset.key;
      const product = getStoreProducts().find(item => item.key === key);

      if(!product) return;
      if(card.querySelector(".power-meter-panel")) return;

      const stats = productStats[product.id] || [
        { label: "Setup", value: 90 },
        { label: "Performance", value: 90 },
        { label: "Ease Of Use", value: 90 },
        { label: "Support", value: 90 }
      ];

      const panel = document.createElement("div");
      panel.className = "power-meter-panel";

      panel.innerHTML = `
        <div class="power-meter-head">
          <span>EMX Power Readout</span>
          <strong>${escapeHtml(product.eyebrow)}</strong>
        </div>

        <div class="power-meter-grid">
          ${stats.map(stat => `
            <div class="power-meter-row">
              <div class="power-meter-label">
                <span>${escapeHtml(stat.label)}</span>
                <strong>${stat.value}%</strong>
              </div>

              <div class="power-meter-track">
                <i style="--power:${stat.value}%;"></i>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      const checklist = card.querySelector(".feature-checklist");

      if(checklist){
        checklist.insertAdjacentElement("afterend", panel);
      }
    });
  }

  function setupTapParticles(){
    if(document.getElementById("tapParticleLayer")) return;

    const particleLayer = document.createElement("div");
    particleLayer.id = "tapParticleLayer";
    document.body.appendChild(particleLayer);

    function createParticle(x, y, burstIndex){
      const particle = document.createElement("span");

      const angle = Math.random() * Math.PI * 2;
      const distance = 24 + Math.random() * 46;
      const size = 4 + Math.random() * 7;

      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;

      particle.className = "tap-particle";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.setProperty("--tx", moveX + "px");
      particle.style.setProperty("--ty", moveY + "px");
      particle.style.setProperty("--delay", burstIndex * 12 + "ms");

      if(Math.random() > 0.55){
        particle.classList.add("purple");
      }

      if(Math.random() > 0.72){
        particle.classList.add("white");
      }

      particleLayer.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 900);
    }

    function createRing(x, y){
      const ring = document.createElement("span");
      ring.className = "tap-ring";
      ring.style.left = x + "px";
      ring.style.top = y + "px";

      particleLayer.appendChild(ring);

      setTimeout(() => {
        ring.remove();
      }, 650);
    }

    function burst(event){
      const target = event.target.closest(
        "button, a, .play-click, .product-card, .support-action, .bundle-preview-card, .trust-pill, .vouch-card"
      );

      if(!target) return;

      const point = event.touches && event.touches[0] ? event.touches[0] : event;
      const x = point.clientX;
      const y = point.clientY;

      createRing(x, y);

      for(let i = 0; i < 18; i++){
        createParticle(x, y, i);
      }
    }

    document.addEventListener("pointerdown", burst, { passive: true });
  }

  function setupScrollRevealGlow(){
    const revealSelectors = [
      ".hero-card",
      ".trust-pill",
      ".section-head",
      ".product-card",
      ".bundle-card",
      ".proof-card",
      ".trust-metric",
      ".vouch-card",
      ".vouch-discord-card",
      ".faq-row",
      ".legal-card"
    ];

    const revealItems = document.querySelectorAll(revealSelectors.join(","));

    revealItems.forEach((item, index) => {
      item.classList.add("emx-reveal");
      item.style.setProperty("--reveal-delay", Math.min(index * 35, 280) + "ms");
    });

    if(!("IntersectionObserver" in window)){
      revealItems.forEach(item => item.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    });

    revealItems.forEach(item => observer.observe(item));
  }

  let currentPreviewIndex = 0;
  let currentPreviewItems = [];

  function getProductMediaItems(product){
    if(!product) return [];

    const items = [];

    if(product.previewSrc){
      items.push({
        type: product.previewType || "image",
        src: product.previewSrc,
        title: product.title || "Product Preview",
        fallback: product.fallbackPreview || product.image || ""
      });
    }else if(product.image){
      items.push({
        type: "image",
        src: product.image,
        title: product.title || "Product Preview",
        fallback: product.image || ""
      });
    }

    if(Array.isArray(product.gallery)){
      product.gallery.forEach(src => {
        if(!src) return;

        const alreadyAdded = items.some(item => item.src === src);
        if(alreadyAdded) return;

        items.push({
          type: "image",
          src,
          title: product.title || "Product Preview",
          fallback: product.image || ""
        });
      });
    }

    return items;
  }

  function openProductMediaCarousel(productKey, startSrc){
    const product = PRODUCTS.find(item => item.key === productKey);

    if(!product){
      openPreview("image", startSrc || "", "Product Preview", "");
      return;
    }

    currentPreviewItems = getProductMediaItems(product);

    if(!currentPreviewItems.length) return;

    const startIndex = currentPreviewItems.findIndex(item => item.src === startSrc);
    currentPreviewIndex = startIndex >= 0 ? startIndex : 0;

    openPreviewItemByIndex(currentPreviewIndex);
  }

  function openPreviewItemByIndex(index){
    if(!currentPreviewItems.length) return;

    if(index < 0){
      index = currentPreviewItems.length - 1;
    }

    if(index >= currentPreviewItems.length){
      index = 0;
    }

    currentPreviewIndex = index;

    const item = currentPreviewItems[currentPreviewIndex];

    openPreview(
      item.type,
      item.src,
      item.title,
      item.fallback
    );

    updatePreviewControls();
  }

  function updatePreviewControls(){
    const counter = document.getElementById("previewCounter");
    const title = document.getElementById("modalTitle");

    const item = currentPreviewItems[currentPreviewIndex];

    if(counter){
      counter.textContent = currentPreviewItems.length
        ? `${currentPreviewIndex + 1} / ${currentPreviewItems.length}`
        : "";
    }

    if(title && item){
      title.textContent = item.title || "Product Preview";
    }
  }

  function setupPreviewUpgrade(){
    const modal = document.getElementById("media-modal");

    if(!modal) return;

    if(!document.getElementById("previewPrevBtn")){
      const prevBtn = document.createElement("button");
      prevBtn.id = "previewPrevBtn";
      prevBtn.className = "preview-nav-btn preview-prev play-click";
      prevBtn.type = "button";
      prevBtn.setAttribute("aria-label", "Previous preview");
      prevBtn.innerHTML = "‹";

      const nextBtn = document.createElement("button");
      nextBtn.id = "previewNextBtn";
      nextBtn.className = "preview-nav-btn preview-next play-click";
      nextBtn.type = "button";
      nextBtn.setAttribute("aria-label", "Next preview");
      nextBtn.innerHTML = "›";

      const counter = document.createElement("div");
      counter.id = "previewCounter";
      counter.className = "preview-counter";
      counter.textContent = "";

      modal.appendChild(prevBtn);
      modal.appendChild(nextBtn);
      modal.appendChild(counter);

      prevBtn.addEventListener("click", event => {
        event.stopPropagation();
        openPreviewItemByIndex(currentPreviewIndex - 1);
      });

      nextBtn.addEventListener("click", event => {
        event.stopPropagation();
        openPreviewItemByIndex(currentPreviewIndex + 1);
      });
    }

    document.addEventListener("keydown", event => {
      const isPreviewOpen = modal.classList.contains("show");

      if(!isPreviewOpen) return;

      if(event.key === "ArrowLeft"){
        openPreviewItemByIndex(currentPreviewIndex - 1);
      }

      if(event.key === "ArrowRight"){
        openPreviewItemByIndex(currentPreviewIndex + 1);
      }
    });
  }

  function resetEmxPayhipButtonsOnly(){
    document.querySelectorAll(".payhip-loading, .btn-loading").forEach(button => {
      button.classList.remove("payhip-loading");
      button.classList.remove("btn-loading");
      button.disabled = false;

      if(button.dataset.originalText){
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    });

    const payOverlay = document.getElementById("emxPayLoading");
    const payBar = document.getElementById("emxPayBarFill");
    const payStatus = document.getElementById("emxPayStatus");

    if(payOverlay){
      payOverlay.classList.remove("show");
      payOverlay.classList.remove("exit");
    }

    if(payBar){
      payBar.style.width = "0%";
    }

    if(payStatus){
      payStatus.textContent = "Encrypting checkout session...";
    }

    unlockBodyIfSafe();
  }

  window.addEventListener("pageshow", resetEmxPayhipButtonsOnly);
  window.addEventListener("focus", resetEmxPayhipButtonsOnly);

  document.addEventListener("visibilitychange", () => {
    if(!document.hidden){
      resetEmxPayhipButtonsOnly();
    }
  });

  async function initStore(){
    await loadProductsFromApi();

    renderProducts();
    renderBundleFromAdmin();
    updateCartUI();
    setupEvents();
    setupProCommandDock();
    setupProductPowerMeters();
    setupProductCardPolish();
    setupTapParticles();
    setupScrollRevealGlow();
    setupPreviewUpgrade();

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

    createGalaxy("launchGalaxy", {
      count: 96,
      speed: .20,
      glow: 15
    });

    createGalaxy("payLoadingGalaxy", {
      count: 90,
      speed: .19,
      glow: 15
    });
  }

  initStore();
});