// src/pages/ThanhHinh/MayThanhHinhList.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMachinesWithStats } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import HistorySynthesis from './HistorySynthesis';
import ThanhHinhChangeHistory from '../../components/change/ThanhHinhChangeHistory';
import CatVaiChangeHistory from '../../components/change/CatVaiChangeHistory';
import { getCurrentShift, isCurrentShiftInRange } from '../../utils/shiftPolling';

/* ─── MÃ VÀ MÀU SẮC TRẠNG THÁI MÁY (Theo bảng quy ước ảnh 2) ────────────────── */
const STATUS_MAP = {
  0: { label: 'Không xác định', color: '#000000', bg: '#fff2cc', border: '#d97706' },
  1: { label: 'Chạy', color: '#ffffff', bg: '#00b050', border: '#008037' },
  2: { label: 'Dừng sản xuất', color: '#000000', bg: '#ffff00', border: '#d97706' },
  3: { label: 'Máy bị lỗi', color: '#ffffff', bg: '#ff0000', border: '#b91c1c' },
  4: { label: 'Mất kết nối PLC', color: '#ffffff', bg: '#ff9900', border: '#ea580c' },
  5: { label: 'PLC Khởi động', color: '#000000', bg: '#fce4d6', border: '#ea580c' },
  6: { label: 'Không có KH SX', color: '#000000', bg: '#fff2cc', border: '#d97706' },
  7: { label: 'App SCADA tắt', color: '#ffffff', bg: '#c65911', border: '#9a3412' },
  8: { label: 'Máy chủ SCADA tắt', color: '#ffffff', bg: '#833c0c', border: '#451a03' },
};

// Hàm lấy thông tin trạng thái từ số hoặc chuỗi
const getStatusInfo = (trangThai) => {
  if (trangThai === true) return STATUS_MAP[1];
  if (trangThai === false) return STATUS_MAP[2];
  const code = parseInt(trangThai, 10);
  if (!isNaN(code) && STATUS_MAP[code]) {
    return STATUS_MAP[code];
  }
  return STATUS_MAP[0];
};

