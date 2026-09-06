import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";

// Components & Layout
import LayoutRoot from "./components/LayoutRoot.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import ScrollToTop from "./components/ScrollToTop.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // Nhớ tạo file này như hướng dẫn trước

// Auth Pages
import LoginForm from "./components/LoginForm/LoginForm.jsx";
import RegisterForm from "./components/LoginForm/RegisterForm.jsx";
import ResetPassword from "./components/LoginForm/ResetPassword.jsx";
import RsPassByEmail from "./components/LoginForm/RsPassByEmail.jsx";

// User Pages
import UserInfo from "./components/UserForm/UserInfo.jsx";
import UserPage from "./components/UserForm/UserPage.jsx";
import UserPassChange from "./components/UserForm/UserPassChange.jsx";

// Business Pages
import Index from "./pages/Homepage/Index";
import KeHoachTable from "./pages/KeHoach/KeHoachTable.jsx";
import LapKeHoachCaNgay from "./pages/KeHoach/LapKeHoachCaNgay.jsx";
import ThanhHinhTable from "./pages/ThanhHinh/ThanhHinhTable.jsx";
import DashboardKeHoach from "./pages/Homepage/DashboardKeHoach.jsx";
import DashboardCatVai from "./pages/Homepage/DashboardCatVai.jsx";
import MayThanhHinhList from "./pages/ThanhHinh/MayThanhHinhList.jsx";
import KeHoachSanXuatNam from "./pages/Dashboard/KeHoachSanXuatNam.jsx";
import KeHoachSanXuatThang from "./pages/Dashboard/KeHoachSanXuatThang.jsx";
import KeHoachSanXuatCaThang from "./pages/Dashboard/KeHoachSanXuatCaThang.jsx";
import SanXuatThangNam from "./pages/Dashboard/SanXuatThangNam.jsx";
import SanXuat5Nam from "./pages/Dashboard/SanXuat5Nam.jsx";
import TrangThaiMayNgay from "./pages/Dashboard/TrangThaiMayNgay.jsx";
import TrangThaiMayThang from "./pages/Dashboard/TrangThaiMayThang.jsx";
import TrangThaiMayNam from "./pages/Dashboard/TrangThaiMayNam.jsx";
import MayThanhHinhDashboard from "./pages/ThanhHinh/MayThanhHinhDashboard.jsx";
import MayCatVaiDashboard from "./pages/ThanhHinh/MayCatVaiDashboard.jsx";
import BaoCaoKHSX from "./pages/BaoCaoKHSX/BaoCaoKHSX.jsx";
import BaoCaoKHSXThang from "./pages/BaoCaoKHSX/BaoCaoKHSXThang.jsx";
import BaoCaoKHSXThangTongHop from "./pages/BaoCaoKHSX/BaoCaoKHSXThangTongHop.jsx";
import BaoCaoNhapKhoKhongTheoMay from "./pages/BaoCaoKHSX/BaoCaoNhapKhoKhongTheoMay.jsx";
import BaoCaoNhapKhoTheoMay from "./pages/BaoCaoKHSX/BaoCaoNhapKhoTheoMay.jsx";
import ViewOrcThanhHinhNhap from "./pages/BaoCaoKHSX/ViewOrcThanhHinhNhap.jsx";
import ThongKeLopKscl from "./pages/BaoCaoKHSX/ThongKeLopKscl.jsx";
import ThongKePhanLoaiChatLuong from "./pages/BaoCaoKHSX/ThongKePhanLoaiChatLuong.jsx";
import ThongKeKhongTinhLopTraXuLy from "./pages/BaoCaoKHSX/ThongKeKhongTinhLopTraXuLy.jsx";
import ThongKeTheoNgayCom from "./pages/BaoCaoKHSX/ThongKeTheoNgayCom.jsx";
import NhapKhoChiTietLop from "./pages/BaoCaoKHSX/NhapKhoChiTietLop.jsx";
import LopThanhPhamTemporary from "./pages/BaoCaoKHSX/LopThanhPhamTemporary.jsx";
import LopThanhPhamLoiMaVach from "./pages/BaoCaoKHSX/LopThanhPhamLoiMaVach.jsx";
import LopXuLyChuaNhapKho from "./pages/BaoCaoKHSX/LopXuLyChuaNhapKho.jsx";
import BaoCaoTongHopChiTiet from "./pages/BaoCaoKHSX/BaoCaoTongHopChiTiet.jsx";
import BaoCaoKeHoachThang from "./pages/BaoCaoKHSX/BaoCaoKeHoachThang.jsx";
import BaoCaoLopTraXuLyNhapKho from "./pages/BaoCaoKHSX/BaoCaoLopTraXuLyNhapKho.jsx";
import BaoCaoKeHoachThangKhongTheoMay from "./pages/BaoCaoKHSX/BaoCaoKeHoachThangKhongTheoMay.jsx";
import BaoCaoKeHoachThangCa from "./pages/BaoCaoKHSX/BaoCaoKeHoachThangCa.jsx";
import LapKiemKeTonKho from "./pages/KiemKe/LapKiemKeTonKho.jsx";
import LapKeHoachThang from "./pages/KeHoach/LapKeHoachThang.jsx";
import DanhSachLopTHLH from "./pages/ThanhHinh/DanhSachLopTHLH.jsx";
import DanhSachKhoiLuongLop from "./pages/ThanhHinh/DanhSachKhoiLuongLop.jsx";
import BaoCaoLopTraXuLyNhapKhoKeHoachThang from "./pages/BaoCaoKHSX/BaoCaoLopTraXuLyNhapKhoKeHoachThang.jsx";
import ViewDrcLoaiKhuyetTat from "./pages/BaoCaoKHSX/ViewDrcLoaiKhuyetTat.jsx";
import KeHoachCatVaiTable from "./pages/ThanhHinh/KeHoachCatVaiTable.jsx";
import BaoCaoKHSXCatVaiCa from "./pages/ThanhHinh/BaoCaoKHSXCatVaiCa.jsx";
import BaoCaoKHSXCatVaiThang from "./pages/ThanhHinh/BaoCaoKHSXCatVaiThang.jsx";
import BaoCaoNhapKhoCatVaiXe from "./pages/ThanhHinh/BaoCaoNhapKhoCatVaiXe.jsx";
import BaoCaoTongHopCatVai from "./pages/ThanhHinh/BaoCaoTongHopCatVai.jsx";
import BaoCaoTongHopTheoCa from "./pages/ThanhHinh/BaoCaoTongHopTheoCa.jsx";
import BaoCaoTongHopTheoCaNgay from "./pages/ThanhHinh/BaoCaoTongHopTheoCaNgay.jsx";
import BaoCaoTongHopTheoCaMay from "./pages/ThanhHinh/BaoCaoTongHopTheoCaMay.jsx";
// Styles
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * Component phụ trợ để quản lý hiển thị Sidebar
 * Chỉ hiện Sidebar khi đã có userInfo (đã login)
 */
