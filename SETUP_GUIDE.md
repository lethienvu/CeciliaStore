# 📘 HƯỚNG DẪN SETUP CHI TIẾT

## Mục lục

1. [Chuẩn bị](#chuẩn-bị)
2. [Setup Google Cloud Project](#setup-google-cloud-project)
3. [Setup Google Sheets](#setup-google-sheets)
4. [Setup EmailJS](#setup-emailjs)
5. [Cấu hình ứng dụng](#cấu-hình-ứng-dụng)
6. [Testing](#testing)
7. [Deploy Production](#deploy-production)

---

## Chuẩn bị

### Yêu cầu

- Tài khoản Google
- Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code khuyến nghị)
- Web server (Python, Node.js, hoặc hosting)

### Tải source code

```bash
git clone https://github.com/your-repo/pharmacy-invoice-manager.git
cd pharmacy-invoice-manager
```

---

## Setup Google Cloud Project

### Bước 1: Tạo Project

1. Truy cập https://console.cloud.google.com/
2. Click **Select a project** ở thanh menu trên
3. Click **NEW PROJECT**
4. Nhập:
   - Project name: `HPSF Invoice Manager`
   - Location: Organization (nếu có)
5. Click **CREATE**

### Bước 2: Enable Google Sheets API

1. Trong project vừa tạo, vào menu bên trái
2. Chọn **APIs & Services** > **Library**
3. Tìm kiếm "Google Sheets API"
4. Click vào **Google Sheets API**
5. Click **ENABLE**

### Bước 3: Tạo API Key

1. Vào **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Chọn **API key**
4. Copy API key được tạo ra
5. Click **RESTRICT KEY** để bảo mật:

   **Application restrictions:**

   - Chọn **HTTP referrers (web sites)**
   - Thêm URLs:
     ```
     http://localhost:8000/*
     https://yourdomain.com/*
     ```

   **API restrictions:**

   - Chọn **Restrict key**
   - Tick chọn **Google Sheets API**

6. Click **SAVE**

### Bước 4: Tạo OAuth 2.0 Client ID

1. Vào **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Chọn **OAuth client ID**
4. Nếu chưa configure OAuth consent screen:

   - Click **CONFIGURE CONSENT SCREEN**
   - Chọn **External** > **CREATE**
   - Điền thông tin:
     - App name: `HPSF Invoice Manager`
     - User support email: your-email@gmail.com
     - Developer contact: your-email@gmail.com
   - Click **SAVE AND CONTINUE**
   - Scopes: Bỏ qua, click **SAVE AND CONTINUE**
   - Test users: Thêm email của bạn
   - Click **SAVE AND CONTINUE**

5. Quay lại tạo OAuth client ID:

   - Application type: **Web application**
   - Name: `HPSF Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:8000
     https://yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:8000
     https://yourdomain.com
     ```
   - Click **CREATE**

6. Copy **Client ID** (dạng: xxx.apps.googleusercontent.com)

---

## Setup Google Sheets

### Bước 1: Tạo Spreadsheet

1. Truy cập https://sheets.google.com
2. Click **Blank** để tạo sheet mới
3. Đặt tên: `HPSF Invoices Database`

### Bước 2: Tạo Sheet "Invoices"

1. Đổi tên sheet đầu tiên thành `Invoices`
2. Thêm header vào row 1:

| A   | B       | C    | D     | E   | F     | G        | H    | I         | J         | K         | L      |
| --- | ------- | ---- | ----- | --- | ----- | -------- | ---- | --------- | --------- | --------- | ------ |
| ID  | NgayTao | MaKH | TenKH | SDT | Email | TongTien | Thue | ChietKhau | ThanhTien | TrangThai | GhiChu |

3. Format:
   - Row 1: Bold, Background color: Blue, Text color: White
   - Columns G-J: Number format (Ctrl+Shift+1)

### Bước 3: Tạo Sheet "InvoiceDetails"

1. Click **+** ở góc dưới bên trái
2. Đổi tên thành `InvoiceDetails`
3. Thêm header:

| A         | B    | C     | D       | E      | F         |
| --------- | ---- | ----- | ------- | ------ | --------- |
| InvoiceID | MaSP | TenSP | SoLuong | DonGia | ThanhTien |

4. Format tương tự Sheet "Invoices"

### Bước 4: Tạo Sheet "Products"

1. Tạo sheet mới, đặt tên `Products`
2. Thêm header:

| A    | B     | C     | D      | E      | F     | G      | H    |
| ---- | ----- | ----- | ------ | ------ | ----- | ------ | ---- |
| MaSP | TenSP | DonVi | GiaBan | XuatXu | HanSD | TonKho | MoTa |

3. Thêm dữ liệu mẫu:

| MaSP  | TenSP             | DonVi | GiaBan | XuatXu   | HanSD      | TonKho | MoTa                        |
| ----- | ----------------- | ----- | ------ | -------- | ---------- | ------ | --------------------------- |
| SP001 | Vitamin C 1000mg  | Hộp   | 150000 | USA      | 2025-12-31 | 100    | Viên uống bổ sung vitamin C |
| SP002 | Paracetamol 500mg | Vỉ    | 5000   | Việt Nam | 2024-06-30 | 500    | Thuốc hạ sốt, giảm đau      |
| SP003 | Kem dưỡng da Olay | Chai  | 250000 | USA      | 2024-12-31 | 50     | Kem dưỡng ẩm chống lão hóa  |

### Bước 5: Share Spreadsheet

1. Click **Share** ở góc trên bên phải
2. Dưới "General access":
   - Chọn **Anyone with the link**
   - Chọn **Editor**
3. Click **Copy link**
4. Lấy Spreadsheet ID từ URL:
   ```
   https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2/edit
                                            ↑ Đây là Spreadsheet ID ↑
   ```

---

## Setup EmailJS

### Bước 1: Đăng ký tài khoản

1. Truy cập https://www.emailjs.com/
2. Click **Sign Up**
3. Đăng ký bằng Google hoặc Email

### Bước 2: Tạo Email Service

1. Vào **Email Services**
2. Click **Add New Service**
3. Chọn email provider (Gmail khuyến nghị)
4. Nhập:
   - Service Name: `HPSF Email Service`
   - Email: Gmail của bạn
5. Click **Connect Account**
6. Authorize EmailJS truy cập Gmail
7. Copy **Service ID**

### Bước 3: Tạo Email Template

1. Vào **Email Templates**
2. Click **Create New Template**
3. Nhập template:

**Subject:**

```
Hóa đơn {{invoice_id}} từ {{company_name}}
```

**Content:**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #0ea5e9;">Hóa đơn bán hàng</h2>

  <p>Kính gửi: <strong>{{to_name}}</strong></p>

  <p>Cảm ơn quý khách đã mua hàng tại {{company_name}}.</p>

  <div
    style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;"
  >
    <p><strong>Mã hóa đơn:</strong> {{invoice_id}}</p>
    <p><strong>Ngày:</strong> {{invoice_date}}</p>
    <p><strong>Tổng tiền:</strong> {{total_amount}}</p>
    <p><strong>Trạng thái:</strong> {{status}}</p>
  </div>

  <h3>Chi tiết sản phẩm:</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #0ea5e9; color: white;">
        <th style="padding: 8px; border: 1px solid #ddd;">STT</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Sản phẩm</th>
        <th style="padding: 8px; border: 1px solid #ddd;">SL</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Đơn giá</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      {{{items_html}}}
    </tbody>
  </table>

  <div style="margin-top: 20px; text-align: right;">
    <p><strong>Tổng tiền hàng:</strong> {{subtotal}}</p>
    <p><strong>Thuế VAT:</strong> {{tax}}</p>
    <p><strong>Chiết khấu:</strong> {{discount}}</p>
    <p style="font-size: 18px; color: #0ea5e9;">
      <strong>TỔNG CỘNG: {{total_amount}}</strong>
    </p>
  </div>

  <hr />

  <p style="color: #6b7280; font-size: 14px;">
    Liên hệ: {{company_phone}} | {{company_email}}<br />
    Trân trọng cảm ơn!
  </p>
</div>
```

4. Click **Save**
5. Copy **Template ID**

### Bước 4: Lấy Public Key

1. Vào **Account** > **General**
2. Copy **Public Key**

---

## Cấu hình ứng dụng

### Bước 1: Mở file config.js

Mở file `assets/js/config.js` trong code editor

### Bước 2: Cập nhật thông tin

```javascript
export const CONFIG = {
  // Google API Configuration
  GOOGLE_API_KEY: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX", // Thay bằng API Key của bạn
  GOOGLE_CLIENT_ID:
    "123456789012-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com", // Thay bằng Client ID
  SPREADSHEET_ID: "1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2", // Thay bằng Spreadsheet ID

  // EmailJS Configuration
  EMAILJS_SERVICE_ID: "service_xxxxxxx", // Thay bằng Service ID
  EMAILJS_TEMPLATE_ID: "template_xxxxxxx", // Thay bằng Template ID
  EMAILJS_PUBLIC_KEY: "xxxxxxxxxxxxxx", // Thay bằng Public Key

  // Company Info - Tùy chỉnh thông tin công ty của bạn
  COMPANY_NAME: "Cửa Hàng Dược Mỹ Phẩm HPSF",
  COMPANY_ADDRESS: "123 Đường ABC, Quận XYZ, TP.HCM",
  COMPANY_PHONE: "0123 456 789",
  COMPANY_EMAIL: "contact@hpsf.com",
  COMPANY_TAX_CODE: "0123456789",

  // Các cài đặt khác giữ nguyên...
};
```

### Bước 3: Lưu file

Nhấn Ctrl+S (Windows) hoặc Cmd+S (Mac)

---

## Testing

### Bước 1: Chạy local server

**Với Python:**

```bash
cd pharmacy-invoice-manager
python3 -m http.server 8000
```

**Với Node.js:**

```bash
npx http-server -p 8000
```

### Bước 2: Mở trình duyệt

Truy cập: http://localhost:8000

### Bước 3: Đăng nhập Google

1. Click **Đăng nhập Google** khi được yêu cầu
2. Chọn tài khoản Google
3. Cấp quyền truy cập Google Sheets

### Bước 4: Kiểm tra chức năng

**Dashboard:**

- ✅ Hiển thị stats cards
- ✅ Biểu đồ doanh thu
- ✅ Top sản phẩm

**Sản phẩm:**

- ✅ Hiển thị danh sách sản phẩm mẫu
- ✅ Tìm kiếm hoạt động
- ✅ Cảnh báo tồn kho thấp

**Hóa đơn:**

- ✅ Tạo hóa đơn test
- ✅ Xuất PDF
- ✅ Gửi email

**Báo cáo:**

- ✅ Hiển thị biểu đồ
- ✅ Xuất CSV

---

## Deploy Production

### Option 1: GitHub Pages

1. Push code lên GitHub
2. Vào Settings > Pages
3. Source: main branch
4. Save
5. Cập nhật Authorized JavaScript origins với URL mới

### Option 2: Netlify

1. Kéo thả folder vào https://app.netlify.com/drop
2. Hoặc connect GitHub repo
3. Deploy
4. Cập nhật Authorized JavaScript origins

### Option 3: Vercel

```bash
npm i -g vercel
vercel
```

### Sau khi deploy

1. Lấy URL production (vd: https://your-app.netlify.app)
2. Vào Google Cloud Console
3. Cập nhật Authorized JavaScript origins:
   - Thêm: `https://your-app.netlify.app`
4. Cập nhật config.js nếu cần

---

## Troubleshooting

### Lỗi CORS / "origin not allowed"

**Nguyên nhân:** Domain chưa được thêm vào Authorized JavaScript origins

**Giải pháp:**

1. Vào Google Cloud Console
2. APIs & Services > Credentials
3. Sửa OAuth 2.0 Client
4. Thêm domain vào Authorized JavaScript origins

### Lỗi "Sign-in failed"

**Nguyên nhân:** Client ID sai hoặc consent screen chưa được configure

**Giải pháp:**

1. Kiểm tra lại Client ID trong config.js
2. Xóa cache browser (Ctrl+Shift+Del)
3. Thử lại

### Không đọc được Google Sheets

**Nguyên nhân:** Spreadsheet ID sai hoặc chưa share

**Giải pháp:**

1. Kiểm tra Spreadsheet ID
2. Đảm bảo sheet được share: "Anyone with the link can edit"
3. Kiểm tra tên các sheets chính xác: Invoices, InvoiceDetails, Products

### Email không gửi

**Nguyên nhân:** EmailJS chưa được cấu hình đúng

**Giải pháp:**

1. Kiểm tra Service ID, Template ID, Public Key
2. Test email template trên EmailJS dashboard
3. Kiểm tra console log để xem lỗi chi tiết

---

## Hỗ trợ

Nếu gặp vấn đề, liên hệ:

- Email: dev@hpsf.com
- GitHub Issues: [Link to issues]

**Chúc bạn setup thành công! 🎉**
