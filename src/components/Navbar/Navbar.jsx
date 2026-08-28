import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaChevronDown, FaBars, FaTachometerAlt, FaSearch, FaHistory,
  FaList, FaChartBar, FaDatabase, FaCalendarAlt, FaCube, FaCut, FaCog
} from "react-icons/fa";

/* ─── MES Navbar Style — Phân cấp Sơ đồ cây chuẩn chỉ ──────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from{opacity:0} to{opacity:1} }

  .mes-aside {
    position: fixed; top: 0; left: 0;
    height: 100%; width: 256px;
    min-width: 200px; max-width: 500px;
    resize: horizontal;
    overflow-x: hidden;
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    border-right: 2px solid #96afc8;
    box-shadow: 2px 0 8px rgba(21,65,110,0.10);
    display: flex; flex-direction: column;
    z-index: 999;
    transition: transform 0.25s ease;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .mes-aside.hidden { transform: translateX(-100%); }

  /* ── Logo ── */
  .mes-logo {
    background: linear-gradient(180deg, #1a5fa8 0%, #12417a 100%);
    border-bottom: 2px solid #0d3060;
    padding: 10px 14px 9px;
    flex-shrink: 0;
    user-select: none;
  }
  .mes-logo-title {
    font-size: 15px; font-weight: 900; color: #ffffff;
    letter-spacing: 0.5px; line-height: 1.2;
  }
  .mes-logo-sub {
    font-size: 10px; font-weight: 600; color: #90bce0;
    text-transform: uppercase; letter-spacing: 1.2px; margin-top: 2px;
  }

  /* ── Nav scroll area ── */
  .mes-nav { flex: 1; overflow-y: auto; padding: 4px 0; }
  .mes-nav::-webkit-scrollbar { width: 4px; }
  .mes-nav::-webkit-scrollbar-thumb { background: #96afc8; border-radius: 2px; }

  /* ── Group header (Gốc duy nhất: SCADAR - Cấp 1) ── */
  .mes-group-btn {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 7px 10px 7px 12px;
    background: linear-gradient(180deg, #d8e8f4 0%, #c8ddf0 100%);
    border: none; border-bottom: 1px solid #96afc8; border-top: 1px solid #b8cce0;
    cursor: pointer; user-select: none;
    transition: background 0.1s;
  }
  .mes-group-btn:hover { background: linear-gradient(180deg, #c8ddf0 0%, #b8cce0 100%); }
  .mes-group-btn-left { display: flex; align-items: center; gap: 8px; }
  .mes-group-btn-left svg { color: #1565C0; flex-shrink: 0; }
  .mes-group-label {
    font-size: 11.5px; font-weight: 800; color: #1a3a5c;
    letter-spacing: 0.3px; text-transform: uppercase;
  }
  .mes-chevron {
    font-size: 9px; color: #5a7a9a;
    transition: transform 0.25s;
    flex-shrink: 0;
  }
  .mes-chevron.open { transform: rotate(180deg); }

  /* ── Subgroup cấp 2 (Dashboard, Thành hình & Cắt vải, KCS, Lưu hóa) ── */
  .mes-sub-wrap { overflow: hidden; transition: max-height 0.25s ease; }
  .mes-sub-btn {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 6px 10px 6px 24px;
    background: #e8f0f8;
    border: none; border-bottom: 1px solid #d0dff0;
    cursor: pointer; user-select: none;
    transition: background 0.1s;
  }
  .mes-sub-btn:hover { background: #d8e8f4; }
  .mes-sub-btn-left { display: flex; align-items: center; gap: 8px; }
  .mes-sub-btn-left svg { color: #5a7a9a; flex-shrink: 0; }
  .mes-sub-label {
    font-size: 11.5px; font-weight: 800; color: #1a3a5c;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .mes-sub-chevron {
    font-size: 8px; color: #7a9ab8;
    transition: transform 0.25s;
    flex-shrink: 0;
  }
  .mes-sub-chevron.open { transform: rotate(180deg); }

  /* ── Subgroup cấp 3 ── */
  .mes-sub-btn.level-2 {
    padding-left: 38px;
    background: #f0f6fc;
  }
  .mes-sub-btn.level-2 .mes-sub-label {
    font-size: 11.5px; font-weight: 800; color: #1a3a5c;
    text-transform: none; 
  }

  /* ── Nav link mục nhỏ trong cùng ── */
  .mes-link {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 10px 5px 36px;
    font-size: 11.5px; font-weight: 600; color: #2a4a6a;
    text-decoration: none;
    border-bottom: 1px solid #dce8f4;
    transition: background 0.1s, color 0.1s;
    white-space: normal; line-height: 1.3;
  }
  
  /* Link nằm bên trong SubGroup cấp 3 (Mục con cấp 4 trở xuống) */
  .level-2-wrapper .mes-link {
    padding-left: 46px;
    font-size: 11.5px;
    background: #fcfdfe;
  }

  /* ── Subgroup cấp 4 ── */
  .mes-sub-btn.level-3 {
    padding-left: 50px;
    background: #fcfdfe;
    border-bottom: 1px solid #e2edf8;
  }
  .mes-sub-btn.level-3 .mes-sub-label {
    font-size: 11.5px; font-weight: 750; color: #2a4a6a;
    text-transform: none; 
  }
  /* Link nằm bên trong SubGroup cấp 4 */
  .level-3-wrapper .mes-link {
    padding-left: 58px;
    font-size: 11.5px;
    background: #ffffff;
  }

  /* ── Subgroup cấp 5 & Link cấp 5 ── */
  .mes-sub-btn.level-4 {
    padding-left: 62px;
    background: #ffffff;
    border-bottom: 1px solid #edf4fc;
  }
  .mes-sub-btn.level-4 .mes-sub-label {
    font-size: 11.5px; font-weight: 700; color: #4a6a8a;
  }
  .level-4-wrapper .mes-link {
    padding-left: 70px;
    font-size: 11.5px;
    background: #fafbfc;
  }

  .mes-link:hover { background: #d0e4f4; color: #1a3a5c; }
  .mes-link.active {
    background: linear-gradient(90deg, #1565C0 0%, #1565C0 3px, #dbeeff 3px);
    color: #1a3a5c; font-weight: 800;
    border-left: 3px solid #1565C0;
  }
  .mes-link svg { flex-shrink: 0; color: #5a7a9a; }
  .mes-link.active svg { color: #1565C0; }

  /* ── Footer ── */
  .mes-footer {
    background: linear-gradient(180deg, #c8d8ec 0%, #b8cce0 100%);
    border-top: 2px solid #96afc8;
    padding: 8px 12px;
    flex-shrink: 0;
  }
  .mes-user-row { display: flex; align-items: center; gap: 8px; }
  .mes-avatar {
    width: 30px; height: 30px; border-radius: 2px;
    background: #1565C0; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; flex-shrink: 0;
    border: 1px solid #96afc8;
  }
  .mes-user-name {
    font-size: 11px; font-weight: 700; color: #1a3a5c;
    white-space: normal; line-height: 1.3;
  }
  .mes-logout-btn {
    background: none; border: none; padding: 0;
    font-size: 10px; font-weight: 600; color: #b91c1c;
    cursor: pointer; text-decoration: underline;
  }
  .mes-logout-btn:hover { color: #991b1b; }

  /* ── Mobile topbar ── */
  .mes-topbar {
    display: none;
    position: fixed; top: 0; width: 100%;
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    border-bottom: 2px solid #96afc8;
    padding: 6px 12px;
    align-items: center; justify-content: space-between;
    z-index: 1000;
  }
  .mes-topbar-title { font-size: 13px; font-weight: 800; color: #1a3a5c; }
  .mes-hamburger {
    background: none; border: 1px solid #96afc8; border-radius: 2px;
    padding: 4px 8px; cursor: pointer; color: #1a3a5c;
    font-size: 16px;
  }
  @media (max-width: 768px) {
    .mes-topbar { display: flex; }
    .mes-aside { top: 38px; }
    .mes-aside.hidden { transform: translateX(-100%); }
    .mes-aside:not(.hidden) { transform: translateX(0); }
  }
  @media (min-width: 769px) {
    .mes-aside { transform: translateX(0) !important; }
  }
`;

/* ─── Group Header (Cấp Danh Mục Chính Gốc Ngoài Cùng - Cấp 1) ──────────────── */
const GroupHeader = ({ icon: Icon, label, isOpen, onClick }) => (
  <button className="mes-group-btn" onClick={onClick}>
    <div className="mes-group-btn-left">
      <Icon size={14} />
      <span className="mes-group-label">{label}</span>
    </div>
    <FaChevronDown className={`mes-chevron${isOpen ? ' open' : ''}`} />
  </button>
);

/* ─── Sub Group (Hỗ trợ phân cấp sơ đồ cây từ Cấp 2 đến Cấp 5) ─────────────── */
const SubGroup = ({ icon: Icon, label, isOpen, onClick, isLevel2, isLevel3, isLevel4, children }) => {
  let className = "mes-sub-btn";
  if (isLevel2) className += " level-2";
  if (isLevel3) className += " level-3";
  if (isLevel4) className += " level-4";

  let wrapClassName = "mes-sub-wrap";
  if (isLevel2) wrapClassName += " level-2-wrapper";
  if (isLevel3) wrapClassName += " level-3-wrapper";
  if (isLevel4) wrapClassName += " level-4-wrapper";

  return (
    <>
      <button className={className} onClick={onClick}>
        <div className="mes-sub-btn-left">
          {Icon && <Icon size={12} />}
          <span className="mes-sub-label">{label}</span>
        </div>
        <FaChevronDown className={`mes-sub-chevron${isOpen ? ' open' : ''}`} />
      </button>
      <div className={wrapClassName} style={{ maxHeight: isOpen ? 2500 : 0 }}>
        {children}
      </div>
    </>
  );
};

/* ─── Nav Link Cấp 2 Có Icon ──────────────────────────────────────────────── */
const NavLink = ({ to, label, icon: Icon, isActive }) => (
  <Link to={to} className={`mes-link${isActive ? ' active' : ''}`}>
    <Icon size={11} />
    {label}
  </Link>
);

/* ─── Nav Link Mục Con Thụt Lề (Cấp 3 trở xuống - Ẩn Icon) ────────────────── */
const NavLinkWithoutIcon = ({ to, label, isActive }) => (
  <Link to={to} className={`mes-link${isActive ? ' active' : ''}`}>
    {label}
  </Link>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
function Navbar() {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Cấp 1 ── */
  const [openScadarRoot, setOpenScadarRoot] = useState(true);

  /* ── Cấp 2 ── */
  const [openDashboardSub, setOpenDashboardSub] = useState(true);
  const [openDashboardThanhHinh, setOpenDashboardThanhHinh] = useState(true);
  const [openDashboardCatVai, setOpenDashboardCatVai] = useState(false);
  const [openThanhHinhSub, setOpenThanhHinhSub] = useState(false);
  const [openLuuHoaSub, setOpenLuuHoaSub] = useState(false);
  const [openKcsSub, setOpenKcsSub] = useState(false);

  /* ── Cấp 3 trực thuộc THÀNH HÌNH & CẮT VẢI ── */
  const [openThanhHinhNhanhCon, setOpenThanhHinhNhanhCon] = useState(false);
  const [openCatVaiNhanhCon, setOpenCatVaiNhanhCon] = useState(false);

  /* ── Cấp 4 trực thuộc THÀNH HÌNH ── */
  const [openKhThanhHinh, setOpenKhThanhHinh] = useState(false);
  const [openBaoCao, setOpenBaoCao] = useState(false);

  /* ── Cấp 5 trực thuộc KH THÀNH HÌNH ── */
  const [openKhThang, setOpenKhThang] = useState(false);
  const [openKhNgay, setOpenKhNgay] = useState(false);

  /* ── Cấp 3 trực thuộc KCS ── */
  const [openKhoKsclRadial, setOpenKhoKsclRadial] = useState(false);
  const [openDanhMuc, setOpenDanhMuc] = useState(false);
  const [openBaoCaoThongKe, setOpenBaoCaoThongKe] = useState(false);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => { setIsMobileOpen(false); }, [location]);

  const handleLogout = () => {
    setUserInfo(null);
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const active = (path) => location.pathname === path;

  return (
    <>
      <style>{css}</style>

      {/* Mobile topbar */}
      <div className="mes-topbar">
        <span className="mes-topbar-title">DRC System</span>
        <button className="mes-hamburger" onClick={() => setIsMobileOpen(v => !v)}>☰</button>
      </div>

      {/* Sidebar */}
      <aside className={`mes-aside${isMobileOpen ? '' : ' hidden'}`}>

        {/* Logo */}
        <div className="mes-logo">
          <div className="mes-logo-title">DRC System</div>
          <div className="mes-logo-sub">Quản lý sản xuất</div>
        </div>

        {/* Nav */}
        <nav className="mes-nav">

          {/* =================================================================
              GỐC DUY NHẤT: SCADAR (Cấp 1)
             ================================================================= */}
          <GroupHeader icon={FaChartBar} label="SCADAR" isOpen={openScadarRoot} onClick={() => setOpenScadarRoot(v => !v)} />

          <div className="mes-sub-wrap" style={{ maxHeight: openScadarRoot ? 6000 : 0 }}>

            {/* ── 1. NHÁNH DASHBOARD (Cấp 2) ── */}
            <SubGroup icon={FaTachometerAlt} label="DASHBOARD" isOpen={openDashboardSub} onClick={() => setOpenDashboardSub(v => !v)}>
              <NavLink to="/" label="TỔNG QUAN" icon={FaTachometerAlt} isActive={active('/')} />
              <NavLink to="/dashboard/may-thanh-hinh" label="TRẠNG THÁI THIẾT BỊ" icon={FaList} isActive={active('/dashboard/may-thanh-hinh')} />
              <NavLink to="/dashboard/ke-hoach-san-xuat-nam" label="KẾ HOẠCH - SẢN XUẤT NĂM" icon={FaCalendarAlt} isActive={active('/dashboard/ke-hoach-san-xuat-nam')} />
              <NavLink to="/dashboard/ke-hoach-san-xuat-thang" label="KẾ HOẠCH - SẢN XUẤT THÁNG" icon={FaCalendarAlt} isActive={active('/dashboard/ke-hoach-san-xuat-thang')} />
              <NavLink to="/dashboard/ke-hoach-san-xuat-ca-thang" label="KẾ HOẠCH - SẢN XUẤT CA , THÁNG" icon={FaCalendarAlt} isActive={active('/dashboard/ke-hoach-san-xuat-ca-thang')} />
              <NavLink to="/dashboard/san-xuat-thang-nam" label="SẢN XUẤT THÁNG /NĂM" icon={FaChartBar} isActive={active('/dashboard/san-xuat-thang-nam')} />
              <NavLink to="/dashboard/san-xuat-5-nam" label="SẢN XUẤT 5 NĂM" icon={FaChartBar} isActive={active('/dashboard/san-xuat-5-nam')} />
              <NavLink to="/dashboard/trang-thai-may-ngay" label="TRẠNG THÁI MÁY - NGÀY" icon={FaHistory} isActive={active('/dashboard/trang-thai-may-ngay')} />
              <NavLink to="/dashboard/trang-thai-may-thang" label="TRẠNG THÁI MÁY - THÁNG" icon={FaHistory} isActive={active('/dashboard/trang-thai-may-thang')} />
              <NavLink to="/dashboard/trang-thai-may-nam" label="TRẠNG THÁI MÁY - NĂM" icon={FaHistory} isActive={active('/dashboard/trang-thai-may-nam')} />
            </SubGroup>

            {/* ── 2. NHÁNH THÀNH HÌNH & CẮT VẢI (Cấp 2) ── */}
            <SubGroup icon={FaCube} label="THÀNH HÌNH & CẮT VẢI" isOpen={openThanhHinhSub} onClick={() => setOpenThanhHinhSub(v => !v)}>

              {/* Cấp 3: Mục con Thành hình */}
              <SubGroup label="Thành hình" isOpen={openThanhHinhNhanhCon} onClick={() => setOpenThanhHinhNhanhCon(v => !v)} isLevel2={true}>

                {/* Cấp 4: KH Thành hình nằm bên trong Thành hình */}
                <SubGroup label="KH Thành hình" isOpen={openKhThanhHinh} onClick={() => setOpenKhThanhHinh(v => !v)} isLevel3={true}>

                  {/* Cấp 5: Xuất kho */}
                  <SubGroup label="Xuất kho" isOpen={openKhThang} onClick={() => setOpenKhThang(v => !v)} isLevel4={true}>
                    <NavLinkWithoutIcon to="/dashboard/lap-ke-hoach-thang" label="Lập KH theo tháng" isActive={active('/dashboard/lap-ke-hoach-thang')} />
                    <NavLinkWithoutIcon to="/dashboard/kiem-ke" label="Kiểm kê tồn kho đầu kỳ" isActive={active('/dashboard/kiem-ke')} />
                    <NavLinkWithoutIcon to="/dashboard/bao-cao-khsx-thang" label="Thống kê thực hiện kế hoạch thành hình (Tháng/máy)" isActive={active('/dashboard/bao-cao-khsx-thang')} />
                    <NavLinkWithoutIcon to="/dashboard/bao-cao-khsx-thang-tonghop" label="Thống kê thực hiện kế hoạch thành hình (Tháng)" isActive={active('/dashboard/bao-cao-khsx-thang-tonghop')} />
                  </SubGroup>

                  {/* Cấp 5: Báo cáo - Thống kê */}
                  <SubGroup label="Báo cáo - Thống kê" isOpen={openKhNgay} onClick={() => setOpenKhNgay(v => !v)} isLevel4={true}>
                    <NavLinkWithoutIcon to="/dashboard/lap-ke-hoach" label="Lập kế hoạch thành hình (Ca/ngày)" isActive={active('/dashboard/lap-ke-hoach')} />
                    <NavLinkWithoutIcon to="/dashboard/bao-cao-khsx" label="Thống kê thực hiện kế hoạch thành hình (ca)" isActive={active('/dashboard/bao-cao-khsx')} />
                  </SubGroup>

                </SubGroup>

                {/* Cấp 4: Báo cáo KH thành hình nằm bên trong Thành hình */}
                <SubGroup label="Báo cáo KH thành hình" isOpen={openBaoCao} onClick={() => setOpenBaoCao(v => !v)} isLevel3={true}>
                  <NavLinkWithoutIcon to="/dashboard/view-orc-thanh-hinh" label="Hiển thị Danh sách lốp" isActive={active('/dashboard/view-orc-thanh-hinh')} />
                  <NavLinkWithoutIcon to="/dashboard/bao-cao-nhap-kho-khong-theo-may" label="Báo Cáo Tổng Hợp Theo Ca/Ngày" isActive={active('/dashboard/bao-cao-nhap-kho-khong-theo-may')} />
                  <NavLinkWithoutIcon to="/dashboard/bao-cao-nhap-kho-theo-may" label="Báo Cáo Tổng Hợp Theo Ca/Máy" isActive={active('/dashboard/bao-cao-nhap-kho-theo-may')} />
                  <NavLinkWithoutIcon to="/dashboard/danh-sach-lop-th-lh" label="Hiển Thị Danh Sánh Lốp TH-LH" isActive={active('/dashboard/danh-sach-lop-th-lh')} />
                  <NavLinkWithoutIcon to="/dashboard/danh-sach-khoi-luong-lop" label="Danh Dách Khối Lượng Lốp Ca/Ngày" isActive={active('/dashboard/danh-sach-khoi-luong-lop')} />
                </SubGroup>

              </SubGroup>

              {/* Cấp 3: Mục con Cắt Vải */}
              <SubGroup label="Cắt Vải" isOpen={openCatVaiNhanhCon} onClick={() => setOpenCatVaiNhanhCon(v => !v)} isLevel2={true}>
                <NavLinkWithoutIcon to="/dashboard/ke-hoach-cat-vai" label="1. Lập kế hoạch Ca/ngày (Cắt vải thép)" isActive={active('/dashboard/ke-hoach-cat-vai')} />
                <NavLinkWithoutIcon to="/dashboard/baocao-khsx-catvai-ca" label="2. Thống kê thực hiện KHSX cắt vải thép (Mỗi ca)" isActive={active('/dashboard/baocao-khsx-catvai-ca')} />
                <NavLinkWithoutIcon to="/dashboard/baocao-khsx-catvai-thang" label="3. Thống kê thực hiện KHSX cắt vải thép (Tháng)" isActive={active('/dashboard/baocao-khsx-catvai-thang')} />
                <NavLinkWithoutIcon to="/dashboard/baocao-nhapkho-catvai-xe" label="4. In Phiếu BCP Cắt Vải theo ca" isActive={active('/dashboard/baocao-nhapkho-catvai-xe')} />
                <NavLinkWithoutIcon to="/dashboard/baocao-tonghop-catvai" label="5. Hiển thị danh sách lốp nhập kho cắt vải" isActive={active('/dashboard/baocao-tonghop-catvai')} />
                <NavLinkWithoutIcon to="/dashboard/baocao-tonghop-theoca" label="6. Báo Cáo Tổng Hợp Theo Ca" isActive={active('/dashboard/baocao-tonghop-theoca')} />
                <NavLinkWithoutIcon to="/dashboard/baocao-tonghop-theocangay" label="7. Báo Cáo Tổng Hợp Theo Ca/Ngày" isActive={active('/dashboard/baocao-tonghop-theocangay')} />
                <NavLinkWithoutIcon to="/dashboard/baocao-tonghop-theocamay" label="8. Báo Cáo Tổng Hợp Theo Ca/Máy" isActive={active('/dashboard/baocao-tonghop-theocamay')} />
              </SubGroup>

            </SubGroup>

            {/* ── 3. NHÁNH LƯU HÓA (Cấp 2) ── */}
            <SubGroup icon={FaCog} label="LƯU HÓA" isOpen={openLuuHoaSub} onClick={() => setOpenLuuHoaSub(v => !v)}>
              {/* Có thể bổ sung thêm các mục con của Lưu Hóa tại đây */}
            </SubGroup>

            {/* ── 4. NHÁNH KCS (Cấp 2) ── */}
            <SubGroup icon={FaDatabase} label="KCS" isOpen={openKcsSub} onClick={() => setOpenKcsSub(v => !v)}>

              {/* Mục con cấp 3: kho KSCL radial */}
              <SubGroup label="kho KSCL radial" isOpen={openKhoKsclRadial} onClick={() => setOpenKhoKsclRadial(v => !v)} isLevel2={true}>
                {/* Trống */}
              </SubGroup>

              {/* Mục con cấp 3: danh mục */}
              <SubGroup label="danh mục" isOpen={openDanhMuc} onClick={() => setOpenDanhMuc(v => !v)} isLevel2={true}>
                <NavLinkWithoutIcon to="/dashboard/view-drc-loai-khuyet-tat" label="Bảng mã lỗi" isActive={active('/dashboard/view-drc-loai-khuyet-tat')} />
              </SubGroup>

              {/* Mục con cấp 3: báo cáo thống kê */}
              <SubGroup label="báo cáo thống kê" isOpen={openBaoCaoThongKe} onClick={() => setOpenBaoCaoThongKe(v => !v)} isLevel2={true}>
                <NavLinkWithoutIcon to="/dashboard/thong-ke-lop-kscl" label="KS.1.1 Chi Tiết (OR.KS.D02)" isActive={active('/dashboard/thong-ke-lop-kscl')} />
                <NavLinkWithoutIcon to="/dashboard/thong-ke-phan-loai-chat-luong" label="KS.1.1 Tổng hợp (OR.KS.D02)" isActive={active('/dashboard/thong-ke-phan-loai-chat-luong')} />
                <NavLinkWithoutIcon to="/dashboard/thong-ke-khong-tinh-lop-tra-xu-ly" label="KS.1.3 SL và CL (OR.KS.D05)" isActive={active('/dashboard/thong-ke-khong-tinh-lop-tra-xu-ly')} />
                <NavLinkWithoutIcon to="/dashboard/thong-ke-theo-ngay-com" label="KS.1.4 TH-SL% (OR.KS.D06)" isActive={active('/dashboard/thong-ke-theo-ngay-com')} />
                <NavLinkWithoutIcon to="/dashboard/nhap-kho-chi-tiet-lop" label="Tìm kiếm Mã vạch" isActive={active('/dashboard/nhap-kho-chi-tiet-lop')} />
                <NavLinkWithoutIcon to="/dashboard/lop-thanh-pham-temporary" label="Lịch sử chỉnh sửa" isActive={active('/dashboard/lop-thanh-pham-temporary')} />
                <NavLinkWithoutIcon to="/dashboard/lop-thanh-pham-loi-ma-vach" label="Danh sách lốp lỗi tích mã vạch OR-KS" isActive={active('/dashboard/lop-thanh-pham-loi-ma-vach')} />
                <NavLinkWithoutIcon to="/dashboard/lop-xu-ly-chua-nhap-kho" label="Danh sách lốp Lốp xử lý chưa nhập kho" isActive={active('/dashboard/lop-xu-ly-chua-nhap-kho')} />
                <NavLinkWithoutIcon to="/dashboard/bao-cao-tong-hop-chi-tiet" label="KS.1.3 Báo cáo tổng hợp" isActive={active('/dashboard/bao-cao-tong-hop-chi-tiet')} />
                <NavLinkWithoutIcon to="/dashboard/bao-cao-ke-hoach-thang" label="KS.1.3 CL-Tháng ((OR.KS.D05)" isActive={active('/dashboard/bao-cao-ke-hoach-thang')} />
                <NavLinkWithoutIcon to="/dashboard/bao-cao-ke-hoach-thang-ca" label="KS.1.3 CL- Ca/Tháng (OR.KS.D05)" isActive={active('/dashboard/bao-cao-ke-hoach-thang-ca')} />
                <NavLinkWithoutIcon to="/dashboard/bao-cao-ke-hoach-thang-khong-theo-may" label="KS.1.4 TH-SL% tháng (OR.KS.D06)" isActive={active('/dashboard/bao-cao-ke-hoach-thang-khong-theo-may')} />
                <NavLinkWithoutIcon to="/dashboard/bao-cao-lop-tra-xu-ly-nhap-kho" label="Thống Kê Lốp Kiểm Trả Xử Lý Ca/ngày KS.1.3" isActive={active('/dashboard/bao-cao-lop-tra-xu-ly-nhap-kho')} />
                <NavLinkWithoutIcon to="/dashboard/bao-cao-lop-tra-xu-ly-nhap-kho-ke-hoach-thang" label="Thống Kê Lốp Kiểm Trả Xử Lý Ca /tháng KS.1.3" isActive={active('/dashboard/bao-cao-lop-tra-xu-ly-nhap-kho-ke-hoach-thang')} />
              </SubGroup>

            </SubGroup>

          </div>

        </nav>

        {/* Footer / User */}
        <div className="mes-footer">
          {userInfo && (
            <div className="mes-user-row">
              <div className="mes-avatar">
                {userInfo.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="mes-user-name">{userInfo.fullName}</div>
                <button className="mes-logout-btn" onClick={handleLogout}>Đăng xuất</button>
              </div>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}

export default Navbar;