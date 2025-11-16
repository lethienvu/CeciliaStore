// ============================================
// EMAIL SENDER - Gửi hóa đơn qua email
// ============================================

import CONFIG from "./config.js";
import invoiceManager from "./invoiceManager.js";
import pdfExporter from "./pdfExporter.js";
import { showToast, showLoading, hideLoading, validateEmail } from "./utils.js";

class EmailSender {
  constructor() {
    this.emailJS = window.emailjs;
    this.isInitialized = false;
  }

  // Initialize EmailJS
  init() {
    if (this.isInitialized) return;

    try {
      this.emailJS.init(CONFIG.EMAILJS_PUBLIC_KEY);
      this.isInitialized = true;
      console.log("EmailJS initialized");
    } catch (error) {
      console.error("Error initializing EmailJS:", error);
    }
  }

  // Send invoice via email
  async sendInvoiceEmail(invoiceId, recipientEmail, includeAttachment = true) {
    if (!validateEmail(recipientEmail)) {
      showToast("Email không hợp lệ", "error");
      return false;
    }

    showLoading("Đang gửi email...");

    try {
      // Get invoice data
      const invoice = await invoiceManager.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error("Không tìm thấy hóa đơn");
      }

      const details = await invoiceManager.getInvoiceDetails(invoiceId);

      // Prepare email template parameters
      const templateParams = {
        to_email: recipientEmail,
        to_name: invoice.TenKH,
        invoice_id: invoice.ID,
        invoice_date: invoice.NgayTao,
        total_amount: invoice.ThanhTien.toLocaleString("vi-VN") + " VND",
        company_name: CONFIG.COMPANY_NAME,
        company_phone: CONFIG.COMPANY_PHONE,
        company_email: CONFIG.COMPANY_EMAIL,
        items_html: this.generateItemsHTML(details),
        subtotal: invoice.TongTien.toLocaleString("vi-VN") + " VND",
        tax: invoice.Thue.toLocaleString("vi-VN") + " VND",
        discount: invoice.ChietKhau.toLocaleString("vi-VN") + " VND",
        status: invoice.TrangThai,
      };

      // Send email using EmailJS
      await this.emailJS.send(
        CONFIG.EMAILJS_SERVICE_ID,
        CONFIG.EMAILJS_TEMPLATE_ID,
        templateParams
      );

      hideLoading();
      showToast(`Email đã được gửi đến ${recipientEmail}`, "success");
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      hideLoading();
      showToast(
        "Không thể gửi email. Vui lòng kiểm tra cấu hình EmailJS.",
        "error"
      );
      return false;
    }
  }

  // Generate HTML for invoice items
  generateItemsHTML(items) {
    return items
      .map(
        (item, index) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  index + 1
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  item.TenSP
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                  item.SoLuong
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${parseFloat(
                  item.DonGia
                ).toLocaleString("vi-VN")} VND</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${parseFloat(
                  item.ThanhTien
                ).toLocaleString("vi-VN")} VND</td>
            </tr>
        `
      )
      .join("");
  }

  // Show email dialog
  async showEmailDialog(invoiceId) {
    const invoice = await invoiceManager.getInvoiceById(invoiceId);
    if (!invoice) {
      showToast("Không tìm thấy hóa đơn", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Gửi hóa đơn qua email",
      html: `
                <div style="text-align: left;">
                    <p><strong>Hóa đơn:</strong> ${invoice.ID}</p>
                    <p><strong>Khách hàng:</strong> ${invoice.TenKH}</p>
                    <hr>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                        Email người nhận:
                    </label>
                    <input type="email" id="recipientEmail" class="swal2-input" 
                           placeholder="example@email.com" 
                           value="${invoice.Email || ""}" 
                           style="width: 100%; margin: 0;">
                    <div style="margin-top: 16px;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="includeAttachment" checked>
                            <span>Đính kèm file PDF</span>
                        </label>
                    </div>
                </div>
            `,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-paper-plane"></i> Gửi',
      cancelButtonText: "Hủy",
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const email = document.getElementById("recipientEmail").value;
        const includeAttachment =
          document.getElementById("includeAttachment").checked;

        if (!email) {
          Swal.showValidationMessage("Vui lòng nhập email");
          return false;
        }

        if (!validateEmail(email)) {
          Swal.showValidationMessage("Email không hợp lệ");
          return false;
        }

        return { email, includeAttachment };
      },
    });

    if (result.isConfirmed) {
      await this.sendInvoiceEmail(
        invoiceId,
        result.value.email,
        result.value.includeAttachment
      );
    }
  }

  // Send bulk emails
  async sendBulkEmails(invoices, emailList) {
    showLoading("Đang gửi email hàng loạt...");

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < invoices.length; i++) {
      try {
        const invoice = invoices[i];
        const email = emailList[i];

        if (!validateEmail(email)) {
          failCount++;
          continue;
        }

        await this.sendInvoiceEmail(invoice.ID, email, false);
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        failCount++;
        console.error("Error sending bulk email:", error);
      }
    }

    hideLoading();
    showToast(
      `Đã gửi ${successCount} email thành công, ${failCount} email thất bại`,
      successCount > 0 ? "success" : "error"
    );
  }

  // Send test email
  async sendTestEmail(email) {
    if (!validateEmail(email)) {
      showToast("Email không hợp lệ", "error");
      return false;
    }

    showLoading("Đang gửi email thử nghiệm...");

    try {
      const templateParams = {
        to_email: email,
        to_name: "Người dùng",
        company_name: CONFIG.COMPANY_NAME,
        message: "Đây là email thử nghiệm từ hệ thống quản lý hóa đơn.",
      };

      await this.emailJS.send(
        CONFIG.EMAILJS_SERVICE_ID,
        "test_template", // Use a separate test template
        templateParams
      );

      hideLoading();
      showToast("Email thử nghiệm đã được gửi", "success");
      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      hideLoading();
      showToast("Không thể gửi email thử nghiệm", "error");
      return false;
    }
  }
}

// Create singleton instance
const emailSender = new EmailSender();

export default emailSender;