const AppContent = () => {
  const { userInfo } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Chỉ hiển thị Navbar nếu đã đăng nhập */}
      {userInfo && <Navbar />}

      {/* Căn lề trái và thụt đầu trên mobile dưới topbar DRC System */}
      <main className={`
        flex-1 
        ${userInfo ? "md:ml-64 pt-[42px] md:pt-0" : "ml-0"} 
        p-0 
        overflow-y-auto
        transition-all duration-300
      `}>
        <Routes>
          {/* --- ROUTES CÔNG KHAI (Không cần login) --- */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/resetpass" element={<ResetPassword />} />
          <Route path="/rspassbyemail" element={<RsPassByEmail />} />

          {/* --- ROUTES BẢO VỆ (Bắt buộc login) --- */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />

          {/* User Pages */}
          <Route path="/userPage" element={<ProtectedRoute><UserPage /></ProtectedRoute>}>
            <Route index element={<UserInfo />} />
            <Route path="userInfo" element={<UserInfo />} />
            <Route path="passChange" element={<UserPassChange />} />
          </Route>

          {/* Dashboard & Báo cáo */}
          <Route path="/dashboard">
            <Route path="lap-ke-hoach" element={<ProtectedRoute><LapKeHoachCaNgay /></ProtectedRoute>} />
            <Route path="ke-hoach" element={<ProtectedRoute><KeHoachTable /></ProtectedRoute>} />
            <Route path="thanh-hinh" element={<ProtectedRoute><ThanhHinhTable /></ProtectedRoute>} />
            <Route path="ke-hoach-TH" element={<ProtectedRoute><DashboardKeHoach /></ProtectedRoute>} />
            <Route path="dashboard-catvai" element={<ProtectedRoute><DashboardCatVai /></ProtectedRoute>} />
            <Route path="may-thanh-hinh" element={<ProtectedRoute><MayThanhHinhList /></ProtectedRoute>} />
            <Route path="ke-hoach-san-xuat-nam" element={<ProtectedRoute><KeHoachSanXuatNam /></ProtectedRoute>} />
            <Route path="ke-hoach-san-xuat-thang" element={<ProtectedRoute><KeHoachSanXuatThang /></ProtectedRoute>} />
            <Route path="ke-hoach-san-xuat-ca-thang" element={<ProtectedRoute><KeHoachSanXuatCaThang /></ProtectedRoute>} />
            <Route path="san-xuat-5-nam" element={<ProtectedRoute><SanXuat5Nam /></ProtectedRoute>} />
            <Route path="san-xuat-10-nam" element={<ProtectedRoute><SanXuat5Nam /></ProtectedRoute>} />
            <Route path="trang-thai-may-ngay" element={<ProtectedRoute><TrangThaiMayNgay /></ProtectedRoute>} />
            <Route path="trang-thai-may-thang" element={<ProtectedRoute><TrangThaiMayThang /></ProtectedRoute>} />
            <Route path="trang-thai-may-nam" element={<ProtectedRoute><TrangThaiMayNam /></ProtectedRoute>} />
            <Route path="may-thanh-hinh/:equipmentId" element={<ProtectedRoute><MayThanhHinhDashboard /></ProtectedRoute>} />
            <Route path="may-cat-vai/:equipmentId" element={<ProtectedRoute><MayCatVaiDashboard /></ProtectedRoute>} />
            <Route path="ke-hoach-cat-vai" element={<ProtectedRoute><KeHoachCatVaiTable /></ProtectedRoute>} />
            <Route path="baocao-khsx-catvai-ca" element={<ProtectedRoute><BaoCaoKHSXCatVaiCa /></ProtectedRoute>} />
            <Route path="baocao-khsx-catvai-thang" element={<ProtectedRoute><BaoCaoKHSXCatVaiThang /></ProtectedRoute>} />
            <Route path="baocao-nhapkho-catvai-xe" element={<ProtectedRoute><BaoCaoNhapKhoCatVaiXe /></ProtectedRoute>} />
            <Route path="baocao-tonghop-catvai" element={<ProtectedRoute><BaoCaoTongHopCatVai /></ProtectedRoute>} />
            <Route path="baocao-tonghop-theoca" element={<ProtectedRoute><BaoCaoTongHopTheoCa /></ProtectedRoute>} />
            <Route path="baocao-tonghop-theocangay" element={<ProtectedRoute><BaoCaoTongHopTheoCaNgay /></ProtectedRoute>} />
            <Route path="baocao-tonghop-theocamay" element={<ProtectedRoute><BaoCaoTongHopTheoCaMay /></ProtectedRoute>} />
            <Route path="bao-cao-khsx" element={<ProtectedRoute><BaoCaoKHSX /></ProtectedRoute>} />
            <Route path="bao-cao-khsx-thang" element={<ProtectedRoute><BaoCaoKHSXThang /></ProtectedRoute>} />
            <Route path="bao-cao-khsx-thang-tonghop" element={<ProtectedRoute><BaoCaoKHSXThangTongHop /></ProtectedRoute>} />
            <Route path="bao-cao-nhap-kho-khong-theo-may" element={<ProtectedRoute><BaoCaoNhapKhoKhongTheoMay /></ProtectedRoute>} />
            <Route path="bao-cao-nhap-kho-theo-may" element={<ProtectedRoute><BaoCaoNhapKhoTheoMay /></ProtectedRoute>} />
            <Route path="view-orc-thanh-hinh" element={<ProtectedRoute><ViewOrcThanhHinhNhap /></ProtectedRoute>} />
            <Route path="thong-ke-lop-kscl" element={<ProtectedRoute><ThongKeLopKscl /></ProtectedRoute>} />
            <Route path="thong-ke-phan-loai-chat-luong" element={<ProtectedRoute><ThongKePhanLoaiChatLuong /></ProtectedRoute>} />
            <Route path="thong-ke-khong-tinh-lop-tra-xu-ly" element={<ProtectedRoute><ThongKeKhongTinhLopTraXuLy /></ProtectedRoute>} />
            <Route path="thong-ke-theo-ngay-com" element={<ProtectedRoute><ThongKeTheoNgayCom /></ProtectedRoute>} />
            <Route path="nhap-kho-chi-tiet-lop" element={<ProtectedRoute><NhapKhoChiTietLop /></ProtectedRoute>} />
            <Route path="lop-thanh-pham-temporary" element={<ProtectedRoute><LopThanhPhamTemporary /></ProtectedRoute>} />
            <Route path="lop-thanh-pham-loi-ma-vach" element={<ProtectedRoute><LopThanhPhamLoiMaVach /></ProtectedRoute>} />
            <Route path="lop-xu-ly-chua-nhap-kho" element={<ProtectedRoute><LopXuLyChuaNhapKho /></ProtectedRoute>} />
            <Route path="bao-cao-tong-hop-chi-tiet" element={<ProtectedRoute><BaoCaoTongHopChiTiet /></ProtectedRoute>} />
            <Route path="bao-cao-ke-hoach-thang" element={<ProtectedRoute><BaoCaoKeHoachThang /></ProtectedRoute>} />
            <Route path="bao-cao-lop-tra-xu-ly-nhap-kho" element={<ProtectedRoute><BaoCaoLopTraXuLyNhapKho /></ProtectedRoute>} />
            <Route path="bao-cao-ke-hoach-thang-khong-theo-may" element={<ProtectedRoute><BaoCaoKeHoachThangKhongTheoMay /></ProtectedRoute>} />
            <Route path="bao-cao-ke-hoach-thang-ca" element={<ProtectedRoute><BaoCaoKeHoachThangCa /></ProtectedRoute>} />
            <Route path="bao-cao-lop-tra-xu-ly-nhap-kho-ke-hoach-thang" element={<ProtectedRoute><BaoCaoLopTraXuLyNhapKhoKeHoachThang /></ProtectedRoute>} />
            <Route path="view-drc-loai-khuyet-tat" element={<ProtectedRoute><ViewDrcLoaiKhuyetTat /></ProtectedRoute>} />
            <Route path="kiem-ke" element={<ProtectedRoute><LapKiemKeTonKho /></ProtectedRoute>} />
            <Route path="lap-ke-hoach-thang" element={<ProtectedRoute><LapKeHoachThang /></ProtectedRoute>} />
            <Route path="danh-sach-lop-th-lh" element={<ProtectedRoute><DanhSachLopTHLH /></ProtectedRoute>} />
            <Route path="danh-sach-khoi-luong-lop" element={<ProtectedRoute><DanhSachKhoiLuongLop /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl font-bold text-gray-800">404 - Trang không tồn tại</h1>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      
      <AppContent />

      {/* Toast toàn cục */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </AuthProvider>
  );
}

export default App;