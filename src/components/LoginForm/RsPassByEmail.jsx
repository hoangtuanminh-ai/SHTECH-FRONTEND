import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function RsPassByEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Lấy token từ URL
  console.log("TOKEN:", token);
  const navigate = useNavigate();

  // ====== State ======
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // ====== Validate form ======
  const validate = () => {
    const newErrors = {};
    if (!password) newErrors.password = "Mật khẩu không được để trống";
    else if (password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (confirmPassword !== password)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    return newErrors;
  };

  // ====== Handle submit ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const newErrors = validate();
    setErrors(newErrors);

    if (!token) {
      setApiError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
      return;
    }

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/reset-password",
          {
            token,
            newPassword: password,
          }
        );

        if (response.status === 200) {
          setShowPopup(true);
        }
      } catch (error) {
        setApiError(
          error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại"
        );
      }
    }
  };

  // ====== Xử lý popup ======
  const handleConfirm = () => {
    setShowPopup(false);
    navigate("/login");
  };

  // ====== Nếu không có token ======
  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Link đặt lại mật khẩu không hợp lệ
          </h2>
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-medium text-gray-700 mb-4">
          Đặt mật khẩu mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mật khẩu mới:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Xác nhận mật khẩu:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

          <button
            type="submit"
            className="w-full bg-[#A0522D] text-white py-2 rounded-md hover:bg-[#8B4513] transition cursor-pointer"
          >
            Xác nhận
          </button>
        </form>

        {/* Popup thành công */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Đổi mật khẩu thành công!
              </h3>
              <button
                onClick={handleConfirm}
                className="w-full bg-[#A0522D] text-white py-2 rounded-md hover:bg-[#8B4513] transition cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
