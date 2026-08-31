// src/pages/Dashboard/SanXuat5Nam.jsx
// Trang Báo cáo Tổng Sản Xuất 5 Năm Liên Tiếp (Gộp 5 năm vào 1 biểu đồ)
// Chỉ tính sản lượng sản xuất tổng cả năm (không tính kế hoạch, không cần chia nhỏ từng tháng)
// Hỗ trợ chọn Năm mốc và chọn Máy/Thiết bị

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';
import { FaCalendarAlt, FaSearch, FaRedo, FaCogs, FaChartBar, FaIndustry, FaTable } from 'react-icons/fa';

// Import API chính thức
import { getProductionQuantityFor5YearsCatVai, getCatVaiEquipments } from '../../api/catVaiApi';
import { getDanhSachMay, getProductionQuantityFor5Years } from '../../api/thanhhinhApi';

/* ─── STYLESHEET CHUẨN MES / INDUSTRIAL CHO BIỂU ĐỒ TỔNG SẢN XUẤT 5 NĂM ───────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  .mes-fade { animation: fadein 0.25s ease-out; }

  .drc-5year-container {
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

  /* ── Filter Bar (Năm Mốc & Máy) ── */
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

  /* ── 5-Year Summary Strip ── */
  .drc-summary-strip {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  @media (max-width: 900px) {
    .drc-summary-strip { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .drc-summary-strip { grid-template-columns: 1fr; }
  }

  .drc-summary-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    border-top: 3px solid #0070c0;
  }
  .drc-summary-card.cv { border-top-color: #0284c7; }
  .drc-summary-card.th { border-top-color: #16a34a; }

  .drc-summary-year {
    font-size: 12px;
    font-weight: 800;
    color: #475569;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .drc-summary-val {
    font-size: 20px;
    font-weight: 900;
    color: #0f172a;
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
  }
  .drc-summary-unit {
    font-size: 11.5px;
    font-weight: 600;
    color: #64748b;
    margin-left: 4px;
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
    font-size: 13px;
    font-weight: 900;
    padding: 7px 14px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    border-bottom: 2px solid #0f172a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .drc-chart-head.cv-head {
    background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
  }
  .drc-chart-head.th-head {
    background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  }
  .drc-chart-body {
    height: 320px;
    padding: 12px 10px 6px 4px;
    position: relative;
  }

  /* ── Bảng tóm tắt số liệu 5 năm dưới biểu đồ ── */
  .drc-data-table-wrap {
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 10px 14px;
  }
  .drc-data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    text-align: center;
    background: #ffffff;
    border: 1px solid #cbd5e1;
  }
  .drc-data-table th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 800;
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    font-size: 11.5px;
    text-transform: uppercase;
  }
  .drc-data-table td {
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    color: #0f172a;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .drc-data-table tr:hover td {
    background: #f8fafc;
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
    min-height: 200px;
  }
`;

/* ─── Tooltip cho Biểu Đồ 5 Năm ────────────────────────────────────────────── */
const Custom5YearTooltip = ({ active, payload, label, unit = 'lốp' }) => {
  if (active && payload && payload.length) {
    const itemData = payload[0].payload;
    if (!itemData) return null;
    const sanLuong = Number(itemData.sanLuong || 0);

    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #94a3b8',
        borderRadius: 4,
        padding: '8px 12px',
        fontSize: '12px',
        color: '#1e293b',
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        minWidth: '150px'
      }}>
        <div style={{ fontWeight: 900, color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 5 }}>
          {itemData.nam || label}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ color: '#64748b', fontWeight: 700 }}>Tổng sản xuất:</span>
          <span style={{ fontWeight: 900, color: '#0369a1' }}>
            {sanLuong.toLocaleString('vi-VN')} {unit}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/* ─── Render nhãn số lượng trên đỉnh cột 5 năm ────────────────────────────── */
const render5YearBarLabel = (props, isMobile = false) => {
  const { x, y, width, value } = props;
  if (!value || Number(value) <= 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y - (isMobile ? 6 : 8)}
      fill="#0f172a"
      textAnchor="middle"
      fontSize={isMobile ? 10.5 : 12}
      fontWeight="900"
    >
      {Number(value).toLocaleString('vi-VN')}
    </text>
  );
};

const SanXuat5Nam = () => {
  console.log(">>> [SanXuat5Nam] Render trang Tổng Sản Xuất 5 Năm (1 Biểu Đồ 5 Cột)");

  // Nhận diện màn hình Mobile vs Desktop
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Thời gian mặc định
  const now = dayjs();
  const currentYearNow = now.year();

  // States quản lý Bộ lọc
  const [selectedYear, setSelectedYear] = useState(currentYearNow); // Năm mốc (kết thúc chu kỳ 5 năm)
  const [selectedMachine, setSelectedMachine] = useState(''); // "" = Tất cả máy

  // States danh sách thiết bị
  const [thMachineList, setThMachineList] = useState([]);
  const [cvMachineList, setCvMachineList] = useState([]);

  // States dữ liệu 5 năm (Mỗi năm là 1 phần tử: { nam: 'Năm 2022', year: 2022, sanLuong: 123456 })
  const [cv5YearList, setCv5YearList] = useState([]);
  const [th5YearList, setTh5YearList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Danh sách các năm lựa chọn mốc
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = currentYearNow - 5; y <= currentYearNow + 4; y++) {
      list.push(y);
    }
    return list;
  }, [currentYearNow]);

  // Mảng 5 năm liên tiếp: [selectedYear - 4, selectedYear - 3, selectedYear - 2, selectedYear - 1, selectedYear]
  const target5Years = useMemo(() => {
    const list = [];
    for (let i = 4; i >= 0; i--) {
      list.push(selectedYear - i);
    }
    return list; // [2022, 2023, 2024, 2025, 2026]
  }, [selectedYear]);

  // 1. Tải danh mục thiết bị TH & CV từ API Backend
  useEffect(() => {
    const fetchMachineLists = async () => {
      try {
        console.log(">>> [SanXuat5Nam] Tải danh mục thiết bị TH & CV từ Backend API...");

        // ── A. Danh sách máy TH từ getDanhSachMay() ──
        let thItems = [];
        try {
          const resTH = await getDanhSachMay();
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
          console.error(">>> [SanXuat5Nam] Lỗi API getDanhSachMay:", errTH);
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
          console.error(">>> [SanXuat5Nam] Lỗi API getCatVaiEquipments:", errCV);
        }

        if (cvItems.length === 0) {
          cvItems = [1, 2, 3, 4, 5, 6, 7].map(n => {
            const id = `ORC-CV-0${n}`;
            return { value: id, label: `Máy cắt vải 0${n} (${id})`, name: `Máy cắt vải 0${n}`, equipmentId: id };
          });
        }
        setCvMachineList(cvItems);
      } catch (err) {
        console.error(">>> [SanXuat5Nam] Lỗi tải danh mục máy:", err);
      }
    };

    fetchMachineLists();
  }, []);

  // Bộ nhớ đệm (In-Memory Cache) lưu kết quả các năm đã tải để không phải fetch lại
  const cacheCvRef = useRef(new Map());
  const cacheThRef = useRef(new Map());

  // 2. Hàm tải tổng sản lượng 5 năm liên tiếp (Tối ưu với Smart Caching)
  const load5YearTotalData = useCallback(async (baseYear, machineToLoad, forceRefresh = false) => {
    setIsLoading(true);
    const startAllTime = performance.now();
    console.log(`>>> [SanXuat5Nam] Bắt đầu tải dữ liệu 5 năm: mốc=${baseYear}, Máy=${machineToLoad || 'TẤT CẢ'}, ForceRefresh=${forceRefresh}`);

    const years = [];
    for (let i = 4; i >= 0; i--) {
      years.push(baseYear - i);
    }

    try {
      const isCvMachine = machineToLoad ? machineToLoad.toUpperCase().includes('CV') : false;
      const isThMachine = machineToLoad ? !isCvMachine : false;

      // ── A. TẢI TỔNG SẢN LƯỢNG 5 NĂM CẮT VẢI (CV) ──
      // Sử dụng API mới GET /api/catvai/production-5-years (Chỉ 1 request duy nhất)
      if (machineToLoad && isThMachine) {
        setCv5YearList([]);
      } else {
        const cvParam = isCvMachine ? machineToLoad : null;
        const cvKey = `CV_${cvParam || 'ALL'}_${baseYear}`;

        if (!forceRefresh && cacheCvRef.current.has(cvKey)) {
          const cachedData = cacheCvRef.current.get(cvKey);
          console.log(`>>> [SanXuat5Nam Cache Hit] CV 5 năm (${baseYear}) từ bộ nhớ đệm:`, cachedData);
          setCv5YearList(cachedData);
        } else {
          const t0 = performance.now();
          try {
            console.log(`>>> [SanXuat5Nam] Gọi API mới getProductionQuantityFor5YearsCatVai: selectedYear=${baseYear}, maMay=${cvParam}`);
            const resCV = await getProductionQuantityFor5YearsCatVai({
              selectedYear: baseYear,
              maMay: cvParam
            });

            const rawListCV = (resCV && Array.isArray(resCV.data)) ? resCV.data : (Array.isArray(resCV) ? resCV : []);

            const dataByYearCV = new Map();
            rawListCV.forEach(item => {
              const y = Number(item.Year ?? item.year ?? item.Nam_SX ?? item.nam_sx ?? item.Nam ?? item.nam ?? 0);
              const qty = Number(
                item.TotalQuantity ?? item.totalQuantity ??
                item.TongSanLuong ?? item.tongSanLuong ??
                item.sanLuong ?? item.tongSX ?? item.SoLuong ?? 0
              );
              if (y > 0) {
                dataByYearCV.set(y, qty);
              }
            });

            const parsedCv5List = years.map(y => ({
              nam: `Năm ${y}`,
              year: y,
              sanLuong: dataByYearCV.get(y) || 0
            }));

            cacheCvRef.current.set(cvKey, parsedCv5List);
            const t1 = performance.now();
            console.log(`>>> [SanXuat5Nam API Perf] CV 5 năm (${baseYear}) hoàn tất trong ${(t1 - t0).toFixed(0)}ms:`, parsedCv5List);
            setCv5YearList(parsedCv5List);
          } catch (errCV) {
            console.error(">>> [SanXuat5Nam API Error] Lỗi tải Cắt vải 5 năm:", errCV);
            setCv5YearList(years.map(y => ({ nam: `Năm ${y}`, year: y, sanLuong: 0 })));
          }
        }
      }

      // ── B. TẢI TỔNG SẢN LƯỢNG 5 NĂM THÀNH HÌNH (TH) ──
      // Sử dụng API mới GET /api/thanhhinh/machine/production-5-years (Chỉ 1 request duy nhất)
      if (machineToLoad && isCvMachine) {
        setTh5YearList([]);
      } else {
        // Chuẩn hóa mã máy Thành hình sang dạng 01, 02, 03... (hoặc null nếu xem tất cả máy)
        let thParamMachine = null;
        if (machineToLoad && isThMachine) {
          const match = String(machineToLoad).match(/\d+/);
          thParamMachine = match ? match[0].padStart(2, '0') : machineToLoad;
        }

        const thKey = `TH_${thParamMachine || 'ALL'}_${baseYear}`;
        if (!forceRefresh && cacheThRef.current.has(thKey)) {
          const cachedData = cacheThRef.current.get(thKey);
          console.log(`>>> [SanXuat5Nam Cache Hit] TH 5 năm (${baseYear}) từ bộ nhớ đệm:`, cachedData);
          setTh5YearList(cachedData);
        } else {
          const t0 = performance.now();
          try {
            console.log(`>>> [SanXuat5Nam] Gọi API mới getProductionQuantityFor5Years: selectedYear=${baseYear}, maMay=${thParamMachine}`);
            const resTH = await getProductionQuantityFor5Years({
              selectedYear: baseYear,
              maMay: thParamMachine
            });

            const rawList = (resTH && Array.isArray(resTH.data)) ? resTH.data : (Array.isArray(resTH) ? resTH : []);

            // Map dữ liệu theo năm để đảm bảo đúng thứ tự trục X 5 năm liên tiếp
            const dataByYear = new Map();
            rawList.forEach(item => {
              const y = Number(item.Year ?? item.year ?? item.Nam ?? item.nam ?? 0);
              const qty = Number(
                item.TotalQuantity ?? item.totalQuantity ??
                item.TongSanLuong ?? item.tongSanLuong ??
                item.sanLuong ?? item.tongSX ?? 0
              );
              if (y > 0) {
                dataByYear.set(y, qty);
              }
            });

            const parsedTh5List = years.map(y => ({
              nam: `Năm ${y}`,
              year: y,
              sanLuong: dataByYear.get(y) || 0
            }));

            cacheThRef.current.set(thKey, parsedTh5List);
            const t1 = performance.now();
            console.log(`>>> [SanXuat5Nam API Perf] TH 5 năm (${baseYear}) hoàn tất trong ${(t1 - t0).toFixed(0)}ms:`, parsedTh5List);
            setTh5YearList(parsedTh5List);
          } catch (err) {
            console.error(">>> [SanXuat5Nam API Error] Lỗi tải Thành hình 5 năm:", err);
            setTh5YearList(years.map(y => ({ nam: `Năm ${y}`, year: y, sanLuong: 0 })));
          }
        }
      }

      const totalElapsed = (performance.now() - startAllTime).toFixed(0);
      console.log(`>>> [SanXuat5Nam] TẢI HOÀN TẤT TOÀN BỘ 5 NĂM TRONG: ${totalElapsed}ms`);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      console.error(">>> [SanXuat5Nam] Lỗi tải tổng sản lượng 5 năm:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Tự động tải dữ liệu khi thay đổi Năm mốc hoặc Máy
  useEffect(() => {
    load5YearTotalData(selectedYear, selectedMachine);
  }, [selectedYear, selectedMachine, load5YearTotalData]);

  // Xử lý nút Xem báo cáo (Bắt buộc làm mới dữ liệu từ server)
  const handleRefresh = () => {
    load5YearTotalData(selectedYear, selectedMachine, true);
  };

  // Xử lý nút Mặc định
  const handleResetFilter = () => {
    setSelectedYear(currentYearNow);
    setSelectedMachine('');
  };

  // Tên máy hiển thị
  const selectedMachineDisplay = useMemo(() => {
    if (!selectedMachine) return 'Toàn bộ xưởng CV-TH';
    const foundTH = thMachineList.find(m => m.value === selectedMachine);
    if (foundTH) return foundTH.label;
    const foundCV = cvMachineList.find(m => m.value === selectedMachine);
    if (foundCV) return foundCV.label;
    return `Máy ${selectedMachine}`;
  }, [selectedMachine, thMachineList, cvMachineList]);

  // Tổng cộng 5 năm
  const total5YearCV = useMemo(() => {
    return cv5YearList.reduce((acc, cur) => acc + (cur.sanLuong || 0), 0);
  }, [cv5YearList]);

  const total5YearTH = useMemo(() => {
    return th5YearList.reduce((acc, cur) => acc + (cur.sanLuong || 0), 0);
  }, [th5YearList]);

  return (
    <div className="drc-5year-container mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER PANEL ── */}
      <div className="drc-header-panel">
        <div className="drc-title-left">
          <span className="drc-badge-dot"></span>
          <h1>BÁO CÁO TỔNG HỢP SẢN XUẤT 5 NĂM LIÊN TIẾP ({target5Years[0]} - {target5Years[4]})</h1>
        </div>
        <div className="drc-header-meta">
          <span>Cập nhật lúc: <strong>{lastUpdated || 'Đang tải...'}</strong></span>
          {isLoading && <span style={{ color: '#0284c7', fontWeight: 800 }}>• Đang xử lý...</span>}
        </div>
      </div>

      {/* ── 2. FILTER BAR (CHỌN NĂM MỐC & MÁY) ── */}
      <div className="drc-filter-bar">
        <div className="drc-filter-group">
          {/* Chọn Năm Mốc */}
          <div className="drc-field">
            <span className="drc-label"><FaCalendarAlt color="#0284c7" /> Năm mốc:</span>
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
          Đang hiển thị: <span style={{ color: '#0369a1' }}>{selectedMachineDisplay}</span> • Chu kỳ 5 năm ({target5Years[0]} - {target5Years[4]})
        </div>
      </div>

      {/* ── 3. BIỂU ĐỒ 1: CÔNG ĐOẠN CẮT VẢI (CV) - 5 NĂM TRÊN 1 BIỂU ĐỒ ── */}
      {selectedMachine && !selectedMachine.toUpperCase().includes('CV') ? null : (
        <div className="drc-chart-card">
          <div className="drc-chart-head cv-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartBar />
              <span>CÔNG ĐOẠN CẮT VẢI (CV) - TỔNG SẢN LƯỢNG 5 NĂM ({target5Years[0]} - {target5Years[4]}) {selectedMachine ? `[${selectedMachineDisplay}]` : '[TẤT CẢ CÁC MÁY]'}</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '900', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '12px' }}>
              Tổng 5 năm: {total5YearCV.toLocaleString('vi-VN')} BTP
            </div>
          </div>

          {cv5YearList.length === 0 ? (
            <div className="drc-empty-notice">
              <span>Chưa có dữ liệu sản xuất Cắt vải cho chu kỳ 5 năm ({target5Years[0]} - {target5Years[4]})</span>
            </div>
          ) : (
            <>
              {/* 1 Biểu đồ duy nhất chứa 5 cột của 5 năm (Desktop cột to 48px, Mobile vừa vặn 32px) */}
              <div className="drc-chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cv5YearList}
                    margin={isMobile ? { top: 24, right: 12, left: -14, bottom: 4 } : { top: 26, right: 30, left: 10, bottom: 6 }}
                    barSize={isMobile ? 32 : 48}
                    maxBarSize={isMobile ? 36 : 52}
                    barCategoryGap={isMobile ? '20%' : '10%'}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="nam"
                      interval={0}
                      tickFormatter={isMobile ? (v) => String(v).replace('Năm ', '') : undefined}
                      tick={{ fontSize: isMobile ? 11 : 12, fill: '#1e293b', fontWeight: 800 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      width={isMobile ? 40 : 52}
                      tick={{ fontSize: isMobile ? 9.5 : 11, fill: '#64748b', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v))}
                      unit=" BTP"
                    />
                    <Tooltip content={<Custom5YearTooltip unit="BTP" />} />
                    <Bar
                      dataKey="sanLuong"
                      name="Tổng Sản Lượng"
                      fill="#0284c7"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    >
                      {cv5YearList.map((entry, index) => (
                        <Cell
                          key={`cell-cv-5y-${index}`}
                          fill={entry.sanLuong > 0 ? '#0284c7' : '#cbd5e1'}
                        />
                      ))}
                      <LabelList content={(props) => render5YearBarLabel(props, isMobile)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bảng tóm tắt số liệu 5 năm Cắt vải */}
              <div className="drc-data-table-wrap">
                <table className="drc-data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '220px' }}>Chỉ tiêu</th>
                      {cv5YearList.map(item => (
                        <th key={`th-cv-${item.year}`}>{item.nam}</th>
                      ))}
                      <th style={{ background: '#e0f2fe', color: '#0369a1' }}>Tổng 5 Năm</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'left', fontWeight: '800', color: '#0284c7' }}>
                        Sản lượng sản xuất thực tế (BTP)
                      </td>
                      {cv5YearList.map(item => (
                        <td key={`td-cv-${item.year}`} style={{ fontWeight: '800' }}>
                          {Number(item.sanLuong).toLocaleString('vi-VN')}
                        </td>
                      ))}
                      <td style={{ fontWeight: '900', color: '#0284c7', background: '#f0f9ff' }}>
                        {total5YearCV.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 4. BIỂU ĐỒ 2: CÔNG ĐOẠN THÀNH HÌNH (TH) - 5 NĂM TRÊN 1 BIỂU ĐỒ ── */}
      {selectedMachine && selectedMachine.toUpperCase().includes('CV') ? null : (
        <div className="drc-chart-card">
          <div className="drc-chart-head th-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartBar />
              <span>CÔNG ĐOẠN THÀNH HÌNH (TH) - TỔNG SẢN LƯỢNG 5 NĂM ({target5Years[0]} - {target5Years[4]}) {selectedMachine ? `[${selectedMachineDisplay}]` : '[TẤT CẢ CÁC MÁY]'}</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '900', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '12px' }}>
              Tổng 5 năm: {total5YearTH.toLocaleString('vi-VN')} lốp
            </div>
          </div>

          {th5YearList.length === 0 ? (
            <div className="drc-empty-notice">
              <span>Chưa có dữ liệu sản xuất Thành hình cho chu kỳ 5 năm ({target5Years[0]} - {target5Years[4]})</span>
            </div>
          ) : (
            <>
              {/* 1 Biểu đồ duy nhất chứa 5 cột của 5 năm (Desktop cột to 48px, Mobile vừa vặn 32px) */}
              <div className="drc-chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={th5YearList}
                    margin={isMobile ? { top: 24, right: 12, left: -14, bottom: 4 } : { top: 26, right: 30, left: 10, bottom: 6 }}
                    barSize={isMobile ? 32 : 48}
                    maxBarSize={isMobile ? 36 : 52}
                    barCategoryGap={isMobile ? '20%' : '10%'}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="nam"
                      interval={0}
                      tickFormatter={isMobile ? (v) => String(v).replace('Năm ', '') : undefined}
                      tick={{ fontSize: isMobile ? 11 : 12, fill: '#1e293b', fontWeight: 800 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      width={isMobile ? 40 : 52}
                      tick={{ fontSize: isMobile ? 9.5 : 11, fill: '#64748b', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v))}
                      unit=" lốp"
                    />
                    <Tooltip content={<Custom5YearTooltip unit="lốp" />} />
                    <Bar
                      dataKey="sanLuong"
                      name="Tổng Sản Lượng"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    >
                      {th5YearList.map((entry, index) => (
                        <Cell
                          key={`cell-th-5y-${index}`}
                          fill={entry.sanLuong > 0 ? '#16a34a' : '#cbd5e1'}
                        />
                      ))}
                      <LabelList content={(props) => render5YearBarLabel(props, isMobile)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bảng tóm tắt số liệu 5 năm Thành hình */}
              <div className="drc-data-table-wrap">
                <table className="drc-data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '220px' }}>Chỉ tiêu</th>
                      {th5YearList.map(item => (
                        <th key={`th-th-${item.year}`}>{item.nam}</th>
                      ))}
                      <th style={{ background: '#dcfce7', color: '#15803d' }}>Tổng 5 Năm</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'left', fontWeight: '800', color: '#16a34a' }}>
                        Sản lượng sản xuất thực tế (lốp)
                      </td>
                      {th5YearList.map(item => (
                        <td key={`td-th-${item.year}`} style={{ fontWeight: '800' }}>
                          {Number(item.sanLuong).toLocaleString('vi-VN')}
                        </td>
                      ))}
                      <td style={{ fontWeight: '900', color: '#16a34a', background: '#f0fdf4' }}>
                        {total5YearTH.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SanXuat5Nam;
