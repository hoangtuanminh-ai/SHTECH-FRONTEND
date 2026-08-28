import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { userInfo, loading } = useAuth();
  const location = useLocation();

  // 1. Nếu AuthContext đang trong quá trình check Token (loading = true)
  // thì trả về null hoặc loading spinner để không bị đá sang Login nhầm
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang xác thực...</div>;
  }

  // 2. Nếu đã check xong mà không có userInfo (Token hết hạn hoặc không có)
  if (!userInfo) {
    // Lưu lại vị trí trang người dùng đang định vào để sau khi Login xong quay lại đúng trang đó
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nếu hợp lệ thì cho qua
  return children;
}