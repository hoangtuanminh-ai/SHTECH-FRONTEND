// src/pages/Dashboard/KeHoachSanXuatNam.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';
import { FaCalendarAlt, FaSearch, FaRedo, FaCogs, FaChartBar } from 'react-icons/fa';
import { getKeHoachTrend } from '../../api/kehoachApi';
import { getCatVaiMonthlyStats, getCatVaiEquipments } from '../../api/catVaiApi';
import { getMachinesWithStats, getDanhSachMay } from '../../api/thanhhinhApi';

/* ─── STYLESHEET CHUẨN MES / INDUSTRIAL CHO TRANG KẾ HOẠCH NĂM ─────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  .mes-fade { animation: fadein 0.25s ease-out; }

  .drc-year-container {
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
  .drc-title-main {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: 0.3px;
  }
  .drc-title-sub {
    font-size: 13px;
    font-weight: 800;
    color: #1565C0;
    letter-spacing: 0.2px;
  }

  /* ── Filter Bar ── */
  .drc-filter-bar {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .drc-filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
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
    white-space: nowrap;
  }

  .drc-select {
    height: 30px;
    padding: 2px 10px;
    border: 1px solid #94a3b8;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    background: #ffffff;
    outline: none;
    cursor: pointer;
    min-width: 120px;
    transition: border-color 0.15s;
  }
  .drc-select:focus {
    border-color: #0284c7;
    box-shadow: 0 0 0 2px rgba(2,132,199,0.15);
  }

  .drc-btn {
    height: 30px;
    padding: 0 14px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
    user-select: none;
  }
  .drc-btn-primary {
    background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    border-color: #0284c7;
  }
  .drc-btn-primary:hover {
    background: linear-gradient(180deg, #0369a1 0%, #075985 100%);
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
    text-align: center;
    padding: 6px 12px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    border-bottom: 2px solid #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .drc-chart-body {
    height: 250px;
    padding: 8px 10px 4px 6px;
    position: relative;
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

/* ─── Dữ liệu khởi tạo 12 tháng rỗng ─────────────────────────────────────── */
const EMPTY_12_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  thang: `Tháng ${i + 1}`,
  KH: 0,
  TT: 0,
  slKH: 0,
  slTT: 0,
  pct: 0
}));

