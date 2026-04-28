/**
 * Utility functions for formatting time and currency
 */

/**
 * Format hours to human readable format
 * @param {number|string} hours - Total hours (e.g., 8.5)
 * @returns {string} Formatted string (e.g., "8 giờ 30 phút" or "45 phút")
 */
export function formatHours(hours) {
  if (!hours || hours === 0) return '0 phút';

  const totalMinutes = Math.round(parseFloat(hours) * 60);
  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = totalMinutes % 60;

  if (hoursPart === 0) {
    return `${minutesPart} phút`;
  } else if (minutesPart === 0) {
    return `${hoursPart} giờ`;
  } else {
    return `${hoursPart} giờ ${minutesPart} phút`;
  }
}

/**
 * Format currency to Vietnamese format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format date to Vietnamese format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format time to Vietnamese format
 * @param {string|Date} time - Time to format
 * @returns {string} Formatted time string
 */
export function formatTime(time) {
  if (!time) return '-';
  return new Date(time).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}