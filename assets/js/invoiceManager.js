// ============================================
// INVOICE MANAGER - Quản lý hóa đơn
// ============================================

import CONFIG, { INVOICE_STATUS, INVOICE_STATUS_COLORS } from "./config.js";
import googleSheetsAPI from "./googleSheetsAPI.js";
import {
  formatCurrency,
  formatDate,
  showToast,
  showConfirm,
  generateId,
} from "./utils.js";

class InvoiceManager {
  constructor() {
    this.invoices = [];
    this.currentInvoice = null;
  }

  // Load all invoices from Google Sheets
  async loadInvoices() {
    try {
      const data = await googleSheetsAPI.readSheet(CONFIG.SHEETS.INVOICES);
      if (!data || data.length <= 1) {
        this.invoices = [];
        return [];
      }

      this.invoices = googleSheetsAPI.parseSheetData(data);
      return this.invoices;
    } catch (error) {
      console.error("Error loading invoices:", error);
      showToast("Không thể tải danh sách hóa đơn", "error");
      return [];
    }
  }

  // Get invoice by ID
  async getInvoiceById(invoiceId) {
    const invoices = await this.loadInvoices();
    return invoices.find((inv) => inv.ID === invoiceId);
  }

  // Get invoice details (items)
  async getInvoiceDetails(invoiceId) {
    try {
      const data = await googleSheetsAPI.readSheet(
        CONFIG.SHEETS.INVOICE_DETAILS
      );
      if (!data || data.length <= 1) return [];

      const details = googleSheetsAPI.parseSheetData(data);
      return details.filter((detail) => detail.InvoiceID === invoiceId);
    } catch (error) {
      console.error("Error loading invoice details:", error);
      return [];
    }
  }

  // Create new invoice
  async createInvoice(invoiceData, items) {
    try {
      // Generate invoice ID
      const invoiceId = await googleSheetsAPI.getNextInvoiceNumber();

      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.price),
        0
      );
      const tax = subtotal * CONFIG.VAT_RATE;
      const discount = parseFloat(invoiceData.discount) || 0;
      const total = subtotal + tax - discount;

      // Prepare invoice data
      const invoice = {
        ID: invoiceId,
        NgayTao: formatDate(new Date(), "dd/MM/yyyy HH:mm"),
        MaKH: invoiceData.customerId || "",
        TenKH: invoiceData.customerName,
        SDT: invoiceData.phone || "",
        Email: invoiceData.email || "",
        TongTien: subtotal,
        Thue: tax,
        ChietKhau: discount,
        ThanhTien: total,
        TrangThai: invoiceData.status || INVOICE_STATUS.UNPAID,
        GhiChu: invoiceData.notes || "",
      };

      // Append invoice to sheet
      const invoiceValues = [
        [
          invoice.ID,
          invoice.NgayTao,
          invoice.MaKH,
          invoice.TenKH,
          invoice.SDT,
          invoice.Email,
          invoice.TongTien,
          invoice.Thue,
          invoice.ChietKhau,
          invoice.ThanhTien,
          invoice.TrangThai,
          invoice.GhiChu,
        ],
      ];

      const invoiceSuccess = await googleSheetsAPI.appendSheet(
        CONFIG.SHEETS.INVOICES,
        invoiceValues
      );
      if (!invoiceSuccess) {
        throw new Error("Failed to create invoice");
      }

      // Append invoice details
      const detailValues = items.map((item) => [
        invoice.ID,
        item.productId,
        item.productName,
        item.quantity,
        item.price,
        parseFloat(item.quantity) * parseFloat(item.price),
      ]);

      const detailsSuccess = await googleSheetsAPI.appendSheet(
        CONFIG.SHEETS.INVOICE_DETAILS,
        detailValues
      );
      if (!detailsSuccess) {
        throw new Error("Failed to create invoice details");
      }

