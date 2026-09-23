import React from 'react';
import ViewOrcThanhHinhNhap from './ViewOrcThanhHinhNhap.jsx';

// Bản tổng hợp theo ca dùng nguyên giao diện và logic của View ORC Thành hình nhập.
// API xuất báo cáo sẽ được bổ sung sau; hiện tại chỉ hiển thị nút trên thanh công cụ.
const BaoCaoTongHopTheoCa = () => (
  <ViewOrcThanhHinhNhap showExportReportButton autoLoadWithDefaultDates />
);

export default BaoCaoTongHopTheoCa;
