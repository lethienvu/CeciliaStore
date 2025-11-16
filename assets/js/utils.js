// ============================================
// UTILS.JS - Utility Functions
// ============================================

// Format number as Vietnamese currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Format number with thousand separators
export function formatNumber(number) {
  return new Intl.NumberFormat("vi-VN").format(number);
}

// Format date
export function formatDate(date, format = "dd/MM/yyyy") {
  if (!date) return "";

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return format
    .replace("dd", day)
    .replace("MM", month)
    .replace("yyyy", year)
    .replace("HH", hours)
    .replace("mm", minutes);
}

// Parse date from string
export function parseDate(dateString) {
  if (!dateString) return null;

  // Try parsing dd/MM/yyyy format
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  return new Date(dateString);
}

// Generate unique ID
export function generateId(prefix = "") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}${random}`;
}

// Debounce function
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Show toast notification
export function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  const titles = {
    success: "Thành công",
    error: "Lỗi",
    warning: "Cảnh báo",
    info: "Thông báo",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <i class="toast-icon fas ${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

  container.appendChild(toast);

  // Close button
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.remove();
  });

  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
}

// Show loading overlay
export function showLoading(message = "Đang tải dữ liệu...") {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.querySelector("p").textContent = message;
    overlay.classList.add("show");
  }
}

// Hide loading overlay
export function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.classList.remove("show");
  }
}

// Show confirmation dialog
export async function showConfirm(
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy"
) {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0ea5e9",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
}

// Show alert dialog
export async function showAlert(title, message, type = "info") {
  await Swal.fire({
    title: title,
    text: message,
    icon: type,
    confirmButtonColor: "#0ea5e9",
    confirmButtonText: "OK",
  });
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number (Vietnamese format)
export function validatePhone(phone) {
  const re = /^(0|\+84)[0-9]{9,10}$/;
  return re.test(phone.replace(/\s/g, ""));
}

// Sanitize HTML to prevent XSS
export function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

// Deep clone object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Create modal
export function createModal(title, content, size = "md") {
  const container = document.getElementById("modalContainer");
  if (!container) return null;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
        <div class="modal modal-${size}">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" data-dismiss="modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

  container.appendChild(overlay);

  // Close handlers
  overlay
    .querySelector('[data-dismiss="modal"]')
    .addEventListener("click", () => {
      overlay.remove();
    });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  return overlay;
}

// Add footer to modal
export function addModalFooter(modal, buttons) {
  const modalBody = modal.querySelector(".modal-body");
  const footer = document.createElement("div");
  footer.className = "modal-footer";
  footer.innerHTML = buttons;
  modalBody.after(footer);
  return footer;
}

// Local storage helpers
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Storage error:", e);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Storage error:", e);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error("Storage error:", e);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error("Storage error:", e);
      return false;
    }
  },
};

// Session storage helpers
export const session = {
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Session storage error:", e);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Session storage error:", e);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error("Session storage error:", e);
      return false;
    }
  },
};

// Export all to download file
export function downloadFile(content, filename, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Đã sao chép vào clipboard", "success");
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    showToast("Không thể sao chép", "error");
    return false;
  }
}

// Calculate percentage
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
}

// Get random color
export function getRandomColor() {
  const colors = [
    "#0ea5e9",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#6366f1",
    "#14b8a6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Capitalize first letter
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate text
export function truncate(str, length = 50, suffix = "...") {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

// Check if element is in viewport
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Smooth scroll to element
export function scrollToElement(element, offset = 0) {
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  parseDate,
  generateId,
  debounce,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  showAlert,
  validateEmail,
  validatePhone,
  sanitizeHTML,
  deepClone,
  createModal,
  addModalFooter,
  storage,
  session,
  downloadFile,
  copyToClipboard,
  calculatePercentage,
  getRandomColor,
  capitalize,
  truncate,
  isInViewport,
  scrollToElement,
};
