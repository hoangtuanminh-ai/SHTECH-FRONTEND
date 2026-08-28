// src/api/thanhhinhApi.js
import api from "./axios";

const BASE_PATH = "/api/thanhhinh/machine";

// Lấy dữ liệu một máy cụ thể
export const getThanhHinhByMachine = async (equipmentId, params = {}) => {
  try {
    const res = await api.get(`${BASE_PATH}/${equipmentId}`, { params });
    return res.data;
  } catch (error) {
    console.error(`[getThanhHinhByMachine] Lỗi máy ${equipmentId}:`, error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu máy" };
  }
};

// Lấy dữ liệu tất cả máy
export const getThanhHinhAllMachines = async (params = {}) => {
  try {
    const res = await api.get(`${BASE_PATH}/all`, { params });
    return res.data;
  } catch (error) {
    console.error("[getThanhHinhAllMachines] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu tất cả máy" };
  }
};
export const getDanhSachMay = async () => {
  try {
    const res = await api.get(`${BASE_PATH}/machines`);
    return res.data;
  } catch (error) {
    console.error("[getDanhSachMay] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải danh sách máy" };
  }
};

// Lấy dashboard stats cho máy cụ thể (piechart + stats)
export const getDashboardMay = async (equipmentId, params = {}) => {
  try {
    const res = await api.get(`${BASE_PATH}/${equipmentId}/piechart`, { params });
    return res.data;
  } catch (error) {
    console.error(`[getDashboardMay] Lỗi máy ${equipmentId}:`, error);
    throw error.response?.data || { message: "Lỗi tải dashboard máy" };
  }
};
// Lấy dashboard stats (tổng hợp hoặc theo máy)
export const getDashboardStats = async (params = {}) => {
  try {
    const res = await api.get(`${BASE_PATH}/dashboard/stats`, { params });
    return res.data;
  } catch (error) {
    console.error("[getDashboardStats] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải thông số dashboard" };
  }
};
// Lấy tổng sản lượng 5 năm của công đoạn Thành hình (Mới)
// URL: GET /api/thanhhinh/machine/production-5-years?selectedYear=2026&maMay=01
export const getProductionQuantityFor5Years = async ({ selectedYear, maMay }) => {
  try {
    const params = { selectedYear };
    if (maMay) {
      params.maMay = maMay;
    }
    console.log(">>> [thanhhinhApi] getProductionQuantityFor5Years gọi API:", params);
    const res = await api.get(`${BASE_PATH}/production-5-years`, { params });
    console.log(">>> [thanhhinhApi] getProductionQuantityFor5Years kết quả:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getProductionQuantityFor5Years] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải sản lượng 5 năm Thành hình" };
  }
};

// Lấy báo cáo KHSX
export const getBaoCaoKHSX = async (idKehoach = '%', storeId = '%') => {
  try {
    const res = await api.get(`${BASE_PATH}/baocao-khsx`, {
      params: { id_kehoach: idKehoach, store_id: storeId },
    });
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoKHSX] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải báo cáo KHSX" };
  }
};
// Lấy báo cáo KHSX theo tháng
export const getBaoCaoKHSXThang = async (storeId = '%', monthlyPlan = 0, spare2 = '%') => {
  try {
    const res = await api.get(`${BASE_PATH}/baocao-khsx-thang`, {
      params: { store_id: storeId, monthly_plan: monthlyPlan, spare_2: spare2 },
    });
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoKHSXThang] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải báo cáo KHSX theo tháng" };
  }
};
// Lấy báo cáo KHSX theo tháng tổng hợp
export const getBaoCaoKHSXThangTongHop = async (storeId = '%', monthlyPlan = 0, spare2 = '%') => {
  try {
    const res = await api.get(`${BASE_PATH}/baocao-khsx-thang-tonghop`, {
      params: { store_id: storeId, monthly_plan: monthlyPlan, spare_2: spare2 },
    });
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoKHSXThangTongHop] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải báo cáo KHSX theo tháng tổng hợp" };
  }
};
/**
 * Lấy danh sách máy và thông số thống kê (Thực tế, Kế hoạch, Trạng thái)
 * @param {Object} params - Chứa { fromDate, toDate } 
 * Định dạng truyền vào nên là chuỗi ISO: "2026-04-16T00:00:00"
 */
