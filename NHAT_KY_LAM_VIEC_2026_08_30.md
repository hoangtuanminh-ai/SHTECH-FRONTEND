# BÁO CÁO NHẬT KÝ LÀM VIỆC TRONG NGÀY
**Dự án:** Hệ thống Giám sát & Quản trị Sản xuất MES DRC  
**Người thực hiện:** Hoàng Tuấn Minh  
**Vị trí:** Fullstack Developer  
**Ngày báo cáo:** 30/08/2026  

---

## I. TỔNG QUAN CÁC HẠNG MỤC CÔNG VIỆC TRỌNG TÂM

Trong ngày làm việc hôm nay, tôi đã hoàn thành toàn diện 7 nhóm hạng mục công việc chính về **Tách biệt bộ lọc máy độc lập trên Dashboard**, **Tích hợp 4 API Backend Cắt Vải**, **Chuẩn hóa mã máy**, **Thiết kế & Tối ưu UI/UX Bảng Kế hoạch Ca**, **Hoàn thiện Biểu đồ Tròn PieChart SCADA (2 chữ số thập phân & Leader Lines)** và **Đồng bộ quy chuẩn hiển thị Ca sản xuất**:

1. **Tách riêng biệt Bộ Lọc Máy cho từng biểu đồ trên tất cả các trang Dashboard**:
   - Tách bộ lọc máy độc lập cho từng công đoạn ngay tại tiêu đề từng biểu đồ (Cắt vải riêng, Thành hình riêng).
   - Khi lọc máy Cắt Vải thì **chỉ tải lại biểu đồ Cắt Vải, hoàn toàn không làm mất hoặc ảnh hưởng đến biểu đồ Thành Hình** và ngược lại.
   - Bố cục bộ lọc dạt hẳn sang bên phải card, tinh gọn nhãn thừa ("Lọc máy CV/TH:") giúp giao diện hiện đại, thoáng mắt.
2. **Tích hợp hoàn chỉnh 4 API Backend Mới độc lập cho công đoạn Cắt Vải**:
   - `GET /api/catvai/production-5-years`: Biểu đồ sản lượng 5 năm Cắt Vải.
   - `GET /api/catvai/monthly-stats-for-year`: Biểu đồ thực hiện kế hoạch 12 tháng Cắt Vải.
   - `GET /api/catvai/daily-stats-for-month`: Biểu đồ thực hiện kế hoạch các ngày trong tháng Cắt Vải.
   - `GET /api/catvai/shift-stats-for-month`: Biểu đồ thực hiện kế hoạch 3 ca của các ngày trong tháng Cắt Vải & Biểu đồ ca theo ngày trên Dashboard Máy Cắt Vải.
3. **Chuẩn hóa mã máy Cắt Vải sang định dạng 2 chữ số (`01`, `02`, `03`...)**:
   - Viết hàm xử lý tự động chuyển đổi các tiền tố (`ORC-CV-01` $\rightarrow$ `01`, `CV-02` $\rightarrow$ `02`...) giúp Backend truy vấn chính xác 100% trong CSDL.
4. **Khắc phục lỗi mất dữ liệu "Quy cách vải đang cắt" trên Chi tiết Máy Cắt Vải (`MayCatVaiDashboard.jsx`)**:
   - Truyền state từ danh sách sang chi tiết, bổ sung cơ chế Fallback tự động gọi API nạp thông tin quy cách khi truy cập trực tiếp bằng URL.
5. **Chuẩn hóa & Làm đẹp Bảng "Theo dõi kế hoạch sản xuất trong ca" của Máy Cắt Vải**:
   - Khắc phục lỗi tiêu đề cột dính chữ `MÃ QUY CÁCHQUY CÁCH VẢI` trên Desktop.
   - Xóa bỏ nhãn chữ `Vượt KH` thừa; cố định chiều rộng số phần trăm để **toàn bộ thanh tiến độ có chiều dài bằng nhau 100%**, các vạch mốc 100% thẳng tắp.
   - Xóa bỏ dòng chữ chú thích thừa `⟷ Vuốt ngang xem bảng`.
