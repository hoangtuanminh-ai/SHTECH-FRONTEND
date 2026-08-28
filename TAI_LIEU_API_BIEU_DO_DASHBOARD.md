# 📑 TÀI LIỆU CHI TIẾT: DANH SÁCH BIỂU ĐỒ & API TƯƠNG ỨNG TRÊN DASHBOARD KẾ HOẠCH

> **Dự án**: Hệ thống Giám sát & Quản lý Sản xuất MES DRC (Xưởng Cắt Vải & Thành Hình)  
> **File Giao diện chính**: `src/pages/Homepage/DashboardKeHoach.jsx`  
> **Cơ chế tải**: Realtime Polling mỗi 20 giây, 100% dữ liệu thực từ Backend API, không dùng Mock/Fallback.

---

## 🗺️ TỔNG QUAN ÁNH XẠ BIỂU ĐỒ - API (SUMMARY MAPPING TABLE)

| STT | Tên Khối / Biểu đồ trên Giao diện | Loại Biểu đồ / Hiển thị | API Function | Endpoint Backend (URL) | Tham số truyền vào (Params) | Dữ liệu chính lấy về |
|:---:|:---|:---|:---|:---|:---|:---|
| **1** | **Ảnh Trụ sở / Nhà máy DRC** | Stream Binary Image / Base64 | `getDrcMachineImageRaw`<br>`getViewOrcThMachineImageApi` | `GET /drc-image/raw`<br>`GET /api/view-orc-th-machine-image` | Không | Stream nhị phân `byte[]` ảnh JPEG hoặc Base64 |
| **2** | **Hiện trạng Thiết bị Xưởng CV-TH** | PieChart (Tròn) + Bảng Thống kê 4 trạng thái | `getMachinesWithStats` | `GET /api/thanhhinh/machine/with-stats` | `fromIdKehoach: RA10.YYYYMMDDS`<br>`toIdKehoach: RA10.YYYYMMDDS` | Danh sách máy, `TrangThai` (1: Running, 2: Stop, 3: Fault, 4: Lost Conn) |
| **3** | **Tình hình Sản xuất Trong Ca** (TH & CV) | 2 Card Mini Dual-Bar + Badge % | `getMachinesWithStats` | `GET /api/thanhhinh/machine/with-stats` | `fromIdKehoach: RA10.YYYYMMDDS`<br>`toIdKehoach: RA10.YYYYMMDDS` | `sanLuongThucTe`, `keHoach` của từng máy trong ca hiện tại |
| **4** | **Tình hình Sản xuất Trong Tháng** (TH) | Card Mini Dual-Bar + Badge % | `getDashboardStats` | `GET /api/v1/dashboard/stats` | `fromDate: YYYY-MM-01`<br>`toDate: YYYY-MM-DD` | `tongSoLuongThucTe`, `tongSoLuongKH`, `tyLeHoanThanh` (Thành Hình) |
| **5** | **Tình hình Sản xuất Trong Tháng** (CV) | Card Mini Dual-Bar + Badge % | `getCatVaiSummaryStats` | `GET /api/catvai/summary-stats` | `fromDate: YYYY-MM-01`<br>`toDate: YYYY-MM-DD` | `tongSanLuongThucTe`, `tongKeHoachHieuLuc`, `tyLeHoanThanh` (Cắt Vải) |
| **6** | **Tình hình Sản xuất Trong Năm** (TH) | Card Mini Dual-Bar + Badge % | `getDashboardStats` | `GET /api/v1/dashboard/stats` | `fromDate: YYYY-01-01`<br>`toDate: YYYY-12-31` | `tongSoLuongThucTe`, `tongSoLuongKH`, `tyLeHoanThanh` cả năm (TH) |
| **7** | **Tình hình Sản xuất Trong Năm** (CV) | Card Mini Dual-Bar + Badge % | `getCatVaiSummaryStats` | `GET /api/catvai/summary-stats` | `fromDate: YYYY-01-01`<br>`toDate: YYYY-12-31` | `tongSanLuongThucTe`, `tongKeHoachHieuLuc`, `tyLeHoanThanh` cả năm (CV) |
| **8** | **Biểu đồ KHSX Công đoạn Cắt Vải Năm** | BarChart (Cột Kế hoạch & Thực tế 12 Tháng) | `getCatVaiMonthlyStats` | `GET /api/catvai/monthly-stats` | `nam_sx: YYYY` | Mảng 12 tháng: `Thang_SX`, `TongKeHoachDieuChinh`, `TongSanLuongThucTe` |
| **9** | **Biểu đồ KHSX Công đoạn Thành Hình Năm** | BarChart (Cột Kế hoạch & Thực tế 12 Tháng) | `getKeHoachTrend` | `GET /api/thanhhinh/kehoach/trend` | `namSx: YYYY` | Mảng 12 tháng: `thang`/`thang_sx`, `tongKH`, `tongSX` |