/* ─── STYLESHEET CHUẨN MES / SCADA INDUSTRIAL ────────────────────────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }

  .mes-container {
    min-height: 100vh;
    padding: 8px 12px;
    background: #f4f6f9;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1e293b;
  }

  /* ── Tab Bar Phía Trên ── */
  .mes-tab-bar {
    display: flex;
    background: #e2e8f0;
    border-bottom: 2px solid #0056b3;
    margin-bottom: 8px;
    gap: 2px;
  }
  .mes-tab-btn {
    padding: 6px 16px;
    font-size: 11px;
    font-weight: 800;
    border: 1px solid #cbd5e1;
    border-bottom: none;
    background: #f1f5f9;
    color: #334155;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.15s ease;
    border-radius: 3px 3px 0 0;
  }
  .mes-tab-btn.active {
    background: #ffffff;
    color: #0056b3;
    border-top: 3px solid #0056b3;
    border-left: 1px solid #cbd5e1;
    border-right: 1px solid #cbd5e1;
    font-weight: 900;
  }
  .mes-tab-btn:hover:not(.active) {
    background: #e2e8f0;
  }

  /* ── Filter Bar ── */
  .mes-filter-bar {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .mes-filter-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .mes-filter-label {
    font-size: 11px;
    font-weight: 700;
    color: #334155;
    white-space: nowrap;
  }
  .mes-filter-input, .mes-filter-select {
    border: 1px solid #94a3b8;
    background: #ffffff;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 600;
    color: #0f172a;
    border-radius: 2px;
    height: 24px;
    outline: none;
  }
  .mes-filter-btn {
    background: #0056b3;
    color: #ffffff;
    border: none;
    border-radius: 2px;
    padding: 0 12px;
    height: 24px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .mes-filter-btn:hover {
    background: #004085;
  }

  /* ── Summary KPI Header Bar ── */
  .mes-summary-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
    margin-bottom: 10px;
  }
  @media (max-width: 1280px) {
    .mes-summary-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .mes-summary-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .mes-summary-head {
    padding: 3px 6px;
    font-size: 11px;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mes-summary-body {
    padding: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .mes-summary-num {
    font-size: 18px;
    font-weight: 900;
    line-height: 1.1;
  }
  .mes-summary-pct {
    font-size: 10px;
    font-weight: 700;
    margin-top: 2px;
  }

  /* Biểu đồ sản lượng Thành hình / Cắt vải ở Header */
  .mes-prod-card {
    grid-column: span 1;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    padding: 4px;
    display: flex;
    flex-direction: column;
  }
  .mes-prod-title {
    font-size: 10px;
    font-weight: 800;
    text-align: center;
    background: #f1f5f9;
    padding: 2px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 4px;
  }
  .mes-prod-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
  }
  .mes-prod-stats {
    font-size: 10px;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .mes-prod-badge {
    background: #00b050;
    color: #ffffff;
    padding: 1px 6px;
    border-radius: 2px;
    font-size: 10px;
    font-weight: 900;
    text-align: center;
    margin-bottom: 4px;
  }

  /* ── Machine Grid ── */
  .mes-machine-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  @media (max-width: 1200px) {
    .mes-machine-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 850px) {
    .mes-machine-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 550px) {
    .mes-machine-grid { grid-template-columns: 1fr; }
  }

  /* ── Machine Card Component ── */
  .mes-card {
    background: #ffffff;
    border: 1px solid #94a3b8;
    border-radius: 3px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    animation: fadein 0.2s ease-in;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .mes-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }

  /* Machine Header (3 sections banner với đường viền mờ dọc phân cách) */
  .mes-card-header {
    display: grid;
    grid-template-columns: 1.1fr 1.8fr 1.3fr;
    border-bottom: 1px solid #94a3b8;
    font-size: 11px;
    font-weight: 800;
    line-height: 24px;
    text-align: center;
  }
  .mes-card-code {
    padding: 0 4px;
    border-right: 1px solid rgba(0,0,0,0.18);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mes-card-name {
    padding: 0 4px;
    border-right: 1px solid rgba(0,0,0,0.18);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    padding-left: 6px;
  }
  .mes-card-status {
    padding: 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Machine Body (Thanh tiến độ SẢN XUẤT & KẾ HOẠCH co dãn động) */
  .mes-card-body {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
  }
  .mes-card-row {
    display: grid;
    grid-template-columns: 66px 42px 50px 1fr;
    align-items: center;
    font-size: 11px;
    padding: 3px 6px;
    border-bottom: 1px dashed #e2e8f0;
    height: 28px;
  }
  .mes-card-row:last-child {
    border-bottom: none;
  }
  .mes-card-lbl {
    font-size: 10px;
    font-weight: 900;
    color: #334155;
    text-transform: uppercase;
    border-right: 1px solid #f1f5f9;
    padding-right: 4px;
    white-space: nowrap;
  }
  .mes-card-val {
    font-size: 11.5px;
    font-weight: 900;
    color: #0f172a;
    padding-left: 4px;
    font-family: 'Consolas', 'Segoe UI', monospace;
    text-align: right;
    padding-right: 4px;
  }
  .mes-card-pct {
    font-size: 10.5px;
    font-weight: 800;
    color: #0f172a;
    text-align: right;
    border-left: 1px solid #f1f5f9;
    padding-left: 2px;
    padding-right: 4px;
  }
  .mes-card-pct-placeholder {
    border-left: 1px solid #f1f5f9;
  }

  /* Khung chứa thanh tiến độ nằm ngang */
  .mes-progress-track {
    position: relative;
    width: 100%;
    height: 14px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 1px;
    overflow: hidden;
  }
  .mes-progress-bar {
    height: 100%;
    transition: width 0.4s ease, background-color 0.4s ease;
  }
  /* Đường mốc vạch 100% Kế hoạch (nằm ở 80% độ rộng khung chứa) */
  .mes-plan-baseline-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 80%;
    width: 1px;
    background: rgba(0, 0, 0, 0.25);
    z-index: 2;
    pointer-events: none;
  }

  /* Machine Footer (QC SX, Thời gian máy chạy chia lưới mờ ô chi tiết) */
  .mes-card-footer {
    background: #ffffff;
    display: flex;
    flex-direction: column;
    font-size: 11px;
  }
  .mes-footer-line {
    display: grid;
    grid-template-columns: 112px 1fr;
    align-items: center;
    line-height: 20px;
    padding: 2px 6px;
    border-bottom: 1px dashed #e2e8f0; /* Lưới mờ ngang chia dòng footer */
  }
  .mes-footer-line:nth-child(2) {
    border-bottom: none;
  }
  .mes-footer-lbl {
    font-weight: 900;
    color: #1e40af;
    white-space: nowrap;
    font-size: 10.5px;
    border-right: 1px solid #f1f5f9; /* Lưới mờ dọc sau label QC / Thời gian */
    padding-right: 4px;
  }
  .mes-footer-val-qc {
    font-weight: 700;
    color: #0f172a;
    font-family: Arial, sans-serif;
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 6px;
  }
  .mes-runtime-group {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    font-size: 11px;
    padding-left: 4px;
  }
  .mes-runtime-hours {
    font-weight: 900;
    color: #0f172a;
  }
  .mes-runtime-unit {
    font-weight: 600;
    color: #64748b;
    margin-right: 2px;
  }
  .mes-runtime-pct {
    font-weight: 900;
    color: #0f172a;
    min-width: 48px;
    text-align: right;
    border-left: 1px solid #f1f5f9; /* Lưới mờ dọc trước % thời gian chạy */
    padding-left: 4px;
  }

  /* Thanh tiến độ đáy thẻ máy màu sắc theo trạng thái */
  .mes-bottom-bar-bg {
    height: 5px;
    background: #e2e8f0;
    border-radius: 0;
    overflow: hidden;
    margin-top: 1px;
    border-top: 1px solid #cbd5e1; /* Đường lưới phân cách viền thanh đáy */
  }
  .mes-bottom-bar-fill {
    height: 100%;
    transition: width 0.4s ease;
  }
`;

/* ─── HÀM XÁC ĐỊNH MÀU SẮC THEO TỶ LỆ SẢN XUẤT (% KH) ────────────────────────── */
// Đỏ (<20%), Cam (<40%), Cam nhạt (<60%), Xanh nhạt (60-80%), Xanh lá/cyan đậm hơn chút (80-95%), Màu KH (95-100%), Xanh đậm hơn màu KH (>100%)
const getProductionColor = (pct) => {
  if (pct < 20) return '#ff4d4f';        // Đỏ (< 20%)
  if (pct < 40) return '#ff9900';        // Cam (< 40%)
  if (pct < 60) return '#ffb74d';        // Cam nhạt (< 60%)
  if (pct < 80) return '#80d8ff';        // Xanh nhạt cyan (60% - < 80%) - đúng mẫu 62.5% trong ảnh
  if (pct < 95) return '#0284c7';        // Xanh lá/cyan đậm hơn chút (80% - < 95%)
  if (pct <= 100) return '#0070c0';       // Màu kế hoạch (95% - 100%)
  return '#003399';                      // Xanh đậm hơn màu KH (> 100%)
};

/* ─── MACHINE CARD COMPONENT (Khớp 100% hình ảnh mẫu mới) ─────────────────── */
const MachineCard = memo(({ may, onClick }) => {
  // Lấy thông tin trạng thái theo quy ước
  const statusInfo = getStatusInfo(may.TrangThai);

  // Tính tỷ lệ sản xuất vs kế hoạch
  const actual = may.sanLuongThucTe || 0;
  const plan = may.keHoach || 0;
  const rawPct = plan > 0 ? (actual / plan) * 100 : (may.tyLeDat || 0);
  const pct = Math.round(rawPct * 100) / 100;

  // Lấy màu sản xuất theo dải % quy định
  const prodColor = getProductionColor(pct);

  const planBarWidth = 80;
  const currentPlanBarWidth = plan > 0 ? planBarWidth : 0;
  const actualBarWidth = Math.min(100, Math.max(0, (pct / 100) * planBarWidth));

  // Console log phục vụ kiểm tra dữ liệu và test lỗi theo Quy tắc 3
  console.log(`>>> [MachineCard Test Log] Máy: ${may.EquipmentID || may.MaMay} | Thực tế: ${actual} / KH: ${plan} (${pct}%) | Màu SX: ${prodColor} | Độ dài thanh SX: ${actualBarWidth.toFixed(1)}% | Độ dài KH (gốc): ${planBarWidth}% | Độ dài KH áp dụng: ${currentPlanBarWidth}%`);

  // Tính Thời gian máy chạy từ dữ liệu thực tế API (TongThoiGianChay_Gio)
  const getRunTimeData = () => {
    const rawHours = may.TongThoiGianChay_Gio ?? may.thoiGianChayCa ?? 0;
    const hours = Number(rawHours) || 0;
    // Giữ nguyên giá trị thực tế trả về từ API (không dùng .toFixed(1) để tránh làm tròn 3.39 thành 3.4)
    const hoursDisplay = typeof rawHours === 'number' ? (Math.round(rawHours * 100) / 100) : rawHours;
    // Tính % thời gian chạy dựa trên mốc tiêu chuẩn 8h của 1 ca sản xuất
    const pctVal = Math.min(Math.round((hours / 8) * 10000) / 100, 100);
    return {
      hoursDisplay: hoursDisplay,
      pctDisplay: pctVal.toFixed(2) + '%',
      pctNum: pctVal
    };
  };

  const runTimeData = getRunTimeData();

  // Mã Quy cách sản xuất lấy từ API real-time (MaQuyCach từ View_ORC_PLC_ConnectStatus)
  const qcCode = may.MaQuyCach || may.QCSX || "-";

  // Console log chi tiết mã quy cách và thời gian chạy phục vụ gỡ lỗi theo Quy tắc 3
  console.log(`>>> [MachineCard Real Data] Máy: ${may.EquipmentID || may.MaMay} | MaQuyCach: '${qcCode}' | TongThoiGianChay_Gio: ${runTimeData.hoursDisplay}h (${runTimeData.pctDisplay})`);

  // Lấy mã hiển thị máy
  const rawCode = may.EquipmentID || `ORC-TH-${String(may.MaMay).replace(/\D/g, '').padStart(2, '0')}`;
  const displayCode = rawCode.includes('ORC-') ? rawCode.replace('ORC-', '') : rawCode;

  return (
    <div className="mes-card" onClick={() => onClick(may.EquipmentID || may.MaMay)}>
      {/* 1. Header 3 phần: Mã máy - Tên máy - Trạng thái */}
      <div
        className="mes-card-header"
        style={{
          background: statusInfo.bg,
          color: statusInfo.color
        }}
      >
        <div className="mes-card-code">{displayCode}</div>
        <div className="mes-card-name">
          {may.TenMay || `Máy thành hình ${may.MaMay}`}
        </div>
        <div className="mes-card-status">
          {statusInfo.label}
        </div>
      </div>

      {/* 2. Thân thẻ: SẢN XUẤT & KẾ HOẠCH với thanh tiến độ nằm ngang co dãn động */}
      <div className="mes-card-body">
        {/* Dòng SẢN XUẤT */}
        <div className="mes-card-row">
          <span className="mes-card-lbl">SẢN XUẤT</span>
          <span className="mes-card-val">{actual.toLocaleString('vi-VN')}</span>
          <span className="mes-card-pct">{pct.toFixed(2)}%</span>
          <div className="mes-progress-track">
            {/* Đường mốc vạch 100% Kế hoạch */}
            <div className="mes-plan-baseline-line" title="Mốc 100% Kế hoạch" />
            <div
              className="mes-progress-bar"
              style={{
                width: `${actualBarWidth}%`,
                background: prodColor
              }}
            />
          </div>
        </div>

        {/* Dòng KẾ HOẠCH */}
        <div className="mes-card-row">
          <span className="mes-card-lbl" style={{ color: '#0056b3' }}>KẾ HOẠCH</span>
          <span className="mes-card-val">{plan.toLocaleString('vi-VN')}</span>
          <span className="mes-card-pct-placeholder"></span>
          <div className="mes-progress-track">
            <div
              className="mes-progress-bar"
              style={{
                // Nếu kế hoạch bằng 0 thì độ dài thanh kế hoạch sẽ là 0% (để trống)
                width: `${currentPlanBarWidth}%`,
                background: '#0070c0'
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Chân thẻ: QC SX, Thời gian máy chạy & Thanh tiến độ màu ở đáy */}
      <div className="mes-card-footer">
        <div className="mes-footer-line">
          <span className="mes-footer-lbl">QC Đang SX:</span>
          <span className="mes-footer-val-qc">{qcCode}</span>
        </div>
        <div className="mes-footer-line">
          <span className="mes-footer-lbl">Thời gian máy chạy</span>
          <div className="mes-runtime-group">
            <span className="mes-runtime-hours">{runTimeData.hoursDisplay}</span>
            <span className="mes-runtime-unit">(h)</span>
            <span className="mes-runtime-pct">{runTimeData.pctDisplay}</span>
          </div>
        </div>
        {/* Thanh tiến độ thời gian chạy dưới đáy thẻ máy */}
        <div className="mes-bottom-bar-bg">
          <div
            className="mes-bottom-bar-fill"
            style={{
              width: `${runTimeData.pctNum}%`,
              background: statusInfo.bg === '#ffffff' ? '#00b050' : (statusInfo.border || statusInfo.bg)
            }}
          />
        </div>
      </div>
    </div>
  );
});

/* ─── VERTICAL DUAL BAR CHART COMPONENT (BIỂU ĐỒ 2 CỘT ĐỨNG SO SÁNH SX & KH) ─── */
const VerticalBarChart = memo(({ actual = 0, plan = 0, pct = 0 }) => {
  // Mốc 100% Kế hoạch đặt ở 75% chiều cao khung chứa (để nhường 25% phía trên cho trường hợp vượt KH > 100%)
  const planLinePct = 75;

  // Cột Kế hoạch (KH) luôn ở mốc 100% KH (chiếm 75% chiều cao khung chứa) nếu plan > 0
  const khBarHeightPct = plan > 0 ? planLinePct : 0;

  // Cột Sản xuất (SX) tính theo tỷ lệ actual / plan
  const rawRatio = plan > 0 ? (actual / plan) * planLinePct : (pct > 0 ? (pct / 100) * planLinePct : 0);
  const sxBarHeightPct = Math.min(100, Math.max(0, rawRatio));

  // Màu sắc cột SX dựa theo % đạt: Vượt KH (>100%): Xanh đậm (#003399), Đạt KH (>=80%): Xanh lá (#00b050), Đạt vừa (>=50%): Cam (#ff9900), Thấp (<50%): Đỏ (#ff0000)
  let sxBarColor = '#ff0000';
  if (pct > 100) sxBarColor = '#003399';
  else if (pct >= 80) sxBarColor = '#00b050';
  else if (pct >= 50) sxBarColor = '#ff9900';

  // Console log test lỗi & kiểm tra theo Quy tắc 3
  console.log(`>>> [Dual VerticalBarChart Log] SX: ${actual} (${sxBarHeightPct.toFixed(1)}%), KH: ${plan} (${khBarHeightPct}%), % Đạt: ${pct.toFixed(2)}% | Màu SX: ${sxBarColor}`);

  return (
    <div
      style={{
        width: '64px',
        height: '58px',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '3px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '3px 4px 2px 4px',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
      }}
      title={`Sản xuất (SX): ${actual.toLocaleString('vi-VN')} | Kế hoạch (KH): ${plan.toLocaleString('vi-VN')} (${pct.toFixed(2)}%)`}
    >
      {/* Vạch mốc 100% Kế hoạch (Nét đứt mờ ngang) */}
      <div
        style={{
          position: 'absolute',
          bottom: `calc(${planLinePct}% + 13px)`,
          left: 0,
          right: 0,
          borderTop: '1px dashed #94a3b8',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* Khung chứa 2 cột đứng song song: Cột SX trái, Cột KH phải */}
      <div
        style={{
          width: '100%',
          height: '42px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Cột 1: Sản xuất (SX) */}
        <div
          style={{
            width: '20px',
            height: `${sxBarHeightPct}%`,
            background: sxBarColor,
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.4s ease, background-color 0.3s ease'
          }}
          title={`Sản xuất (SX): ${actual.toLocaleString('vi-VN')} (${pct.toFixed(2)}%)`}
        />

        {/* Cột 2: Kế hoạch (KH) */}
        <div
          style={{
            width: '20px',
            height: `${khBarHeightPct}%`,
            background: '#0070c0',
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.4s ease'
          }}
          title={`Kế hoạch (KH): ${plan.toLocaleString('vi-VN')} (100%)`}
        />
      </div>

      {/* Nhãn 2 cột phía dưới (SX vs KH) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '9px',
          fontWeight: '900',
          marginTop: '2px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1px'
        }}
      >
        <span style={{ color: sxBarColor }}>SX</span>
        <span style={{ color: '#0070c0' }}>KH</span>
      </div>
    </div>
  );
});

/* ─── HÀM LỌC BỎ MÁY KHÔNG HIỂN THỊ (ORC-TH-04 VÀ ORC-TH-13) ──────────────── */
const isExcludedMachine = (m) => {
  const eqId = String(m?.EquipmentID || '').trim().toUpperCase();
  const maMay = String(m?.MaMay || '').trim().toUpperCase();
  const rawCode = String(m?.EquipmentID || `ORC-TH-${String(m?.MaMay || '').replace(/\D/g, '').padStart(2, '0')}`).trim().toUpperCase();

  // Máy cắt vải không bị loại bỏ
  const isCatVai = eqId.includes('-CV-') || eqId.includes('CV') || eqId.includes('ORCV') || rawCode.includes('-CV-');
  if (isCatVai) return false;

  // Kiểm tra máy Thành hình số 04 (ORC-TH-04 / 0RC-TH-04 / TH04)
  const isTH04 = eqId.includes('TH-04') || eqId.includes('TH04') || eqId === 'ORC-TH-4' || eqId === '0RC-TH-4' ||
                 maMay === '4' || maMay === '04' || maMay === 'TH04' || maMay === 'TH-04' ||
                 rawCode.includes('TH-04') || rawCode.includes('TH04');

  // Kiểm tra máy Thành hình số 13 (ORC-TH-13 / 0RC-TH-13 / TH13)
  const isTH13 = eqId.includes('TH-13') || eqId.includes('TH13') ||
                 maMay === '13' || maMay === 'TH13' || maMay === 'TH-13' ||
                 rawCode.includes('TH-13') || rawCode.includes('TH13');

  return isTH04 || isTH13;
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const MayThanhHinhList = () => {
  const navigate = useNavigate();

  // Hàm tính thời gian bắt đầu từ Ca và Ngày (Ca 3: 22h ngày hôm trước, Ca 1: 06h, Ca 2: 14h)
  const getShiftStartISO = (ca, dateStr) => {
    if (!dateStr) return '';
    const cleanCa = String(ca).trim().toUpperCase();
    if (cleanCa.includes('3') || cleanCa.includes('0')) {
      // Trừ 1 ngày đối với Ca 3 (Ca đêm bắt đầu từ 22h ngày hôm trước)
      const d = new Date(dateStr);
      d.setDate(d.getDate() - 1);
      const prevYear = d.getFullYear();
      const prevMonth = String(d.getMonth() + 1).padStart(2, '0');
      const prevDay = String(d.getDate()).padStart(2, '0');
      return `${prevYear}-${prevMonth}-${prevDay}T22:00:00`;
    }
    if (cleanCa.includes('1')) {
      return `${dateStr}T06:00:00`;
    }
    if (cleanCa.includes('2')) {
      return `${dateStr}T14:00:00`;
    }
    return `${dateStr}T00:00:00`;
  };

  // Hàm tính thời gian kết thúc từ Ca và Ngày (Ca 3: 06h ngày hôm nay, Ca 1: 14h, Ca 2: 22h ngày hôm nay)
  const getShiftEndISO = (ca, dateStr) => {
    if (!dateStr) return '';
    const cleanCa = String(ca).trim().toUpperCase();
    if (cleanCa.includes('3') || cleanCa.includes('0')) {
      return `${dateStr}T06:00:00`;
    }
    if (cleanCa.includes('1')) {
      return `${dateStr}T14:00:00`;
    }
    if (cleanCa.includes('2')) {
      return `${dateStr}T22:00:00`;
    }
    return `${dateStr}T23:59:59`;
  };

  // Hàm tạo mã YearMonthDayShift dạng YYYYMMDDS (ví dụ 202608060 cho Ca 0, 202608061 cho Ca 1, 202608062 cho Ca 2)
  const getYmdsFromCaAndDate = (caStr, dateStr) => {
    if (!dateStr) return '';
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanCa = String(caStr).trim().toUpperCase();
    let shiftNum = '0';
    if (cleanCa.includes('2')) shiftNum = '2';
    else if (cleanCa.includes('1')) shiftNum = '1';
    else if (cleanCa.includes('0')) shiftNum = '0';
    return `${cleanDate}${shiftNum}`;
  };

  // Hàm tính ca và ngày mặc định dựa trên giờ thực tế để lọc ca hiện tại
  // (dùng chung helper getCurrentShift để logic ca đồng nhất với các trang dashboard)
  const getCurrentShiftAndDate = () => {
    const current = getCurrentShift();
    const shift = `Ca ${current.ca}`;
    // Console log để theo dõi việc tính toán ca mặc định khi khởi tạo trang máy thành hình
    console.log(`>>> [MayThanhHinhList Init] Thời gian hệ thống: ${new Date().toLocaleString()}. Xác định ca mặc định: ${shift}, Ngày mặc định: ${current.dateStr}`);
    return { shift, dateStr: current.dateStr };
  };

  // Xác định thông tin ca và ngày hiện tại để gán mặc định
  const initialShiftInfo = getCurrentShiftAndDate();

  // State quản lý bộ lọc ca & ngày (Mặc định: Ca hiện tại)
  const [tuCa, setTuCa] = useState(initialShiftInfo.shift);
  const [denCa, setDenCa] = useState(initialShiftInfo.shift);
  const [fromDate, setFromDate] = useState(initialShiftInfo.dateStr);
  const [toDate, setToDate] = useState(initialShiftInfo.dateStr);

  // Ref ghi nhớ ca hệ thống của lần kiểm tra gần nhất, dùng để phát hiện thời điểm CHUYỂN CA
  // (ví dụ 14:00 Ca 1 -> Ca 2) khi người dùng để màn hình treo tường mở liên tục.
  const lastKnownSystemShiftRef = React.useRef(`${initialShiftInfo.shift}|${initialShiftInfo.dateStr}`);

  // State dữ liệu máy, tab & thời gian tự động gọi API (mặc định 20s)
  const [mayList, setMayList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('realtimeMonitor'); // realtimeMonitor, historySetting, historyRealtime, historyChange
  const [selectedChangeMachine, setSelectedChangeMachine] = useState('');

  // State quản lý tự động làm mới ngầm & thời gian gọi API
  const [refreshInterval, setRefreshInterval] = useState(20); // 20 giây mặc định (0 = Tắt)
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');

  // Ref phản chiếu số lượng máy đang hiển thị. Dùng ref thay vì đọc trực tiếp mayList.length
  // để fetchMayData giữ được tham chiếu ổn định, tránh việc mỗi lần dữ liệu thay đổi lại
  // tạo hàm mới và khiến setInterval tự động làm mới bị hủy rồi đặt lại từ đầu.
  const mayListLengthRef = React.useRef(0);
  useEffect(() => {
    mayListLengthRef.current = mayList.length;
  }, [mayList]);

  // Hàm tải dữ liệu máy từ API getMachinesWithStats (GIỮ NGUYÊN GIAO DIỆN CŨ 100% KHI ĐANG TẢI, CHỈ CẬP NHẬT KHI API HOÀN TẤT)
  const fetchMayData = useCallback(async (isBackground = false) => {
    // Validate bộ lọc trước khi gọi API
    if (fromDate === toDate) {
      const tu = parseInt(String(tuCa).replace(/\D/g, ''), 10);
      const den = parseInt(String(denCa).replace(/\D/g, ''), 10);
      if (tu > den) {
        if (isBackground !== true) {
          toast.error("Cùng một ngày, thứ tự ca không hợp lệ (phải từ 0 -> 1 -> 2)!");
        }
        console.warn(">>> [MayThanhHinhList] Validate failed: Cùng ngày nhưng ca bắt đầu lớn hơn ca kết thúc.");
        setLoading(false);
        setIsFetchingBackground(false);
        return;
      }
    }

    if (new Date(fromDate) > new Date(toDate)) {
      if (isBackground !== true) {
        toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
      }
      console.warn(">>> [MayThanhHinhList] Validate failed: Ngày bắt đầu lớn hơn ngày kết thúc.");
      setLoading(false);
      setIsFetchingBackground(false);
      return;
    }

    // Chỉ bật hiệu ứng loading toàn trang duy nhất lần đầu tiên khi chưa có dữ liệu nào
    if (mayListLengthRef.current === 0) {
      setLoading(true);
    }
    setIsFetchingBackground(true);

    // Tính mốc ISO chuẩn theo quy định Ca 0 (22h hôm trước), Ca 1 (6h), Ca 2 (14h/22h)
    const formattedFromDate = getShiftStartISO(tuCa, fromDate);
    const formattedToDate = getShiftEndISO(denCa, toDate);

    // Tạo mã YearMonthDayShift (ví dụ 202608061)
    const fromYmds = getYmdsFromCaAndDate(tuCa, fromDate);
    const toYmds = getYmdsFromCaAndDate(denCa, toDate);

    try {
      console.log(`>>> [MayThanhHinhList Shift Filter Log] Lọc theo khoảng từ ID Kế hoạch: RA10.${fromYmds} đến ID Kế hoạch: RA10.${toYmds}`);
      const res = await getMachinesWithStats({
        fromIdKehoach: 'RA10.' + fromYmds,
        toIdKehoach: 'RA10.' + toYmds
      });

      console.log(">>> [MayThanhHinhList] Kết quả mới nhận từ API getMachinesWithStats:", res);

      let newData = null;
      if (res && res.success && Array.isArray(res.data)) {
        newData = res.data;
      } else if (Array.isArray(res)) {
        newData = res;
      }

      // CHỈ CẬP NHẬT GIAO DIỆN KHI API CHẠY XONG VÀ CÓ MẢNG DỮ LIỆU HỢP LỆ
      if (newData && newData.length > 0) {
        // Lọc bỏ 2 máy ORC-TH-04 và ORC-TH-13 theo yêu cầu
        const filteredData = newData.filter(m => !isExcludedMachine(m));

        // Hiển thị ĐÚNG số liệu backend trả về, không bảo toàn số cũ khi API trả 0.
        // Backend trả success:true kèm sanLuongThucTe = 0 nghĩa là máy THỰC SỰ chưa có sản lượng
        // trong ca đang lọc (ví dụ máy vừa sang ca mới), không phải tín hiệu "thiếu dữ liệu".
        // Trường hợp API lỗi/rỗng thật thì đã có nhánh giữ nguyên màn hình cũ ở dưới.
        const normalizedData = filteredData.map(m => ({
          ...m,
          sanLuongThucTe: Number(m.sanLuongThucTe || 0),
          keHoach: Number(m.keHoach || 0)
        }));

        // Sắp xếp thứ tự máy: Máy Thành hình (TH) trước, Máy Cắt vải (CV) sau
        const sortedData = [...normalizedData].sort((a, b) => {
          const idA = a.EquipmentID || '';
          const idB = b.EquipmentID || '';
          const isTHA = idA.includes('-TH-');
          const isTHB = idB.includes('-TH-');
          if (isTHA && !isTHB) return -1;
          if (!isTHA && isTHB) return 1;
          const numA = parseInt(idA.split('-').pop(), 10) || 0;
          const numB = parseInt(idB.split('-').pop(), 10) || 0;
          return numA - numB;
        });

        console.log(`>>> [MayThanhHinhList Test Log] Đã lọc bỏ máy ORC-TH-04 và ORC-TH-13. Số máy hiển thị: ${sortedData.length}/${newData.length} (Đã loại bỏ ${newData.length - sortedData.length} máy)`);
        console.log(`>>> [MayThanhHinhList] API hoàn tất! Đã cập nhật ${sortedData.length} máy lên giao diện lúc ${new Date().toLocaleTimeString()} (bộ lọc: từ ${tuCa}/${fromDate} đến ${denCa}/${toDate})`);
        setMayList(sortedData);

        setLastUpdatedTime(new Date().toLocaleTimeString());
      } else {
        console.warn(">>> [MayThanhHinhList] API trả về dữ liệu rỗng/lỗi, tiếp tục GIỮ NGUYÊN số liệu cũ trên giao diện.");
      }
    } catch (error) {
      console.error(">>> [MayThanhHinhList] Lỗi khi gọi API getMachinesWithStats:", error);
      if (mayListLengthRef.current === 0) {
        toast.error('Lỗi kết nối tới máy chủ sản xuất');
      }
    } finally {
      setLoading(false);
      setIsFetchingBackground(false);
    }
  }, [fromDate, toDate, tuCa, denCa]);

  // Quản lý việc gọi API khi thay đổi bộ lọc
  useEffect(() => {
    fetchMayData();
  }, [fromDate, toDate, tuCa, denCa]);

  // Theo dõi thời điểm CHUYỂN CA của hệ thống (ví dụ 14:00 Ca 1 -> Ca 2).
  // Màn hình treo tường mở liên tục nhiều giờ: nếu bộ lọc vẫn dính ở ca cũ thì API sẽ trả về
  // số liệu của ca cũ (đã đóng) trong khi người xem tưởng đang nhìn ca đang chạy.
  // Vì vậy khi bộ lọc đang bám đúng MỘT ca và ca đó vừa trở thành ca quá khứ,
  // ta tự động đẩy bộ lọc sang ca mới. Người dùng chủ động lọc dải/lọc lịch sử thì KHÔNG đụng tới.
  useEffect(() => {
    const kiemTraChuyenCa = () => {
      const current = getCurrentShiftAndDate();
      const currentKey = `${current.shift}|${current.dateStr}`;

      if (currentKey === lastKnownSystemShiftRef.current) return;

      const previousKey = lastKnownSystemShiftRef.current;
      lastKnownSystemShiftRef.current = currentKey;

      // Chỉ tự nhảy ca khi bộ lọc đang là đúng 1 ca và trùng với ca hệ thống VỪA KẾT THÚC
      const dangBamCaVuaKetThuc =
        `${tuCa}|${fromDate}` === previousKey &&
        `${denCa}|${toDate}` === previousKey;

      if (!dangBamCaVuaKetThuc) {
        console.log(`>>> [MayThanhHinhList] Hệ thống chuyển ca (${previousKey} -> ${currentKey}) nhưng bộ lọc đang do người dùng tự đặt (từ ${tuCa}/${fromDate} đến ${denCa}/${toDate}). GIỮ NGUYÊN bộ lọc.`);
        return;
      }

      console.log(`>>> [MayThanhHinhList] Hệ thống chuyển ca: ${previousKey} -> ${currentKey}. Tự động chuyển bộ lọc sang ca mới và tải lại dữ liệu.`);
      setTuCa(current.shift);
      setDenCa(current.shift);
      setFromDate(current.dateStr);
      setToDate(current.dateStr);
    };

    // Kiểm tra mỗi 30 giây, đủ để bắt mốc chuyển ca mà không tạo thêm tải cho backend
    const shiftWatcherId = setInterval(kiemTraChuyenCa, 30000);
    return () => clearInterval(shiftWatcherId);
  }, [tuCa, denCa, fromDate, toDate]);

  // Quản lý chu kỳ tự động gọi API ngầm theo refreshInterval người dùng chọn
  useEffect(() => {
    if (refreshInterval <= 0) {
      console.log(">>> [MayThanhHinhList] Tự động gọi API ngầm đã được TẮT.");
      return;
    }

    // Chỉ tự động làm mới ngầm khi CA HIỆN TẠI nằm TRONG khoảng lọc đang chọn.
    // Lọc đúng 1 ca hiện tại, hoặc lọc theo dải có bao gồm ca hiện tại (ví dụ Ca 0 -> Ca 2 cùng ngày hôm nay)
    // đều được polling. Lọc hoàn toàn ở quá khứ/tương lai thì TẮT để tránh ghi đè nhầm dữ liệu ca đã đóng.
    const currentInfo = getCurrentShiftAndDate();
    const coCaHienTaiTrongBoLoc = isCurrentShiftInRange({
      fromDate,
      fromCa: tuCa,
      toDate,
      toCa: denCa
    });

    if (!coCaHienTaiTrongBoLoc) {
      console.log(`>>> [MayThanhHinhList] Bộ lọc KHÔNG chứa ca hiện tại (Hiện tại: ${currentInfo.shift}/${currentInfo.dateStr} | Đang lọc: từ ${tuCa}/${fromDate} đến ${denCa}/${toDate}). TẮT tự động gọi API ngầm.`);
      return;
    }

    console.log(`>>> [MayThanhHinhList] Bộ lọc CÓ chứa ca hiện tại (${currentInfo.shift}/${currentInfo.dateStr}). Đặt lịch tự động gọi API ngầm mỗi ${refreshInterval} giây cho khoảng lọc: từ ${tuCa}/${fromDate} đến ${denCa}/${toDate}.`);
    const intervalId = setInterval(() => {
      console.log(`>>> [MayThanhHinhList] Kích hoạt tự động cập nhật ngầm (${refreshInterval}s)...`);
      fetchMayData(true);
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [fetchMayData, refreshInterval, fromDate, toDate, tuCa, denCa]);

  // ── Tính toán các số liệu KPI tổng quan phía trên ──
  const total = mayList.length;
  const running = mayList.filter(m => parseInt(m.TrangThai, 10) === 1).length;
  const stopped = mayList.filter(m => parseInt(m.TrangThai, 10) === 2).length;
  const fault = mayList.filter(m => parseInt(m.TrangThai, 10) === 3).length;
  const plcLost = mayList.filter(m => parseInt(m.TrangThai, 10) === 4).length;
  const noPlan = mayList.filter(m => parseInt(m.TrangThai, 10) === 6 || (parseInt(m.TrangThai, 10) !== 1 && parseInt(m.TrangThai, 10) !== 2 && parseInt(m.TrangThai, 10) !== 3 && parseInt(m.TrangThai, 10) !== 4)).length;

  const calcPct = (cnt) => (total > 0 ? ((cnt / total) * 100).toFixed(2) : '0.00');

  // Phân nhóm Cắt vải & Thành hình để tính tổng sản lượng
  const catVaiList = mayList.filter(m => {
    const id = (m.EquipmentID || m.MaMay || '').toUpperCase();
    return id.includes('-CV-') || id.includes('CV') || id.includes('ORCV');
  });

  const thanhHinhList = mayList.filter(m => {
    const id = (m.EquipmentID || m.MaMay || '').toUpperCase();
    return !(id.includes('-CV-') || id.includes('CV') || id.includes('ORCV'));
  });

  const thanhHinhActual = thanhHinhList.reduce((sum, m) => sum + (m.sanLuongThucTe || 0), 0);
  const thanhHinhPlan = thanhHinhList.reduce((sum, m) => sum + (m.keHoach || 0), 0);
  const thanhHinhPct = thanhHinhPlan > 0 ? (thanhHinhActual / thanhHinhPlan) * 100 : 0;

  const catVaiActual = catVaiList.reduce((sum, m) => sum + (m.sanLuongThucTe || 0), 0);
  const catVaiPlan = catVaiList.reduce((sum, m) => sum + (m.keHoach || 0), 0);
  const catVaiPct = catVaiPlan > 0 ? (catVaiActual / catVaiPlan) * 100 : 0;

  return (
    <div className="mes-container">
      <style>{css}</style>

      {/* ── 1. HEADER TAB NAVIGATION ─────────────────────────────────────────── */}
      <div className="mes-tab-bar">
        <button
          className={`mes-tab-btn ${activeTab === 'realtimeMonitor' ? 'active' : ''}`}
          onClick={() => {
            console.log(">>> [MayThanhHinhList] Chọn Tab: TRẠNG THÁI MÁY VÀ SẢN LƯỢNG SẢN XUẤT");
            setActiveTab('realtimeMonitor');
          }}
        >
          TRẠNG THÁI MÁY VÀ SẢN LƯỢNG SẢN XUẤT
        </button>
        <button
          className={`mes-tab-btn ${activeTab === 'historySetting' ? 'active' : ''}`}
          onClick={() => {
            console.log(">>> [MayThanhHinhList] Chọn Tab: LỊCH SỬ THÔNG SỐ CÀI ĐẶT");
            setActiveTab('historySetting');
          }}
        >
          LỊCH SỬ THÔNG SỐ CÀI ĐẶT
        </button>
        <button
          className={`mes-tab-btn ${activeTab === 'historyRealtime' ? 'active' : ''}`}
          onClick={() => {
            console.log(">>> [MayThanhHinhList] Chọn Tab: LỊCH SỬ THÔNG SỐ HOẠT ĐỘNG");
            setActiveTab('historyRealtime');
          }}
        >
          LỊCH SỬ THÔNG SỐ HOẠT ĐỘNG
        </button>
        <button
          className={`mes-tab-btn ${activeTab === 'historyChange' ? 'active' : ''}`}
          onClick={() => {
            console.log(">>> [MayThanhHinhList] Chọn Tab: LỊCH SỬ THÔNG SỐ THAY ĐỔI");
            setActiveTab('historyChange');
          }}
        >
          LỊCH SỬ THÔNG SỐ THAY ĐỔI
        </button>
      </div>
      {/* ── 2. NOI DUNG TAB MONITOR TRẠNG THÁI ──────────────────────────────── */}
      {activeTab === 'realtimeMonitor' && (
        <>
          {/* Filter Bar (Lọc ca & ngày) */}
          <div className="mes-filter-bar">
            <div className="mes-filter-item">
              <span className="mes-filter-label">Từ Ca</span>
              <select className="mes-filter-select" value={tuCa} onChange={e => setTuCa(e.target.value)}>
                <option value="Ca 0">Ca 0</option>
                <option value="Ca 1">Ca 1</option>
                <option value="Ca 2">Ca 2</option>
              </select>
            </div>
            <div className="mes-filter-item">
              <span className="mes-filter-label">Ngày</span>
              <input type="date" className="mes-filter-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="mes-filter-item">
              <span className="mes-filter-label">Đến ca</span>
              <select className="mes-filter-select" value={denCa} onChange={e => setDenCa(e.target.value)}>
                <option value="Ca 0">Ca 0</option>
                <option value="Ca 1">Ca 1</option>
                <option value="Ca 2">Ca 2</option>
              </select>
            </div>
            <div className="mes-filter-item">
              <span className="mes-filter-label">ngày</span>
              <input type="date" className="mes-filter-input" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <button className="mes-filter-btn" onClick={() => fetchMayData()}>
              Hiển Thị
            </button>

            {/* Điều chỉnh thời gian tự động gọi API ngầm */}
            <div className="mes-filter-item" style={{ marginLeft: 'auto', borderLeft: '1px solid #cbd5e1', paddingLeft: '10px' }}>
              <span className="mes-filter-label" style={{ color: '#0056b3', fontWeight: '800' }}>Tự động làm mới:</span>
              <select
                className="mes-filter-select"
                value={refreshInterval}
                onChange={e => {
                  const val = Number(e.target.value);
                  console.log(`>>> [MayThanhHinhList] Người dùng cài đặt lại thời gian tự động gọi API: ${val} giây`);
                  setRefreshInterval(val);
                }}
                style={{ fontWeight: 'bold', color: '#0056b3' }}
              >
                <option value={5}>5 giây</option>
                <option value={10}>10 giây</option>
                <option value={15}>15 giây</option>
                <option value={20}>20 giây (Mặc định)</option>
                <option value={30}>30 giây</option>
                <option value={60}>60 giây (1 phút)</option>
                <option value={0}>Tắt tự động</option>
              </select>
            </div>

            {/* Trạng thái cập nhật ngầm & Thời gian cập nhật lần cuối */}
            <div className="mes-filter-item" style={{ fontSize: '10.5px', color: '#475569', fontWeight: '700', minWidth: '130px' }}>
              {isFetchingBackground ? (
                <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#d97706' }}></span>
                  Đang làm mới ngầm...
                </span>
              ) : (
                <span>
                  {lastUpdatedTime ? `Đã cập nhật: ${lastUpdatedTime}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* KPI Summary Top Bar (Khối 8 ô thống kê phía trên với nền nhạt đồng bộ) */}
          <div className="mes-summary-grid">
            {/* Tổng máy */}
            <div className="mes-summary-card">
              <div className="mes-summary-head" style={{ background: '#e2e8f0', color: '#1e293b' }}>
                Tổng máy
              </div>
              <div className="mes-summary-body" style={{ background: '#f8fafc' }}>
                <span className="mes-summary-num" style={{ color: '#0f172a' }}>{total}</span>
              </div>
            </div>

            {/* Đang chạy */}
            <div className="mes-summary-card">
              <div className="mes-summary-head" style={{ background: '#00b050', color: '#ffffff' }}>
                Đang chạy
              </div>
              <div className="mes-summary-body" style={{ background: '#e8f5e9' }}>
                <span className="mes-summary-num" style={{ color: '#008037' }}>{running}</span>
                <span className="mes-summary-pct" style={{ color: '#008037' }}>{calcPct(running)}%</span>
              </div>
            </div>

            {/* Đang dừng SX */}
            <div className="mes-summary-card">
              <div className="mes-summary-head" style={{ background: '#ffff00', color: '#000000' }}>
                Đang dừng SX
              </div>
              <div className="mes-summary-body" style={{ background: '#ffffcc' }}>
                <span className="mes-summary-num" style={{ color: '#b45309' }}>{stopped}</span>
                <span className="mes-summary-pct" style={{ color: '#b45309' }}>{calcPct(stopped)}%</span>
              </div>
            </div>

            {/* Máy bị lỗi */}
            <div className="mes-summary-card">
              <div className="mes-summary-head" style={{ background: '#ff0000', color: '#ffffff' }}>
                Máy bị lỗi
              </div>
              <div className="mes-summary-body" style={{ background: '#ffebee' }}>
                <span className="mes-summary-num" style={{ color: '#b91c1c' }}>{fault}</span>
                <span className="mes-summary-pct" style={{ color: '#b91c1c' }}>{calcPct(fault)}%</span>
              </div>
            </div>

            {/* Mất kết nối PLC */}
            <div className="mes-summary-card">
              <div className="mes-summary-head" style={{ background: '#ff9900', color: '#ffffff' }}>
                Mất kết nối PLC
              </div>
              <div className="mes-summary-body" style={{ background: '#fff3e0' }}>
                <span className="mes-summary-num" style={{ color: '#c2410c' }}>{plcLost}</span>
                <span className="mes-summary-pct" style={{ color: '#c2410c' }}>{calcPct(plcLost)}%</span>
              </div>
            </div>

            {/* Không có KH SX */}
            <div className="mes-summary-card">
              <div className="mes-summary-head" style={{ background: '#fff2cc', color: '#002060' }}>
                Không XÁC ĐỊNH
              </div>
              <div className="mes-summary-body" style={{ background: '#fffbeb' }}>
                <span className="mes-summary-num" style={{ color: '#002060' }}>{noPlan}</span>
                <span className="mes-summary-pct" style={{ color: '#002060' }}>{calcPct(noPlan)}%</span>
              </div>
            </div>

            {/* Tổng sản lượng THÀNH HÌNH */}
            <div className="mes-prod-card">
              <div className="mes-prod-title">THÀNH HÌNH</div>
              <div className="mes-prod-badge">{thanhHinhPct.toFixed(2)}%</div>
              <div className="mes-prod-content">
                <div className="mes-prod-stats">
                  <div>SX: <span style={{ fontWeight: 900 }}>{thanhHinhActual.toLocaleString('vi-VN')}</span></div>
                  <div>KH: <span style={{ fontWeight: 900 }}>{thanhHinhPlan.toLocaleString('vi-VN')}</span></div>
                </div>
                {/* Biểu đồ 2 cột đứng song song: Cột SX & Cột KH */}
                <VerticalBarChart actual={thanhHinhActual} plan={thanhHinhPlan} pct={thanhHinhPct} />
              </div>
            </div>

            {/* Tổng sản lượng CẮT VẢI */}
            <div className="mes-prod-card">
              <div className="mes-prod-title">CẮT VẢI</div>
              <div className="mes-prod-badge">{catVaiPct.toFixed(2)}%</div>
              <div className="mes-prod-content">
                <div className="mes-prod-stats">
                  <div>SX: <span style={{ fontWeight: 900 }}>{catVaiActual.toLocaleString('vi-VN')}</span></div>
                  <div>KH: <span style={{ fontWeight: 900 }}>{catVaiPlan.toLocaleString('vi-VN')}</span></div>
                </div>
                {/* Biểu đồ 2 cột đứng song song: Cột SX & Cột KH */}
                <VerticalBarChart actual={catVaiActual} plan={catVaiPlan} pct={catVaiPct} />
              </div>
            </div>
          </div>

          {/* Machine Grid (Lưới hiển thị danh sách thẻ máy) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>
              Đang tải danh sách máy và thông số giám sát...
            </div>
          ) : (
            <div className="mes-machine-grid">
              {mayList.map(may => (
                <MachineCard
                  key={may.EquipmentID || may.MaMay}
                  may={may}
                  onClick={id => {
                    const isCatVai = id.toUpperCase().includes('-CV-') || id.toUpperCase().includes('CV') || id.toUpperCase().includes('ORCV');
                    const reqFromDate = getShiftStartISO(tuCa, fromDate);
                    const reqToDate = getShiftEndISO(denCa, toDate);
                    console.log(`>>> [MayThanhHinhList] Click mở máy: ${id}, Loại máy: ${isCatVai ? 'Cắt vải' : 'Thành hình'} | ISO Range: ${reqFromDate} -> ${reqToDate}`);
                    if (isCatVai) {
                      navigate(`/dashboard/may-cat-vai/${id}?fromDate=${reqFromDate}&toDate=${reqToDate}`);
                    } else {
                      navigate(`/dashboard/may-thanh-hinh/${id}?fromDate=${reqFromDate}&toDate=${reqToDate}`);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 3. CÁC TAB LỊCH SỬ THÔNG SỐ ───────────────────────────────────────── */}
      {activeTab === 'historySetting' && (
        <HistorySynthesis mayList={mayList} type="setting" />
      )}

      {activeTab === 'historyRealtime' && (
        <HistorySynthesis mayList={mayList} type="realtime" />
      )}

      {activeTab === 'historyChange' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '4px',
          padding: '8px',
          height: 'calc(100vh - 58px)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Thanh chọn máy xem lịch sử thay đổi */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
            background: '#f8fafc',
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Chọn máy xem lịch sử thay đổi:</span>
            <select
              className="mes-filter-select"
              value={selectedChangeMachine || (mayList[0]?.EquipmentID || 'ORC-TH-01')}
              onChange={(e) => {
                console.log(`>>> [MayThanhHinhList] Chọn mã máy xem Lịch sử Thay đổi: ${e.target.value}`);
                setSelectedChangeMachine(e.target.value);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', fontWeight: 'bold', width: '220px' }}
            >
              {mayList.map(m => (
                <option key={m.EquipmentID || m.MaMay} value={m.EquipmentID || m.MaMay}>
                  {m.EquipmentID || m.MaMay} ({m.TenMay || ''})
                </option>
              ))}
            </select>
          </div>

          {/* Vùng chứa bảng lịch sử thay đổi của máy thành hình hoặc máy cắt vải */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {(() => {
              const currentMa = selectedChangeMachine || (mayList[0]?.EquipmentID || 'ORC-TH-01');
              const isCatVai = currentMa.toUpperCase().includes('CV') || currentMa.toUpperCase().includes('ORCV') || currentMa.toUpperCase().includes('CATVAI') || currentMa.toUpperCase().includes('MCV');
              console.log(`>>> [MayThanhHinhList] Render component Lịch sử Thay đổi cho máy: ${currentMa}, Loại: ${isCatVai ? 'Cắt vải' : 'Thành hình'}`);
              return isCatVai ? (
                <CatVaiChangeHistory equipmentId={currentMa} isEmbedded={true} />
              ) : (
                <ThanhHinhChangeHistory equipmentId={currentMa} isEmbedded={true} />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MayThanhHinhList;