export const getMachinesWithStats = async (params = {}) => {
  try {
    // 1. Kiểm tra và đảm bảo params có đủ fromDate, toDate
    // Nếu bạn truyền từ giao diện (datetime-local), nó thường thiếu phần giây ":00"
    const formattedParams = { ...params };

    if (formattedParams.fromDate && formattedParams.fromDate.length === 16) {
      formattedParams.fromDate += ":00";
    }
    if (formattedParams.toDate && formattedParams.toDate.length === 16) {
      formattedParams.toDate += ":59";
    }

    const res = await api.get(`${BASE_PATH}/machines-with-stats`, {
      params: formattedParams
    });

    return res.data;
  } catch (error) {
    console.error("[getMachinesWithStats] Lỗi:", error);
    // Trả về dữ liệu lỗi từ backend nếu có, hoặc message mặc định
    throw error.response?.data || { success: false, message: "Lỗi tải danh sách máy và stats" };
  }
};
export const getDailyPlanRatio = async ({ nam_sx, thang_sx, equipmentId }) => {
  try {
    // Chuẩn hóa mã máy để tránh lệch mã máy giữa URL (VD: TH08, 08) và Database (VD: ORC-TH-08)
    let normId = equipmentId;
    if (equipmentId && typeof equipmentId === 'string') {
      const upperId = equipmentId.toUpperCase();
      if (!upperId.startsWith('ORC-TH-') && !upperId.includes('ORCV') && !upperId.startsWith('ORC-CV-')) {
        const match = equipmentId.match(/\d+/);
        if (match) {
          const num = match[0].padStart(2, '0');
          normId = `ORC-TH-${num}`;
        }
      }
    }

    const params = {
      nam_sx,
      thang_sx,
      ...(normId && { equipmentId: normId }),
      ...(normId && { maMay: normId }), // Dự phòng cho backend nếu dùng maMay
    };

    console.log(">>> [API CALL CALLER] getDailyPlanRatio params:", params);

    const res = await api.get(`${BASE_PATH}/daily-plan-ratio`, { params });
    return res.data;
  } catch (error) {
    console.error("[getDailyPlanRatio] Lỗi:", error);
    const errData = error.response?.data;
    if (errData && typeof errData === 'string' && errData.includes('<!DOCTYPE')) {
      throw new Error("Server trả về HTML thay vì JSON. Kiểm tra endpoint có tồn tại không?");
    }
    throw errData || { message: "Lỗi tải dữ liệu tỷ lệ theo ngày" };
  }
};

/**
 * Lấy dữ liệu tổng hợp sản lượng theo từng CA của từng NGÀY.
 * Backend chỉ nhận: startShift, endShift (dạng số YYYYMMDDS) và maMay (tùy chọn).
 * Trong đó S là mã ca: 1 = Ca 1, 2 = Ca 2, 0 = Ca 3 (ca đêm).
 * Ví dụ: startShift=202608011 (01/08/2026 Ca 1) -> endShift=202608182 (18/08/2026 Ca 2).
 */
export const getTongHopCaNgay = async ({ startShift, endShift, maMay }) => {
  try {
    const params = {
      startShift,
      endShift,
      ...(maMay && { maMay }),
    };

    console.log(">>> [API CALL] getTongHopCaNgay params:", params);

    const res = await api.get(`${BASE_PATH}/tong-hop-ca-ngay`, { params });
    return res.data;
  } catch (error) {
    console.error("[getTongHopCaNgay] Lỗi:", error);
    const errData = error.response?.data;
    if (errData && typeof errData === 'string' && errData.includes('<!DOCTYPE')) {
      throw new Error("Server trả về HTML thay vì JSON. Kiểm tra endpoint có tồn tại không?");
    }
    throw errData || { message: "Lỗi tải dữ liệu tổng hợp ca ngày" };
  }
};

