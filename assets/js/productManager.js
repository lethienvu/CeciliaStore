// ============================================
// PRODUCT MANAGER - Quản lý sản phẩm
// ============================================

import CONFIG from "./config.js";
import googleSheetsAPI from "./googleSheetsAPI.js";
import { formatCurrency, showToast, showConfirm } from "./utils.js";

class ProductManager {
  constructor() {
    this.products = [];
  }

  // Load all products from Google Sheets
  async loadProducts() {
    try {
      const data = await googleSheetsAPI.readSheet(CONFIG.SHEETS.PRODUCTS);
      if (!data || data.length <= 1) {
        this.products = [];
        return [];
      }

      this.products = googleSheetsAPI.parseSheetData(data);
      return this.products;
    } catch (error) {
      console.error("Error loading products:", error);
      showToast("Không thể tải danh sách sản phẩm", "error");
      return [];
    }
  }

  // Get product by ID
  async getProductById(productId) {
    const products = await this.loadProducts();
    return products.find((p) => p.MaSP === productId);
  }

  // Create new product
  async createProduct(productData) {
    try {
      // Validate product ID uniqueness
      const existing = await this.getProductById(productData.productId);
      if (existing) {
        showToast("Mã sản phẩm đã tồn tại", "error");
        return false;
      }

      const values = [
        [
          productData.productId,
          productData.productName,
          productData.unit || "Hộp",
          productData.price,
          productData.origin || "",
          productData.expiryDate || "",
          productData.stock || 0,
          productData.description || "",
        ],
      ];

      const success = await googleSheetsAPI.appendSheet(
        CONFIG.SHEETS.PRODUCTS,
        values
      );

      if (success) {
        showToast("Sản phẩm đã được thêm thành công", "success");
        await this.loadProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating product:", error);
      showToast("Không thể thêm sản phẩm", "error");
      return false;
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const rowIndex = await googleSheetsAPI.findRowIndex(
        CONFIG.SHEETS.PRODUCTS,
        0,
        productId
      );
      if (rowIndex === -1) {
        showToast("Không tìm thấy sản phẩm", "error");
        return false;
      }

      const values = [
        [
          productId,
          productData.productName,
          productData.unit,
          productData.price,
          productData.origin || "",
          productData.expiryDate || "",
          productData.stock || 0,
          productData.description || "",
        ],
      ];

      const success = await googleSheetsAPI.writeSheet(
        CONFIG.SHEETS.PRODUCTS,
        `A${rowIndex + 1}:H${rowIndex + 1}`,
        values
      );

      if (success) {
        showToast("Sản phẩm đã được cập nhật", "success");
        await this.loadProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Không thể cập nhật sản phẩm", "error");
      return false;
    }
  }

  // Delete product
  async deleteProduct(productId) {
    const confirmed = await showConfirm(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa sản phẩm ${productId}?`
    );

    if (!confirmed) return false;

    try {
      const rowIndex = await googleSheetsAPI.findRowIndex(
        CONFIG.SHEETS.PRODUCTS,
        0,
        productId
      );
      if (rowIndex === -1) {
        showToast("Không tìm thấy sản phẩm", "error");
        return false;
      }

      await googleSheetsAPI.deleteRow(CONFIG.SHEETS.PRODUCTS, rowIndex);
      showToast("Sản phẩm đã được xóa", "success");
      await this.loadProducts();
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Không thể xóa sản phẩm", "error");
      return false;
    }
  }

  // Search products
  searchProducts(query) {
    if (!query) return this.products;

    const lowerQuery = query.toLowerCase();
    return this.products.filter(
      (p) =>
        p.MaSP.toLowerCase().includes(lowerQuery) ||
        p.TenSP.toLowerCase().includes(lowerQuery) ||
        p.XuatXu.toLowerCase().includes(lowerQuery)
    );
  }

  // Get low stock products
  getLowStockProducts(threshold = 10) {
    return this.products.filter((p) => parseInt(p.TonKho) <= threshold);
  }

  // Render product list
  renderProductList(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-pills"></i>
                    </div>
                    <h3 class="empty-state-title">Chưa có sản phẩm</h3>
                    <p class="empty-state-description">Thêm sản phẩm để bắt đầu quản lý</p>
                </div>
            `;
      return;
    }

    const tableHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Đơn vị</th>
                            <th>Giá bán</th>
                            <th>Xuất xứ</th>
                            <th>Tồn kho</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products
                          .map(
                            (p) => `
                            <tr>
                                <td><strong>${p.MaSP}</strong></td>
                                <td>${p.TenSP}</td>
                                <td>${p.DonVi}</td>
                                <td><strong>${formatCurrency(
                                  p.GiaBan
                                )}</strong></td>
                                <td>${p.XuatXu}</td>
                                <td>
                                    <span class="badge ${
                                      parseInt(p.TonKho) <= 10
                                        ? "badge-danger"
                                        : "badge-success"
                                    }">
                                        ${p.TonKho}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon" onclick="editProduct('${
                                          p.MaSP
                                        }')" title="Sửa">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon" onclick="deleteProduct('${
                                          p.MaSP
                                        }')" title="Xóa">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;

    container.innerHTML = tableHTML;
  }

  // Render product dropdown for invoice form
  renderProductDropdown(selectElement) {
    if (!selectElement) return;

    const options = [
      '<option value="">-- Chọn sản phẩm --</option>',
      ...this.products.map(
        (p) =>
          `<option value="${p.MaSP}" data-price="${p.GiaBan}" data-unit="${
            p.DonVi
          }">
                    ${p.TenSP} - ${formatCurrency(p.GiaBan)}/${p.DonVi}
                </option>`
      ),
    ].join("");

    selectElement.innerHTML = options;
  }

  // Create autocomplete product input
  createProductAutocomplete(inputElement, onSelect) {
    if (!inputElement) return;

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-menu";
    dropdown.style.position = "absolute";
    dropdown.style.width = inputElement.offsetWidth + "px";
    inputElement.parentElement.style.position = "relative";
    inputElement.parentElement.appendChild(dropdown);

    inputElement.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();

      if (query.length < 2) {
        dropdown.classList.remove("show");
        return;
      }

      const filtered = this.searchProducts(query).slice(0, 10);

      if (filtered.length === 0) {
        dropdown.classList.remove("show");
        return;
      }

      dropdown.innerHTML = filtered
        .map(
          (p) => `
                <a class="dropdown-item" href="#" data-id="${
                  p.MaSP
                }" data-name="${p.TenSP}" data-price="${p.GiaBan}" data-unit="${
            p.DonVi
          }">
                    <strong>${p.TenSP}</strong><br>
                    <small>${p.MaSP} - ${formatCurrency(p.GiaBan)}/${
            p.DonVi
          }</small>
                </a>
            `
        )
        .join("");

      dropdown.classList.add("show");

      // Add click handlers
      dropdown.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const product = {
            id: e.currentTarget.dataset.id,
            name: e.currentTarget.dataset.name,
            price: e.currentTarget.dataset.price,
            unit: e.currentTarget.dataset.unit,
          };
          onSelect(product);
          inputElement.value = product.name;
          dropdown.classList.remove("show");
        });
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!inputElement.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
      }
    });
  }
}

// Create singleton instance
const productManager = new ProductManager();

export default productManager;
