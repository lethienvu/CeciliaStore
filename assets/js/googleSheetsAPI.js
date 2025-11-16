// ============================================
// GOOGLE SHEETS API INTEGRATION
// Handles all Google Sheets operations
// ============================================

import CONFIG from "./config.js";
import { showToast, showLoading, hideLoading } from "./utils.js";

class GoogleSheetsAPI {
  constructor() {
    this.isAuthenticated = false;
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = CONFIG.CACHE_DURATION;
  }

  // Initialize Google API
  async init() {
    return new Promise((resolve, reject) => {
      showLoading("Đang kết nối Google Sheets...");

      gapi.load("client:auth2", async () => {
        try {
          await gapi.client.init({
            apiKey: CONFIG.GOOGLE_API_KEY,
            clientId: CONFIG.GOOGLE_CLIENT_ID,
            discoveryDocs: CONFIG.GOOGLE_DISCOVERY_DOCS,
            scope: CONFIG.GOOGLE_SCOPES,
          });

          this.isInitialized = true;

          // Listen for sign-in state changes
          gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
            this.isAuthenticated = isSignedIn;
          });

          // Check if already signed in
          this.isAuthenticated = gapi.auth2.getAuthInstance().isSignedIn.get();

          hideLoading();

          if (!this.isAuthenticated) {
            await this.signIn();
          }

          resolve(true);
        } catch (error) {
          hideLoading();
          console.error("Error initializing Google API:", error);
          showToast(
            "Không thể kết nối Google Sheets. Vui lòng kiểm tra cấu hình.",
            "error"
          );
          reject(error);
        }
      });
    });
  }

  // Sign in to Google
  async signIn() {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      this.isAuthenticated = true;
      showToast("Đăng nhập Google thành công", "success");
      return true;
    } catch (error) {
      console.error("Sign in error:", error);
      showToast("Đăng nhập Google thất bại", "error");
      return false;
    }
  }

  // Sign out from Google
  async signOut() {
    try {
      await gapi.auth2.getAuthInstance().signOut();
      this.isAuthenticated = false;
      this.clearCache();
      showToast("Đã đăng xuất", "info");
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      return false;
    }
  }

  // Check authentication
  checkAuth() {
    if (!this.isAuthenticated) {
      showToast("Vui lòng đăng nhập Google", "warning");
      this.signIn();
      return false;
    }
    return true;
  }

  // Read data from sheet
  async readSheet(sheetName, range = "") {
    if (!this.checkAuth()) return null;

    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    const cacheKey = `read_${fullRange}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log("Returning cached data for:", fullRange);
        return cached.data;
      }
    }

    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: fullRange,
      });

      const data = response.result.values || [];

      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Error reading sheet:", error);
      showToast(`Lỗi đọc dữ liệu từ sheet ${sheetName}`, "error");
      return null;
    }
  }

  // Write data to sheet
  async writeSheet(sheetName, range, values) {
    if (!this.checkAuth()) return false;

    const fullRange = `${sheetName}!${range}`;

    try {
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: fullRange,
        valueInputOption: "USER_ENTERED",
        resource: { values: values },
      });

      // Invalidate cache
      this.clearCache();

      return true;
    } catch (error) {
      console.error("Error writing to sheet:", error);
      showToast(`Lỗi ghi dữ liệu vào sheet ${sheetName}`, "error");
      return false;
    }
  }

  // Append data to sheet
  async appendSheet(sheetName, values) {
    if (!this.checkAuth()) return false;

    try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: sheetName,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: { values: values },
      });

      // Invalidate cache
      this.clearCache();

      return true;
    } catch (error) {
      console.error("Error appending to sheet:", error);
      showToast(`Lỗi thêm dữ liệu vào sheet ${sheetName}`, "error");
      return false;
    }
  }

  // Delete row from sheet
  async deleteRow(sheetName, rowIndex) {
    if (!this.checkAuth()) return false;

    try {
      // Get sheet ID first
      const sheetId = await this.getSheetId(sheetName);
      if (sheetId === null) return false;

      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: "ROWS",
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });

      // Invalidate cache
      this.clearCache();

      return true;
    } catch (error) {
      console.error("Error deleting row:", error);
      showToast("Lỗi xóa dữ liệu", "error");
      return false;
    }
  }

  // Get sheet ID by name
  async getSheetId(sheetName) {
    try {
      const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
      });

      const sheet = response.result.sheets.find(
        (s) => s.properties.title === sheetName
      );
      return sheet ? sheet.properties.sheetId : null;
    } catch (error) {
      console.error("Error getting sheet ID:", error);
      return null;
    }
  }

  // Batch update multiple ranges
  async batchUpdate(updates) {
    if (!this.checkAuth()) return false;

    try {
      const data = updates.map((update) => ({
        range: `${update.sheetName}!${update.range}`,
        values: update.values,
      }));

      await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        resource: {
          valueInputOption: "USER_ENTERED",
          data: data,
        },
      });

      // Invalidate cache
      this.clearCache();

      return true;
    } catch (error) {
      console.error("Error in batch update:", error);
      showToast("Lỗi cập nhật dữ liệu", "error");
      return false;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log("Cache cleared");
  }

  // Manual sync/refresh
  async sync() {
    this.clearCache();
    showToast("Đã đồng bộ dữ liệu", "success");
  }

  // Convert sheet data to objects with headers
  parseSheetData(data) {
    if (!data || data.length === 0) return [];

    const headers = data[0];
    const rows = data.slice(1);

    return rows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
  }

  // Convert objects to sheet data with headers
  objectsToSheetData(objects, headers) {
    if (!objects || objects.length === 0) return [headers];

    const rows = objects.map((obj) => {
      return headers.map((header) => obj[header] || "");
    });

    return [headers, ...rows];
  }

  // Find row index by column value
  async findRowIndex(sheetName, columnIndex, value) {
    const data = await this.readSheet(sheetName);
    if (!data) return -1;

    return data.findIndex((row, index) => {
      return index > 0 && row[columnIndex] === value;
    });
  }

  // Get next available row
  async getNextRow(sheetName) {
    const data = await this.readSheet(sheetName);
    return data ? data.length + 1 : 2; // +1 for 1-based index, 2 if empty (header row)
  }

  // Generate next invoice number
  async getNextInvoiceNumber() {
    const data = await this.readSheet(CONFIG.SHEETS.INVOICES, "A:A");
    if (!data || data.length <= 1) {
      return `${CONFIG.INVOICE_PREFIX}001`;
    }

    const lastInvoiceId = data[data.length - 1][0];
    const numberPart =
      parseInt(lastInvoiceId.replace(CONFIG.INVOICE_PREFIX, "")) || 0;
    const nextNumber = (numberPart + 1).toString().padStart(3, "0");

    return `${CONFIG.INVOICE_PREFIX}${nextNumber}`;
  }
}

// Create singleton instance
const googleSheetsAPI = new GoogleSheetsAPI();

export default googleSheetsAPI;