6. **Nâng cấp Biểu đồ Tròn PieChart Trạng thái SCADA**:
   - Khắc phục lỗi lát màu da (`#fff2cc` - Không xác định) bị ẩn nhãn %: Hạ ngưỡng lọc hiển thị, mọi lát có dữ liệu $> 0\%$ đều được vẽ nhãn.
   - Bổ sung cơ chế Leader Line 4 tầng so le chống đè chữ ở các góc hẹp có nhiều lát nhỏ.
   - Định dạng hiển thị **2 chữ số thập phân (`.toFixed(2)`)** cho toàn bộ các lát (ví dụ `1.14%`, `39.32%`, `0.04%`).
7. **Đồng bộ quy ước hiển thị Ca 3 (Mã ca `0` / `3` $\rightarrow$ luôn hiển thị "Ca 3")**:
   - Chuẩn hóa trên toàn bộ biểu đồ, tooltip và bảng chú giải của hệ thống, tuyệt đối không hiển thị "Ca 0" cho người dùng.
8. **Kiểm thử & Đóng gói Production**: Biên dịch hoàn tất bản build `npm run build` thành công 100%.

---

## II. CHI TIẾT CÔNG VIỆC VÀ KẾT QUẢ ĐẠT ĐƯỢC

### 1. Tách riêng biệt Bộ Lọc Máy cho từng đồ thị ở các trang Dashboard
- **Các trang áp dụng:**
  - `/dashboard/ke-hoach-san-xuat-nam` ([KeHoachSanXuatNam.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/KeHoachSanXuatNam.jsx))
  - `/dashboard/ke-hoach-san-xuat-thang` ([KeHoachSanXuatThang.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/KeHoachSanXuatThang.jsx))
  - `/dashboard/ke-hoach-san-xuat-ca-thang` ([KeHoachSanXuatCaThang.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/KeHoachSanXuatCaThang.jsx))
  - `/dashboard/san-xuat-5-nam` ([SanXuat5Nam.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/SanXuat5Nam.jsx))
- **Vấn đề trước khi sửa:**
  - Trước đây 2 biểu đồ (Cắt vải và Thành hình) dùng chung một ô chọn máy ở thanh Toolbar trên cùng. Khi người dùng lọc máy Cắt Vải thì biểu đồ Thành Hình bị mất số liệu (hoặc ngược lại), gây gián đoạn trải nghiệm theo dõi đồng thời cả 2 công đoạn.
- **Giải pháp xử lý:**
  - **Tách State độc lập:** Quản lý riêng `selectedCvMachine` (Máy Cắt vải) và `selectedThMachine` (Máy Thành hình).
  - **Đặt bộ lọc ngay tại Card Header từng biểu đồ:**
    - Biểu đồ Cắt Vải: Có bộ chọn danh sách máy Cắt Vải riêng (`ORC-CV-01` $\dots$ `ORC-CV-07`).
    - Biểu đồ Thành Hình: Có bộ chọn danh sách máy Thành Hình riêng (`Máy 01` $\dots$ `Máy 30`).
  - **Độc lập luồng tải dữ liệu (Independent Data Fetching):**
    - Khi thay đổi máy Cắt Vải $\rightarrow$ Chỉ gọi API Cắt Vải tương ứng và vẽ lại biểu đồ Cắt Vải. Biểu đồ Thành Hình giữ nguyên dữ liệu.
    - Khi thay đổi máy Thành Hình $\rightarrow$ Chỉ gọi API Thành Hình tương ứng và vẽ lại biểu đồ Thành Hình. Biểu đồ Cắt Vải giữ nguyên dữ liệu.
  - **Tối ưu vị trí UI:** Đẩy ô chọn máy dạt hẳn sang góc phải của Card Header, xóa bỏ các nhãn text rườm rà ("Lọc máy CV/TH:") để giao diện liền mạch, tinh tế.

---

