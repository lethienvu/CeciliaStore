// ============================================
// DASHBOARD COMPONENT
// ============================================

import invoiceManager from "../assets/js/invoiceManager.js";
import productManager from "../assets/js/productManager.js";
import reportGenerator from "../assets/js/reportGenerator.js";
import { formatCurrency } from "../assets/js/utils.js";

const dashboardComponent = {
  name: "dashboard",
  title: "Dashboard",

  async render() {
    // Get statistics
    const stats = await invoiceManager.getStatistics();
    const products = await productManager.loadProducts();
    const lowStock = productManager.getLowStockProducts(10);

    return `
            <div class="dashboard">
                <!-- Stats Cards -->
                <div class="grid grid-cols-4 mb-4">
                    <div class="stats-card" style="background: linear-gradient(135deg, #5C3E94, #4A2F7A);">
                        <div class="stats-card-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stats-card-value">${formatCurrency(
                          stats.todayRevenue
                        )}</div>
                        <div class="stats-card-label">Doanh thu hôm nay</div>
                        <div class="stats-card-trend up">
                            <i class="fas fa-arrow-up"></i>
                            <span>Tăng trưởng tốt</span>
                        </div>
                    </div>

                    <div class="stats-card" style="background: linear-gradient(135deg, #F25912, #D54E10);">
                        <div class="stats-card-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stats-card-value">${formatCurrency(
                          stats.monthRevenue
                        )}</div>
                        <div class="stats-card-label">Doanh thu tháng này</div>
                    </div>

                    <div class="stats-card" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
                        <div class="stats-card-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stats-card-value">${stats.total}</div>
                        <div class="stats-card-label">Tổng số hóa đơn</div>
                    </div>

                    <div class="stats-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <div class="stats-card-icon">
                            <i class="fas fa-pills"></i>
                        </div>
                        <div class="stats-card-value">${products.length}</div>
                        <div class="stats-card-label">Sản phẩm</div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-2 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Doanh thu 30 ngày</h3>
                        </div>
                        <div class="card-body" style="height: 300px;">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Top sản phẩm bán chạy</h3>
                        </div>
                        <div class="card-body" style="height: 300px;">
                            <canvas id="topProductsChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity & Low Stock -->
                <div class="grid grid-cols-2">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Hóa đơn gần đây</h3>
                            <a href="#/invoices" class="btn btn-sm btn-outline">Xem tất cả</a>
                        </div>
                        <div class="card-body">
                            <div id="recentInvoices"></div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Sản phẩm sắp hết hàng</h3>
                            <span class="badge badge-danger">${
                              lowStock.length
                            }</span>
                        </div>
                        <div class="card-body">
                            ${
                              lowStock.length > 0
                                ? `
                                <div class="table-container">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th>Tồn kho</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${lowStock
                                              .slice(0, 5)
                                              .map(
                                                (p) => `
                                                <tr>
                                                    <td><strong>${p.TenSP}</strong></td>
                                                    <td>
                                                        <span class="badge badge-danger">
                                                            ${p.TonKho}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `
                                              )
                                              .join("")}
                                        </tbody>
                                    </table>
                                </div>
                            `
                                : `
                                <div class="empty-state">
                                    <p>Tất cả sản phẩm đều đủ hàng</p>
                                </div>
                            `
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
  },

  async init() {
    // Render charts
    await reportGenerator.renderDailyRevenueChart("revenueChart", 30);
    await reportGenerator.renderTopProductsChart("topProductsChart", 10);

    // Load recent invoices
    this.loadRecentInvoices();
  },

  async loadRecentInvoices() {
    const invoices = await invoiceManager.loadInvoices();
    const recent = invoices.slice(0, 5);

    const container = document.getElementById("recentInvoices");
    if (!container) return;

    if (recent.length === 0) {
      container.innerHTML = '<p class="text-center">Chưa có hóa đơn nào</p>';
      return;
    }

    container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mã HĐ</th>
                            <th>Khách hàng</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recent
                          .map(
                            (inv) => `
                            <tr>
                                <td><strong>${inv.ID}</strong></td>
                                <td>${inv.TenKH}</td>
                                <td><strong>${formatCurrency(
                                  inv.ThanhTien
                                )}</strong></td>
                                <td>
                                    <span class="badge badge-${
                                      inv.TrangThai === "Đã thanh toán"
                                        ? "success"
                                        : "warning"
                                    }">
                                        ${inv.TrangThai}
                                    </span>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  },
};

export default dashboardComponent;
