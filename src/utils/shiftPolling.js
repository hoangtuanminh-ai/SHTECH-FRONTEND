// src/utils/shiftPolling.js
// Logic dùng chung để quyết định CÓ ĐƯỢC PHÉP polling (tự động gọi lại API) hay không.
// Quy tắc: chỉ polling khi bộ lọc ca/ngày đang bao gồm CA HIỆN TẠI của hệ thống.
// Nếu người dùng lọc sang ca khác hoặc dải ngày trong quá khứ/tương lai thì phải TẮT polling,
// vì dữ liệu ca đó đã đóng, polling chỉ gây nguy cơ ghi đè nhầm số liệu.

// Định dạng Date -> 'YYYY-MM-DD' theo giờ máy trạm.
// Không dùng toISOString() vì nó quy về UTC, giờ VN (UTC+7) sẽ bị lùi 1 ngày trong khoảng 00:00-06:59.
export const toLocalDateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Xác định ca sản xuất hiện tại theo giờ hệ thống.
// Quy ước ngày sản xuất: Ca 3 (mã ca = 0) của ngày D chạy từ 22:00 ngày D-1 đến 06:00 ngày D.
//  - 06:00 - 13:59 -> Ca 1 của ngày hôm nay
//  - 14:00 - 21:59 -> Ca 2 của ngày hôm nay
//  - 22:00 - 23:59 -> Ca 0 của NGÀY MAI (D + 1)
//  - 00:00 - 05:59 -> Ca 0 của NGÀY HÔM NAY (D)
// Trả về { ca: '0' | '1' | '2', dateStr: 'YYYY-MM-DD' }
export const getCurrentShift = (now = new Date()) => {
  const hour = now.getHours();
  const targetDate = new Date(now);
  let ca = '0';

  if (hour >= 6 && hour < 14) {
    ca = '1';
  } else if (hour >= 14 && hour < 22) {
    ca = '2';
  } else {
    ca = '0';
    if (hour >= 22) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  return { ca, dateStr: toLocalDateKey(targetDate) };
};

// Chuẩn hoá giá trị ca từ nhiều dạng đầu vào ('Ca 1', '1', 1, 'CA 0') về '0' | '1' | '2'.
// Trả về null nếu không nhận diện được.
export const normalizeCa = (ca) => {
  if (ca === null || ca === undefined || ca === '') return null;
  const digits = String(ca).replace(/\D/g, '');
  if (digits === '') return null;
  // Lấy chữ số cuối để bao được cả 'Ca 1' lẫn '1'
  const num = digits.charAt(digits.length - 1);
  return ['0', '1', '2'].includes(num) ? num : null;
};

// Quy đổi cặp (ngày, ca) thành một số nguyên tăng dần để so sánh thứ tự: YYYYMMDD * 10 + ca.
// Ví dụ: 2026-08-18 Ca 1 -> 202608181. Trả về null nếu dữ liệu không hợp lệ.
export const toShiftKey = (dateStr, ca) => {
  const normalizedCa = normalizeCa(ca);
  if (!dateStr || normalizedCa === null) return null;
  const cleanDate = String(dateStr).replace(/-/g, '');
  if (cleanDate.length !== 8) return null;
  return Number(`${cleanDate}${normalizedCa}`);
};

// Kiểm tra ca hiện tại có nằm TRONG bộ lọc hay không.
// - Lọc 1 ca duy nhất: truyền cùng giá trị cho from và to.
// - Lọc theo dải: ca hiện tại chỉ cần nằm trong khoảng [từ, đến] là đủ để bật polling.
export const isCurrentShiftInRange = ({ fromDate, fromCa, toDate, toCa }, now = new Date()) => {
  const fromKey = toShiftKey(fromDate, fromCa);
  const toKey = toShiftKey(toDate, toCa);
  if (fromKey === null || toKey === null) return false;

  // Nếu người dùng nhập ngược thứ tự thì vẫn so sánh theo khoảng thực tế
  const lowKey = Math.min(fromKey, toKey);
  const highKey = Math.max(fromKey, toKey);

  const current = getCurrentShift(now);
  const currentKey = toShiftKey(current.dateStr, current.ca);
  if (currentKey === null) return false;

  return currentKey >= lowKey && currentKey <= highKey;
};

// Trường hợp chỉ có một ca/ngày được chọn (các trang dashboard chi tiết máy)
export const isCurrentShiftSelected = (dateStr, ca, now = new Date()) =>
  isCurrentShiftInRange({ fromDate: dateStr, fromCa: ca, toDate: dateStr, toCa: ca }, now);
