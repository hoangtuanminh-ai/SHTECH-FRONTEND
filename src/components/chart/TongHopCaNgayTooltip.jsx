// src/components/chart/TongHopCaNgayTooltip.jsx
// Tooltip dùng chung cho biểu đồ "Thực hiện KH sản xuất theo ngày" (3 cột / ngày).
// Khi trỏ vào một cột sẽ hiện đầy đủ: Ca, Ngày, SL KH, Số lượng SX, % Thực hiện.
import React from 'react';
import { SHIFT_ORDER } from '../../utils/tongHopCaNgayChart';

const box = {
  background: '#ffffff',
  border: '1px solid #96afc8',
  borderRadius: 3,
  padding: '8px 10px',
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 11.5,
  color: '#1a3a5c',
  boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
  minWidth: 172,
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 14,
  lineHeight: '17px',
};

const labelStyle = { color: '#64748b', fontWeight: 700 };
const valueStyle = { fontWeight: 900, fontVariantNumeric: 'tabular-nums' };

const TongHopCaNgayTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  // Biểu đồ dùng <Tooltip shared={false}> nên payload chỉ chứa ĐÚNG MỘT cột (một ca)
  // mà chuột đang trỏ vào. Dò theo dataKey để biết đó là ca nào.
  const hovered = payload[0];
  const dataKey = String(hovered?.dataKey || '');
  const shift = SHIFT_ORDER.find(s => dataKey.startsWith(s.dataKey));
  if (!shift) return null;

  const row = hovered.payload || {};
  const k = shift.dataKey;

  // Lấy tên ngày từ chính dòng dữ liệu; chỉ dùng label làm phương án dự phòng,
  // vì khi shared={false} thì label không phải lúc nào cũng là tên ngày.
  const dayLabel = row.day || label;

  // Ca chưa có dữ liệu (chưa tới ca đó, hoặc không có kế hoạch) thì không hiện tooltip rỗng
  if (!row[`${k}_coDuLieu`]) return null;

  const keHoach = Number(row[`${k}_keHoach`]) || 0;
  const sanLuong = Number(row[`${k}_sanLuong`]) || 0;
  const tyLe = Number(row[`${k}_tyLe`]) || 0;

  // Ghi log console phục vụ việc kiểm tra và test lỗi khi di chuột hiển thị tooltip
  console.log(`>>> [TongHopCaNgayTooltip Test Log] Hovered column: Ngày=${dayLabel}, Ca=${shift.label}, SL KH=${keHoach}, SL SX=${sanLuong}, Tỷ lệ=${tyLe.toFixed(2)}%`);

  return (
    <div style={box}>
      {/* Tiêu đề ca và ngày */}
      <div style={{ ...rowStyle, borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 4 }}>
        <span style={{ fontWeight: 900, color: '#1565C0' }}>{shift.label}</span>
        <span style={{ fontWeight: 800, color: '#475569' }}>Ngày {dayLabel}</span>
      </div>
      {/* Thông tin số lượng kế hoạch */}
      <div style={rowStyle}>
        <span style={labelStyle}>SL KH:</span>
        <span style={valueStyle}>{keHoach.toLocaleString('vi-VN')}</span>
      </div>
      {/* Thông tin số lượng sản xuất thực tế */}
      <div style={rowStyle}>
        <span style={labelStyle}>Số lượng SX:</span>
        <span style={valueStyle}>{sanLuong.toLocaleString('vi-VN')}</span>
      </div>
      {/* Thông tin % thực hiện kế hoạch */}
      <div style={rowStyle}>
        <span style={labelStyle}>% Thực hiện:</span>
        <span style={{ ...valueStyle, color: tyLe >= 100 ? '#15803d' : (tyLe >= 80 ? '#16a34a' : '#ea580c') }}>
          {tyLe.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default TongHopCaNgayTooltip;