      showToast(`Hóa đơn ${invoiceId} đã được tạo thành công`, "success");
      return invoice;
    } catch (error) {
      console.error("Error creating invoice:", error);
      showToast("Không thể tạo hóa đơn", "error");
      return null;
    }
  }

  // Update invoice
  async updateInvoice(invoiceId, invoiceData, items) {
    try {
      // Find invoice row index
      const rowIndex = await googleSheetsAPI.findRowIndex(
        CONFIG.SHEETS.INVOICES,
        0,
        invoiceId
      );
      if (rowIndex === -1) {
        showToast("Không tìm thấy hóa đơn", "error");
        return false;
      }

      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.price),
        0
      );
      const tax = subtotal * CONFIG.VAT_RATE;
      const discount = parseFloat(invoiceData.discount) || 0;
      const total = subtotal + tax - discount;

      // Update invoice data
      const invoiceValues = [
        [
          invoiceId,
          invoiceData.createdDate,
          invoiceData.customerId || "",
          invoiceData.customerName,
          invoiceData.phone || "",
          invoiceData.email || "",
          subtotal,
          tax,
          discount,
          total,
          invoiceData.status,
          invoiceData.notes || "",
        ],
      ];

      // Update invoice row
      const invoiceSuccess = await googleSheetsAPI.writeSheet(
        CONFIG.SHEETS.INVOICES,
        `A${rowIndex + 1}:L${rowIndex + 1}`,
        invoiceValues
      );

      if (!invoiceSuccess) {
        throw new Error("Failed to update invoice");
      }

      // Delete old invoice details
      await this.deleteInvoiceDetails(invoiceId);

      // Add new invoice details
      const detailValues = items.map((item) => [
        invoiceId,
        item.productId,
        item.productName,
        item.quantity,
        item.price,
        parseFloat(item.quantity) * parseFloat(item.price),
      ]);

      await googleSheetsAPI.appendSheet(
        CONFIG.SHEETS.INVOICE_DETAILS,
        detailValues
      );

      showToast("Hóa đơn đã được cập nhật", "success");
      return true;
    } catch (error) {
      console.error("Error updating invoice:", error);
      showToast("Không thể cập nhật hóa đơn", "error");
      return false;
    }
  }

  // Delete invoice
  async deleteInvoice(invoiceId) {
    const confirmed = await showConfirm(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa hóa đơn ${invoiceId}? Hành động này không thể hoàn tác.`
    );

    if (!confirmed) return false;

    try {
      // Find and delete invoice row
      const rowIndex = await googleSheetsAPI.findRowIndex(
        CONFIG.SHEETS.INVOICES,
        0,
        invoiceId
      );
      if (rowIndex === -1) {
        showToast("Không tìm thấy hóa đơn", "error");
        return false;
      }

      await googleSheetsAPI.deleteRow(CONFIG.SHEETS.INVOICES, rowIndex);

      // Delete invoice details
      await this.deleteInvoiceDetails(invoiceId);

      showToast("Hóa đơn đã được xóa", "success");
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      showToast("Không thể xóa hóa đơn", "error");
      return false;
    }
  }

  // Delete invoice details
  async deleteInvoiceDetails(invoiceId) {
    try {
      const data = await googleSheetsAPI.readSheet(
        CONFIG.SHEETS.INVOICE_DETAILS
      );
      if (!data || data.length <= 1) return true;

      // Find all rows with this invoice ID (from bottom to top to avoid index shifting)
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][0] === invoiceId) {
          await googleSheetsAPI.deleteRow(CONFIG.SHEETS.INVOICE_DETAILS, i);
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting invoice details:", error);
      return false;
    }
  }

  // Search invoices
  searchInvoices(query, status = null) {
    let results = [...this.invoices];

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (inv) =>
          inv.ID.toLowerCase().includes(lowerQuery) ||
          inv.TenKH.toLowerCase().includes(lowerQuery) ||
          inv.SDT.includes(query) ||
          inv.Email.toLowerCase().includes(lowerQuery)
      );
    }

    if (status) {
      results = results.filter((inv) => inv.TrangThai === status);
    }

    return results;
  }

  // Filter invoices by date range
  filterByDateRange(startDate, endDate) {
    return this.invoices.filter((inv) => {
      const invDate = new Date(inv.NgayTao);
      return invDate >= startDate && invDate <= endDate;
    });
  }

  // Get invoice statistics
  async getStatistics() {
    await this.loadInvoices();

    const stats = {
      total: this.invoices.length,
      paid: 0,
      unpaid: 0,
      cancelled: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      monthRevenue: 0,
    };

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.invoices.forEach((inv) => {
      const invDate = new Date(inv.NgayTao);
      const amount = parseFloat(inv.ThanhTien) || 0;

      // Count by status
      if (inv.TrangThai === INVOICE_STATUS.PAID) {
        stats.paid++;
        stats.totalRevenue += amount;

        // Today's revenue
        if (invDate.toDateString() === today.toDateString()) {
          stats.todayRevenue += amount;
        }

        // This month's revenue
        if (invDate >= startOfMonth) {
          stats.monthRevenue += amount;
        }
      } else if (inv.TrangThai === INVOICE_STATUS.UNPAID) {
        stats.unpaid++;
      } else if (inv.TrangThai === INVOICE_STATUS.CANCELLED) {
        stats.cancelled++;
      }
    });

    return stats;
  }

  // Render invoice list
  renderInvoiceList(invoices, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!invoices || invoices.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-file-invoice"></i>
                    </div>
                    <h3 class="empty-state-title">Chưa có hóa đơn</h3>
                    <p class="empty-state-description">Bắt đầu tạo hóa đơn đầu tiên của bạn</p>
                </div>
            `;
      return;
    }

    const tableHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mã HĐ</th>
                            <th>Ngày tạo</th>
                            <th>Khách hàng</th>
                            <th>Số điện thoại</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices
                          .map(
                            (inv) => `
                            <tr>
                                <td><strong>${inv.ID}</strong></td>
                                <td>${inv.NgayTao}</td>
                                <td>${inv.TenKH}</td>
                                <td>${inv.SDT}</td>
                                <td><strong>${formatCurrency(
                                  inv.ThanhTien
                                )}</strong></td>
                                <td>
                                    <span class="badge badge-${
                                      INVOICE_STATUS_COLORS[inv.TrangThai]
                                    }">
                                        ${inv.TrangThai}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon" onclick="viewInvoice('${
                                          inv.ID
                                        }')" title="Xem">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon" onclick="editInvoice('${
                                          inv.ID
                                        }')" title="Sửa">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon" onclick="printInvoice('${
                                          inv.ID
                                        }')" title="In">
                                            <i class="fas fa-print"></i>
                                        </button>
                                        <button class="btn-icon" onclick="deleteInvoice('${
                                          inv.ID
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
}

// Create singleton instance
const invoiceManager = new InvoiceManager();

export default invoiceManager;
