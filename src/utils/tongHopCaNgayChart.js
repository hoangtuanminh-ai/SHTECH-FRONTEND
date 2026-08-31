// src/utils/tongHopCaNgayChart.js
// Chuẩn bị dữ liệu cho biểu đồ "Thực hiện KH sản xuất tháng ... theo ngày".
// Biểu đồ hiển thị 3 cột mỗi ngày, theo thứ tự Ca 1 -> Ca 2 -> Ca 3.
// Lưu ý quy ước: Ca 3 (ca đêm) có MÃ CA là '0' trong dữ liệu, nhưng hiển thị cho người dùng là "Ca 3".

// Mã ca dùng trong API (yearMonthDayShift) theo đúng thứ tự hiển thị trên biểu đồ
export const SHIFT_ORDER = [
  { code: '1', label: 'Ca 1', dataKey: 'ca1' },
  { code: '2', label: 'Ca 2', dataKey: 'ca2' },
  { code: '0', label: 'Ca 3', dataKey: 'ca3' },
];

// Chuyển mã ca ('0' | '1' | '2') sang số ca hiển thị cho người dùng (Ca 3 | Ca 1 | Ca 2)
export const caCodeToLabel = (code) => {
  const found = SHIFT_ORDER.find(s => s.code === String(code).trim());
  return found ? found.label : `Ca ${code}`;
};

/**
 * Số ngày của một tháng (month tính từ 1).
 * Dùng new Date(y, month, 0) -> ngày 0 của tháng kế tiếp = ngày cuối của tháng này.
 */
export const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

/**
 * Tính khoảng [startShift, endShift] cho biểu đồ theo ngày, dựa trên ca/ngày ĐANG LỌC.
 *
 * Quy tắc:
 *  - Điểm đầu LUÔN là ngày 01 Ca 1 của chính THÁNG ĐANG LỌC (không phải tháng hiện tại).
 *  - Nếu đang lọc THÁNG HIỆN TẠI: điểm cuối dừng đúng tại ca/ngày đang lọc,
 *    vì các ca sau đó chưa xảy ra.
 *  - Nếu đang lọc THÁNG QUÁ KHỨ (hoặc tương lai): lấy TRỌN CẢ THÁNG,
 *    tức đến ngày cuối tháng, Ca 2 (ca cuối cùng trong ngày theo thứ tự hiển thị).
 *
 * dateStr dạng 'YYYY-MM-DD', caCode là '0' | '1' | '2'.
 * Trả về { startShift, endShift, isCurrentMonth } hoặc null nếu dữ liệu không hợp lệ.
 */
export const getChartShiftRange = (dateStr, caCode, now = new Date()) => {
  if (!dateStr || caCode === '' || caCode === null || caCode === undefined) return null;

  const clean = String(dateStr).replace(/-/g, '');
  if (clean.length !== 8) return null;

  const year = Number(clean.slice(0, 4));
  const month = Number(clean.slice(4, 6));
  if (!year || !month) return null;

  const mm = String(month).padStart(2, '0');
  const startShift = Number(`${year}${mm}01${SHIFT_ORDER[0].code}`);

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  // Luôn lấy trọn cả tháng, đến ca cuối cùng của ngày cuối tháng.
  // Ca cuối theo thứ tự hiển thị là Ca 2 (mã '2'), vì Ca 3 mang mã '0' và
  // mã ca nằm ở hàng đơn vị nên '2' mới là giá trị lớn nhất trong ngày.
  const lastDay = String(getDaysInMonth(year, month)).padStart(2, '0');
  const lastCaCode = SHIFT_ORDER.reduce(
    (max, s) => (Number(s.code) > Number(max) ? s.code : max),
    SHIFT_ORDER[0].code
  );
  const endShift = Number(`${year}${mm}${lastDay}${lastCaCode}`);

  return { startShift, endShift, isCurrentMonth };
};

/**
 * Gom danh sách bản ghi theo ca (API trả mỗi ca một dòng) thành mảng theo NGÀY,
 * mỗi ngày chứa số liệu của cả 3 ca để vẽ 3 cột cạnh nhau.
 *
 * Mỗi phần tử kết quả:
 *   { day: '1/8', yearMonthDay: 20260801,
 *     ca1_tyLe, ca1_sanLuong, ca1_keHoach, ca1_coDuLieu, ... tương tự ca2_, ca3_ }
 */
