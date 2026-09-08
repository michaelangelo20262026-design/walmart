// =========================
// PRODUCTS
// =========================

const defaultProducts = [
  {
    id: 1,
    name: "Peak Milk",
    price: 5500,
    barcode: "123456789001",
    category: "Food",
    stock: 50,
  },
  {
    id: 2,
    name: "Indomie Noodles",
    price: 800,
    barcode: "123456789002",
    category: "Food",
    stock: 50,
  },
  {
    id: 3,
    name: "Coca-Cola",
    price: 1200,
    barcode: "123456789003",
    category: "Drinks",
    stock: 50,
  },
  {
    id: 4,
    name: "Milo",
    price: 4500,
    barcode: "123456789004",
    category: "Food",
    stock: 50,
  },
  {
    id: 5,
    name: "Dettol",
    price: 2500,
    barcode: "123456789005",
    category: "Toiletries",
    stock: 50,
  },
  {
    id: 6,
    name: "Tissue Paper",
    price: 1800,
    barcode: "123456789006",
    category: "Household",
    stock: 50,
  },
];

let savedProducts = [];

try {
  savedProducts = JSON.parse(localStorage.getItem("products")) || [];
} catch (error) {
  console.error("Could not load products:", error);
  savedProducts = [];
}

const products = savedProducts.length > 0 ? savedProducts : defaultProducts;

// =========================
// FIX MISSING PRODUCT CATEGORIES
// =========================

products.forEach((product) => {
  if (!product.category) {
    const productName = String(product.name || "").toLowerCase();

    if (
      productName.includes("milk") ||
      productName.includes("indomie") ||
      productName.includes("milo") ||
      productName.includes("bread")
    ) {
      product.category = "Food";
    } else if (
      productName.includes("water") ||
      productName.includes("coca") ||
      productName.includes("drink") ||
      productName.includes("juice")
    ) {
      product.category = "Drinks";
    } else if (
      productName.includes("dettol") ||
      productName.includes("soap") ||
      productName.includes("insecticide")
    ) {
      product.category = "Toiletries";
    } else if (
      productName.includes("tissue") ||
      productName.includes("bucket") ||
      productName.includes("broom") ||
      productName.includes("plate")
    ) {
      product.category = "Household";
    } else {
      product.category = "Others";
    }
  }
});

if (savedProducts.length > 0) {
  localStorage.setItem("products", JSON.stringify(products));
}

// =========================
// SALES HISTORY
// =========================

let salesHistory = [];

try {
  salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
} catch (error) {
  console.error("Could not load sales history:", error);
  salesHistory = [];
}

// =========================
// BACKEND CONNECTION
// =========================
// api.js exposes the Express backend. Products, sales and settings live in
// MongoDB; localStorage is kept as a cache so the POS still opens, and still
// sells, when the server or the database is unreachable.

const api = window.StoreAPI || null;

const isOnline = () => Boolean(api && api.online);

const cacheSalesHistory = () => {
  localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
};

// =========================
// OFFLINE NOTICE
// =========================

const showOfflineNotice = (details = "") => {
  let notice = document.getElementById("offlineNotice");

  if (!notice) {
    notice = document.createElement("div");

    notice.id = "offlineNotice";

    notice.style.cssText = [
      "position: fixed",
      "left: 50%",
      "bottom: 16px",
      "transform: translateX(-50%)",
      "z-index: 9999",
      // Passive notice: clicks must reach the buttons underneath it.
      "pointer-events: none",
      "max-width: 90vw",
      "padding: 10px 16px",
      "border-radius: 8px",
      "background: #92400e",
      "color: #fff",
      "font-size: 13px",
      "box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25)",
    ].join(";");

    document.body.appendChild(notice);
  }

  notice.textContent = details
    ? `Offline mode — saving to this device only. (${details})`
    : "Offline mode — saving to this device only.";
};

const hideOfflineNotice = () => {
  const notice = document.getElementById("offlineNotice");

  if (notice) {
    notice.remove();
  }
};

// =========================
// CART
// =========================

let cart = [];

// =========================
// HISTORICAL RECEIPT STATE
// =========================

let viewingHistoricalReceipt = false;

// =========================
// DOM ELEMENTS
// =========================

const productsGrid = document.getElementById("productsGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const barcodeInput = document.getElementById("barcodeInput");

// =========================
// POS PRODUCT SEARCH
// =========================

const productSearchInput = document.getElementById("productSearchInput");

// =========================
// PRODUCTS MANAGEMENT SEARCH
// =========================

const productsSearchInput = document.getElementById("productsSearchInput");

const clearCartBtn = document.getElementById("clearCartBtn");
const generateReceiptBtn = document.getElementById("generateReceiptBtn");
const printReceiptBtn = document.getElementById("printReceiptBtn");
const clearReceiptBtn = document.getElementById("clearReceiptBtn");

const receiptSection = document.getElementById("receiptSection");
const receiptNumber = document.getElementById("receiptNumber");
const receiptDate = document.getElementById("receiptDate");
const receiptItems = document.getElementById("receiptItems");
const receiptSubtotal = document.getElementById("receiptSubtotal");
const receiptDiscount = document.getElementById("receiptDiscount");
const receiptGrandTotal = document.getElementById("receiptGrandTotal");

const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

const productsManagement = document.getElementById("productsManagement");
const registeredProducts = document.getElementById("registeredProducts");

const addProductBtn = document.getElementById("addProductBtn");
const productFormContainer = document.getElementById("productFormContainer");
const closeProductFormBtn = document.getElementById("closeProductFormBtn");
const productForm = document.getElementById("productForm");

const productNameInput = document.getElementById("productNameInput");
const productPriceInput = document.getElementById("productPriceInput");
const productBarcodeInput = document.getElementById("productBarcodeInput");
const productCategoryInput = document.getElementById("productCategoryInput");
const productStockInput = document.getElementById("productStockInput");

const manualItemBtn = document.getElementById("manualItemBtn");
const manualItemModal = document.getElementById("manualItemModal");
const closeManualItemBtn = document.getElementById("closeManualItemBtn");
const manualItemForm = document.getElementById("manualItemForm");
const manualItemName = document.getElementById("manualItemName");
const manualItemPrice = document.getElementById("manualItemPrice");
const manualItemQuantity = document.getElementById("manualItemQuantity");

// =========================
// DASHBOARD DOM ELEMENTS
// =========================

const dashboardSection = document.getElementById("dashboardSection");
const todaySales = document.getElementById("todaySales");
const todayTransactions = document.getElementById("todayTransactions");
const totalProducts = document.getElementById("totalProducts");
const lowStockProducts = document.getElementById("lowStockProducts");
const outOfStockProducts = document.getElementById("outOfStockProducts");
const dashboardRecentSales = document.getElementById("dashboardRecentSales");
const dashboardTopProducts = document.getElementById("dashboardTopProducts");

// =========================
// SETTINGS DOM ELEMENTS
// =========================

const settingsSection = document.getElementById("settingsSection");

const storeNameInput = document.getElementById("storeNameInput");
const storeAddressInput = document.getElementById("storeAddressInput");
const storePhoneInput = document.getElementById("storePhoneInput");

const receiptFooterInput = document.getElementById("receiptFooterInput");

const lowStockInput = document.getElementById("lowStockInput");

const darkModeToggle = document.getElementById("darkModeToggle");

const backupDataBtn = document.getElementById("backupDataBtn");
const restoreDataBtn = document.getElementById("restoreDataBtn");
const restoreDataInput = document.getElementById("restoreDataInput");
const clearSalesHistoryBtn = document.getElementById("clearSalesHistoryBtn");

const saveSettingsBtn = document.getElementById("saveSettingsBtn");

// =========================
// SETTINGS STORAGE
// =========================

let storeSettings = {
  storeName: "Favour Store",
  storeAddress: "",
  storePhone: "",
  receiptFooter: "Thank you for shopping with us!",
  lowStockAlert: 5,
  darkMode: false,
};

try {
  const savedSettings = JSON.parse(localStorage.getItem("storeSettings"));

  if (savedSettings && typeof savedSettings === "object") {
    storeSettings = {
      ...storeSettings,
      ...savedSettings,
    };
  }
} catch (error) {
  console.error("Could not load store settings:", error);

  localStorage.removeItem("storeSettings");
}

// =========================
// LOAD SETTINGS
// =========================

const loadSettings = () => {
  if (storeNameInput) {
    storeNameInput.value = storeSettings.storeName;
  }

  if (storeAddressInput) {
    storeAddressInput.value = storeSettings.storeAddress;
  }

  if (storePhoneInput) {
    storePhoneInput.value = storeSettings.storePhone;
  }

  if (receiptFooterInput) {
    receiptFooterInput.value = storeSettings.receiptFooter;
  }

  if (lowStockInput) {
    lowStockInput.value = storeSettings.lowStockAlert;
  }

  if (darkModeToggle) {
    darkModeToggle.checked = storeSettings.darkMode;
  }
};

// =========================
// APPLY DARK MODE
// =========================

const applyDarkMode = () => {
  if (!darkModeToggle) {
    return;
  }

  document.body.classList.toggle("dark-mode", storeSettings.darkMode);
};

// =========================
// UPDATE RECEIPT STORE INFO
// =========================

const updateReceiptStoreInfo = () => {
  if (!receiptSection) {
    return;
  }

  let receiptStoreInfo = document.getElementById("receiptStoreInfo");

  if (!receiptStoreInfo) {
    receiptStoreInfo = document.createElement("div");

    receiptStoreInfo.id = "receiptStoreInfo";

    receiptStoreInfo.style.textAlign = "center";
    receiptStoreInfo.style.marginBottom = "15px";

    receiptSection.insertBefore(receiptStoreInfo, receiptSection.firstChild);
  }

  const storeName = storeSettings.storeName || "Favour Store";

  const storeAddress = storeSettings.storeAddress || "";

  const storePhone = storeSettings.storePhone || "";

  receiptStoreInfo.innerHTML = `
    <strong style="display: block; font-size: 20px;">
      ${storeName}
    </strong>

    ${
      storeAddress
        ? `<span style="display: block; margin-top: 4px;">
            ${storeAddress}
          </span>`
        : ""
    }

    ${
      storePhone
        ? `<span style="display: block; margin-top: 4px;">
            ${storePhone}
          </span>`
        : ""
    }
  `;
};

// =========================
// SAVE SETTINGS
// =========================

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", async () => {
    const storeName = storeNameInput.value.trim();
    const storeAddress = storeAddressInput.value.trim();
    const storePhone = storePhoneInput.value.trim();
    const receiptFooter = receiptFooterInput.value.trim();
    const lowStockAlert = Number(lowStockInput.value);

    if (storeName === "") {
      alert("Please enter a store name.");

      storeNameInput.focus();

      return;
    }

    if (!Number.isInteger(lowStockAlert) || lowStockAlert < 0) {
      alert("Low Stock Alert must be a whole number 0 or greater.");

      lowStockInput.focus();

      return;
    }

    storeSettings = {
      storeName: storeName,
      storeAddress: storeAddress,
      storePhone: storePhone,
      receiptFooter: receiptFooter,
      lowStockAlert: lowStockAlert,
      darkMode: darkModeToggle.checked,
    };

    if (isOnline()) {
      try {
        const saved = await api.settings.update(storeSettings);

        storeSettings = { ...storeSettings, ...saved };
      } catch (error) {
        alert(`Could not save settings on the server.\n\n${error.message}`);

        return;
      }
    }

    localStorage.setItem("storeSettings", JSON.stringify(storeSettings));

    applyDarkMode();

    updateReceiptStoreInfo();

    displayProducts();

    displayRegisteredProducts();

    displayDashboard();

    alert("Settings saved successfully.");
  });
}

