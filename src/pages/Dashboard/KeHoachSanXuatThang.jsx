// src/pages/Dashboard/KeHoachSanXuatThang.jsx
// Trang Báo cáo Theo dõi Tiến độ Kế hoạch Sản xuất Theo Từng Ngày Trong Tháng (Cắt vải & Thành hình)
// Thiết kế chuẩn giao diện Industrial MES SCADA Đồng bộ với Trang Kế hoạch Năm
// Dữ liệu lấy trực tiếp từ API Cắt vải (getCatVaiDailyStats / getDailyStatsTheoMay) và API Thành hình (getTongHopCaNgay)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';
import { FaCalendarAlt, FaSearch, FaRedo, FaCogs, FaChartBar } from 'react-icons/fa';

// Import các API chính thức từ Backend
import { getDailyStatsForMonthCatVai, getCatVaiEquipments } from '../../api/catVaiApi';
import { getTongHopCaNgay, getDanhSachMay } from '../../api/thanhhinhApi';
import { getWeeklyProgress } from '../../api/kehoachApi';

/* ─── STYLESHEET CHUẨN MES / INDUSTRIAL CHO TRANG KẾ HOẠCH THÁNG ─────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  .mes-fade { animation: fadein 0.25s ease-out; }

  .drc-month-container {
    padding: 10px 14px;
    background: #f1f5f9;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1e293b;
    min-height: calc(100vh - 58px);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Header Title & Toolbar ── */
  .drc-header-panel {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    flex-wrap: wrap;
    gap: 8px;
  }

  .drc-title-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .drc-title-left h1 {
    font-size: 15px;
    font-weight: 900;
    color: #1e3a8a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .drc-badge-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
    display: inline-block;
  }

  .drc-header-meta {
    font-size: 11.5px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* ── Filter Bar (Năm, Tháng & Máy) ── */
  .drc-filter-bar {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .drc-filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .drc-field {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .drc-label {
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .drc-select {
    height: 28px;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 700;
    color: #1e293b;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    background: #ffffff;
    outline: none;
    cursor: pointer;
  }

  .drc-select:focus {
    border-color: #0284c7;
    box-shadow: 0 0 0 1px #0284c7;
  }

  .drc-btn {
    height: 28px;
    padding: 0 12px;
    font-size: 11.5px;
    font-weight: 700;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s ease;
    border: 1px solid transparent;
  }

  .drc-btn-primary {
    background: #0284c7;
    color: #ffffff;
    border-color: #0284c7;
  }
  .drc-btn-primary:hover {
    background: #0369a1;
  }

  .drc-btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border-color: #cbd5e1;
  }
  .drc-btn-secondary:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  /* ── 3. KPI Horizontal Bar Cards (Chuẩn Style MES Hình Mẫu) ── */
  .drc-kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (max-width: 900px) {
    .drc-kpi-grid { grid-template-columns: 1fr; }
  }
  .drc-kpi-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 8px 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-left: 4px solid #0070c0;
  }
  .drc-kpi-card.cv { border-left-color: #0284c7; }
  .drc-kpi-card.th { border-left-color: #16a34a; }

  .drc-kpi-title {
    font-size: 12px;
    font-weight: 800;
    color: #334155;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
  }
  .drc-kpi-badge {
    padding: 2px 9px;
    border-radius: 12px;
    font-size: 11.5px;
    font-weight: 900;
  }

  /* Bảng thanh ngang chuẩn ảnh mẫu */
  .drc-spec-table {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  .drc-spec-row {
    display: flex;
    align-items: center;
    padding: 5px 0;
    gap: 8px;
  }
  .drc-spec-row.top-row {
    border-bottom: 1px dashed #cbd5e1;
  }
  .drc-spec-label {
    width: 80px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    flex-shrink: 0;
  }
  .drc-spec-label.sx {
    color: #0f172a;
  }
  .drc-spec-label.kh {
    color: #005bb5;
  }
  .drc-spec-divider {
    color: #cbd5e1;
    font-weight: 300;
    flex-shrink: 0;
    user-select: none;
  }
  .drc-spec-qty {
    width: 90px;
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    text-align: right;
    flex-shrink: 0;
  }
  .drc-spec-pct {
    width: 65px;
    font-size: 12.5px;
    font-weight: 800;
    color: #0f172a;
    text-align: right;
    padding-right: 4px;
    flex-shrink: 0;
  }
  .drc-spec-bar-box {
    flex: 1;
    height: 18px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 1px;
    overflow: hidden;
    position: relative;
  }
  .drc-spec-bar-fill {
    height: 100%;
    transition: width 0.4s ease;
  }
  /* Vạch mốc chuẩn 100% Kế hoạch (chiếm 83.33% khung để chừa 16.67% khoảng trống cho sản xuất vượt kế hoạch) */
  .drc-spec-100-mark {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 83.33%;
    width: 1.5px;
    background: #64748b;
    opacity: 0.6;
    z-index: 2;
    pointer-events: none;
  }

  /* ── Chart Container Cards ── */
  .drc-chart-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
  }
  .drc-chart-head {
    background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
    color: #ffffff;
    font-size: 12.5px;
    font-weight: 900;
    text-align: left;
    padding: 6px 14px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    border-bottom: 2px solid #0f172a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: relative;
  }
  .drc-chart-scroll-hint {
    font-size: 10.5px;
    font-weight: 700;
    color: #93c5fd;
    text-transform: none;
    letter-spacing: 0;
    position: absolute;
    right: 12px;
  }
  @media (max-width: 900px) {
    .drc-chart-head {
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 10px;
    }
    .drc-chart-scroll-hint {
      position: static;
      color: #bfdbfe;
      font-size: 10px;
    }
  }
  .drc-chart-body {
    height: 310px;
    padding: 8px 10px 4px 6px;
    position: relative;
  }
  /* Khung cuộn ngang 3-4 ngày/khung nhìn trên điện thoại, trượt ngang xem trọn tháng */
  .drc-daychart-scroll {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: #0284c7 #f1f5f9;
    -webkit-overflow-scrolling: touch;
  }
  .drc-daychart-scroll::-webkit-scrollbar {
    height: 7px;
  }
  .drc-daychart-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  .drc-daychart-scroll::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 4px;
  }
  .drc-daychart-scroll::-webkit-scrollbar-thumb:hover {
    background: #0284c7;
  }
  .drc-chart-legend {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 5px 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    font-size: 11px;
    font-weight: 800;
    color: #475569;
    flex-wrap: wrap;
  }

  .drc-empty-notice {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    background: #f8fafc;
  }
`;

/* ─── Hàm lấy màu cột Thực tế theo % hoàn thành kế hoạch ──────────────────── */
const getDayBarColor = (pct, actual = 0) => {
  if (!actual || Number(actual) <= 0 || !pct || Number(pct) <= 0) return '#cbd5e1'; // Chưa có sản lượng: Xám
  if (pct > 100) return '#007a37';  // Vượt kế hoạch (> 100%): Xanh lá đậm
  if (pct >= 100) return '#00b050'; // Đạt kế hoạch (== 100%): Xanh lá tươi
  if (pct >= 80) return '#84cc16';  // Tiến độ tốt (80% - < 100%): Xanh lá nhạt
  if (pct >= 50) return '#ff9900';  // Tiến độ trung bình (50% - < 80%): Màu cam
  return '#ef4444';                 // Dưới yêu cầu (< 50%): Màu đỏ
};

/* ─── Render Label cột Kế hoạch: Chỉ hiện số lượng trên đỉnh cột ─────────── */
const renderKhBarLabel = (props, data) => {
  const { x, y, width, index } = props;
  const entry = data && data[index];
  if (!entry || !entry.slKH || Number(entry.slKH) <= 0) return null;
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#0070c0"
        textAnchor="middle"
        fontSize={11}
        fontWeight="800"
      >
        {Number(entry.slKH).toLocaleString('vi-VN')}
      </text>
    </g>
  );
};

/* ─── Render Label cột Thực tế: Số lượng trên đỉnh + Con số và % ngắt dòng bên trong ─ */
const renderTtBarLabel = (props, data) => {
  const { x, y, width, height, index } = props;
  const entry = data && data[index];
  if (!entry || !entry.slTT || Number(entry.slTT) <= 0) return null;
  const color = getDayBarColor(entry.pct, entry.slTT);
  const pctVal = Number(entry.pct || 0);
  const numStr = pctVal % 1 === 0 ? String(pctVal) : (pctVal >= 100 ? pctVal.toFixed(1) : pctVal.toFixed(1));

  return (
    <g>
      {/* Số lượng sản xuất thực tế trên đỉnh cột */}
      <text
        x={x + width / 2}
        y={y - 6}
        fill={color}
        textAnchor="middle"
        fontSize={11}
        fontWeight="800"
      >
        {Number(entry.slTT).toLocaleString('vi-VN')}
      </text>

      {/* % hoàn thành bên trong thân cột (Ngắt dòng: Con số ở trên, Ký hiệu % ở dưới) */}
      {height >= 26 ? (
        <g>
          {/* Dòng 1: Con số tiến độ */}
          <text
            x={x + width / 2}
            y={y + 13}
            fill="#ffffff"
            textAnchor="middle"
            fontSize={11}
            fontWeight="900"
          >
            {numStr}
          </text>
          {/* Dòng 2: Ký hiệu % */}
          <text
            x={x + width / 2}
            y={y + 24}
            fill="#ffffff"
            textAnchor="middle"
            fontSize={10}
            fontWeight="900"
          >
            %
          </text>
        </g>
      ) : height >= 14 ? (
        <text
          x={x + width / 2}
          y={y + 11}
          fill="#ffffff"
          textAnchor="middle"
          fontSize={9.5}
          fontWeight="900"
        >
          {numStr}%
        </text>
      ) : (
        <text
          x={x + width / 2}
          y={y - 19}
          fill={color}
          textAnchor="middle"
          fontSize={10}
          fontWeight="800"
        >
          {numStr}%
        </text>
      )}
    </g>
  );
};

/* ─── Tooltip chi tiết cho Biểu đồ Ngày Trong Tháng ──────────────────────── */
const CustomDailyChartTooltip = ({ active, payload, label, unit = 'lốp' }) => {
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

    const pctNum = Number(itemData.pct || 0);
    const color = getDayBarColor(pctNum, itemData.slTT);

    // Ghi log console kiểm tra dữ liệu khi người dùng di chuột vào cột theo quy tắc dự án
    console.log(`>>> [KeHoachSanXuatThang Tooltip] Hover cột ngày ${label} (${unit}): KH=${itemData.slKH}, TT=${itemData.slTT}, Đạt=${pctNum.toFixed(2)}%`);

    return (
      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', minWidth: '170px' }}>
        <div style={{ fontWeight: 800, fontSize: '12px', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
          {label}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
          <span style={{ color: '#0070c0', fontWeight: 700 }}>• Kế hoạch:</span>
          <span style={{ fontWeight: 800, color: '#0070c0' }}>{Number(itemData.slKH || 0).toLocaleString('vi-VN')} {unit}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
          <span style={{ color: color, fontWeight: 700 }}>• Thực tế:</span>
          <span style={{ fontWeight: 800, color: color }}>{Number(itemData.slTT || 0).toLocaleString('vi-VN')} {unit}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '4px' }}>
          <span style={{ color: '#475569', fontWeight: 700 }}>• Tiến độ đạt:</span>
          <span style={{ fontWeight: 900, color: color }}>{pctNum.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const KeHoachSanXuatThang = () => {
  console.log(">>> [KeHoachSanXuatThang] Khởi tạo trang Theo dõi KHSX Theo Từng Ngày Trong Tháng");

  // Thời gian mặc định
  const now = dayjs();
  const currentYearNow = now.year();
  const currentMonthNow = now.month() + 1; // 1..12

  // States quản lý Bộ lọc Thời gian chung
  const [selectedYear, setSelectedYear] = useState(currentYearNow);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNow);

  // States quản lý Bộ lọc Máy tách riêng biệt cho từng công đoạn
  const [selectedCvMachine, setSelectedCvMachine] = useState(''); // "" = Tất cả máy Cắt vải, "ORC-CV-01"..."ORC-CV-07"
  const [selectedThMachine, setSelectedThMachine] = useState(''); // "" = Tất cả máy Thành hình, "01"..."30"

  // States danh sách thiết bị từ Backend
  const [thMachineList, setThMachineList] = useState([]);
  const [cvMachineList, setCvMachineList] = useState([]);

  // States dữ liệu biểu đồ ngày trong tháng
  const [chartCvDailyData, setChartCvDailyData] = useState([]);
  const [chartThDailyData, setChartThDailyData] = useState([]);
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [isLoadingTh, setIsLoadingTh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Danh sách các năm lựa chọn
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = currentYearNow - 5; y <= currentYearNow + 4; y++) {
      list.push(y);
    }
    return list;
  }, [currentYearNow]);

  // 1. Tải danh sách thiết bị TH và CV từ API Backend
  useEffect(() => {
    const fetchMachineLists = async () => {
      try {
        console.log(">>> [KeHoachSanXuatThang] Tải danh mục thiết bị TH & CV từ Backend API...");

        // ── A. Danh sách máy TH từ getDanhSachMay() ──
        let thItems = [];
        try {
          const resTH = await getDanhSachMay();
          console.log(">>> [KeHoachSanXuatThang] Kết quả API getDanhSachMay:", resTH);
          const rawTH = (resTH && Array.isArray(resTH.data)) ? resTH.data : (Array.isArray(resTH) ? resTH : []);

          if (rawTH.length > 0) {
            thItems = rawTH
              .map(m => {
                const code = String(m.MaMay || m.maMay || m.EquipmentID || m.equipmentId || '').trim();
                const name = String(m.TenMay || m.tenMay || m.EquipmentName || m.equipmentName || '').trim();
                const numOnly = code.replace(/\D/g, '');
                const val = numOnly ? numOnly.padStart(2, '0') : code;
                const label = name || (val ? `Máy ${val}` : code);
                return { value: val, label: label, originalCode: code };
              })
              .filter(item => item.value && item.value !== '04' && item.value !== '13');

            const uniqueMap = new Map();
            thItems.forEach(it => { if (!uniqueMap.has(it.value)) uniqueMap.set(it.value, it); });
            thItems = Array.from(uniqueMap.values()).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }));
          }
        } catch (errTH) {
          console.error(">>> [KeHoachSanXuatThang] Lỗi API getDanhSachMay:", errTH);
        }

        if (thItems.length === 0) {
          for (let i = 1; i <= 30; i++) {
            const numStr = String(i).padStart(2, '0');
            if (numStr !== '04' && numStr !== '13') {
              thItems.push({ value: numStr, label: `Máy ${numStr}` });
            }
          }
        }
        setThMachineList(thItems);

        // ── B. Danh sách máy CV từ getCatVaiEquipments() ──
        let cvItems = [];
        try {
          const resCV = await getCatVaiEquipments();
          console.log(">>> [KeHoachSanXuatThang] Kết quả API getCatVaiEquipments:", resCV);
          const rawCV = (resCV && Array.isArray(resCV.data)) ? resCV.data : (Array.isArray(resCV) ? resCV : []);

          if (rawCV.length > 0) {
            cvItems = rawCV
              .map(m => {
                const id = String(m.EquipmentID || m.equipmentId || m.maMay || m.MaMay || m.id || '').trim();
                const name = String(m.EquipmentName || m.equipmentName || m.tenMay || m.TenMay || m.name || '').trim();
                if (!id) return null;
                const label = name && name !== id ? `${name} (${id})` : (id.startsWith('ORC-CV-') ? `Máy cắt vải ${id.replace('ORC-CV-', '')} (${id})` : id);
                return { value: id, label: label, name: name || id, equipmentId: id };
              })
              .filter(Boolean);

            const uniqueCvMap = new Map();
            cvItems.forEach(it => { if (!uniqueCvMap.has(it.value)) uniqueCvMap.set(it.value, it); });
            cvItems = Array.from(uniqueCvMap.values()).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }));
          }
        } catch (errCV) {
          console.error(">>> [KeHoachSanXuatThang] Lỗi API getCatVaiEquipments:", errCV);
        }

        if (cvItems.length === 0) {
          cvItems = [1, 2, 3, 4, 5, 6, 7].map(n => {
            const id = `ORC-CV-0${n}`;
            return { value: id, label: `Máy cắt vải 0${n} (${id})`, name: `Máy cắt vải 0${n}`, equipmentId: id };
          });
        }
        setCvMachineList(cvItems);

        console.log(">>> [KeHoachSanXuatThang] Danh sách máy TH:", thItems);
        console.log(">>> [KeHoachSanXuatThang] Danh sách máy CV:", cvItems);
      } catch (err) {
        console.error(">>> [KeHoachSanXuatThang] Lỗi khi tải danh sách máy:", err);
      }
    };

    fetchMachineLists();
  }, []);

  // 2A. Hàm tải dữ liệu theo từng ngày trong tháng của CẮT VẢI độc lập (Sử dụng API 3: getDailyStatsForMonthCatVai)
  const loadCvMonthData = useCallback(async (yearToLoad, monthToLoad, cvMachineToLoad) => {
    setIsLoadingCv(true);
    console.log(`>>> [KeHoachSanXuatThang] [CẮT VẢI] Tải dữ liệu API mới: Tháng ${monthToLoad}/${yearToLoad}, Máy CV=${cvMachineToLoad || 'TẤT CẢ'}`);

    const daysInMonth = new Date(yearToLoad, monthToLoad, 0).getDate();

    try {
      const cvParam = cvMachineToLoad || null;
      console.log(">>> [KeHoachSanXuatThang] Gọi getDailyStatsForMonthCatVai:", { nam_sx: yearToLoad, thang_sx: monthToLoad, maMay: cvParam });
      const res = await getDailyStatsForMonthCatVai({ nam_sx: yearToLoad, thang_sx: monthToLoad, maMay: cvParam });
      console.log(">>> [KeHoachSanXuatThang] Kết quả getDailyStatsForMonthCatVai:", res);
      const cvDailyRaw = (res && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);

      // Map dữ liệu vào các ngày trong tháng
      const mappedCV = Array.from({ length: daysInMonth }, (_, i) => {
        const dNum = i + 1;
        const dStr = String(dNum).padStart(2, '0');
        const found = cvDailyRaw.find(d => {
          const rowDay = Number(d.Day ?? d.day ?? d.Ngay_SX ?? d.ngay_sx ?? d.Ngay ?? d.ngay ?? 0);
          return rowDay === dNum;
        });

        if (found) {
          const slKH = Number(found.TongKeHoachDieuChinh ?? found.TongKeHoach ?? found.TongKeHoachHieuLuc ?? found.keHoach ?? found.tongKH ?? found.soLuongKH ?? found.SoLuong_KH_DieuChinh ?? found.SoLuong_KH ?? 0);
          const slTT = Number(found.TongSanLuong ?? found.tongSanLuong ?? found.TongSanLuongThucTe ?? found.tongSanLuongThucTe ?? found.sanLuongThucTe ?? found.SanLuong ?? found.sanluong ?? found.tongSX ?? found.soLuongSX ?? found.SoLuong_SX ?? 0);
          const pctVal = found.TyLeHoanThanh != null ? Number(found.TyLeHoanThanh) : (slKH > 0 ? (slTT / slKH) * 100 : 0);
          if (slKH > 0 || slTT > 0) {
            const pct = Number(pctVal.toFixed(1));
            return { ngay: `Ngày ${dStr}`, dayNum: dNum, KH: 100, TT: pct, slKH, slTT, pct };
          }
        }
        return { ngay: `Ngày ${dStr}`, dayNum: dNum, KH: 0, TT: 0, slKH: 0, slTT: 0, pct: 0 };
      });

      setChartCvDailyData(mappedCV);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (eCV) {
      console.error(">>> [KeHoachSanXuatThang] Lỗi gọi API Cắt vải:", eCV);
      const emptyCV = Array.from({ length: daysInMonth }, (_, i) => ({
        ngay: `Ngày ${String(i + 1).padStart(2, '0')}`,
        dayNum: i + 1,
        KH: 0,
        TT: 0,
        slKH: 0,
        slTT: 0,
        pct: 0
      }));
      setChartCvDailyData(emptyCV);
    } finally {
      setIsLoadingCv(false);
    }
  }, []);

  // 2B. Hàm tải dữ liệu theo từng ngày trong tháng của THÀNH HÌNH độc lập
  const loadThMonthData = useCallback(async (yearToLoad, monthToLoad, thMachineToLoad) => {
    setIsLoadingTh(true);
    console.log(`>>> [KeHoachSanXuatThang] [THÀNH HÌNH] Tải dữ liệu: Tháng ${monthToLoad}/${yearToLoad}, Máy TH=${thMachineToLoad || 'TẤT CẢ'}`);

    const daysInMonth = new Date(yearToLoad, monthToLoad, 0).getDate();
    const mmStr = String(monthToLoad).padStart(2, '0');

    try {
      const startShift = Number(`${yearToLoad}${mmStr}011`);
      const endShift = Number(`${yearToLoad}${mmStr}${String(daysInMonth).padStart(2, '0')}2`);
      const thParam = thMachineToLoad || null;

      console.log(">>> [KeHoachSanXuatThang] Gọi getTongHopCaNgay:", { startShift, endShift, maMay: thParam });
      const res = await getTongHopCaNgay({ startShift, endShift, maMay: thParam });
      console.log(">>> [KeHoachSanXuatThang] Kết quả getTongHopCaNgay:", res);

      const thDailyRaw = (res && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);

      // Gom các ca của từng ngày lại
      const dayMapTH = new Map();
      thDailyRaw.forEach(row => {
        let dayNum = 0;
        if (row.yearMonthDay) {
          dayNum = Number(String(row.yearMonthDay).slice(-2));
        } else if (row.Ngay_SX || row.ngay_sx) {
          dayNum = Number(row.Ngay_SX || row.ngay_sx);
        }

        if (dayNum > 0 && dayNum <= daysInMonth) {
          if (!dayMapTH.has(dayNum)) {
            dayMapTH.set(dayNum, { kh: 0, tt: 0 });
          }
          const cur = dayMapTH.get(dayNum);
          const khVal = Number(row.SoLuong_KH_DieuChinh || row.soLuongKHDieuChinh || row.SoLuong_KH || row.soLuongKH || row.tongKH || 0);
          const ttVal = Number(row.SoLuong_SX || row.soLuongSX || row.sanluongLopSX || row.tongSX || 0);
          cur.kh += khVal;
          cur.tt += ttVal;
        }
      });

      // Nếu API getTongHopCaNgay rỗng và xem tất cả máy, thử fallback getWeeklyProgress
      if (dayMapTH.size === 0 && !thMachineToLoad) {
        try {
          console.log(">>> [KeHoachSanXuatThang] Thử fallback getWeeklyProgress:", { yearToLoad, monthToLoad });
          const wpRes = await getWeeklyProgress(yearToLoad, monthToLoad);
          console.log(">>> [KeHoachSanXuatThang] Kết quả getWeeklyProgress:", wpRes);
          const wpList = (wpRes && Array.isArray(wpRes.data)) ? wpRes.data : (Array.isArray(wpRes) ? wpRes : []);
          wpList.forEach(w => {
            const dNum = Number(w.ngay || w.Ngay_SX || 0);
            if (dNum > 0 && dNum <= daysInMonth) {
              dayMapTH.set(dNum, {
                kh: Number(w.tongKH || 0),
                tt: Number(w.tongSX || 0)
              });
            }
          });
        } catch (eWP) {
          console.error(">>> [KeHoachSanXuatThang] Lỗi fallback getWeeklyProgress:", eWP);
        }
      }

      // Map vào danh sách các ngày trong tháng
      const mappedTH = Array.from({ length: daysInMonth }, (_, i) => {
        const dNum = i + 1;
        const dStr = String(dNum).padStart(2, '0');
        const found = dayMapTH.get(dNum);

        if (found && (found.kh > 0 || found.tt > 0)) {
          const pct = found.kh > 0 ? Number(((found.tt / found.kh) * 100).toFixed(1)) : 0;
          return { ngay: `Ngày ${dStr}`, dayNum: dNum, KH: 100, TT: pct, slKH: found.kh, slTT: found.tt, pct };
        }
        return { ngay: `Ngày ${dStr}`, dayNum: dNum, KH: 0, TT: 0, slKH: 0, slTT: 0, pct: 0 };
      });

      setChartThDailyData(mappedTH);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      console.error(">>> [KeHoachSanXuatThang] Lỗi khi tải dữ liệu kế hoạch tháng Thành Hình:", error);
    } finally {
      setIsLoadingTh(false);
    }
  }, []);

  // Tải dữ liệu Cắt Vải khi Năm, Tháng hoặc Máy Cắt Vải thay đổi (KHÔNG ẢNH HƯỞNG THÀNH HÌNH)
  useEffect(() => {
    loadCvMonthData(selectedYear, selectedMonth, selectedCvMachine);
  }, [selectedYear, selectedMonth, selectedCvMachine, loadCvMonthData]);

  // Tải dữ liệu Thành Hình khi Năm, Tháng hoặc Máy Thành Hình thay đổi (KHÔNG ẢNH HƯỞNG CẮT VẢI)
  useEffect(() => {
    loadThMonthData(selectedYear, selectedMonth, selectedThMachine);
  }, [selectedYear, selectedMonth, selectedThMachine, loadThMonthData]);

  // Xử lý nút Xem lại / Làm mới (Tải lại cả 2 công đoạn)
  const handleRefresh = () => {
    loadCvMonthData(selectedYear, selectedMonth, selectedCvMachine);
    loadThMonthData(selectedYear, selectedMonth, selectedThMachine);
  };

  // Xử lý nút Mặc định / Xóa lọc
  const handleResetFilter = () => {
    setSelectedYear(currentYearNow);
    setSelectedMonth(currentMonthNow);
    setSelectedCvMachine('');
    setSelectedThMachine('');
  };

  // 4. Tính toán tổng KPI cả tháng cho Cắt Vải
  const cvTotals = useMemo(() => {
    let totalKH = 0;
    let totalTT = 0;
    chartCvDailyData.forEach(d => {
      totalKH += (d.slKH || 0);
      totalTT += (d.slTT || 0);
    });
    const pct = totalKH > 0 ? Number(((totalTT / totalKH) * 100).toFixed(2)) : 0;
    return { totalKH, totalTT, pct };
  }, [chartCvDailyData]);

  // 5. Tính toán tổng KPI cả tháng cho Thành Hình
  const thTotals = useMemo(() => {
    let totalKH = 0;
    let totalTT = 0;
    chartThDailyData.forEach(d => {
      totalKH += (d.slKH || 0);
      totalTT += (d.slTT || 0);
    });
    const pct = totalKH > 0 ? Number(((totalTT / totalKH) * 100).toFixed(2)) : 0;
    return { totalKH, totalTT, pct };
  }, [chartThDailyData]);

  // Nhãn hiển thị của máy CV đang chọn
  const selectedCvMachineDisplay = useMemo(() => {
    if (!selectedCvMachine) return 'Tất cả máy Cắt vải';
    const foundCV = cvMachineList.find(m => m.value === selectedCvMachine);
    return foundCV ? foundCV.label : `Máy ${selectedCvMachine}`;
  }, [selectedCvMachine, cvMachineList]);

  // Nhãn hiển thị của máy TH đang chọn
  const selectedThMachineDisplay = useMemo(() => {
    if (!selectedThMachine) return 'Tất cả máy Thành hình';
    const foundTH = thMachineList.find(m => m.value === selectedThMachine);
    return foundTH ? foundTH.label : `Máy ${selectedThMachine}`;
  }, [selectedThMachine, thMachineList]);

  const isLoadingTotal = isLoadingCv || isLoadingTh;

  return (
    <div className="drc-month-container mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER PANEL ── */}
      <div className="drc-header-panel">
        <div className="drc-title-left">
          <span className="drc-badge-dot"></span>
          <h1>THEO DÕI TIẾN ĐỘ KẾ HOẠCH SẢN XUẤT THÁNG {selectedMonth}/{selectedYear}</h1>
        </div>
        <div className="drc-header-meta">
          <span>Cập nhật lúc: <strong>{lastUpdated || 'Đang tải...'}</strong></span>
          {isLoadingTotal && <span style={{ color: '#0284c7', fontWeight: 800 }}>• Đang xử lý...</span>}
        </div>
      </div>

      {/* ── 2. FILTER BAR CHUNG (CHỌN NĂM, THÁNG & NÚT ĐIỀU KHIỂN) ── */}
      <div className="drc-filter-bar">
        <div className="drc-filter-group">
          {/* Chọn Năm */}
          <div className="drc-field">
            <span className="drc-label"><FaCalendarAlt color="#0284c7" /> Năm:</span>
            <select
              className="drc-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map(y => (
                <option key={`opt-year-${y}`} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          {/* Chọn Tháng */}
          <div className="drc-field">
            <span className="drc-label"><FaCalendarAlt color="#0284c7" /> Tháng:</span>
            <select
              className="drc-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={`opt-month-${m}`} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* Nút Xem báo cáo */}
          <button className="drc-btn drc-btn-primary" onClick={handleRefresh}>
            <FaSearch /> Xem báo cáo
          </button>

          {/* Nút Mặc định */}
          <button className="drc-btn drc-btn-secondary" onClick={handleResetFilter}>
            <FaRedo /> Mặc định
          </button>
        </div>

        {/* Thông tin phạm vi đang lọc */}
        <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>
          Đang xem: <span style={{ color: '#0284c7' }}>{selectedCvMachineDisplay}</span> & <span style={{ color: '#16a34a' }}>{selectedThMachineDisplay}</span> • Tháng {selectedMonth}/{selectedYear}
        </div>
      </div>

      {/* ── 3. KPI TỔNG HỢP THÁNG (BIỂU ĐỒ THANH NGANG THEO ẢNH MẪU) ── */}
      <div className="drc-kpi-grid">
        {/* KPI Cắt vải */}
        <div className="drc-kpi-card cv">
          <div className="drc-kpi-title">
            <span>CÔNG ĐOẠN CẮT VẢI (CV)</span>
            <span
              className="drc-kpi-badge"
              style={{
                background: cvTotals.pct >= 100 ? '#dcfce7' : (cvTotals.pct >= 80 ? '#dcfce7' : (cvTotals.pct >= 50 ? '#ffedd5' : '#fee2e2')),
                color: getDayBarColor(cvTotals.pct, cvTotals.totalTT)
              }}
            >
              {cvTotals.pct.toFixed(2)}%
            </span>
          </div>
          <div className="drc-spec-table">
            {/* Hàng 1: SẢN XUẤT */}
            <div className="drc-spec-row top-row">
              <span className="drc-spec-label sx">SẢN XUẤT</span>
              <span className="drc-spec-divider">|</span>
              <span className="drc-spec-qty">{cvTotals.totalTT.toLocaleString('vi-VN')} <small style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>BTP</small></span>
              <span className="drc-spec-pct" style={{ color: getDayBarColor(cvTotals.pct, cvTotals.totalTT) }}>{cvTotals.pct.toFixed(2)}%</span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: `${Math.min(Math.max((cvTotals.pct / 120) * 100, 0), 100)}%`,
                    background: getDayBarColor(cvTotals.pct, cvTotals.totalTT)
                  }}
                />
              </div>
            </div>

            {/* Hàng 2: KẾ HOẠCH */}
            <div className="drc-spec-row">
              <span className="drc-spec-label kh">KẾ HOẠCH</span>
              <span className="drc-spec-divider">|</span>
              <span className="drc-spec-qty">{cvTotals.totalKH.toLocaleString('vi-VN')} <small style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>BTP</small></span>
              <span className="drc-spec-pct"></span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: cvTotals.totalKH > 0 ? '83.33%' : '0%',
                    background: '#0070c0'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Thành hình */}
        <div className="drc-kpi-card th">
          <div className="drc-kpi-title">
            <span>CÔNG ĐOẠN THÀNH HÌNH (TH)</span>
            <span
              className="drc-kpi-badge"
              style={{
                background: thTotals.pct >= 100 ? '#dcfce7' : (thTotals.pct >= 80 ? '#dcfce7' : (thTotals.pct >= 50 ? '#ffedd5' : '#fee2e2')),
                color: getDayBarColor(thTotals.pct, thTotals.totalTT)
              }}
            >
              {thTotals.pct.toFixed(2)}%
            </span>
          </div>
          <div className="drc-spec-table">
            {/* Hàng 1: SẢN XUẤT */}
            <div className="drc-spec-row top-row">
              <span className="drc-spec-label sx">SẢN XUẤT</span>
              <span className="drc-spec-divider">|</span>
              <span className="drc-spec-qty">{thTotals.totalTT.toLocaleString('vi-VN')} <small style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>lốp</small></span>
              <span className="drc-spec-pct" style={{ color: getDayBarColor(thTotals.pct, thTotals.totalTT) }}>{thTotals.pct.toFixed(2)}%</span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: `${Math.min(Math.max((thTotals.pct / 120) * 100, 0), 100)}%`,
                    background: getDayBarColor(thTotals.pct, thTotals.totalTT)
                  }}
                />
              </div>
            </div>

            {/* Hàng 2: KẾ HOẠCH */}
            <div className="drc-spec-row">
              <span className="drc-spec-label kh">KẾ HOẠCH</span>
              <span className="drc-spec-divider">|</span>
              <span className="drc-spec-qty">{thTotals.totalKH.toLocaleString('vi-VN')} <small style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>lốp</small></span>
              <span className="drc-spec-pct"></span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: thTotals.totalKH > 0 ? '83.33%' : '0%',
                    background: '#0070c0'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. BIỂU ĐỒ THEO DÕI KHSX CÔNG ĐOẠN CẮT VẢI THEO NGÀY TRONG THÁNG ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <FaChartBar color="#0284c7" />
            <span style={{ fontWeight: 900 }}>BIỂU ĐỒ KẾ HOẠCH SẢN XUẤT - CÔNG ĐOẠN CẮT VẢI THÁNG {selectedMonth}/{selectedYear}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <select
              className="drc-select"
              style={{ height: '26px', minWidth: '180px', borderColor: '#0284c7', fontSize: '11.5px', background: '#f0f9ff' }}
              value={selectedCvMachine}
              onChange={(e) => setSelectedCvMachine(e.target.value)}
            >
              <option value="">-- Tất cả máy Cắt vải --</option>
              {cvMachineList.map(m => (
                <option key={`opt-cv-chart-${m.value}`} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="drc-chart-body">
          <div className="drc-daychart-scroll">
            <div style={{ width: `${chartCvDailyData.length * 115 + 60}px`, minWidth: '100%', height: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartCvDailyData}
                  margin={{ top: 26, right: 20, left: -10, bottom: 0 }}
                  barGap={8}
                  barSize={32}
                  maxBarSize={34}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="ngay"
                    tickFormatter={(val) => val.replace('Ngày ', '')}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 800 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 130]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    unit="%"
                  />
                  <Tooltip content={<CustomDailyChartTooltip unit="BTP" />} />

                  {/* Cột Kế hoạch */}
                  <Bar dataKey="KH" name="KẾ HOẠCH" fill="#0070c0" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    <LabelList content={(props) => renderKhBarLabel(props, chartCvDailyData)} />
                  </Bar>
                  {/* Cột Thực tế */}
                  <Bar dataKey="TT" name="THỰC TẾ" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {chartCvDailyData.map((entry, index) => (
                      <Cell key={`cell-cv-daily-${index}`} fill={getDayBarColor(entry.pct, entry.slTT)} />
                    ))}
                    <LabelList content={(props) => renderTtBarLabel(props, chartCvDailyData)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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

      {/* ── 5. BIỂU ĐỒ THEO DÕI KHSX CÔNG ĐOẠN THÀNH HÌNH THEO NGÀY TRONG THÁNG ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <FaChartBar color="#16a34a" />
            <span style={{ fontWeight: 900 }}>BIỂU ĐỒ KẾ HOẠCH SẢN XUẤT - CÔNG ĐOẠN THÀNH HÌNH THÁNG {selectedMonth}/{selectedYear}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <select
              className="drc-select"
              style={{ height: '26px', minWidth: '160px', borderColor: '#16a34a', fontSize: '11.5px', background: '#f0fdf4' }}
              value={selectedThMachine}
              onChange={(e) => setSelectedThMachine(e.target.value)}
            >
              <option value="">-- Tất cả máy Thành hình --</option>
              {thMachineList.map(m => (
                <option key={`opt-th-chart-${m.value}`} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="drc-chart-body">
          <div className="drc-daychart-scroll">
            <div style={{ width: `${chartThDailyData.length * 115 + 60}px`, minWidth: '100%', height: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartThDailyData}
                  margin={{ top: 26, right: 20, left: -10, bottom: 0 }}
                  barGap={8}
                  barSize={32}
                  maxBarSize={34}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="ngay"
                    tickFormatter={(val) => val.replace('Ngày ', '')}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 800 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 130]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    unit="%"
                  />
                  <Tooltip content={<CustomDailyChartTooltip unit="lốp" />} />

                  {/* Cột Kế hoạch */}
                  <Bar dataKey="KH" name="KẾ HOẠCH" fill="#0070c0" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    <LabelList content={(props) => renderKhBarLabel(props, chartThDailyData)} />
                  </Bar>
                  {/* Cột Thực tế */}
                  <Bar dataKey="TT" name="THỰC TẾ" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {chartThDailyData.map((entry, index) => (
                      <Cell key={`cell-th-daily-${index}`} fill={getDayBarColor(entry.pct, entry.slTT)} />
                    ))}
                    <LabelList content={(props) => renderTtBarLabel(props, chartThDailyData)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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

export default KeHoachSanXuatThang;
