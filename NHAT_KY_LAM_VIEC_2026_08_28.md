# BÁO CÁO NHẬT KÝ LÀM VIỆC TRONG NGÀY
**Dự án:** Hệ thống Giám sát & Quản trị Sản xuất MES DRC  
**Người thực hiện:** Hoàng Tuấn Minh  
**Vị trí:** Fullstack Developer  
**Ngày báo cáo:** 28/08/2026  

---

## I. TỔNG QUAN CÁC HẠNG MỤC CÔNG VIỆC TRỌNG TÂM

Trong ngày làm việc hôm nay, tôi đã hoàn thành toàn diện 5 nhóm hạng mục công việc chính về **Quản trị mã nguồn (Version Control & Backup)**, **Tối ưu hóa tốc độ tải trang (Progressive Streaming Parallel APIs)** và **Hoàn thiện giao diện Responsive Mobile (UI/UX Mobile Optimization)**:

1. **Quản lý phiên bản & Đẩy toàn bộ Source Code lên GitHub (Frontend & Backend)**: Thiết lập repository, bảo mật file môi trường `.gitignore`, tạo cơ chế backup & rollback an toàn.
2. **Nâng cấp cơ chế tải dữ liệu Trang Tổng Quan sang Asynchronous Progressive Streaming**: API nào hoàn thành trước thì hiển thị ngay biểu đồ đó trước, không cần chờ toàn bộ API chạy xong.
3. **Chuẩn hóa bố cục khối Tình hình sản xuất xưởng CV-TH**: Đồng bộ thứ tự Kế hoạch (KH) bên TRÁI và Sản xuất (SX) bên PHẢI trên toàn hệ thống.
4. **Tối ưu giao diện Responsive toàn diện cho Màn hình Di động (Mobile)**:
   - Khắc phục lỗi ẩn/cắt 2 cột trên Bảng Theo dõi Kế hoạch Sản xuất trong ca (Bảng Mã Quy Cách) trên Chi tiết Máy Thành Hình & Cắt Vải, tích hợp thanh trượt ngang và chia tiêu đề 2 hàng thoáng đãng.
   - Tối ưu Biểu đồ Sản xuất 5 Năm (Desktop giữ nguyên cột to chuẩn tỉ lệ, Mobile hiển thị trọn vẹn 5 năm không đè chữ).
   - Khắc phục lỗi Header Topbar che khuất đỉnh nội dung trang trên điện thoại.
5. **Kiểm thử & Đóng gói Production**: Biên dịch hoàn tất bản build `npm run build` thành công 100%.

---

## II. CHI TIẾT CÔNG VIỆC VÀ KẾT QUẢ ĐẠT ĐƯỢC

### 1. Quản lý phiên bản & Đẩy Source Code lên GitHub (Frontend & Backend)
- **Mục tiêu:** Lưu trữ, quản lý version và thiết lập cơ chế sao lưu (backup/restore) mã nguồn dự án an toàn, đồng bộ giữa các môi trường phát triển.
- **Các việc đã thực hiện:**
  - Khởi tạo và đồng bộ mã nguồn Backend & Frontend lên GitHub repository (`hoangtuanminh-ai/SHTECH-FRONTEND`).
  - Cấu hình file `.gitignore` nghiêm ngặt theo chuẩn bảo mật:
    - Loại bỏ và ẩn toàn bộ các file biến môi trường chứa thông tin nhạy cảm: `.env`, `.env.local`, `.env.development`, `.env.production`.
    - Loại trừ các thư mục sinh tự động và phụ thuộc nặng: `node_modules/`, `dist/`, `.vscode/`, `.idea/`, `.DS_Store`.
  - Rà soát và dọn dẹp các script Python phụ trợ (`*.py`) dùng một lần trước đây ở thư mục gốc để làm sạch source code.
- **Kết quả:** Mã nguồn được lưu trữ an toàn trên GitHub, dễ dàng kiểm soát lịch sử commit, phân nhánh tính năng và rollback phiên bản khi cần thiết.

