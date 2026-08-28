// src/api/baoCaoNhapKhoApi.js
import api from "./axios";

const BASE_PATH = "/api/baocao-nhapkho";

// API 1: Không theo máy
export const getBaoCaoNhapKhoKhongTheoMay = async (params = {}) => {
  const {
    idKehoach = "",
    namThangNgayCaStart,
    namThangNgayCaEnd,
    storeId = "",
    maMay = "",
  } = params;

  if (!namThangNgayCaStart || !namThangNgayCaEnd) {
    throw new Error("namThangNgayCaStart và namThangNgayCaEnd là bắt buộc");
  }

  try {
    const res = await api.get(`${BASE_PATH}/khong-theo-may`, {
      params: {
        idKehoach,
        namThangNgayCaStart,
        namThangNgayCaEnd,
        storeId,
        maMay,
      },
    });
    console.log("[API KhongTheoMay] Response:", res.data);
    return res.data; // { success, message, data: [[...]], totalElements }
  } catch (error) {
    console.error("[getBaoCaoNhapKhoKhongTheoMay] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải báo cáo không theo máy" };
  }
};

// API 2: Theo máy
export const getBaoCaoNhapKhoTheoMay = async (params = {}) => {
  const {
    idKehoach = "",
    namThangNgayCaStart,
    namThangNgayCaEnd,
    storeId = "",
    maMay = "",
  } = params;

  if (!namThangNgayCaStart || !namThangNgayCaEnd) {
    throw new Error("namThangNgayCaStart và namThangNgayCaEnd là bắt buộc");
  }

  try {
    const res = await api.get(`${BASE_PATH}/theo-may`, {
      params: {
        idKehoach,
        namThangNgayCaStart,
        namThangNgayCaEnd,
        storeId,
        maMay,
      },
    });
    console.log("[API TheoMay] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[getBaoCaoNhapKhoTheoMay] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải báo cáo theo máy" };
  }
};
export const getEquipmentNames = async () => {
  try {
    const res = await api.get('/api/equipment/names');
    console.log("[API EquipmentNames] Response:", res.data);
    return res.data; // [{ id: "...", name: "Máy thành hình 01" }, ...]
  } catch (error) {
    console.error("[getEquipmentNames] Lỗi:", error);
    throw error.response?.data || { message: "Lỗi tải danh sách máy" };
  }
};