// Lấy danh sách Lốp TH-LH
export const getDanhSachLopTHLH = async (params = {}) => {
  try {
    const res = await api.get(`${BASE_PATH}/danhsach-lop-th-lh`, { params });
    return res.data;
  } catch (error) {
    console.error("[getDanhSachLopTHLH] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải danh sách lốp TH-LH" };
  }
};

// Lấy danh sách khối lượng lốp
export const getDanhSachKhoiLuongLop = async (params = {}) => {
  try {
    const res = await api.get(`${BASE_PATH}/danhsach-khoiluong-lop`, { params });
    return res.data;
  } catch (error) {
    console.error("[getDanhSachKhoiLuongLop] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải danh sách khối lượng lốp" };
  }
};

// Lấy danh sách kho OR.TH
export const getStoreListOrth = async () => {
  try {
    const res = await api.get('/api/stores/orth');
    return res.data;
  } catch (error) {
    console.error("[getStoreListOrth] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải danh sách kho OR.TH" };
  }
};

// Lấy danh sách dữ liệu ParameterRealTime_TH02
export const getChartRealTime = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartRealTime params:", params);
    const res = await api.get('/api/v1/chart/realtime', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartRealTime data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartRealTime] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Chart RealTime" };
  }
};

// Lấy danh sách dữ liệu ParameterSetting_TH02
export const getChartSetting = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSetting params:", params);
    const res = await api.get('/api/v1/chart/setting', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSetting data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSetting] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Chart Setting" };
  }
};

// Lấy danh sách dữ liệu ParameterRealTime_TH09
export const getChartRealTimeTH09 = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartRealTimeTH09 params:", params);
    const res = await api.get('/api/v1/chart/realtime-th09', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartRealTimeTH09 data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartRealTimeTH09] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Chart RealTime TH09" };
  }
};

// Lấy danh sách dữ liệu ParameterSetting_TH09
export const getChartSettingTH09 = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSettingTH09 params:", params);
    const res = await api.get('/api/v1/chart/setting-th09', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSettingTH09 data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH09] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Chart Setting TH09" };
  }
};

// Lấy danh sách dữ liệu ParameterRealTime_TH02_History (phân trang và lọc)
export const getChartRealTimeTH02History = async (params = {}) => {
  try {
    const res = await api.get('/api/v1/chart/realtime-th02-history', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartRealTimeTH02History] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử RealTime TH02" };
  }
};

// Lấy danh sách dữ liệu ParameterRealTime_TH09_History (phân trang và lọc)
export const getChartRealTimeTH09History = async (params = {}) => {
  try {
    const res = await api.get('/api/v1/chart/realtime-th09-history', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartRealTimeTH09History] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử RealTime TH09" };
  }
};

// Lấy danh sách dữ liệu ParameterSetting_TH02_History (phân trang và lọc)
export const getChartSettingTH02History = async (params = {}) => {
  try {
    const res = await api.get('/api/v1/chart/setting-th02-history', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH02History] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử Setting TH02" };
  }
};

// Lấy danh sách dữ liệu ParameterSetting_TH09_History (phân trang và lọc)
export const getChartSettingTH09History = async (params = {}) => {
  try {
    const res = await api.get('/api/v1/chart/setting-th09-history', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH09History] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử Setting TH09" };
  }
};

// Lấy danh sách ParameterRealTime_ORCV (máy cắt vải)
export const getChartRealTimeORCV = async (params = {}) => {
  try {
    console.log(">>> [API CALL] getChartRealTimeORCV params:", params);
    const res = await api.get('/api/v1/chart/realtime-orcv', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartRealTimeORCV] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu RealTime ORCV" };
  }
};

// Lấy danh sách ParameterRecipe_ORCV (máy cắt vải)
export const getChartRecipeORCV = async (params = {}) => {
  try {
    console.log(">>> [API CALL] getChartRecipeORCV params:", params);
    const res = await api.get('/api/v1/chart/recipe-orcv', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartRecipeORCV] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Recipe ORCV" };
  }
};

// Lấy danh sách ParameterSetting_ORCV (máy cắt vải)
export const getChartSettingORCV = async (params = {}) => {
  try {
    console.log(">>> [API CALL] getChartSettingORCV params:", params);
    const res = await api.get('/api/v1/chart/setting-orcv', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartSettingORCV] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Setting ORCV" };
  }
};

