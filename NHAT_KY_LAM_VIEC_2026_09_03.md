# BÁO CÁO NHẬT KÝ LÀM VIỆC TRONG CA TỐI
**Dự án:** Hệ thống Giám sát & Quản trị Sản xuất MES DRC  
**Người thực hiện:** Hoàng Tuấn Minh  
**Vị trí:** Fullstack Developer  
**Thời gian thực hiện:** 21:30 – 22:50, Thứ Năm ngày 03/09/2026  

---

## I. TỔNG HỢP CÁC CÔNG VIỆC ĐÃ HOÀN THÀNH TRONG CA TỐI HÔM NAY (03/09/2026)

Toàn bộ phiên làm việc tối nay tập trung vào nâng cấp trang **Báo Cáo Sản Xuất 10 Năm Liên Tiếp** (Backend & Frontend) và chuẩn hóa **Thời Gian Mặc Định Popup Lịch Sử Thông Số Hoạt Động Realtime** cho tất cả các máy:

1. **Thay đổi API Backend sang chu kỳ 10 năm liên tiếp cho cả Cắt Vải và Thành Hình**:
   - Chuyển đổi endpoint `/api/thanhhinh/machine/production-5-years` và `/api/catvai/production-5-years` sang trả về đủ 10 năm liên tiếp.
   - Tự động gán `TotalQuantity = 0` nếu năm đó không có dữ liệu trong Database.
2. **Nâng cấp Frontend trang Báo Cáo Sản Xuất 10 Năm Liên Tiếp**:
   - Cập nhật thuật toán tính dải 10 năm (`target10Years: [selectedYear - 9 ... selectedYear]`).
   - Cập nhật Recharts hiển thị đủ 10 cột, nhãn số lượng trên đỉnh từng cột, và bảng số liệu tóm tắt 10 năm bên dưới có thanh cuộn ngang `overflow-x: auto`.
   - Bổ sung Route alias `/dashboard/san-xuat-10-nam` trong `App.jsx` và đổi nhãn trên Navbar thành **"SẢN XUẤT 10 NĂM"**.
3. **Chuẩn hóa Biểu đồ Cột (BarChart) Tiêu Chuẩn (Lược bỏ đường nối đỉnh theo yêu cầu)**:
   - Ban đầu thử nghiệm đường nối đỉnh và vùng phủ gradient dòng chảy; tuy nhiên theo yêu cầu thực tế của cấp trên để giao diện trực quan, rõ ràng và truyền thống, đã lược bỏ hoàn toàn đường nối đỉnh và vùng gradient.
   - Giữ lại cấu trúc biểu đồ cột `BarChart` tiêu chuẩn, các cột số liệu hình trụ bo góc nhẹ hiển thị sản lượng từng năm rõ ràng, thanh thoát.
4. **Tách riêng Bộ Lọc Máy cho Cắt Vải và Thành Hình, Tải Dữ Liệu Độc Lập**:
   - Xóa bỏ dropdown chọn máy chung trên Header Toolbar.
   - Đặt bộ chọn máy Cắt Vải riêng biệt ngay tại Header Card Cắt Vải (`drc-chart-head cv-head`).
   - Đặt bộ chọn máy Thành Hình riêng biệt ngay tại Header Card Thành Hình (`drc-chart-head th-head`).
   - Tách 2 hàm tải dữ liệu (`loadCv10YearData`, `loadTh10YearData`) và 2 `useEffect` độc lập: Khi lọc máy Cắt Vải thì chỉ tải lại Cắt Vải; khi lọc máy Thành Hình thì chỉ tải lại Thành Hình. Cả 2 biểu đồ luôn hiển thị song song đồng thời không làm gián đoạn nhau (chuẩn theo trang `ke-hoach-san-xuat-thang`).
   - Xóa bỏ toàn bộ các khối chú thích rỗng thừa.
5. **Đổi Phông Chữ Toàn Trang sang Arial Chuẩn Tiếng Việt**:
   - Khắc phục lỗi chữ tiếng Việt bị nhòe, méo nét, răng cưa trên dropdown `-- Tất cả máy Thành hình --`.
   - Chuyển `font-family` sang `Arial, Helvetica, sans-serif` với `-webkit-font-smoothing: antialiased`.
   - Hạ `font-weight` từ mức quá đậm `800 / 900` về mức chuẩn `600` (Semi-bold).
