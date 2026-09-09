// src/pages/Homepage/DashboardKeHoach.jsx
// Trang Dashboard Kế hoạch Tổng quan xưởng Cắt vải & Thành hình (CV-TH)
// Thiết kế chuẩn theo giao diện giám sát sản xuất MES DRC
// Hoàn toàn sử dụng 100% dữ liệu thực từ Backend API, KHÔNG DÙNG DỮ LIỆU GIẢ / MOCK / FALLBACK
// Khi API lỗi hoặc chưa có dữ liệu sẽ ghi log chi tiết ra console.error để hỗ trợ test/debug
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import dayjs from 'dayjs';

// Import các API chính thức của dự án
import { getMachinesWithStats, getDrcMachineImageRaw, getViewOrcThMachineImageApi } from '../../api/thanhhinhApi';
import { getKeHoachTrend } from '../../api/kehoachApi';
import { getCatVaiMonthlyStats, getCatVaiSummaryStats } from '../../api/catVaiApi';
import { FaFilePdf } from 'react-icons/fa';
import { exportDashboardToPDF } from '../../utils/exportPdfHelper';
import { getCurrentShift } from '../../utils/shiftPolling';

/* ─── MES DESKTOP STYLE (ĐỒNG BỘ DRC SYSTEM) ──────────────────────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .mes-fade { animation: fadein 0.25s ease both; }

  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }
  .pulse-dot {
    animation: pulse 2s infinite ease-in-out;
  }

  .drc-dash {
    min-height: 100vh;
    padding: 10px 14px;
    background: #f0f4f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #1e293b;
  }
  .drc-dash, .drc-dash * {
    font-family: Arial, Helvetica, sans-serif !important;
  }

  /* ── Header tiêu đề & Thanh trạng thái thời gian thực ── */
  .drc-header-title {
    font-size: 15px;
    font-weight: 900;
    color: #1a3a5c;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 8px;
    margin-bottom: 10px;
    border-bottom: 2px solid #96afc8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* ── Khối Thẻ Panel chung ── */
  .drc-panel {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    overflow: hidden;
    margin-bottom: 12px;
  }
  .drc-panel-title {
    background: #eef5fc;
    border-bottom: 1px solid #cbd5e1;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 800;
    color: #1a3a5c;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  /* ── Khối 1: Hiện trạng thiết bị ── */
  .drc-top-grid {
    display: grid;
    grid-template-columns: 460px 1fr;
    gap: 16px;
    align-items: center;
    padding: 10px 14px;
  }
  @media (max-width: 1024px) {
    .drc-top-grid { grid-template-columns: 1fr; }
  }

  .drc-factory-img-wrap {
    width: 100%;
    height: 195px;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #cbd5e1;
    background: #f1f5f9;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .drc-factory-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .drc-equip-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .drc-equip-status-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    width: 100%;
    flex-wrap: wrap;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 10px 18px;
  }

  .drc-equip-legend-table {
    border-collapse: collapse;
    font-size: 12.5px;
    font-weight: 700;
    min-width: 200px;
  }
  .drc-equip-legend-table td {
    padding: 4px 8px;
    white-space: nowrap;
  }
  .drc-legend-chip {
    display: inline-block;
    width: 13px;
    height: 13px;
    margin-right: 7px;
    border-radius: 2px;
    vertical-align: middle;
  }

  /* ── Khối 2: Tình hình sản xuất 3 cột (Ca, Tháng, Năm) ── */
  .drc-prod-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 10px 12px;
  }
  @media (max-width: 992px) {
    .drc-prod-grid { grid-template-columns: 1fr; }
  }

  .drc-prod-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .drc-prod-card-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 8px;
    background: #ffffff;
  }
  .drc-sub-prod {
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #f8fafc;
  }
  .drc-sub-title {
    font-size: 11.5px;
    font-weight: 900;
    color: #1e293b;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .drc-sub-badge {
    background: #00b050;
    color: #ffffff;
    padding: 3px 6px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 900;
    text-align: center;
  }
  .drc-sub-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
  .drc-sub-stats {
    font-size: 11.5px;
    font-weight: 800;
    color: #334155;
    line-height: 1.45;
  }
  .drc-prod-card-footer {
    text-align: center;
    font-size: 12.5px;
    font-weight: 800;
    color: #1a3a5c;
    padding: 7px 8px;
    background: #eef5fc;
    border-top: 1px solid #cbd5e1;
  }

  /* ── Khối 3: Biểu đồ theo dõi KHSX năm ── */
  .drc-year-chart-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    margin-bottom: 12px;
    overflow: hidden;
  }
  .drc-year-chart-head {
    font-size: 12.5px;
    font-weight: 900;
    color: #1a3a5c;
    text-transform: uppercase;
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .drc-year-chart-scroll-hint {
    font-size: 10.5px;
    font-weight: 700;
    color: #0284c7;
    text-transform: none;
    letter-spacing: 0;
    display: none;
  }
  @media (max-width: 768px) {
    .drc-year-chart-scroll-hint { display: inline-block; }
  }
  .drc-year-chart-body {
    padding: 10px 12px 6px 6px;
    height: 260px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: #0284c7 #f1f5f9;
    -webkit-overflow-scrolling: touch;
  }
  .drc-year-chart-body::-webkit-scrollbar {
    height: 6px;
  }
  .drc-year-chart-body::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  .drc-year-chart-body::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 3px;
  }
  .drc-year-chart-canvas {
    width: 100%;
    min-width: 100%;
    height: 100%;
    position: relative;
  }
  @media (max-width: 768px) {
    .drc-year-chart-canvas {
      width: 1080px;
      min-width: 1080px;
    }
  }
  .drc-chart-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    font-size: 11px;
    font-weight: 800;
    color: #334155;
    padding-bottom: 6px;
  }