// =========================
// EDIT PRODUCT STATE
// =========================

let editingProductId = null;

// =========================
// BARCODE CAMERA SCANNER
// =========================

const scanBarcodeBtn = document.getElementById("scanBarcodeBtn");
const barcodeScanner = document.getElementById("barcodeScanner");
const closeScannerBtn = document.getElementById("closeScannerBtn");
const barcodeVideo = document.getElementById("barcodeVideo");
const scannerStatus = document.getElementById("scannerStatus");

let scannerActive = false;
let barcodeReader = null;
let barcodeControls = null;
let lastDetectedBarcode = null;

// =========================
// HANDHELD SCANNER STATE
// =========================

let handheldScanTimer = null;
let handheldScanProcessing = false;

// How long the input must sit unchanged before a scan is treated as finished.
const HANDHELD_SCAN_DELAY = 250;

// The extra wait given to a code that could still have more characters coming.
const HANDHELD_SCAN_PATIENCE = 600;

// =========================
// NAVIGATION ELEMENTS
// =========================

const navLinks = document.querySelectorAll(".nav-link");
const posContainer = document.querySelector(".pos-container");

// =====================================================
// NAVIGATION
// =====================================================

const getNavPage = (link) => {
  if (!link) {
    return "";
  }

  const text = String(link.textContent || "")
    .trim()
    .toLowerCase();

  if (text.includes("pos")) {
    return "pos";
  }

  if (text.includes("history")) {
    return "history";
  }

  if (text.includes("products")) {
    return "products";
  }

  if (text.includes("dashboard")) {
    return "dashboard";
  }

  if (text.includes("settings")) {
    return "settings";
  }

  return "";
};

// =========================
// HIDE ALL PAGES
// =========================

const hideAllPages = () => {
  if (posContainer) {
    posContainer.classList.add("hidden");
    posContainer.style.display = "none";
  }

  if (historySection) {
    historySection.classList.add("hidden");
    historySection.style.display = "none";
  }

  if (productsManagement) {
    productsManagement.classList.add("hidden");
    productsManagement.style.display = "none";
  }

  if (dashboardSection) {
    dashboardSection.classList.add("hidden");
    dashboardSection.style.display = "none";
  }

  if (settingsSection) {
    settingsSection.classList.add("hidden");
    settingsSection.style.display = "none";
  }

  if (receiptSection) {
    receiptSection.classList.add("hidden");
    receiptSection.style.display = "none";
  }
};

// =========================
// SET ACTIVE NAV
// =========================

const setActiveNav = (page) => {
  navLinks.forEach((link) => {
    const linkPage = getNavPage(link);

    link.classList.toggle("active", linkPage === page);
  });
};

// =========================
// SHOW POS
// =========================

const showPOS = () => {
  hideAllPages();

  viewingHistoricalReceipt = false;

  if (posContainer) {
    posContainer.classList.remove("hidden");
    posContainer.style.display = "";
  }

  setActiveNav("pos");

  localStorage.setItem("activePage", "pos");

  if (barcodeInput) {
    setTimeout(() => {
      barcodeInput.focus();
    }, 100);
  }
};

// =========================
// SHOW HISTORY
// =========================

const showHistory = () => {
  hideAllPages();

  viewingHistoricalReceipt = false;

  if (historySection) {
    historySection.classList.remove("hidden");
    historySection.style.display = "";
  }

  setActiveNav("history");

  localStorage.setItem("activePage", "history");

  if (typeof displayHistory === "function") {
    displayHistory();
  }
};

// =========================
// SHOW PRODUCTS
// =========================

const showProducts = () => {
  hideAllPages();

  viewingHistoricalReceipt = false;

  if (productsManagement) {
    productsManagement.classList.remove("hidden");
    productsManagement.style.display = "";
  }

  setActiveNav("products");

  localStorage.setItem("activePage", "products");

  if (typeof displayRegisteredProducts === "function") {
    displayRegisteredProducts();
  }
};

// =========================
// SHOW DASHBOARD
// =========================

const showDashboard = () => {
  hideAllPages();

  viewingHistoricalReceipt = false;

  if (dashboardSection) {
    dashboardSection.classList.remove("hidden");
    dashboardSection.style.display = "";
  }

  setActiveNav("dashboard");

  localStorage.setItem("activePage", "dashboard");

  if (typeof displayDashboard === "function") {
    displayDashboard();
  }
};

// =========================
// SHOW SETTINGS
// =========================

const showSettings = () => {
  hideAllPages();

  viewingHistoricalReceipt = false;

  if (settingsSection) {
    settingsSection.classList.remove("hidden");
    settingsSection.style.display = "";
  }

  loadSettings();

  applyDarkMode();

  setActiveNav("settings");

  localStorage.setItem("activePage", "settings");
};