---

### 2. Tối ưu hóa tốc độ tải trang Tổng Quan sang Asynchronous Progressive Streaming
- **Đường dẫn:** `http://localhost:5173/` (Trang Dashboard Tổng Quan xưởng CV-TH)
- **Vấn đề trước khi sửa:**
  - Trang sử dụng `Promise.allSettled` gom 7 API lại một chỗ và phải chờ **tất cả 7 API hoàn thành xong hết** thì mới cập nhật state và vẽ biểu đồ.
  - Nếu có 1 API xử lý lâu (2 - 3s), người dùng phải chờ toàn bộ thời gian đó thì tất cả biểu đồ mới hiện ra cùng một lúc.
- **Giải pháp xử lý:**
  - Chuyển sang cơ chế **Asynchronous Streaming State Updates (Xử lý độc lập theo luồng)**:
    - Kích hoạt đồng thời 7 API cùng lúc tại `0ms`.
    - Gắn bộ xử lý riêng (`.then()`) cho từng API: API nào nhận được dữ liệu từ server trước sẽ **lập tức cập nhật state và hiển thị ngay biểu đồ/khối số liệu đó lên màn hình**:
      - 📊 **Biểu đồ tròn Thiết bị & KPI Ca** (`getMachinesWithStats`): Vẽ ngay biểu đồ tròn trạng thái và sản lượng ca.
      - 📈 **Biểu đồ 12 Tháng Thành Hình** (`getKeHoachTrend`): Hiển thị ngay biểu đồ cột 12 tháng TH.
      - 📈 **Biểu đồ 12 Tháng Cắt Vải** (`getCatVaiMonthlyStats`): Hiển thị ngay biểu đồ cột 12 tháng CV.
      - 📑 **Thẻ Tháng & Năm Thành Hình / Cắt Vải**: Cập nhật số liệu tức thì ngay khi có phản hồi.
- **Kết quả:** Rút ngắn thời gian hiển thị nội dung đầu tiên (FCP/LCP), người dùng nhìn thấy số liệu và biểu đồ xuất hiện tức thì, không có cảm giác chờ đợi gián đoạn.

---

### 3. Chuẩn hóa vị trí Kế Hoạch (KH) và Sản Xuất (SX) trên Khối Tình Hình Sản Xuất
- **Đường dẫn:** Khối *"TÌNH HÌNH SẢN XUẤT XƯỞNG CV-TH"* trên Trang Tổng Quan.
- **Vấn đề & Yêu cầu:** Trước đây biểu đồ mini 2 cột hiển thị cột Sản Xuất (SX) bên trái và Kế Hoạch (KH) bên phải, bị ngược so với quy chuẩn của biểu đồ 12 tháng lớn phía dưới.
- **Giải pháp xử lý:**
  - Cập nhật component `VerticalMiniBarChart`:
    - 🔵 **Cột Kế Hoạch (KH)** (màu xanh dương `#0070c0`): Đặt ở **bên TRÁI**.
    - 🟢 **Cột Sản Xuất (SX)** (màu trạng thái tiến độ): Đặt ở **bên PHẢI**.
    - Cập nhật nhãn chân cột thành `[KH]` bên trái và `[SX]` bên phải.
  - Đổi thứ tự dòng text trong `drc-sub-stats` thành `KH` (dòng trên) và `SX` (dòng dưới).
- **Kết quả:** Giao diện đồng bộ 100% logic trực quan từ trên xuống dưới (Kế hoạch trước - Thực tế sản xuất sau).

---

### 4. Tối ưu giao diện Responsive toàn diện cho Màn hình Di động (Mobile)

