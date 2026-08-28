import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Khởi tạo userInfo trực tiếp từ localStorage (nếu có) để tránh race-condition render lần đầu bị null
  const [userInfo, setUserInfo] = useState(() => {
    const token = localStorage.getItem("jwt");
    const storedUser = localStorage.getItem("userInfo");
    if (token && token.includes(".") && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("[Auth] Parse userInfo ban đầu lỗi:", e);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Hàm kiểm tra token còn hạn
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      const valid = payload.exp > currentTime;
      console.log("[Auth] Token check:", valid ? "CÒN HẠN" : "HẾT HẠN", "exp:", payload.exp);
      return valid;
    } catch (e) {
      console.error("[Auth] Decode token lỗi:", e);
      return false;
    }
  };

  // Load auth khi app khởi động
  useEffect(() => {
    console.log("[Auth] Load auth lúc khởi động");
  
    const token = localStorage.getItem("jwt");
    let storedUser = localStorage.getItem("userInfo");
  
    // CHỈ XỬ LÝ NẾU TOKEN THỰC SỰ HỢP LỆ VÀ CÓ CHỨA DẤU CHẤM JWT
    if (token && token.includes(".") && isTokenValid(token)) {
      let parsedUser = null;
  
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
          console.log("[Auth] Load userInfo từ storage:", parsedUser.username);
        } catch (e) {
          console.error("[Auth] Parse userInfo lỗi:", e);
        }
      }
  
      if (!parsedUser) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const usernameFromToken = payload.sub || "Người dùng";
          parsedUser = { username: usernameFromToken, fullName: usernameFromToken };
          console.log("[Auth] Decode user tạm từ token:", parsedUser.username);
        } catch (e) {
          console.error("[Auth] Decode user từ token lỗi:", e);
        }
      }
  
      if (parsedUser) {
        setUserInfo(parsedUser);
      } else {
        setUserInfo(null);
      }
    } else {
      // 🌟 SỬA TẠI ĐÂY: Nếu không có token, chỉ đơn giản set userInfo về null.
      // Tuyệt đối không gọi hàm logout() ở đây để tránh kích hoạt vòng lặp vô hạn khi đang ở trang Login.
      console.log("[Auth] Không có token hợp lệ ban đầu -> Trạng thái: Chưa đăng nhập");
      setUserInfo(null);
    }
  
    setLoading(false);
  }, []);

  // Đồng bộ storage khi userInfo thay đổi (Chỉ đồng bộ khi đã tải xong trạng thái loading ban đầu)
  useEffect(() => {
    if (loading) return; // Chặn chạy khi app đang loading lúc khởi tạo để tránh xóa nhầm userInfo
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      // Chỉ xóa userInfo, KHÔNG xóa jwt
      localStorage.removeItem("userInfo");
      sessionStorage.removeItem("userInfo");
      console.log("[Auth] userInfo null → chỉ xóa userInfo, giữ token");
    }
  }, [userInfo, loading]);

  // Logout chủ động (xóa cả token và userInfo)
  const logout = () => {
    console.log("[Auth] Logout chủ động");
    localStorage.removeItem("jwt");
    localStorage.removeItem("userInfo");
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("userInfo");
    setUserInfo(null);
  };

  // Bắt event logout từ interceptor (nếu có)
  useEffect(() => {
    const handleGlobalLogout = () => {
      console.log("[Auth] Nhận event auth-logout");
      logout();
    };
    window.addEventListener("auth-logout", handleGlobalLogout);
    return () => window.removeEventListener("auth-logout", handleGlobalLogout);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang kiểm tra đăng nhập...</div>;
  }

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);