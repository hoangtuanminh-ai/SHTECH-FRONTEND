// src/pages/Homepage/DashboardCatVai.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Legend,
  BarChart, Bar,
} from 'recharts';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import các API vừa khai báo cho Cắt Vải
import {
  getCatVaiSummaryStats,
  getCatVaiMonthlyStats,
  getCatVaiDailyStats
} from '../../api/catVaiApi';

/* ─── MES Desktop Style cho Dashboard Cắt Vải ──────────────────────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

  .mes-dash {
    min-height: 100vh;
    padding: 10px;
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* ── Title ── */
  .mes-dash-title {
    font-size: 15px; font-weight: 900; color: #1a3a5c;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid #96afc8;
    display: flex; justify-content: space-between; align-items: center;
  }

  /* ── Filter bar (date range) ── */
  .mes-filterbar {
    background: #d4e4f4;
    border: 1px solid #96afc8;
    border-radius: 3px;
    padding: 5px 10px;
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .mes-fb-label { font-size: 12px; font-weight: 700; color: #1a3a5c; white-space: nowrap; }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-select, .mes-input-date {
    border: 1px solid #6890b0; background: #fff;
    padding: 2px 6px; font-size: 12px; font-weight: 600; color: #1a3a5c;
    border-radius: 2px; outline: none; height: 24px;
    font-family: 'Segoe UI', sans-serif;
  }
  .mes-select:focus, .mes-input-date:focus { border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15); }
  .mes-filter-btn {
    display: flex; align-items: center; gap: 5px;
    background: linear-gradient(180deg, #f0f8ff 0%, #d0e8fc 100%);
    border: 1px solid #6890b0; border-radius: 2px;
    padding: 0 14px; height: 24px;
    font-size: 12px; font-weight: 700; color: #1a3a5c;
    cursor: pointer; white-space: nowrap; transition: background 0.1s;
  }
  .mes-filter-btn:hover { background: linear-gradient(180deg, #d8f0ff 0%, #b8d8f8 100%); }
  .mes-filter-btn.gold {
    background: linear-gradient(180deg, #fffbe6 0%, #ffd666 100%);
    border-color: #b8860b; color: #7a5a00;
  }
  .mes-filter-btn.gold:hover { background: linear-gradient(180deg, #fff3b0 0%, #ffc107 100%); }
  
  .mes-export-btn {
    background: linear-gradient(180deg, #fee2e2 0%, #fca5a5 100%);
    border: 1px solid #b91c1c; border-radius: 2px;
    padding: 0 14px; height: 24px;
    font-size: 11px; font-weight: 700; color: #7f1d1d;
    cursor: pointer; display: flex; align-items: center; gap: 5px;
  }

  /* ── KPI cards ── */
  .mes-kpi-card {
    background: #fff; border: 1px solid #b8cce0;
    border-left: 3px solid #1565C0; border-radius: 3px;
    padding: 8px 14px; min-height: 72px;
  }
  .mes-kpi-lbl {
    font-size: 10px; font-weight: 700; color: #6890b0;
    text-transform: uppercase; letter-spacing: 0.8px;
    display: block; margin-bottom: 4px;
  }
  .mes-kpi-val {
    font-size: 20px; font-weight: 900;
    font-variant-numeric: tabular-nums;
    display: block; line-height: 1.1;
  }
  .mes-kpi-sub { font-size: 11px; font-weight: 700; margin-top: 3px; display: block; }

  /* ── Chart panel ── */
  .mes-panel {
    background: #fff; border: 1px solid #b8cce0;
    border-radius: 3px; overflow: hidden; height: 100%;
  }
  .mes-panel-header {
    background: linear-gradient(180deg, #d8e8f4 0%, #c8ddf0 100%);
    border-bottom: 1px solid #96afc8;
    padding: 5px 10px;
    font-size: 11px; font-weight: 800; color: #1a3a5c;
    text-transform: uppercase; letter-spacing: 0.3px;
  }
  .mes-panel-body { padding: 8px; }

  /* ── Month/year filter panel ── */
  .mes-month-panel {
    background: linear-gradient(180deg, #eaf4fc 0%, #d8e8f4 100%);
    border: 1px solid #96afc8; border-radius: 3px;
    padding: 8px 14px; margin-bottom: 10px;
    display: flex; flex-wrap: wrap; align-items: center;
    justify-content: space-between; gap: 8px;
  }

  /* ── Shimmer ── */
  .mes-shimmer {
    background: linear-gradient(90deg, #e8f0f8 0%, #d0e0f0 50%, #e8f0f8 100%);
    background-size: 400px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 2px;
  }
`;

// Cấu hình ban đầu cho trạng thái loading
const INIT_LOADING = { stats: true, trend: true, daily: true };
const axisStyle = { fontSize: 10, fontFamily: "'Segoe UI', sans-serif", fill: '#5a7a9a' };
const tooltipStyle = { fontFamily: "'Segoe UI'", fontSize: 11, border: '1px solid #96afc8', borderRadius: 2 };

/* ─── ShimmerCard Component (Hiệu ứng tải dữ liệu cho thẻ KPI) ─────────────── */
const ShimmerCard = () => (
  <div className="mes-kpi-card">
    <div className="mes-shimmer" style={{ height: 10, width: '55%', marginBottom: 8 }} />
    <div className="mes-shimmer" style={{ height: 22, width: '75%' }} />
  </div>
);

/* ─── StatCard Component (Thẻ hiển thị thông số KPI) ────────────────────────── */
const StatCard = ({ label, value, sub, color }) => (
  <div className="mes-kpi-card" style={{ borderLeftColor: color }}>
    <span className="mes-kpi-lbl">{label}</span>
    <span className="mes-kpi-val" style={{ color }}>{value}</span>
    {sub && <span className="mes-kpi-sub" style={{ color }}>{sub}</span>}
  </div>
);

/* ─── ChartCard Component (Khung bao ngoài cho Biểu đồ) ─────────────────────── */
const ChartCard = React.forwardRef(({ title, children }, ref) => (
  <div className="mes-panel" ref={ref}>
    <div className="mes-panel-header">{title}</div>
    <div className="mes-panel-body">{children}</div>
  </div>
));

/* ─── Main Component DashboardCatVai ────────────────────────────────────────── */
const DashboardCatVai = () => {
  // Lấy ngày hiện tại và đầu tháng hiện tại làm mặc định
  const defaultToDate = dayjs().format('YYYY-MM-DD');
  const defaultFromDate = dayjs().startOf('month').format('YYYY-MM-DD');

  // Khai báo các State quản lý dữ liệu và bộ lọc
  const [sectionLoading, setSectionLoading] = useState(INIT_LOADING);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [thangNam, setThangNam] = useState(dayjs().format('YYYY-MM'));

  // State lưu trữ dữ liệu KPI từ API 1
  const [overview, setOverview] = useState({
    tongKeHoachGoc: 0,
    tongKeHoachDieuChinh: 0,
    tongKeHoachHieuLuc: 0,
    tongSanLuongThucTe: 0,
    tongSoLuongThieu: 0,
    tyLeHoanThanh: 0,
    tyLeThieu: 0
  });

  // State tỷ lệ cho biểu đồ tròn
  const [pieRatio, setPieRatio] = useState({ tongSX: 0, tongThieu: 0 });

  // State lưu trữ dữ liệu xu hướng tháng (API 2) và tiến độ tuần (API 3)
  const [trendData, setTrendData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  // Các Refs để thực hiện chụp màn hình xuất PDF
  const pieRef = useRef(null);
  const trendRef = useRef(null);
  const dailyRef = useRef(null);

  // Tách năm và tháng từ chuỗi thangNam
  const [currYear, currMonth] = thangNam.split('-').map(Number);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => 2024 + i), []);

  /* ── API 1: Tải dữ liệu tổng hợp dải ngày ─────────────────────────────────── */
  const fetchStatsOnly = useCallback(async () => {
    setSectionLoading(p => ({ ...p, stats: true }));
    try {
      console.log(`[DashboardCatVai] Gọi API /summary-stats với: fromDate=${fromDate}, toDate=${toDate}`);
      const res = await getCatVaiSummaryStats(fromDate, toDate);
      console.log("[DashboardCatVai] Dữ liệu /summary-stats trả về:", res);

      if (res && res.success && res.data) {
        const d = res.data;
        const keHoachHieuLuc = d.tongKeHoachHieuLuc || 0;
        const thucTe = d.tongSanLuongThucTe || 0;
        const thieu = d.tongSoLuongThieu || 0;

        // Tính tỷ lệ hoàn thành & tỷ lệ thiếu
        const tyLeHoanThanh = keHoachHieuLuc > 0 ? Number(((thucTe / keHoachHieuLuc) * 100).toFixed(1)) : 0;
        const tyLeThieu = keHoachHieuLuc > 0 ? Number(((thieu / keHoachHieuLuc) * 100).toFixed(1)) : 0;

        setOverview({
          tongKeHoachGoc: d.tongKeHoachGoc || 0,
          tongKeHoachDieuChinh: d.tongKeHoachDieuChinh || 0,
          tongKeHoachHieuLuc: keHoachHieuLuc,
          tongSanLuongThucTe: thucTe,
          tongSoLuongThieu: thieu,
          tyLeHoanThanh,
          tyLeThieu
        });

        // Thiết lập tỉ lệ cho biểu đồ tròn (chỉ vẽ phần thực tế và phần thiếu nếu thiếu > 0)
        setPieRatio({ tongSX: thucTe, tongThieu: thieu > 0 ? thieu : 0 });
      }
    } catch (error) {
      console.error("[DashboardCatVai] Lỗi tải tổng hợp dải ngày:", error);
      message.error('Lỗi khi tải dữ liệu tổng hợp');
    } finally {
      setSectionLoading(p => ({ ...p, stats: false }));
    }
  }, [fromDate, toDate]);

  /* ── API 2 & 3: Tải dữ liệu năm/tháng ────────────────────────────────────── */
  const fetchYearMonthData = useCallback(async () => {
    setSectionLoading(p => ({ ...p, trend: true, daily: true }));
    const [nam, thang] = thangNam.split('-').map(Number);

    // API 2: Lấy dữ liệu xu hướng theo các tháng trong năm
    try {
      console.log(`[DashboardCatVai] Gọi API /monthly-stats với: nam_sx=${nam}`);
      const resMonthly = await getCatVaiMonthlyStats(nam);
      console.log("[DashboardCatVai] Dữ liệu /monthly-stats trả về:", resMonthly);

      if (resMonthly && resMonthly.success && resMonthly.data) {
        // Ánh xạ dữ liệu cho biểu đồ LineChart
        const mappedTrend = resMonthly.data.map(i => ({
          thang: `T${i.Thang_SX}`,
          KH_DieuChinh: i.TongKeHoachDieuChinh || 0,
          KH_HieuLuc: i.TongKeHoachHieuLuc || 0,
          SX_ThucTe: i.TongSanLuongThucTe || 0,
          SoLuongThieu: i.TongSoLuongThieu || 0
        }));
        setTrendData(mappedTrend);
      }
    } catch (error) {
      console.error("[DashboardCatVai] Lỗi tải xu hướng tháng:", error);
      message.error('Lỗi khi tải dữ liệu xu hướng tháng');
    } finally {
      setSectionLoading(p => ({ ...p, trend: false }));
    }

    // API 3: Lấy dữ liệu tiến độ theo các ngày trong tháng và gộp thành 4 tuần
    try {
      console.log(`[DashboardCatVai] Gọi API /daily-stats với: nam_sx=${nam}, thang_sx=${thang}`);
      const resDaily = await getCatVaiDailyStats(nam, thang);
      console.log("[DashboardCatVai] Dữ liệu /daily-stats trả về:", resDaily);

      if (resDaily && resDaily.success && resDaily.data) {
        // Khởi tạo 4 nhóm tuần mặc định
        const weeklyGroups = {
          T1: { KH_DieuChinh: 0, SX_ThucTe: 0 },
          T2: { KH_DieuChinh: 0, SX_ThucTe: 0 },
          T3: { KH_DieuChinh: 0, SX_ThucTe: 0 },
          T4: { KH_DieuChinh: 0, SX_ThucTe: 0 }
        };

        // Gộp dữ liệu của từng ngày vào tuần tương ứng
        resDaily.data.forEach(i => {
          const ngay = Number(i.Ngay);
          let tuan = 'T4'; // Mặc định từ ngày 22 đến cuối tháng
          if (ngay >= 1 && ngay <= 7) tuan = 'T1';
          else if (ngay >= 8 && ngay <= 14) tuan = 'T2';
          else if (ngay >= 15 && ngay <= 21) tuan = 'T3';

          weeklyGroups[tuan].KH_DieuChinh += (i.TongKeHoachDieuChinh || 0);
          weeklyGroups[tuan].SX_ThucTe += (i.TongSanLuong || 0);
        });

        // Ánh xạ thành mảng dữ liệu cho biểu đồ Recharts
        const mappedWeekly = Object.entries(weeklyGroups).map(([key, val]) => ({
          tuan: key,
          tuanName: key === 'T1' ? 'Tuần 1' : key === 'T2' ? 'Tuần 2' : key === 'T3' ? 'Tuần 3' : 'Tuần 4',
          KH_DieuChinh: val.KH_DieuChinh,
          SX_ThucTe: val.SX_ThucTe
        }));

        console.log("[DashboardCatVai] Dữ liệu gộp tuần sau xử lý:", mappedWeekly);
        setWeeklyData(mappedWeekly);
      } else {
        setWeeklyData([]);
      }
    } catch (error) {
      console.error("[DashboardCatVai] Lỗi tải tiến độ tuần:", error);
      message.error('Lỗi khi tải dữ liệu tiến độ tuần');
      setWeeklyData([]);
    } finally {
      setSectionLoading(p => ({ ...p, daily: false }));
    }
  }, [thangNam]);

  // Gọi API tải dữ liệu ban đầu và khi thay đổi bộ lọc
  useEffect(() => {
    fetchStatsOnly();
  }, [fetchStatsOnly]);

  useEffect(() => {
    fetchYearMonthData();
  }, [fetchYearMonthData]);

  // Hàm Refresh toàn bộ Dashboard
  const handleRefreshAll = () => {
    fetchStatsOnly();
    fetchYearMonthData();
  };

  /* ── Logic xuất báo cáo ra file PDF ───────────────────────────────────────── */
  const exportPDF = async () => {
    const hideLoading = message.loading('Đang khởi tạo báo cáo PDF...', 0);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // 1. Tiêu đề báo cáo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(26, 58, 92);
      doc.text('BAO CAO THONG KE TIEN DO CAT VAI', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ngay xuat bao cao: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth / 2, 26, { align: 'center' });
      doc.text(`Giai doan thong ke: ${dayjs(fromDate).format('DD/MM/YYYY')} - ${dayjs(toDate).format('DD/MM/YYYY')}`, pageWidth / 2, 31, { align: 'center' });

      // 2. Vẽ bảng số liệu KPI
      doc.setDrawColor(150, 175, 200);
      doc.setFillColor(240, 246, 252);
      doc.rect(10, 38, pageWidth - 20, 38, 'F');

      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('KE HOACH GOC', 15, 46);
      doc.text('KH DIEU CHINH', 60, 46);
      doc.text('KH HIEU LUC', 110, 46);
      doc.text('THUC TE SX', 155, 46);

      doc.setFontSize(11);
      doc.setTextColor(21, 101, 192);
      doc.text(`${overview.tongKeHoachGoc.toLocaleString('vi-VN')}`, 15, 53);
      doc.text(`${overview.tongKeHoachDieuChinh.toLocaleString('vi-VN')}`, 60, 53);
      doc.text(`${overview.tongKeHoachHieuLuc.toLocaleString('vi-VN')}`, 110, 53);
      doc.setTextColor(22, 101, 52); // Xanh lá cho thực tế
      doc.text(`${overview.tongSanLuongThucTe.toLocaleString('vi-VN')}`, 155, 53);

      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('TI LE HOAN THANH', 15, 64);
      doc.text('SO LUONG CON THIEU', 110, 64);

      doc.setFontSize(11);
      doc.setTextColor(22, 101, 52);
      doc.text(`${overview.tyLeHoanThanh}%`, 15, 71);
      doc.setTextColor(overview.tongSoLuongThieu > 0 ? 185 : 22, overview.tongSoLuongThieu > 0 ? 28 : 101, overview.tongSoLuongThieu > 0 ? 28 : 52);
      doc.text(`${overview.tongSoLuongThieu.toLocaleString('vi-VN')} (${overview.tyLeThieu}%)`, 110, 71);

      // 3. Chụp ảnh các biểu đồ
      const capture = async (ref) => {
        if (!ref.current) return null;
        const canvas = await html2canvas(ref.current, { scale: 2 });
        return canvas.toDataURL('image/png');
      };

      const pieImg = await capture(pieRef);
      const trendImg = await capture(trendRef);
      const dailyImg = await capture(dailyRef);

      // Định vị trí và kích thước ảnh biểu đồ trong PDF
      if (pieImg) {
        doc.addImage(pieImg, 'PNG', 10, 82, 85, 58);
      }
      if (trendImg) {
        doc.addImage(trendImg, 'PNG', 100, 82, 100, 58);
      }
      if (dailyImg) {
        // Biểu đồ ngày chiếm trọn dòng ở dưới
        doc.addImage(dailyImg, 'PNG', 10, 148, pageWidth - 20, 80);
      }

      // Footer báo cáo
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('He thong Quan ly San xuat MES DRC - Dashboard Cat Vai', pageWidth / 2, 282, { align: 'center' });

      // Lưu tệp PDF
      doc.save(`Bao_cao_Cat_Vai_${dayjs().format('YYYYMMDD_HHmm')}.pdf`);
      message.success('Đã tải file PDF báo cáo thành công!');
    } catch (err) {
      console.error("[DashboardCatVai] Lỗi khi xuất file PDF:", err);
      message.error('Lỗi trong quá trình kết xuất PDF.');
    } finally {
      hideLoading();
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const pieChartData = useMemo(() => {
    return [
      { name: 'Sản xuất', value: pieRatio.tongSX || 0, fill: '#166534' },
      { name: 'Thiếu', value: pieRatio.tongThieu || 0, fill: '#b91c1c' },
    ];
  }, [pieRatio]);

  return (
    <div className="mes-dash">
      <style>{css}</style>

      {/* ── TIÊU ĐỀ DASHBOARD ────────────────────────────────────────────── */}
      <div className="mes-dash-title">
        QUẢN LÝ THỐNG KÊ CẮT VẢI
        <button className="mes-export-btn" onClick={exportPDF}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          Xuất Báo Cáo (PDF)
        </button>
      </div>

      {/* ── BỘ LỌC DẢI NGÀY (CHO KPI & BIỂU ĐỒ TRÒN) ───────────────────────── */}
      <div className="mes-filterbar">
        <div className="mes-fb-group">
          <span className="mes-fb-label">Từ ngày:</span>
          <input type="date" className="mes-input-date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <span className="mes-fb-label" style={{ color: '#96afc8' }}>đến</span>
        <div className="mes-fb-group">
          <input type="date" className="mes-input-date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <button className="mes-filter-btn gold" onClick={fetchStatsOnly}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          Hiển Thị
        </button>
      </div>

      {/* ── THỐNG KÊ KPI + BIỂU ĐỒ TRÒN TỶ LỆ ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {sectionLoading.stats ? (
            [...Array(6)].map((_, i) => <ShimmerCard key={i} />)
          ) : (
            <>
              <StatCard label="KH Gốc" value={overview.tongKeHoachGoc.toLocaleString('vi-VN')} color="#1565C0" />
              <StatCard label="KH Điều Chỉnh" value={overview.tongKeHoachDieuChinh.toLocaleString('vi-VN')} color="#1565C0" />
              <StatCard label="KH Hiệu Lực" value={overview.tongKeHoachHieuLuc.toLocaleString('vi-VN')} color="#1565C0" />

              <StatCard
                label="Thực tế sản xuất"
                value={overview.tongSanLuongThucTe.toLocaleString('vi-VN')}
                sub={`Đạt ${overview.tyLeHoanThanh}%`}
                color="#166534"
              />
              <StatCard
                label="Hiệu suất hoàn thành"
                value={`${overview.tyLeHoanThanh}%`}
                sub={`So với KH Hiệu lực`}
                color="#166534"
              />
              <StatCard
                label="Số lượng thiếu"
                value={overview.tongSoLuongThieu.toLocaleString('vi-VN')}
                sub={overview.tongSoLuongThieu > 0 ? `Thiếu ${overview.tyLeThieu}%` : `Vượt kế hoạch`}
                color={overview.tongSoLuongThieu > 0 ? "#b91c1c" : "#166534"}
              />
            </>
          )}
        </div>

        <ChartCard title="Tỷ lệ thực tế vs thiếu" ref={pieRef}>
          <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer>
              {(() => {
                const filteredData = pieChartData.filter(d => d.value > 0);
                console.log("[DashboardCatVai] Dữ liệu PieChart vẽ thực tế:", filteredData);
                if (filteredData.length === 0) {
                  return <div style={{ fontSize: 11, color: '#6890b0' }}>Không có dữ liệu biểu đồ tròn</div>;
                }
                return (
                  <PieChart>
                    <Pie
                      data={filteredData} dataKey="value"
                      innerRadius={0} outerRadius={75}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#96afc8', strokeWidth: 1 }}
                    >
                      {filteredData.map((e, i) => <Cell key={i} fill={e.fill} stroke="#ffffff" strokeWidth={1.5} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(val) => val.toLocaleString('vi-VN')} />
                  </PieChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── BỘ LỌC THÁNG & NĂM ────────────────────────────────────────────── */}
      <div className="mes-month-panel">
        <div className="mes-fb-group">
          <span className="mes-fb-label">Xem xu hướng theo tháng & tiến độ ngày:</span>
          <select className="mes-select" style={{ width: 90 }} value={currMonth}
            onChange={e => setThangNam(`${currYear}-${String(e.target.value).padStart(2, '0')}`)}>
            {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <select className="mes-select" style={{ width: 72 }} value={currYear}
            onChange={e => setThangNam(`${e.target.value}-${String(currMonth).padStart(2, '0')}`)}>
            {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
          <button className="mes-filter-btn" onClick={handleRefreshAll}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {/* ── 2 BIỂU ĐỒ DƯỚI CÙNG HÀNG (XU HƯỚNG NĂM & TIẾN ĐỘ NGÀY) ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

        {/* BIỂU ĐỒ 1: XU HƯỚNG THEO THÁNG TRONG NĂM */}
        <ChartCard title={`Xu hướng sản xuất cắt vải trong năm ${currYear} (Kế hoạch Hiệu lực vs Thực tế)`} ref={trendRef}>
          {sectionLoading.trend ? (
            <div className="mes-shimmer" style={{ height: 260, borderRadius: 2 }} />
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                {trendData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 12, color: '#5a7a9a' }}>
                    Không có dữ liệu xu hướng năm {currYear}
                  </div>
                ) : (
                  <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d0dff0" />
                    <XAxis dataKey="thang" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(val) => val.toLocaleString('vi-VN')} />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Segoe UI'" }} />
                    <Line dataKey="KH_HieuLuc" name="Kế hoạch Hiệu lực" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} />
                    <Line dataKey="SX_ThucTe" name="Sản lượng Thực tế" stroke="#166534" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* BIỂU ĐỒ 2: TIẾN ĐỘ THEO CÁC TUẦN TRONG THÁNG */}
        <ChartCard title={`Chi tiết tiến độ sản xuất cắt vải theo tuần — Tháng ${currMonth}/${currYear}`} ref={dailyRef}>
          {sectionLoading.daily ? (
            <div className="mes-shimmer" style={{ height: 260, borderRadius: 2 }} />
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                {weeklyData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 12, color: '#5a7a9a' }}>
                    Không có dữ liệu tiến độ tuần trong tháng {currMonth}/{currYear}
                  </div>
                ) : (
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d0dff0" />
                    <XAxis dataKey="tuanName" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(val) => val.toLocaleString('vi-VN')} />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Segoe UI'" }} />
                    <Bar dataKey="KH_DieuChinh" name="Kế hoạch Điều chỉnh" fill="#96afc8" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="SX_ThucTe" name="Sản lượng Thực tế" fill="#166534" radius={[2, 2, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

      </div>
    </div>
  );
};

export default DashboardCatVai;
