// src/api/dashboardApi.js
import api from "./axios";

const BASE_PATH = "/api/dashboard";

// Backend: GET /api/dashboard/stats?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
// Giữ tương thích: nếu ai đó vẫn truyền (nam_sx, thang_sx) hoặc object params cũ,
// thì ưu tiên fromDate/toDate nếu có.
export const getDashboardStats = async (arg1, arg2) => {
  const params =
    typeof arg1 === "object" && arg1
      ? arg1
      : { fromDate: arg1, toDate: arg2 };

  const fromDate = params.fromDate;
  const toDate = params.toDate;

  if (!fromDate || !toDate) {
    console.warn("[getDashboardStats] Thiếu fromDate/toDate");
    return null;
  }

  try {
    const res = await api.get(`${BASE_PATH}/stats`, { params: { fromDate, toDate } });
    return res.data;
  } catch (error) {
    console.error("[getDashboardStats] Lỗi:", error);
    return null; // Trả null để component tự xử lý (không throw)
  }
};