/* ─── Hàm lấy màu cột Thực tế theo % hoàn thành kế hoạch ──────────────────── */
const getYearBarColor = (pct, actual = 0) => {
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

/* ─── Render Label cột Thực tế: Số lượng trên đỉnh + % hoàn thành bên trong ─ */
const renderTtBarLabel = (props, data) => {
  const { x, y, width, height, index } = props;
  const entry = data && data[index];
  if (!entry || !entry.slTT || Number(entry.slTT) <= 0) return null;
  const color = getYearBarColor(entry.pct, entry.slTT);
  const pctVal = Number(entry.pct || 0);
  const pctStr = `${pctVal.toFixed(pctVal % 1 === 0 ? 0 : (pctVal >= 100 ? 1 : 2))}%`;

  return (
    <g>
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

/* ─── Tooltip chi tiết cho Biểu đồ Năm ────────────────────────────────────── */
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#0070c0' }}>
          <span>📋 <strong>Kế hoạch (KH):</strong></span>
          <span style={{ fontWeight: 'bold' }}>{slKH.toLocaleString('vi-VN')} {unit}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: pctColor }}>
          <span>🏭 <strong>Thực tế (SX):</strong></span>
          <span style={{ fontWeight: 'bold' }}>{slTT.toLocaleString('vi-VN')} {unit}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #cbd5e1', fontWeight: '900' }}>
          <span>📊 Tỷ lệ hoàn thành:</span>
          <span style={{ color: pctColor }}>{pct.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const KeHoachSanXuatNam = () => {
  const currentYearNow = dayjs().year();

  // State bộ lọc
  const [selectedYear, setSelectedYear] = useState(currentYearNow);
  const [selectedMachine, setSelectedMachine] = useState(''); // '' = Tất cả các máy

  // State danh sách máy
  const [thMachineList, setThMachineList] = useState([]);
  const [cvMachineList, setCvMachineList] = useState([]);

  // State dữ liệu biểu đồ
  const [chartCvYearData, setChartCvYearData] = useState(EMPTY_12_MONTHS);
  const [chartThYearData, setChartThYearData] = useState(EMPTY_12_MONTHS);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Danh sách các năm lựa chọn (từ 5 năm trước đến 2 năm sau)
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = currentYearNow - 4; y <= currentYearNow + 2; y++) {
      list.push(y);
    }
    return list;
  }, [currentYearNow]);

  // 1. Tải danh sách máy Thành hình và Cắt vải khi mở trang
  useEffect(() => {
    const fetchMachineLists = async () => {
      try {
        console.log(">>> [KeHoachSanXuatNam] Đang tải danh sách thiết bị TH và CV từ API Backend...");

        // ── A. Lấy danh sách máy Thành hình trực tiếp từ API backend getDanhSachMay ──
        let thItems = [];
        try {
          const resTH = await getDanhSachMay();
          console.log(">>> [KeHoachSanXuatNam] Kết quả API getDanhSachMay:", resTH);
          const rawTH = (resTH && Array.isArray(resTH.data)) ? resTH.data : (Array.isArray(resTH) ? resTH : []);

          if (rawTH.length > 0) {
            thItems = rawTH
              .map(m => {
                const code = String(m.MaMay || m.maMay || m.EquipmentID || m.equipmentId || '').trim();
                const name = String(m.TenMay || m.tenMay || m.EquipmentName || m.equipmentName || '').trim();
                // Chuẩn hóa mã máy thành 2 số: '01', '02', '03'...
                const numOnly = code.replace(/\D/g, '');
                const val = numOnly ? numOnly.padStart(2, '0') : code;
                const label = name || (val ? `Máy ${val}` : code);
                return { value: val, label: label, originalCode: code };
              })
              .filter(item => item.value && item.value !== '04' && item.value !== '13');

            // Loại bỏ các máy trùng mã
            const uniqueMap = new Map();
            thItems.forEach(it => { if (!uniqueMap.has(it.value)) uniqueMap.set(it.value, it); });
            thItems = Array.from(uniqueMap.values()).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }));
          }
        } catch (errTH) {
          console.error(">>> [KeHoachSanXuatNam] Lỗi gọi API getDanhSachMay:", errTH);
        }

        // Fallback an toàn nếu API backend chưa có dữ liệu
        if (thItems.length === 0) {
          for (let i = 1; i <= 30; i++) {
            const numStr = String(i).padStart(2, '0');
            if (numStr !== '04' && numStr !== '13') {
              thItems.push({ value: numStr, label: `Máy ${numStr}` });
            }
          }
        }
        setThMachineList(thItems);

        // ── B. Lấy danh sách máy Cắt vải từ API getCatVaiEquipments ──
        let cvItems = [];
        try {
          const resCV = await getCatVaiEquipments();
          console.log(">>> [KeHoachSanXuatNam] Kết quả API getCatVaiEquipments:", resCV);
          const rawCV = (resCV && Array.isArray(resCV.data)) ? resCV.data : (Array.isArray(resCV) ? resCV : []);

          if (rawCV.length > 0) {
            cvItems = rawCV
              .map(m => {
                const id = String(m.EquipmentID || m.equipmentId || m.maMay || m.MaMay || m.id || '').trim();
                const name = String(m.EquipmentName || m.equipmentName || m.tenMay || m.TenMay || m.name || '').trim();
                if (!id) return null;
                // Hiển thị EquipmentName kèm chú thích EquipmentID
                const label = name && name !== id ? `${name} (${id})` : (id.startsWith('ORC-CV-') ? `Máy cắt vải ${id.replace('ORC-CV-', '')} (${id})` : id);
                return { value: id, label: label, name: name || id, equipmentId: id };
              })
              .filter(Boolean);

            // Loại bỏ trùng mã
            const uniqueCvMap = new Map();
            cvItems.forEach(it => { if (!uniqueCvMap.has(it.value)) uniqueCvMap.set(it.value, it); });
            cvItems = Array.from(uniqueCvMap.values()).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true }));
          }
        } catch (errCV) {
          console.error(">>> [KeHoachSanXuatNam] Lỗi gọi API getCatVaiEquipments:", errCV);
        }

        // Fallback danh sách mặc định kèm tên và chú thích ID nếu API rỗng
        if (cvItems.length === 0) {
          cvItems = [1, 2, 3, 4, 5, 6, 7].map(n => {
            const id = `ORC-CV-0${n}`;
            return { value: id, label: `Máy cắt vải 0${n} (${id})`, name: `Máy cắt vải 0${n}`, equipmentId: id };
          });
        }
        setCvMachineList(cvItems);

        console.log(">>> [KeHoachSanXuatNam] Danh sách máy TH từ API:", thItems);
        console.log(">>> [KeHoachSanXuatNam] Danh sách máy CV từ API (có EquipmentName + EquipmentID):", cvItems);
      } catch (err) {
        console.error(">>> [KeHoachSanXuatNam] Lỗi tải danh sách máy:", err);
      }
    };

    fetchMachineLists();
  }, []);

  // 2. Hàm tải dữ liệu báo cáo 12 tháng theo Năm và Máy đã chọn
  const loadYearData = useCallback(async (yearToLoad, machineToLoad) => {
    setIsLoading(true);
    console.log(`>>> [KeHoachSanXuatNam] Bắt đầu tải dữ liệu: Năm=${yearToLoad}, Máy=${machineToLoad || 'TẤT CẢ'}`);

    try {
      // Phân biệt công đoạn của máy đã chọn:
      // Máy CV là máy có chứa chữ CV (ví dụ ORC-CV-01). Máy TH là mã máy 2 chữ số (01, 02, 03...)
      const isCvMachine = machineToLoad ? machineToLoad.toUpperCase().includes('CV') : false;
      const isThMachine = machineToLoad ? !isCvMachine : false;

      // ── A. Tải dữ liệu CẮT VẢI ──
      if (machineToLoad && isThMachine) {
        // Người dùng chọn máy TH (ví dụ 01, 02) -> Cắt vải không áp dụng, gán rỗng
        console.log(`>>> [KeHoachSanXuatNam] Đang chọn máy TH (${machineToLoad}) -> Cắt Vải gán rỗng`);
        setChartCvYearData(EMPTY_12_MONTHS);
      } else {
        const cvParamMachine = isCvMachine ? machineToLoad : null;
        console.log(">>> [KeHoachSanXuatNam] Gọi getCatVaiMonthlyStats với:", { yearToLoad, cvParamMachine });
        const resCV = await getCatVaiMonthlyStats(yearToLoad, cvParamMachine);
        console.log(">>> [KeHoachSanXuatNam] Kết quả getCatVaiMonthlyStats:", resCV);

        const cvArray = (resCV && Array.isArray(resCV.data)) ? resCV.data : (Array.isArray(resCV) ? resCV : []);
        if (cvArray.length > 0) {
          const mappedCV = Array.from({ length: 12 }, (_, i) => {
            const mNum = i + 1;
            const found = cvArray.find(d => Number(d.Thang_SX ?? d.thang_sx ?? d.thang ?? d.Thang ?? 0) === mNum);
            if (found) {
              const slKH = Number(found.TongKeHoachDieuChinh ?? found.TongKeHoach ?? found.TongKeHoachHieuLuc ?? found.keHoach ?? found.tongKH ?? found.soLuongKH ?? found.SoLuong_KH_DieuChinh ?? found.SoLuong_KH ?? 0);
              const slTT = Number(found.TongSanLuong ?? found.tongSanLuong ?? found.TongSanLuongThucTe ?? found.tongSanLuongThucTe ?? found.sanLuongThucTe ?? found.SanLuong ?? found.sanluong ?? found.tongSX ?? found.soLuongSX ?? found.SoLuong_SX ?? 0);
              if (slKH > 0 || slTT > 0) {
                const pct = slKH > 0 ? Number(((slTT / slKH) * 100).toFixed(1)) : 0;
                return { thang: `Tháng ${mNum}`, KH: 100, TT: pct, slKH, slTT, pct };
              }
            }
            return { thang: `Tháng ${mNum}`, KH: 0, TT: 0, slKH: 0, slTT: 0, pct: 0 };
          });
          setChartCvYearData(mappedCV);
        } else {
          setChartCvYearData(EMPTY_12_MONTHS);
        }
      }

      // ── B. Tải dữ liệu THÀNH HÌNH ──
      if (machineToLoad && isCvMachine) {
        // Người dùng chọn máy CV -> Thành hình không áp dụng, gán rỗng
        console.log(`>>> [KeHoachSanXuatNam] Đang chọn máy CV (${machineToLoad}) -> Thành Hình gán rỗng`);
        setChartThYearData(EMPTY_12_MONTHS);
      } else {
        // Gửi trực tiếp mã máy 01, 02, 03... lên API
        const thParamMachine = isThMachine ? machineToLoad : null;
        console.log(">>> [KeHoachSanXuatNam] Gọi getKeHoachTrend với:", { yearToLoad, thParamMachine });
        const resTH = await getKeHoachTrend(yearToLoad, thParamMachine);
        console.log(">>> [KeHoachSanXuatNam] Kết quả getKeHoachTrend:", resTH);

        const thArray = (resTH && Array.isArray(resTH.data)) ? resTH.data : (Array.isArray(resTH) ? resTH : []);
        if (thArray.length > 0) {
          const mappedTH = Array.from({ length: 12 }, (_, i) => {
            const mNum = i + 1;
            const found = thArray.find(d => Number(d.thang || d.thang_sx || d.Thang || d.Thang_SX || 0) === mNum);
            if (found) {
              const slKH = Number(found.tongKH || found.keHoach || found.TongKeHoach || 0);
              const slTT = Number(found.tongSX || found.sanLuongThucTe || found.TongSanLuong || 0);
              if (slKH > 0 || slTT > 0) {
                const pct = slKH > 0 ? Number(((slTT / slKH) * 100).toFixed(1)) : 0;
                return { thang: `Tháng ${mNum}`, KH: 100, TT: pct, slKH, slTT, pct };
              }
            }
            return { thang: `Tháng ${mNum}`, KH: 0, TT: 0, slKH: 0, slTT: 0, pct: 0 };
          });
          setChartThYearData(mappedTH);
        } else {
          setChartThYearData(EMPTY_12_MONTHS);
        }
      }

      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      console.error(">>> [KeHoachSanXuatNam] Lỗi khi tải dữ liệu kế hoạch năm:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải dữ liệu ban đầu và khi thay đổi bộ lọc
  useEffect(() => {
    loadYearData(selectedYear, selectedMachine);
  }, [selectedYear, selectedMachine, loadYearData]);

  // Xử lý khi nhấn nút Làm mới
  const handleRefresh = () => {
    loadYearData(selectedYear, selectedMachine);
  };

  // Xử lý khi nhấn nút Xóa lọc
  const handleResetFilter = () => {
    setSelectedYear(currentYearNow);
    setSelectedMachine('');
    loadYearData(currentYearNow, '');
  };

  // 4. Tính toán tổng KPI cả năm cho Cắt Vải
  const cvTotals = useMemo(() => {
    let totalKH = 0;
    let totalTT = 0;
    chartCvYearData.forEach(d => {
      totalKH += (d.slKH || 0);
      totalTT += (d.slTT || 0);
    });
    const pct = totalKH > 0 ? Number(((totalTT / totalKH) * 100).toFixed(2)) : 0;
    return { totalKH, totalTT, pct };
  }, [chartCvYearData]);

  // 5. Tính toán tổng KPI cả năm cho Thành Hình
  const thTotals = useMemo(() => {
    let totalKH = 0;
    let totalTT = 0;
    chartThYearData.forEach(d => {
      totalKH += (d.slKH || 0);
      totalTT += (d.slTT || 0);
    });
    const pct = totalKH > 0 ? Number(((totalTT / totalKH) * 100).toFixed(2)) : 0;
    return { totalKH, totalTT, pct };
  }, [chartThYearData]);

  // Nhãn hiển thị của máy đang chọn (kèm EquipmentName + EquipmentID)
  const selectedMachineDisplay = useMemo(() => {
    if (!selectedMachine) return 'Toàn bộ xưởng CV-TH';
    const foundTH = thMachineList.find(m => m.value === selectedMachine);
    if (foundTH) return foundTH.label;
    const foundCV = cvMachineList.find(m => m.value === selectedMachine);
    if (foundCV) return foundCV.label;
    return `Máy ${selectedMachine}`;
  }, [selectedMachine, thMachineList, cvMachineList]);

  return (
    <div className="drc-year-container mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER TITLE PANEL ── */}
      <div className="drc-header-panel">
        <div className="drc-title-left">
          <span className="drc-title-main">DASHBOARD</span>
          <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>|</span>
          <span className="drc-title-sub">THEO DÕI KẾ HOẠCH SẢN XUẤT NĂM {selectedYear}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
          {isLoading ? (
            <span style={{ color: '#0284c7', fontWeight: 'bold' }}>⏳ Đang tải dữ liệu...</span>
          ) : (
            <span>Cập nhật lần cuối: <strong>{lastUpdated || dayjs().format('HH:mm:ss')}</strong></span>
          )}
        </div>
      </div>

      {/* ── 2. FILTER BAR (CHỌN NĂM & CHỌN MÁY) ── */}
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

          {/* Chọn Máy */}
          <div className="drc-field">
            <span className="drc-label"><FaCogs color="#16a34a" /> Thiết bị / Máy:</span>
            <select
              className="drc-select"
              style={{ minWidth: '240px' }}
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
            >
              <option value="">-- Tất cả các máy --</option>
              <optgroup label="Công đoạn Thành hình">
                {thMachineList.map(m => (
                  <option key={`opt-th-${m.value}`} value={m.value}>{m.label}</option>
                ))}
              </optgroup>
              <optgroup label="Công đoạn Cắt vải (Tên máy & Mã ID)">
                {cvMachineList.map(m => (
                  <option key={`opt-cv-${m.value}`} value={m.value}>{m.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Nút Xem báo cáo */}
          <button className="drc-btn drc-btn-primary" onClick={handleRefresh}>
            <FaSearch /> Xem báo cáo
          </button>

          {/* Nút Xóa lọc */}
          <button className="drc-btn drc-btn-secondary" onClick={handleResetFilter}>
            <FaRedo /> Mặc định
          </button>
        </div>

        {/* Thông tin phạm vi đang lọc */}
        <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>
          Đang hiển thị: <span style={{ color: '#0369a1' }}>{selectedMachineDisplay}</span> • Năm {selectedYear}
        </div>
      </div>

      {/* ── 3. KPI TỔNG HỢP NĂM (BIỂU ĐỒ THANH NGANG THEO ẢNH MẪU) ── */}
      <div className="drc-kpi-grid">
        {/* KPI Cắt vải */}
        <div className="drc-kpi-card cv">
          <div className="drc-kpi-title">
            <span>CÔNG ĐOẠN CẮT VẢI (CV)</span>
            <span
              className="drc-kpi-badge"
              style={{
                background: cvTotals.pct >= 100 ? '#dcfce7' : (cvTotals.pct >= 80 ? '#dcfce7' : (cvTotals.pct >= 50 ? '#ffedd5' : '#fee2e2')),
                color: getYearBarColor(cvTotals.pct, cvTotals.totalTT)
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
              <span className="drc-spec-pct" style={{ color: getYearBarColor(cvTotals.pct, cvTotals.totalTT) }}>{cvTotals.pct.toFixed(2)}%</span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: `${Math.min(Math.max((cvTotals.pct / 120) * 100, 0), 100)}%`,
                    background: getYearBarColor(cvTotals.pct, cvTotals.totalTT)
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
                color: getYearBarColor(thTotals.pct, thTotals.totalTT)
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
              <span className="drc-spec-pct" style={{ color: getYearBarColor(thTotals.pct, thTotals.totalTT) }}>{thTotals.pct.toFixed(2)}%</span>
              <div className="drc-spec-bar-box">
                <div className="drc-spec-100-mark" title="Mốc 100% Kế hoạch" />
                <div
                  className="drc-spec-bar-fill"
                  style={{
                    width: `${Math.min(Math.max((thTotals.pct / 120) * 100, 0), 100)}%`,
                    background: getYearBarColor(thTotals.pct, thTotals.totalTT)
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

      {/* ── 4. BIỂU ĐỒ THEO DÕI KHSX CÔNG ĐOẠN CẮT VẢI ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head">
          <FaChartBar />
          BIỂU ĐỒ THEO DÕI KẾ HOẠCH SẢN XUẤT - CÔNG ĐOẠN CV NĂM {selectedYear} {selectedMachine ? `[${selectedMachineDisplay}]` : '[TẤT CẢ CÁC MÁY]'}
        </div>
        <div className="drc-chart-body">
          {selectedMachine && !selectedMachine.toUpperCase().includes('CV') ? (
            <div className="drc-empty-notice">
              <span>⚠️ Đang chọn <strong>{selectedMachineDisplay}</strong> (thuộc công đoạn Thành hình), không có số liệu Cắt vải.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartCvYearData}
                margin={{ top: 22, right: 16, left: -10, bottom: 0 }}
                barGap={3}
                barCategoryGap="12%"
                maxBarSize={38}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="thang" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  domain={[0, 130]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit="%"
                />
                <Tooltip content={<CustomYearChartTooltip unit="BTP" />} />

                {/* Cột Kế hoạch */}
                <Bar dataKey="KH" name="KẾ HOẠCH" fill="#0070c0" radius={[1, 1, 0, 0]} isAnimationActive={false}>
                  <LabelList content={(props) => renderKhBarLabel(props, chartCvYearData)} />
                </Bar>
                {/* Cột Thực tế */}
                <Bar dataKey="TT" name="THỰC TẾ" radius={[1, 1, 0, 0]} isAnimationActive={false}>
                  {chartCvYearData.map((entry, index) => (
                    <Cell key={`cell-cv-tt-${index}`} fill={getYearBarColor(entry.pct, entry.slTT)} />
                  ))}
                  <LabelList content={(props) => renderTtBarLabel(props, chartCvYearData)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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

      {/* ── 5. BIỂU ĐỒ THEO DÕI KHSX CÔNG ĐOẠN THÀNH HÌNH ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head">
          <FaChartBar />
          BIỂU ĐỒ THEO DÕI KẾ HOẠCH SẢN XUẤT - CÔNG ĐOẠN TH NĂM {selectedYear} {selectedMachine ? `[${selectedMachineDisplay}]` : '[TẤT CẢ CÁC MÁY]'}
        </div>
        <div className="drc-chart-body">
          {selectedMachine && selectedMachine.toUpperCase().includes('CV') ? (
            <div className="drc-empty-notice">
              <span>⚠️ Đang chọn <strong>{selectedMachineDisplay}</strong> (thuộc công đoạn Cắt vải), không có số liệu Thành hình.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartThYearData}
                margin={{ top: 22, right: 16, left: -10, bottom: 0 }}
                barGap={3}
                barCategoryGap="12%"
                maxBarSize={38}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="thang" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  domain={[0, 130]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit="%"
                />
                <Tooltip content={<CustomYearChartTooltip unit="lốp" />} />

                {/* Cột Kế hoạch */}
                <Bar dataKey="KH" name="KẾ HOẠCH" fill="#0070c0" radius={[1, 1, 0, 0]} isAnimationActive={false}>
                  <LabelList content={(props) => renderKhBarLabel(props, chartThYearData)} />
                </Bar>
                {/* Cột Thực tế */}
                <Bar dataKey="TT" name="THỰC TẾ" radius={[1, 1, 0, 0]} isAnimationActive={false}>
                  {chartThYearData.map((entry, index) => (
                    <Cell key={`cell-th-tt-${index}`} fill={getYearBarColor(entry.pct, entry.slTT)} />
                  ))}
                  <LabelList content={(props) => renderTtBarLabel(props, chartThYearData)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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

export default KeHoachSanXuatNam;