// Lấy danh sách ParameterRealTime_ORCV_History (máy cắt vải)
export const getChartRealTimeORCVHistory = async (params = {}) => {
  try {
    console.log(">>> [API CALL] getChartRealTimeORCVHistory params:", params);
    const res = await api.get('/api/v1/chart/realtime-orcv-history', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartRealTimeORCVHistory] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử RealTime ORCV" };
  }
};

// Lấy danh sách ParameterRecipe_ORCV_History (máy cắt vải)
export const getChartRecipeORCVHistory = async (params = {}) => {
  try {
    console.log(">>> [API CALL] getChartRecipeORCVHistory params:", params);
    const res = await api.get('/api/v1/chart/recipe-orcv-history', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartRecipeORCVHistory] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử Recipe ORCV" };
  }
};

// Lấy danh sách ParameterSetting_ORCV_History (máy cắt vải)
export const getChartSettingORCVHistory = async (params = {}) => {
  try {
    console.log(">>> [API CALL] getChartSettingORCVHistory params:", params);
    const res = await api.get('/api/v1/chart/setting-orcv-history', { params });
    return res.data;
  } catch (error) {
    console.error("[getChartSettingORCVHistory] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử Setting ORCV" };
  }
};

// Lấy danh sách dữ liệu ParameterRealTime_TH05
export const getChartRealTimeTH05 = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartRealTimeTH05 params:", params);
    const res = await api.get('/api/v1/chart/realtime-th05', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartRealTimeTH05 data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartRealTimeTH05] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Chart RealTime TH05" };
  }
};

// Lấy danh sách dữ liệu ParameterSetting_TH05
export const getChartSettingTH05 = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSettingTH05 params:", params);
    const res = await api.get('/api/v1/chart/setting-th05', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSettingTH05 data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH05] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu Chart Setting TH05" };
  }
};

// Lấy danh sách dữ liệu ParameterRealTime_TH05_History (phân trang và lọc)
export const getChartRealTimeTH05History = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartRealTimeTH05History params:", params);
    const res = await api.get('/api/v1/chart/realtime-th05-history', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartRealTimeTH05History data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartRealTimeTH05History] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử RealTime TH05" };
  }
};

// Lấy danh sách dữ liệu ParameterSetting_TH05_History (phân trang và lọc)
export const getChartSettingTH05History = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSettingTH05History params:", params);
    const res = await api.get('/api/v1/chart/setting-th05-history', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSettingTH05History data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH05History] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu lịch sử Setting TH05" };
  }
};

// Lấy danh sách lịch sử thay đổi recipe máy cắt vải (ORCV)
export const getChartRecipeORCVChange = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartRecipeORCVChange params:", params);
    const res = await api.get('/api/v1/chart/recipe-orcv-change', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartRecipeORCVChange data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartRecipeORCVChange] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải lịch sử thay đổi Recipe ORCV" };
  }
};

// Lấy danh sách lịch sử thay đổi cài đặt máy cắt vải (ORCV)
export const getChartSettingORCVChange = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSettingORCVChange params:", params);
    const res = await api.get('/api/v1/chart/setting-orcv-change', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSettingORCVChange data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSettingORCVChange] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải lịch sử thay đổi Setting ORCV" };
  }
};

// Lấy danh sách lịch sử thay đổi cài đặt máy TH02
export const getChartSettingTH02Change = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSettingTH02Change params:", params);
    const res = await api.get('/api/v1/chart/setting-th02-change', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSettingTH02Change data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH02Change] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải lịch sử thay đổi Setting TH02" };
  }
};

// Lấy danh sách lịch sử thay đổi cài đặt máy TH05
export const getChartSettingTH05Change = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSettingTH05Change params:", params);
    const res = await api.get('/api/v1/chart/setting-th05-change', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSettingTH05Change data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH05Change] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải lịch sử thay đổi Setting TH05" };
  }
};

