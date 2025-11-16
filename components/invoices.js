// ============================================
// INVOICES COMPONENT
// ============================================

import invoiceManager from "../assets/js/invoiceManager.js";
import { INVOICE_STATUS } from "../assets/js/config.js";
import { showToast } from "../assets/js/utils.js";

const invoicesComponent = {
  name: "invoices",
  title: "Quản Lý Hóa Đơn",

  async render() {
    return `
            <div class="invoices-page">
                <!-- Header Actions -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                            <div style="flex: 1; max-width: 400px;">
                                <input type="text" 
                                       id="invoiceSearch" 
                                       class="form-control" 
                                       placeholder="Tìm kiếm hóa đơn...">
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="statusFilter" class="form-control" style="width: 180px;">
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="${INVOICE_STATUS.PAID}">${INVOICE_STATUS.PAID}</option>
                                    <option value="${INVOICE_STATUS.UNPAID}">${INVOICE_STATUS.UNPAID}</option>
                                    <option value="${INVOICE_STATUS.CANCELLED}">${INVOICE_STATUS.CANCELLED}</option>
                                </select>
                                <button class="btn btn-primary" onclick="createNewInvoice()">
                                    <i class="fas fa-plus"></i> Tạo hóa đơn mới
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Invoices List -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Danh sách hóa đơn</h3>
                        <div id="invoiceStats" style="color: #6b7280; font-size: 0.875rem;"></div>
                    </div>
                    <div class="card-body">
                        <div id="invoiceList">
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
    // Load invoices
    await this.loadInvoices();

    // Setup search
    const searchInput = document.getElementById("invoiceSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterInvoices(e.target.value);
      });
    }

    // Setup status filter
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterInvoices(searchInput?.value || "", e.target.value);
      });
    }
  },

  async loadInvoices() {
    const invoices = await invoiceManager.loadInvoices();

    // Update stats
    const statsEl = document.getElementById("invoiceStats");
    if (statsEl) {
      statsEl.textContent = `Tổng: ${invoices.length} hóa đơn`;
    }

    // Render list
    invoiceManager.renderInvoiceList(invoices, "invoiceList");
  },

  filterInvoices(query, status) {
    const statusFilter =
      status || document.getElementById("statusFilter")?.value || "";
    const results = invoiceManager.searchInvoices(query, statusFilter || null);

    // Update stats
    const statsEl = document.getElementById("invoiceStats");
    if (statsEl) {
      statsEl.textContent = `Tìm thấy: ${results.length} hóa đơn`;
    }

    invoiceManager.renderInvoiceList(results, "invoiceList");
  },
};

// Global function for creating new invoice
window.createNewInvoice = () => {
  showToast("Chức năng tạo hóa đơn đang phát triển", "info");
  // TODO: Open invoice creation modal
};

export default invoicesComponent;
