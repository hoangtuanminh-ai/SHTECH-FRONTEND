/**
 * dateHelper.js
 * Các hàm tiện ích hỗ trợ định dạng ngày, tháng hiện tại cho bộ lọc phân hệ KCS
 */

/**
 * Lấy ngày hôm nay dưới dạng YYYY-MM-DD
 * @returns {string} ví dụ: "2026-09-19"
 */
export const getTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const result = `${yyyy}-${mm}-${dd}`;
  console.log(`[dateHelper] getTodayStr -> ${result}`);
  return result;
};

/**
 * Lấy ngày hôm qua dưới dạng YYYY-MM-DD.
 */
export const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Lấy tháng hiện tại dưới dạng YYYY-MM
 * @returns {string} ví dụ: "2026-09"
 */
export const getCurrentMonthStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const result = `${yyyy}-${mm}`;
  console.log(`[dateHelper] getCurrentMonthStr -> ${result}`);
  return result;
};

/**
 * Lấy tháng hiện tại dưới dạng YYYYMM (dùng cho MonthlyPlan text input)
 * @returns {string} ví dụ: "202609"
 */
export const getCurrentMonthlyPlanStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const result = `${yyyy}${mm}`;
  console.log(`[dateHelper] getCurrentMonthlyPlanStr -> ${result}`);
  return result;
};
