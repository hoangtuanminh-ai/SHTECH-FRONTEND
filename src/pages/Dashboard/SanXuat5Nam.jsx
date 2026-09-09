// src/pages/Dashboard/SanXuat5Nam.jsx
// Trang Báo cáo Tổng Sản Xuất 10 Năm Liên Tiếp (Gộp 10 năm trên 1 biểu đồ duy nhất)
// BIỂU ĐỒ CỘT (BAR CHART) TIÊU CHUẨN:
// - Hiển thị các cột sản lượng từng năm sắc nét, rõ ràng
// - Đã lược bỏ đường nối các đỉnh theo yêu cầu để giữ giao diện biểu đồ cột truyền thống, dễ nhìn
// PHÔNG CHỮ: Sử dụng toàn bộ Arial, Helvetica, sans-serif đơn giản, chuẩn tiếng Việt 100%
// ĐỘC LẬP BỘ LỌC THIẾT BỊ / MÁY:
// - Cắt vải có bộ lọc chọn máy Cắt vải riêng biệt trên Header Card Cắt vải -> Chỉ tải và cập nhật biểu đồ Cắt vải
// - Thành hình có bộ lọc chọn máy Thành hình riêng biệt trên Header Card Thành hình -> Chỉ tải và cập nhật biểu đồ Thành hình
// - Hai công đoạn tải dữ liệu và cập nhật hoàn toàn độc lập, không làm ảnh hưởng hay ẩn biểu đồ của nhau
// API Backend: GET /api/thanhhinh/machine/production-5-years (10 năm) & GET /api/catvai/production-5-years

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';
import { FaCalendarAlt, FaSearch, FaRedo, FaSyncAlt, FaChartBar, FaFilePdf } from 'react-icons/fa';
import { exportDashboardToPDF } from '../../utils/exportPdfHelper';

// Import API chính thức từ Backend
import { getProductionQuantityFor5YearsCatVai, getCatVaiEquipments } from '../../api/catVaiApi';
import { getDanhSachMay, getProductionQuantityFor5Years } from '../../api/thanhhinhApi';

/* ─── STYLESHEET CHUẨN ARIAL TIẾNG VIỆT CHO TOÀN TRANG ───────── */
const css = `
  * {
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  @keyframes fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  .mes-fade { animation: fadein 0.25s ease-out; }

  .drc-10year-container {
    padding: 10px 14px;
    background: #f1f5f9;
    font-family: Arial, Helvetica, sans-serif;
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
    font-family: Arial, Helvetica, sans-serif;
  }

  .drc-title-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .drc-title-left h1 {
    font-size: 15px;
    font-weight: 700;
    color: #1e3a8a;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
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
    font-size: 12px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: Arial, Helvetica, sans-serif;
  }

  /* ── Filter Bar (Năm Mốc & Nút Làm Mới) ── */
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
    font-family: Arial, Helvetica, sans-serif;
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
    font-family: Arial, Helvetica, sans-serif;
  }

  .drc-select {
    height: 28px;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: #ffffff;
    outline: none;
    cursor: pointer;
    font-family: Arial, Helvetica, sans-serif;
  }

  .drc-select option {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 400;
    color: #0f172a;
    padding: 3px 6px;
  }

  .drc-select:focus {
    border-color: #0284c7;
    box-shadow: 0 0 0 1px #0284c7;
  }

  .drc-btn {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    font-family: Arial, Helvetica, sans-serif;
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

  /* ── Chart Container Cards ── */
  .drc-chart-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    font-family: Arial, Helvetica, sans-serif;
  }
  .drc-chart-head {
    background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    padding: 7px 14px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    border-bottom: 2px solid #0f172a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    font-family: Arial, Helvetica, sans-serif;
  }
  .drc-chart-head.cv-head {
    background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
  }
  .drc-chart-head.th-head {
    background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  }

  .drc-chart-body {
    height: 340px;
    padding: 12px 10px 6px 4px;
    position: relative;
    font-family: Arial, Helvetica, sans-serif;
  }

  /* ── Bảng tóm tắt số liệu 10 năm dưới biểu đồ ── */
  .drc-data-table-wrap {
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 10px 14px;
    overflow-x: auto;
    font-family: Arial, Helvetica, sans-serif;
  }
  .drc-data-table {
    width: 100%;
    min-width: 820px;
    border-collapse: collapse;
    font-size: 12px;
    text-align: center;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    font-family: Arial, Helvetica, sans-serif;
  }
  .drc-data-table th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 700;
    padding: 6px 6px;
    border: 1px solid #cbd5e1;
    font-size: 11.5px;
    text-transform: uppercase;
    white-space: nowrap;
    font-family: Arial, Helvetica, sans-serif;
  }
  .drc-data-table td {
    padding: 6px 6px;
    border: 1px solid #cbd5e1;
    color: #0f172a;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    font-family: Arial, Helvetica, sans-serif;
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
    font-family: Arial, Helvetica, sans-serif;
  }
`;

