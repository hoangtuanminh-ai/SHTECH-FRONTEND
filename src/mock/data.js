export const mockUsers = [
  {
    id: 1,
    ho_tendem: "Nguyễn Văn",
    ten: "An",
    dia_chi: "123 Đường Bánh Ngọt, Hà Nội",
    ngay_sinh: "1990-01-01",
    sdt: "0123456789",
    email: "an@example.com",
    role: "admin",
    username: "admin1",
    password: "hashed_password",
  },
  {
    id: 2,
    ho_tendem: "Trần Thị",
    ten: "Bích",
    dia_chi: "456 Đường Bánh Mì, TP.HCM",
    ngay_sinh: "1995-02-02",
    sdt: "0987654321",
    email: "bich@example.com",
    role: "user",
    username: "user1",
    password: "hashed_password",
  },
];

export const mockCategories = [
  { id: 1, ten_loai: "Bánh Ngọt", mo_ta: "Các loại bánh ngọt thơm ngon" },
  { id: 2, ten_loai: "Bánh Mặn", mo_ta: "Bánh mặn đậm đà" },
];

export const mockProducts = [
  {
    id: 1,
    ten_san_pham: "Bánh Chiffon",
    mo_ta: "Bánh Chiffon mềm mịn",
    gia: 150000,
    img: "https://example.com/chiffon.jpg",
    the_loai_id: 1,
  },
  {
    id: 2,
    ten_san_pham: "Bánh Pate",
    mo_ta: "Bánh mặn pate thơm lừng",
    gia: 50000,
    img: "https://example.com/pate.jpg",
    the_loai_id: 2,
  },
];

export const mockOrders = [
  {
    id: 1,
    ngay_dat: "2025-08-10T10:00:00",
    trang_thai: "pending",
    tong_tien: 200000,
    nguoi_dung_id: 2,
  },
  {
    id: 2,
    ngay_dat: "2025-08-11T12:00:00",
    trang_thai: "completed",
    tong_tien: 300000,
    nguoi_dung_id: 2,
  },
  {
    id: 3,
    ngay_dat: "2025-08-11T12:00:00",
    trang_thai: "cancelled",
    tong_tien: 400000,
    nguoi_dung_id: 2,
  },
];

export const mockOrderDetails = [
  {
    id: 1,
    so_luong: 2,
    don_hang_id: 1,
    san_pham_id: 1,
  },
  {
    id: 2,
    so_luong: 1,
    don_hang_id: 1,
    san_pham_id: 2,
  },
];

export const mockDiscounts = [
  {
    id: 1,
    gia_tri: 10,
    ten_ma: "BANH10",
    ngay_bat_dau: "2025-08-01",
    ngay_ket_thuc: "2025-08-31",
    da_kich_hoat: 1,
  },
  {
    id: 2,
    gia_tri: 20,
    ten_ma: "BANH20",
    ngay_bat_dau: "2025-09-01",
    ngay_ket_thuc: "2025-09-30",
    da_kich_hoat: 0,
  },
];

export const mockOrderDiscounts = [
  { don_hang_id: 1, ma_giam_gia_id: 1 },
];

/* ---------- DỮ LIỆU BỔ SUNG CHO BIỂU ĐỒ ---------- */

// Doanh thu theo 12 tháng
export const mockMonthlyRevenue = [
  { month: "Tháng 1", revenue: 12000000 },
  { month: "Tháng 2", revenue: 15000000 },
  { month: "Tháng 3", revenue: 18000000 },
  { month: "Tháng 4", revenue: 10000000 },
  { month: "Tháng 5", revenue: 20000000 },
  { month: "Tháng 6", revenue: 17000000 },
  { month: "Tháng 7", revenue: 25000000 },
  { month: "Tháng 8", revenue: 22000000 },
  { month: "Tháng 9", revenue: 19000000 },
  { month: "Tháng 10", revenue: 21000000 },
  { month: "Tháng 11", revenue: 23000000 },
  { month: "Tháng 12", revenue: 30000000 },
];

// Số lượng người đăng ký thành viên theo tháng
export const mockMonthlyUsers = [
  { month: "Tháng 1", users: 50 },
  { month: "Tháng 2", users: 70 },
  { month: "Tháng 3", users: 90 },
  { month: "Tháng 4", users: 60 },
  { month: "Tháng 5", users: 100 },
  { month: "Tháng 6", users: 120 },
  { month: "Tháng 7", users: 150 },
  { month: "Tháng 8", users: 180 },
  { month: "Tháng 9", users: 140 },
  { month: "Tháng 10", users: 160 },
  { month: "Tháng 11", users: 200 },
  { month: "Tháng 12", users: 250 },
];
