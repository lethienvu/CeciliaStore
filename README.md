# 💜 Cecilia Manager - Hệ Thống Quản Lý Hóa Đơn

Hệ thống quản lý hóa đơn Cecilia - Siêu thị Dược Mỹ Phẩm hiện đại - Single Page Application (SPA) với Google Sheets làm cơ sở dữ liệu.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Tính năng chính

### 📋 Quản lý hóa đơn

- ✅ Tạo, sửa, xóa hóa đơn
- ✅ Tìm kiếm và lọc theo ngày, khách hàng, trạng thái
- ✅ Tự động tính tổng tiền, thuế VAT, chiết khấu
- ✅ In hóa đơn với template chuyên nghiệp
- ✅ Xuất PDF hóa đơn
- ✅ Gửi hóa đơn qua email
- ✅ Quản lý trạng thái: Đã thanh toán/Chưa thanh toán/Hủy

### 🛒 Quản lý sản phẩm

- ✅ Thêm, sửa, xóa sản phẩm
- ✅ Tìm kiếm sản phẩm
- ✅ Theo dõi tồn kho
- ✅ Cảnh báo sản phẩm sắp hết hàng

### 📊 Báo cáo & Thống kê

- ✅ Dashboard tổng quan
- ✅ Biểu đồ doanh thu theo thời gian
- ✅ Top sản phẩm bán chạy
- ✅ Báo cáo chi tiết theo khoảng thời gian
- ✅ Xuất báo cáo Excel/CSV

### 🎨 Giao diện

- ✅ Modern & Clean UI
- ✅ Responsive design (Mobile-first)
- ✅ Dark mode
- ✅ Smooth animations
- ✅ Toast notifications

## 🛠 Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **UI Framework**: Custom CSS với Design System
- **Charts**: Chart.js
- **PDF Export**: jsPDF
- **Email**: EmailJS
- **Database**: Google Sheets API v4
- **Icons**: Font Awesome 6

## 📁 Cấu trúc dự án

```
pharmacy-invoice-manager/
├── index.html                 # File HTML chính
├── assets/
│   ├── css/
│   │   ├── main.css          # Styles chính
│   │   ├── components.css    # Component styles
│   │   └── print.css         # Print styles
│   ├── js/
│   │   ├── app.js            # Entry point
│   │   ├── router.js         # SPA routing
│   │   ├── config.js         # Configuration
│   │   ├── utils.js          # Utility functions
│   │   ├── googleSheetsAPI.js    # Google Sheets integration
│   │   ├── invoiceManager.js     # Invoice management
│   │   ├── productManager.js     # Product management
│   │   ├── reportGenerator.js    # Reports & charts
│   │   ├── pdfExporter.js        # PDF export
│   │   └── emailSender.js        # Email functionality
│   └── img/                  # Images & logo
├── components/
│   ├── dashboard.js          # Dashboard component
│   ├── invoices.js           # Invoices page
│   ├── products.js           # Products page
│   ├── reports.js            # Reports page
│   └── settings.js           # Settings page
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Google Sheets API**:
   - Vào **APIs & Services** > **Library**
   - Tìm "Google Sheets API"
   - Click **Enable**

### Bước 2: Tạo Credentials

#### API Key

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. (Khuyến nghị) Restrict API key:
   - Application restrictions: HTTP referrers
   - API restrictions: Google Sheets API
4. Copy API Key: AIzaSyD43-TMzUcd7_gSJ5HyKCu-nXR2np4LWys

#### OAuth 2.0 Client ID

1. Click **Create Credentials** > **OAuth client ID**
2. Chọn **Web application**
3. Thêm Authorized JavaScript origins:
   - `http://localhost:8000` (cho development)
   - Domain của bạn (cho production)
4. Copy Client ID

### Bước 3: Tạo Google Sheet

1. Tạo Google Sheet mới
2. Tạo các sheets với cấu trúc sau:

#### Sheet "Invoices"

| ID  | NgayTao | MaKH | TenKH | SDT | Email | TongTien | Thue | ChietKhau | ThanhTien | TrangThai | GhiChu |
| --- | ------- | ---- | ----- | --- | ----- | -------- | ---- | --------- | --------- | --------- | ------ |

#### Sheet "InvoiceDetails"

| InvoiceID | MaSP | TenSP | SoLuong | DonGia | ThanhTien |
| --------- | ---- | ----- | ------- | ------ | --------- |

#### Sheet "Products"

| MaSP | TenSP | DonVi | GiaBan | XuatXu | HanSD | TonKho | MoTa |
| ---- | ----- | ----- | ------ | ------ | ----- | ------ | ---- |

3. Chia sẻ Sheet với quyền "Anyone with the link can edit"
4. Copy Spreadsheet ID từ URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### Bước 4: Cấu hình EmailJS (Optional)

