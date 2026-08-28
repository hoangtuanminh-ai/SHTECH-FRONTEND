# BÁO CÁO NHẬT KÝ LÀM VIỆC TRONG NGÀY
**Dự án:** Hệ thống Giám sát & Quản trị Sản xuất MES DRC  
**Người thực hiện:** Hoàng Tuấn Minh  
**Vị trí:** Fullstack Developer  
**Ngày báo cáo:** 27/08/2026  

---

## I. TỔNG QUAN CÁC HẠNG MỤC CÔNG VIỆC TRỌNG TÂM

Trong ngày làm việc hôm nay, tôi đã tập trung giải quyết triệt để 4 nhóm vấn đề lớn về **Hiệu năng hệ thống (Performance Optimization)** và **Giao diện người dùng (UI/UX Bug Fixes)**:
1. **Tối ưu hóa tốc độ truy xuất dữ liệu trang Báo cáo Sản xuất 5 Năm** (Tăng tốc từ ~13s xuống ~0.08s, nhanh hơn gần 200 - 400 lần).
2. **Chuyển đổi cơ chế nạp dữ liệu trang Tổng Quan từ Tuần tự (Sequential) sang Song song đồng thời (Parallel)** (Giảm thời gian chờ từ 8s xuống ~1.5s).
3. **Khắc phục lỗi tràn viền, vỡ khung và đè chữ trong Tab Thông số hoạt động & Cài đặt máy** (Module máy Thành hình & Cắt vải).
4. **Tối ưu hóa thuật toán hiển thị nhãn Biểu đồ tròn SCADA** (Chống dính chữ, hiển thị lát bánh thông minh theo diện tích).
5. **Cập nhật và đồng bộ các API chuyên dụng theo Năm** phục vụ hệ thống giám sát SCADA.

---

## II. CHI TIẾT CÔNG VIỆC VÀ KẾT QUẢ ĐẠT ĐƯỢC

### 1. Tối ưu hóa tốc độ truy xuất trang Báo Cáo Sản Xuất 5 Năm
- **Đường dẫn:** `http://localhost:5173/dashboard/san-xuat-5-nam`
- **Hiện trạng & Vấn đề trước khi sửa:**
  - Trang phải gửi 5 HTTP requests lặp qua từng năm gọi API `trend` cũ (`GET /api/thanhhinh/kehoach/trend?namSx=...`).
  - Backend thực thi Stored Procedure `usp_BaoCao_Trend_Nam` rất nặng trong SQL Server (mất 2s - 7s/request).
  - Trình duyệt bị nghẽn mạng do vượt giới hạn 6 kết nối TCP (`Stalled: 2.83s`), khiến tổng thời gian chờ lên tới **13.0s - 18.7s**.
- **Giải pháp xử lý:**
  - Xây dựng và tích hợp API chuyên dụng mới: `GET /api/thanhhinh/machine/production-5-years?selectedYear={nam}&maMay={01..}`.
  - Gom toàn bộ dữ liệu 5 năm vào **1 request duy nhất** thay vì 5 request.
  - Chuẩn hóa mã máy gửi lên backend dạng `01, 02, 03...` (hoặc `null` khi xem tất cả máy).
  - Tích hợp thêm bộ nhớ đệm **Smart In-Memory Caching** (`useRef<Map>`) tại Frontend.
- **Kết quả đo lường thực tế:**
  - Thời gian tải lần đầu: Giảm từ **13.200ms $\rightarrow$ 65ms - 100ms** (**Tăng tốc ~150 - 400 lần**).
  - Thời gian tải lần 2 khi đổi bộ lọc: **0ms (Tức thì)**.
  - Đã xuất bản file phân tích chi tiết: `SO_SANH_HIEU_NANG_SAN_XUAT_5_NAM.md`.

---

### 2. Tái cấu trúc cơ chế gọi API trang Dashboard Tổng Quan
- **Đường dẫn:** `http://localhost:5173/` (Trang Tổng Quan xưởng CV-TH)
- **Hiện trạng & Vấn đề trước khi sửa:**
  - Hàm `fetchAllDashboardData` trong `DashboardKeHoach.jsx` sử dụng chuỗi câu lệnh `await` tuần tự nối tiếp nhau cho **7 API**:
    `getMachinesWithStats` $\rightarrow$ `getDashboardStats (tháng)` $\rightarrow$ `getDashboardStats (năm)` $\rightarrow$ `getCatVaiSummaryStats (tháng)` $\rightarrow$ `getCatVaiSummaryStats (năm)` $\rightarrow$ `getKeHoachTrend (năm)` $\rightarrow$ `getCatVaiMonthlyStats (năm)`.
  - API phía sau phải chờ toàn bộ API phía trước phản hồi mới được gửi đi, dẫn đến API Cắt vải cuối cùng bị trễ tới **6s - 8s** mới bắt đầu chạy.
- **Giải pháp xử lý:**
  - Chuyển đổi toàn bộ 7 API sang cơ chế **bắn đồng thời song song (Parallel Non-blocking)** bằng **`Promise.allSettled`**.
  - Tất cả 7 API được gửi đi cùng lúc ngay tại miligiây thứ 0 (`0ms`).
  - Xử lý kết quả bất đồng bộ độc lập: Nếu 1 API chậm/lỗi, 6 API còn lại vẫn cập nhật lên biểu đồ và KPI bình thường.
