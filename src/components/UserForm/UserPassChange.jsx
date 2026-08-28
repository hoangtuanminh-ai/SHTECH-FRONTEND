import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserPassChange() {
  const [oldPassword, setOldPassword] = useState(""); // Mật khẩu cũ
  const [newPassword, setNewPassword] = useState(""); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu mới
  const [errors, setErrors] = useState({}); // Lưu lỗi validate
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    success: false,
  }); // State popup thông báo
  const navigate = useNavigate();

  // Lấy token từ localStorage/sessionStorage
  const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!oldPassword) newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ";
    if (!newPassword)
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    else if (newPassword.length < 6)
      newErrors.newPassword = "Mật khẩu mới phải >= 6 ký tự";
    if (confirmPassword !== newPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Gọi API đổi mật khẩu
        const res = await axios.post(
          "http://localhost:8080/api/auth/change-password",
          { oldPassword, newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPopup({ show: true, message: res.data, success: true });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        setPopup({
          show: true,
          message: err.response?.data?.error || "Đổi mật khẩu thất bại",
          success: false,
        });
      }
    }
  };

  // Đóng popup, nếu thành công redirect về login
  const handleClosePopup = () => {
    setPopup({ show: false, message: "", success: false });
    if (popup.success) navigate("/login");
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold text-[#9c5136] mb-6 border-b border-[#9c5136]/30">
        Thay đổi mật khẩu
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Mật khẩu cũ */}
        <div>
          <label className="block mb-1 mt-2 text-sm font-medium">
            Nhập mật khẩu cũ :
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Nhập mật khẩu cũ"
            className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          {errors.oldPassword && (
            <p className="text-red-500 text-sm">{errors.oldPassword}</p>
          )}
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block mb-1 mt-2 text-sm font-medium">
            Nhập mật khẩu mới :
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword}</p>
          )}
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Nhập lại mật khẩu mới :
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

        <button
          type="submit"
          className="w-full bg-[#A0522D] text-white py-2 my-2 rounded-md hover:bg-[#8B4513] transition"
        >
          Gửi
        </button>
      </form>

      {/* Popup thông báo */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center animate-zoomIn">
            <h3
              className={`text-lg font-semibold mb-4 ${
                popup.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {popup.success ? "Thành công" : "Lỗi"}
            </h3>
            <p className="text-gray-600 mb-6">{popup.message}</p>
            <button
              onClick={handleClosePopup}
              className="w-full bg-[#A0522D] text-white py-2 rounded-md hover:bg-[#8B4513] transition"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
