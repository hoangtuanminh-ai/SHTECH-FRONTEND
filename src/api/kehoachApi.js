// src/api/kehoachApi.js
import api from "./axios";

// Base path của API kế hoạch
const BASE_PATH = "/api/thanhhinh/kehoach";

// 2.1 Lấy kế hoạch theo ID_Kehoach (phân trang)
export const getKeHoachById = async (idKehoach, params = {}) => {
  // params sẽ chứa: page, size, sort,...
  try {
    const res = await api.get(`${BASE_PATH}/${idKehoach}`, { params });
    return res.data; // { success, message, data: [], totalElements, totalPages, ... }
  } catch (error) {
    console.error(`[getKeHoachById] Lỗi khi lấy kế hoạch ID ${idKehoach}:`, error);
    throw error.response?.data || { message: "Lỗi hệ thống khi lấy kế hoạch theo ID" };
  }
};

// 2.2 Lấy danh sách kế hoạch theo năm/tháng/ngày/ca (phân trang)
export const getKeHoachList = async (filters = {}, params = {}) => {
  // filters: { nam_sx, thang_sx, ngay_sx?, ca_sx? }
  // params: { page, size, sort }
  const { nam_sx, thang_sx, ngay_sx, ca_sx } = filters;

  if (!nam_sx || !thang_sx) {
    throw new Error("nam_sx và thang_sx là bắt buộc");
  }

  const queryParams = {
    nam_sx,
    thang_sx,
    ...(ngay_sx !== undefined && ngay_sx !== "" ? { ngay_sx } : {}),
    ...(ca_sx !== undefined && ca_sx !== "" ? { ca_sx } : {}),
    ...params, // page, size, sort sẽ override nếu có
  };

  try {
    const res = await api.get(BASE_PATH, { params: queryParams });
    return res.data;
  } catch (error) {
    console.error("[getKeHoachList] Lỗi khi lấy danh sách kế hoạch:", error);
    throw error.response?.data || { message: "Lỗi khi tải danh sách kế hoạch" };
  }
  
};
export const getKeHoachDetail = async (idKehoachMamayQc) => {
    try {
      const res = await api.get(`${BASE_PATH}/detail/${idKehoachMamayQc}`);
      return res.data; // { success, message, data: { ...chi tiết 1 bản ghi... } }
    } catch (error) {
      console.error(`[getKeHoachDetail] Lỗi khi lấy chi tiết ID ${idKehoachMamayQc}:`, error);
      throw error.response?.data || { message: "Không thể lấy chi tiết kế hoạch" };
    }
  };
  export const getKeHoachListAll = async (filters = {}) => {
    const { nam_sx, thang_sx, ngay_sx, ca_sx } = filters;
  
    // Kiểm tra bắt buộc ngay ở frontend để tránh lỗi backend
    if (!nam_sx || !thang_sx) {
      throw new Error("nam_sx và thang_sx là bắt buộc để gọi API /all");
    }
  
    const queryParams = {
      nam_sx,
      thang_sx,
      ...(ngay_sx !== undefined && ngay_sx !== "" ? { ngay_sx } : {}),
      ...(ca_sx !== undefined && ca_sx !== "" ? { ca_sx } : {}),
    };
  
    try {
      const res = await api.get(`${BASE_PATH}/all`, { params: queryParams });
      console.log('API /all gọi thành công với params:', queryParams);
      console.log('Response /all:', res.data);
      return res.data;
    } catch (error) {
      console.error("[getKeHoachList /all] Lỗi:", error);
      if (error.response?.status === 400) {
        console.error("Backend báo thiếu tham số nam_sx hoặc thang_sx");
      }
      throw error.response?.data || { message: "Lỗi tải toàn bộ kế hoạch" };
    }
  };
  export const getKeHoachTrend = async (namSx = null, maMay = null) => {
    try {
      const params = {};
      if (namSx) params.namSx = namSx;
      if (maMay) params.maMay = maMay;
      console.log(`[kehoachApi] getKeHoachTrend gọi API: namSx=${namSx}, maMay=${maMay}`);
      const res = await api.get(`${BASE_PATH}/trend`, { params });
      return res.data; // { success, message, data: [...], totalMonths }
    } catch (error) {
      console.error("[getKeHoachTrend] Lỗi:", error);
      throw error.response?.data || { message: "Không thể tải dữ liệu xu hướng tháng" };
    }
  };
  
  // Lấy dữ liệu tỷ lệ sản xuất theo quy cách (cho pie chart)
  export const getProductionPieRatio = async (nam_sx, thang_sx) => {  // bỏ ca_sx
    if (!nam_sx || !thang_sx) {
      throw new Error("nam_sx và thang_sx là bắt buộc");
    }
  
    const params = { nam_sx, thang_sx };
  
    try {
      const res = await api.get(`${BASE_PATH}/pie-production-ratio`, { params });
      return res.data;
    } catch (error) {
      console.error("[getProductionPieRatio] Lỗi:", error);
      throw error.response?.data || { message: "Không thể tải dữ liệu tỷ lệ" };
    }
  };
  export const getWeeklyProgress = async (nam_sx, thang_sx) => {
    if (!nam_sx || !thang_sx) {
      throw new Error("nam_sx và thang_sx là bắt buộc");
    }
  
    const params = { nam_sx, thang_sx };
  
    try {
      const res = await api.get(`${BASE_PATH}/weekly-progress`, { params });
      console.log('API /weekly-progress gọi thành công với params:', params);
      console.log('Response /weekly-progress:', res.data);
      return res.data;
    } catch (error) {
      console.error("[getWeeklyProgress] Lỗi:", error);
      throw error.response?.data || { message: "Không thể tải dữ liệu tiến độ tuần" };
    }
  };
  // api/kehoachApi.js

// (Tùy chọn) Nếu sau này có thêm API tạo/sửa/xóa kế hoạch thì bổ sung ở đây
export const createBulkKeHoach = async (data) => {
  try {
    const res = await api.post(`${BASE_PATH}/bulk-save`, data);
    return res.data;
  } catch (error) {
    console.error("[createBulkKeHoach] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi hệ thống khi lưu kế hoạch" };
  }
};
// Ví dụ:
// export const updateKeHoach = async (id, data) => { ... }
// export const deleteKeHoach = async (id) => { ... }