- **Kết quả:**
  - Tổng thời gian nạp toàn bộ trang giảm từ **6s - 8s $\rightarrow$ ~1.5s** (rút ngắn hơn **75%** thời gian chờ).

---

### 3. Sửa lỗi hiển thị tràn viền, vỡ khung & đè chữ ô Thông số máy
- **Đường dẫn:** `http://localhost:5173/dashboard/may-thanh-hinh/ORC-TH-06` (Tab "Thông số hoạt động và cài đặt của máy")
- **Hiện trạng & Vấn đề trước khi sửa:**
  - Các ô thông số được cấu hình độ rộng `minmax(130px, 1fr)` quá nhỏ hẹp.
  - Các giá trị số thập phân (`459.86`, `201.83`, `68.99`) và nhãn dài (*"Vị trí cà hướng tâm mm"*, *"Yêu cầu tích mã vạch"*) bị tràn ra ngoài mép ô (`overflow`), đè chữ lên ô bên cạnh.
- **Giải pháp xử lý:**
  - Mở rộng kích thước ô lên chuẩn `minmax(210px, 1fr)` (và `minmax(220px, 1fr)` cho thông số cài đặt).
  - Bổ sung `minWidth: 0`, `overflow: hidden`, `textOverflow: ellipsis` cho nhãn kèm tooltip `title`.
  - Đóng gói giá trị số vào **Badge tag độc lập** (`background: #f1f5f9; padding: 2px 8px; border: 1px solid #e2e8f0; font-weight: bold;`).
  - Cấu hình riêng cho 2 trường Mã vạch: chiếm **2 cột (`span 2`)** kèm màu sắc trạng thái trực quan (Xanh: OK, Đỏ: Lỗi, Vàng: Yêu cầu).
  - Đồng bộ trên cả `MayThanhHinhDashboard.jsx` và `MayCatVaiDashboard.jsx`.
- **Kết quả:**
  - Bố cục các ô thông số ngay ngắn, thẳng hàng, chống tràn viền và hiển thị rõ ràng trên mọi độ phân giải.

---

### 4. Tối ưu hóa nhãn Biểu đồ tròn PieChart SCADA
- **Các trang áp dụng:** `TrangThaiMayNgay`, `TrangThaiMayThang`, `TrangThaiMayNam`, `MayThanhHinhDashboard`, `MayCatVaiDashboard`.
- **Giải pháp xử lý:**
  - Phân loại lát bánh thông minh: Lát có tỷ lệ $\ge 7\%$ (như `9.8%`, `86.5%`) được hiển thị số `%` in đậm **bên trong lát bánh**, không kéo đường line thừa thãi.
  - Các lát nhỏ $< 7\%$ (kể cả lát siêu nhỏ $0.3\%, 0.5\%, 0.8\%, 1.2\%, 3.6\%$): Tự động vẽ **đường kẻ bậc thang so le 3 tầng vươn ra ngoài** đa hướng theo góc `midAngle`.
- **Kết quả:**
  - Không bị mất bất kỳ trạng thái nào, triệt tiêu 100% hiện tượng các nhãn nằm gần nhau bị dính/chạm chữ.

---

### 5. Cập nhật API SCADA Năm
- Tích hợp endpoint mới `GET /api/v1/chart/machine-status-times-year` vào `thanhhinhApi.js` và trang `TrangThaiMayNam.jsx` với đầy đủ tham số `maMay` và `year`.

---

## III. TỔNG KẾT & TRẠNG THÁI HỆ THỐNG

- **Trạng thái Build:** Chạy lệnh `npm run build` thành công 100% (Vite production build hoàn tất không lỗi).
- **Mã nguồn đã chỉnh sửa & cập nhật:**
  1. `src/api/thanhhinhApi.js`: Thêm `getProductionQuantityFor5Years`, `getMachineStatusTimesByYear`.
  2. `src/pages/Dashboard/SanXuat5Nam.jsx`: Tích hợp API 5 năm mới, Smart Cache, đo lường tốc độ.
  3. `src/pages/Homepage/DashboardKeHoach.jsx`: Chuyển đổi 7 API sang `Promise.allSettled` song song.
  4. `src/pages/ThanhHinh/MayThanhHinhDashboard.jsx`: Sửa layout ô thông số, tối ưu nhãn PieChart.
  5. `src/pages/ThanhHinh/MayCatVaiDashboard.jsx`: Đồng bộ layout ô thông số và nhãn PieChart.
  6. `src/pages/Dashboard/TrangThaiMayNam.jsx`: Cập nhật endpoint SCADA Năm.
  7. `src/pages/Dashboard/TrangThaiMayNgay.jsx` & `TrangThaiMayThang.jsx`: Đồng bộ nhãn PieChart.
- **Kế hoạch tiếp theo:** Tiếp tục theo dõi độ ổn định của các API realtime và hỗ trợ các module báo cáo tiếp theo theo yêu cầu.
