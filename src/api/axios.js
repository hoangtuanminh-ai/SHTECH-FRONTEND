import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  withCredentials: false,
});

// Request interceptor: attach token + locale + log debug
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[REQUEST] Attach token OK:", config.url);
    } else {
      console.log("[REQUEST] Không có token:", config.url);
    }

    const currentLocale = localStorage.getItem("locale") || "vi";
    config.params = config.params || {};
    config.params.locale = currentLocale;
    config.headers["Accept-Language"] = currentLocale;

    return config;
  },
  (error) => {
    console.error("[REQUEST ERROR]:", error);
    return Promise.reject(error);
  }
);

// Hàm kiểm tra token còn hạn
function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    const valid = payload.exp > currentTime;
    console.log("[TOKEN CHECK] Token valid:", valid, "| exp:", payload.exp, "| current:", currentTime);
    return valid;
  } catch (e) {
    console.error("[TOKEN DECODE ERROR]:", e);
    return false;
  }
}

// Response interceptor: KHÔNG xóa token tự động, chỉ retry nếu token còn hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("[RESPONSE ERROR] Status:", error.response?.status, "URL:", error.config?.url);

    // Xử lý 401/403 (không phải login)
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login")
    ) {
      originalRequest._retry = true;

      const token = localStorage.getItem("jwt");

      if (!token || !isTokenValid(token)) {
        console.warn("[401/403] Token invalid hoặc hết hạn, nhưng KHÔNG tự logout");
        // KHÔNG gọi triggerLogout() nữa để tránh xóa token khi reload
        return Promise.reject(error);
      }

      // Token còn hạn → retry request
      console.log("[RETRY] Token còn hạn, retry request:", originalRequest.url);
      return api(originalRequest);
    }

    // Các lỗi khác → reject bình thường, không can thiệp
    return Promise.reject(error);
  }
);

// Hàm logout CHỦ ĐỘNG (chỉ gọi từ nút Logout, không tự động)
function triggerLogout(source = "unknown") {
  console.log("[LOGOUT CHỦ ĐỘNG] Gọi từ:", source);
  localStorage.removeItem("jwt");
  localStorage.removeItem("userInfo");
  window.dispatchEvent(new Event("auth-logout"));

  if (window.location.pathname !== "/login") {
    window.location.href = "/login?reason=expired";
  }
}

export default api;