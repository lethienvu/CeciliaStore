// ============================================
// REPORT GENERATOR - Tạo báo cáo và thống kê
// ============================================

import invoiceManager from "./invoiceManager.js";
import productManager from "./productManager.js";
import { formatCurrency, formatDate, getRandomColor } from "./utils.js";

class ReportGenerator {
  constructor() {
    this.charts = {};
  }

  // Generate revenue report
  async generateRevenueReport(startDate, endDate) {
    const invoices = await invoiceManager.loadInvoices();
    const filtered = invoices.filter((inv) => {
      const invDate = new Date(inv.NgayTao);
      return (
        invDate >= startDate &&
        invDate <= endDate &&
        inv.TrangThai === "Đã thanh toán"
      );
    });

    const totalRevenue = filtered.reduce(
      (sum, inv) => sum + parseFloat(inv.ThanhTien || 0),
      0
    );
    const totalInvoices = filtered.length;
    const avgInvoiceValue =
      totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      totalRevenue,
      totalInvoices,
      avgInvoiceValue,
      invoices: filtered,
    };
  }

  // Generate product sales report
  async generateProductSalesReport(startDate, endDate) {
    const invoices = await invoiceManager.loadInvoices();
    const filtered = invoices.filter((inv) => {
      const invDate = new Date(inv.NgayTao);
      return (
        invDate >= startDate &&
        invDate <= endDate &&
        inv.TrangThai === "Đã thanh toán"
      );
    });

    const productSales = new Map();

    for (const invoice of filtered) {
      const details = await invoiceManager.getInvoiceDetails(invoice.ID);
      details.forEach((item) => {
        const key = item.MaSP;
        if (!productSales.has(key)) {
          productSales.set(key, {
            productId: item.MaSP,
            productName: item.TenSP,
            quantity: 0,
            revenue: 0,
          });
        }
        const product = productSales.get(key);
        product.quantity += parseFloat(item.SoLuong);
        product.revenue += parseFloat(item.ThanhTien);
      });
    }

    return Array.from(productSales.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }

  // Generate daily revenue chart
  async renderDailyRevenueChart(canvasId, days = 30) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const invoices = await invoiceManager.loadInvoices();

    // Group by date
    const dailyData = new Map();
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateKey = formatDate(d, "dd/MM/yyyy");
      dailyData.set(dateKey, 0);
    }

    invoices.forEach((inv) => {
      if (inv.TrangThai === "Đã thanh toán") {
        const dateKey = inv.NgayTao.split(" ")[0]; // Get date part only
        if (dailyData.has(dateKey)) {
          dailyData.set(
            dateKey,
            dailyData.get(dateKey) + parseFloat(inv.ThanhTien || 0)
          );
        }
      }
    });

    const labels = Array.from(dailyData.keys());
    const data = Array.from(dailyData.values());

    // Destroy existing chart
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    // Create new chart
    this.charts[canvasId] = new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Doanh thu",
            data: data,
            borderColor: "#5C3E94",
            backgroundColor: "rgba(92, 62, 148, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => formatCurrency(context.parsed.y),
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });
  }

  // Generate top products chart
  async renderTopProductsChart(canvasId, limit = 10) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const productSales = await this.generateProductSalesReport(
      startDate,
      endDate
    );
    const topProducts = productSales.slice(0, limit);

    const labels = topProducts.map((p) => p.productName);
    const data = topProducts.map((p) => p.quantity);

    // Destroy existing chart
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    // Create new chart
    this.charts[canvasId] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Số lượng bán",
            data: data,
            backgroundColor: "#F25912",
            borderColor: "#D54E10",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Generate revenue by status pie chart
  async renderRevenueByStatusChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const stats = await invoiceManager.getStatistics();

    const labels = ["Đã thanh toán", "Chưa thanh toán", "Đã hủy"];
    const data = [stats.paid, stats.unpaid, stats.cancelled];
    const colors = ["#22c55e", "#f59e0b", "#ef4444"];

    // Destroy existing chart
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    // Create new chart
    this.charts[canvasId] = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  // Export report to CSV
  async exportToCSV(reportData, filename) {
    let csv = "";

    if (reportData.length === 0) {
      csv = "Không có dữ liệu";
    } else {
      // Headers
      const headers = Object.keys(reportData[0]);
      csv = headers.join(",") + "\n";

      // Data rows
      reportData.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        });
        csv += values.join(",") + "\n";
      });
    }

    // Download
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Render revenue report table
  renderRevenueReportTable(reportData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = `
            <div class="card mb-4">
                <div class="card-header">
                    <h3 class="card-title">Tổng quan</h3>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-3">
                        <div class="text-center">
                            <div style="font-size: 2rem; font-weight: 700; color: #0ea5e9;">
                                ${formatCurrency(reportData.totalRevenue)}
                            </div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Tổng doanh thu</div>
                        </div>
                        <div class="text-center">
                            <div style="font-size: 2rem; font-weight: 700; color: #22c55e;">
                                ${reportData.totalInvoices}
                            </div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Tổng hóa đơn</div>
                        </div>
                        <div class="text-center">
                            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">
                                ${formatCurrency(reportData.avgInvoiceValue)}
                            </div>
                            <div style="color: #6b7280; margin-top: 0.5rem;">Giá trị TB/HĐ</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Chi tiết hóa đơn</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mã HĐ</th>
                                    <th>Ngày</th>
                                    <th>Khách hàng</th>
                                    <th>Số tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.invoices
                                  .map(
                                    (inv) => `
                                    <tr>
                                        <td><strong>${inv.ID}</strong></td>
                                        <td>${inv.NgayTao}</td>
                                        <td>${inv.TenKH}</td>
                                        <td><strong>${formatCurrency(
                                          inv.ThanhTien
                                        )}</strong></td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

    container.innerHTML = html;
  }

  // Render product sales report table
  renderProductSalesTable(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng bán</th>
                            <th>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products
                          .map(
                            (p, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${p.productId}</strong></td>
                                <td>${p.productName}</td>
                                <td>${p.quantity}</td>
                                <td><strong>${formatCurrency(
                                  p.revenue
                                )}</strong></td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;

    container.innerHTML = html;
  }
}

// Create singleton instance
const reportGenerator = new ReportGenerator();

export default reportGenerator;
