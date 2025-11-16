// ============================================
// SETTINGS COMPONENT
// ============================================

import CONFIG from "../assets/js/config.js";
import googleSheetsAPI from "../assets/js/googleSheetsAPI.js";
import { showToast, storage } from "../assets/js/utils.js";

const settingsComponent = {
  name: "settings",
  title: "Cài Đặt",

  async render() {
    return `
            <div class="settings-page">
                <!-- Tabs -->
                <div class="tabs">
                    <div class="tabs-nav">
                        <button class="tab-item active" data-tab="general">
                            <i class="fas fa-cog"></i> Chung
                        </button>
                        <button class="tab-item" data-tab="google">
                            <i class="fab fa-google"></i> Google Sheets
                        </button>
                        <button class="tab-item" data-tab="email">
                            <i class="fas fa-envelope"></i> Email
                        </button>
                        <button class="tab-item" data-tab="company">
                            <i class="fas fa-building"></i> Công ty
                        </button>
                    </div>
                </div>

                <!-- Tab Contents -->
                <div class="tab-content active" id="general">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Cài đặt chung</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label">Tên ứng dụng</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.APP_NAME
                                }" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phiên bản</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.APP_VERSION
                                }" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Số hóa đơn hiển thị trên trang</label>
                                <input type="number" class="form-control" value="${
                                  CONFIG.ITEMS_PER_PAGE
                                }" min="10" max="100">
                            </div>
                            <div class="form-group">
                                <label class="form-check">
                                    <input type="checkbox" class="form-check-input" id="darkModeCheck">
                                    <span class="form-check-label">Chế độ tối</span>
                                </label>
                            </div>
                            <div class="form-group">
                                <button class="btn btn-primary" onclick="saveGeneralSettings()">
                                    <i class="fas fa-save"></i> Lưu cài đặt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="google">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Kết nối Google Sheets</h3>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>Hướng dẫn:</strong> Truy cập Google Cloud Console để lấy API Key và Client ID
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Google API Key</label>
                                <input type="password" class="form-control" value="${
                                  CONFIG.GOOGLE_API_KEY
                                }">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Google Client ID</label>
                                <input type="password" class="form-control" value="${
                                  CONFIG.GOOGLE_CLIENT_ID
                                }">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Spreadsheet ID</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.SPREADSHEET_ID
                                }">
                                <div class="form-help">
                                    ID của Google Sheet (trong URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/)
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <button class="btn btn-primary" onclick="testGoogleConnection()">
                                    <i class="fas fa-plug"></i> Kiểm tra kết nối
                                </button>
                                <button class="btn btn-outline" onclick="reconnectGoogle()">
                                    <i class="fas fa-sync"></i> Kết nối lại
                                </button>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Trạng thái kết nối:</label>
                                <div>
                                    <span class="badge ${
                                      googleSheetsAPI.isAuthenticated
                                        ? "badge-success"
                                        : "badge-danger"
                                    }">
                                        ${
                                          googleSheetsAPI.isAuthenticated
                                            ? "Đã kết nối"
                                            : "Chưa kết nối"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="email">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Cấu hình Email (EmailJS)</h3>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>Hướng dẫn:</strong> Đăng ký tài khoản tại <a href="https://www.emailjs.com/" target="_blank">EmailJS.com</a> để lấy thông tin cấu hình
                            </div>

                            <div class="form-group">
                                <label class="form-label">Service ID</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.EMAILJS_SERVICE_ID
                                }">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Template ID</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.EMAILJS_TEMPLATE_ID
                                }">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Public Key</label>
                                <input type="password" class="form-control" value="${
                                  CONFIG.EMAILJS_PUBLIC_KEY
                                }">
                            </div>

                            <div class="form-group">
                                <button class="btn btn-primary" onclick="testEmail()">
                                    <i class="fas fa-envelope"></i> Gửi email thử nghiệm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="company">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Thông tin công ty</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label">Tên công ty</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.COMPANY_NAME
                                }">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Địa chỉ</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.COMPANY_ADDRESS
                                }">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Số điện thoại</label>
                                    <input type="tel" class="form-control" value="${
                                      CONFIG.COMPANY_PHONE
                                    }">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" value="${
                                      CONFIG.COMPANY_EMAIL
                                    }">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Mã số thuế</label>
                                <input type="text" class="form-control" value="${
                                  CONFIG.COMPANY_TAX_CODE
                                }">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Thuế VAT (%)</label>
                                <input type="number" class="form-control" value="${
                                  CONFIG.VAT_RATE * 100
                                }" min="0" max="100" step="0.1">
                            </div>

                            <div class="form-group">
                                <button class="btn btn-primary" onclick="saveCompanySettings()">
                                    <i class="fas fa-save"></i> Lưu thông tin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  },

  async init() {
    // Setup tabs
    const tabButtons = document.querySelectorAll(".tab-item");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.dataset.tab;

        // Remove active class from all
        tabButtons.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));

        // Add active class to clicked
        button.classList.add("active");
        document.getElementById(tabId)?.classList.add("active");
      });
    });

    // Load saved settings
    const darkMode = storage.get("darkMode", false);
    const darkModeCheck = document.getElementById("darkModeCheck");
    if (darkModeCheck) {
      darkModeCheck.checked = darkMode;
    }
  },
};

// Global functions
window.saveGeneralSettings = () => {
  const darkModeCheck = document.getElementById("darkModeCheck");
  if (darkModeCheck) {
    storage.set("darkMode", darkModeCheck.checked);
    window.app.darkMode = darkModeCheck.checked;

    if (darkModeCheck.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
  showToast("Đã lưu cài đặt", "success");
};

window.testGoogleConnection = async () => {
  try {
    const data = await googleSheetsAPI.readSheet(
      CONFIG.SHEETS.INVOICES,
      "A1:A1"
    );
    showToast("Kết nối Google Sheets thành công!", "success");
  } catch (error) {
    showToast("Không thể kết nối Google Sheets", "error");
  }
};

window.reconnectGoogle = async () => {
  await googleSheetsAPI.signOut();
  await googleSheetsAPI.signIn();
};

window.testEmail = async () => {
  const result = await Swal.fire({
    title: "Gửi email thử nghiệm",
    input: "email",
    inputPlaceholder: "Nhập địa chỉ email",
    showCancelButton: true,
    confirmButtonText: "Gửi",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed && result.value) {
    showToast("Chức năng gửi email thử nghiệm đang phát triển", "info");
  }
};

window.saveCompanySettings = () => {
  showToast("Đã lưu thông tin công ty", "success");
};

export default settingsComponent;
