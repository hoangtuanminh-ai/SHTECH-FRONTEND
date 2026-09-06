// src/api/catVaiApi.js
import api from "./axios";

// 1. Lấy kế hoạch cắt vải phân trang
export const getKeHoachCatVai = async (namThangNgayCaNhapKho = "", page = 0, size = 20) => {
  try {
    console.log(`[getKeHoachCatVai] Request: namThangNgayCaNhapKho=${namThangNgayCaNhapKho}, page=${page}, size=${size}`);
    const res = await api.get("/api/catvai/kehoach", {
      params: { namThangNgayCaNhapKho, page, size }
    });
    console.log("[getKeHoachCatVai] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getKeHoachCatVai] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu kế hoạch cắt vải" };
  }
};

// 2. Báo cáo KHSX cắt vải
export const getBaoCaoKHSXCatVai = async (idKehoach, storeId, maMay = "") => {
  try {
    console.log(`[getBaoCaoKHSXCatVai] Request: idKehoach=${idKehoach}, storeId=${storeId}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/baocao-khsx", {
      params: { idKehoach, storeId, maMay }
    });
    console.log("[getBaoCaoKHSXCatVai] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoKHSXCatVai] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu báo cáo KHSX" };
  }
};

// 3. Báo cáo KHSX cắt vải theo tháng
export const getBaoCaoKHSXTheoThang = async (storeId, monthlyPlan, maMay) => {
  try {
    console.log(`[getBaoCaoKHSXTheoThang] Request: storeId=${storeId}, monthlyPlan=${monthlyPlan}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/baocao-khsx-theo-thang", {
      params: { storeId, monthlyPlan, maMay }
    });
    console.log("[getBaoCaoKHSXTheoThang] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoKHSXTheoThang] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu báo cáo KHSX theo tháng" };
  }
};

// 4. Báo cáo theo xe
export const getBaoCaoTheoXe = async (yearMonthDayShift, storeId, maMay) => {
  try {
    console.log(`[getBaoCaoTheoXe] Request: yearMonthDayShift=${yearMonthDayShift}, storeId=${storeId}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/baocao-theo-xe", {
      params: { yearMonthDayShift, storeId, maMay }
    });
    console.log("[getBaoCaoTheoXe] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoTheoXe] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy báo cáo theo xe" };
  }
};

// 5. Báo cáo theo xe khoảng ca (range)
export const getBaoCaoTheoXeRange = async (startShift, endShift, storeId, maMay) => {
  try {
    console.log(`[getBaoCaoTheoXeRange] Request: startShift=${startShift}, endShift=${endShift}, storeId=${storeId}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/baocao-theo-xe-range", {
      params: { startShift, endShift, storeId, maMay }
    });
    console.log("[getBaoCaoTheoXeRange] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoTheoXeRange] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy báo cáo theo xe khoảng ca" };
  }
};

// 6. Báo cáo tổng hợp theo ID kế hoạch
export const getTongHopIDKeHoach = async (idKehoach, startShift, endShift, storeId, maMay) => {
  try {
    console.log(`[getTongHopIDKeHoach] Request: idKehoach=${idKehoach}, startShift=${startShift}, endShift=${endShift}, storeId=${storeId}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/tonghop-id-kehoach", {
      params: { idKehoach, startShift, endShift, storeId, maMay }
    });
    console.log("[getTongHopIDKeHoach] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getTongHopIDKeHoach] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy báo cáo tổng hợp theo ID kế hoạch" };
  }
};

// 7. Báo cáo tổng hợp theo máy (theo xe tổng hợp theo máy)
export const getTongHopTheoMay = async (idKehoach, startShift, endShift, storeId, maMay) => {
  try {
    console.log(`[getTongHopTheoMay] Request: idKehoach=${idKehoach}, startShift=${startShift}, endShift=${endShift}, storeId=${storeId}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/baocao-theo-xe-tonghop-theomay", {
      params: { idKehoach, startShift, endShift, storeId, maMay }
    });
    console.log("[getTongHopTheoMay] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getTongHopTheoMay] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy báo cáo tổng hợp theo máy" };
  }
};