### 2. Tích hợp 4 API Backend Mới độc lập cho công đoạn Cắt Vải
- **Mục tiêu:** Cung cấp nguồn dữ liệu chuẩn xác từ Database cho từng cấp độ thời gian (5 năm, 12 tháng, các ngày trong tháng, từng ca trong tháng).
- **Chi tiết các API đã tích hợp:**
  1. **API Sản lượng 5 năm Cắt Vải** (`getProductionQuantityFor5YearsCatVai`):
     - Endpoint: `GET /api/catvai/production-5-years?selectedYear={year}&maMay={maMay}`
     - Trang áp dụng: [SanXuat5Nam.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/SanXuat5Nam.jsx)
  2. **API Kế hoạch các tháng trong năm Cắt Vải** (`getMonthlyStatsForYearCatVai`):
     - Endpoint: `GET /api/catvai/monthly-stats-for-year?nam_sx={nam_sx}&maMay={maMay}`
     - Trang áp dụng: [KeHoachSanXuatNam.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/KeHoachSanXuatNam.jsx)
  3. **API Kế hoạch các ngày trong tháng Cắt Vải** (`getDailyStatsForMonthCatVai`):
     - Endpoint: `GET /api/catvai/daily-stats-for-month?nam_sx={nam_sx}&thang_sx={thang_sx}&maMay={maMay}`
     - Trang áp dụng: [KeHoachSanXuatThang.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/KeHoachSanXuatThang.jsx)
  4. **API Kế hoạch 3 ca của tháng Cắt Vải** (`getShiftStatsForMonthCatVai`):
     - Endpoint: `GET /api/catvai/shift-stats-for-month?nam_sx={nam_sx}&thang_sx={thang_sx}&maMay={maMay}`
     - Trang áp dụng:
       - [KeHoachSanXuatCaThang.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/Dashboard/KeHoachSanXuatCaThang.jsx) (Trang Theo dõi KHSX theo ca & ngày)
       - [MayCatVaiDashboard.jsx](file:///d:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/ThanhHinh/MayCatVaiDashboard.jsx) (Khối Biểu đồ "Thực hiện KH theo ngày" của máy cắt vải)

---

### 3. Chuẩn hóa mã máy `maMay` Cắt Vải sang định dạng 2 chữ số (`01`, `02`, `03`...)
- **Vấn đề:** Trên giao diện Frontend, mã máy Cắt Vải có dạng `ORC-CV-01`, `ORC-CV-02`, nhưng Backend yêu cầu tham số `maMay` gửi lên chỉ được là chuỗi 2 chữ số (`01`, `02`...).
- **Giải pháp:**
  - Viết hàm `normalizeCatVaiMachineCode(maMay)` trực tiếp trong `src/api/catVaiApi.js`:
    ```javascript
    export const normalizeCatVaiMachineCode = (maMay) => {
      if (!maMay) return null;
      const str = String(maMay).trim();
      if (!str) return null;
      const match = str.match(/\d+/);
      if (match) return match[0].padStart(2, '0');
      return str;
    };
    ```
  - Áp dụng tự động bên trong tất cả các hàm gọi API Cắt Vải, đảm bảo Frontend luôn gửi đúng tham số chuẩn `maMay=01`, `02`... mà không làm ảnh hưởng đến mã máy hiển thị trên giao diện người dùng.

---

### 4. Sửa lỗi "Quy cách vải đang cắt: Không có dữ liệu" trên Máy Cắt Vải
- **Đường dẫn:** `src/pages/ThanhHinh/MayCatVaiDashboard.jsx` & `MayThanhHinhList.jsx`.
- **Vấn đề:** Khi bấm vào chi tiết máy cắt vải từ danh sách máy, ô "QUY CÁCH VẢI ĐANG CẮT" bị báo "Không có dữ liệu".
- **Giải pháp:**
  - Bổ sung truyền `state` trong `navigate('/thanh-hinh/cat-vai/' + may.MaMay, { state: { machine: may, maQuyCach: may.MaQuyCach || may.QCSX, tenQuyCach: may.TenQuyCach } })` ở `MayThanhHinhList.jsx`.
  - Trong `MayCatVaiDashboard.jsx`: Đón nhận `location.state`, đồng thời bổ sung cơ chế Fallback gọi API `getMachinesWithStats()` để tự động lấy `realtimeMaQuyCach` và `tenVai` nếu người dùng truy cập trực tiếp bằng URL hoặc F5 lại trang.

---

### 5. Chuẩn hóa giao diện Bảng "Theo dõi kế hoạch sản xuất trong ca" của Máy Cắt Vải
- **Đường dẫn:** `src/pages/ThanhHinh/MayCatVaiDashboard.jsx`.
- **Các cải tiến đã thực hiện:**
  - **Sửa lỗi dính tiêu đề cột:** Chuyển toàn bộ CSS `.th-split`, `.th-ca-table`, `.th-table-responsive` ra phạm vi CSS toàn cục, giúp bảng trên Desktop có đầy đủ viền, padding và tiêu đề tách biệt rõ ràng (`MÃ QUY CÁCH` và `QUY CÁCH VẢI`).
  - **Làm đều 100% các thanh tiến độ:**
    - Xóa bỏ nhãn chữ `Vượt KH` thừa (người dùng nhìn vào thanh tiến độ và vạch mốc 100% là nhận biết được ngay).
    - Cố định độ rộng khung chứa số phần trăm: `minWidth: '58px'`, `textAlign: 'right'`.
    - Toàn bộ thanh tiến độ `flex: 1` ở mọi dòng (kể cả dòng dữ liệu và dòng **TỔNG CỘNG**) đều có **chiều dài bằng nhau 100%**, các vạch mốc 100% thẳng hàng tắp từ trên xuống dưới.
  - **Xóa dòng chú thích thừa:** Xóa bỏ tag `⟷ Vuốt ngang xem bảng` trên cả 2 trang Chi tiết máy Thành Hình và Cắt Vải.

---

### 6. Nâng cấp Biểu đồ Tròn PieChart Trạng thái SCADA
- **Đường dẫn:** `MayCatVaiDashboard.jsx` và `MayThanhHinhDashboard.jsx`.
- **Vấn đề & Yêu cầu:**
  - Lát màu da (`#fff2cc` - trạng thái *Không xác định*) có kích thước nhỏ nhưng không hiển thị đường kẻ và số % ra bên ngoài.
  - Cần hiển thị phần trăm chi tiết đến **2 chữ số phần thập phân** (ví dụ `1.14%`).
- **Giải pháp xử lý:**
  - **Hạ ngưỡng lọc hiển thị:** Thay đổi điều kiện lọc từ `percent < 0.002` (0.2%) thành `percent <= 0.0001` (0.01%), đảm bảo tất cả các lát có dữ liệu $> 0\%$ đều được vẽ nhãn.
  - **Cơ chế Leader Line 4 tầng so le:** Tăng bậc vươn ra ngoài (`tier = index % 4`) để khi có nhiều lát nhỏ liên tiếp nằm sát nhau ở góc 11h - 12h (như 4.53%, 1.88%, 0.04%), các đường kẻ và nhãn % không bị đè lên nhau.
  - **Định dạng 2 chữ số thập phân:** Cập nhật công thức nhãn `${(percent * 100).toFixed(2)}%` cho toàn bộ các lát bánh trên biểu đồ tròn.

---

### 7. Đồng bộ quy chuẩn hiển thị Ca 3 (Mã ca `0` / `3` $\rightarrow$ luôn hiển thị "Ca 3")
- **Đường dẫn:** `src/utils/tongHopCaNgayChart.js`, `TongHopCaNgayTooltip.jsx`, `KeHoachSanXuatCaThang.jsx`, `MayCatVaiDashboard.jsx`.
- **Giải pháp:**
  - Chuẩn hóa logic nhận mã ca: Bất kể Backend trả về `Shift: 0`, `Shift: 3`, `CaSX: 0`, `CaSX: 3` hay ký tự cuối `0`/`3` trong `yearMonthDayShift`, hệ thống đều tự động gán vào thuộc tính `ca3` (Ca 3: 22:00 – 06:00).
  - Trên toàn bộ giao diện, nhãn cột, chú giải (Legend) và Tooltip khi rê chuột vào cột: Luôn hiển thị chuẩn xác là **Ca 3**, tuyệt đối không hiển thị "Ca 0" cho người dùng.

---

## III. TỔNG KẾT & TRẠNG THÁI HỆ THỐNG

- **Trạng thái Build:** Chạy lệnh `npm run build` thành công 100% (Vite production build hoàn tất không lỗi cú pháp, lint hay runtime error).
- **Danh mục các file đã chỉnh sửa & hoàn thiện:**
  1. `src/api/catVaiApi.js`: Bổ sung 4 API Cắt vải mới và hàm chuẩn hóa mã máy `normalizeCatVaiMachineCode`.
  2. `src/utils/tongHopCaNgayChart.js`: Hỗ trợ linh hoạt 2 format dữ liệu ca và chuẩn hóa quy ước Ca 3.
  3. `src/pages/Dashboard/SanXuat5Nam.jsx`: Tách bộ lọc máy riêng cho Cắt vải / Thành hình và tích hợp API 5 năm Cắt vải mới.
  4. `src/pages/Dashboard/KeHoachSanXuatNam.jsx`: Tách bộ lọc máy riêng cho Cắt vải / Thành hình và tích hợp API kế hoạch 12 tháng Cắt vải mới.
  5. `src/pages/Dashboard/KeHoachSanXuatThang.jsx`: Tách bộ lọc máy riêng cho Cắt vải / Thành hình và tích hợp API kế hoạch ngày Cắt vải mới.
  6. `src/pages/Dashboard/KeHoachSanXuatCaThang.jsx`: Tách bộ lọc máy riêng cho Cắt vải / Thành hình, tích hợp API ca tháng Cắt vải mới và đồng bộ hiển thị Ca 3.
  7. `src/pages/ThanhHinh/MayThanhHinhList.jsx`: Truyền state đầy đủ khi chuyển sang chi tiết máy Cắt vải.
  8. `src/pages/ThanhHinh/MayCatVaiDashboard.jsx`:
     - Tích hợp API ca tháng mới cho biểu đồ thực hiện KH theo ngày.
     - Sửa lỗi hiển thị quy cách vải đang cắt.
     - Chuẩn hóa CSS bảng kế hoạch ca, làm đều 100% thanh tiến độ, xóa nhãn `Vượt KH` và chữ `Vuốt ngang`.
     - Nâng cấp PieChart SCADA hiển thị lát nhỏ và 2 chữ số thập phân.
  9. `src/pages/ThanhHinh/MayThanhHinhDashboard.jsx`:
     - Làm đều thanh tiến độ cột % hoàn thành, xóa nhãn `Vượt KH` và chữ `Vuốt ngang`.
     - Nâng cấp PieChart SCADA hiển thị lát nhỏ và 2 chữ số thập phân.

---

## IV. KẾ HOẠCH CÔNG VIỆC NGÀY TIẾP THEO (31/08/2026)

1. **Rà soát & Kiểm thử toàn diện toàn bộ hệ thống (End-to-End System Testing & Bug Fixing)**:
   - Rà soát tất cả các màn hình Dashboard (Tổng quan, KHSX Năm, KHSX Tháng, KHSX Ca/Ngày, Sản xuất 5 Năm, Chi tiết máy Cắt vải, Chi tiết máy Thành hình).
   - Kiểm tra kỹ các trường hợp biên (Edge Cases): Bộ lọc thời gian quá khứ/tương lai, máy không có dữ liệu, trường hợp API phản hồi chậm hoặc lỗi mạng.
   - Sửa chữa và khắc phục triệt để các lỗi phát sinh (nếu có).
2. **Kiểm tra tính nhất quán & độ chính xác của dữ liệu**:
   - Đối chiếu số liệu giữa Backend CSDL và biểu đồ Frontend để đảm bảo tính đồng bộ 100% giữa Kế hoạch điều chỉnh, Sản lượng thực tế và Tỷ lệ thực hiện.
3. **Tối ưu hóa hiệu năng & Trải nghiệm người dùng**:
   - Dọn dẹp các log console thừa, tối ưu re-render và chuẩn hóa hiệu ứng chuyển trang mượt mà.
4. **Hỗ trợ & Tiếp nhận phản hồi từ bộ phận vận hành / Nhà máy**:
   - Theo dõi hệ thống chạy thực tế và sẵn sàng tinh chỉnh theo yêu cầu phát sinh.
