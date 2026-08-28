import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa"; // Thêm icon để toggle menu mobile

export default function UserPage() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State cho menu mobile

  const { userInfo, setUserInfo } = useAuth();

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-red-500 text-lg font-medium">
          Bạn chưa đăng nhập.
        </p>
      </div>
    );
  }

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    sessionStorage.removeItem("jwt");
    setUserInfo(null);
    navigate("/login");
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Danh sách menu để dễ tái sử dụng
  const menuItems = [
    { to: "/userPage/userInfo", label: "Thông tin tài khoản" },
    { to: "/userPage/orderHistory", label: "Lịch sử mua hàng" },
    // { to: "/userPage/address", label: "Danh sách địa chỉ" },
    { to: "/userPage/passChange", label: "Thay đổi mật khẩu" },
    { to: "/userPage/userSupport", label: "Hỗ trợ khách hàng" },
    ...(userInfo.role === "ADMIN"
      ? [{ to: "/admin/dashboard", label: "Trang quản trị" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Container chính */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#9c5136] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#9c5136]">
                {userInfo.fullName || "Người dùng"}
              </h2>
              <p className="text-sm text-gray-600">Tài khoản của bạn</p>
            </div>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="text-[#9c5136] text-2xl"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Layout chính */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Sidebar - Mobile: ẩn/mở, Desktop: luôn hiện */}
          <aside
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } lg:block w-full lg:w-80 bg-gradient-to-b from-[#9c5136]/5 to-transparent p-6 lg:p-8 border-r border-gray-200`}
          >
            {/* Avatar & Tên (Desktop) */}
            <div className="hidden lg:flex flex-col items-center mb-8">
              <div className="w-28 h-28 rounded-full bg-[#9c5136] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "?"}
              </div>
              <h2 className="mt-4 text-xl font-bold text-[#9c5136]">
                {userInfo.fullName || "Người dùng"}
              </h2>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)} // Đóng menu mobile khi chọn
                  className="block px-4 py-3 text-base font-medium text-[#9c5136] hover:bg-[#9c5136]/10 hover:text-[#7a3f2a] rounded-lg transition-all duration-200 border-b border-dotted border-[#9c5136]/20 last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}

              {/* Nút Đăng xuất */}
              <button
                onClick={() => {
                  handleOpenPopup();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 mt-4"
              >
                Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-10">
            <Outlet context={{ userInfo, setUserInfo }} />
          </main>
        </div>
      </div>

      {/* Popup xác nhận đăng xuất */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              Bạn có chắc chắn muốn đăng xuất?
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
              <button
                onClick={handleClosePopup}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium order-2 sm:order-1"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-[#9c5136] text-white rounded-xl hover:bg-[#7a3f2a] transition font-medium order-1 sm:order-2"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}