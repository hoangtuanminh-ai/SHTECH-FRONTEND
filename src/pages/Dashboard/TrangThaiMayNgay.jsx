// src/pages/Dashboard/TrangThaiMayNgay.jsx
// Trang Báo Cáo Biểu Đồ Trạng Thái SCADA Theo Ngày (Hiển thị đồng thời 18 Máy: 15 máy Thành Hình + 3 máy Cắt Vải)
// Bố cục lưới 4 máy / hàng chuẩn MES, mỗi máy gồm Bảng tỷ lệ thời gian + Biểu đồ tròn PieChart
// Thành hình: 15 máy (01, 02, 03, 05, 06, 07, 08, 09, 10, 11, 12, 14, 15, 16, 17)
// Cắt vải: 3 máy (01, 02, 03)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FaCalendarAlt, FaSearch, FaRedo,
  FaClock, FaIndustry, FaLayerGroup, FaThLarge
} from 'react-icons/fa';

// Import API chính thức
import { getMachineStatusTimes } from '../../api/thanhhinhApi';

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

  /* ── Filter Bar (Ngày & Ca) ── */
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

  .drc-input-date, .drc-select {
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

  .drc-input-date:focus, .drc-select:focus {
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

/* ─── Render Label % trên biểu đồ tròn PieChart (Chữ nhỏ gọn & Lát nhỏ đẩy ra ngoài đa hướng) ─── */
const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  if (!percent || percent < 0.002) return null; // Hiển thị các lát từ 0.2% trở lên
  const RADIAN = Math.PI / 180;

  // Lát bánh từ 7% trở lên (như 9.8%, 86.5%): hiển thị số % nhỏ gọn bên trong lát bánh
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

  // Lát bánh nhỏ (< 7%): Đẩy ra ngoài bằng đường kẻ thanh mảnh tỏa theo góc midAngle
  const cos = Math.cos(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);

  // So le độ dài đường kẻ 3 tầng để các lát gần nhau không đè lên nhau
  const tier = (index || 0) % 3;
  const extendDist = 4 + tier * 5;

  // Điểm 1: Mép ngoài đường tròn
  const sx = cx + (outerRadius + 1) * cos;
  const sy = cy + (outerRadius + 1) * sin;

  // Điểm 2: Điểm vươn ra ngoài theo góc
  const mx = cx + (outerRadius + extendDist) * cos;
  const my = cy + (outerRadius + extendDist) * sin;

  // Điểm 3: Bẻ ngang theo hướng (trái/phải/đỉnh)
  let ex = mx;
  let ey = my;
  let textAnchor = 'middle';
  let textX = mx;
  let textY = my;

  if (Math.abs(cos) < 0.15) {
    // Đỉnh hoặc đáy: vươn thẳng đứng
    ey = my + (sin < 0 ? -3 : 3);
    textY = ey + (sin < 0 ? -3 : 3);
    textAnchor = 'middle';
  } else {
    // Hai bên trái / phải: bẻ ngang ngắn
    ex = mx + (cos >= 0 ? 1 : -1) * 3;
    textX = ex + (cos >= 0 ? 2 : -2);
    textAnchor = cos >= 0 ? 'start' : 'end';
  }

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

/* ─── Component Card hiển thị SCADA cho 1 Máy (Chuẩn 4 Cột / Hàng) ─────────── */
const MachineScadaCard = ({ machine, data }) => {
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
          Chạy: {runningHours.toFixed(1)}h ({runningPct}%)
        </span>
      </div>

      {/* Thân card gồm Bảng trái + Biểu đồ tròn phải */}
      <div className="drc-machine-card-body">
        {totalHours === 0 ? (
          <div className="drc-no-data">
            Chưa có tín hiệu SCADA
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
                          {Number(item.value).toFixed(1)}h
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
                      `${Number(val).toFixed(2)} giờ (${totalHours > 0 ? ((Number(val) / totalHours) * 100).toFixed(2) : 0}%)`,
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

const TrangThaiMayNgay = () => {
  console.log(">>> [TrangThaiMayNgay] Render trang Trạng Thái 18 Máy SCADA (15 TH + 3 CV, 4 Máy / Hàng)");

  // Thời gian mặc định
  const now = dayjs();
  const defaultDateStr = now.format('YYYY-MM-DD');

  // States bộ lọc
  const [selectedDate, setSelectedDate] = useState(defaultDateStr);
  const [selectedShift, setSelectedShift] = useState('ALL'); // "ALL", "1", "2", "0"
  const [activeTab, setActiveTab] = useState('ALL'); // "ALL", "TH", "CV"

  // States dữ liệu SCADA của 18 máy: Map { 'ORC-TH-01': { scadaChartData, totalHours, runningHours }, ... }
  const [machinesData, setMachinesData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // 1. Danh sách 18 MÁY CHUẨN XÁC: 15 máy Thành Hình (01..17 trừ 04,13) + 3 máy Cắt Vải (01, 02, 03)
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

  // 2. Hàm gọi API lấy dữ liệu SCADA đồng thời cho tất cả 18 máy
  const loadAll18MachinesData = useCallback(async (dateStr, shiftVal) => {
    setIsLoading(true);
    console.log(`>>> [TrangThaiMayNgay] Bắt đầu tải dữ liệu SCADA cho 18 máy: Ngày=${dateStr}, Ca=${shiftVal}`);

    const dateClean = dateStr.replace(/-/g, ''); // YYYYMMDD
    let shiftCodes = [];
    if (shiftVal === 'ALL') {
      shiftCodes = ['1', '2', '0']; // Cả 3 ca
    } else {
      shiftCodes = [shiftVal];
    }

    try {
      const resultsMap = {};

      // Gọi đồng thời cho toàn bộ 18 máy
      const machinePromises = full18Machines.map(async (m) => {
        const maMay = m.code; // Chuẩn: 'ORC-TH-01', 'ORC-CV-01'

        // Gọi API cho các ca được chọn
        const shiftPromises = shiftCodes.map(async (sc) => {
          const ymds = `${dateClean}${sc}`;
          try {
            const res = await getMachineStatusTimes({ maMay, yearMonthDayShift: ymds });
            return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          } catch (e) {
            // Fallback thử ca '3' nếu ca '0' lỗi
            if (sc === '0') {
              try {
                const res3 = await getMachineStatusTimes({ maMay, yearMonthDayShift: `${dateClean}3` });
                return Array.isArray(res3) ? res3 : (Array.isArray(res3?.data) ? res3.data : []);
              } catch (e3) {
                return [];
              }
            }
            return [];
          }
        });

        const shiftResults = await Promise.all(shiftPromises);
        const allEvents = shiftResults.flat();

        // Tổng hợp mảng sự kiện thành bảng trạng thái SCADA
        const statusMap = new Map();
        allEvents.forEach(item => {
          const code = item.MachineStatus !== undefined ? Number(item.MachineStatus) : 0;
          let durationHours = 0;

          if (item.EffectiveDurationHours != null && !isNaN(Number(item.EffectiveDurationHours))) {
            durationHours = Number(item.EffectiveDurationHours);
          } else if (item.EffectiveDurationSeconds != null && !isNaN(Number(item.EffectiveDurationSeconds))) {
            durationHours = Number(item.EffectiveDurationSeconds) / 3600.0;
          } else if (item.EffectiveDurationMinutes != null && !isNaN(Number(item.EffectiveDurationMinutes))) {
            durationHours = Number(item.EffectiveDurationMinutes) / 60.0;
          } else if (item.StartTime && item.EndTime) {
            const diffMs = new Date(item.EndTime).getTime() - new Date(item.StartTime).getTime();
            durationHours = Math.max(diffMs / 3600000.0, 0);
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
          events: allEvents,
          scadaChartData,
          totalHours,
          runningHours
        };
      });

      await Promise.all(machinePromises);
      console.log(">>> [TrangThaiMayNgay] Hoàn tất tổng hợp SCADA 18 máy:", resultsMap);

      setMachinesData(resultsMap);
      setLastUpdated(dayjs().format('HH:mm:ss DD/MM/YYYY'));
    } catch (error) {
      console.error(">>> [TrangThaiMayNgay] Lỗi tải dữ liệu SCADA 18 máy:", error);
    } finally {
      setIsLoading(false);
    }
  }, [full18Machines]);

  // 3. Tự động tải dữ liệu khi thay đổi Ngày hoặc Ca
  useEffect(() => {
    loadAll18MachinesData(selectedDate, selectedShift);
  }, [selectedDate, selectedShift, loadAll18MachinesData]);

  // Xử lý nút Xem lại
  const handleRefresh = () => {
    loadAll18MachinesData(selectedDate, selectedShift);
  };

  // Xử lý nút Hôm nay
  const handleResetFilter = () => {
    setSelectedDate(defaultDateStr);
    setSelectedShift('ALL');
  };

  // Tên ca hiển thị
  const shiftDisplay = useMemo(() => {
    if (selectedShift === '1') return 'Ca 1 (06:00 - 14:00)';
    if (selectedShift === '2') return 'Ca 2 (14:00 - 22:00)';
    if (selectedShift === '0' || selectedShift === '3') return 'Ca 3 (22:00 - 06:00)';
    return 'Tất cả các ca (24 Giờ)';
  }, [selectedShift]);

  return (
    <div className="drc-scada-container mes-fade">
      <style>{css}</style>

      {/* ── 1. HEADER PANEL ── */}
      <div className="drc-header-panel">
        <div className="drc-title-left">
          <span className="drc-badge-dot"></span>
          <h1>THEO DÕI TRẠNG THÁI SCADA TOÀN BỘ 18 MÁY (3 CV & 15 TH)</h1>
        </div>
        <div className="drc-header-meta">
          <span>Cập nhật lúc: <strong>{lastUpdated || 'Đang tải...'}</strong></span>
          {isLoading && <span style={{ color: '#0284c7', fontWeight: 800 }}>• Đang quét dữ liệu 18 máy...</span>}
        </div>
      </div>

      {/* ── 2. FILTER BAR (NGÀY, CA & TABS CÔNG ĐOẠN) ── */}
      <div className="drc-filter-bar">
        <div className="drc-filter-group">
          {/* Chọn Ngày */}
          <div className="drc-field">
            <span className="drc-label"><FaCalendarAlt color="#0284c7" /> Ngày:</span>
            <input
              type="date"
              className="drc-input-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Chọn Ca */}
          <div className="drc-field">
            <span className="drc-label"><FaClock color="#0284c7" /> Ca sản xuất:</span>
            <select
              className="drc-select"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            >
              <option value="ALL">-- Tất cả các ca (24h) --</option>
              <option value="1">Ca 1 (06:00 - 14:00)</option>
              <option value="2">Ca 2 (14:00 - 22:00)</option>
              <option value="0">Ca 3 (22:00 - 06:00)</option>
            </select>
          </div>

          {/* Nút Xem báo cáo */}
          <button className="drc-btn drc-btn-primary" onClick={handleRefresh}>
            <FaSearch /> Xem báo cáo
          </button>

          {/* Nút Hôm nay */}
          <button className="drc-btn drc-btn-secondary" onClick={handleResetFilter}>
            <FaRedo /> Hôm nay
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

      {/* ── 3. LƯỚI HIỂN THỊ SCADA 18 MÁY (4 MÁY / HÀNG) ── */}

      {/* Phân nhóm Cắt Vải (3 Máy) */}
      {(activeTab === 'ALL' || activeTab === 'CV') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="drc-group-head cv">
            <span>CÔNG ĐOẠN CẮT VẢI (CV) - TRẠNG THÁI SCADA NGÀY {dayjs(selectedDate).format('DD/MM/YYYY')} [{shiftDisplay}]</span>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>3 Máy (ORC-CV-01 đến ORC-CV-03)</span>
          </div>
          <div className="drc-machine-grid-4">
            {full18Machines.filter(m => m.type === 'CV').map(machine => (
              <MachineScadaCard
                key={`card-${machine.code}`}
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
            <span>CÔNG ĐOẠN THÀNH HÌNH (TH) - TRẠNG THÁI SCADA NGÀY {dayjs(selectedDate).format('DD/MM/YYYY')} [{shiftDisplay}]</span>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>15 Máy (ORC-TH-01 đến ORC-TH-17)</span>
          </div>
          <div className="drc-machine-grid-4">
            {full18Machines.filter(m => m.type === 'TH').map(machine => (
              <MachineScadaCard
                key={`card-${machine.code}`}
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

export default TrangThaiMayNgay;
