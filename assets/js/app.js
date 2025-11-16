// ============================================
// APP.JS - Main Application Entry Point
// ============================================

import CONFIG from "./config.js";
import router from "./router.js";
import googleSheetsAPI from "./googleSheetsAPI.js";
import invoiceManager from "./invoiceManager.js";
import productManager from "./productManager.js";
import reportGenerator from "./reportGenerator.js";
import pdfExporter from "./pdfExporter.js";
import emailSender from "./emailSender.js";
import { showToast, storage, debounce } from "./utils.js";

// Import page components
import dashboardComponent from "../components/dashboard.js";
import invoicesComponent from "../components/invoices.js";
import productsComponent from "../components/products.js";
import reportsComponent from "../components/reports.js";
import settingsComponent from "../components/settings.js";

class App {
  constructor() {
    this.isInitialized = false;
    this.darkMode = storage.get("darkMode", false);
  }

  // Initialize application
  async init() {
    console.log("Initializing HPSF Manager...");

    try {
      // Apply dark mode if enabled
      if (this.darkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
      }

      // Setup UI event listeners
      this.setupEventListeners();

      // Initialize Google Sheets API
      await googleSheetsAPI.init();

      // Initialize EmailJS
      emailSender.init();

      // Register routes
      this.registerRoutes();

      // Start router
      router.start();

      // Load initial data
      await this.loadInitialData();

      this.isInitialized = true;
      console.log("HPSF Manager initialized successfully");
    } catch (error) {
      console.error("Error initializing app:", error);
      showToast("Có lỗi xảy ra khi khởi động ứng dụng", "error");
    }
  }

  // Register all routes
  registerRoutes() {
    router.register("/", dashboardComponent);
    router.register("/invoices", invoicesComponent);
    router.register("/products", productsComponent);
    router.register("/reports", reportsComponent);
    router.register("/settings", settingsComponent);
  }

  // Load initial data
  async loadInitialData() {
    try {
      // Pre-load invoices and products for better performance
      const [invoices, products] = await Promise.all([
        invoiceManager.loadInvoices(),
        productManager.loadProducts(),
      ]);

      // Update invoice count badge
      const badge = document.getElementById("invoiceCount");
      if (badge) {
        badge.textContent = invoices.length;
      }

      console.log(
        `Loaded ${invoices.length} invoices and ${products.length} products`
      );
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        storage.set(
          "sidebarCollapsed",
          sidebar.classList.contains("collapsed")
        );
      });

      // Restore sidebar state
      if (storage.get("sidebarCollapsed", false)) {
        sidebar.classList.add("collapsed");
      }
    }

    // Mobile sidebar toggle
    const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
    if (mobileSidebarToggle && sidebar) {
      mobileSidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener("click", (e) => {
        if (
          window.innerWidth <= 768 &&
          !sidebar.contains(e.target) &&
          !mobileSidebarToggle.contains(e.target)
        ) {
          sidebar.classList.remove("show");
        }
      });
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", () => {
        this.toggleDarkMode();
      });
    }

    // Global search
    const globalSearch = document.getElementById("globalSearch");
    if (globalSearch) {
      globalSearch.addEventListener(
        "input",
        debounce((e) => {
          this.handleGlobalSearch(e.target.value);
        }, 300)
      );
    }

    // Sync button
    const syncButton = document.getElementById("syncButton");
    if (syncButton) {
      syncButton.addEventListener("click", async () => {
        syncButton.querySelector("i").classList.add("fa-spin");
        await googleSheetsAPI.sync();
        await this.loadInitialData();
        router.refresh();
        syncButton.querySelector("i").classList.remove("fa-spin");
      });
    }

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
      const path = window.location.hash.substring(1) || "/";
      router.navigate(path);
    });
  }

  // Toggle dark mode
  toggleDarkMode() {
    this.darkMode = !this.darkMode;

    if (this.darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    storage.set("darkMode", this.darkMode);

    const icon = document.querySelector("#darkModeToggle i");
    if (icon) {
      icon.className = this.darkMode ? "fas fa-sun" : "fas fa-moon";
    }
  }

  // Handle global search
  async handleGlobalSearch(query) {
    if (!query || query.length < 2) return;

    console.log("Searching for:", query);

    // Search in invoices and products
    const invoiceResults = invoiceManager.searchInvoices(query);
    const productResults = productManager.searchProducts(query);

    // Show search results (implement dropdown or navigate to search page)
    // For now, just log results
    console.log("Invoice results:", invoiceResults.length);
    console.log("Product results:", productResults.length);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const app = new App();
  await app.init();

  // Make modules available globally for inline event handlers
  window.app = app;
  window.invoiceManager = invoiceManager;
  window.productManager = productManager;
  window.pdfExporter = pdfExporter;
  window.emailSender = emailSender;
  window.router = router;
});

// Global helper functions for inline event handlers
window.viewInvoice = async (invoiceId) => {
  // Navigate to invoice detail
  console.log("View invoice:", invoiceId);
  showToast("Chức năng xem chi tiết đang phát triển", "info");
};

window.editInvoice = async (invoiceId) => {
  console.log("Edit invoice:", invoiceId);
  showToast("Chức năng chỉnh sửa đang phát triển", "info");
};

window.deleteInvoice = async (invoiceId) => {
  const success = await invoiceManager.deleteInvoice(invoiceId);
  if (success) {
    router.refresh();
  }
};

window.printInvoice = async (invoiceId) => {
  await pdfExporter.exportInvoicePDF(invoiceId);
};

window.emailInvoice = async (invoiceId) => {
  await emailSender.showEmailDialog(invoiceId);
};

window.editProduct = async (productId) => {
  console.log("Edit product:", productId);
  showToast("Chức năng chỉnh sửa đang phát triển", "info");
};

window.deleteProduct = async (productId) => {
  const success = await productManager.deleteProduct(productId);
  if (success) {
    router.refresh();
  }
};

export default App;
