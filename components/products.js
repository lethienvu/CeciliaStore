// ============================================
// PRODUCTS COMPONENT
// ============================================

import productManager from "../assets/js/productManager.js";
import { showToast } from "../assets/js/utils.js";

const productsComponent = {
  name: "products",
  title: "Quản Lý Sản Phẩm",

  async render() {
    return `
            <div class="products-page">
                <!-- Header Actions -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                            <div style="flex: 1; max-width: 400px;">
                                <input type="text" 
                                       id="productSearch" 
                                       class="form-control" 
                                       placeholder="Tìm kiếm sản phẩm...">
                            </div>
                            <button class="btn btn-primary" onclick="createNewProduct()">
                                <i class="fas fa-plus"></i> Thêm sản phẩm mới
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Products List -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Danh sách sản phẩm</h3>
                        <div id="productStats" style="color: #6b7280; font-size: 0.875rem;"></div>
                    </div>
                    <div class="card-body">
                        <div id="productList">
                            <div style="text-align: center; padding: 2rem;">
                                <div class="spinner"></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  },

  async init() {
    // Load products
    await this.loadProducts();

    // Setup search
    const searchInput = document.getElementById("productSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterProducts(e.target.value);
      });
    }
  },

  async loadProducts() {
    const products = await productManager.loadProducts();

    // Update stats
    const statsEl = document.getElementById("productStats");
    if (statsEl) {
      const lowStock = productManager.getLowStockProducts(10).length;
      statsEl.textContent = `Tổng: ${products.length} sản phẩm | Sắp hết: ${lowStock}`;
    }

    // Render list
    productManager.renderProductList(products, "productList");
  },

  filterProducts(query) {
    const results = productManager.searchProducts(query);

    // Update stats
    const statsEl = document.getElementById("productStats");
    if (statsEl) {
      statsEl.textContent = `Tìm thấy: ${results.length} sản phẩm`;
    }

    productManager.renderProductList(results, "productList");
  },
};

// Global function for creating new product
window.createNewProduct = () => {
  showToast("Chức năng thêm sản phẩm đang phát triển", "info");
  // TODO: Open product creation modal
};

export default productsComponent;