`;

/* ─── Đồng hồ số thời gian thực tách biệt (Tránh Re-render toàn trang) ────── */
const LiveClockBadge = React.memo(() => {
  const [timeStr, setTimeStr] = useState(() => dayjs().format('HH:mm:ss'));
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(dayjs().format('HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span style={{ color: '#0f172a', fontWeight: 'bold' }}>⏰ {timeStr}</span>;
});

/* ─── Helper loại bỏ 2 máy ORC-TH-04 và ORC-TH-13 ────────────────────────── */
const isExcludedMachine = (machine) => {
  if (!machine) return false;
  const rawId = String(machine.EquipmentID || machine.maMay || machine.MaMay || machine.equipmentId || '').toUpperCase().trim();
  const cleanId = rawId.replace(/[^A-Z0-9]/g, '');
  const isMachine04 = rawId === 'ORC-TH-04' || rawId === '0RC-TH-04' || rawId === 'TH-04' || rawId === 'TH04' || cleanId === 'ORCTH04' || cleanId === '0RCTH04' || cleanId === 'TH04';
  const isMachine13 = rawId === 'ORC-TH-13' || rawId === '0RC-TH-13' || rawId === 'TH-13' || rawId === 'TH13' || cleanId === 'ORCTH13' || cleanId === '0RCTH13' || cleanId === 'TH13';
  return isMachine04 || isMachine13;
};

/* ─── Helper tạo mã YYYYMMDDS dạng 202608231 ─────────────────────────────── */
const getYmdsFromCaAndDate = (caStr, dateStr) => {
  if (!dateStr) return '';
  const cleanDate = String(dateStr).replace(/-/g, '');
  const cleanCa = String(caStr).trim().toUpperCase();
  let shiftNum = '1';
  if (cleanCa.includes('2')) shiftNum = '2';
  else if (cleanCa.includes('1')) shiftNum = '1';
  else if (cleanCa.includes('3')) shiftNum = '3';
  else if (cleanCa.includes('0')) shiftNum = '0';
  return `${cleanDate}${shiftNum}`;
};

/* ─── Helper format Ca từ Backend (Ca 1, Ca 2, Ca 3 - Backend mã 0 hiển thị là Ca 3) ─── */
const formatCaDisplay = (ca) => {
  if (!ca && ca !== 0 && ca !== '0') return 'Ca -';
  const s = String(ca).trim().toUpperCase();
  if (s === '1' || s === 'CA 1' || s === 'CA1') return 'Ca 1';
  if (s === '2' || s === 'CA 2' || s === 'CA2') return 'Ca 2';
  if (s === '0' || s === 'CA 0' || s === 'CA0' || s === '3' || s === 'CA 3' || s === 'CA3') return 'Ca 3';
  return `Ca ${s}`;
};

/* ─── Helper chuyển đổi ngày và ca sang định dạng YYYYMMDDX (dùng cho API ca) ─ */
const formatShiftParam = (dateStr, ca) => {
  const cleanDate = dayjs(dateStr).format('YYYYMMDD');
  let shiftNum = '1';
  const cleanCa = String(ca || '1').toUpperCase();
  if (cleanCa.includes('1')) shiftNum = '1';
  else if (cleanCa.includes('2')) shiftNum = '2';
  else if (cleanCa.includes('3')) shiftNum = '3';
  else if (cleanCa.includes('0')) shiftNum = '0';
  return `${cleanDate}${shiftNum}`;
};

/* ─── Helper lấy khung giờ của ca ────────────────────────────────────────── */
const getShiftTimeRange = (ca) => {
  const c = String(ca);
  if (c === '1') return '06:00 – 14:00';
  if (c === '2') return '14:00 – 22:00';
  return '22:00 – 06:00';
};

/* ─── Mini Dual-Bar Chart Component (Cột SX & Cột KH) ─────────────────────── */
const VerticalMiniBarChart = ({ actual = 0, plan = 0, pct = 0 }) => {
  const planLinePct = 75; // Mốc 100% Kế hoạch ở 75% chiều cao
  let sxBarHeightPct = 0;
  if (plan > 0) {
    const rawRatio = (actual / plan) * planLinePct;
    sxBarHeightPct = Math.min(Math.max(rawRatio, actual > 0 ? 4 : 0), 100);
  } else if (actual > 0) {
    sxBarHeightPct = planLinePct;
  }
  const khBarHeightPct = plan > 0 ? planLinePct : 0;
  const sxBarColor = pct > 100 ? '#007a37' : (pct >= 100 ? '#00b050' : (pct >= 80 ? '#84cc16' : (pct >= 50 ? '#ff9900' : (pct > 0 ? '#ef4444' : '#94a3b8'))));

  return (
    <div
      style={{
        width: '66px',
        height: '62px',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '3px 4px',
        overflow: 'hidden'
      }}
      title={`Sản xuất (SX): ${Number(actual || 0).toLocaleString('vi-VN')} | Kế hoạch (KH): ${Number(plan || 0).toLocaleString('vi-VN')} (${Number(pct || 0).toFixed(2)}%)`}
    >
      {/* Vạch nét đứt mốc 100% Kế hoạch */}
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

      {/* 2 Cột đứng song song: KH (Xanh dương - Bên trái) & SX (Màu trạng thái - Bên phải) */}
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
        {/* Cột Kế hoạch (KH) - Bên trái */}
        <div
          style={{
            width: '20px',
            height: `${khBarHeightPct}%`,
            background: '#0070c0',
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.4s ease'
          }}
          title={`Kế hoạch (KH): ${Number(plan || 0).toLocaleString('vi-VN')}`}
        />
        {/* Cột Sản xuất (SX) - Bên phải */}
        <div
          style={{
            width: '20px',
            height: `${sxBarHeightPct}%`,
            background: sxBarColor,
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.4s ease'
          }}
          title={`Sản xuất (SX): ${Number(actual || 0).toLocaleString('vi-VN')}`}
        />
      </div>

      {/* Nhãn chữ KH (Trái) và SX (Phải) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '9.5px',
          fontWeight: '900',
          marginTop: '2px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '2px'
        }}
      >
        <span style={{ color: '#0070c0' }}>KH</span>
        <span style={{ color: sxBarColor }}>SX</span>
      </div>
    </div>
  );
};

/* ─── HÀM LẤY MÀU CỘT THỰC TẾ THEO CẤP ĐỘ % HOÀN THÀNH (ĐỒNG BỘ THEO ẢNH 2) ─── */
const getYearBarColor = (pct, actual = 0) => {
  if (!actual || Number(actual) <= 0 || !pct || Number(pct) <= 0) return '#cbd5e1'; // Chưa có sản lượng: Xám nhạt
  if (pct > 100) return '#007a37';  // Vượt kế hoạch (> 100%): Xanh lá đậm
  if (pct >= 100) return '#00b050'; // Đạt kế hoạch (== 100%): Xanh lá tươi
  if (pct >= 80) return '#84cc16';  // Tiến độ tốt (80% - < 100%): Xanh lá nhạt
  if (pct >= 50) return '#ff9900';  // Đạt mức vừa (50% - < 80%): Màu cam
  return '#ef4444';                 // Dưới mức yêu cầu (< 50%): Màu đỏ
};

/* ─── Render Label cho Cột Kế Hoạch (Chỉ hiển thị Số lượng trên đỉnh cột) ──── */
const renderKhBarLabel = (props, data) => {
  const { x, y, width, index } = props;
  const entry = data && data[index];
  if (!entry || !entry.slKH || Number(entry.slKH) <= 0) return null;
  return (
    <g>
      {/* Số lượng Kế hoạch trên đỉnh cột (màu xanh dương đậm) */}
      <text
        x={x + width / 2}
        y={y - 4}
        fill="#0070c0"
        textAnchor="middle"
        fontSize={8.5}
        fontWeight="bold"
      >
        {Number(entry.slKH).toLocaleString('vi-VN')}
      </text>
    </g>
  );
};

/* ─── Render Label cho Cột Thực Tế (Số lượng trên đỉnh + % hoàn thành bên trong) ── */
const renderTtBarLabel = (props, data) => {
  const { x, y, width, height, index } = props;
  const entry = data && data[index];
  if (!entry || !entry.slTT || Number(entry.slTT) <= 0) return null;
  const color = getYearBarColor(entry.pct, entry.slTT);
  const pctVal = Number(entry.pct || 0);
  const pctStr = `${pctVal.toFixed(pctVal % 1 === 0 ? 0 : (pctVal >= 100 ? 1 : 2))}%`;

  return (
    <g>
      {/* Số lượng Thực tế trên đỉnh cột (màu tương ứng cấp độ %) */}
      <text
        x={x + width / 2}
        y={y - 4}
        fill={color}
        textAnchor="middle"
        fontSize={8.5}
        fontWeight="bold"
      >
        {Number(entry.slTT).toLocaleString('vi-VN')}
      </text>
      {/* Phần trăm hoàn thành màu trắng nổi bật bên trong cột */}
      {height >= 14 && (
        <text
          x={x + width / 2}
          y={y + 11}
          fill="#ffffff"
          textAnchor="middle"
          fontSize={pctStr.length > 5 ? 7.5 : 8.5}
          fontWeight="900"
        >
          {pctStr}
        </text>
      )}
    </g>
  );
};

/* ─── Custom Tooltip cho Biểu đồ Năm (Loại bỏ các icon/emoji khi di chuột vào cột để giao diện chuyên nghiệp chuẩn MES DRC) ─── */
const CustomYearChartTooltip = ({ active, payload, label, unit = 'lốp' }) => {
  if (active && payload && payload.length) {
    const itemData = payload[0].payload;
    if (!itemData || (!itemData.slKH && !itemData.slTT)) {
      return (
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontWeight: 'bold', color: '#1a3a5c', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Chưa có dữ liệu sản xuất / kế hoạch</div>
        </div>
      );
    }

    const slKH = Number(itemData.slKH || 0);
    const slTT = Number(itemData.slTT || 0);
    const pct = itemData.pct !== undefined ? Number(itemData.pct) : (slKH > 0 ? Number(((slTT / slKH) * 100).toFixed(2)) : 0);
    const pctColor = getYearBarColor(pct, slTT);

    // Ghi log console kiểm tra dữ liệu khi người dùng di chuột vào cột theo quy tắc dự án
    console.log(`>>> [DashboardKeHoach Tooltip] Hover cột ${label} (${unit}): KH=${slKH}, TT=${slTT}, Đạt=${pct.toFixed(2)}%`);

    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #94a3b8',
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '11.5px',
        minWidth: '220px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ fontWeight: '900', color: '#1a3a5c', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
          {label}
        </div>
        {/* Kế hoạch (KH) - hiển thị ô màu vuông nhỏ chuẩn công nghiệp, không dùng icon emoji */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', color: '#0070c0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '2px', background: '#0070c0', display: 'inline-block' }}></span>
            <strong>Kế hoạch (KH):</strong>
          </span>
          <span style={{ fontWeight: 'bold' }}>{slKH.toLocaleString('vi-VN')} {unit}</span>
        </div>
        {/* Thực tế (SX) - hiển thị ô màu vuông nhỏ theo trạng thái hoàn thành, không dùng icon emoji */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', color: pctColor }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '2px', background: pctColor, display: 'inline-block' }}></span>
            <strong>Thực tế (SX):</strong>
          </span>
          <span style={{ fontWeight: 'bold' }}>{slTT.toLocaleString('vi-VN')} {unit}</span>
        </div>
        {/* Tỷ lệ hoàn thành */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px dashed #cbd5e1', fontWeight: '900' }}>
          <span style={{ color: '#475569' }}>Tỷ lệ hoàn thành:</span>
          <span style={{ color: pctColor }}>{pct.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

/* ─── Dữ liệu khởi tạo mặc định 12 tháng (100% bằng 0, không có số liệu giả) ─ */
const EMPTY_12_MONTHS_DATA = Array.from({ length: 12 }, (_, i) => ({
  thang: `Tháng ${i + 1}`,
  KH: 0,
  TT: 0,
  slKH: 0,
  slTT: 0,
  pct: 0
}));

/* ─── Trạng thái thiết bị ban đầu (100% bằng 0) ─────────────────────────── */
const INITIAL_EQUIP_STATUS = [
  { name: 'Running', value: 0, fill: '#00b050', pct: '0.0' },
  { name: 'Stop', value: 0, fill: '#ffff00', pct: '0.0' },
  { name: 'Fault', value: 0, fill: '#ff0000', pct: '0.0' },
  { name: 'Lost Connection', value: 0, fill: '#c2410c', pct: '0.0' }
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const DashboardKeHoach = () => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  // Trạng thái Ca và Ngày hiện tại
  const [currentShiftInfo, setCurrentShiftInfo] = useState(() => {
    const shift = getCurrentShift();
    return {
      ca: shift.ca,
      shiftLabel: formatCaDisplay(shift.ca),
      dateStr: shift.dateStr,
      timeRange: getShiftTimeRange(shift.ca)
    };
  });

  // State theo dõi trạng thái polling
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(dayjs().format('HH:mm:ss'));

  // State lưu trữ dữ liệu thiết bị và biểu đồ (Khởi tạo rỗng)
  const [equipStatusData, setEquipStatusData] = useState(INITIAL_EQUIP_STATUS);
  const [totalMachines, setTotalMachines] = useState(0);

  // State lưu số liệu sản xuất Ca, Tháng, Năm (Khởi tạo 0)
  const [caStats, setCaStats] = useState({
    th: { actual: 0, plan: 0, pct: 0 },
    cv: { actual: 0, plan: 0, pct: 0 }
  });

  const [thangStats, setThangStats] = useState({
    th: { actual: 0, plan: 0, pct: 0 },
    cv: { actual: 0, plan: 0, pct: 0 }
  });

  const [namStats, setNamStats] = useState({
    th: { actual: 0, plan: 0, pct: 0 },
    cv: { actual: 0, plan: 0, pct: 0 }
  });

  // State lưu dữ liệu 2 biểu đồ năm (Khởi tạo 12 tháng bằng 0)
  const [chartCvYearData, setChartCvYearData] = useState(EMPTY_12_MONTHS_DATA);
  const [chartThYearData, setChartThYearData] = useState(EMPTY_12_MONTHS_DATA);

  // Ảnh trụ sở DRC lấy từ API (không dùng ảnh ngoài fallback)
  const [drcImageUrl, setDrcImageUrl] = useState(null);

  // Ref theo dõi đang gọi API để tránh trùng lặp
  const isFetchingRef = useRef(false);

  // Tải ảnh nhà máy DRC từ API backend
  useEffect(() => {
    const fetchDrcImage = async () => {
      try {
        console.log(">>> [DashboardKeHoach Test Log] Đang gọi API lấy ảnh nhà máy DRC...");
        // 1. Ưu tiên gọi API stream raw nhị phân GET /drc-image/raw
        const rawBlobUrl = await getDrcMachineImageRaw();
        if (rawBlobUrl) {
          console.log(">>> [DashboardKeHoach Test Log] Tải ảnh DRC thành công từ getDrcMachineImageRaw (Blob URL):", rawBlobUrl);
          setDrcImageUrl(rawBlobUrl);
          return;
        }

        // 2. Dự phòng gọi API danh sách ảnh máy getViewOrcThMachineImageApi
        const images = await getViewOrcThMachineImageApi();
        if (Array.isArray(images) && images.length > 0) {
          const drcImgObj = images.find(img => 
            String(img.maMay || img.EquipmentID || '').toUpperCase().includes('DRC') || 
            String(img.id || '').toUpperCase().includes('DRC')
          );
          if (drcImgObj && drcImgObj.image) {
            const base64Url = `data:image/jpeg;base64,${drcImgObj.image}`;
            console.log(">>> [DashboardKeHoach Test Log] Tải ảnh DRC thành công từ getViewOrcThMachineImageApi (Base64)");
            setDrcImageUrl(base64Url);
            return;
          }
        }
      } catch (err) {
        console.error(">>> [DashboardKeHoach API ERROR] Không tải được ảnh DRC từ API:", err);
      }
    };

    fetchDrcImage();
  }, []);

  // ── Hàm tải dữ liệu tổng hợp từ các API đồng thời song song (Parallel Non-blocking) ──
  const fetchAllDashboardData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetching(true);

    const startTime = performance.now();

    // Xác định ca và ngày hiện tại tại thời điểm gọi API
    const shift = getCurrentShift();
    const ymds = getYmdsFromCaAndDate(shift.ca, shift.dateStr);
    setCurrentShiftInfo({
      ca: shift.ca,
      shiftLabel: formatCaDisplay(shift.ca),
      dateStr: shift.dateStr,
      timeRange: getShiftTimeRange(shift.ca)
    });

    const fromDateMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const toDateMonth = dayjs().endOf('month').format('YYYY-MM-DD');
    const fromDateYear = `${currentYear}-01-01`;
    const toDateYear = `${currentYear}-12-31`;

    console.log(`>>> [DashboardKeHoach] 🚀 BẮT ĐẦU BẮN SONG SONG 7 API ĐỘC LẬP lúc ${dayjs().format('HH:mm:ss')} (API nào hoàn thành trước sẽ cập nhật và hiển thị biểu đồ đó ngay lập tức!)`);

    // ── TASK 1: API Lấy trạng thái thiết bị & KPI Ca hiện tại (getMachinesWithStats) ──
    const taskMachines = getMachinesWithStats({
      fromIdKehoach: 'RA10.' + ymds,
      toIdKehoach: 'RA10.' + ymds
    }).then(resMachines => {
      const t = (performance.now() - startTime).toFixed(0);
      console.log(`>>> [DashboardKeHoach] ⚡ [${t}ms] API Thiết bị & Ca hoàn tất -> Hiển thị Biểu đồ tròn Thiết bị & KPI Ca ngay!`);
      let machines = [];
      if (resMachines && resMachines.success && Array.isArray(resMachines.data)) {
        machines = resMachines.data;
      } else if (Array.isArray(resMachines)) {
        machines = resMachines;
      }

      if (machines.length > 0) {
        // Lọc bỏ 2 máy ORC-TH-04 và ORC-TH-13 theo yêu cầu
        const filteredMachines = machines.filter(m => !isExcludedMachine(m));
        setTotalMachines(filteredMachines.length);

        const runningCnt = filteredMachines.filter(m => parseInt(m.TrangThai, 10) === 1).length;
        const stopCnt = filteredMachines.filter(m => parseInt(m.TrangThai, 10) === 2).length;
        const faultCnt = filteredMachines.filter(m => parseInt(m.TrangThai, 10) === 3).length;
        const lostCnt = filteredMachines.filter(m => parseInt(m.TrangThai, 10) === 4).length;

        const total = filteredMachines.length;
        const newStatus = [
          { name: 'Running', value: runningCnt, fill: '#00b050', pct: total > 0 ? ((runningCnt / total) * 100).toFixed(1) : '0.0' },
          { name: 'Stop', value: stopCnt, fill: '#ffff00', pct: total > 0 ? ((stopCnt / total) * 100).toFixed(1) : '0.0' },
          { name: 'Fault', value: faultCnt, fill: '#ff0000', pct: total > 0 ? ((faultCnt / total) * 100).toFixed(1) : '0.0' },
          { name: 'Lost Connection', value: lostCnt, fill: '#c2410c', pct: total > 0 ? ((lostCnt / total) * 100).toFixed(1) : '0.0' }
        ];
        setEquipStatusData(newStatus);

        // Tính sản lượng ca của TH và CV riêng biệt trong ca hiện tại
        const thMachines = filteredMachines.filter(m => !(String(m.EquipmentID || '').includes('-CV-') || String(m.EquipmentID || '').includes('CV')));
        const cvMachines = filteredMachines.filter(m => (String(m.EquipmentID || '').includes('-CV-') || String(m.EquipmentID || '').includes('CV')));

        const thActual = thMachines.reduce((s, m) => s + (Number(m.sanLuongThucTe) || 0), 0);
        const thPlan = thMachines.reduce((s, m) => s + (Number(m.keHoach) || 0), 0);
        const thPct = thPlan > 0 ? Number(((thActual / thPlan) * 100).toFixed(2)) : 0;

        const cvActual = cvMachines.reduce((s, m) => s + (Number(m.sanLuongThucTe) || 0), 0);
        const cvPlan = cvMachines.reduce((s, m) => s + (Number(m.keHoach) || 0), 0);
        const cvPct = cvPlan > 0 ? Number(((cvActual / cvPlan) * 100).toFixed(2)) : 0;

        console.log(`>>> [DashboardKeHoach] Ca ${shift.ca} -> TH: SX=${thActual}, KH=${thPlan} (${thPct}%) | CV: SX=${cvActual}, KH=${cvPlan} (${cvPct}%)`);
        setCaStats({
          th: { actual: thActual, plan: thPlan, pct: thPct },
          cv: { actual: cvActual, plan: cvPlan, pct: cvPct }
        });
      } else {
        console.warn(">>> [DashboardKeHoach] getMachinesWithStats trả về danh sách rỗng.");
      }
    }).catch(err => {
      console.error(">>> [DashboardKeHoach API ERROR] getMachinesWithStats thất bại:", err);
    });

    // ── TASK 2: API Thống kê Tháng Thành Hình (getDashboardStats Tháng) ──
    const taskThMonth = getDashboardStats(fromDateMonth, toDateMonth).then(resStatsMonth => {
      const t = (performance.now() - startTime).toFixed(0);
      console.log(`>>> [DashboardKeHoach] ⚡ [${t}ms] API Tháng TH hoàn tất -> Cập nhật thẻ Tháng Thành Hình ngay!`);
      if (resStatsMonth && resStatsMonth.tongSoLuongKH > 0) {
        setThangStats(prev => ({
          ...prev,
          th: {
            actual: resStatsMonth.tongSoLuongThucTe || 0,
            plan: resStatsMonth.tongSoLuongKH || 0,
            pct: Number((resStatsMonth.tyLeHoanThanh || 0).toFixed(2))
          }
        }));
      }
    }).catch(err => {
      console.error(">>> [DashboardKeHoach API ERROR] getDashboardStats Tháng (TH) thất bại:", err);
    });

    // ── TASK 3: API Thống kê Năm Thành Hình (getDashboardStats Năm) ──
    const taskThYear = getDashboardStats(fromDateYear, toDateYear).then(resStatsYear => {
      const t = (performance.now() - startTime).toFixed(0);
      console.log(`>>> [DashboardKeHoach] ⚡ [${t}ms] API Năm TH hoàn tất -> Cập nhật thẻ Năm Thành Hình ngay!`);
      if (resStatsYear && resStatsYear.tongSoLuongKH > 0) {
        setNamStats(prev => ({
          ...prev,
          th: {
            actual: resStatsYear.tongSoLuongThucTe || 0,
            plan: resStatsYear.tongSoLuongKH || 0,
            pct: Number((resStatsYear.tyLeHoanThanh || 0).toFixed(2))
          }
        }));
      }
    }).catch(err => {
      console.error(">>> [DashboardKeHoach API ERROR] getDashboardStats Năm (TH) thất bại:", err);
    });

    // ── TASK 4: API Thống kê Tháng Cắt Vải (getCatVaiSummaryStats Tháng) ──
    const taskCvMonth = getCatVaiSummaryStats(fromDateMonth, toDateMonth).then(resCvSummary => {
      const t = (performance.now() - startTime).toFixed(0);
      console.log(`>>> [DashboardKeHoach] ⚡ [${t}ms] API Tháng CV hoàn tất -> Cập nhật thẻ Tháng Cắt Vải ngay!`);
      if (resCvSummary && resCvSummary.success && resCvSummary.data) {
        const d = resCvSummary.data;
        const kh = Number(d.tongKeHoachHieuLuc || d.tongKeHoachDieuChinh || 0);
        const tt = Number(d.tongSanLuongThucTe || 0);
        const pct = kh > 0 ? Number(((tt / kh) * 100).toFixed(2)) : 0;
        setThangStats(prev => ({
          ...prev,
          cv: { actual: tt, plan: kh, pct }
        }));
      }
    }).catch(err => {
      console.error(">>> [DashboardKeHoach API ERROR] getCatVaiSummaryStats Tháng (CV) thất bại:", err);
    });

    // ── TASK 5: API Thống kê Năm Cắt Vải (getCatVaiSummaryStats Năm) ──
    const taskCvYear = getCatVaiSummaryStats(fromDateYear, toDateYear).then(resCvYearSummary => {
      const t = (performance.now() - startTime).toFixed(0);
      console.log(`>>> [DashboardKeHoach] ⚡ [${t}ms] API Năm CV hoàn tất -> Cập nhật thẻ Năm Cắt Vải ngay!`);
      if (resCvYearSummary && resCvYearSummary.success && resCvYearSummary.data) {
        const d = resCvYearSummary.data;
        const kh = Number(d.tongKeHoachHieuLuc || d.tongKeHoachDieuChinh || 0);
        const tt = Number(d.tongSanLuongThucTe || 0);
        const pct = kh > 0 ? Number(((tt / kh) * 100).toFixed(2)) : 0;
        setNamStats(prev => ({
          ...prev,
          cv: { actual: tt, plan: kh, pct }
        }));
      }
    }).catch(err => {
      console.error(">>> [DashboardKeHoach API ERROR] getCatVaiSummaryStats Năm (CV) thất bại:", err);
    });

    // ── TASK 6: API Biểu đồ 12 Tháng Thành Hình (getKeHoachTrend) ──
    const taskTrendTH = getKeHoachTrend(currentYear).then(resTrend => {
      const t = (performance.now() - startTime).toFixed(0);
      console.log(`>>> [DashboardKeHoach] ⚡ [${t}ms] API Biểu đồ 12 Tháng TH hoàn tất -> Hiển thị Biểu đồ KHSX Năm TH ngay lập tức!`);
      const thArray = (resTrend && Array.isArray(resTrend.data))
        ? resTrend.data
        : (Array.isArray(resTrend) ? resTrend : []);

      if (thArray.length > 0) {
        const mappedTH = Array.from({ length: 12 }, (_, i) => {
          const mNum = i + 1;
          const found = thArray.find(d => Number(d.thang || d.thang_sx || d.Thang || d.Thang_SX || 0) === mNum);
          if (found) {
            const slKH = Number(found.tongKH || found.keHoach || found.TongKeHoach || 0);
            const slTT = Number(found.tongSX || found.sanLuongThucTe || found.TongSanLuong || 0);
            if (slKH > 0 || slTT > 0) {
              const pct = slKH > 0 ? Number(((slTT / slKH) * 100).toFixed(1)) : 0;
              const kh = 100;
              const tt = pct;
              return { thang: `Tháng ${mNum}`, KH: kh, TT: tt, slKH, slTT, pct };
            }
          }
          return { thang: `Tháng ${mNum}`, KH: 0, TT: 0, slKH: 0, slTT: 0, pct: 0 };
        });
        setChartThYearData(mappedTH);
      }
    }).catch(err => {
      console.error(">>> [DashboardKeHoach API ERROR] getKeHoachTrend thất bại:", err);
    });

    // ── TASK 7: API Biểu đồ 12 Tháng Cắt Vải (getCatVaiMonthlyStats) ──
    const taskMonthlyCV = getCatVaiMonthlyStats(currentYear).then(resCvMonthly => {
      const t = (performance.now() - startTime).toFixed(0);
      console.log(`>>> [DashboardKeHoach] ⚡ [${t}ms] API Biểu đồ 12 Tháng CV hoàn tất -> Hiển thị Biểu đồ KHSX Năm CV ngay lập tức!`);
      const cvArray = (resCvMonthly && Array.isArray(resCvMonthly.data))
        ? resCvMonthly.data
        : (Array.isArray(resCvMonthly) ? resCvMonthly : []);

      if (cvArray.length > 0) {
        const mappedCV = Array.from({ length: 12 }, (_, i) => {
          const mNum = i + 1;
          const found = cvArray.find(d => Number(d.Thang_SX || d.thang_sx || d.thang || d.Thang || 0) === mNum);
          if (found) {
            const slKH = Number(found.TongKeHoachDieuChinh || found.TongKeHoachHieuLuc || found.keHoach || found.tongKH || 0);
            const slTT = Number(found.TongSanLuongThucTe || found.sanLuongThucTe || found.tongSX || 0);
            if (slKH > 0 || slTT > 0) {
              const pct = slKH > 0 ? Number(((slTT / slKH) * 100).toFixed(1)) : 0;
              const kh = 100;
              const tt = pct;
              return { thang: `Tháng ${mNum}`, KH: kh, TT: tt, slKH, slTT, pct };
            }
          }
          return { thang: `Tháng ${mNum}`, KH: 0, TT: 0, slKH: 0, slTT: 0, pct: 0 };
        });
        setChartCvYearData(mappedCV);
      }
    }).catch(err => {
      console.error(">>> [DashboardKeHoach API ERROR] getCatVaiMonthlyStats thất bại:", err);
    });

    // Đợi tất cả 7 API hoàn thành để tắt cờ isFetching và cập nhật mốc thời gian cuối
    await Promise.allSettled([
      taskMachines,
      taskThMonth,
      taskThYear,
      taskCvMonth,
      taskCvYear,
      taskTrendTH,
      taskMonthlyCV
    ]);

    const elapsed = (performance.now() - startTime).toFixed(0);
    console.log(`>>> [DashboardKeHoach] ✅ HOÀN TẤT TẤT CẢ 7 API TRANG TỔNG QUAN TRONG: ${elapsed}ms`);

    setLastUpdatedTime(dayjs().format('HH:mm:ss'));
    isFetchingRef.current = false;
    setIsFetching(false);
  }, [currentYear]);

  // ── Polling Realtime mỗi 20 giây ──
  useEffect(() => {
    // 1. Tải ngay lần đầu tiên
    fetchAllDashboardData();

    // 2. Thiết lập Polling tự động mỗi 20 giây
    console.log(">>> [DashboardKeHoach Setup] Khởi chạy Polling Realtime chu kỳ 20 giây...");
    const pollInterval = setInterval(() => {
      console.log(`>>> [DashboardKeHoach Auto-Poll] Thực hiện cập nhật chu kỳ 20s lúc ${dayjs().format('HH:mm:ss')}...`);
      fetchAllDashboardData();
    }, 20000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchAllDashboardData]);

  // Render nhãn % trên biểu đồ tròn
  const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const item = equipStatusData[index];
    if (!item || item.value === 0) return null;

    return (
      <text
        x={x}
        y={y}
        fill={item.fill === '#ffff00' ? '#713f12' : '#ffffff'}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="bold"
      >
        {item.pct}
      </text>
    );
  };

  // Ref vùng nội dung Dashboard để chụp PDF
  const dashboardRef = useRef(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Hàm xuất PDF Báo cáo Tổng quan Dashboard
  const handleExportPDF = async () => {
    console.log(">>> [DashboardKeHoach] Bắt đầu xuất PDF Báo Cáo Tổng Quan Nhà Xưởng");
    setIsExportingPDF(true);
    await exportDashboardToPDF({
      element: dashboardRef.current,
      fileName: `BaoCao_TongQuan_MES_DRC`,
      title: 'BÁO CÁO GIÁM SÁT TIẾN ĐỘ & HIỆN TRẠNG SẢN XUẤT XƯỞNG CV-TH',
      subTitle: `Ca: ${currentShiftInfo.shiftLabel} (${currentShiftInfo.timeRange}) • Ngày: ${dayjs(currentShiftInfo.dateStr).format('DD/MM/YYYY')}`,
      orientation: 'landscape',
      metadata: {
        'Năm theo dõi': currentYear,
        'Thời gian ghi nhận': dayjs().format('DD/MM/YYYY HH:mm:ss')
      }
    });
    setIsExportingPDF(false);
  };

  return (
    <div ref={dashboardRef} className="drc-dash mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER TIÊU ĐỀ KÈM HIỂN THỊ CA, GIỜ, NGÀY VÀ POLLING REALTIME ── */}
      <div className="drc-header-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>TỔNG QUAN</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>|</span>
          <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1565C0', letterSpacing: '0.2px' }}>
            HỆ THỐNG GIÁM SÁT SẢN XUẤT XƯỞNG CV-TH
          </span>
        </div>

        {/* Khối hiển thị Ca, Giờ, Ngày & Trạng thái Polling Realtime + Nút Xuất PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Nút Xuất Báo Cáo PDF */}
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '3px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: isExportingPDF ? 'not-allowed' : 'pointer',
              opacity: isExportingPDF ? 0.7 : 1,
              boxShadow: '0 1px 2px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.15s ease'
            }}
            title="Xuất bản in báo cáo PDF chất lượng cao cho trang Tổng quan"
          >
            <FaFilePdf size={12} />
            <span>{isExportingPDF ? 'ĐANG TẠO PDF...' : 'XUẤT BÁO CÁO (PDF)'}</span>
          </button>

          {/* Badge Ca hiện tại */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '3px',
            padding: '3px 8px', fontSize: '11.5px', fontWeight: '800', color: '#0369a1'
          }}>
            <span style={{
              background: '#0284c7', color: '#ffffff', padding: '1px 6px',
              borderRadius: '2px', fontSize: '11px', fontWeight: '900'
            }}>
              {currentShiftInfo.shiftLabel}
            </span>
            <span style={{ color: '#0284c7' }}>({currentShiftInfo.timeRange})</span>
          </div>

          {/* Badge Ngày & Đồng hồ thời gian thực */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px',
            padding: '3px 8px', fontSize: '11.5px', fontWeight: '800', color: '#334155'
          }}>
            <span>📅 {dayjs(currentShiftInfo.dateStr).format('DD/MM/YYYY')}</span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <LiveClockBadge />
          </div>

          {/* Polling Indicator 20s */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '3px',
            padding: '3px 8px', fontSize: '11px', fontWeight: '800', color: '#047857'
          }} title={`Tự động cập nhật mỗi 20s. Lần cập nhật cuối: ${lastUpdatedTime}`}>
            <span
              className={!isFetching ? "pulse-dot" : ""}
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isFetching ? '#eab308' : '#10b981',
                boxShadow: isFetching ? '0 0 0 2px rgba(234, 179, 8, 0.4)' : '0 0 0 2px rgba(16, 185, 129, 0.4)',
                display: 'inline-block'
              }}
            />
            <span>{isFetching ? 'Đang tải...' : 'Realtime (20s)'}</span>
          </div>
        </div>
      </div>

      {/* ── 2. KHỐI HIỆN TRẠNG THIẾT BỊ XƯỞNG CV-TH ─────────────────────────── */}
      <div className="drc-panel">
        <div className="drc-top-grid">
          {/* Ảnh nhà máy DRC tải từ backend API */}
          <div className="drc-factory-img-wrap">
            {drcImageUrl ? (
              <img
                src={drcImageUrl}
                alt="Trụ sở Công ty Cổ phần Cao su Đà Nẵng (DRC)"
                className="drc-factory-img"
              />
            ) : (
              <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#f0f9ff" />
                  </linearGradient>
                  <linearGradient id="bldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                </defs>
                <rect width="400" height="200" fill="url(#skyGrad)" />
                {/* Tòa nhà DRC */}
                <rect x="60" y="55" width="280" height="110" fill="url(#bldGrad)" stroke="#94a3b8" strokeWidth="2" rx="3" />
                <rect x="75" y="70" width="250" height="35" fill="#0284c7" opacity="0.8" rx="2" />
                {/* Logo DRC đỏ */}
                <rect x="170" y="30" width="60" height="22" fill="#dc2626" rx="2" />
                <text x="200" y="46" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">DRC</text>
                <text x="200" y="92" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">NHÀ MÁY SẢN XUẤT LỐP XE</text>
                {/* Cửa và nền */}
                <rect x="160" y="125" width="80" height="40" fill="#334155" rx="2" />
                <rect x="0" y="165" width="400" height="35" fill="#16a34a" />
                <rect x="0" y="180" width="400" height="20" fill="#64748b" />
              </svg>
            )}
          </div>

          {/* Biểu đồ tròn hiện trạng thiết bị kèm bảng chú thích nằm sát nhau */}
          <div className="drc-equip-section">
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#1a3a5c', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.4px' }}>
              HIỆN TRẠNG THIẾT BỊ XƯỞNG CV-TH
            </div>

            <div className="drc-equip-status-wrap">
              {/* Biểu đồ Pie Chart (Tắt animation để chống giật) */}
              <div style={{ width: 175, height: 175, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      labelLine={false}
                      label={renderCustomPieLabel}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      isAnimationActive={false}
                    >
                      {equipStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} máy (${totalMachines > 0 ? ((Number(value) / totalMachines) * 100).toFixed(1) : 0}%)`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bảng chú giải trạng thái (Đặt sát bên cạnh Pie Chart) */}
              <table className="drc-equip-legend-table">
                <tbody>
                  <tr style={{ borderBottom: '1.5px solid #cbd5e1' }}>
                    <td style={{ color: '#1e3a8a', fontWeight: '900', paddingBottom: '6px' }}>Tổng máy</td>
                    <td style={{ textAlign: 'right', fontWeight: '900', color: '#1e293b', fontSize: '13px', paddingBottom: '6px' }}>{totalMachines}</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="drc-legend-chip" style={{ background: '#00b050' }}></span>
                      <span style={{ color: '#334155' }}>Running</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#00b050', fontWeight: '900' }}>
                      {equipStatusData.find(d => d.name === 'Running')?.value || 0}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="drc-legend-chip" style={{ background: '#ffff00', border: '1px solid #eab308' }}></span>
                      <span style={{ color: '#334155' }}>Stop</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#b45309', fontWeight: '900' }}>
                      {equipStatusData.find(d => d.name === 'Stop')?.value || 0}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="drc-legend-chip" style={{ background: '#ff0000' }}></span>
                      <span style={{ color: '#334155' }}>Fault</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: '900' }}>
                      {equipStatusData.find(d => d.name === 'Fault')?.value || 0}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="drc-legend-chip" style={{ background: '#c2410c' }}></span>
                      <span style={{ color: '#334155' }}>Lost Connection</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#c2410c', fontWeight: '900' }}>
                      {equipStatusData.find(d => d.name === 'Lost Connection')?.value || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. KHỐI TÌNH HÌNH SẢN XUẤT XƯỞNG CV-TH (CA / THÁNG / NĂM) ──────── */}
      <div className="drc-panel">
        <div className="drc-panel-title" style={{ textAlign: 'center' }}>
          TÌNH HÌNH SẢN XUẤT XƯỞNG CV-TH
        </div>
        <div className="drc-prod-grid">
          {/* Cột 1: Tình hình sản xuất trong ca */}
          <div className="drc-prod-card">
            <div className="drc-prod-card-body">
              {/* Phân xưởng Thành hình */}
              <div className="drc-sub-prod">
                <div className="drc-sub-title">THÀNH HÌNH</div>
                <div className="drc-sub-badge">{caStats.th.pct.toFixed(2)}%</div>
                <div className="drc-sub-content">
                  <div className="drc-sub-stats">
                    <div>KH: {Number(caStats.th.plan || 0).toLocaleString('vi-VN')}</div>
                    <div>SX: {Number(caStats.th.actual || 0).toLocaleString('vi-VN')}</div>
                  </div>
                  <VerticalMiniBarChart actual={caStats.th.actual} plan={caStats.th.plan} pct={caStats.th.pct} />
                </div>
              </div>
              {/* Phân xưởng Cắt vải */}
              <div className="drc-sub-prod">
                <div className="drc-sub-title">CẮT VẢI</div>
                <div className="drc-sub-badge">{caStats.cv.pct.toFixed(2)}%</div>
                <div className="drc-sub-content">
                  <div className="drc-sub-stats">
                    <div>KH: {Number(caStats.cv.plan || 0).toLocaleString('vi-VN')}</div>
                    <div>SX: {Number(caStats.cv.actual || 0).toLocaleString('vi-VN')}</div>
                  </div>
                  <VerticalMiniBarChart actual={caStats.cv.actual} plan={caStats.cv.plan} pct={caStats.cv.pct} />
                </div>
              </div>
            </div>
            <div className="drc-prod-card-footer">
              Tình hình sản xuất trong ca ({currentShiftInfo.shiftLabel} - {dayjs(currentShiftInfo.dateStr).format('DD/MM')})
            </div>
          </div>

          {/* Cột 2: Tình hình sản xuất tháng {X} */}
          <div className="drc-prod-card">
            <div className="drc-prod-card-body">
              {/* Phân xưởng Thành hình */}
              <div className="drc-sub-prod">
                <div className="drc-sub-title">THÀNH HÌNH</div>
                <div className="drc-sub-badge">{thangStats.th.pct.toFixed(2)}%</div>
                <div className="drc-sub-content">
                  <div className="drc-sub-stats">
                    <div>KH: {Number(thangStats.th.plan || 0).toLocaleString('vi-VN')}</div>
                    <div>SX: {Number(thangStats.th.actual || 0).toLocaleString('vi-VN')}</div>
                  </div>
                  <VerticalMiniBarChart actual={thangStats.th.actual} plan={thangStats.th.plan} pct={thangStats.th.pct} />
                </div>
              </div>
              {/* Phân xưởng Cắt vải */}
              <div className="drc-sub-prod">
                <div className="drc-sub-title">CẮT VẢI</div>
                <div className="drc-sub-badge">{thangStats.cv.pct.toFixed(2)}%</div>
                <div className="drc-sub-content">
                  <div className="drc-sub-stats">
                    <div>KH: {Number(thangStats.cv.plan || 0).toLocaleString('vi-VN')}</div>
                    <div>SX: {Number(thangStats.cv.actual || 0).toLocaleString('vi-VN')}</div>
                  </div>
                  <VerticalMiniBarChart actual={thangStats.cv.actual} plan={thangStats.cv.plan} pct={thangStats.cv.pct} />
                </div>
              </div>
            </div>
            <div className="drc-prod-card-footer">Tình hình sản xuất tháng {currentMonth}</div>
          </div>

          {/* Cột 3: Tình hình sản xuất năm {Y} */}
          <div className="drc-prod-card">
            <div className="drc-prod-card-body">
              {/* Phân xưởng Thành hình */}
              <div className="drc-sub-prod">
                <div className="drc-sub-title">THÀNH HÌNH</div>
                <div className="drc-sub-badge">{namStats.th.pct.toFixed(2)}%</div>
                <div className="drc-sub-content">
                  <div className="drc-sub-stats">
                    <div>KH: {Number(namStats.th.plan || 0).toLocaleString('vi-VN')}</div>
                    <div>SX: {Number(namStats.th.actual || 0).toLocaleString('vi-VN')}</div>
                  </div>
                  <VerticalMiniBarChart actual={namStats.th.actual} plan={namStats.th.plan} pct={namStats.th.pct} />
                </div>
              </div>
              {/* Phân xưởng Cắt vải */}
              <div className="drc-sub-prod">
                <div className="drc-sub-title">CẮT VẢI</div>
                <div className="drc-sub-badge">{namStats.cv.pct.toFixed(2)}%</div>
                <div className="drc-sub-content">
                  <div className="drc-sub-stats">
                    <div>KH: {Number(namStats.cv.plan || 0).toLocaleString('vi-VN')}</div>
                    <div>SX: {Number(namStats.cv.actual || 0).toLocaleString('vi-VN')}</div>
                  </div>
                  <VerticalMiniBarChart actual={namStats.cv.actual} plan={namStats.cv.plan} pct={namStats.cv.pct} />
                </div>
              </div>
            </div>
            <div className="drc-prod-card-footer">Tình hình sản xuất năm {currentYear}</div>
          </div>
        </div>
      </div>

      {/* ── 4. BIỂU ĐỒ THEO DÕI KHSX CÔNG ĐOẠN CẮT VẢI NĂM 2026 ─────────────── */}
      <div className="drc-year-chart-card">
        <div className="drc-year-chart-head">
          <span>BIỂU ĐỒ THỰC THEO DÕI KẾ HOẠCH SẢN XUẤT - CÔNG ĐOẠN CV NĂM {currentYear}</span>
          <span className="drc-year-chart-scroll-hint">⟷ Vuốt ngang để xem đủ 12 tháng</span>
        </div>
        <div className="drc-year-chart-body">
          <div className="drc-year-chart-canvas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartCvYearData}
                margin={{ top: 24, right: 18, left: -10, bottom: 0 }}
                barGap={4}
                barCategoryGap="14%"
                maxBarSize={42}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="thang" tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  domain={[0, 130]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit="%"
                />
                {/* Tooltip hiển thị đầy đủ Kế hoạch, Sản lượng thực tế và Tỷ lệ % */}
                <Tooltip content={<CustomYearChartTooltip unit="BTP" />} />

                {/* Cột Kế hoạch: Hiện số SL kế hoạch trên đỉnh (Xanh) và 100% bên trong cột */}
                <Bar dataKey="KH" name="KẾ HOẠCH" fill="#0070c0" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  <LabelList content={(props) => renderKhBarLabel(props, chartCvYearData)} />
                </Bar>
                {/* Cột Thực tế: Đổi màu theo từng cấp phần trăm + hiện % hoàn thành bên trong cột */}
                <Bar dataKey="TT" name="THỰC TẾ" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {chartCvYearData.map((entry, index) => (
                    <Cell key={`cell-cv-tt-${index}`} fill={getYearBarColor(entry.pct, entry.slTT)} />
                  ))}
                  <LabelList content={(props) => renderTtBarLabel(props, chartCvYearData)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="drc-chart-legend">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#0070c0', display: 'inline-block' }}></span>
            KẾ HOẠCH
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#007a37', display: 'inline-block' }}></span>
            &gt;100%: Xanh đậm
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#00b050', display: 'inline-block' }}></span>
            =100%: Xanh tươi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#84cc16', display: 'inline-block' }}></span>
            80% - &lt;100%: Xanh nhạt
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#ff9900', display: 'inline-block' }}></span>
            50% - &lt;80%: Cam
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#ef4444', display: 'inline-block' }}></span>
            &lt;50%: Đỏ
          </span>
        </div>
      </div>

      {/* ── 5. BIỂU ĐỒ THEO DÕI KHSX CÔNG ĐOẠN THÀNH HÌNH NĂM 2026 ──────────── */}
      <div className="drc-year-chart-card">
        <div className="drc-year-chart-head">
          <span>BIỂU ĐỒ THỰC THEO DÕI KẾ HOẠCH SẢN XUẤT - CÔNG ĐOẠN TH NĂM {currentYear}</span>
          <span className="drc-year-chart-scroll-hint">⟷ Vuốt ngang để xem đủ 12 tháng</span>
        </div>
        <div className="drc-year-chart-body">
          <div className="drc-year-chart-canvas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartThYearData}
                margin={{ top: 24, right: 18, left: -10, bottom: 0 }}
                barGap={4}
                barCategoryGap="14%"
                maxBarSize={42}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="thang" tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  domain={[0, 130]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit="%"
                />
                {/* Tooltip hiển thị đầy đủ Kế hoạch, Sản lượng thực tế và Tỷ lệ % */}
                <Tooltip content={<CustomYearChartTooltip unit="lốp" />} />

                {/* Cột Kế hoạch: Hiện số SL kế hoạch trên đỉnh (Xanh) và 100% bên trong cột */}
                <Bar dataKey="KH" name="KẾ HOẠCH" fill="#0070c0" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  <LabelList content={(props) => renderKhBarLabel(props, chartThYearData)} />
                </Bar>
                {/* Cột Thực tế: Đổi màu theo từng cấp phần trăm + hiện % hoàn thành bên trong cột */}
                <Bar dataKey="TT" name="THỰC TẾ" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {chartThYearData.map((entry, index) => (
                    <Cell key={`cell-th-tt-${index}`} fill={getYearBarColor(entry.pct, entry.slTT)} />
                  ))}
                  <LabelList content={(props) => renderTtBarLabel(props, chartThYearData)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="drc-chart-legend">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#0070c0', display: 'inline-block' }}></span>
            KẾ HOẠCH
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#007a37', display: 'inline-block' }}></span>
            &gt;100%: Xanh đậm
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#00b050', display: 'inline-block' }}></span>
            =100%: Xanh tươi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#84cc16', display: 'inline-block' }}></span>
            80% - &lt;100%: Xanh nhạt
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#ff9900', display: 'inline-block' }}></span>
            50% - &lt;80%: Cam
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 12, background: '#ef4444', display: 'inline-block' }}></span>
            &lt;50%: Đỏ
          </span>
        </div>
      </div>

    </div>
  );
};

export default DashboardKeHoach;