---

## 🔍 CHI TIẾT TỪNG KHỐI & CƠ CHẾ XỬ LÝ DỮ LIỆU

### 1. Header Giám sát Thời gian thực (Live Shift Monitor)
- **Cơ chế xác định Ca / Ngày**: Sử dụng hàm `getCurrentShift()` (`src/utils/shiftPolling.js`).
  - **Ca 1**: `06:00 – 14:00` (Ngày $D$)
  - **Ca 2**: `14:00 – 22:00` (Ngày $D$)
  - **Ca 0**: `22:00 – 06:00` (Thuộc ngày kế tiếp $D+1$)
- **Mã Kế hoạch Ca**: Dạng `RA10.YYYYMMDDS` (Ví dụ `RA10.202608231` cho Ca 1 ngày 23/08/2026).
- **Đồng hồ số Live Clock**: Chạy độc lập từng giây `HH:mm:ss`, không gây re-render biểu đồ.
- **Chu kỳ Polling**: Tự động gọi lại toàn bộ API mỗi **20 giây**.

---

### 2. Khối Hiện trạng Thiết bị Xưởng CV-TH
- **Vị trí**: Khối trên cùng (Top Panel).
- **API sử dụng**: `getMachinesWithStats({ fromIdKehoach, toIdKehoach })` trong `src/api/thanhhinhApi.js`.
- **Bộ lọc nghiệp vụ**:
  - Tự động loại trừ 2 máy không sử dụng: `ORC-TH-04` và `ORC-TH-13`.
- **Logic tính toán**:
  - `Running (Xanh lá #00b050)`: Đếm máy có `TrangThai === 1`.
  - `Stop (Vàng #ffff00)`: Đếm máy có `TrangThai === 2`.
  - `Fault (Đỏ #ff0000)`: Đếm máy có `TrangThai === 3`.
  - `Lost Connection (Cam đậm #c2410c)`: Đếm máy có `TrangThai === 4`.
  - Tỷ lệ $\%$: $(\text{Số lượng máy theo trạng thái} / \text{Tổng số máy}) \times 100\%$.

---

### 3. Khối Tình hình Sản xuất Xưởng CV-TH (3 Cột)

#### 🔸 Cột 1: Tình hình sản xuất Trong Ca
- **API**: `getMachinesWithStats({ fromIdKehoach: 'RA10.' + ymds, toIdKehoach: 'RA10.' + ymds })`.
- **Thành Hình**:
  - $\text{SX} = \sum (\text{sanLuongThucTe các máy TH trong ca})$.
  - $\text{KH} = \sum (\text{keHoach các máy TH trong ca})$.
  - $\% = (\text{SX} / \text{KH}) \times 100\%$.
- **Cắt Vải**:
  - $\text{SX} = \sum (\text{sanLuongThucTe các máy CV trong ca})$.
  - $\text{KH} = \sum (\text{keHoach các máy CV trong ca})$.
  - $\% = (\text{SX} / \text{KH}) \times 100\%$.

#### 🔸 Cột 2: Tình hình sản xuất Trong Tháng
- **Khoảng thời gian**: Từ ngày đầu tháng (`YYYY-MM-01`) đến ngày cuối tháng (`YYYY-MM-DD`).
- **Thành Hình**: Gọi API `getDashboardStats(fromDateMonth, toDateMonth)`.
  - Lấy `tongSoLuongThucTe`, `tongSoLuongKH`, `tyLeHoanThanh`.
- **Cắt Vải**: Gọi API `getCatVaiSummaryStats(fromDateMonth, toDateMonth)`.
  - Lấy `tongSanLuongThucTe`, `tongKeHoachHieuLuc` (hoặc `tongKeHoachDieuChinh`), tính `%`.

