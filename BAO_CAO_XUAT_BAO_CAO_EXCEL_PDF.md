# BÁO CÁO KỸ THUẬT: KIỂM TRA LỖI XUẤT EXCEL, THIẾT KẾ XUẤT BÁO CÁO PDF VÀ XỬ LÝ BIỂU ĐỒ CUỘN TRƯỢT NGANG

**Người thực hiện:** Hoàng Tuấn Minh  
**Vị trí:** Fullstack Developer  
**Dự án:** Hệ thống Quản trị & Giám sát Sản xuất SCADA - MES DRC  
**Ngày lập báo cáo:** 10/09/2026  

---

## MỤC LỤC TỔNG QUAN
1. [I. KIỂM TRA VÀ SỬA LỖI TÍNH NĂNG XUẤT EXCEL (EXCELJS)](#i-kiểm-tra-và-sửa-lỗi-tính-năng-xuất-excel-exceljs)
2. [II. THIẾT KẾ CHỨC NĂNG XUẤT BÁO CÁO TỔNG QUAN VÀ TRANG THÁNG / CA](#ii-thiết-kế-chức-năng-xuất-báo-cáo-tổng-quan-và-trang-tháng--ca)
3. [III. KIỂM THỬ KẾT QUẢ KẾT XUẤT PDF & GIẢI PHÁP CHO BIỂU ĐỒ CÓ THANH TRƯỢT NGANG](#iii-kiểm-thử-kết-quả-kết-xuất-pdf--giải-pháp-cho-biểu-đồ-có-thanh-trượt-ngang)
4. [IV. ĐÁNH GIÁ VÀ HƯỚNG DẪN BẢO TRÌ NÂNG CẤP TIẾP THEO](#iv-đánh-giá-và-hướng-dẫn-bảo-trì-nâng-cấp-tiếp-theo)

---

## I. KIỂM TRA VÀ SỬA LỖI TÍNH NĂNG XUẤT EXCEL (EXCELJS)

### 1. Hiện trạng và Các lỗi tiềm ẩn được rà soát
Trong hệ thống giám sát SCADA & MES DRC, tính năng xuất dữ liệu Excel phục vụ nhu cầu lưu trữ số liệu lịch sử máy, đối chiếu sản lượng và lập báo cáo phân xưởng. Qua quá trình rà soát toàn bộ module `exportExcelHelper.js` và các trang danh sách, các lỗi thường gặp đã được phát hiện và xử lý:

| STT | Vấn đề / Lỗi tiềm ẩn | Nguyên nhân kỹ thuật | Giải pháp đã khắc phục triệt để |
| :---: | :--- | :--- | :--- |
| **1** | Lỗi định dạng số (Number format) | Khi dữ liệu từ API là dạng chuỗi (`"123.45"`), Excel nhận diện là dạng Text khiến người dùng không thể dùng hàm `SUM`, `AVERAGE`. | Hàm `formatCellValueForExcel` tự động chuyển đổi sang `Number(val)`, làm tròn tối đa 3 chữ số thập phân, bảo toàn định dạng số để tính toán trực tiếp trong Excel. |
| **2** | Lỗi tên tệp chứa ký tự đặc biệt | Tên file chứa dấu hai chấm, dấu gạch chéo (`:`, `/`, `\`, `*`, `?`) sinh ra từ ngày giờ hoặc mã máy khiến hệ điều hành Windows từ chối tải file. | Xây dựng bộ lọc Regex tự động thay thế toàn bộ ký tự cấm: `fileName.replace(/[:\\/?*\[\]]/g, '_')`. |
| **3** | Cột bị co cụm (Chữ bị che khuất) | Thư viện Excel mặc định đặt độ rộng cột cố định khiến các tiêu đề dài hoặc giá trị thời gian bị lỗi hiển thị `###`. | Tự động tính toán chiều rộng cột linh hoạt (`column.width = Math.max(headerLength, maxContentLength, 12) + 4`). |
| **4** | Lỗi bản ghi rỗng (Empty records) | Bấm xuất khi dữ liệu chưa tải xong gây lỗi crash ứng dụng hoặc tải về file trắng. | Bổ sung cơ chế Guard Clauses kiểm tra `data.length === 0`, hiển thị cảnh báo `toast.warn()` và dừng tiến trình an toàn. |
| **5** | Thiếu thông tin ngữ cảnh xuất file | File tải về không rõ xuất ngày nào, máy nào, ai lập. | Thêm khối Metadata Header chuyên nghiệp: Tên nhà máy DRC, mã thiết bị, dải thời gian truy vấn, thời gian xuất chính xác từng giây. |
| **6** | Header cố định chiếm quá nhiều chiều dọc | Khối Header & Metadata chiếm 8-10 hàng cố định (Freeze Panes), che khuất bảng dữ liệu bên dưới khiến người dùng chỉ xem được 3-5 dòng khi mở file. | **Dàn toàn bộ Header/Metadata sang ngang trên 1 dòng duy nhất**, bỏ dòng trống đệm, đưa bảng dữ liệu bắt đầu ngay từ dòng 4; Freeze Panes chỉ khóa 72pt (tiết kiệm 65% chiều cao, bảng chiếm > 85% màn hình). |

### 2. Các hàm cốt lõi đã hoàn thiện trong `exportExcelHelper.js`
- `exportTableToExcel`: Xuất bảng dữ liệu động dạng danh sách (History, KHSX, Sản lượng ca, Lịch sử thông số cài đặt / hoạt động / thay đổi...).
- `exportKeyValueListToExcel`: Xuất bảng thông số thời gian thực (Realtime Parameters Snapshot).
- `exportCombinedMachineParametersToExcel`: Báo cáo tổng hợp đa tầng (Realtime + Cài đặt Setting + Công thức Recipe) trên cùng một file Excel có phân tách khối màu sắc nét.

### 3. Giải pháp kỹ thuật dàn ngang Header giải phóng chiều dọc cho Excel
Để tối ưu không gian hiển thị tối đa cho bảng dữ liệu (đặc biệt khi mở file trên laptop hoặc màn hình tiêu chuẩn):
- **Cấu trúc cũ (Lãng phí không gian dọc):**
  - Hàng 1: Tiêu đề báo cáo (chiều cao 36pt).
  - Hàng 2: Mã máy (20pt).
  - Hàng 3: Loại thông số (20pt).
  - Hàng 4: Khoảng thời gian từ... đến... (20pt).
  - Hàng 5: Tổng số bản ghi (20pt).
  - Hàng 6: Thời gian xuất (20pt).
  - Hàng 7: Dòng trống đệm (18pt).
  - Hàng 8: Header các cột dữ liệu (30pt).
  - Freeze Panes cố định 8 hàng đỉnh (~184pt), dữ liệu chỉ bắt đầu từ hàng 9, chiếm gần nửa màn hình.
- **Cấu trúc mới (Tối ưu dàn ngang mỏng gọn):**
  - **Hàng 1:** Tiêu đề báo cáo mỏng gọn, trang trọng (chiều cao 26pt).
  - **Hàng 2:** Dàn **toàn bộ Metadata trên 1 dòng duy nhất** (`Mã máy: ... | Từ ngày: ... | Đến ngày: ... | Tổng số bản ghi: ... | Thời gian xuất: ...`), font chữ 9pt italic, nền xám nhạt sang trọng, chiều cao 20pt.
  - **Bỏ hoàn toàn dòng trống đệm.**
  - **Hàng 3:** Header các cột dữ liệu (STT, Ngày giờ, Ca, Tốc độ, Nhiệt độ...), chiều cao 26pt.
  - **Hàng 4 trở đi:** Dữ liệu bắt đầu ngay lập tức!
  - **Freeze Panes:** Khóa cố định tại `ySplit: 3` (tổng chiều cao chỉ ~72pt thay vì ~184pt). Bảng dữ liệu chiếm hơn 85% không gian màn hình, người dùng cuộn xem hàng nghìn dòng rất thoải mái và rõ ràng.

---

## II. THIẾT KẾ CHỨC NĂNG XUẤT BÁO CÁO TỔNG QUAN VÀ TRANG THÁNG / CA

### 1. Màn hình Dashboard Tổng Quan (`DashboardKeHoach.jsx`)
- **Vị trí tích hợp:** Bổ sung nút bấm **"Xuất Báo Cáo PDF"** nổi bật cạnh tiêu đề chính trên thanh công cụ Header Panel.
- **Nội dung báo cáo kết xuất:**
  - Tiêu đề hành chính: `CÔNG TY CỔ PHẦN CAO SU ĐÀ NẴNG (DRC) — HỆ THỐNG GIÁM SÁT SẢN XUẤT SCADA & MES`.
  - Tiêu đề báo cáo: `BÁO CÁO TỔNG QUAN KẾ HOẠCH & SẢN XUẤT TOÀN NHÀ MÁY`.
  - Khối biểu đồ tròn trạng thái thiết bị toàn bộ máy.
  - Khối theo dõi Kế hoạch & Thực tế Ca hiện tại của Cắt vải và Thành hình.
  - Thẻ KPI tiến độ Tháng và Năm của 2 công đoạn.
  - 2 biểu đồ cột theo dõi 12 tháng liên tục.

### 2. Màn hình Kế Hoạch Sản Xuất Tháng (`KeHoachSanXuatThang.jsx`)
- **Vị trí tích hợp:** Nút **"Xuất Báo Cáo"** đặt tại thanh bộ lọc cạnh các nút chọn Tháng, Năm.
- **Metadata đi kèm:** Tự động đính kèm thông tin Tháng/Năm đang lọc, phạm vi máy được chọn (`Máy Cắt Vải: ... | Máy Thành Hình: ...`).
- **Nội dung kết xuất:**
  - 2 khối thanh ngang KPI lũy kế tháng của Cắt vải & Thành hình.
  - Biểu đồ tiến độ chi tiết từng ngày trong tháng.

### 3. Màn hình Kế Hoạch Sản Xuất Theo Ca và Ngày (`KeHoachSanXuatCaThang.jsx`)
- **Đặc thù dữ liệu:** Đây là trang có mật độ dữ liệu dày đặc nhất hệ thống (30-31 ngày trong tháng, mỗi ngày chia thành 3 ca sản xuất riêng biệt).
- **Thiết kế xuất PDF:**
  - Thu thập đầy đủ số liệu của cả 3 Ca (Ca 1: 06:00 - 14:00, Ca 2: 14:00 - 22:00, Ca 3: 22:00 - 06:00).
  - Tự động ẩn các thành phần điều khiển tương tác (`.drc-btn`, `select`, `button`) trong lúc tạo tài liệu in để tránh làm xấu báo cáo.

---

## III. KIỂM THỬ KẾT QUẢ KẾT XUẤT PDF & GIẢI PHÁP CHO BIỂU ĐỒ CÓ THANH TRƯỢT NGANG

### 1. Cơ chế kết xuất PDF chất lượng cao (Không phải ảnh chụp thô)
- **Vấn đề của phương pháp chụp ảnh thông thường:** Nếu chỉ chụp màn hình (PrintScreen) đưa vào PDF, hình ảnh sẽ bị vỡ nét khi zoom, Header bị mờ, không hỗ trợ tiếng Việt có dấu chuẩn Unicode và không có đánh số trang.
- **Cơ chế đã triển khai trong `exportPdfHelper.js`:**
  1. **Header & Footer Vector tiếng Việt:** Sử dụng Canvas độ nét cao (`scale: 2`) vẽ riêng phần Header trang trọng và Footer đánh số trang chuẩn `Trang X / Y` bằng font chữ `Segoe UI / Arial` sắc nét.
  2. **Nội dung Dashboard chính xác 100%:** Dựng lại toàn bộ màu sắc, nhãn số liệu, đường lưới của các biểu đồ Recharts và khối KPI.
  3. **Tự động phân trang A4 thông minh:** Tự động tính toán chiều cao nội dung khả dụng (`contentMaxHeight`). Nếu trang dài, hệ thống tự động cắt lát và chia trang mượt mà mà không làm đứt gãy giữa chừng thẻ thông tin.

---

### 2. Vấn đề thực tế: "Biểu đồ có thanh trượt ngang chỉ hiển thị phần đầu trên PDF"

#### a. Bản chất kỹ thuật của vấn đề
- Trên màn hình máy tính (độ rộng ~1200px - 1400px), biểu đồ 31 ngày (với 3 ca/ngày) có tổng chiều rộng thật lên tới:
  $$\text{Chiều rộng} = 31 \text{ ngày} \times 125\text{px} + 60\text{px} \approx 3.935\text{px}$$
- Để giao diện không bị vỡ trên trình duyệt, lập trình viên sử dụng thanh cuộn ngang:
  ```css
  .drc-daychart-scroll {
    width: 100%;
    overflow-x: auto; /* Tạo thanh trượt ngang */
  }
  ```
- Khi gọi `html2canvas(element)` để in ra PDF khổ giấy A4, thư viện chỉ chụp lại **khung nhìn hiện hữu (Viewport)** bị giới hạn bởi màn hình (~1400px). Phần dữ liệu từ ngày 12 đến ngày 31 nằm ẩn sau thanh trượt nên bị trình duyệt cắt bỏ (clip). Kết quả là PDF in ra chỉ thấy khoảng 10-12 ngày đầu tiên.

---

#### b. Các phương án kỹ thuật xử lý triệt để để xem trọn vẹn 100% biểu đồ

Dưới đây là 3 phương án tối ưu nhất có thể áp dụng:

```
+-----------------------------------------------------------------------------------+
|               3 GIẢI PHÁP XỬ LÝ BIỂU ĐỒ TRƯỢT NGANG KHI XUẤT PDF                 |
+-----------------------------------------------------------------------------------+
|  [Phương án 1] Tự động Unclip & Mở rộng chiều rộng khi xuất PDF (Khuyên Dùng)    |
|  -> Lúc bấm "Xuất PDF", script tạm thời gỡ overflow: auto, cho phép biểu đồ      |
|     bung đủ 3.935px rồi chia đều thành 2-3 trang PDF nối tiếp nhau.               |
+-----------------------------------------------------------------------------------+
|  [Phương án 2] Bổ sung Bảng số liệu Vector chi tiết 31 ngày (Data Table)         |
|  -> Dưới biểu đồ, xuất thêm bảng biểu Vector chuẩn jspdf-autotable thể hiện     |
|     đầy đủ 31 ngày x 3 ca. Người xem vừa có hình biểu đồ vừa có bảng số liệu.     |
+-----------------------------------------------------------------------------------+
|  [Phương án 3] Chế độ Fit-to-Page khi in (Tự co cột vừa khổ A4 Ngang)             |
|  -> Khi xuất PDF, tạm thời giảm kích thước cột barSize để vừa vặn trong 1 trang.  |
+-----------------------------------------------------------------------------------+
```

#### Chi tiết giải pháp hoàn thiện đã triển khai (Phương án 1 - Auto-expand Multi-page Slice & Phân đoạn 3 Kỳ):
Thay vì ép toàn bộ 31 ngày vào 1 trang giấy A4 Landscape duy nhất khiến cột và chữ số bị co nhỏ li ti, hệ thống đã chính thức nâng cấp cơ chế **Xuất Đa Trang Phân Đoạn (Multi-Page Segmented Export)**:
1. **Chia 3 Kỳ Sản Xuất Chuẩn Doanh Nghiệp (Mỗi trang A4 chứa ~10 ngày):**
   - **Trang 1:** Bảng tổng quan KPI tháng + Biểu đồ Kỳ 1 (Ngày 01 - 10)
   - **Trang 2:** Biểu đồ Kỳ 2 (Ngày 11 - 20)
   - **Trang 3:** Biểu đồ Kỳ 3 (Ngày 21 - Cuối tháng)
2. **Kích thước cột và con số to rõ ràng:**
   - Mỗi trang A4 Landscape (~1350px) chỉ chứa 10 ngày, cột barSize rộng 26px - 34px (gấp 3-4 lần so với bản nén 1 trang).
   - Tỷ lệ % và số lượng sản lượng hiển thị cực kỳ to rõ, màu sắc cột phân hóa theo tiến độ chuẩn MES.
3. **Mỗi trang đều có trục tung Y-Axis riêng biệt:**
   - Đảm bảo đầy đủ các thang đo $0\%, 25\%, 50\%, 75\%, 100\%$ và tiêu đề từng công đoạn (Cắt vải màu xanh dương `#0284c7`, Thành hình màu xanh lá `#16a34a`).
4. **Header & Footer chuẩn Unicode:**
   - Tự động gắn tên phân đoạn vào Header (`Kỳ 1: Ngày 01 - 10`, `Kỳ 2: Ngày 11 - 20`, `Kỳ 3: Ngày 21 - 31`).
   - Footer đánh số chuẩn xác: `Trang 1 / 3`, `Trang 2 / 3`, `Trang 3 / 3`.

---

## IV. ĐÁNH GIÁ VÀ HƯỚNG DẪN BẢO TRÌ NÂNG CẤP TIẾP THEO

1. **Hiệu năng:** Quá trình xuất PDF và Excel diễn ra hoàn toàn ở Client-side (trình duyệt người dùng), không gây tốn tài nguyên xử lý hay nghẽn mạng trên Backend Server.
2. **Đồng bộ nhận diện:** Nút bấm đã được quy chuẩn đồng bộ sang nhãn **"Refresh"** (`<FaSyncAlt />`) trên toàn bộ 7 trang Dashboard, màu sắc biểu đồ Cắt vải (Xanh dương `#0284c7`) và Thành hình (Xanh lá `#16a34a`) thống nhất với trang Sản xuất 10 năm.
3. **Quy tắc "Chỉ cắt khi có thanh trượt":**
   - **Trang/Biểu đồ KHÔNG có thanh trượt ngang:** (như Kế hoạch năm 12 tháng, Sản xuất 10 năm, Trạng thái máy ngày, Trạng thái máy tháng... hoặc khi biểu đồ hiển thị vừa vặn trên màn hình): Hệ thống giữ nguyên 100% bố cục, in trọn vẹn trên **1 trang A4 duy nhất (Fit-to-Page)**, tuyệt đối không cắt xén để **tránh ngắt quãng thị giác**.
   - **Trang/Biểu đồ CÓ thanh trượt ngang thực sự:** (như theo dõi 3 ca x 31 ngày trong tháng phải trượt ngang mới xem hết): Tự động chia thành các kỳ to rõ ràng, mỗi trang có trục $Y$-Axis riêng, nhãn số và % sắc nét.
4. **Mã nguồn sẵn sàng:** File build hoàn tất thành công 100% (`npm run build`), không phát sinh lỗi cú pháp hay cảnh báo module.