/* ─── Tooltip Tối Ưu cho Biểu Đồ Cột 10 Năm (Phông Arial chuẩn tiếng Việt) ─── */
const Custom10YearTooltip = ({ active, payload, label, unit = 'lốp', fullList = [] }) => {
  if (active && payload && payload.length) {
    const itemData = payload[0].payload;
    if (!itemData) return null;
    const sanLuong = Number(itemData.sanLuong || 0);

    // Tìm năm liền kề trước đó trong chuỗi 10 năm
    let prevItem = null;
    if (fullList && fullList.length > 0) {
      const idx = fullList.findIndex(x => x.year === itemData.year);
      if (idx > 0) {
        prevItem = fullList[idx - 1];
      }
    }

    const prevVal = prevItem ? Number(prevItem.sanLuong || 0) : null;
    const diff = prevVal !== null ? (sanLuong - prevVal) : null;
    // Tính phần trăm tăng trưởng so với năm trước: (chênh lệch / sản lượng năm trước) * 100
    const pct = (prevVal && prevVal > 0 && diff !== null) ? ((diff / prevVal) * 100).toFixed(1) : null;

    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #94a3b8',
        borderRadius: 4,
        padding: '9px 13px',
        fontSize: '12px',
        color: '#1e293b',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        minWidth: '220px',
        fontFamily: 'Arial, Helvetica, sans-serif'
      }}>
        <div style={{ fontWeight: 700, color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 6 }}>
          {itemData.nam || label}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Sản xuất thực tế:</span>
          <span style={{ fontWeight: 700, color: sanLuong > 0 ? '#0284c7' : '#94a3b8' }}>
            {sanLuong.toLocaleString('vi-VN')} {unit}
          </span>
        </div>

        {/* Thông tin so sánh với năm trước */}
        <div style={{
          fontSize: '11.5px',
          paddingTop: 5,
          borderTop: '1px dashed #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {sanLuong === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Trạng thái:</span>
              <span style={{ fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '1px 6px', borderRadius: 3 }}>
                Không sản xuất (0 {unit})
              </span>
            </div>
          ) : prevItem ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>So với {prevItem.nam}:</span>
                {diff > 0 ? (
                  <span style={{ fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                    ↗ Tăng +{diff.toLocaleString('vi-VN')} {unit} {pct ? `(+${pct}%)` : ''}
                  </span>
                ) : diff < 0 ? (
                  <span style={{ fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                    ↘ Giảm {diff.toLocaleString('vi-VN')} {unit} {pct ? `(${pct}%)` : ''}
                  </span>
                ) : (
                  <span style={{ fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                    Không đổi (0 {unit})
                  </span>
                )}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', textAlign: 'right' }}>
                ({prevItem.nam}: {prevVal.toLocaleString('vi-VN')} {unit})
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Trạng thái:</span>
              <span style={{ fontWeight: 700, color: '#0284c7' }}>Khởi đầu chu kỳ 10 năm</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/* ─── Render nhãn số lượng trên đỉnh cột 10 năm ─── */
const render10YearBarLabel = (props, isMobile = false) => {
  const { x, y, width, value } = props;
  if (!value || Number(value) <= 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y - (isMobile ? 6 : 8)}
      fill="#0f172a"
      textAnchor="middle"
      fontSize={isMobile ? 9.5 : 11}
      fontWeight="700"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      {Number(value).toLocaleString('vi-VN')}
    </text>
  );
};

const SanXuat5Nam = () => {
  console.log(">>> [SanXuat10Nam] Render trang Báo cáo Tổng Sản Xuất 10 Năm Liên Tiếp (Biểu đồ cột chuẩn - Bỏ đường nối đỉnh)");

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

  // State Bộ lọc Năm mốc (kết thúc chu kỳ 10 năm) chung cho toàn trang
  const [selectedYear, setSelectedYear] = useState(currentYearNow);

  // States Bộ lọc thiết bị RIÊNG BIỆT cho từng công đoạn
  const [selectedCvMachine, setSelectedCvMachine] = useState(''); // "" = Tất cả máy Cắt vải
  const [selectedThMachine, setSelectedThMachine] = useState(''); // "" = Tất cả máy Thành hình

  // States danh sách thiết bị
  const [thMachineList, setThMachineList] = useState([]);
  const [cvMachineList, setCvMachineList] = useState([]);

  // States dữ liệu 10 năm của Cắt vải và Thành hình
  const [cv10YearList, setCv10YearList] = useState([]);
  const [th10YearList, setTh10YearList] = useState([]);

  // Trạng thái đang tải RIÊNG BIỆT cho từng công đoạn
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [isLoadingTh, setIsLoadingTh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Ref container phục vụ xuất báo cáo PDF
  const containerRef = useRef(null);

  // Danh sách các năm lựa chọn mốc
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = currentYearNow - 10; y <= currentYearNow + 2; y++) {
      list.push(y);
    }
    return list;
  }, [currentYearNow]);

  // Mảng 10 năm liên tiếp theo năm mốc được chọn: [selectedYear - 9, ..., selectedYear]
  const target10Years = useMemo(() => {
    const list = [];
    for (let i = 9; i >= 0; i--) {
      list.push(selectedYear - i);
    }
    return list;
  }, [selectedYear]);

  // 1. Tải danh mục thiết bị TH & CV từ API Backend
  useEffect(() => {
    const fetchMachineLists = async () => {
      try {
        console.log(">>> [SanXuat10Nam] Tải danh mục thiết bị TH & CV từ Backend API...");

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
          console.error(">>> [SanXuat10Nam] Lỗi API getDanhSachMay:", errTH);
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
          console.error(">>> [SanXuat10Nam] Lỗi API getCatVaiEquipments:", errCV);
        }

        if (cvItems.length === 0) {
          cvItems = [1, 2, 3, 4, 5, 6, 7].map(n => {
            const id = `ORC-CV-0${n}`;
            return { value: id, label: `Máy cắt vải 0${n} (${id})`, name: `Máy cắt vải 0${n}`, equipmentId: id };
          });
        }
        setCvMachineList(cvItems);
      } catch (err) {
        console.error(">>> [SanXuat10Nam] Lỗi tải danh mục máy:", err);
      }
    };

    fetchMachineLists();
  }, []);

  // Bộ nhớ đệm (Cache) lưu kết quả độc lập cho từng công đoạn
  const cacheCvRef = useRef(new Map());
  const cacheThRef = useRef(new Map());

  // 2A. HÀM TẢI DỮ LIỆU 10 NĂM CẮT VẢI (CHỈ TẢI CẮT VẢI, HOÀN TOÀN KHÔNG ẢNH HƯỞNG THÀNH HÌNH)
  const loadCv10YearData = useCallback(async (baseYear, cvMachine, forceRefresh = false) => {
    setIsLoadingCv(true);
    const startAllTime = performance.now();

    const years = [];
    for (let i = 9; i >= 0; i--) {
      years.push(baseYear - i);
    }
    const startYearParam = years[0]; // Năm bắt đầu (VD: 2017)
    const endYearParam = years[9];   // Năm kết thúc (VD: 2026)

    console.log(`>>> [SanXuat10Nam - CẮT VẢI] Tải dữ liệu: [${startYearParam} - ${endYearParam}] | Máy CV=${cvMachine || 'TẤT CẢ'} | ForceRefresh=${forceRefresh}`);

    const cvKey = `CV_${cvMachine || 'ALL'}_${baseYear}`;
    if (!forceRefresh && cacheCvRef.current.has(cvKey)) {
      const cachedData = cacheCvRef.current.get(cvKey);
      console.log(`>>> [SanXuat10Nam Cache Hit] CV 10 năm từ cache:`, cachedData);
      setCv10YearList(cachedData);
      setIsLoadingCv(false);
      return;
    }

    try {
      const resCV = await getProductionQuantityFor5YearsCatVai({
        selectedYear: startYearParam,
        maMay: cvMachine || null
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

      const parsedCv10List = years.map(y => ({
        nam: `Năm ${y}`,
        year: y,
        sanLuong: dataByYearCV.get(y) || 0
      }));

      cacheCvRef.current.set(cvKey, parsedCv10List);
      const totalElapsed = (performance.now() - startAllTime).toFixed(0);
      console.log(`>>> [SanXuat10Nam - CẮT VẢI] Hoàn tất tải trong ${totalElapsed}ms:`, parsedCv10List);
      setCv10YearList(parsedCv10List);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (errCV) {
      console.error(">>> [SanXuat10Nam - CẮT VẢI Lỗi] Không thể tải dữ liệu:", errCV);
      setCv10YearList(years.map(y => ({ nam: `Năm ${y}`, year: y, sanLuong: 0 })));
    } finally {
      setIsLoadingCv(false);
    }
  }, []);

  // 2B. HÀM TẢI DỮ LIỆU 10 NĂM THÀNH HÌNH (CHỈ TẢI THÀNH HÌNH, HOÀN TOÀN KHÔNG ẢNH HƯỞNG CẮT VẢI)
  const loadTh10YearData = useCallback(async (baseYear, thMachine, forceRefresh = false) => {
    setIsLoadingTh(true);
    const startAllTime = performance.now();

    const years = [];
    for (let i = 9; i >= 0; i--) {
      years.push(baseYear - i);
    }
    const startYearParam = years[0]; // Năm bắt đầu (VD: 2017)
    const endYearParam = years[9];   // Năm kết thúc (VD: 2026)

    // Chuẩn hóa mã máy Thành hình sang dạng 01, 02, 03...
    let thParamMachine = null;
    if (thMachine) {
      const match = String(thMachine).match(/\d+/);
      thParamMachine = match ? match[0].padStart(2, '0') : thMachine;
    }

    console.log(`>>> [SanXuat10Nam - THÀNH HÌNH] Tải dữ liệu: [${startYearParam} - ${endYearParam}] | Máy TH=${thParamMachine || 'TẤT CẢ'} | ForceRefresh=${forceRefresh}`);

    const thKey = `TH_${thParamMachine || 'ALL'}_${baseYear}`;
    if (!forceRefresh && cacheThRef.current.has(thKey)) {
      const cachedData = cacheThRef.current.get(thKey);
      console.log(`>>> [SanXuat10Nam Cache Hit] TH 10 năm từ cache:`, cachedData);
      setTh10YearList(cachedData);
      setIsLoadingTh(false);
      return;
    }

    try {
      const resTH = await getProductionQuantityFor5Years({
        selectedYear: startYearParam,
        maMay: thParamMachine
      });

      const rawList = (resTH && Array.isArray(resTH.data)) ? resTH.data : (Array.isArray(resTH) ? resTH : []);
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

      const parsedTh10List = years.map(y => ({
        nam: `Năm ${y}`,
        year: y,
        sanLuong: dataByYear.has(y) ? dataByYear.get(y) : 0
      }));

      cacheThRef.current.set(thKey, parsedTh10List);
      const totalElapsed = (performance.now() - startAllTime).toFixed(0);
      console.log(`>>> [SanXuat10Nam - THÀNH HÌNH] Hoàn tất tải trong ${totalElapsed}ms:`, parsedTh10List);
      setTh10YearList(parsedTh10List);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (errTH) {
      console.error(">>> [SanXuat10Nam - THÀNH HÌNH Lỗi] Không thể tải dữ liệu:", errTH);
      setTh10YearList(years.map(y => ({ nam: `Năm ${y}`, year: y, sanLuong: 0 })));
    } finally {
      setIsLoadingTh(false);
    }
  }, []);

  // 3A. Tự động tải Cắt Vải khi Năm mốc hoặc Máy Cắt vải thay đổi (ĐỘC LẬP)
  useEffect(() => {
    loadCv10YearData(selectedYear, selectedCvMachine);
  }, [selectedYear, selectedCvMachine, loadCv10YearData]);

  // 3B. Tự động tải Thành Hình khi Năm mốc hoặc Máy Thành hình thay đổi (ĐỘC LẬP)
  useEffect(() => {
    loadTh10YearData(selectedYear, selectedThMachine);
  }, [selectedYear, selectedThMachine, loadTh10YearData]);

  // Xử lý nút Refresh (Làm mới cả 2 công đoạn từ database)
  const handleRefresh = () => {
    console.log(">>> [SanXuat5Nam] Click Refresh báo cáo 10 năm:", { selectedYear, selectedCvMachine, selectedThMachine });
    loadCv10YearData(selectedYear, selectedCvMachine, true);
    loadTh10YearData(selectedYear, selectedThMachine, true);
  };

  // Xử lý nút Mặc định (Khôi phục toàn bộ về trạng thái xem tất cả)
  const handleResetFilter = () => {
    setSelectedYear(currentYearNow);
    setSelectedCvMachine('');
    setSelectedThMachine('');
  };

  // Xử lý xuất báo cáo PDF cho Sản Xuất 10 Năm
  const handleExportPDF = async () => {
    console.log(">>> [SanXuat5Nam] Bắt đầu xuất PDF Sản xuất 10 năm...", { selectedYear, selectedCvMachine, selectedThMachine });
    setIsExportingPDF(true);
    try {
      await exportDashboardToPDF({
        element: containerRef.current,
        title: `BÁO CÁO TỔNG HỢP SẢN XUẤT 10 NĂM LIÊN TIẾP (${target10Years[0]} - ${target10Years[9]})`,
        fileName: `Bao_Cao_San_Xuat_10_Nam_${target10Years[0]}_${target10Years[9]}`,
        filterInfo: `Chu kỳ: ${target10Years[0]} - ${target10Years[9]} | Máy Cắt Vải: ${selectedCvMachine ? `Máy ${selectedCvMachine}` : 'Tất cả'} | Máy Thành Hình: ${selectedThMachine ? `Máy ${selectedThMachine}` : 'Tất cả'}`
      });
      console.log(">>> [SanXuat5Nam] Xuất PDF hoàn tất.");
    } catch (err) {
      console.error(">>> [SanXuat5Nam] Lỗi xuất PDF:", err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Tên máy hiển thị trên tiêu đề từng card
  const selectedCvMachineDisplay = useMemo(() => {
    if (!selectedCvMachine) return 'TẤT CẢ CÁC MÁY';
    const found = cvMachineList.find(m => m.value === selectedCvMachine);
    return found ? found.label : selectedCvMachine;
  }, [selectedCvMachine, cvMachineList]);

  const selectedThMachineDisplay = useMemo(() => {
    if (!selectedThMachine) return 'TẤT CẢ CÁC MÁY';
    const found = thMachineList.find(m => m.value === selectedThMachine);
    return found ? found.label : `Máy ${selectedThMachine}`;
  }, [selectedThMachine, thMachineList]);

  // Tổng cộng sản lượng 10 năm của từng công đoạn
  const total10YearCV = useMemo(() => {
    return cv10YearList.reduce((acc, cur) => acc + (cur.sanLuong || 0), 0);
  }, [cv10YearList]);

  const total10YearTH = useMemo(() => {
    return th10YearList.reduce((acc, cur) => acc + (cur.sanLuong || 0), 0);
  }, [th10YearList]);

  return (
    <div ref={containerRef} className="drc-10year-container mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER PANEL ── */}
      <div className="drc-header-panel">
        <div className="drc-title-left">
          <span className="drc-badge-dot"></span>
          <h1>BÁO CÁO TỔNG HỢP SẢN XUẤT 10 NĂM LIÊN TIẾP ({target10Years[0]} - {target10Years[9]})</h1>
        </div>
        <div className="drc-header-meta">
          <span>Cập nhật lúc: <strong>{lastUpdated || 'Đang tải...'}</strong></span>
          {(isLoadingCv || isLoadingTh) && <span style={{ color: '#0284c7', fontWeight: 700 }}>• Đang tải dữ liệu...</span>}
        </div>
      </div>

      {/* ── 2. FILTER BAR TRÊN ĐẦU (CHỌN NĂM MỐC & NÚT LÀM MỚI) ── */}
      <div className="drc-filter-bar">
        <div className="drc-filter-group">
          {/* Chọn Năm Mốc Kết Thúc Chu Kỳ */}
          <div className="drc-field">
            <span className="drc-label"><FaCalendarAlt color="#0284c7" /> Năm mốc:</span>
            <select
              className="drc-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map(y => (
                <option key={`opt-year-${y}`} value={y}>Năm {y} (Chu kỳ {y - 9} - {y})</option>
              ))}
            </select>
          </div>

          {/* Nút Refresh */}
          <button className="drc-btn drc-btn-primary" onClick={handleRefresh}>
            <FaSyncAlt /> Refresh
          </button>

          {/* Nút Xóa lọc / Mặc định */}
          <button className="drc-btn drc-btn-secondary" onClick={handleResetFilter}>
            <FaRedo /> Mặc định
          </button>

          {/* Nút Xuất Báo Cáo PDF */}
          <button
            className="drc-btn"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            title="Xuất báo cáo PDF trực quan toàn bộ dashboard Sản xuất 10 năm"
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

        {/* Thông tin phạm vi năm */}
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
          Chu kỳ 10 năm liên tiếp: <strong style={{ color: '#0369a1' }}>{target10Years[0]} - {target10Years[9]}</strong>
        </div>
      </div>

      {/* ── 3. BIỂU ĐỒ 1: CÔNG ĐOẠN CẮT VẢI (CV) - CÓ BỘ LỌC MÁY CẮT VẢI RIÊNG TRÊN HEADER ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head cv-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <FaChartBar />
            <span>CÔNG ĐOẠN CẮT VẢI (CV) - TỔNG SẢN LƯỢNG 10 NĂM ({target10Years[0]} - {target10Years[9]}) [{selectedCvMachineDisplay}]</span>
            {isLoadingCv && <span style={{ fontSize: '11.5px', color: '#ffedd5', fontWeight: 600 }}>(Đang tải...)</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {/* Bộ lọc Máy Cắt vải riêng biệt ngay trên Header Card Cắt vải (Font Arial chuẩn) */}
            <select
              className="drc-select"
              style={{ height: '28px', minWidth: '200px', borderColor: '#0284c7', fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', background: '#f0f9ff', color: '#0369a1', fontWeight: 600 }}
              value={selectedCvMachine}
              onChange={(e) => setSelectedCvMachine(e.target.value)}
              title="Lọc riêng máy công đoạn Cắt vải"
            >
              <option value="">-- Tất cả máy Cắt vải --</option>
              {cvMachineList.map(m => (
                <option key={`opt-cv-${m.value}`} value={m.value}>{m.label}</option>
              ))}
            </select>

            <div style={{ fontSize: '12px', fontWeight: '700', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
              Tổng 10 năm: {total10YearCV.toLocaleString('vi-VN')} BTP
            </div>
          </div>
        </div>

        {cv10YearList.length === 0 ? (
          <div className="drc-empty-notice">
            <span>Chưa có dữ liệu sản xuất Cắt vải cho chu kỳ 10 năm ({target10Years[0]} - {target10Years[9]})</span>
          </div>
        ) : (
          <>
            {/* Biểu đồ Cột BarChart tiêu chuẩn 10 năm (Đã bỏ đường nối đỉnh theo yêu cầu) */}
            <div className="drc-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cv10YearList}
                  margin={isMobile ? { top: 20, right: 8, left: -14, bottom: 4 } : { top: 24, right: 20, left: 10, bottom: 6 }}
                  barSize={isMobile ? 18 : 34}
                  maxBarSize={isMobile ? 22 : 38}
                  barCategoryGap={isMobile ? '12%' : '8%'}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="nam"
                    interval={0}
                    tickFormatter={(v) => String(v).replace('Năm ', '')}
                    tick={{ fontSize: isMobile ? 9.5 : 11.5, fill: '#1e293b', fontWeight: 600, fontFamily: 'Arial, Helvetica, sans-serif' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    width={isMobile ? 40 : 54}
                    tick={{ fontSize: isMobile ? 9.5 : 11, fill: '#64748b', fontWeight: 600, fontFamily: 'Arial, Helvetica, sans-serif' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v))}
                    unit=" BTP"
                  />
                  <Tooltip content={<Custom10YearTooltip unit="BTP" fullList={cv10YearList} />} />

                  {/* Cột sản lượng hình trụ bo góc nhẹ */}
                  <Bar
                    dataKey="sanLuong"
                    name="Tổng Sản Lượng"
                    fill="#0284c7"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  >
                    {cv10YearList.map((entry, index) => (
                      <Cell
                        key={`cell-cv-10y-${index}`}
                        fill={entry.sanLuong > 0 ? '#0284c7' : '#cbd5e1'}
                      />
                    ))}
                    <LabelList content={(props) => render10YearBarLabel(props, isMobile)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bảng tóm tắt số liệu 10 năm Cắt vải */}
            <div className="drc-data-table-wrap">
              <table className="drc-data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', minWidth: '180px' }}>Chỉ tiêu</th>
                    {cv10YearList.map(item => (
                      <th key={`th-cv-${item.year}`}>{item.nam}</th>
                    ))}
                    <th style={{ background: '#e0f2fe', color: '#0369a1', minWidth: '110px' }}>Tổng 10 Năm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: '700', color: '#0284c7' }}>
                      Sản lượng sản xuất thực tế (BTP)
                    </td>
                    {cv10YearList.map(item => (
                      <td key={`td-cv-${item.year}`} style={{ fontWeight: '600' }}>
                        {Number(item.sanLuong).toLocaleString('vi-VN')}
                      </td>
                    ))}
                    <td style={{ fontWeight: '700', color: '#0284c7', background: '#f0f9ff' }}>
                      {total10YearCV.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── 4. BIỂU ĐỒ 2: CÔNG ĐOẠN THÀNH HÌNH (TH) - CÓ BỘ LỌC MÁY THÀNH HÌNH RIÊNG TRÊN HEADER ── */}
      <div className="drc-chart-card">
        <div className="drc-chart-head th-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <FaChartBar />
            <span>CÔNG ĐOẠN THÀNH HÌNH (TH) - TỔNG SẢN LƯỢNG 10 NĂM ({target10Years[0]} - {target10Years[9]}) [{selectedThMachineDisplay}]</span>
            {isLoadingTh && <span style={{ fontSize: '11.5px', color: '#fef08a', fontWeight: 600 }}>(Đang tải...)</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {/* Bộ lọc Máy Thành hình riêng biệt ngay trên Header Card Thành hình (Font Arial chuẩn) */}
            <select
              className="drc-select"
              style={{ height: '28px', minWidth: '190px', borderColor: '#16a34a', fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', background: '#f0fdf4', color: '#15803d', fontWeight: 600 }}
              value={selectedThMachine}
              onChange={(e) => setSelectedThMachine(e.target.value)}
              title="Lọc riêng máy công đoạn Thành hình"
            >
              <option value="">-- Tất cả máy Thành hình --</option>
              {thMachineList.map(m => (
                <option key={`opt-th-${m.value}`} value={m.value}>{m.label}</option>
              ))}
            </select>

            <div style={{ fontSize: '12px', fontWeight: '700', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
              Tổng 10 năm: {total10YearTH.toLocaleString('vi-VN')} lốp
            </div>
          </div>
        </div>

        {th10YearList.length === 0 ? (
          <div className="drc-empty-notice">
            <span>Chưa có dữ liệu sản xuất Thành hình cho chu kỳ 10 năm ({target10Years[0]} - {target10Years[9]})</span>
          </div>
        ) : (
          <>
            {/* Biểu đồ Cột BarChart tiêu chuẩn 10 năm (Đã bỏ đường nối đỉnh theo yêu cầu) */}
            <div className="drc-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={th10YearList}
                  margin={isMobile ? { top: 20, right: 8, left: -14, bottom: 4 } : { top: 24, right: 20, left: 10, bottom: 6 }}
                  barSize={isMobile ? 18 : 34}
                  maxBarSize={isMobile ? 22 : 38}
                  barCategoryGap={isMobile ? '12%' : '8%'}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="nam"
                    interval={0}
                    tickFormatter={(v) => String(v).replace('Năm ', '')}
                    tick={{ fontSize: isMobile ? 9.5 : 11.5, fill: '#1e293b', fontWeight: 600, fontFamily: 'Arial, Helvetica, sans-serif' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    width={isMobile ? 40 : 54}
                    tick={{ fontSize: isMobile ? 9.5 : 11, fill: '#64748b', fontWeight: 600, fontFamily: 'Arial, Helvetica, sans-serif' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v))}
                    unit=" lốp"
                  />
                  <Tooltip content={<Custom10YearTooltip unit="lốp" fullList={th10YearList} />} />

                  {/* Cột sản lượng hình trụ bo góc nhẹ */}
                  <Bar
                    dataKey="sanLuong"
                    name="Tổng Sản Lượng"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  >
                    {th10YearList.map((entry, index) => (
                      <Cell
                        key={`cell-th-10y-${index}`}
                        fill={entry.sanLuong > 0 ? '#16a34a' : '#cbd5e1'}
                      />
                    ))}
                    <LabelList content={(props) => render10YearBarLabel(props, isMobile)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bảng tóm tắt số liệu 10 năm Thành hình */}
            <div className="drc-data-table-wrap">
              <table className="drc-data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', minWidth: '180px' }}>Chỉ tiêu</th>
                    {th10YearList.map(item => (
                      <th key={`th-th-${item.year}`}>{item.nam}</th>
                    ))}
                    <th style={{ background: '#dcfce7', color: '#15803d', minWidth: '110px' }}>Tổng 10 Năm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: '700', color: '#16a34a' }}>
                      Sản lượng sản xuất thực tế (lốp)
                    </td>
                    {th10YearList.map(item => (
                      <td key={`td-th-${item.year}`} style={{ fontWeight: '600' }}>
                        {Number(item.sanLuong).toLocaleString('vi-VN')}
                      </td>
                    ))}
                    <td style={{ fontWeight: '700', color: '#16a34a', background: '#f0fdf4' }}>
                      {total10YearTH.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SanXuat5Nam;
