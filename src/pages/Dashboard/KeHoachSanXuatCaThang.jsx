// src/pages/Dashboard/KeHoachSanXuatCaThang.jsx
// Trang Báo cáo Theo dõi Tiến độ Kế hoạch Sản xuất Theo Từng Ca & Ngày Trong Tháng (Cắt vải & Thành hình)
// Biểu đồ 3 cột/ngày (Ca 1 -> Ca 2 -> Ca 3) chuẩn hóa từ MayThanhHinhDashboard & MayCatVaiDashboard
// Hỗ trợ chọn Năm, Tháng và Danh sách Thiết bị / Máy thực tế từ API Backend

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';
import { FaCalendarAlt, FaSearch, FaRedo, FaSyncAlt, FaCogs, FaChartBar, FaFilePdf } from 'react-icons/fa';
import { exportDashboardToPDF } from '../../utils/exportPdfHelper';

// Import API chính thức
import { getTongHopCaNgay, getDanhSachMay } from '../../api/thanhhinhApi';
import { getShiftStatsForMonthCatVai, getCatVaiEquipments } from '../../api/catVaiApi';
import {
  SHIFT_ORDER,
  getDaysInMonth,
  buildTongHopCaNgayChartData
} from '../../utils/tongHopCaNgayChart';
import TongHopCaNgayTooltip from '../../components/chart/TongHopCaNgayTooltip';

/* ─── STYLESHEET CHUẨN MES / INDUSTRIAL CHO BIỂU ĐỒ 3 CA THEO NGÀY ───────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  .mes-fade { animation: fadein 0.25s ease-out; }

  .drc-shift-month-container {
    padding: 10px 14px;
    background: #f1f5f9;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1e293b;
    min-height: calc(100vh - 58px);
    display: flex;
    flex-direction: column;
    gap: 12px;
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
  .drc-chart-head.cv-head {
    background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
  }
  .drc-chart-head.th-head {
    background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
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

  /* Khung cuộn ngang 3 ngày (9 cột ca)/khung nhìn trên điện thoại, trượt ngang xem trọn tháng */
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
    padding: 6px 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
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

/* ─── Hàm lấy màu cột theo tỷ lệ % hoàn thành kế hoạch từng ca (6 thang màu chuẩn) ─── */
const getShiftBarColor = (pct) => {
  if (pct == null || pct === undefined || pct <= 0) return '#cbd5e1'; // Không có / chưa có sản lượng: Xám
  if (pct > 100) return '#007a37';  // Vượt kế hoạch (> 100%): Xanh lá đậm
  if (pct >= 100) return '#00b050'; // Đạt kế hoạch (== 100%): Xanh lá tươi
  if (pct >= 80) return '#84cc16';  // Tiến độ tốt (80% - < 100%): Xanh lá nhạt
  if (pct >= 50) return '#ff9900';  // Tiến độ trung bình (50% - < 80%): Màu cam
  return '#ef4444';                 // Dưới yêu cầu (< 50%): Màu đỏ
};