// Lấy danh sách lịch sử thay đổi cài đặt máy TH09
export const getChartSettingTH09Change = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getChartSettingTH09Change params:", params);
    const res = await api.get('/api/v1/chart/setting-th09-change', { params });
    console.log(">>> [API RESPONSE RECEIVED] getChartSettingTH09Change data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getChartSettingTH09Change] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải lịch sử thay đổi Setting TH09" };
  }
};

// Lấy sản lượng tổng và kế hoạch hiệu lực của một máy cụ thể theo ca sản xuất trong ngày
export const getShiftStats = async (params = {}) => {
  try {
    // Log console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
    console.log(">>> [API CALL CALLER] getShiftStats params:", params);
    const res = await api.get(`${BASE_PATH}/shift-stats`, { params });
    // Log kết quả trả về để test lỗi (Quy tắc 3)
    console.log(">>> [API RESPONSE RECEIVED] getShiftStats data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getShiftStats] Lỗi khi tải thống kê ca máy:", error);
    throw error.response?.data || { message: "Lỗi tải thống kê ca máy" };
  }
};

// Lấy thông tin thời gian máy chạy, dừng, mất kết nối theo ca
export const getMachineStatusTimes = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getMachineStatusTimes params:", params);
    const res = await api.get(`/api/v1/chart/machine-status-times`, { params });
    console.log(">>> [API RESPONSE RECEIVED] getMachineStatusTimes data length:", res.data?.length);
    return res.data;
  } catch (error) {
    console.error("[getMachineStatusTimes] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu trạng thái máy" };
  }
};

// Lấy tổng hợp thời gian máy chạy, dừng, mất kết nối theo tháng
export const getMachineStatusTimesByMonth = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getMachineStatusTimesByMonth params:", params);
    const res = await api.get(`/api/v1/chart/machine-status-times-month`, { params });
    console.log(">>> [API RESPONSE RECEIVED] getMachineStatusTimesByMonth data:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getMachineStatusTimesByMonth] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu trạng thái máy theo tháng" };
  }
};

// Lấy tổng hợp thời gian máy chạy, dừng, mất kết nối theo năm (Mới)
export const getMachineStatusTimesByYear = async (params = {}) => {
  try {
    console.log(">>> [API CALL CALLER] getMachineStatusTimesByYear params:", params);
    const res = await api.get(`/api/v1/chart/machine-status-times-year`, { params });
    console.log(">>> [API RESPONSE RECEIVED] getMachineStatusTimesByYear data length:", res.data?.length);
    return res.data;
  } catch (error) {
    console.error("[getMachineStatusTimesByYear] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải dữ liệu trạng thái máy theo năm" };
  }
};

// Lấy ảnh hiển thị của máy
export const getViewOrcThMachineImageApi = async () => {
  try {
    const res = await api.get("/api/view-orc-th-machine-image");
    return res.data;
  } catch (error) {
    console.error("[getViewOrcThMachineImageApi] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải ảnh máy" };
  }
};

// Lấy ảnh nhị phân DRC trực tiếp từ backend: GET /drc-image/raw (hoặc /api/thanhhinh/drc-image/raw)
export const getDrcMachineImageRaw = async () => {
  try {
    console.log(">>> [thanhhinhApi Test Log] Đang gọi API getDrcMachineImageRaw lấy ảnh nhà máy DRC...");
    const endpoints = [
      "/api/thanhhinh/drc-image/raw",
      "/api/thanhhinh/machine/drc-image/raw",
      "/drc-image/raw",
      "/api/drc-image/raw"
    ];

    for (const url of endpoints) {
      try {
        const res = await api.get(url, { responseType: "blob" });
        if (res && res.data && res.data.size > 0) {
          const blobUrl = URL.createObjectURL(res.data);
          console.log(`>>> [thanhhinhApi Test Log] getDrcMachineImageRaw thành công từ ${url} (${res.data.size} bytes) -> Blob URL:`, blobUrl);
          return blobUrl;
        }
      } catch (e) {
        // Tiếp tục thử URL tiếp theo
      }
    }

    console.warn(">>> [thanhhinhApi Test Log] Không lấy được blob ảnh DRC từ các endpoint raw.");
    return null;
  } catch (error) {
    console.error("[getDrcMachineImageRaw] Lỗi tải ảnh DRC:", error);
    return null;
  }
};