export const buildTongHopCaNgayChartData = (records, monthKey = null) => {
  const list = Array.isArray(records) ? records : [];
  const byDay = new Map();

  // Xác định trước Năm và Tháng từ monthKey (nếu có) để tạo key ymd khi API trả về Day số nguyên
  let defaultYear = null;
  let defaultMonth = null;
  if (monthKey) {
    const clean = String(monthKey).replace(/-/g, '');
    if (clean.length >= 6) {
      defaultYear = Number(clean.slice(0, 4));
      defaultMonth = Number(clean.slice(4, 6));
    }
  }

  list.forEach(item => {
    // 1. Tính toán YearMonthDay (hỗ trợ cả ymd dạng 20260801 lẫn Day dạng số nguyên 1..31)
    let ymd = Number(item.yearMonthDay);
    if (!ymd) {
      const dNum = Number(item.Day ?? item.day ?? item.Ngay_SX ?? item.ngay_sx ?? 0);
      if (dNum > 0 && defaultYear && defaultMonth) {
        ymd = Number(`${defaultYear}${String(defaultMonth).padStart(2, '0')}${String(dNum).padStart(2, '0')}`);
      }
    }
    if (!ymd) return;

    if (!byDay.has(ymd)) {
      const ymdStr = String(ymd);
      const thang = Number(ymdStr.slice(4, 6));
      const ngay = Number(ymdStr.slice(6, 8));
      byDay.set(ymd, { yearMonthDay: ymd, day: `${ngay}/${thang}` });
    }
    const row = byDay.get(ymd);

    // 2. Xác định mã Ca (code: '1' -> Ca 1, '2' -> Ca 2, '0' -> Ca 3)
    let code = null;
    if (item.yearMonthDayShift !== undefined && item.yearMonthDayShift !== null) {
      code = String(item.yearMonthDayShift).slice(-1);
    } else if (item.Shift !== undefined && item.Shift !== null) {
      const raw = String(item.Shift).trim();
      code = (raw === '3' || raw === '0') ? '0' : raw;
    } else if (item.shift !== undefined && item.shift !== null) {
      const raw = String(item.shift).trim();
      code = (raw === '3' || raw === '0') ? '0' : raw;
    } else if (item.caSX !== undefined && item.caSX !== null) {
      const raw = String(item.caSX).trim();
      code = (raw === '3' || raw === '0') ? '0' : raw;
    }

    const shift = SHIFT_ORDER.find(s => s.code === code);
    if (!shift) return;

    // 3. Lấy số lượng Kế hoạch, Sản lượng và Tỷ lệ hoàn thành
    const keHoach = Number(
      item.TongKeHoachDieuChinh ?? item.soLuongKHDieuChinh ?? item.soLuongKH ?? item.TongKeHoach ?? 0
    ) || 0;
    const keHoachGoc = Number(item.soLuongKH ?? item.TongKeHoachGoc ?? keHoach) || 0;
    const sanLuong = Number(item.TongSanLuong ?? item.soLuongSX ?? item.sanLuong ?? 0) || 0;

    const tyLe = item.TyLeHoanThanh != null
      ? Number(item.TyLeHoanThanh) || 0
      : (item.tyLeThucHien != null
        ? Number(item.tyLeThucHien) || 0
        : (keHoach > 0 ? (sanLuong / keHoach) * 100 : 0));

    const k = shift.dataKey;
    row[`${k}_tyLe`] = tyLe;
    row[`${k}_sanLuong`] = sanLuong;
    row[`${k}_keHoach`] = keHoach;
    row[`${k}_keHoachGoc`] = keHoachGoc;
    row[`${k}_soLuongThieu`] = Number(item.soLuongThieu ?? (keHoach > sanLuong ? keHoach - sanLuong : 0)) || 0;
    row[`${k}_coDuLieu`] = true;
  });

  // Xác định tháng cần dựng khung: ưu tiên monthKey do trang truyền vào
  // (để khung không đổi kể cả khi API chưa trả về ngày nào), nếu không có thì
  // suy ra từ chính dữ liệu nhận được.
  let year = null;
  let month = null;
  if (monthKey) {
    const clean = String(monthKey).replace(/-/g, '');
    if (clean.length >= 6) {
      year = Number(clean.slice(0, 4));
      month = Number(clean.slice(4, 6));
    }
  }
  if ((!year || !month) && byDay.size > 0) {
    const firstYmd = String(Math.min(...byDay.keys()));
    year = Number(firstYmd.slice(0, 4));
    month = Number(firstYmd.slice(4, 6));
  }
  if (!year || !month) {
    return Array.from(byDay.values()).sort((a, b) => a.yearMonthDay - b.yearMonthDay);
  }

  // Dựng ĐỦ số ngày của tháng. Ngày chưa có dữ liệu vẫn có một ô trên trục X
  // nhưng không vẽ cột nào, nhờ đó bề rộng biểu đồ của mọi tháng là như nhau:
  // lọc giữa tháng (18 ngày) hay trọn tháng (30-31 ngày) đều cùng kích thước.
  const soNgay = getDaysInMonth(year, month);
  const mm = String(month).padStart(2, '0');
  const ketQua = [];
  for (let ngay = 1; ngay <= soNgay; ngay += 1) {
    const ymd = Number(`${year}${mm}${String(ngay).padStart(2, '0')}`);
    const row = byDay.get(ymd) || { yearMonthDay: ymd, day: `${ngay}/${month}` };
    
    // Đảm bảo tất cả các ca đều có trường dữ liệu để Recharts không bị lỗi mất Tooltip (shared=false)
    // Rất QUAN TRỌNG: Phải gán tyLe = 0 (không được null/undefined) để Recharts render ĐỦ số lượng path SVG.
    // Nếu path bị khuyết, mảng <Cell> của ta sẽ bị lệch index, dẫn đến việc râu ông nọ cắm cằm bà kia (cột ngày 4 nhưng hiển thị tooltip ngày 3).
    SHIFT_ORDER.forEach(s => {
      const k = s.dataKey;
      if (row[`${k}_coDuLieu`] === undefined) row[`${k}_coDuLieu`] = false;
      if (row[`${k}_tyLe`] === undefined) row[`${k}_tyLe`] = 0;
      if (row[`${k}_sanLuong`] === undefined) row[`${k}_sanLuong`] = 0;
    });

    ketQua.push(row);
  }
  return ketQua;
};