6. **Chuẩn Hóa & Minh Bạch Hóa Tooltip Phân Tích Dòng Chảy (Đồng nhất Số lượng & Phần trăm)**:
   - Làm rõ nguyên nhân vì sao trước đây có cột hiển thị số lượng (`+466.389`), có cột hiển thị phần trăm (`+64.2%`) (do năm trước $= 0$ không chia được %).
   - Làm rõ công thức tính tốc độ tăng trưởng $+64.2\%$ từ năm 2022 ($466.389$) lên năm 2023 ($765.772$): $\frac{299.383}{466.389} \times 100\% = 64.2\%$.
   - Nâng cấp Tooltip hiển thị đồng thời cả: Sản lượng thực tế, Số lượng tăng/giảm (+/- lốp, BTP), Tỷ lệ phần trăm tăng/giảm, kèm năm và sản lượng mốc của năm trước.
7. **Đổi Mặc Định Lịch Sử Thông Số Hoạt Động về 12 Giờ Trước (thay vì 24 Giờ)**:
   - Đổi `HOURS_BACK` từ `24` thành `12` trong cả 4 component popup lịch sử thông số hoạt động thời gian thực cho tất cả các máy (cả Thành hình và Cắt vải).
8. **Kiểm Thử & Đóng Gói (Build Verification)**:
   - Chạy lệnh `npm run build` thành công 100%, tất cả 3666 modules biên dịch không có bất kỳ lỗi nào.

---

## II. CHI TIẾT CÁC HẠNG MỤC CÔNG VIỆC ĐÃ THỰC HIỆN

### 1. Thay API Backend sang 10 Năm cho cả Cắt Vải và Thành Hình
- **Phía Thành Hình (`ThanhHinhController.java` & `ThanhHinhService`):**
  - Cập nhật API `GET /api/thanhhinh/machine/production-5-years` (lấy 10 năm liên tiếp).
  - Tham số: `selectedYear` (năm bắt đầu chu kỳ 10 năm), `maMay` (mã máy thành hình, tùy chọn).
  - Logic tự động bù giá trị 0: Nếu năm nào không có bản ghi trong Database, tự động trả về `TotalQuantity = 0`.
- **Phía Cắt Vải (`CatVaiController.java` & `CatVaiService`):**
  - Cập nhật API `GET /api/catvai/production-5-years` tương tự sang chu kỳ 10 năm liên tiếp.
  - Tự động gán 0 cho các năm thiếu dữ liệu trong Database.

---

### 2. Nâng cấp Frontend Báo Cáo Sản Xuất 10 Năm Liên Tiếp
- **File API Client:**
  - `src/api/thanhhinhApi.js`: Cập nhật hàm gọi `getProductionQuantityFor5Years` gửi năm bắt đầu chu kỳ 10 năm (`selectedYear - 9`), bổ sung alias `getProductionQuantityFor10Years`.
  - `src/api/catVaiApi.js`: Bổ sung alias `getProductionQuantityFor10YearsCatVai` đồng bộ tham số chu kỳ 10 năm.
- **Trang Giao Diện (`SanXuat5Nam.jsx`):**
  - Cập nhật mảng 10 năm `target10Years = [selectedYear - 9, ..., selectedYear]`.
  - Điều chỉnh `barSize` và khoảng cách cột để hiển thị đẹp mắt, cân đối cả 10 năm trên mọi độ phân giải.
  - Bổ sung bảng số liệu tóm tắt 10 năm bên dưới biểu đồ có `overflow-x: auto`.
- **Thanh Điều Hướng:**
  - `src/App.jsx`: Bổ sung route alias `/dashboard/san-xuat-10-nam`.
  - `src/components/Navbar/Navbar.jsx`: Đổi nhãn menu sang **"SẢN XUẤT 10 NĂM"**.

---

### 3. Chuẩn hóa Biểu đồ Cột (BarChart) Tiêu Chuẩn (Lược bỏ đường nối đỉnh theo yêu cầu)
- **Yêu cầu thực tế:** Cấp trên chỉ đạo lược bỏ các đường nối đỉnh uốn lượn và vùng bóng mờ gradient, quay về biểu đồ cột truyền thống để số liệu sản xuất từng năm hiển thị rõ ràng, quen thuộc và không bị rối mắt.
- **Triển khai kỹ thuật:**
  - Chuyển đổi từ `ComposedChart` sang Recharts `BarChart` thuần túy.
  - Loại bỏ hoàn toàn các thẻ `<Line>`, `<Area>` và các khối định nghĩa `<defs>` gradient.
  - Loại bỏ nút bấm bật/tắt dòng chảy trên thanh công cụ Header Bar để giao diện tinh gọn nhất.
  - Giữ lại cột `<Bar dataKey="sanLuong" ...>` hình trụ bo góc nhẹ, các nhãn số lượng trên đỉnh từng cột và bảng số liệu tóm tắt 10 năm bên dưới.