#### A. Bảng Theo dõi Kế hoạch Sản xuất trong ca (Bảng Mã Quy Cách)
- **Đường dẫn:** `MayThanhHinhDashboard.jsx` & `MayCatVaiDashboard.jsx`.
- **Hiện trạng:**
  - Bảng gồm 5 cột (`Mã quy cách`, `Quy cách lốp/vải`, `Thực tế sx`, `Kế hoạch`, `% Hoàn thành`) rộng hơn 500px, khi mở trên điện thoại bị thẻ `.th-card` (`overflow: hidden`) cắt đứt 2 cột bên phải (`KẾ HOẠCH` và `% HOÀN THÀNH`) và không cuộn được.
  - Tiêu đề thẻ bị ép hẹp thành 4 dòng nhỏ vụn dồn cục xấu mắt.
- **Giải pháp xử lý:**
  - Thêm container cuộn ngang độc lập `.th-table-responsive` (`overflow-x: auto !important; -webkit-overflow-scrolling: touch;`) với thanh trượt $6px$ màu xanh `#0284c7`.
  - Cố định độ rộng bảng `min-width: 520px` để các cột luôn rõ ràng, số liệu không bị ép méo.
  - Thiết kế lại Header thẻ ca: Trên mobile tự động chia thành **2 hàng riêng biệt** (Hàng 1: Tiêu đề to rõ trọn vẹn 1 dòng; Hàng 2: Tag badge `⟷ Vuốt ngang xem bảng` cùng thông tin ca làm việc).

#### B. Khôi phục & Tối ưu Biểu đồ Sản xuất 5 Năm
- **Đường dẫn:** `src/pages/Dashboard/SanXuat5Nam.jsx`.
- **Giải pháp:** Sử dụng hook `isMobile` để phân nhánh hiển thị:
  - **Trên Máy tính (Desktop):** Giữ nguyên 100% cột to dày `barSize={48px}`, font chữ $12px$, nhãn `Năm 2022...` chuẩn tỉ lệ ban đầu.
  - **Trên Điện thoại (Mobile):** Cấu hình riêng `barSize={32px}`, font chữ $10.5px$, hiển thị vừa khít trọn vẹn cả 5 năm trên cùng 1 khung màn hình không cần cuộn và không bị đè số.

#### C. Sửa lỗi Header Topbar che khuất tiêu đề trang trên Mobile
- **Đường dẫn:** `src/App.jsx`.
- **Giải pháp:** Bổ sung khoảng đệm `pt-[42px] md:pt-0` cho thẻ `<main>` khi đã đăng nhập, đảm bảo toàn bộ tiêu đề trang và thanh toolbar không bị thanh menu cố định của hệ thống DRC che khuất trên điện thoại.

---

## III. TỔNG KẾT & TRẠNG THÁI HỆ THỐNG

- **Trạng thái Build:** Chạy lệnh `npm run build` thành công 100% (Vite production build hoàn tất không lỗi cú pháp hay lint error).
- **Danh mục các file đã chỉnh sửa & hoàn thiện:**
  1. `.gitignore`: Cập nhật cấu hình bảo mật môi trường và loại trừ file tạm.
  2. `src/App.jsx`: Tối ưu padding top chống tràn Header Topbar trên mobile.
  3. `src/pages/Homepage/DashboardKeHoach.jsx`:
     - Tái cấu trúc sang cơ chế Asynchronous Progressive Streaming Parallel APIs.
     - Đổi vị trí cột và text: Kế hoạch (KH) bên trái, Sản xuất (SX) bên phải.
  4. `src/pages/ThanhHinh/MayThanhHinhDashboard.jsx`: Tối ưu responsive bảng quy cách ca, thanh cuộn ngang và header 2 hàng.
  5. `src/pages/ThanhHinh/MayCatVaiDashboard.jsx`: Đồng bộ responsive bảng quy cách ca, thanh cuộn ngang và header 2 hàng.
  6. `src/pages/Dashboard/SanXuat5Nam.jsx`: Phân nhánh hiển thị biểu đồ 5 năm chuẩn tỉ lệ trên cả Desktop và Mobile.
- **Kế hoạch tiếp theo:** Tiếp tục theo dõi phản hồi thực tế từ người dùng và kiểm thử độ ổn định của các module trên các thiết bị di động khác nhau.
