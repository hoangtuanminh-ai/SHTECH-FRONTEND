import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// Hàm parse an toàn, tránh crash khi storage chứa "undefined" hoặc "null"
function safeParse(jsonString) {
  if (!jsonString || jsonString === "undefined" || jsonString === "null") {
    return null;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Lỗi parse userInfo từ storage:", error);
    // Xóa key lỗi để tránh lặp lại crash
    localStorage.removeItem("userInfo");
    sessionStorage.removeItem("userInfo");
    return null;
  }
}

export default function LayoutRoot() {
  const [userInfo, setUserInfo] = useState(() => {
    // Đọc từ local trước, rồi session nếu không có
    const local = safeParse(localStorage.getItem("userInfo"));
    const session = safeParse(sessionStorage.getItem("userInfo"));
    return local || session || null;
  });

  const location = useLocation();

  // Đồng bộ userInfo với storage khi thay đổi
  useEffect(() => {
    // Bỏ qua nếu đang ở trang reset password by email (theo logic cũ của bạn)
    if (location.pathname.startsWith("/rspassbyemail")) return;

    if (userInfo && typeof userInfo === "object" && Object.keys(userInfo).length > 0) {
      // Chỉ lưu nếu userInfo là object hợp lệ
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      // Nếu muốn ưu tiên sessionStorage cho "không nhớ tài khoản", có thể điều chỉnh ở đây
    } else {
      // Xóa cả hai storage khi logout hoặc userInfo null
      localStorage.removeItem("userInfo");
      sessionStorage.removeItem("userInfo");
    }
  }, [userInfo, location.pathname]); // Thêm location.pathname vào dependency nếu cần

  return (
    <>
      <Outlet context={{ userInfo, setUserInfo }} />
    </>
  );
}