// ============================================
// CONFIG.JS - Application Configuration
// ============================================

export const CONFIG = {
  // Google API Configuration
  GOOGLE_API_KEY: "AIzaSyD43-TMzUcd7_gSJ5HyKCu-nXR2np4LWys", // Thay bằng API key thực tế
  GOOGLE_CLIENT_ID: "YOUR_CLIENT_ID.apps.googleusercontent.com", // Thay bằng Client ID thực tế
  GOOGLE_DISCOVERY_DOCS: [
    "https://sheets.googleapis.com/$discovery/rest?version=v4",
  ],
  GOOGLE_SCOPES: "https://www.googleapis.com/auth/spreadsheets",

  // Google Sheets Configuration
  SPREADSHEET_ID: "1x8RPrhWVujhxEAxXaJzT8j0AvfAh1mChrrgaq7RBnMA", // Thay bằng ID của Google Sheet
  SHEETS: {
    INVOICES: "Invoices",
    INVOICE_DETAILS: "InvoiceDetails",
    PRODUCTS: "Products",
    SETTINGS: "Settings",
  },

  // Application Settings
  APP_NAME: "Cecilia Manager",
  APP_VERSION: "1.0.0",
  COMPANY_NAME: "Cecilia - Siêu thị Dược Mỹ Phẩm",
  COMPANY_ADDRESS: "123 Đường ABC, Quận XYZ, TP.HCM",
  COMPANY_PHONE: "0123 456 789",
  COMPANY_EMAIL: "contact@cecilia.vn",
  COMPANY_TAX_CODE: "0123456789", // Invoice Settings
  INVOICE_PREFIX: "HD",
  VAT_RATE: 0.1, // 10%
  DEFAULT_CURRENCY: "VND",

  // Pagination
  ITEMS_PER_PAGE: 20,

  // Date Format
  DATE_FORMAT: "dd/MM/yyyy",
  DATETIME_FORMAT: "dd/MM/yyyy HH:mm",

  // Email Settings (EmailJS)
  EMAILJS_SERVICE_ID: "YOUR_SERVICE_ID",
  EMAILJS_TEMPLATE_ID: "YOUR_TEMPLATE_ID",
  EMAILJS_PUBLIC_KEY: "YOUR_PUBLIC_KEY",

  // Cache Settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // Validation Rules
  VALIDATION: {
    MAX_PRODUCT_NAME_LENGTH: 200,
    MAX_CUSTOMER_NAME_LENGTH: 100,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 10000,
    MIN_PRICE: 0,
    MAX_PRICE: 999999999,
  },
};

// Invoice Status
export const INVOICE_STATUS = {
  PAID: "Đã thanh toán",
  UNPAID: "Chưa thanh toán",
  CANCELLED: "Đã hủy",
};

// Invoice Status Colors
export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUS.PAID]: "success",
  [INVOICE_STATUS.UNPAID]: "warning",
  [INVOICE_STATUS.CANCELLED]: "danger",
};

// Export as default
export default CONFIG;
