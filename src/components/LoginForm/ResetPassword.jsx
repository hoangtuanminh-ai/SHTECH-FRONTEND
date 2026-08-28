import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  // ====== State lưu dữ liệu form ======
  const [email, setEmail] = useState(""); // Email người dùng nhập
  const [errors, setErrors] = useState({}); // Lưu lỗi validate
  const [apiError, setApiError] = useState(""); // Lưu lỗi trả về từ API
  const [showPopup, setShowPopup] = useState(false); // Hiển thị popup thông báo thành công
  const navigate = useNavigate(); // Dùng để chuyển hướng sang trang login

  // ====== Hàm validate email ======
  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    return newErrors; // Trả về object lỗi
  };

  // ====== Xử lý submit form ======
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn reload trang
    const newErrors = validate(); // Validate email
    setErrors(newErrors); // Hiển thị lỗi validate
    setApiError(""); // Reset lỗi API cũ

    if (Object.keys(newErrors).length === 0) {
      try {
        // Gọi API gửi link khôi phục mật khẩu
        const response = await axios.post(
          "http://localhost:8080/api/auth/forgot-password",
          {
            email,
          }
        );

        // Nếu API trả về 200 thì hiện popup thành công
        if (response.status === 200) {
          setShowPopup(true);
        }
      } catch (error) {
        // Lấy lỗi từ API nếu có, hoặc thông báo lỗi chung
        setApiError(error.response?.data?.error || "Có lỗi xảy ra");
      }
    }
  };

  // ====== Xử lý khi nhấn xác nhận popup ======
  const handleConfirm = () => {
    setShowPopup(false); // Ẩn popup
    navigate("/login"); // Chuyển về trang login
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 mb-6 w-full max-w-md">
        <h2 className="text-center text-2xl mb-4 text-gray-800">
          Khôi phục mật khẩu
        </h2>

        {/* ====== Form nhập email ====== */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Nhập Email của bạn:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Cập nhật state email
              placeholder="Nhập email"
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {/* Hiển thị lỗi validate */}
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
            {/* Hiển thị lỗi trả về từ API */}
            {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
          </div>

          <p className="text-center text-sm text-gray-600">
            Hệ thống sẽ gửi link khôi phục đến email của bạn.
          </p>

          <button
            type="submit"
            className="w-full bg-[#A0522D] text-white py-2 rounded-md hover:bg-[#8B4513] transition cursor-pointer"
          >
            Khôi phục
          </button>
        </form>

        {/* Link quay lại Login */}
        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-500 hover:underline">
            TRỞ LẠI ĐĂNG NHẬP
          </Link>
        </div>

        {/* ====== Popup thông báo gửi email thành công ====== */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Gửi thành công!
              </h3>
              <p className="text-gray-600 mb-6">
                Xin hãy vui lòng kiểm tra lại Email của bạn!
              </p>
              <button
                onClick={handleConfirm} // Nhấn xác nhận đóng popup và chuyển login
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