// 8. Báo cáo tổng hợp không theo máy (theo xe tổng hợp không theo máy)
export const getTongHopKhongTheoMay = async (idKehoach, startShift, endShift, storeId, maMay) => {
  try {
    console.log(`[getTongHopKhongTheoMay] Request: idKehoach=${idKehoach}, startShift=${startShift}, endShift=${endShift}, storeId=${storeId}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/baocao-theo-xe-tonghop-khongtheomay", {
      params: { idKehoach, startShift, endShift, storeId, maMay }
    });
    console.log("[getTongHopKhongTheoMay] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getTongHopKhongTheoMay] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy báo cáo tổng hợp không theo máy" };
  }
};

// 9. Danh sách Users cho dropbox
export const getCatVaiUsers = async () => {
  try {
    console.log("[getCatVaiUsers] Request");
    const res = await api.get("/api/catvai/users");
    console.log("[getCatVaiUsers] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getCatVaiUsers] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy danh sách nhân viên" };
  }
};

// 10. Danh mục bán chế phẩm
export const getDanhMucBaoChePham = async () => {
  try {
    console.log("[getDanhMucBaoChePham] Request");
    const res = await api.get("/api/catvai/danhmuc-bcp");
    console.log("[getDanhMucBaoChePham] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getDanhMucBaoChePham] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy danh mục bán chế phẩm" };
  }
};

// 11. Danh sách máy (Equipments)
export const getCatVaiEquipments = async () => {
  try {
    console.log("[getCatVaiEquipments] Request");
    const res = await api.get("/api/catvai/equipments");
    console.log("[getCatVaiEquipments] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getCatVaiEquipments] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy danh sách máy" };
  }
};

// 12. Danh sách kho (Stores)
export const getCatVaiStores = async () => {
  try {
    console.log("[getCatVaiStores] Request");
    const res = await api.get("/api/catvai/stores");
    console.log("[getCatVaiStores] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getCatVaiStores] Lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy danh sách kho" };
  }
};

// 13. Lấy tổng số kế hoạch gốc, kế hoạch điều chỉnh, sản lượng thực tế và số lượng thiếu theo dải ngày (dùng cho các KPI và biểu đồ tròn)
export const getCatVaiSummaryStats = async (fromDate, toDate) => {
  try {
    // In ra console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
    console.log(`[catVaiApi] getCatVaiSummaryStats được gọi: fromDate=${fromDate}, toDate=${toDate}`);
    const res = await api.get("/api/catvai/summary-stats", {
      params: { fromDate, toDate }
    });
    // In ra console dữ liệu nhận về phục vụ test lỗi (Quy tắc 3)
    console.log("[catVaiApi] getCatVaiSummaryStats response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getCatVaiSummaryStats lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu tổng hợp cắt vải" };
  }
};

// 14. Lấy kế hoạch điều chỉnh kèm sản lượng và năm, tháng của từng tháng trong năm (dùng cho biểu đồ xu hướng theo tháng)
export const getCatVaiMonthlyStats = async (nam_sx, maMay = null) => {
  try {
    // In ra console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
    console.log(`[catVaiApi] getCatVaiMonthlyStats được gọi: nam_sx=${nam_sx}, maMay=${maMay}`);
    const params = { nam_sx };
    if (maMay) params.maMay = maMay;
    const res = await api.get("/api/catvai/monthly-stats", {
      params
    });
    // In ra console dữ liệu nhận về phục vụ test lỗi (Quy tắc 3)
    console.log("[catVaiApi] getCatVaiMonthlyStats response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getCatVaiMonthlyStats lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu thống kê cắt vải theo tháng" };
  }
};

// 15. Lấy dữ liệu các ngày trong tháng (dùng cho biểu đồ tiến độ theo ngày)
export const getCatVaiDailyStats = async (nam_sx, thang_sx) => {
  try {
    // In ra console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
    console.log(`[catVaiApi] getCatVaiDailyStats được gọi: nam_sx=${nam_sx}, thang_sx=${thang_sx}`);
    const res = await api.get("/api/catvai/daily-stats", {
      params: { nam_sx, thang_sx }
    });
    // In ra console dữ liệu nhận về phục vụ test lỗi (Quy tắc 3)
    console.log("[catVaiApi] getCatVaiDailyStats response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getCatVaiDailyStats lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu thống kê cắt vải theo ngày" };
  }
};

// 16. Lấy thống kê cắt vải theo ngày và theo máy
export const getDailyStatsTheoMay = async (nam_sx, thang_sx, maMay) => {
  try {
    // In ra console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
    console.log(`[catVaiApi] getDailyStatsTheoMay được gọi: nam_sx=${nam_sx}, thang_sx=${thang_sx}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/daily-stats-theo-may", {
      params: { nam_sx, thang_sx, maMay }
    });
    // In ra console dữ liệu nhận về phục vụ test lỗi (Quy tắc 3)
    console.log("[catVaiApi] getDailyStatsTheoMay response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getDailyStatsTheoMay lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu thống kê cắt vải theo ngày và máy" };
  }
};

// 17. Lấy thống kê cắt vải theo tháng và theo máy
export const getMonthlyStatsTheoMay = async (nam_sx, thang_sx, maMay) => {
  try {
    // In ra console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
    console.log(`[catVaiApi] getMonthlyStatsTheoMay được gọi: nam_sx=${nam_sx}, thang_sx=${thang_sx}, maMay=${maMay}`);
    const res = await api.get("/api/catvai/monthly-stats-theo-may", {
      params: { nam_sx, thang_sx, maMay }
    });
    // In ra console dữ liệu nhận về phục vụ test lỗi (Quy tắc 3)
    console.log("[catVaiApi] getMonthlyStatsTheoMay response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getMonthlyStatsTheoMay lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy dữ liệu thống kê cắt vải theo tháng và máy" };
  }
};