/* ─── Render Label cột Thực hiện Ca: Số lượng trên đỉnh cột + Tỷ lệ % ở dưới đầu mỗi cột (ngắt dòng) ─── */
const renderShiftBarLabel = (props, data, shiftKey) => {
  const { x, y, width, height, index } = props;
  const entry = data && data[index];
  if (!entry) return null;

  const sanLuong = Number(entry[`${shiftKey}_sanLuong`] || 0);
  const coDuLieu = Boolean(entry[`${shiftKey}_coDuLieu`]);

  // Nếu ca này không có dữ liệu hoặc không có sản lượng thì không hiển thị nhãn
  if (!coDuLieu || sanLuong <= 0) return null;

  const tyLe = Number(entry[`${shiftKey}_tyLe`] || 0);
  const color = getShiftBarColor(tyLe);
  const pctVal = Number(tyLe || 0);
  
  // Định dạng con số %: làm tròn nếu là số nguyên hoặc chẵn, lấy 1 số thập phân nếu có phần lẻ (ví dụ: 100, 98.5, 101.3)
  const numStr = pctVal % 1 === 0
    ? String(Math.round(pctVal))
    : (Number.isInteger(Number(pctVal.toFixed(1))) ? String(Math.round(pctVal)) : pctVal.toFixed(1));

  // Test log kiểm tra dữ liệu nhãn từng ca (lấy mẫu các ca đầu để không làm ngập log)
  if (index === 0 && (shiftKey === 'ca1' || shiftKey === 'ca2')) {
    console.log(`>>> [KeHoachSanXuatCaThang - Test Label] Ngày ${entry.day} [${shiftKey}]: SL=${sanLuong}, Tỷ lệ=${numStr}%, Width=${width}, Height=${height}`);
  }

  return (
    <g>
      {/* 1. Số lượng sản xuất thực tế trên đỉnh cột (ở ngoài thân cột) */}
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#1e293b"
        textAnchor="middle"
        fontSize={9.5}
        fontWeight="800"
      >
        {Number(sanLuong).toLocaleString('vi-VN')}
      </text>

      {/* 2. Tỷ lệ % ở dưới đầu mỗi cột (bên trong thân cột, ký tự % xuống dòng dưới con số) */}
      {height >= 26 ? (
        <g>
          {/* Dòng 1: Con số tiến độ */}
          <text
            x={x + width / 2}
            y={y + 13}
            fill="#ffffff"
            textAnchor="middle"
            fontSize={numStr.length >= 5 ? 8.5 : 9.5}
            fontWeight="900"
          >
            {numStr}
          </text>
          {/* Dòng 2: Ký hiệu % xuống dòng */}
          <text
            x={x + width / 2}
            y={y + 24}
            fill="#ffffff"
            textAnchor="middle"
            fontSize={9}
            fontWeight="900"
          >
            %
          </text>
        </g>
      ) : height >= 14 ? (
        /* Cột chiều cao trung bình (14px <= height < 26px): hiển thị số và % cùng 1 dòng */
        <text
          x={x + width / 2}
          y={y + 11}
          fill="#ffffff"
          textAnchor="middle"
          fontSize={8}
          fontWeight="900"
        >
          {numStr}%
        </text>
      ) : (
        /* Cột quá thấp (< 14px): hiển thị % phía trên đầu cột */
        <text
          x={x + width / 2}
          y={y - 15}
          fill={color}
          textAnchor="middle"
          fontSize={8.5}
          fontWeight="800"
        >
          {numStr}%
        </text>
      )}
    </g>
  );
};

