// ============================================
// REPORTS COMPONENT
// ============================================

import reportGenerator from "../assets/js/reportGenerator.js";
import { formatDate, showToast } from "../assets/js/utils.js";

const reportsComponent = {
  name: "reports",
  title: "Báo Cáo & Thống Kê",

  async render() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return `
            <div class="reports-page">
                <!-- Date Range Filter -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Từ ngày</label>
                                <input type="date" 
                                       id="startDate" 
                                       class="form-control"
                                       value="${formatDate(
                                         startOfMonth,
                                         "yyyy-MM-dd"
                                       )}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Đến ngày</label>
                                <input type="date" 
                                       id="endDate" 
                                       class="form-control"
                                       value="${formatDate(
                                         today,
                                         "yyyy-MM-dd"
                                       )}">
                            </div>
                            <div class="form-group" style="display: flex; align-items: flex-end;">
                                <button class="btn btn-primary" onclick="generateReport()">
                                    <i class="fas fa-chart-bar"></i> Tạo báo cáo
                                </button>
                                <button class="btn btn-outline" onclick="exportReportCSV()" style="margin-left: 0.5rem;">
                                    <i class="fas fa-file-excel"></i> Xuất Excel
                                </button>
                                <button class="btn btn-outline" onclick="exportReportPDF()" style="margin-left: 0.5rem;">
                                    <i class="fas fa-file-pdf"></i> Xuất PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid grid-cols-3 mb-4">
                    <div class="card" style="grid-column: span 2;">
                        <div class="card-header">
                            <h3 class="card-title">Biểu đồ doanh thu</h3>
                        </div>
                        <div class="card-body" style="height: 350px;">
                            <canvas id="reportRevenueChart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Phân bố trạng thái</h3>
                        </div>
                        <div class="card-body" style="height: 350px;">
                            <canvas id="reportStatusChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Report Content -->
                <div id="reportContent"></div>
            </div>
        `;
  },

  async init() {
    // Generate default report
    await this.generateReport();
  },

  async generateReport() {
    const startDateEl = document.getElementById("startDate");
    const endDateEl = document.getElementById("endDate");

    if (!startDateEl || !endDateEl) return;

    const startDate = new Date(startDateEl.value);
    const endDate = new Date(endDateEl.value);

    // Generate revenue report
    const reportData = await reportGenerator.generateRevenueReport(
      startDate,
      endDate
    );

    // Render charts
    await reportGenerator.renderDailyRevenueChart("reportRevenueChart", 30);
    await reportGenerator.renderRevenueByStatusChart("reportStatusChart");

    // Render report table
    reportGenerator.renderRevenueReportTable(reportData, "reportContent");

    showToast("Báo cáo đã được tạo", "success");
  },
};

// Global functions
window.generateReport = async () => {
  await reportsComponent.generateReport();
};

window.exportReportCSV = async () => {
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);

  const reportData = await reportGenerator.generateRevenueReport(
    startDate,
    endDate
  );
  await reportGenerator.exportToCSV(
    reportData.invoices,
    `BaoCao_${formatDate(new Date(), "yyyyMMdd")}.csv`
  );
};

window.exportReportPDF = async () => {
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);

  const reportData = await reportGenerator.generateRevenueReport(
    startDate,
    endDate
  );
  showToast("Chức năng xuất PDF đang phát triển", "info");
};

export default reportsComponent;
