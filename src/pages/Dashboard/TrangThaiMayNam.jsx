// src/pages/Dashboard/TrangThaiMayNam.jsx
// Trang Báo Cáo Biểu Đồ Trạng Thái SCADA Theo Năm (Hiển thị đồng thời 18 Máy: 3 Cắt Vải + 15 Thành Hình)
// Bố cục lưới 4 máy / hàng chuẩn MES, mỗi máy gồm Bảng tỷ lệ thời gian bên trái + Biểu đồ tròn PieChart bên phải
// Cắt vải: 3 máy (ORC-CV-01 -> ORC-CV-03)
// Thành hình: 15 máy (ORC-TH-01 -> ORC-TH-17 trừ 04, 13)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FaCalendarAlt, FaSearch, FaRedo,
  FaIndustry, FaLayerGroup, FaThLarge
} from 'react-icons/fa';

// Import API chính thức
import { getMachineStatusTimesByYear } from '../../api/thanhhinhApi';

/* ─── DANH MỤC TRẠNG THÁI SCADA CHUẨN DRC & MÃ MÀU CHÍNH XÁC ───────────────── */
const SCADA_STATUS_CONFIG = [
  { code: 0, label: 'Không xác định', fill: '#fff2cc', isBorder: true },
  { code: 1, label: 'Máy chạy', fill: '#00b050', isBorder: false },
  { code: 2, label: 'Máy dừng', fill: '#ffff00', isBorder: false },
  { code: 3, label: 'Máy lỗi', fill: '#ff0000', isBorder: false },
  { code: 4, label: 'Mất kết nối PLC', fill: '#ffc000', isBorder: false },
  { code: 6, label: 'Không có kế hoạch', fill: '#b4c6e7', isBorder: false },
  { code: 7, label: 'App Server tắt', fill: '#c55a11', isBorder: false },
  { code: 8, label: 'Máy chủ tắt', fill: '#833c0c', isBorder: false },
];