1. Đăng ký tài khoản tại [EmailJS.com](https://www.emailjs.com/)
2. Tạo Email Service (Gmail, Outlook, etc.)
3. Tạo Email Template với các biến:
   - `{{to_email}}`
   - `{{to_name}}`
   - `{{invoice_id}}`
   - `{{total_amount}}`
   - `{{items_html}}`
4. Copy Service ID, Template ID, và Public Key

### Bước 5: Cấu hình ứng dụng

Mở file `assets/js/config.js` và cập nhật:

```javascript
export const CONFIG = {
  // Google API Configuration
  GOOGLE_API_KEY: "YOUR_GOOGLE_API_KEY",
  GOOGLE_CLIENT_ID: "YOUR_CLIENT_ID.apps.googleusercontent.com",
  SPREADSHEET_ID: "YOUR_SPREADSHEET_ID",

  // EmailJS Configuration
  EMAILJS_SERVICE_ID: "YOUR_SERVICE_ID",
  EMAILJS_TEMPLATE_ID: "YOUR_TEMPLATE_ID",
  EMAILJS_PUBLIC_KEY: "YOUR_PUBLIC_KEY",

  // Company Info
  COMPANY_NAME: "Cửa Hàng Dược Mỹ Phẩm của bạn",
  COMPANY_ADDRESS: "Địa chỉ của bạn",
  COMPANY_PHONE: "0123 456 789",
  COMPANY_EMAIL: "contact@yourstore.com",
  COMPANY_TAX_CODE: "0123456789",

  // Other settings...
};
```

### Bước 6: Chạy ứng dụng

#### Development (Local)

```bash
# Sử dụng Python HTTP Server
python3 -m http.server 8000

# Hoặc sử dụng Node.js http-server
npx http-server -p 8000

# Truy cập: http://localhost:8000
```

#### Production

1. Upload toàn bộ files lên web hosting
2. Đảm bảo HTTPS được enable
3. Cập nhật Authorized JavaScript origins trong Google Cloud Console

## 📖 Hướng dẫn sử dụng

### Đăng nhập Google

- Lần đầu truy cập, bạn sẽ được yêu cầu đăng nhập Google
- Cấp quyền truy cập Google Sheets cho ứng dụng

### Tạo hóa đơn mới

1. Vào **Hóa Đơn** > Click **Tạo hóa đơn mới**
2. Nhập thông tin khách hàng
3. Thêm sản phẩm vào hóa đơn
4. Hệ thống tự động tính tổng tiền, thuế VAT
5. Click **Lưu** để tạo hóa đơn

### Quản lý sản phẩm

1. Vào **Sản Phẩm** > Click **Thêm sản phẩm mới**
2. Nhập thông tin sản phẩm
3. Click **Lưu**

### Xem báo cáo

1. Vào **Báo Cáo**
2. Chọn khoảng thời gian
3. Click **Tạo báo cáo**
4. Xuất Excel/PDF nếu cần

### In & Gửi hóa đơn

- **In**: Click icon printer trên danh sách hóa đơn
- **Gửi Email**: Click icon email, nhập địa chỉ người nhận
- **Xuất PDF**: Tự động tạo PDF khi in hoặc gửi email

## 🎨 Tùy chỉnh

### Thay đổi màu sắc chủ đạo

Sửa file `assets/css/main.css`:

```css
:root {
  --primary-500: #0ea5e9; /* Màu chính */
  --success-500: #22c55e; /* Màu thành công */
  --warning-500: #f59e0b; /* Màu cảnh báo */
  --error-500: #ef4444; /* Màu lỗi */
}
```

### Thêm logo công ty

1. Đặt file logo vào `assets/img/logo.png`
2. Sửa CSS trong `.logo` class

### Tùy chỉnh template hóa đơn

Sửa file `assets/js/pdfExporter.js` trong function `exportInvoicePDF()`

## 🔧 Xử lý lỗi thường gặp

### Lỗi "Sign-in failed"

- Kiểm tra lại Client ID
- Đảm bảo domain được thêm vào Authorized JavaScript origins
- Xóa cache browser và thử lại

### Lỗi "Unable to read spreadsheet"

- Kiểm tra Spreadsheet ID
- Đảm bảo Sheet được chia sẻ công khai
- Kiểm tra tên các sheets (Invoices, InvoiceDetails, Products)

### Email không gửi được

- Kiểm tra cấu hình EmailJS
- Verify email template có đúng biến không
- Kiểm tra console log để xem lỗi chi tiết

## 📱 Tương thích trình duyệt

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Bảo mật

- ✅ Google OAuth 2.0 authentication
- ✅ API Key restrictions
- ✅ Input validation & sanitization
- ✅ XSS protection
- ⚠️ **Lưu ý**: Đây là ứng dụng client-side, không nên lưu thông tin nhạy cảm trong Google Sheets

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:

1. Fork repo
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Tác giả

**HPSF Development Team**

- Website: [hpsf.com](https://hpsf.com)
- Email: dev@hpsf.com

## 🙏 Cảm ơn

- [Google Sheets API](https://developers.google.com/sheets/api)
- [Chart.js](https://www.chartjs.org/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [EmailJS](https://www.emailjs.com/)
- [Font Awesome](https://fontawesome.com/)
- [SweetAlert2](https://sweetalert2.github.io/)

---

**Made with ❤️ for Vietnamese Pharmacy Businesses**
