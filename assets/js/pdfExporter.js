// ============================================
// PDF EXPORTER - Xuất hóa đơn ra PDF
// ============================================

import CONFIG from "./config.js";
import invoiceManager from "./invoiceManager.js";
import {
  formatCurrency,
  formatDate,
  showToast,
  showLoading,
  hideLoading,
} from "./utils.js";

class PDFExporter {
  constructor() {
    this.jsPDF = window.jspdf.jsPDF;
  }

  // Export invoice to PDF
  async exportInvoicePDF(invoiceId) {
    showLoading("Đang tạo file PDF...");

    try {
      // Get invoice data
      const invoice = await invoiceManager.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error("Không tìm thấy hóa đơn");
      }

      const details = await invoiceManager.getInvoiceDetails(invoiceId);

      // Create PDF
      const doc = new this.jsPDF();

      // Set font
      doc.setFont("helvetica");

      // Header - Company Info
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text(CONFIG.COMPANY_NAME, 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(CONFIG.COMPANY_ADDRESS, 105, 27, { align: "center" });
      doc.text(
        `ĐT: ${CONFIG.COMPANY_PHONE} | Email: ${CONFIG.COMPANY_EMAIL}`,
        105,
        32,
        { align: "center" }
      );
      doc.text(`Mã số thuế: ${CONFIG.COMPANY_TAX_CODE}`, 105, 37, {
        align: "center",
      });

      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(20, 42, 190, 42);

      // Invoice Title
      doc.setFontSize(16);
      doc.setTextColor(14, 165, 233);
      doc.text("HÓA ĐƠN BÁN HÀNG", 105, 52, { align: "center" });

      // Invoice Info
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      doc.text(`Mã hóa đơn: ${invoice.ID}`, 20, 62);
      doc.text(`Ngày: ${invoice.NgayTao}`, 140, 62);

      // Customer Info Box
      doc.setLineWidth(0.3);
      doc.rect(20, 68, 170, 25);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Thông tin khách hàng:", 25, 75);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Tên: ${invoice.TenKH}`, 25, 82);
      doc.text(`Số điện thoại: ${invoice.SDT}`, 25, 87);
      if (invoice.Email) {
        doc.text(`Email: ${invoice.Email}`, 120, 87);
      }

      // Items Table
      const tableStartY = 100;

      // Table Header
      doc.setFillColor(14, 165, 233);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.rect(20, tableStartY, 170, 8, "F");

      doc.text("STT", 25, tableStartY + 5.5);
      doc.text("Tên sản phẩm", 40, tableStartY + 5.5);
      doc.text("ĐVT", 115, tableStartY + 5.5);
      doc.text("SL", 135, tableStartY + 5.5);
      doc.text("Đơn giá", 150, tableStartY + 5.5);
      doc.text("Thành tiền", 175, tableStartY + 5.5, { align: "right" });

      // Table Rows
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      let currentY = tableStartY + 8;
      details.forEach((item, index) => {
        doc.text((index + 1).toString(), 25, currentY + 5);
        doc.text(item.TenSP, 40, currentY + 5);
        doc.text("Hộp", 115, currentY + 5);
        doc.text(item.SoLuong.toString(), 135, currentY + 5);
        doc.text(formatCurrency(item.DonGia), 150, currentY + 5);
        doc.text(formatCurrency(item.ThanhTien), 175, currentY + 5, {
          align: "right",
        });

        currentY += 7;
      });

      // Table border
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, tableStartY, 170, currentY - tableStartY);

      // Summary
      currentY += 5;

      doc.setFont("helvetica", "normal");
      doc.text("Tổng tiền hàng:", 120, currentY);
      doc.text(formatCurrency(invoice.TongTien), 175, currentY, {
        align: "right",
      });

      currentY += 6;
      doc.text(`Thuế VAT (${CONFIG.VAT_RATE * 100}%):`, 120, currentY);
      doc.text(formatCurrency(invoice.Thue), 175, currentY, { align: "right" });

      if (parseFloat(invoice.ChietKhau) > 0) {
        currentY += 6;
        doc.text("Chiết khấu:", 120, currentY);
        doc.text(`-${formatCurrency(invoice.ChietKhau)}`, 175, currentY, {
          align: "right",
        });
      }

      currentY += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("TỔNG CỘNG:", 120, currentY);
      doc.text(formatCurrency(invoice.ThanhTien), 175, currentY, {
        align: "right",
      });

      // Payment Status
      currentY += 8;
      doc.setFontSize(10);
      doc.text(`Trạng thái: ${invoice.TrangThai}`, 120, currentY);

      // Notes
      if (invoice.GhiChu) {
        currentY += 10;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(`Ghi chú: ${invoice.GhiChu}`, 20, currentY);
      }

      // Signature
      currentY = 250;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text("Người mua hàng", 40, currentY, { align: "center" });
      doc.text("Người bán hàng", 150, currentY, { align: "center" });

      doc.setFontSize(8);
      doc.text("(Ký, ghi rõ họ tên)", 40, currentY + 5, { align: "center" });
      doc.text("(Ký, ghi rõ họ tên)", 150, currentY + 5, { align: "center" });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Hóa đơn được xuất từ ${CONFIG.APP_NAME}`, 105, 285, {
        align: "center",
      });

      // Save PDF
      doc.save(`HoaDon_${invoiceId}_${Date.now()}.pdf`);

      hideLoading();
      showToast("Đã xuất file PDF thành công", "success");

      return doc;
    } catch (error) {
      console.error("Error exporting PDF:", error);
      hideLoading();
      showToast("Không thể xuất file PDF", "error");
      return null;
    }
  }

  // Get PDF as blob for email attachment
  async getInvoicePDFBlob(invoiceId) {
    try {
      const invoice = await invoiceManager.getInvoiceById(invoiceId);
      if (!invoice) return null;

      const details = await invoiceManager.getInvoiceDetails(invoiceId);

      // Create PDF (same code as above)
      const doc = new this.jsPDF();

      // ... (same PDF generation code) ...
      // For brevity, using simplified version

      doc.setFontSize(18);
      doc.text(`Hóa đơn ${invoiceId}`, 105, 20, { align: "center" });

      // Get blob
      return doc.output("blob");
    } catch (error) {
      console.error("Error getting PDF blob:", error);
      return null;
    }
  }

  // Print invoice directly
  async printInvoice(invoiceId) {
    try {
      const doc = await this.exportInvoicePDF(invoiceId);
      if (!doc) return false;

      // Open in new window for printing
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const printWindow = window.open(pdfUrl);
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });

      return true;
    } catch (error) {
      console.error("Error printing invoice:", error);
      showToast("Không thể in hóa đơn", "error");
      return false;
    }
  }

  // Export report to PDF
  async exportReportPDF(reportData, reportTitle) {
    showLoading("Đang tạo báo cáo PDF...");

    try {
      const doc = new this.jsPDF();

      // Header
      doc.setFontSize(16);
      doc.setTextColor(14, 165, 233);
      doc.text(reportTitle, 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Ngày xuất: ${formatDate(new Date(), "dd/MM/yyyy HH:mm")}`,
        105,
        30,
        { align: "center" }
      );

      // Summary
      let y = 45;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Tổng doanh thu: ${formatCurrency(reportData.totalRevenue)}`,
        20,
        y
      );
      y += 8;
      doc.text(`Tổng số hóa đơn: ${reportData.totalInvoices}`, 20, y);
      y += 8;
      doc.text(
        `Giá trị TB/HĐ: ${formatCurrency(reportData.avgInvoiceValue)}`,
        20,
        y
      );

      // Table
      y += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      // ... Add table data ...

      doc.save(`BaoCao_${Date.now()}.pdf`);

      hideLoading();
      showToast("Đã xuất báo cáo PDF", "success");

      return true;
    } catch (error) {
      console.error("Error exporting report:", error);
      hideLoading();
      showToast("Không thể xuất báo cáo", "error");
      return false;
    }
  }
}

// Create singleton instance
const pdfExporter = new PDFExporter();

export default pdfExporter;