// =========================
// CENTRAL PAGE CONTROLLER
// =========================

const showPage = (page) => {
  console.log("Showing page:", page);

  switch (page) {
    case "pos":
      showPOS();
      break;

    case "history":
      showHistory();
      break;

    case "products":
      showProducts();
      break;

    case "dashboard":
      showDashboard();
      break;

    case "settings":
      showSettings();
      break;

    default:
      console.log("Unknown navigation page:", page);
      showPOS();
      break;
  }
};

// =========================
// NAVIGATION EVENTS
// =========================

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const page = getNavPage(link);

    console.log("Navigation clicked:", link.textContent.trim());
    console.log("Navigation page:", page);

    if (!page) {
      console.log("Could not determine navigation page.");
      return;
    }

    showPage(page);
  });
});

// =========================
// GET ALL PRODUCTS
// =========================

const getAllProducts = () => {
  return products;
};

// =========================
// SAVE PRODUCTS
// =========================

// Writes the local cache. The server copy is updated by the API calls in the
// product form, the delete button and the receipt handler.
const saveProducts = () => {
  localStorage.setItem("products", JSON.stringify(products));
};

// =========================
// PRODUCT ICON
// =========================

const getProductIcon = (product) => {
  const category = String(product.category || "Others").toLowerCase();

  const productName = String(product.name || "").toLowerCase();

  if (
    productName.includes("milk") ||
    productName.includes("milo") ||
    productName.includes("yoghurt") ||
    productName.includes("yogurt")
  ) {
    return "🥛";
  }

  if (
    productName.includes("noodle") ||
    productName.includes("indomie") ||
    productName.includes("rice") ||
    productName.includes("bread")
  ) {
    return "🍜";
  }

  if (
    productName.includes("water") ||
    productName.includes("coca") ||
    productName.includes("drink") ||
    productName.includes("juice")
  ) {
    return "🥤";
  }

  if (
    productName.includes("soap") ||
    productName.includes("dettol") ||
    productName.includes("cream") ||
    productName.includes("lotion")
  ) {
    return "🧴";
  }

  if (
    productName.includes("tissue") ||
    productName.includes("bucket") ||
    productName.includes("broom") ||
    productName.includes("plate")
  ) {
    return "🧹";
  }

  if (category === "food") {
    return "🍎";
  }

  if (category === "drinks") {
    return "🥤";
  }

  if (category === "toiletries") {
    return "🧴";
  }

  if (category === "household") {
    return "🏠";
  }

  return "📦";
};

// =========================
// SAFE SALES HELPERS
// =========================

const getValidSalesHistory = () => {
  if (!Array.isArray(salesHistory)) {
    return [];
  }

  return salesHistory.filter((sale) => sale && typeof sale === "object");
};