/* ─── STYLESHEET CHUẨN MES / INDUSTRIAL: BỐ CỤC 4 MÁY / HÀNG ─────────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  .mes-fade { animation: fadein 0.25s ease-out; }

  .drc-scada-container {
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

  /* ── Filter Bar (Năm) ── */
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

  /* ── Tab lọc nhanh công đoạn ── */
  .drc-filter-tabs {
    display: flex;
    gap: 6px;
  }
  .drc-filter-tab {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 800;
    border-radius: 3px;
    cursor: pointer;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #475569;
    transition: all 0.15s ease;
  }
  .drc-filter-tab.active {
    background: #0284c7;
    color: #ffffff;
    border-color: #0284c7;
  }

  /* ── Section Group Title ── */
  .drc-group-head {
    background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
    color: #ffffff;
    font-size: 12.5px;
    font-weight: 900;
    padding: 6px 12px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .drc-group-head.cv {
    background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
  }
  .drc-group-head.th {
    background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  }

  /* ── Lưới hiển thị: MỖI HÀNG 4 MÁY (4 CỘT) ── */
  .drc-machine-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  @media (max-width: 1550px) {
    .drc-machine-grid-4 { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 1100px) {
    .drc-machine-grid-4 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 620px) {
    .drc-machine-grid-4 { grid-template-columns: 1fr; }
  }

  /* ── Thẻ SCADA của từng máy (Chuẩn y hệt ảnh mẫu, tối ưu cho 4 cột) ── */
  .drc-machine-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
  }

  .drc-machine-card-head {
    background: #eef3f9;
    color: #1e3a8a;
    font-size: 11.5px;
    font-weight: 900;
    padding: 5px 8px;
    border-bottom: 1px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }

  .drc-machine-card-body {
    padding: 6px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    min-height: 205px;
  }

  /* Bảng Legend bên trái */
  .drc-machine-table-wrap {
    flex: 1.25;
    min-width: 155px;
  }

  .drc-scada-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
    font-weight: 700;
    color: #334155;
    line-height: 1.25;
  }

  .drc-scada-table thead tr {
    border-bottom: 1.5px solid #cbd5e1;
    color: #1e3a8a;
    font-size: 9.5px;
    font-weight: 800;
  }

  .drc-scada-table th {
    padding: 3px 2px 3px 0;
  }

  .drc-scada-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
  }
  .drc-scada-table tbody tr:hover {
    background: #f8fafc;
  }

  .drc-scada-color-box {
    width: 10px;
    height: 10px;
    display: inline-block;
    vertical-align: middle;
    border-radius: 1px;
  }

  /* Khung PieChart bên phải */
  .drc-machine-pie-wrap {
    flex: 1;
    min-width: 125px;
    height: 175px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drc-no-data {
    width: 100%;
    text-align: center;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 600;
    padding: 30px 0;
  }
`;

/* ─── Render Label % trên biểu đồ tròn PieChart (Chống dính chữ tuyệt đối & Lát nhỏ tách 2 hướng) ─── */
const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  if (!percent || percent < 0.002) return null; // Hiển thị các lát từ 0.2% trở lên
  const RADIAN = Math.PI / 180;

  // Lát bánh từ 7% trở lên (như 9.8%, 14.5%, 30.7%, 43.0%, 86.5%): hiển thị số % nhỏ gọn bên trong lát bánh
  if (percent >= 0.07) {
    const radius = innerRadius + (outerRadius - innerRadius) * (percent >= 0.15 ? 0.58 : 0.65);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#0f172a"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={percent >= 0.15 ? "8" : "7.5"}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  }

  // Lát bánh nhỏ (< 7%): Đẩy ra ngoài bằng đường kẻ thanh mảnh so le đa tầng tách về 2 phía
  const cos = Math.cos(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);

  // So le độ dài đường kẻ 3 tầng (6px, 14px, 22px) để các lát kề nhau không đè cao độ
  const tier = (index || 0) % 3;
  const extendDist = 6 + tier * 8;

  // Điểm 1: Mép ngoài đường tròn
  const sx = cx + (outerRadius + 1) * cos;
  const sy = cy + (outerRadius + 1) * sin;

  // Điểm 2: Điểm vươn ra ngoài theo góc
  const mx = cx + (outerRadius + extendDist) * cos;
  const my = cy + (outerRadius + extendDist) * sin;

  // Điểm 3: Luôn bẻ ngang tách về 2 phía (Bên phải -> bẻ sang Phải, Bên trái -> bẻ sang Trái)
  const isRightSide = cos >= 0;
  const elbowLength = 5 + tier * 2;
  const ex = mx + (isRightSide ? elbowLength : -elbowLength);
  const ey = my;
  const textAnchor = isRightSide ? 'start' : 'end';
  const textX = ex + (isRightSide ? 2 : -2);
  const textY = ey;

  return (
    <g key={`pie-lbl-${index}`}>
      <path
        d={`M ${sx},${sy} L ${mx},${my} L ${ex},${ey}`}
        stroke="#64748b"
        strokeWidth="0.75"
        fill="none"
      />
      <circle cx={sx} cy={sy} r={0.9} fill="#64748b" />
      <text
        x={textX}
        y={textY}
        fill="#0f172a"
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize="7"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

/* ─── Component Card hiển thị SCADA Năm cho 1 Máy (Chuẩn 4 Cột / Hàng) ─────── */
const MachineScadaYearCard = ({ machine, data }) => {
  const chartData = data?.scadaChartData || [];
  const totalHours = data?.totalHours || 0;
  const runningHours = data?.runningHours || 0;
  const runningPct = totalHours > 0 ? ((runningHours / totalHours) * 100).toFixed(1) : '0.0';

  const nonZeroPieData = chartData.filter(d => Number(d.value) > 0);

  return (
    <div className="drc-machine-card">
      {/* Tiêu đề máy */}
      <div className="drc-machine-card-head">
        <span title={machine.label}>{machine.shortName}</span>
        <span style={{ fontSize: '10.5px', color: '#00b050', fontWeight: '900' }}>
          Chạy: {runningHours >= 1000 ? `${(runningHours / 1000).toFixed(1)}k h` : `${runningHours.toFixed(1)}h`} ({runningPct}%)
        </span>
      </div>

      {/* Thân card gồm Bảng trái + Biểu đồ tròn phải */}
      <div className="drc-machine-card-body">
        {totalHours === 0 ? (
          <div className="drc-no-data">
            Chưa có tín hiệu SCADA năm
          </div>
        ) : (
          <>
            {/* Bảng Thống Kê Trạng Thái */}
            <div className="drc-machine-table-wrap">
              <table className="drc-scada-table">
                <thead>
                  <tr>
                    <th colSpan={2} style={{ textAlign: 'left' }}>TRẠNG THÁI</th>
                    <th style={{ textAlign: 'right', paddingRight: '4px' }}>T.GIAN</th>
                    <th style={{ textAlign: 'right', paddingLeft: '4px' }}>TỶ LỆ</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item, idx) => {
                    const pct = totalHours > 0 ? ((item.value / totalHours) * 100).toFixed(2) : '0.00';
                    const val = Number(item.value);
                    const formattedTime = val >= 1000 ? `${(val / 1000).toFixed(1)}k h` : `${val.toFixed(1)}h`;

                    return (
                      <tr key={`tr-${machine.code}-${idx}`}>
                        <td style={{ width: '14px', padding: '2px 0' }}>
                          <span
                            className="drc-scada-color-box"
                            style={{
                              background: item.fill,
                              border: item.isBorder ? '1px solid #cbd5e1' : 'none'
                            }}
                          />
                        </td>
                        <td style={{ padding: '2px 0', maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                          {item.name}
                        </td>
                        <td style={{ textAlign: 'right', padding: '2px 4px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {formattedTime}
                        </td>
                        <td style={{ textAlign: 'right', padding: '2px 0 2px 4px', color: '#64748b', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Biểu Đồ Tròn PieChart */}
            <div className="drc-machine-pie-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nonZeroPieData.length > 0 ? nonZeroPieData : [{ name: 'Không có dữ liệu', value: 1, fill: '#e2e8f0' }]}
                    cx="52%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    outerRadius={42}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    isAnimationActive={false}
                    label={nonZeroPieData.length > 0 ? renderCustomPieLabel : false}
                  >
                    {nonZeroPieData.map((entry, index) => (
                      <Cell key={`cell-${machine.code}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [
                      `${Number(val).toFixed(1)} giờ (${totalHours > 0 ? ((Number(val) / totalHours) * 100).toFixed(2) : 0}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TrangThaiMayNam = () => {
  console.log(">>> [TrangThaiMayNam] Render trang Trạng Thái 18 Máy SCADA Theo Năm (4 Máy / Hàng)");

  // Thời gian mặc định
  const now = dayjs();
  const currentYear = now.year();

  // States bộ lọc Năm
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState('ALL'); // "ALL", "TH", "CV"

  // States dữ liệu SCADA của 18 máy theo năm
  const [machinesData, setMachinesData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // 1. Danh sách 18 MÁY CHUẨN XÁC: 3 máy Cắt Vải (01, 02, 03) + 15 máy Thành Hình (01..17 trừ 04, 13)
  const full18Machines = useMemo(() => {
    // 3 máy Cắt vải
    const cvNums = ['01', '02', '03'];
    const cvList = cvNums.map(n => ({
      code: `ORC-CV-${n}`,
      label: `Máy cắt vải ${n} (ORC-CV-${n})`,
      shortName: `Máy CV ${n} (${`ORC-CV-${n}`})`,
      type: 'CV'
    }));

    // 15 máy Thành hình
    const thNums = ['01', '02', '03', '05', '06', '07', '08', '09', '10', '11', '12', '14', '15', '16', '17'];
    const thList = thNums.map(n => ({
      code: `ORC-TH-${n}`,
      label: `Máy TH ${n} (ORC-TH-${n})`,
      shortName: `Máy TH ${n} (${`ORC-TH-${n}`})`,
      type: 'TH'
    }));

    return [...cvList, ...thList];
  }, []);

  // 2. Hàm gọi API lấy dữ liệu SCADA theo Năm đồng thời cho tất cả 18 máy
  const loadAll18MachinesYearData = useCallback(async (yearVal) => {
    setIsLoading(true);
    const yearStr = String(yearVal);
    console.log(`>>> [TrangThaiMayNam] Tải dữ liệu SCADA 18 máy cho Năm=${yearStr}`);

    try {
      const resultsMap = {};

      // Gọi đồng thời API getMachineStatusTimesByYear cho cả 18 máy với maMay và year
      const machinePromises = full18Machines.map(async (m) => {
        const maMay = m.code; // 'ORC-TH-01', 'ORC-CV-01'

        try {
          const res = await getMachineStatusTimesByYear({ maMay, year: yearStr });
          const rawData = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

          // Tổng hợp dữ liệu năm theo danh mục SCADA chuẩn
          const statusMap = new Map();
          rawData.forEach(item => {
            const code = item.MachineStatus !== undefined ? Number(item.MachineStatus) : 0;
            let durationHours = 0;

            if (item.TotalDurationHours != null && !isNaN(Number(item.TotalDurationHours))) {
              durationHours = Number(item.TotalDurationHours);
            } else if (item.TotalDurationSeconds != null && !isNaN(Number(item.TotalDurationSeconds))) {
              durationHours = Number(item.TotalDurationSeconds) / 3600.0;
            } else if (item.TotalDurationMinutes != null && !isNaN(Number(item.TotalDurationMinutes))) {
              durationHours = Number(item.TotalDurationMinutes) / 60.0;
            }

            const current = statusMap.get(code) || 0;
            statusMap.set(code, current + durationHours);
          });

          const scadaChartData = SCADA_STATUS_CONFIG.map(cfg => ({
            code: cfg.code,
            name: cfg.label,
            value: statusMap.get(cfg.code) || 0,
            fill: cfg.fill,
            isBorder: cfg.isBorder
          }));

          const totalHours = scadaChartData.reduce((sum, d) => sum + d.value, 0);
          const runningHours = statusMap.get(1) || 0;

          resultsMap[maMay] = {
            rawData,
            scadaChartData,
            totalHours,
            runningHours
          };
        } catch (e) {
          console.error(`>>> [TrangThaiMayNam] Lỗi tải SCADA năm cho máy ${maMay}:`, e);
          resultsMap[maMay] = {
            rawData: [],
            scadaChartData: SCADA_STATUS_CONFIG.map(cfg => ({ ...cfg, value: 0 })),
            totalHours: 0,
            runningHours: 0
          };
        }
      });

      await Promise.all(machinePromises);
      console.log(">>> [TrangThaiMayNam] Hoàn tất tổng hợp SCADA Năm cho 18 máy:", resultsMap);

      setMachinesData(resultsMap);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      console.error(">>> [TrangThaiMayNam] Lỗi toàn cục khi tải SCADA Năm:", error);
    } finally {
      setIsLoading(false);
    }
  }, [full18Machines]);

  // 3. Tự động tải dữ liệu khi thay đổi Năm
  useEffect(() => {
    loadAll18MachinesYearData(selectedYear);
  }, [selectedYear, loadAll18MachinesYearData]);

  // Nút Xem báo cáo
  const handleRefresh = () => {
    loadAll18MachinesYearData(selectedYear);
  };

  // Nút Năm nay
  const handleResetYear = () => {
    setSelectedYear(currentYear);
  };

  return (
    <div className="drc-scada-container mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER PANEL ── */}
      <div className="drc-header-panel">
        <div className="drc-title-left">
          <span className="drc-badge-dot"></span>
          <h1>THEO DÕI TRẠNG THÁI SCADA NĂM TOÀN BỘ 18 MÁY (3 CV & 15 TH)</h1>
        </div>
        <div className="drc-header-meta">
          <span>Cập nhật lúc: <strong>{lastUpdated || 'Đang tải...'}</strong></span>
          {isLoading && <span style={{ color: '#0284c7', fontWeight: 800 }}>• Đang quét dữ liệu SCADA năm của 18 máy...</span>}
        </div>
      </div>

      {/* ── 2. FILTER BAR (NĂM & TABS CÔNG ĐOẠN) ── */}
      <div className="drc-filter-bar">
        <div className="drc-filter-group">
          {/* Chọn Năm */}
          <div className="drc-field">
            <span className="drc-label"><FaCalendarAlt color="#0284c7" /> Năm sản xuất:</span>
            <select
              className="drc-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={`opt-year-${y}`} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          {/* Nút Xem báo cáo */}
          <button className="drc-btn drc-btn-primary" onClick={handleRefresh}>
            <FaSearch /> Xem báo cáo
          </button>

          {/* Nút Năm nay */}
          <button className="drc-btn drc-btn-secondary" onClick={handleResetYear}>
            <FaRedo /> Năm nay
          </button>
        </div>

        {/* Tab chuyển đổi chế độ xem nhanh */}
        <div className="drc-filter-tabs">
          <button
            className={`drc-filter-tab ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <FaThLarge style={{ marginRight: 4 }} /> Tất cả (18 Máy)
          </button>
          <button
            className={`drc-filter-tab ${activeTab === 'CV' ? 'active' : ''}`}
            onClick={() => setActiveTab('CV')}
          >
            <FaIndustry style={{ marginRight: 4 }} /> Cắt Vải (3 Máy)
          </button>
          <button
            className={`drc-filter-tab ${activeTab === 'TH' ? 'active' : ''}`}
            onClick={() => setActiveTab('TH')}
          >
            <FaLayerGroup style={{ marginRight: 4 }} /> Thành Hình (15 Máy)
          </button>
        </div>
      </div>

      {/* ── 3. LƯỚI HIỂN THỊ SCADA 18 MÁY THEO NĂM (4 MÁY / HÀNG) ── */}

      {/* Phân nhóm Cắt Vải (3 Máy) */}
      {(activeTab === 'ALL' || activeTab === 'CV') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="drc-group-head cv">
            <span>CÔNG ĐOẠN CẮT VẢI (CV) - TRẠNG THÁI SCADA NĂM {selectedYear}</span>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>3 Máy (ORC-CV-01 đến ORC-CV-03)</span>
          </div>
          <div className="drc-machine-grid-4">
            {full18Machines.filter(m => m.type === 'CV').map(machine => (
              <MachineScadaYearCard
                key={`card-year-${machine.code}`}
                machine={machine}
                data={machinesData[machine.code]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phân nhóm Thành Hình (15 Máy) */}
      {(activeTab === 'ALL' || activeTab === 'TH') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: activeTab === 'ALL' ? '6px' : '0' }}>
          <div className="drc-group-head th">
            <span>CÔNG ĐOẠN THÀNH HÌNH (TH) - TRẠNG THÁI SCADA NĂM {selectedYear}</span>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>15 Máy (ORC-TH-01 đến ORC-TH-17)</span>
          </div>
          <div className="drc-machine-grid-4">
            {full18Machines.filter(m => m.type === 'TH').map(machine => (
              <MachineScadaYearCard
                key={`card-year-${machine.code}`}
                machine={machine}
                data={machinesData[machine.code]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrangThaiMayNam;