const KeHoachSanXuatCaThang = () => {
  console.log(">>> [KeHoachSanXuatCaThang] Khởi tạo trang Theo dõi KHSX Theo Ca & Ngày Trong Tháng");

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

  // States danh sách thiết bị
  const [thMachineList, setThMachineList] = useState([]);
  const [cvMachineList, setCvMachineList] = useState([]);

  // States dữ liệu biểu đồ 3 ca của 2 công đoạn
  const [chartCvShiftData, setChartCvShiftData] = useState([]);
  const [chartThShiftData, setChartThShiftData] = useState([]);
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [isLoadingTh, setIsLoadingTh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Ref container để xuất báo cáo PDF
  const containerRef = useRef(null);

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
        console.log(">>> [KeHoachSanXuatCaThang] Tải danh mục thiết bị TH & CV từ Backend API...");

        // ── A. Danh sách máy TH từ getDanhSachMay() ──
        let thItems = [];
        try {
          const resTH = await getDanhSachMay();
          console.log(">>> [KeHoachSanXuatCaThang] Kết quả API getDanhSachMay:", resTH);
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
          console.error(">>> [KeHoachSanXuatCaThang] Lỗi API getDanhSachMay:", errTH);
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
          console.log(">>> [KeHoachSanXuatCaThang] Kết quả API getCatVaiEquipments:", resCV);
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
          console.error(">>> [KeHoachSanXuatCaThang] Lỗi API getCatVaiEquipments:", errCV);
        }

        if (cvItems.length === 0) {
          cvItems = [1, 2, 3, 4, 5, 6, 7].map(n => {
            const id = `ORC-CV-0${n}`;
            return { value: id, label: `Máy cắt vải 0${n} (${id})`, name: `Máy cắt vải 0${n}`, equipmentId: id };
          });
        }
        setCvMachineList(cvItems);
      } catch (err) {
        console.error(">>> [KeHoachSanXuatCaThang] Lỗi tải danh mục máy:", err);
      }
    };

    fetchMachineLists();
  }, []);

  // 2A. Hàm tải dữ liệu từng ca trong ngày của tháng cho CẮT VẢI độc lập (Sử dụng API 4: getShiftStatsForMonthCatVai)
  const loadCvShiftMonthData = useCallback(async (yearToLoad, monthToLoad, cvMachineToLoad) => {
    setIsLoadingCv(true);
    console.log(`>>> [KeHoachSanXuatCaThang] [CẮT VẢI] Tải dữ liệu API mới: Tháng ${monthToLoad}/${yearToLoad}, Máy CV=${cvMachineToLoad || 'TẤT CẢ'}`);

    const mmStr = String(monthToLoad).padStart(2, '0');
    const monthKey = `${yearToLoad}-${mmStr}`;

    try {
      const cvParam = cvMachineToLoad || null;
      console.log(">>> [KeHoachSanXuatCaThang] Gọi getShiftStatsForMonthCatVai:", { nam_sx: yearToLoad, thang_sx: monthToLoad, maMay: cvParam });
      try {
        const resCV = await getShiftStatsForMonthCatVai({ nam_sx: yearToLoad, thang_sx: monthToLoad, maMay: cvParam });
        const rawCV = (resCV && Array.isArray(resCV.data)) ? resCV.data : (Array.isArray(resCV) ? resCV : []);
        console.log(`>>> [KeHoachSanXuatCaThang] Dữ liệu ca Cắt Vải (${rawCV.length} bản ghi):`, rawCV);
        const chartDataCV = buildTongHopCaNgayChartData(rawCV, monthKey);
        setChartCvShiftData(chartDataCV);
      } catch (eCV) {
        console.error(">>> [KeHoachSanXuatCaThang] Lỗi tải dữ liệu Cắt Vải:", eCV);
        setChartCvShiftData(buildTongHopCaNgayChartData([], monthKey));
      }
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      console.error(">>> [KeHoachSanXuatCaThang] Lỗi khi tải dữ liệu ca tháng Cắt Vải:", error);
    } finally {
      setIsLoadingCv(false);
    }
  }, []);

  // 2B. Hàm tải dữ liệu từng ca trong ngày của tháng cho THÀNH HÌNH độc lập
  const loadThShiftMonthData = useCallback(async (yearToLoad, monthToLoad, thMachineToLoad) => {
    setIsLoadingTh(true);
    console.log(`>>> [KeHoachSanXuatCaThang] [THÀNH HÌNH] Tải dữ liệu: Tháng ${monthToLoad}/${yearToLoad}, Máy TH=${thMachineToLoad || 'TẤT CẢ'}`);

    const daysInMonth = getDaysInMonth(yearToLoad, monthToLoad);
    const mmStr = String(monthToLoad).padStart(2, '0');
    const monthKey = `${yearToLoad}-${mmStr}`;
    const startShift = Number(`${yearToLoad}${mmStr}011`);
    const endShift = Number(`${yearToLoad}${mmStr}${String(daysInMonth).padStart(2, '0')}2`);

    try {
      const thParam = thMachineToLoad || null;
      console.log(">>> [KeHoachSanXuatCaThang] Gọi getTongHopCaNgay Thành Hình:", { startShift, endShift, maMay: thParam });
      try {
        const resTH = await getTongHopCaNgay({ startShift, endShift, maMay: thParam });
        const rawTH = (resTH && Array.isArray(resTH.data)) ? resTH.data : (Array.isArray(resTH) ? resTH : []);
        console.log(`>>> [KeHoachSanXuatCaThang] Dữ liệu ca Thành Hình (${rawTH.length} bản ghi):`, rawTH);
        const chartDataTH = buildTongHopCaNgayChartData(rawTH, monthKey);
        setChartThShiftData(chartDataTH);
      } catch (eTH) {
        console.error(">>> [KeHoachSanXuatCaThang] Lỗi tải dữ liệu Thành Hình:", eTH);
        setChartThShiftData(buildTongHopCaNgayChartData([], monthKey));
      }
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      console.error(">>> [KeHoachSanXuatCaThang] Lỗi khi tải dữ liệu ca tháng Thành Hình:", error);
    } finally {
      setIsLoadingTh(false);
    }
  }, []);

  // Tải dữ liệu Cắt Vải khi Năm, Tháng hoặc Máy Cắt Vải thay đổi (KHÔNG ẢNH HƯỞNG THÀNH HÌNH)
  useEffect(() => {
    loadCvShiftMonthData(selectedYear, selectedMonth, selectedCvMachine);
  }, [selectedYear, selectedMonth, selectedCvMachine, loadCvShiftMonthData]);

  // Tải dữ liệu Thành Hình khi Năm, Tháng hoặc Máy Thành Hình thay đổi (KHÔNG ẢNH HƯỞNG CẮT VẢI)
  useEffect(() => {
    loadThShiftMonthData(selectedYear, selectedMonth, selectedThMachine);
  }, [selectedYear, selectedMonth, selectedThMachine, loadThShiftMonthData]);

  // Xử lý nút Refresh (Tải lại cả 2 công đoạn)
  const handleRefresh = () => {
    console.log(">>> [KeHoachSanXuatCaThang] Click Refresh báo cáo kế hoạch ca tháng:", { selectedYear, selectedMonth, selectedCvMachine, selectedThMachine });
    loadCvShiftMonthData(selectedYear, selectedMonth, selectedCvMachine);
    loadThShiftMonthData(selectedYear, selectedMonth, selectedThMachine);
  };

  // Xử lý nút Mặc định
  const handleResetFilter = () => {
    setSelectedYear(currentYearNow);
    setSelectedMonth(currentMonthNow);
    setSelectedCvMachine('');
    setSelectedThMachine('');
  };

  // Xử lý xuất báo cáo PDF cho Kế hoạch Sản xuất Ca, Tháng
  const handleExportPDF = async () => {
    console.log(">>> [KeHoachSanXuatCaThang] Bắt đầu xuất PDF Kế hoạch sản xuất ca tháng...", { selectedYear, selectedMonth, selectedCvMachine, selectedThMachine });
    setIsExportingPDF(true);
    try {
      await exportDashboardToPDF({
        element: containerRef.current,
        title: `BÁO CÁO KẾ HOẠCH & SẢN XUẤT THEO CA THÁNG ${selectedMonth}/${selectedYear}`,
        fileName: `Bao_Cao_Ke_Hoach_San_Xuat_Ca_Thang_${selectedMonth}_${selectedYear}`,
        filterInfo: `Tháng: ${selectedMonth}/${selectedYear} | Máy Cắt Vải: ${selectedCvMachine ? `Máy ${selectedCvMachine}` : 'Tất cả'} | Máy Thành Hình: ${selectedThMachine ? `Máy ${selectedThMachine}` : 'Tất cả'}`
      });
      console.log(">>> [KeHoachSanXuatCaThang] Xuất PDF hoàn tất.");
    } catch (err) {
      console.error(">>> [KeHoachSanXuatCaThang] Lỗi xuất PDF:", err);
    } finally {
      setIsExportingPDF(false);
    }
  };

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

  // Tính tổng Kế hoạch, Sản lượng và % Tiến độ Tháng của Cắt vải (CV)
  const cvTotals = useMemo(() => {
    let totalKH = 0;
    let totalTT = 0;
    chartCvShiftData.forEach(d => {
      totalKH += (Number(d.ca1_keHoach) || 0) + (Number(d.ca2_keHoach) || 0) + (Number(d.ca3_keHoach) || 0);
      totalTT += (Number(d.ca1_sanLuong) || 0) + (Number(d.ca2_sanLuong) || 0) + (Number(d.ca3_sanLuong) || 0);
    });
    const pct = totalKH > 0 ? Number(((totalTT / totalKH) * 100).toFixed(2)) : 0;
    return { totalKH, totalTT, pct };
  }, [chartCvShiftData]);

  // Tính tổng Kế hoạch, Sản lượng và % Tiến độ Tháng của Thành hình (TH)
  const thTotals = useMemo(() => {
    let totalKH = 0;
    let totalTT = 0;
    chartThShiftData.forEach(d => {
      totalKH += (Number(d.ca1_keHoach) || 0) + (Number(d.ca2_keHoach) || 0) + (Number(d.ca3_keHoach) || 0);
      totalTT += (Number(d.ca1_sanLuong) || 0) + (Number(d.ca2_sanLuong) || 0) + (Number(d.ca3_sanLuong) || 0);
    });
    const pct = totalKH > 0 ? Number(((totalTT / totalKH) * 100).toFixed(2)) : 0;
    return { totalKH, totalTT, pct };
  }, [chartThShiftData]);

  // Chiều rộng canvas cuộn ngang (125px cho mỗi ngày chứa 3 cột ca rộng rãi)
  const daysCount = getDaysInMonth(selectedYear, selectedMonth);
  const canvasWidth = daysCount * 125 + 60;
  const isLoadingTotal = isLoadingCv || isLoadingTh;

  return (
    <div ref={containerRef} className="drc-shift-month-container mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER PANEL ── */}
      <div className="drc-header-panel">
        <div className="drc-title-left">
          <span className="drc-badge-dot"></span>
          <h1>THEO DÕI KẾ HOẠCH SẢN XUẤT THEO CA VÀ NGÀY - THÁNG {selectedMonth}/{selectedYear}</h1>
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

          {/* Nút Refresh */}
          <button className="drc-btn drc-btn-primary" onClick={handleRefresh}>
            <FaSyncAlt /> Refresh
          </button>

          {/* Nút Mặc định */}
          <button className="drc-btn drc-btn-secondary" onClick={handleResetFilter}>
            <FaRedo /> Mặc định
          </button>

          {/* Nút Xuất Báo Cáo PDF */}
          <button
            className="drc-btn"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            title="Xuất báo cáo PDF trực quan toàn bộ dashboard Kế hoạch ca, tháng"
            style={{
              background: '#dc2626',
              borderColor: '#b91c1c',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '700',
              cursor: isExportingPDF ? 'not-allowed' : 'pointer'
            }}
          >
            <FaFilePdf /> {isExportingPDF ? 'Đang xuất...' : 'XUẤT BÁO CÁO (PDF)'}
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
                color: getShiftBarColor(cvTotals.pct)
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
              <span className="drc-spec-pct" style={{ color: getShiftBarColor(cvTotals.pct) }}>{cvTotals.pct.toFixed(2)}%</span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: `${Math.min(Math.max((cvTotals.pct / 120) * 100, 0), 100)}%`,
                    background: getShiftBarColor(cvTotals.pct)
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
                color: getShiftBarColor(thTotals.pct)
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
              <span className="drc-spec-pct" style={{ color: getShiftBarColor(thTotals.pct) }}>{thTotals.pct.toFixed(2)}%</span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: `${Math.min(Math.max((thTotals.pct / 120) * 100, 0), 100)}%`,
                    background: getShiftBarColor(thTotals.pct)
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

      {/* ── 4. BIỂU ĐỒ THỰC HIỆN KH THEO CA - CÔNG ĐOẠN CẮT VẢI (XANH DƯƠNG) ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head cv-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <FaChartBar color="#ffffff" />
            <span style={{ fontWeight: 900 }}>CÔNG ĐOẠN CẮT VẢI (CV) - THỰC HIỆN KH THEO CA THÁNG {selectedMonth}/{selectedYear}</span>
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
          {chartCvShiftData.length === 0 ? (
            <div className="drc-empty-notice">
              <span>Chưa có dữ liệu kế hoạch theo ca cho tháng {selectedMonth}/{selectedYear}</span>
            </div>
          ) : (
            <div className="drc-daychart-scroll">
              <div style={{ width: `${canvasWidth}px`, minWidth: '100%', height: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartCvShiftData}
                    margin={{ top: 24, right: 18, left: -10, bottom: 0 }}
                    barSize={25}
                    barGap={3}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      interval={0}
                      tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 700 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      domain={[0, 130]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      unit="%"
                    />
                    <Tooltip
                      shared={false}
                      cursor={false}
                      content={<TongHopCaNgayTooltip />}
                    />
                    {/* Vẽ 3 cột tương ứng 3 Ca trong ngày (Ca 1 -> Ca 2 -> Ca 3) */}
                    {SHIFT_ORDER.map(shift => (
                      <Bar
                        key={`cv-shift-${shift.dataKey}`}
                        dataKey={`${shift.dataKey}_tyLe`}
                        name={shift.label}
                        radius={[2, 2, 0, 0]}
                        isAnimationActive={false}
                      >
                        {chartCvShiftData.map((entry, i) => (
                          <Cell
                            key={`cell-cv-${shift.dataKey}-${i}`}
                            fill={getShiftBarColor(entry[`${shift.dataKey}_tyLe`])}
                          />
                        ))}
                        {/* Nhãn hiển thị: Số lượng sản xuất trên đỉnh cột + Tỷ lệ % ở dưới đầu mỗi cột (ký tự % xuống dòng) */}
                        <LabelList
                          content={(props) => renderShiftBarLabel(props, chartCvShiftData, shift.dataKey)}
                        />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        <div className="drc-chart-legend">
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

      {/* ── 5. BIỂU ĐỒ THỰC HIỆN KH THEO CA - CÔNG ĐOẠN THÀNH HÌNH (XANH LÁ CÂY) ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head th-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <FaChartBar color="#ffffff" />
            <span style={{ fontWeight: 900 }}>CÔNG ĐOẠN THÀNH HÌNH (TH) - THỰC HIỆN KH THEO CA THÁNG {selectedMonth}/{selectedYear}</span>
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
          {chartThShiftData.length === 0 ? (
            <div className="drc-empty-notice">
              <span>Chưa có dữ liệu kế hoạch theo ca cho tháng {selectedMonth}/{selectedYear}</span>
            </div>
          ) : (
            <div className="drc-daychart-scroll">
              <div style={{ width: `${canvasWidth}px`, minWidth: '100%', height: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartThShiftData}
                    margin={{ top: 24, right: 18, left: -10, bottom: 0 }}
                    barSize={25}
                    barGap={3}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      interval={0}
                      tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 700 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      domain={[0, 130]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      unit="%"
                    />
                    <Tooltip
                      shared={false}
                      cursor={false}
                      content={<TongHopCaNgayTooltip />}
                    />
                    {/* Vẽ 3 cột tương ứng 3 Ca trong ngày (Ca 1 -> Ca 2 -> Ca 3) */}
                    {SHIFT_ORDER.map(shift => (
                      <Bar
                        key={`th-shift-${shift.dataKey}`}
                        dataKey={`${shift.dataKey}_tyLe`}
                        name={shift.label}
                        radius={[2, 2, 0, 0]}
                        isAnimationActive={false}
                      >
                        {chartThShiftData.map((entry, i) => (
                          <Cell
                            key={`cell-th-${shift.dataKey}-${i}`}
                            fill={getShiftBarColor(entry[`${shift.dataKey}_tyLe`])}
                          />
                        ))}
                        {/* Nhãn hiển thị: Số lượng sản xuất trên đỉnh cột + Tỷ lệ % ở dưới đầu mỗi cột (ký tự % xuống dòng) */}
                        <LabelList
                          content={(props) => renderShiftBarLabel(props, chartThShiftData, shift.dataKey)}
                        />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        <div className="drc-chart-legend">
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

export default KeHoachSanXuatCaThang;