---

### 4. Tách Riêng Bộ Lọc Máy cho Cắt Vải và Thành Hình (Tải Độc Lập)
- **Vấn đề:** Ban đầu bộ lọc máy nằm chung ở thanh Header trên cùng khiến việc lọc máy Cắt Vải làm ảnh hưởng/mất biểu đồ Thành Hình (hoặc ngược lại).
- **Giải pháp chuẩn hóa theo trang `ke-hoach-san-xuat-thang`:**
  - Bỏ dropdown máy chung ở Header Toolbar trên cùng (chỉ giữ Năm mốc, Xem báo cáo, Mặc định, Bật/Tắt dòng chảy).
  - **Đặt dropdown Cắt Vải riêng** ngay trên Header Card Cắt Vải (`drc-chart-head cv-head`): Lọc riêng máy `ORC-CV-01` $\dots$ `07`.
  - **Đặt dropdown Thành Hình riêng** ngay trên Header Card Thành Hình (`drc-chart-head th-head`): Lọc riêng máy `Máy 01` $\dots$ `30`.
  - **Tách 2 hàm tải dữ liệu độc lập:** `loadCv10YearData` và `loadTh10YearData`.
  - **Tách 2 `useEffect` độc lập:**
    ```javascript
    // Khi chọn máy Cắt Vải -> Chỉ tải lại Cắt Vải
    useEffect(() => {
      loadCv10YearData(selectedYear, selectedCvMachine);
    }, [selectedYear, selectedCvMachine, loadCv10YearData]);

    // Khi chọn máy Thành Hình -> Chỉ tải lại Thành Hình
    useEffect(() => {
      loadTh10YearData(selectedYear, selectedThMachine);
    }, [selectedYear, selectedThMachine, loadTh10YearData]);
    ```
  - Cả 2 card biểu đồ luôn hiển thị song song đồng thời trên màn hình, không bao giờ bị ẩn đi khi chọn máy cụ thể.
  - Xóa bỏ các thẻ chú thích rỗng thừa.

---

### 5. Đổi Phông Chữ Toàn Trang sang Arial Chuẩn Tiếng Việt
- **Vấn đề:** Thẻ chọn máy hiển thị chữ tiếng Việt có dấu ("-- Tất cả máy Thành hình --") bị răng cưa, méo chữ, nhòe nét do thuộc tính `font-weight: 800 / 900` và font mặc định trên hệ thống Windows.
- **Giải pháp:**
  - Áp dụng font `Arial, Helvetica, sans-serif` cho toàn bộ trang, select, button, bảng số liệu, trục biểu đồ và tooltip.
  - Thêm thuộc tính khử răng cưa mượt mà:
    ```css
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    ```
  - Hạ `font-weight` của các thẻ `<select>` và nút bấm từ `800` về `600` (Semi-bold), giúp chữ tiếng Việt thanh thoát, tròn trịa, dấu thanh rõ ràng 100%.

---

### 6. Chuẩn Hóa Tooltip Phân Tích Tăng Trưởng Dòng Chảy
- **Vấn đề:** 
  - Tại sao năm 2022 hiển thị số lượng tăng (`+466.389`), còn năm 2023 lại hiển thị phần trăm (`+64.2%`)?
  - Tại sao từ 466.389 lên 765.772 lại ra 64.2%?
- **Nguyên nhân & Bản chất toán học:**
  - Năm 2021 có sản lượng $= 0$ nên phép tính $\frac{466.389 - 0}{0}$ không tính được %, code cũ tự động nhảy về hiển thị số lượng.
  - Năm 2023 so với năm gốc 2022: Tăng thực tế là $765.772 - 466.389 = +299.383$ lốp. Tốc độ tăng trưởng so với năm 2022 là: $\frac{299.383}{466.389} \times 100\% = 64.192\% \approx +64.2\%$.
- **Cải tiến hiển thị đồng nhất:**
  - Nâng cấp Tooltip hiển thị đồng thời cả **Số lượng tăng/giảm cụ thể** VÀ **Tỷ lệ phần trăm**:
    - **Sản xuất thực tế:** 765.772 lốp
    - **So với Năm 2022:** `↗ Tăng +299.383 lốp (+64.2%)`
    - **Mốc đối chiếu:** `(Năm 2022: 466.389 lốp)`
  - Loại bỏ hoàn toàn sự không nhất quán giữa các cột.