// 18. Lấy danh sách BTP theo máy và ca nhập kho
export const getBtpTheoMay = async (maMay, namThangNgayCaNhapKho) => {
  try {
    // In ra console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
    console.log(`[catVaiApi] getBtpTheoMay được gọi: maMay=${maMay}, namThangNgayCaNhapKho=${namThangNgayCaNhapKho}`);
    
    const res = await api.get("/api/catvai/btp-theo-may", {
      params: { maMay, namThangNgayCaNhapKho }
    });
    
    // In ra console dữ liệu nhận về phục vụ test lỗi (Quy tắc 3)
    console.log("[catVaiApi] getBtpTheoMay response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getBtpTheoMay lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy danh sách BTP theo máy" };
  }
};

// Helper chuẩn hóa mã máy Cắt Vải sang dạng 2 chữ số '01', '02', '03'... (Ví dụ: 'ORC-CV-01' -> '01', 'CV-02' -> '02', '1' -> '01')
export const normalizeCatVaiMachineCode = (maMay) => {
  if (!maMay) return null;
  const str = String(maMay).trim();
  if (!str) return null;
  const match = str.match(/\d+/);
  if (match) {
    return match[0].padStart(2, '0');
  }
  return str;
};

// 19. API 1: Lấy sản lượng của công đoạn Cắt Vải (chu kỳ nhiều năm / 10 năm) (GET /api/catvai/production-5-years)
export const getProductionQuantityFor5YearsCatVai = async ({ selectedYear, maMay = null }) => {
  try {
    const normMaMay = normalizeCatVaiMachineCode(maMay);
    console.log(`[catVaiApi] getProductionQuantityFor5YearsCatVai (10 năm): selectedYear=${selectedYear}, maMay=${normMaMay} (gốc: ${maMay})`);
    const params = { selectedYear };
    if (normMaMay) params.maMay = normMaMay;
    const res = await api.get("/api/catvai/production-5-years", { params });
    console.log("[catVaiApi] getProductionQuantityFor5YearsCatVai kết quả:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getProductionQuantityFor5YearsCatVai lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy sản lượng cắt vải" };
  }
};
export const getProductionQuantityFor10YearsCatVai = getProductionQuantityFor5YearsCatVai;

// 20. API 2: Lấy kế hoạch điều chỉnh, sản lượng và tỷ lệ hoàn thành các tháng trong năm (GET /api/catvai/monthly-stats-for-year)
export const getMonthlyStatsForYearCatVai = async ({ nam_sx, maMay = null }) => {
  try {
    const normMaMay = normalizeCatVaiMachineCode(maMay);
    console.log(`[catVaiApi] getMonthlyStatsForYearCatVai: nam_sx=${nam_sx}, maMay=${normMaMay} (gốc: ${maMay})`);
    const params = { nam_sx };
    if (normMaMay) params.maMay = normMaMay;
    const res = await api.get("/api/catvai/monthly-stats-for-year", { params });
    console.log("[catVaiApi] getMonthlyStatsForYearCatVai response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getMonthlyStatsForYearCatVai lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy thống kê cắt vải các tháng trong năm" };
  }
};

// 21. API 3: Lấy kế hoạch điều chỉnh, sản lượng và tỷ lệ hoàn thành các ngày trong tháng (GET /api/catvai/daily-stats-for-month)
export const getDailyStatsForMonthCatVai = async ({ nam_sx, thang_sx, maMay = null }) => {
  try {
    const normMaMay = normalizeCatVaiMachineCode(maMay);
    console.log(`[catVaiApi] getDailyStatsForMonthCatVai: nam_sx=${nam_sx}, thang_sx=${thang_sx}, maMay=${normMaMay} (gốc: ${maMay})`);
    const params = { nam_sx, thang_sx };
    if (normMaMay) params.maMay = normMaMay;
    const res = await api.get("/api/catvai/daily-stats-for-month", { params });
    console.log("[catVaiApi] getDailyStatsForMonthCatVai response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getDailyStatsForMonthCatVai lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy thống kê cắt vải các ngày trong tháng" };
  }
};

// 22. API 4: Lấy kế hoạch điều chỉnh, sản lượng và tỷ lệ hoàn thành các ca trong tháng (GET /api/catvai/shift-stats-for-month)
export const getShiftStatsForMonthCatVai = async ({ nam_sx, thang_sx, maMay = null }) => {
  try {
    const normMaMay = normalizeCatVaiMachineCode(maMay);
    console.log(`[catVaiApi] getShiftStatsForMonthCatVai: nam_sx=${nam_sx}, thang_sx=${thang_sx}, maMay=${normMaMay} (gốc: ${maMay})`);
    const params = { nam_sx, thang_sx };
    if (normMaMay) params.maMay = normMaMay;
    const res = await api.get("/api/catvai/shift-stats-for-month", { params });
    console.log("[catVaiApi] getShiftStatsForMonthCatVai response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[catVaiApi] getShiftStatsForMonthCatVai lỗi:", error);
    throw error.response?.data || { message: "Không thể lấy thống kê cắt vải theo ca trong tháng" };
  }
};