#### 🔸 Cột 3: Tình hình sản xuất Trong Năm
- **Khoảng thời gian**: Từ ngày `YYYY-01-01` đến ngày `YYYY-12-31`.
- **Thành Hình**: Gọi API `getDashboardStats(fromDateYear, toDateYear)`.
  - Lấy tổng dồn cả năm: `tongSoLuongThucTe`, `tongSoLuongKH`, `tyLeHoanThanh`.
- **Cắt Vải**: Gọi API `getCatVaiSummaryStats(fromDateYear, toDateYear)`.
  - Lấy tổng dồn cả năm: `tongSanLuongThucTe`, `tongKeHoachHieuLuc`, tính `%`.

---

### 4. Biểu đồ Kế hoạch Sản xuất Công đoạn CẮT VẢI Năm (Dual BarChart)
- **API sử dụng**: `getCatVaiMonthlyStats(nam_sx)` trong `src/api/catVaiApi.js`.
- **Endpoint**: `GET /api/catvai/monthly-stats?nam_sx={nam_sx}`.
- **Xử lý dữ liệu**:
  - Duyệt qua 12 tháng (Tháng 1 $\rightarrow$ Tháng 12).
  - Khớp dữ liệu theo `Thang_SX` (hoặc `thang_sx`, `thang`).
  - **Sản lượng Kế hoạch (`slKH`)**: `TongKeHoachDieuChinh` hoặc `TongKeHoachHieuLuc`.
  - **Sản lượng Thực tế (`slTT`)**: `TongSanLuongThucTe`.
  - **Cột Kế hoạch (Màu tối Navy #1e293b)**: Vẽ mốc 100%, trên đỉnh cột hiển thị số lượng `slKH` (BTP).
  - **Cột Thực tế (Màu xanh biển sáng #0284c7)**: Vẽ chiều cao theo $\%$ đạt được, trên đỉnh cột hiển thị số lượng `slTT` (BTP).
  - **Tooltip khi rê chuột**: Hiển thị bảng chi tiết `CustomYearChartTooltip`:
    - Tên tháng / Năm
    - Kế hoạch (KH) số lượng BTP
    - Thực tế (SX) số lượng BTP
    - Tỷ lệ hoàn thành $(\%)$ có phân biệt màu sắc.

---

### 5. Biểu đồ Kế hoạch Sản xuất Công đoạn THÀNH HÌNH Năm (Dual BarChart)
- **API sử dụng**: `getKeHoachTrend(namSx)` trong `src/api/kehoachApi.js`.
- **Endpoint**: `GET /api/thanhhinh/kehoach/trend?namSx={namSx}`.
- **Xử lý dữ liệu**:
  - Duyệt qua 12 tháng (Tháng 1 $\rightarrow$ Tháng 12).
  - Khớp dữ liệu theo `thang` (hoặc `thang_sx`).
  - **Sản lượng Kế hoạch (`slKH`)**: `tongKH`.
  - **Sản lượng Thực tế (`slTT`)**: `tongSX`.
  - **Cột Kế hoạch (Màu tối Navy #1e293b)**: Vẽ mốc 100%, trên đỉnh cột hiển thị số lượng `slKH` (lốp).
  - **Cột Thực tế (Màu xanh biển sáng #0284c7)**: Vẽ chiều cao theo $\%$ đạt được, trên đỉnh cột hiển thị số lượng `slTT` (lốp).
  - **Tooltip khi rê chuột**: Hiển thị bảng chi tiết `CustomYearChartTooltip` với số lốp và tỷ lệ $\%$ hoàn thành.

---

## 🛠️ FILE NGUỒN LIÊN QUAN (SOURCE CODE REFERENCES)

1. **Giao diện Dashboard**: `src/pages/Homepage/DashboardKeHoach.jsx`
2. **API Thành Hình & Thiết bị**: `src/api/thanhhinhApi.js`
3. **API Kế hoạch Xu hướng TH**: `src/api/kehoachApi.js`
4. **API Cắt Vải**: `src/api/catVaiApi.js`
5. **API Thống kê Tổng quan**: `src/api/dashboardApi.js`
6. **Thuật toán tính Ca Sản xuất MES**: `src/utils/shiftPolling.js`
