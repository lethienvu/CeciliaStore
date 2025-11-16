// ============================================
// ROUTER - SPA Routing System
// ============================================

import { showLoading, hideLoading } from "./utils.js";

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.components = new Map();
  }

  // Register a route
  register(path, component) {
    this.routes.set(path, component);
  }

  // Navigate to a route
  async navigate(path) {
    if (!this.routes.has(path)) {
      console.error(`Route ${path} not found`);
      path = "/"; // Fallback to home
    }

    this.currentRoute = path;

    // Update URL hash
    window.location.hash = path;

    // Update active nav item
    this.updateActiveNav(path);

    // Load component
    const component = this.routes.get(path);
    await this.loadComponent(component);
  }

  // Load component
  async loadComponent(component) {
    showLoading();

    const contentContainer = document.getElementById("pageContent");
    if (!contentContainer) {
      hideLoading();
      return;
    }

    try {
      // Check if component is cached
      if (this.components.has(component.name)) {
        const cachedHTML = this.components.get(component.name);
        contentContainer.innerHTML = cachedHTML;

        // Run component init
        if (component.init) {
          await component.init();
        }
      } else {
        // Render component
        const html = await component.render();
        contentContainer.innerHTML = html;

        // Cache component HTML
        this.components.set(component.name, html);

        // Run component init
        if (component.init) {
          await component.init();
        }
      }

      // Update page title
      if (component.title) {
        document.getElementById("pageTitle").textContent = component.title;
        document.title = `${component.title} - ${CONFIG.APP_NAME}`;
      }

      hideLoading();
    } catch (error) {
      console.error("Error loading component:", error);
      contentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="empty-state-title">Có lỗi xảy ra</h3>
                    <p class="empty-state-description">Không thể tải nội dung trang</p>
                </div>
            `;
      hideLoading();
    }
  }

  // Update active navigation item
  updateActiveNav(path) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.classList.remove("active");

      const href = item.getAttribute("href");
      if (href === `#${path}`) {
        item.classList.add("active");
      }
    });
  }

  // Start router
  start() {
    // Handle hash changes
    window.addEventListener("hashchange", () => {
      const path = window.location.hash.substring(1) || "/";
      this.navigate(path);
    });

    // Handle navigation clicks
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const path = link.getAttribute("href").substring(1);
        this.navigate(path);
      }
    });

    // Load initial route
    const initialPath = window.location.hash.substring(1) || "/";
    this.navigate(initialPath);
  }

  // Clear component cache
  clearCache() {
    this.components.clear();
  }

  // Refresh current route
  async refresh() {
    this.components.delete(this.routes.get(this.currentRoute).name);
    await this.navigate(this.currentRoute);
  }
}

// Create singleton instance
const router = new Router();

export default router;