const getSaleDate = (sale) => {
  const rawDate = sale?.date || sale?.dateTime;

  if (!rawDate) {
    return null;
  }

  const parsedDate = new Date(rawDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const getSaleItems = (sale) => {
  if (!Array.isArray(sale?.items)) {
    return [];
  }

  return sale.items.filter((item) => item && typeof item === "object");
};

const getSaleTotal = (sale) => {
  const total = Number(sale?.total);

  if (Number.isFinite(total)) {
    return total;
  }

  const items = getSaleItems(sale);

  return items.reduce((sum, item) => {
    const itemTotal = Number(item?.total);

    if (Number.isFinite(itemTotal)) {
      return sum + itemTotal;
    }

    return sum + Number(item?.price || 0) * Number(item?.quantity || 0);
  }, 0);
};

const formatSaleReceiptNo = (sale) => {
  return sale?.receiptNo || "Receipt";
};

const formatSaleDateTime = (sale) => {
  return (
    sale?.dateTime || getSaleDate(sale)?.toLocaleString() || "Date unavailable"
  );
};

// =========================
// DISPLAY PRODUCTS
// =========================

const displayProducts = (productsToDisplay = products) => {
  if (!productsGrid) {
    return;
  }

  productsGrid.innerHTML = "";

  productsToDisplay.forEach((product) => {
    const productCard = document.createElement("div");

    productCard.classList.add("product-card");

    const category = product.category || "Others";

    const stock = Number(product.stock ?? 0);

    const lowStockLimit = Number(storeSettings.lowStockAlert);

    if (stock > 0 && stock <= lowStockLimit) {
      productCard.classList.add("low-stock");
    }

    if (stock === 0) {
      productCard.classList.add("out-of-stock");
    }

    let stockText = `Stock: ${stock}`;

    if (stock === 0) {
      stockText = "OUT OF STOCK";
    } else if (stock > 0 && stock <= lowStockLimit) {
      stockText = `Low Stock: ${stock}`;
    }

    const productIcon = getProductIcon(product);

    productCard.innerHTML = `
      <div class="product-icon">
        ${productIcon}
      </div>

      <div class="product-card-content">
        <h3>
          ${product.name}
        </h3>

        <p class="product-category">
          ${category}
        </p>

        <p class="product-price">
          ₦${Number(product.price).toLocaleString()}
        </p>

        <p class="product-stock">
          ${stockText}
        </p>
      </div>

      <div class="cart-icon">
        🛒
      </div>
    `;

    productCard.addEventListener("click", () => {
      addToCart(product);
    });

    productsGrid.appendChild(productCard);
  });
};

// =========================
// ADD PRODUCT TO CART
// =========================

const addToCart = (product) => {
  const existingItem = cart.find((item) => item.id === product.id);

  const hasStock = product.stock !== undefined && product.stock !== null;

  if (hasStock) {
    const availableStock = Number(product.stock);

    if (availableStock <= 0) {
      alert(`${product.name} is out of stock.`);
      return false;
    }

    if (existingItem && existingItem.quantity >= availableStock) {
      alert(`Only ${availableStock} ${product.name} available in stock.`);
      return false;
    }
  }

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  displayCart();

  return true;
};

// =========================
// DISPLAY CART
// =========================

const displayCart = () => {
  if (!cartItems || !cartCount || !cartTotal) {
    return;
  }

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div>🛒</div>

        <h3>No items added</h3>

        <p>
          Scan a product or select one from the products list.
        </p>
      </div>
    `;

    cartCount.textContent = "0 items";
    cartTotal.textContent = "₦0.00";

    return;
  }

  cart.forEach((item) => {
    const cartItem = document.createElement("div");

    cartItem.classList.add("cart-item");

    const itemTotal = Number(item.price) * item.quantity;

    cartItem.innerHTML = `
      <div class="cart-item-top">

        <span class="cart-item-name">
          ${item.name}
        </span>

        <span class="cart-item-total">
          ₦${itemTotal.toLocaleString()}
        </span>

      </div>

      <div class="cart-item-bottom">

        <span class="cart-item-price">
          ₦${Number(item.price).toLocaleString()} each
        </span>

        <div class="quantity-controls">

          <button
            class="decrease-btn"
            type="button"
          >
            −
          </button>

          <input
            type="number"
            class="quantity-input"
            value="${item.quantity}"
            min="1"
            step="1"
            inputmode="numeric"
            aria-label="Quantity for ${item.name}"
          />

          <button
            class="increase-btn"
            type="button"
          >
            +
          </button>

        </div>

      </div>
    `;

    const decreaseBtn = cartItem.querySelector(".decrease-btn");

    decreaseBtn.addEventListener("click", () => {
      item.quantity--;

      if (item.quantity <= 0) {
        cart = cart.filter((cartProduct) => cartProduct.id !== item.id);
      }

      displayCart();
    });

    const increaseBtn = cartItem.querySelector(".increase-btn");

    increaseBtn.addEventListener("click", () => {
      const hasStock = item.stock !== undefined && item.stock !== null;

      if (hasStock) {
        const availableStock = Number(item.stock);

        if (item.quantity >= availableStock) {
          alert(`Only ${availableStock} ${item.name} available in stock.`);
          return;
        }
      }

      item.quantity++;

      displayCart();
    });

    const quantityInput = cartItem.querySelector(".quantity-input");

    const updateQuantityFromInput = () => {
      const oldQuantity = item.quantity;

      const enteredValue = quantityInput.value.trim();

      if (enteredValue === "") {
        quantityInput.value = oldQuantity;
        return;
      }

      const newQuantity = Number(enteredValue);

      if (!Number.isInteger(newQuantity) || newQuantity < 1) {
        alert("Quantity must be a whole number greater than 0.");

        quantityInput.value = oldQuantity;

        return;
      }

      const hasStock = item.stock !== undefined && item.stock !== null;

      if (hasStock) {
        const availableStock = Number(item.stock);

        if (newQuantity > availableStock) {
          alert(`Only ${availableStock} ${item.name} available in stock.`);

          quantityInput.value = oldQuantity;

          return;
        }
      }

      item.quantity = newQuantity;

      displayCart();
    };

    quantityInput.addEventListener("change", updateQuantityFromInput);

    quantityInput.addEventListener("blur", updateQuantityFromInput);

    quantityInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        updateQuantityFromInput();
      }
    });

    cartItems.appendChild(cartItem);
  });

  updateCartSummary();
};

// =========================
// CART SUMMARY
// =========================

const updateCartSummary = () => {
  if (!cartCount || !cartTotal) {
    return;
  }

  const totalQuantity = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const totalPrice = cart.reduce((total, item) => {
    return total + Number(item.price) * item.quantity;
  }, 0);

  cartCount.textContent = `${totalQuantity} ${
    totalQuantity === 1 ? "item" : "items"
  }`;

  cartTotal.textContent = `₦${totalPrice.toLocaleString()}.00`;
};

// =========================
// FIND PRODUCT BY BARCODE
// =========================

const findProductByBarcode = (barcode) => {
  const cleanBarcode = String(barcode).trim();

  return getAllProducts().find((item) => {
    return item.barcode && String(item.barcode).trim() === cleanBarcode;
  });
};

// =========================
// PARTIAL BARCODE
// =========================
// True when the text so far is the start of a longer barcode in the store, so
// a scan still arriving is not mistaken for an unknown product.

const isPartialBarcode = (barcode) => {
  const cleanBarcode = String(barcode).trim();

  if (cleanBarcode === "") {
    return false;
  }

  return getAllProducts().some((item) => {
    if (!item.barcode) {
      return false;
    }

    const productBarcode = String(item.barcode).trim();

    return (
      productBarcode.length > cleanBarcode.length &&
      productBarcode.startsWith(cleanBarcode)
    );
  });
};

// =========================
// BEEP
// =========================

const beep = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const audioContext = new AudioContext();

  const oscillator = audioContext.createOscillator();

  const gainNode = audioContext.createGain();

  oscillator.type = "sine";

  oscillator.frequency.value = 900;

  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);

  oscillator.connect(gainNode);

  gainNode.connect(audioContext.destination);

  oscillator.start();

  oscillator.stop(audioContext.currentTime + 0.15);
};

// =====================================================
// PROCESS HANDHELD BARCODE
// =====================================================

const processHandheldBarcode = () => {
  if (!barcodeInput) {
    return;
  }

  if (handheldScanProcessing) {
    return;
  }

  const barcode = barcodeInput.value.trim();

  if (barcode === "") {
    return;
  }

  handheldScanProcessing = true;

  console.log("HANDHELD BARCODE DETECTED:", barcode);

  const product = findProductByBarcode(barcode);

  if (product) {
    const added = addToCart(product);

    if (added) {
      beep();

      barcodeInput.value = "";

      console.log(`${product.name} added to cart.`);

      setTimeout(() => {
        handheldScanProcessing = false;

        barcodeInput.focus();
      }, 100);
    } else {
      handheldScanProcessing = false;

      barcodeInput.value = "";

      barcodeInput.focus();
    }

    return;
  }

  alert(`Product not found.\n\nBarcode: ${barcode}`);

  barcodeInput.value = "";

  setTimeout(() => {
    handheldScanProcessing = false;

    barcodeInput.focus();
  }, 100);
};

// =====================================================
// HANDHELD BARCODE SCANNER
// =====================================================

if (barcodeInput) {
  barcodeInput.addEventListener("input", () => {
    if (handheldScanProcessing) {
      return;
    }

    clearTimeout(handheldScanTimer);

    const barcode = barcodeInput.value.trim();

    if (barcode === "") {
      return;
    }

    handheldScanTimer = setTimeout(() => {
      // A slower scanner, or a hand-typed code, can pause mid-barcode. If what
      // has arrived so far is the beginning of a barcode the store knows, it is
      // an unfinished scan — wait for the rest instead of rejecting it.
      if (isPartialBarcode(barcodeInput.value.trim())) {
        // One product's barcode can be the start of another's, so the wait is
        // extended once and then the code is accepted as it stands.
        handheldScanTimer = setTimeout(() => {
          processHandheldBarcode();
        }, HANDHELD_SCAN_PATIENCE);

        return;
      }

      processHandheldBarcode();
    }, HANDHELD_SCAN_DELAY);
  });

  barcodeInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    clearTimeout(handheldScanTimer);

    processHandheldBarcode();
  });
}

// =====================================================
// KEEP HANDHELD SCANNER READY
// =====================================================

const keepBarcodeInputFocused = () => {
  if (!barcodeInput || !posContainer) {
    return;
  }

  const posIsVisible = !posContainer.classList.contains("hidden");

  if (!posIsVisible) {
    return;
  }

  const activeElement = document.activeElement;

  if (!activeElement) {
    barcodeInput.focus();

    return;
  }

  const isInteractiveElement =
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.tagName === "SELECT" ||
    activeElement.tagName === "BUTTON" ||
    activeElement.tagName === "A";

  if (isInteractiveElement) {
    return;
  }

  if (activeElement !== barcodeInput) {
    barcodeInput.focus();
  }
};

setInterval(() => {
  keepBarcodeInputFocused();
}, 300);

// =========================
// START BARCODE CAMERA
// =========================

const startBarcodeScanner = async () => {
  if (scannerActive) {
    return;
  }

  if (!barcodeScanner || !scannerStatus || !barcodeVideo) {
    return;
  }

  barcodeScanner.classList.remove("hidden");

  scannerStatus.textContent = "Starting camera...";

  try {
    if (typeof ZXingBrowser === "undefined") {
      scannerStatus.textContent =
        "Barcode scanner library could not be loaded.";

      console.error("ZXingBrowser is not loaded.");

      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      scannerStatus.textContent =
        "Camera access is not supported by this browser.";

      console.error("Camera API is not available.");

      return;
    }

    barcodeReader = new ZXingBrowser.BrowserMultiFormatReader();

    scannerActive = true;

    lastDetectedBarcode = null;

    scannerStatus.textContent = "Point the camera at a barcode.";

    const constraints = {
      video: {
        width: {
          ideal: 1280,
        },

        height: {
          ideal: 720,
        },

        facingMode: {
          ideal: "environment",
        },
      },

      audio: false,
    };

    barcodeControls = await barcodeReader.decodeFromConstraints(
      constraints,
      barcodeVideo,
      (result, error) => {
        if (!scannerActive) {
          return;
        }

        if (result) {
          const barcode = String(result.getText()).trim();

          console.log("BARCODE DETECTED:", barcode);

          if (barcode === lastDetectedBarcode) {
            return;
          }

          lastDetectedBarcode = barcode;

          handleScannedBarcode(barcode);
        }
      },
    );

    console.log("Barcode camera scanner started successfully.");
  } catch (error) {
    console.error("SCANNER ERROR:", error);

    scannerActive = false;

    barcodeControls = null;

    barcodeReader = null;

    if (barcodeVideo && barcodeVideo.srcObject) {
      const tracks = barcodeVideo.srcObject.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      barcodeVideo.srcObject = null;
    }

    scannerStatus.textContent =
      "Unable to start barcode camera. Check camera permission.";
  }
};

// =========================
// HANDLE SCANNED BARCODE
// =========================

const handleScannedBarcode = (barcode) => {
  const product = findProductByBarcode(barcode);

  if (!product) {
    if (scannerStatus) {
      scannerStatus.textContent = `Barcode ${barcode} detected, but product was not found.`;
    }

    setTimeout(() => {
      lastDetectedBarcode = null;

      if (scannerActive && scannerStatus) {
        scannerStatus.textContent = "Show the product barcode to the camera.";
      }
    }, 1500);

    return;
  }

  const existingItem = cart.find((item) => item.id === product.id);

  const hasStock = product.stock !== undefined && product.stock !== null;

  if (hasStock) {
    const availableStock = Number(product.stock);

    if (availableStock <= 0) {
      if (scannerStatus) {
        scannerStatus.textContent = `${product.name} is out of stock.`;
      }

      return;
    }

    if (existingItem && existingItem.quantity >= availableStock) {
      if (scannerStatus) {
        scannerStatus.textContent = `Only ${availableStock} ${product.name} available in stock.`;
      }

      return;
    }
  }

  const added = addToCart(product);

  if (!added) {
    return;
  }

  beep();

  if (barcodeInput) {
    barcodeInput.value = "";
  }

  if (scannerStatus) {
    scannerStatus.textContent = `${product.name} added successfully.`;
  }

  setTimeout(() => {
    lastDetectedBarcode = null;
  }, 1500);

  stopBarcodeScanner();
};

// =========================
// STOP BARCODE SCANNER
// =========================

const stopBarcodeScanner = () => {
  scannerActive = false;

  lastDetectedBarcode = null;

  if (barcodeControls) {
    try {
      barcodeControls.stop();

      barcodeControls = null;
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  }

  if (barcodeVideo && barcodeVideo.srcObject) {
    const tracks = barcodeVideo.srcObject.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    barcodeVideo.srcObject = null;
  }

  barcodeReader = null;

  if (barcodeScanner) {
    barcodeScanner.classList.add("hidden");
  }

  console.log("Scanner stopped successfully.");
};

// =========================
// SCANNER BUTTON
// =========================

if (scanBarcodeBtn) {
  scanBarcodeBtn.addEventListener("click", () => {
    startBarcodeScanner();
  });
}

// =========================
// CLOSE SCANNER
// =========================

if (closeScannerBtn) {
  closeScannerBtn.addEventListener("click", () => {
    stopBarcodeScanner();
  });
}

// =========================
// CLEAR CART
// =========================

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    cart = [];

    displayCart();

    if (barcodeInput) {
      setTimeout(() => {
        barcodeInput.focus();
      }, 50);
    }
  });
}

// =========================
// GENERATE RECEIPT
// =========================

if (generateReceiptBtn) {
  generateReceiptBtn.addEventListener("click", async () => {
    viewingHistoricalReceipt = false;

    if (cart.length === 0) {
      alert("Please add at least one item before generating a receipt.");

      return;
    }

    for (const item of cart) {
      const product = products.find((product) => product.id === item.id);

      if (!product || product.stock === undefined || product.stock === null) {
        continue;
      }

      const availableStock = Number(product.stock);

      if (item.quantity > availableStock) {
        alert(
          `Cannot generate receipt.\n\n${item.name}: only ${availableStock} available in stock, but ${item.quantity} was requested.`,
        );

        return;
      }
    }

    const now = new Date();

    const receiptNo = `FS-${Date.now()}`;

    const dateTime = now.toLocaleString();

    const subtotal = cart.reduce((total, item) => {
      return total + Number(item.price) * item.quantity;
    }, 0);

    // Update store name, address, and phone on receipt.
    updateReceiptStoreInfo();

    if (receiptNumber) {
      receiptNumber.textContent = receiptNo;
    }

    if (receiptDate) {
      receiptDate.textContent = dateTime;
    }

    if (receiptItems) {
      receiptItems.innerHTML = "";
    }

    cart.forEach((item) => {
      const itemTotal = Number(item.price) * item.quantity;

      const receiptItem = document.createElement("div");

      receiptItem.classList.add("receipt-item");

      receiptItem.innerHTML = `
        <div>
          <strong>
            ${item.name}
          </strong>

          <span>
            ${item.quantity} ×
            ₦${Number(item.price).toLocaleString()}
          </span>
        </div>

        <strong>
          ₦${itemTotal.toLocaleString()}
        </strong>
      `;

      if (receiptItems) {
        receiptItems.appendChild(receiptItem);
      }
    });

    if (receiptSubtotal) {
      receiptSubtotal.textContent = `₦${subtotal.toLocaleString()}.00`;
    }

    if (receiptDiscount) {
      receiptDiscount.textContent = "₦0.00";
    }

    if (receiptGrandTotal) {
      receiptGrandTotal.textContent = `₦${subtotal.toLocaleString()}.00`;
    }

    const sale = {
      receiptNo: receiptNo,

      date: now.toISOString(),

      dateTime: dateTime,

      items: cart.map((item) => ({
        // Manual items have ids like "manual-1736…"; the server stores those
        // with no product reference and leaves stock alone.
        productId: item.id,

        name: item.name,

        price: Number(item.price),

        quantity: item.quantity,

        total: Number(item.price) * item.quantity,
      })),

      subtotal: subtotal,

      discount: 0,

      total: subtotal,
    };

    if (isOnline()) {
      try {
        const result = await api.sales.create(sale);

        salesHistory.push(result.sale);

        // The server owns stock levels — take its numbers, not ours.
        (result.products || []).forEach((updated) => {
          const product = products.find((item) => item.id === updated.id);

          if (product) {
            product.stock = updated.stock;
          }
        });
      } catch (error) {
        alert(`Could not record this sale on the server.\n\n${error.message}`);

        return;
      }
    } else {
      cart.forEach((item) => {
        const product = products.find((product) => product.id === item.id);

        if (!product || product.stock === undefined || product.stock === null) {
          return;
        }

        product.stock = Number(product.stock) - item.quantity;
      });

      salesHistory.push(sale);
    }

    saveProducts();

    cacheSalesHistory();

    displayProducts();

    displayRegisteredProducts();

    if (receiptSection) {
      receiptSection.classList.remove("hidden");
      receiptSection.style.display = "";
    }

    displayHistory();

    displayDashboard();
  });
}

// =========================
// PRINT RECEIPT
// =========================

if (printReceiptBtn) {
  printReceiptBtn.addEventListener("click", () => {
    window.print();
  });
}

// =========================
// CLEAR RECEIPT
// =========================

if (clearReceiptBtn) {
  clearReceiptBtn.addEventListener("click", () => {
    if (viewingHistoricalReceipt) {
      viewingHistoricalReceipt = false;

      if (receiptSection) {
        receiptSection.classList.add("hidden");
        receiptSection.style.display = "none";
      }

      showHistory();

      return;
    }

    cart = [];

    displayCart();

    if (receiptSection) {
      receiptSection.classList.add("hidden");
      receiptSection.style.display = "none";
    }

    if (receiptItems) {
      receiptItems.innerHTML = "";
    }

    if (receiptNumber) {
      receiptNumber.textContent = "";
    }

    if (receiptDate) {
      receiptDate.textContent = "";
    }

    if (receiptSubtotal) {
      receiptSubtotal.textContent = "₦0.00";
    }

    if (receiptDiscount) {
      receiptDiscount.textContent = "₦0.00";
    }

    if (receiptGrandTotal) {
      receiptGrandTotal.textContent = "₦0.00";
    }

    if (barcodeInput) {
      setTimeout(() => {
        barcodeInput.focus();
      }, 50);
    }
  });
}

// =========================
// VIEW SAVED RECEIPT
// =========================

const viewSavedReceipt = (sale) => {
  if (!sale) {
    return;
  }

  viewingHistoricalReceipt = true;

  // Update store name, address, and phone on saved receipt view.
  updateReceiptStoreInfo();

  const items = getSaleItems(sale);

  const total = getSaleTotal(sale);

  const subtotal = Number.isFinite(Number(sale.subtotal))
    ? Number(sale.subtotal)
    : total;

  const discount = Number.isFinite(Number(sale.discount))
    ? Number(sale.discount)
    : 0;

  if (receiptNumber) {
    receiptNumber.textContent = formatSaleReceiptNo(sale);
  }

  if (receiptDate) {
    receiptDate.textContent = formatSaleDateTime(sale);
  }

  if (receiptItems) {
    receiptItems.innerHTML = "";
  }

  items.forEach((item) => {
    const quantity = Number(item.quantity || 0);

    const price = Number(item.price || 0);

    const itemTotal = Number.isFinite(Number(item.total))
      ? Number(item.total)
      : price * quantity;

    const receiptItem = document.createElement("div");

    receiptItem.classList.add("receipt-item");

    receiptItem.innerHTML = `
      <div>
        <strong>
          ${item.name || "Unknown Product"}
        </strong>

        <span>
          ${quantity} ×
          ₦${price.toLocaleString()}
        </span>
      </div>

      <strong>
        ₦${itemTotal.toLocaleString()}
      </strong>
    `;

    if (receiptItems) {
      receiptItems.appendChild(receiptItem);
    }
  });

  if (receiptSubtotal) {
    receiptSubtotal.textContent = `₦${subtotal.toLocaleString()}.00`;
  }

  if (receiptDiscount) {
    receiptDiscount.textContent = `₦${discount.toLocaleString()}.00`;
  }

  if (receiptGrandTotal) {
    receiptGrandTotal.textContent = `₦${total.toLocaleString()}.00`;
  }

  if (receiptSection) {
    receiptSection.classList.remove("hidden");
    receiptSection.style.display = "";

    receiptSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

// =========================
// DISPLAY HISTORY
// =========================

const displayHistory = () => {
  if (!historyList) {
    return;
  }

  historyList.innerHTML = "";

  const validSales = getValidSalesHistory();

  if (validSales.length === 0) {
    historyList.innerHTML = `
      <div class="empty-history">
        <h3>No sales yet</h3>

        <p>
          Generated receipts will appear here.
        </p>
      </div>
    `;

    return;
  }

  const groupedSales = {};

  validSales.forEach((sale) => {
    const parsedDate = getSaleDate(sale);

    const saleDate = parsedDate
      ? parsedDate.toLocaleDateString()
      : "Date unavailable";

    if (!groupedSales[saleDate]) {
      groupedSales[saleDate] = [];
    }

    groupedSales[saleDate].push(sale);
  });

  Object.keys(groupedSales)
    .reverse()
    .forEach((date) => {
      const sales = groupedSales[date];

      const dailyTotal = sales.reduce((total, sale) => {
        return total + getSaleTotal(sale);
      }, 0);

      const dateGroup = document.createElement("div");

      dateGroup.classList.add("history-date-group");

      dateGroup.innerHTML = `
        <div class="history-date-header">
          <h3>
            ${date}
          </h3>

          <strong>
            Total Sales = ₦${dailyTotal.toLocaleString()}
          </strong>
        </div>
      `;

      sales
        .slice()
        .reverse()
        .forEach((sale) => {
          const historyItem = document.createElement("div");

          historyItem.classList.add("history-item");

          historyItem.style.cursor = "pointer";

          const receiptNo = formatSaleReceiptNo(sale);

          const dateTime = formatSaleDateTime(sale);

          const items = getSaleItems(sale);

          const total = getSaleTotal(sale);

          historyItem.innerHTML = `
            <div>
              <strong>
                ${receiptNo}
              </strong>

              <p>
                ${dateTime}
              </p>

              <span>
                ${items.length}
                product${items.length === 1 ? "" : "s"}
              </span>
            </div>

            <strong>
              ₦${total.toLocaleString()}
            </strong>
          `;

          historyItem.addEventListener("click", () => {
            viewSavedReceipt(sale);
          });

          dateGroup.appendChild(historyItem);
        });

      historyList.appendChild(dateGroup);
    });
};

// =========================
// MANUAL ITEM MODAL
// =========================

if (manualItemBtn) {
  manualItemBtn.addEventListener("click", () => {
    if (manualItemModal) {
      manualItemModal.classList.remove("hidden");
    }
  });
}

if (closeManualItemBtn) {
  closeManualItemBtn.addEventListener("click", () => {
    if (manualItemModal) {
      manualItemModal.classList.add("hidden");
    }
  });
}

if (manualItemForm) {
  manualItemForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = manualItemName.value.trim();

    const price = Number(manualItemPrice.value);

    const quantity = Number(manualItemQuantity.value);

    if (name === "" || price < 0 || quantity < 1) {
      alert("Please enter valid item details.");

      return;
    }

    const manualItem = {
      id: `manual-${Date.now()}`,

      name: name,

      price: price,

      quantity: quantity,

      barcode: "",

      category: "Others",
    };

    cart.push(manualItem);

    displayCart();

    manualItemForm.reset();

    manualItemQuantity.value = 1;

    if (manualItemModal) {
      manualItemModal.classList.add("hidden");
    }

    if (barcodeInput) {
      setTimeout(() => {
        barcodeInput.focus();
      }, 50);
    }
  });
}

// =========================
// PRODUCT MANAGEMENT
// =========================

const displayRegisteredProducts = (productsToDisplay = products) => {
  if (!registeredProducts) {
    return;
  }

  registeredProducts.innerHTML = "";

  if (productsToDisplay.length === 0) {
    registeredProducts.innerHTML = `
      <div class="empty-products">
        <div class="empty-products-icon">
          📦
        </div>

        <h3>No products found</h3>

        <p>
          Try another search or add a new product.
        </p>
      </div>
    `;

    return;
  }

  const productsHeader = document.createElement("div");

  productsHeader.classList.add("registered-products-header");

  productsHeader.innerHTML = `
    <div>PRODUCT</div>
    <div>CATEGORY</div>
    <div>PRICE</div>
    <div>STOCK</div>
    <div>BARCODE</div>
    <div>ACTIONS</div>
  `;

  registeredProducts.appendChild(productsHeader);

  productsToDisplay.forEach((product) => {
    const productItem = document.createElement("div");

    productItem.classList.add("registered-product");

    const category = product.category || "Others";

    const stock = Number(product.stock ?? 0);

    const lowStockLimit = Number(storeSettings.lowStockAlert);

    let stockStatus = "In Stock";

    let stockClass = "stock-good";

    if (stock === 0) {
      stockStatus = "Out of Stock";

      stockClass = "stock-out";
    } else if (stock <= lowStockLimit) {
      stockStatus = "Low Stock";

      stockClass = "stock-low";
    }

    if (stock > 0 && stock <= lowStockLimit) {
      productItem.classList.add("low-stock");
    }

    productItem.innerHTML = `
      <div class="registered-product-name">
        <h3>
          ${product.name}
        </h3>

        <span>
          Product ID: ${product.id}
        </span>
      </div>

      <div class="registered-product-category">
        ${category}
      </div>

      <div class="registered-product-price">
        ₦${Number(product.price).toLocaleString()}
      </div>

      <div class="registered-product-stock">
        <strong>
          ${stock}
        </strong>

        <span class="${stockClass}">
          ${stockStatus}
        </span>
      </div>

      <div class="registered-product-barcode">
        ${product.barcode ? product.barcode : "No barcode"}
      </div>

      <div class="product-actions">

        <button
          class="edit-product-btn"
          data-id="${product.id}"
          type="button"
        >
          Edit
        </button>

        <button
          class="delete-product-btn"
          data-id="${product.id}"
          type="button"
        >
          Delete
        </button>

      </div>
    `;

    const editBtn = productItem.querySelector(".edit-product-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        editingProductId = product.id;

        productNameInput.value = product.name;

        productPriceInput.value = product.price;

        productBarcodeInput.value = product.barcode || "";

        productCategoryInput.value = product.category || "Others";

        productStockInput.value = product.stock ?? 0;

        const formTitle = productFormContainer.querySelector(
          ".product-form-header h3",
        );

        const saveButton = productForm.querySelector(".save-product-btn");

        if (formTitle) {
          formTitle.textContent = "Edit Product";
        }

        if (saveButton) {
          saveButton.textContent = "Update Product";
        }

        productFormContainer.classList.remove("hidden");

        productNameInput.focus();
      });
    }

    const deleteBtn = productItem.querySelector(".delete-product-btn");

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const confirmed = confirm(`Delete ${product.name}?`);

        if (!confirmed) {
          return;
        }

        if (isOnline()) {
          try {
            await api.products.remove(product.id);
          } catch (error) {
            alert(
              `Could not delete ${product.name} on the server.\n\n${error.message}`,
            );

            return;
          }
        }

        const index = products.findIndex((item) => item.id === product.id);

        if (index !== -1) {
          products.splice(index, 1);
        }

        saveProducts();

        displayProducts();

        displayRegisteredProducts();

        displayDashboard();
      });
    }

    registeredProducts.appendChild(productItem);
  });
};

// =========================
// ADD PRODUCT FORM
// =========================

if (addProductBtn) {
  addProductBtn.addEventListener("click", () => {
    editingProductId = null;

    if (productForm) {
      productForm.reset();
    }

    const formTitle = productFormContainer.querySelector(
      ".product-form-header h3",
    );

    const saveButton = productForm.querySelector(".save-product-btn");

    if (formTitle) {
      formTitle.textContent = "Register Product";
    }

    if (saveButton) {
      saveButton.textContent = "Save Product";
    }

    productFormContainer.classList.remove("hidden");
  });
}

// =========================
// CLOSE PRODUCT FORM
// =========================

if (closeProductFormBtn) {
  closeProductFormBtn.addEventListener("click", () => {
    editingProductId = null;

    if (productForm) {
      productForm.reset();
    }

    const formTitle = productFormContainer.querySelector(
      ".product-form-header h3",
    );

    const saveButton = productForm.querySelector(".save-product-btn");

    if (formTitle) {
      formTitle.textContent = "Register Product";
    }

    if (saveButton) {
      saveButton.textContent = "Save Product";
    }

    productFormContainer.classList.add("hidden");
  });
}

// =========================
// ADD / EDIT PRODUCT FORM
// =========================

if (productForm) {
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = productNameInput.value.trim();

    const price = Number(productPriceInput.value);

    const barcode = productBarcodeInput.value.trim();

    const category = productCategoryInput.value;

    const stock = Number(productStockInput.value);

    if (name === "" || price < 1 || category === "" || stock < 0) {
      alert("Please complete all required product details.");

      return;
    }

    if (editingProductId !== null) {
      const product = products.find((item) => item.id === editingProductId);

      if (!product) {
        alert("Product could not be found.");

        return;
      }

      const duplicateBarcode = products.find((item) => {
        return (
          item.id !== editingProductId &&
          barcode &&
          item.barcode &&
          String(item.barcode).trim() === barcode
        );
      });

      if (duplicateBarcode) {
        alert("A product with this barcode already exists.");

        return;
      }

      if (isOnline()) {
        try {
          const updated = await api.products.update(product.id, {
            name: name,
            price: price,
            barcode: barcode,
            category: category,
            stock: stock,
          });

          Object.assign(product, updated);
        } catch (error) {
          alert(`Could not update ${name} on the server.\n\n${error.message}`);

          return;
        }
      } else {
        product.name = name;

        product.price = price;

        product.barcode = barcode;

        product.category = category;

        product.stock = stock;
      }

      saveProducts();

      displayProducts();

      displayRegisteredProducts();

      displayDashboard();

      editingProductId = null;

      productForm.reset();

      productFormContainer.classList.add("hidden");

      const formTitle = productFormContainer.querySelector(
        ".product-form-header h3",
      );

      const saveButton = productForm.querySelector(".save-product-btn");

      if (formTitle) {
        formTitle.textContent = "Register Product";
      }

      if (saveButton) {
        saveButton.textContent = "Save Product";
      }

      alert(`${name} has been updated successfully.`);

      return;
    }

    if (barcode && findProductByBarcode(barcode)) {
      alert("A product with this barcode already exists.");

      return;
    }

    let newProduct = {
      id: Date.now(),

      name: name,

      price: price,

      barcode: barcode,

      category: category,

      stock: stock,
    };

    if (isOnline()) {
      try {
        // The server assigns the id, so the saved product replaces the draft.
        newProduct = await api.products.create({
          name: name,
          price: price,
          barcode: barcode,
          category: category,
          stock: stock,
        });
      } catch (error) {
        alert(`Could not save ${name} to the server.\n\n${error.message}`);

        return;
      }
    }

    products.push(newProduct);

    saveProducts();

    displayProducts();

    displayRegisteredProducts();

    displayDashboard();

    productForm.reset();

    productFormContainer.classList.add("hidden");

    alert(`${name} has been added successfully.`);
  });
}

// =========================
// CATEGORY FILTER
// =========================

const categoryButtons = document.querySelectorAll(".category");

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const category = button.textContent.trim();

    if (category === "All") {
      displayProducts(products);

      return;
    }

    const filteredProducts = products.filter(
      (product) => product.category === category,
    );

    displayProducts(filteredProducts);
  });
});

// =========================
// DASHBOARD
// =========================

const displayDashboard = () => {
  if (
    !todaySales ||
    !todayTransactions ||
    !totalProducts ||
    !lowStockProducts ||
    !outOfStockProducts ||
    !dashboardRecentSales ||
    !dashboardTopProducts
  ) {
    return;
  }

  const now = new Date();

  const today = now.toLocaleDateString();

  const validSales = getValidSalesHistory();

  const todaysSales = validSales.filter((sale) => {
    const saleDate = getSaleDate(sale);

    if (!saleDate) {
      return false;
    }

    return saleDate.toLocaleDateString() === today;
  });

  const salesTotal = todaysSales.reduce((total, sale) => {
    return total + getSaleTotal(sale);
  }, 0);

  todaySales.textContent = `₦${salesTotal.toLocaleString()}.00`;

  todayTransactions.textContent = todaysSales.length;

  totalProducts.textContent = products.length;

  const lowStockLimit = Number(storeSettings.lowStockAlert);

  const lowStockCount = products.filter((product) => {
    const stock = Number(product.stock ?? 0);

    return stock > 0 && stock <= lowStockLimit;
  }).length;

  lowStockProducts.textContent = lowStockCount;

  const outOfStockCount = products.filter((product) => {
    return Number(product.stock ?? 0) === 0;
  }).length;

  outOfStockProducts.textContent = outOfStockCount;

  dashboardRecentSales.innerHTML = "";

  if (validSales.length === 0) {
    dashboardRecentSales.innerHTML = `
      <div class="empty-dashboard">

        <div class="empty-dashboard-icon">
          📊
        </div>

        <h3>No sales yet</h3>

        <p>
          Your recent transactions will appear here.
        </p>

      </div>
    `;
  } else {
    validSales
      .slice()
      .reverse()
      .slice(0, 5)
      .forEach((sale) => {
        const recentSale = document.createElement("div");

        recentSale.classList.add("dashboard-sale-item");

        const receiptNo = formatSaleReceiptNo(sale);

        const dateTime = formatSaleDateTime(sale);

        const total = getSaleTotal(sale);

        recentSale.innerHTML = `
          <div class="dashboard-sale-info">

            <div class="dashboard-sale-icon">
              🧾
            </div>

            <div>
              <strong>
                ${receiptNo}
              </strong>

              <p>
                ${dateTime}
              </p>
            </div>

          </div>

          <strong class="dashboard-sale-total">
            ₦${total.toLocaleString()}.00
          </strong>
        `;

        dashboardRecentSales.appendChild(recentSale);
      });
  }

  dashboardTopProducts.innerHTML = "";

  const productSales = {};

  validSales.forEach((sale) => {
    const items = getSaleItems(sale);

    items.forEach((item) => {
      const itemName = item.name || "Unknown Product";

      const quantity = Number(item.quantity || 0);

      const itemTotal = Number(
        item.total ?? Number(item.price || 0) * quantity,
      );

      if (!productSales[itemName]) {
        productSales[itemName] = {
          name: itemName,

          quantity: 0,

          total: 0,
        };
      }

      productSales[itemName].quantity += quantity;

      productSales[itemName].total += itemTotal;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  if (topProducts.length === 0) {
    dashboardTopProducts.innerHTML = `
      <div class="empty-dashboard">

        <div class="empty-dashboard-icon">
          🛒
        </div>

        <h3>No product sales yet</h3>

        <p>
          Products will appear here after sales are completed.
        </p>

      </div>
    `;
  } else {
    topProducts.forEach((product, index) => {
      const topProduct = document.createElement("div");

      topProduct.classList.add("dashboard-product-item");

      topProduct.innerHTML = `
          <div class="dashboard-product-info">

            <div class="dashboard-product-rank">
              ${index + 1}
            </div>

            <div>
              <strong>
                ${product.name}
              </strong>

              <p>
                ${product.quantity}
                ${product.quantity === 1 ? "unit" : "units"}
                sold
              </p>
            </div>

          </div>

          <strong class="dashboard-product-total">
            ₦${product.total.toLocaleString()}.00
          </strong>
        `;

      dashboardTopProducts.appendChild(topProduct);
    });
  }
};

// =========================
// POS PRODUCT SEARCH
// =========================

if (productSearchInput) {
  productSearchInput.addEventListener("input", () => {
    const searchText = productSearchInput.value.trim().toLowerCase();

    const productsToShow = products.filter((product) =>
      String(product.name || "")
        .toLowerCase()
        .includes(searchText),
    );

    displayProducts(productsToShow);
  });
}

// =========================
// PRODUCTS MANAGEMENT SEARCH
// =========================

if (productsSearchInput) {
  productsSearchInput.addEventListener("input", () => {
    const searchText = productsSearchInput.value.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
      const productName = String(product.name || "").toLowerCase();

      const productBarcode = String(product.barcode || "").toLowerCase();

      const productCategory = String(product.category || "").toLowerCase();

      return (
        productName.includes(searchText) ||
        productBarcode.includes(searchText) ||
        productCategory.includes(searchText)
      );
    });

    displayRegisteredProducts(filteredProducts);
  });
}

// =========================
// BACKUP DATA
// =========================

if (backupDataBtn) {
  backupDataBtn.addEventListener("click", () => {
    const backupData = {
      products: products,
      salesHistory: salesHistory,
      storeSettings: storeSettings,
    };

    const backupFile = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(backupFile);

    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;

    downloadLink.download = `favour-store-backup-${Date.now()}.json`;

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(downloadUrl);

    alert("Backup downloaded successfully.");
  });
}

// =========================
// RESTORE PRODUCTS
// =========================
// Takes a file written by Backup Data and adds the products it holds that the
// store does not have yet. Sales history and settings are left alone, and
// nothing is overwritten.

const RESTORE_CATEGORIES = [
  "Food",
  "Drinks",
  "Toiletries",
  "Household",
  "Others",
];

if (restoreDataBtn && restoreDataInput) {
  restoreDataBtn.addEventListener("click", () => {
    restoreDataInput.click();
  });

  restoreDataInput.addEventListener("change", async () => {
    const file = restoreDataInput.files && restoreDataInput.files[0];

    if (!file) {
      return;
    }

    let backup = null;

    try {
      backup = JSON.parse(await file.text());
    } catch (error) {
      alert("That file could not be read as a backup.");

      restoreDataInput.value = "";

      return;
    }

    // Accepts a full backup file or a bare list of products.
    const incoming = Array.isArray(backup) ? backup : backup?.products;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      alert("No products were found in that file.");

      restoreDataInput.value = "";

      return;
    }

    const confirmed = confirm(
      `Restore ${incoming.length} products from ${file.name}?\n\nProducts already in the store are skipped. Sales history and settings are not changed.`,
    );

    if (!confirmed) {
      restoreDataInput.value = "";

      return;
    }

    let added = 0;
    let skipped = 0;
    let failed = 0;

    for (const entry of incoming) {
      const name = String(entry?.name ?? "").trim();

      if (name === "") {
        failed += 1;

        continue;
      }

      const barcode = String(entry?.barcode ?? "").trim();

      const alreadyHere = barcode
        ? findProductByBarcode(barcode)
        : products.find(
            (product) =>
              String(product.name).trim().toLowerCase() === name.toLowerCase(),
          );

      if (alreadyHere) {
        skipped += 1;

        continue;
      }

      const price = Number(entry?.price);

      const stock = Number(entry?.stock);

      const product = {
        name: name,

        price: Number.isFinite(price) && price > 0 ? price : 0,

        barcode: barcode,

        category: RESTORE_CATEGORIES.includes(entry?.category)
          ? entry.category
          : "Others",

        stock: Number.isFinite(stock) && stock > 0 ? Math.floor(stock) : 0,
      };

      if (isOnline()) {
        try {
          products.push(await api.products.create(product));

          added += 1;
        } catch (error) {
          console.error(`Could not restore ${name}:`, error.message);

          failed += 1;
        }
      } else {
        products.push({ id: Date.now() + added, ...product });

        added += 1;
      }
    }

    saveProducts();

    displayProducts();

    displayRegisteredProducts();

    displayDashboard();

    restoreDataInput.value = "";

    alert(
      `Restore finished.\n\nAdded: ${added}\nAlready in the store: ${skipped}\nCould not be added: ${failed}`,
    );
  });
}

// =========================
// CLEAR SALES HISTORY
// =========================

if (clearSalesHistoryBtn) {
  clearSalesHistoryBtn.addEventListener("click", async () => {
    if (salesHistory.length === 0) {
      alert("There is no sales history to clear.");

      return;
    }

    const confirmed = confirm(
      "Are you sure you want to clear all sales history?\n\nThis action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    if (isOnline()) {
      try {
        await api.sales.clear();
      } catch (error) {
        alert(`Could not clear sales history on the server.\n\n${error.message}`);

        return;
      }
    }

    salesHistory = [];

    localStorage.removeItem("salesHistory");

    displayHistory();

    displayDashboard();

    alert("Sales history cleared successfully.");
  });
}

// =========================
// INITIAL DISPLAY
// =========================

displayProducts(products);

displayCart();

displayHistory();

displayRegisteredProducts();

displayDashboard();

// =========================
// LOAD SAVED SETTINGS
// =========================

loadSettings();

applyDarkMode();

updateReceiptStoreInfo();

// =========================
// RESTORE LAST PAGE
// =========================

const savedPage = localStorage.getItem("activePage") || "pos";

if (
  savedPage === "history" ||
  savedPage === "products" ||
  savedPage === "dashboard" ||
  savedPage === "settings" ||
  savedPage === "pos"
) {
  showPage(savedPage);
} else {
  showPage("pos");
}

// =========================
// LOAD FROM THE BACKEND
// =========================
// The screens above are already painted from the local cache. This replaces
// that cache with the server's copy as soon as the API answers.

const hydrateFromServer = async () => {
  if (!api) {
    showOfflineNotice("api.js not loaded");

    return;
  }

  const online = await api.checkConnection();

  if (!online) {
    showOfflineNotice(api.reason);

    return;
  }

  try {
    const [serverProducts, serverSales, serverSettings] = await Promise.all([
      api.products.list(),
      api.sales.list(),
      api.settings.get(),
    ]);

    // `products` is a const array the rest of the file holds a reference to,
    // so it is refilled in place rather than reassigned.
    products.length = 0;

    serverProducts.forEach((product) => products.push(product));

    saveProducts();

    salesHistory = Array.isArray(serverSales) ? serverSales : [];

    cacheSalesHistory();

    storeSettings = { ...storeSettings, ...serverSettings };

    localStorage.setItem("storeSettings", JSON.stringify(storeSettings));

    // A cashier may already be scanning while this loads, so the cart is kept.
    // Items are re-keyed onto the server's ids; only items the server no longer
    // knows about are dropped.
    cart = cart.filter((item) => {
      // Manual items belong to no product and carry their own price.
      if (String(item.id).startsWith("manual-")) {
        return true;
      }

      const match =
        products.find((product) => product.id === item.id) ||
        (item.barcode &&
          products.find(
            (product) =>
              product.barcode &&
              String(product.barcode).trim() === String(item.barcode).trim(),
          ));

      if (!match) {
        return false;
      }

      item.id = match.id;

      item.name = match.name;

      item.price = Number(match.price);

      return true;
    });

    hideOfflineNotice();

    loadSettings();

    applyDarkMode();

    updateReceiptStoreInfo();

    displayProducts();

    displayCart();

    displayHistory();

    displayRegisteredProducts();

    displayDashboard();

    console.log(
      `Loaded ${products.length} products and ${salesHistory.length} sales from the server.`,
    );
  } catch (error) {
    api.online = false;

    console.error("Could not load data from the server:", error);

    showOfflineNotice(error.message);
  }
};

hydrateFromServer();

// =========================
// FINAL CONFIRMATION
// =========================

console.log("Favour Store POS JavaScript loaded successfully.");