---

### 7. Đổi Mặc Định Lịch Sử Thông Số Hoạt Động về 12 Giờ Trước
- **Yêu cầu:** Trong popup *LỊCH SỬ THAY ĐỔI PARAMETER REALTIME*, đổi mốc thời gian mặc định từ 24 giờ trước về **12 giờ trước tính từ thời điểm hiện tại** cho tất cả các máy (cả Thành hình và Cắt vải).
- **Các component đã cập nhật:**
  1. `src/pages/ThanhHinh/RealTimeTH09History.jsx` (Nhóm máy TH-09 $\dots$ TH-30, bao gồm `ORC-TH-11`).
  2. `src/pages/ThanhHinh/RealTimeTH05History.jsx` (Nhóm máy TH-05, TH-14 $\dots$ TH-17).
  3. `src/pages/ThanhHinh/RealTimeTH02History.jsx` (Nhóm máy TH-01 $\dots$ TH-08).
  4. `src/pages/ThanhHinh/RealTimeORCVHistory.jsx` (Nhóm máy Cắt vải ORC-CV-01 đến 07).
- **Mã nguồn đã thay đổi:**
  ```javascript
  // Đổi từ 24 về 12 giờ gần nhất
  const HOURS_BACK = 12;

  const getDefaultRange = () => {
    const now = new Date();
    const from = new Date(now.getTime() - HOURS_BACK * 60 * 60 * 1000);
    return { from: toLocalDateTimeInput(from), to: toLocalDateTimeInput(now) };
  };
  ```
- **Kết quả:** Khi mở popup ở bất kỳ máy nào, mốc thời gian "Từ" sẽ tự động lùi đúng 12 tiếng tính từ thời điểm hiện tại.

---

## III. DANH SÁCH FILE ĐÃ THAY ĐỔI TRONG CA TỐI HÔM NAY

| STT | File | Nội dung thay đổi |
| :---: | :--- | :--- |
| 1 | `src/pages/Dashboard/SanXuat5Nam.jsx` | Nâng cấp 10 năm liên tiếp, ComposedChart nối đỉnh-đáy, tách riêng bộ lọc máy CV & TH, chuẩn hóa font Arial tiếng Việt, nâng cấp Tooltip hiển thị số lượng & %. |
| 2 | `src/api/thanhhinhApi.js` | Cập nhật hàm `getProductionQuantityFor5Years` lấy 10 năm, bổ sung alias `getProductionQuantityFor10Years`. |
| 3 | `src/api/catVaiApi.js` | Cập nhật hàm `getProductionQuantityFor5YearsCatVai`, bổ sung alias `getProductionQuantityFor10YearsCatVai`. |
| 4 | `src/App.jsx` | Bổ sung route alias `/dashboard/san-xuat-10-nam`. |
| 5 | `src/components/Navbar/Navbar.jsx` | Đổi nhãn menu sang "SẢN XUẤT 10 NĂM". |
| 6 | `src/pages/ThanhHinh/RealTimeTH09History.jsx` | Đổi `HOURS_BACK = 12` cho nhóm máy Thành hình TH-09 $\dots$ TH-30. |
| 7 | `src/pages/ThanhHinh/RealTimeTH05History.jsx` | Đổi `HOURS_BACK = 12` cho nhóm máy Thành hình TH-05, TH-14 $\dots$ TH-17. |
| 8 | `src/pages/ThanhHinh/RealTimeTH02History.jsx` | Đổi `HOURS_BACK = 12` cho nhóm máy Thành hình tiêu chuẩn TH-01 $\dots$ TH-08. |
| 9 | `src/pages/ThanhHinh/RealTimeORCVHistory.jsx` | Đổi `HOURS_BACK = 12` cho toàn bộ nhóm máy Cắt vải ORC-CV. |

---

## IV. KẾT QUẢ BIÊN DỊCH VÀ KIỂM THỬ

- Chạy lệnh build kiểm tra:
  ```bash
  npm run build
  ```
- **Kết quả:**
  ```text
  vite v7.1.3 building for production...
  ✓ 3666 modules transformed.
  ✓ built in 23.90s
  ```
- Toàn bộ ứng dụng biên dịch hoàn toàn thành công, không có bất kỳ lỗi nào.
