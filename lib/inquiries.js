// Utility for tracking customer inquiry logs from WhatsApp clicks.
// Stored in localStorage under "veloce_inquiry_logs".

const STORAGE_KEY = 'veloce_inquiry_logs';
const isBrowser = typeof window !== 'undefined';

export const INQUIRY_STATUSES = ['New Request', 'Delivered & Paid', 'Cancelled'];

/**
 * Get all inquiries (unsorted).
 */
export const getInquiries = () => {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading inquiries:', err);
    return [];
  }
};

/**
 * Append a new inquiry record. Called from the storefront when the
 * customer clicks the WhatsApp button. Always uses status "New Request".
 *
 * @param {Object} payload
 * @param {string} payload.productId
 * @param {string} payload.productName
 * @param {number} payload.productPrice
 * @param {string} [payload.productCategory]
 * @param {string} [payload.imageUrl]
 * @returns {Object|null} The stored record
 */
export const logInquiry = ({
  productId,
  productName,
  productPrice,
  productCategory = '',
  imageUrl = '',
} = {}) => {
  if (!isBrowser) return null;
  if (!productName) return null;
  try {
    const all = getInquiries();
    const entry = {
      id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      productId: productId || null,
      productName,
      productPrice: Number(productPrice) || 0,
      productCategory,
      imageUrl,
      status: 'New Request',
      timestamp: new Date().toISOString(),
    };
    all.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return entry;
  } catch (err) {
    console.error('Error logging inquiry:', err);
    return null;
  }
};

/**
 * Update the status of a specific inquiry.
 */
export const updateInquiryStatus = (id, status) => {
  if (!isBrowser) return null;
  if (!INQUIRY_STATUSES.includes(status)) return null;
  try {
    const all = getInquiries();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all[idx];
  } catch (err) {
    console.error('Error updating inquiry status:', err);
    return null;
  }
};

/**
 * Delete a single inquiry record.
 */
export const deleteInquiry = (id) => {
  if (!isBrowser) return false;
  try {
    const next = getInquiries().filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    return false;
  }
};

/**
 * Wipe all inquiry records.
 */
export const clearInquiries = () => {
  if (!isBrowser) return false;
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};
