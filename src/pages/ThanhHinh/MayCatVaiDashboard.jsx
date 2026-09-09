import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getChartRealTimeORCV,
  getChartRecipeORCV,
  getChartSettingORCV,
  getMachineStatusTimes,
  getMachineStatusTimesByMonth,
  getViewOrcThMachineImageApi,
  getMachinesWithStats,
  getTongHopCaNgay
} from '../../api/thanhhinhApi';
import { getMonthlyStatsTheoMay, getBtpTheoMay, getShiftStatsForMonthCatVai } from '../../api/catVaiApi';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';

import RealTimeORCVHistory from './RealTimeORCVHistory';
import RecipeORCVHistory from './RecipeORCVHistory';
import SettingORCVHistory from './SettingORCVHistory';
import CatVaiChangeHistory from '../../components/change/CatVaiChangeHistory';
import { exportKeyValueListToExcel, exportCombinedMachineParametersToExcel } from '../../utils/exportExcelHelper';
import { getCurrentShift, isCurrentShiftSelected } from '../../utils/shiftPolling';
import {
  SHIFT_ORDER,
  getChartShiftRange,
  buildTongHopCaNgayChartData
} from '../../utils/tongHopCaNgayChart';
import TongHopCaNgayTooltip from '../../components/chart/TongHopCaNgayTooltip';

// ============================================================================
// MES DESKTOP STYLE VÀ ANIMATIONS (ĐỒNG BỘ VỚI MÁY THÀNH HÌNH)
// ============================================================================
const css = `
  * { box-sizing: border-box; }
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .mes-fade { animation: fadein 0.25s ease both; }

  .mes-dash {
    min-height: 100vh;
    padding: 10px;
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    font-family: Arial, Helvetica, sans-serif;
  }
  /* Ép Arial cho MỌI phần tử con của trang, kể cả h1-h4.
     index.css có rule "h1,h2,h3,h4 { font-family: ... !important }" áp toàn site,
     nếu không khai !important ở đây thì các tiêu đề trong trang vẫn bị nó ghi đè. */
  .mes-dash, .mes-dash * {
    font-family: Arial, Helvetica, sans-serif !important;
  }

  /* ── Title bar ── */
  .mes-title-bar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
    margin-bottom: 8px; padding-bottom: 6px;
    border-bottom: 2px solid #96afc8;
  }
  .mes-title-left  { display: flex; align-items: center; gap: 10px; }
  .mes-back-btn {
    width: 28px; height: 28px; border-radius: 2px;
    background: linear-gradient(180deg, #f0f8ff 0%, #d0e8fc 100%);
    border: 1px solid #6890b0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; transition: background 0.1s;
  }
  .mes-back-btn:hover { background: linear-gradient(180deg, #d8f0ff 0%, #b8d8f8 100%); }
  .mes-page-eyebrow {
    font-size: 10px; font-weight: 700; color: #96afc8;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .mes-page-title {
    font-size: 15px; font-weight: 900; color: #1a3a5c;
    text-transform: uppercase; letter-spacing: 0.5px;
  }

  /* ── Content panels ── */
  .mes-panel {
    background: #fff; border: 1px solid #b8cce0;
    border-radius: 3px; overflow: hidden; margin-bottom: 10px;
  }
  .mes-panel-header {
    background: linear-gradient(180deg, #d8e8f4 0%, #c8ddf0 100%);
    border-bottom: 1px solid #96afc8;
    padding: 5px 10px;
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 800; color: #1a3a5c;
    text-transform: uppercase; letter-spacing: 0.3px;
  }
  .mes-panel-accent { width: 3px; height: 16px; border-radius: 1px; flex-shrink: 0; }
  .mes-panel-body { padding: 10px; }

  /* ── Tabs ── */
  .mes-tabs {
    display: flex;
    gap: 4px;
    border-bottom: 2px solid #96afc8;
    margin-bottom: 12px;
    padding-top: 5px;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  .mes-tab-btn {
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 700;
    color: #4a6a8a;
    background: #d4e4f4;
    border: 1px solid #96afc8;
    border-bottom: none;
    border-radius: 3px 3px 0 0;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .mes-tab-btn:hover {
    background: #c8ddf0;
    color: #1a3a5c;
  }
  .mes-tab-btn.active {
    background: #fff;
    color: #1565C0;
    border-color: #96afc8;
    border-bottom: 2px solid #fff;
    margin-bottom: -2px;
    position: relative;
    z-index: 2;
  }

  /* ── Uptime pills ── */
  .mes-uptime-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
  .mes-uptime-pill {
    padding: 5px 12px; border-radius: 2px;
    border: 1px solid; display: flex; align-items: center; gap: 6px;
  }

  /* ── Empty state ── */
  .mes-empty {
    text-align: center; padding: 50px 20px;
    color: #96afc8; font-size: 13px; font-weight: 600;
  }

  /* ══ KHỐI TỔNG QUAN TRẠNG THÁI CA (ảnh máy | bộ lọc + KPI + 2 biểu đồ) ══ */
  .th-overview {
    display: grid;
    grid-template-columns: 380px minmax(0, 1fr);
    gap: 12px; align-items: stretch; margin-bottom: 12px;
  }
  @media (max-width: 1100px) { .th-overview { grid-template-columns: 1fr; } }
  .th-ov-right { display: flex; flex-direction: column; gap: 10px; min-width: 0; }

  /* ── Ảnh máy ── */
  .th-photo {
    border: 1px solid #cbd5e1; border-radius: 4px;
    background: #fff; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .th-photo img {
    display: block; width: 100%; flex: 1;
    min-height: 140px; object-fit: cover; background: #f1f5f9;
  }
  .th-photo-empty {
    flex: 1; min-height: 140px; display: flex; align-items: center; justify-content: center;
    background: #f1f5f9; color: #94a3b8; font-size: 12px; font-weight: 700;
  }
  .th-photo-cap {
    display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
    padding: 6px 10px; border-top: 1px solid #e2e8f0;
    font-size: 10px; font-weight: 800; color: #6890b0;
    text-transform: uppercase; letter-spacing: 0.7px;
  }
  .th-photo-cap b { font-size: 14px; color: #1a3a5c; letter-spacing: 0; }

  /* ── Thanh lọc dùng chung cho cả khối ── */
  .th-toolbar {
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    background: #eef5fc; border: 1px solid #b8cce0; border-radius: 4px;
    padding: 7px 12px;
  }
  .th-tb-group { display: flex; align-items: center; gap: 7px; }
  .th-tb-label {
    font-size: 11px; font-weight: 800; color: #1a3a5c;
    text-transform: uppercase; letter-spacing: 0.6px;
  }
  .th-tb-pick {
    height: 28px; padding: 0 8px; border: 1px solid #6890b0; border-radius: 3px;
    background: #fef08a; color: #1a3a5c;
    font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 800;
    outline: none; cursor: pointer;
  }
  .th-tb-pick:focus { border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15); }

  /* Nút áp dụng bộ lọc / làm mới thủ công */
  .th-tb-btn {
    height: 28px; padding: 0 14px; border: 1px solid #1565C0; border-radius: 3px;
    background: #1565C0; color: #ffffff;
    font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.4px;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: background 0.15s ease;
  }
  .th-tb-btn:hover:not(:disabled) { background: #0d47a1; }
  .th-tb-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  /* Khi bộ lọc đang thay đổi chưa áp dụng thì làm nổi bật nút để nhắc người dùng bấm */
  .th-tb-btn.pending {
    background: #ea580c; border-color: #ea580c;
    box-shadow: 0 0 0 2px rgba(234,88,12,0.2);
  }
  .th-tb-btn.pending:hover:not(:disabled) { background: #c2410c; }
  .th-tb-updated {
    font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;
  }
  .th-status-pill {
    margin-left: auto; display: flex; align-items: center; gap: 8px;
    min-width: 190px; justify-content: center;
    padding: 6px 18px; border-radius: 3px;
    font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18);
  }
  .th-status-dot {
    width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
    background: currentColor; opacity: 0.85;
  }

  /* ── Lưới 2 khối nội dung phía dưới ── */
  .th-row-2col {
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.8fr);
    gap: 12px; align-items: stretch; margin-bottom: 12px;
  }
  @media (max-width: 1150px) { .th-row-2col { grid-template-columns: 1fr; } }

  /* Bảng số liệu + biểu đồ cột nhỏ nằm cạnh nhau bên trong 1 thẻ */
  .th-split {
    display: grid; grid-template-columns: minmax(0, 1fr) 200px;
    gap: 14px; flex: 1;
  }
  @media (max-width: 700px) { .th-split { grid-template-columns: 1fr; } }
  .th-split-side {
    display: flex; align-items: flex-end; justify-content: center;
    border-left: 1px solid #e2e8f0; padding-left: 14px;
  }
  @media (max-width: 700px) { .th-split-side { border-left: none; padding-left: 0; } }

  .th-card {
    background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;
    overflow: hidden; display: flex; flex-direction: column; height: 100%;
  }

  /* ── Tooltip biểu đồ luôn nổi trên cùng ──
     Recharts render tooltip vào .recharts-tooltip-wrapper nằm ngay trong khung biểu đồ,
     nên nếu không nâng z-index thì nó bị các phần tử có z-index/position khác che mất.
     Đặt ở đây để áp cho mọi biểu đồ trong trang, kể cả các <Tooltip> không truyền wrapperStyle. */
  .recharts-tooltip-wrapper {
    z-index: 9999 !important;
    pointer-events: none;
  }
  /* Lớp bọc biểu đồ không được cắt tooltip khi tooltip tràn ra mép.
     Chỉ mở overflow ở lớp div bọc ngoài, KHÔNG đụng .recharts-surface (thẻ SVG)
     để nhãn trục và cột của BarChart vẫn được cắt gọn như thiết kế. */
  .recharts-wrapper { overflow: visible !important; }

  /* ── Vùng cuộn ngang cho biểu đồ "Thực hiện KH theo ngày" ──
     Một tháng có tới 31 ngày × 3 ca = 93 cột. Nhồi hết vào bề ngang màn hình thì
     cột mảnh như sợi chỉ và nhãn sản lượng chồng lên nhau.
     Vì vậy cố định bề rộng mỗi ngày rồi cho cuộn ngang: cột luôn giữ nguyên bề dày,
     thấy ~16 ngày mỗi khung, kéo ngang để xem tiếp các ngày còn lại. */
  .th-daychart-scroll {
    width: 100%; height: 100%;
    /* border-box: padding-top nới chỗ cho tooltip nằm TRONG chiều cao 100%,
       không cộng thêm ra ngoài làm vùng cuộn tràn xuống phần tử bên dưới. */
    box-sizing: border-box;
    overflow-x: auto;
    /* overflow-y phải là visible để tooltip nổi ra ngoài không bị cắt.
       Lưu ý CSS: khi một chiều là auto/scroll thì chiều còn lại KHÔNG thể là visible
       (trình duyệt tự đổi thành auto). Vì vậy dùng clip cho trục Y — nó chặn cuộn dọc
       giống hidden nhưng cho phép ta nới bằng padding phía dưới cho thanh cuộn. */
    /* clip thay cho hidden: chặn cuộn dọc nhưng vẫn cho phép nới vùng vẽ bằng
       cặp padding/margin âm bên dưới, nhờ đó tooltip nổi lên trên không bị cắt. */
    overflow-y: clip;
    /* Nới nhẹ mép trên cho tooltip. Trước đây để 60px thì phần padding này
       ăn mất 60px trong chiều cao 360px của khung, làm biểu đồ bị lùn hẳn xuống. */
    padding-top: 18px;
    margin-top: -18px;
    /* Chừa chỗ cho thanh cuộn ngang, tránh nó đè lên nhãn ngày ở trục X */
    padding-bottom: 4px;
  }
  .th-daychart-scroll::-webkit-scrollbar { height: 9px; }
  .th-daychart-scroll::-webkit-scrollbar-track {
    background: #eef5fc; border-radius: 5px;
  }
  .th-daychart-scroll::-webkit-scrollbar-thumb {
    background: #9db8d4; border-radius: 5px;
  }
  .th-daychart-scroll::-webkit-scrollbar-thumb:hover { background: #6890b0; }
  /* Firefox */
  .th-daychart-scroll { scrollbar-width: thin; scrollbar-color: #9db8d4 #eef5fc; }

  /* Gợi ý người dùng có thể kéo ngang khi dữ liệu vượt quá khung nhìn */
  .th-daychart-hint {
    font-size: 10px; font-weight: 700; color: #6890b0;
    padding: 2px 0 0 2px; white-space: nowrap;
  }

  /* ── Phần đầu riêng của thẻ biểu đồ theo ngày ──
     Tiêu đề và nhãn phụ ở đây khá dài (số ngày, số ca, khoảng lọc, chú thích).
     Nếu để chúng xuống dòng thì phần đầu thẻ cao thêm, ép thân biểu đồ co lại
     và cột trông lùn hẳn — đúng hiện tượng khi lọc trọn tháng 31 ngày.
     Vì vậy giữ mỗi phần trên một dòng, phần thừa thì cắt bằng dấu ba chấm. */
  .th-daychart-head { flex-wrap: nowrap; }
  .th-daychart-head .th-card-title {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    flex: 0 1 auto; min-width: 0;
  }
  .th-daychart-head .th-card-meta {
    overflow: hidden; text-overflow: ellipsis;
    flex: 0 1 auto; min-width: 0;
  }
  .th-card-head {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 7px 12px; background: linear-gradient(180deg, #eef5fc 0%, #dfeaf6 100%);
    border-bottom: 1px solid #cbd5e1;
    /* Không cho phần đầu thẻ cao thêm khi chữ dài: nó nằm cùng flex column với
       thân biểu đồ, tiêu đề xuống 2 dòng sẽ ép thân co lại làm biểu đồ lùn hẳn. */
    flex-shrink: 0;
    min-height: 34px;
  }
  .th-card-title {
    font-size: 12px; font-weight: 900; color: #1a3a5c;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  .th-card-meta {
    font-size: 11px; font-weight: 700; color: #64748b;
    font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .th-card-body { padding: 12px; flex: 1; display: flex; flex-direction: column; min-width: 0; }

  /* ── Timeline trạng thái ── */
  .th-tl-wrap { position: relative; padding-top: 15px; }
  .th-timeline {
    position: relative; height: 38px; overflow: hidden;
    background: #eef2f6; border: 1px solid #cbd5e1; border-radius: 4px;
  }
  .th-seg {
    position: absolute; top: 0; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; letter-spacing: 0.2px;
    white-space: nowrap; overflow: hidden; z-index: 2; cursor: default;
  }
  .th-seg:hover { filter: brightness(1.08); }
  .th-tl-empty {
    position: relative; z-index: 3; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #94a3b8;
  }
  .th-axis { position: relative; height: 16px; margin-top: 6px; }
  .th-axis span {
    position: absolute; top: 0; font-size: 10px; font-weight: 700;
    color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .th-now-flag {
    position: absolute; top: 0; transform: translateX(-50%);
    background: #1d4ed8; color: #fff; border-radius: 2px;
    padding: 1px 5px; font-size: 9px; font-weight: 800; white-space: nowrap;
  }

  /* ── Donut 8h ── */
  .th-donut-wrap { position: relative; width: 156px; height: 156px; flex-shrink: 0; }
  .th-donut-center {
    position: absolute; inset: 0; pointer-events: none;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
  }
  /* Hộp giới hạn đúng bằng đường kính lỗ donut (innerRadius 46 -> 92px, trừ hao còn 86px).
     Chữ bên trong không được phép tràn ra ngoài đè lên vành biểu đồ. */
  .th-donut-hole {
    width: 86px; max-width: 86px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  /* Cỡ chữ 17px vừa đủ để chuỗi dài nhất "100.00%" (7 ký tự) nằm gọn trong 86px */
  .th-donut-big {
    font-size: 17px; font-weight: 900; line-height: 1.05; white-space: nowrap;
    max-width: 100%;
  }
  .th-donut-cap {
    margin-top: 3px; font-size: 9px; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap;
  }
  .th-donut-sub {
    margin-top: 2px; font-size: 10px; font-weight: 800; color: #94a3b8; white-space: nowrap;
  }

  /* ── Chú thích trạng thái ── */
  .th-legend {
    flex: 1; min-width: 0; align-self: stretch;
    border: 1px solid #cbd5e1; border-radius: 3px; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .th-legend-row {
    display: flex; align-items: center; gap: 8px; flex: 1;
    padding: 5px 9px; background: #fff;
  }
  .th-legend-row:nth-child(even) { background: #f8fafc; }
  .th-legend-chip {
    width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgba(15,23,42,0.12);
  }
  .th-legend-name {
    flex: 1; min-width: 0; font-size: 11.5px; font-weight: 700; color: #334155;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .th-legend-val {
    font-size: 11.5px; font-weight: 900; color: #1a3a5c; font-variant-numeric: tabular-nums;
  }
  .th-legend-pct {
    min-width: 46px; text-align: right;
    font-size: 11px; font-weight: 700; color: #64748b; font-variant-numeric: tabular-nums;
  }

  /* ── Các class responsive mới ── */
  .th-timeline-donut-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 16px;
    align-items: start;
    margin-top: 8px;
  }
  .th-legend-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    margin-top: 10px;
  }
  .th-scada-flex {
    display: flex;
    gap: 12px;
    flex: 1;
    min-height: 250px;
    align-items: stretch;
  }
  .th-responsive-grid-auto {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }

  /* Bảng số liệu + biểu đồ cột nhỏ nằm cạnh nhau bên trong 1 thẻ */
  .th-split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 210px;
    gap: 16px;
    flex: 1;
    align-items: stretch;
    min-width: 0;
    max-width: 100%;
  }
  .th-split-side {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border-left: 1px solid #cbd5e1;
    padding-left: 14px;
    padding-right: 6px;
    min-width: 0;
  }

  /* Bảng responsive hỗ trợ cuộn ngang trên điện thoại */
  .th-table-responsive {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto !important;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #0284c7 #f1f5f9;
    box-sizing: border-box;
  }
  .th-table-responsive::-webkit-scrollbar {
    height: 6px;
  }
  .th-table-responsive::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  .th-table-responsive::-webkit-scrollbar-thumb {
    background: #0284c7;
    border-radius: 3px;
  }
  .th-ca-table {
    width: 100%;
    min-width: 520px;
    border-collapse: collapse;
    text-align: center;
    font-size: 13px;
  }
  .th-ca-table th {
    background: #f8fafc;
    color: #475569;
    font-size: 11.5px;
    font-weight: 800;
    text-transform: uppercase;
    border-bottom: 2px solid #cbd5e1;
    padding: 8px 10px;
  }
  .th-ca-table td {
    border-bottom: 1px solid #e2e8f0;
    padding: 8px 10px;
  }

  .th-card {
    background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;
    overflow: hidden; display: flex; flex-direction: column; height: 100%;
    min-width: 0; max-width: 100%;
  }

  .th-ca-card-head {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }

  /* ── Media Queries Responsive Toàn Diện ── */
  @media (max-width: 1200px) {
    .th-overview { grid-template-columns: 320px minmax(0, 1fr); }
    .th-row-2col { grid-template-columns: 1fr; }
  }

  @media (max-width: 992px) {
    .mes-dash { padding: 8px; }
    .th-overview { grid-template-columns: 1fr; }
    .th-photo img { max-height: 260px; object-fit: contain; }
    .th-timeline-donut-row {
      grid-template-columns: 1fr;
      justify-items: center;
      gap: 14px;
    }
    .th-scada-flex {
      flex-direction: column;
    }
    .th-scada-flex > div {
      max-width: 100% !important;
    }
  }

  @media (max-width: 900px) {
    .th-split {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .th-split-side {
      border-left: none;
      padding-left: 0;
      padding-right: 0;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
  }

  @media (max-width: 768px) {
    .mes-dash { padding: 6px; }
    .mes-title-bar { gap: 6px; padding-bottom: 4px; }
    .mes-page-title { font-size: 13px; }
    .th-toolbar {
      gap: 8px;
      padding: 6px 8px;
    }
    .th-status-pill {
      margin-left: 0;
      width: 100%;
      min-width: unset;
      padding: 5px 10px;
      font-size: 12.5px;
    }
    .th-legend-grid-2 {
      grid-template-columns: 1fr;
      gap: 2px;
    }
        padding: 7px 8px !important;
      }
    }

    .th-ca-card-head {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
    }
    @media (max-width: 768px) {
      .th-ca-card-head {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 8px 10px;
      }
      .th-ca-card-head .th-card-title {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .th-ca-card-head .th-card-meta {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .mes-modal-content {
      max-width: 95vw;
      max-height: 94vh;
      margin: 10px;
    }
  }

  @media (max-width: 480px) {
    .th-tb-group {
      width: 100%;
      justify-content: space-between;
    }
    .th-tb-pick {
      flex: 1;
      max-width: 180px;
    }
    .th-tb-btn {
      width: 100%;
      justify-content: center;
    }
    .th-responsive-grid-auto {
      grid-template-columns: 1fr;
    }
  }
`;

// ==========================================
// CẤU HÌNH NHÓM CHO REALTIME (MÁY CV-01)
// ==========================================
const groupsCV01 = [
  {
    title: "1. Thông số Gốc & Chiều dài",
    accent: "#0284c7",
    fields: [
      { key: "cutAngle", label: "Góc cắt" },
      { key: "splicingAngle", label: "Góc nối" },
      { key: "actualLength", label: "Chiều dài cuộn thu" },
      { key: "stripLength", label: "Chiều dài dải mảnh tính toán" },
      { key: "requiredPosition", label: "Vị trí yêu cầu của cơ cấu cấp liệu" },
      { key: "trimmingKnivesLeftTemperature", label: "Nhiệt độ dao xén biên trái" },
      { key: "trimmingKnivesRightTemperature", label: "Nhiệt độ dao xén biên phải" }
    ]
  },
  {
    title: "2. Cuộn xả & Puly thực tế",
    accent: "#16a34a",
    fields: [
      { key: "actualDiameterWindUp", label: "Đường kính thực tế cuộn thu" },
      { key: "actualDiameterOfMaterialCoil", label: "Đường kính cuộn vật liệu xả" },
      { key: "actualDiameterOfWrapCoil", label: "Đường kính cuộn quấn xả" },
      { key: "actualLengthOfLetOffMaterial", label: "Chiều dài vật liệu xả" },
      { key: "numberOfCutMin", label: "Số lần cắt/phút" },
      { key: "pulleys1ActualPosition", label: "Vị trí puly phải" },
      { key: "pulleys2ActualPosition", label: "Vị trí puly trái" }
    ]
  },
  {
    title: "3. Cài đặt Puly, Vị trí & Thu liệu",
    accent: "#ea580c",
    fields: [
      { key: "recipeNumber", label: "Số công thức" },
      { key: "pulley1BasicPosition", label: "Vị trí nhỏ nhất puly phải (giá trị cố định)" },
      { key: "pulley1EndPosition", label: "Vị trí lớn nhất puly phải (giá trị cố định)" },
      { key: "pulley2BasicPosition", label: "Vị trí lớn nhất puly trái (giá trị cố định)" },
      { key: "pulley2EndPosition", label: "Vị trí mép vật liệu (giá trị cố định)" },
      { key: "feedingDevicePosition", label: "Vị trí cơ cấu cấp liệu" },
      { key: "feedingConveyerOutOfShearPosition", label: "Vị trí băng tải cấp liệu sau dao cắt" },
      { key: "windupMaterialDiameter", label: "Đường kính cuộn vật liệu của cuộn thu" },
      { key: "windupWrapDiameter", label: "Đường kính cuộn quấn của cuộn thu" },
      { key: "windupMaterialCalculatedRequiredRevolutions", label: "Số vòng quay yêu cầu tính toán của cuộn thu vật liệu (%)" },
      { key: "takeoffLenght", label: "Chiều dài ra liệu" }
    ]
  },
  {
    title: "4. Thống kê sản lượng Ca & Bảo dưỡng",
    accent: "#7c3aed",
    fields: [
      { key: "lengthOfLetOffMaterialShiftA", label: "Chiều dài vật liệu xả ca A" },
      { key: "lengthOfLetOffMaterialShiftB", label: "Chiều dài vật liệu xả ca B" },
      { key: "lengthOfLetOffMaterialShiftC", label: "Chiều dài vật liệu xả ca C" },
      { key: "numberOfCoilsShiftA", label: "Số cuộn ca A" },
      { key: "numberOfCoilsShiftB", label: "Số cuộn ca B" },
      { key: "numberOfCoilsShiftC", label: "Số cuộn ca C" },
      { key: "numberOfCutsShiftA", label: "Số lần cắt ca A" },
      { key: "numberOfCutsShiftB", label: "Số lần cắt ca B" },
      { key: "numberOfCutsShiftC", label: "Số lần cắt ca C" },
      { key: "maintenanceLengthOfLetOffMaterial", label: "Chiều dài vật liệu xả bảo dưỡng" },
      { key: "maintenanceNumberOfCuts", label: "Số lần cắt bảo dưỡng" },
      { key: "totalNumberOfCuts", label: "Tổng số lần cắt" },
      { key: "timeOfShearDriveRunning", label: "Thời gian chạy truyền động dao cắt" }
    ]
  },
  {
    title: "5. Thông số thu liệu A/B & Cảm biến",
    accent: "#db2777",
    fields: [
      { key: "windupAMaterialDiameter", label: "Đường kính cuộn vật liệu cuộn thu A" },
      { key: "windupAWrapDiameter", label: "Đường kính cuộn quấn cuộn thu A" },
      { key: "windupBMaterialDiameter", label: "Đường kính cuộn vật liệu cuộn thu B" },
      { key: "windupBWrapDiameter", label: "Đường kính cuộn quấn cuộn thu B" },
      { key: "windupALenght", label: "Chiều dài cuộn thu A" },
      { key: "windupBLenght", label: "Chiều dài cuộn thu B" },
      { key: "angleCalculatorAngle", label: "Bộ tính góc - Góc" },
      { key: "edgeCalculatorEdge", label: "Bộ tính mép - Mép" },
      { key: "sensorSignalCutting", label: "Cảm biến cắt" },
      { key: "sensorSignalSplicing", label: "Cảm biến nối" }
    ]
  }
];

// ==========================================
// CẤU HÌNH NHÓM CHO REALTIME (MÁY CV-02/03)
// ==========================================
const groupsCV02_03 = [
  {
    title: "1. Thông số cơ bản",
    accent: "#0284c7",
    fields: [
      { key: "cutAngle", label: "Góc cắt" },
      { key: "splicingAngle", label: "Góc nối" },
      { key: "actualLength", label: "Chiều dài thực tế" },
      { key: "stripLength", label: "Chiều dài dải mảnh" },
      { key: "requiredPosition", label: "Vị trí yêu cầu" },
      { key: "trimmingKnivesLeftTemperature", label: "Nhiệt độ dao xén biên trái" },
      { key: "trimmingKnivesRightTemperature", label: "Nhiệt độ dao xén biên phải" },
      { key: "actualDiameterWindUp", label: "Đường kính cuộn thu thực tế" },
      { key: "actualDiameterOfMaterialCoil", label: "Đường kính cuộn liệu thực tế" },
      { key: "actualDiameterOfWrapCoil", label: "Đường kính cuộn quấn thực tế" },
      { key: "actualLengthOfLetOffMaterial", label: "Chiều dài vật liệu xả thực tế" },
      { key: "recipeNumber", label: "Số công thức" },
      { key: "numberOfCutMin", label: "Số lần cắt/phút" }
    ]
  },
  {
    title: "2. Thông số vị trí & Puly",
    accent: "#16a34a",
    fields: [
      { key: "pulleys1ActualPosition", label: "Vị trí thực tế puly 1" },
      { key: "pulleys2ActualPosition", label: "Vị trí thực tế puly 2" },
      { key: "pulley1BasicPosition", label: "Vị trí gốc puly 1" },
      { key: "pulley1EndPosition", label: "Vị trí cuối puly 1" },
      { key: "pulley2BasicPosition", label: "Vị trí gốc puly 2" },
      { key: "pulley2EndPosition", label: "Vị trí cuối puly 2" }
    ]
  },
  {
    title: "3. Thông số cấp liệu",
    accent: "#ea580c",
    fields: [
      { key: "feedingDevicePosition", label: "Vị trí cơ cấu cấp liệu" }
    ]
  },
  {
    title: "4. Thống kê sản lượng Ca & Bảo dưỡng",
    accent: "#7c3aed",
    fields: [
      { key: "lengthOfLetOffMaterialShiftA", label: "Chiều dài vật liệu ca A" },
      { key: "lengthOfLetOffMaterialShiftB", label: "Chiều dài vật liệu ca B" },
      { key: "lengthOfLetOffMaterialShiftC", label: "Chiều dài vật liệu ca C" },
      { key: "numberOfCoilsShiftA", label: "Số cuộn ca A" },
      { key: "numberOfCoilsShiftB", label: "Số cuộn ca B" },
      { key: "numberOfCoilsShiftC", label: "Số cuộn ca C" },
      { key: "numberOfCutsShiftA", label: "Số lần cắt ca A" },
      { key: "numberOfCutsShiftB", label: "Số lần cắt ca B" },
      { key: "numberOfCutsShiftC", label: "Số lần cắt ca C" },
      { key: "maintenanceLengthOfLetOffMaterial", label: "Chiều dài vật liệu bảo dưỡng" },
      { key: "maintenanceNumberOfCuts", label: "Số lần cắt bảo dưỡng" },
      { key: "totalNumberOfCuts", label: "Tổng số lần cắt" },
      { key: "timeOfShearDriveRunning", label: "Thời gian chạy truyền động dao cắt" }
    ]
  },
  {
    title: "5. Bộ tính toán & Cảm biến",
    accent: "#db2777",
    fields: [
      { key: "angleCalculatorAngle", label: "Giá trị tính toán góc" },
      { key: "edgeCalculatorEdge", label: "Giá trị tính toán mép cắt" },
      { key: "sensorSignalCutting", label: "Tín hiệu cảm biến cắt" },
      { key: "sensorSignalSplicing", label: "Tín hiệu cảm biến nối" }
    ]
  }
];

// ==========================================
// CẤU HÌNH RECIPE CHO MÁY 1 (CV-01)
// ==========================================
const recipeCV01 = [
  { key: "widthOfInputMaterial", label: "Chiều rộng dải mảnh" },
  { key: "widthOfStrip", label: "Chiều rộng vật liệu đầu vào" },
  { key: "angle", label: "Độ dày vật liệu" },
  { key: "fullMaterialCoilDiameterInLetOff", label: "Đường kính đầy của cuộn xả liệu" },
  { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
  { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu và ra liệu" },
  { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
  { key: "autoSpeedSplicingDevice", label: "Tốc độ tự động cơ cấu nối" },
  { key: "feedingConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng bù chức năng cấp liệu" },
  { key: "feedingConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù chức năng ra liệu" },
  { key: "takeoffConveyerDistanceFromSensorToSplicingPlace", label: "Chiều dài cuộn thu" },
  { key: "takeoffConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc của băng tải ra liệu" }
];

// ==========================================
// CẤU HÌNH RECIPE CHO MÁY 2 & 3 (CV-02/03)
// ==========================================
const recipeCV02_03 = [
  { key: "widthOfInputMaterial", label: "Chiều rộng vật liệu đầu vào" },
  { key: "widthOfStrip", label: "Chiều rộng dải mảnh" },
  { key: "angle", label: "Góc cắt (hoặc Góc)" },
  { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
  { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
  { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
  { key: "autoSpeedSplicingDevice", label: "Tốc độ tự động cơ cấu nối" },
  { key: "feedingConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách từ cảm biến đến vị trí nối của băng tải cấp liệu" },
  { key: "feedingConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc của băng tải cấp liệu" },
  { key: "takeoffConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách từ cảm biến đến vị trí nối của băng tải ra liệu" },
  { key: "takeoffConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc của băng tải ra liệu" },
  { key: "pulley1BasicPositionSetting", label: "Vị trí gốc puly 1" },
  { key: "pulley1EndPositionSetting", label: "Vị trí cuối puly 1" },
  { key: "pulley2BasicPositionSetting", label: "Vị trí gốc puly 2" },
  { key: "pulley2EndPositionSetting", label: "Vị trí cuối puly 2" },
  { key: "materialLenghtInWindUp", label: "Chiều dài vật liệu trên cuộn thu" },
  { key: "fullMaterialCoilDiameterInLetOff", label: "Đường kính đầy của cuộn xả liệu" },
  { key: "thicknessOfInputMaterial", label: "Độ dày vật liệu đầu vào" }
];

// ==========================================
// CẤU HÌNH SETTING CHO MÁY 1 (CV-01)
// ==========================================
const settingGroupsCV01 = [
  {
    title: "1. Kích thước & Góc",
    accent: "#0284c7",
    fields: [
      { key: "widthOfInputMaterial", label: "Chiều rộng dải mảnh" },
      { key: "widthOfStrip", label: "Chiều rộng vật liệu đầu vào" },
      { key: "thicknessOfMaterial", label: "Độ dày vật liệu" },
      { key: "requiredAngle", label: "Góc yêu cầu" }
    ]
  },
  {
    title: "2. Cấp liệu & Dao xén",
    accent: "#16a34a",
    fields: [
      { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
      { key: "distanceSensorSplicingFeeding", label: "Khoảng cách cảm biến đến vị trí nối (Cấp liệu)" },
      { key: "offsetForSlowdownFeeding", label: "Khoảng bù giảm tốc cấp liệu" },
      { key: "trimmingKnivesTemperature", label: "Nhiệt độ dao xén biên" }
    ]
  },
  {
    title: "3. Ra liệu & Cuộn thu",
    accent: "#ea580c",
    fields: [
      { key: "windUpLenght", label: "Chiều dài cuộn thu" },
      { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
      { key: "distanceSensorSplicingTakeoff", label: "Khoảng cách cảm biến đến vị trí nối (Ra liệu)" },
      { key: "offsetForSlowdownTakeOff", label: "Khoảng bù giảm tốc ra liệu" },
      { key: "windUpEmptyDiameterNarrowCoil", label: "Đường kính lõi cuộn thu hẹp" }
    ]
  },
  {
    title: "4. Cơ cấu cấp & Tốc độ nối",
    accent: "#7c3aed",
    fields: [
      { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
      { key: "autoSpeedSplicingDeviceFw", label: "Tốc độ tự động cơ cấu nối (tiến)" },
      { key: "autoSpeedSplicingDeviceBw", label: "Tốc độ tự động cơ cấu nối (lùi)" }
    ]
  },
  {
    title: "5. Thời gian trễ & Chu kỳ máy",
    accent: "#db2777",
    fields: [
      { key: "serviceModeJogTime", label: "Thời gian chạy nhích chế độ bảo trì" },
      { key: "delayConveyerDownAfterCut", label: "Thời gian hạ băng tải sau khi cắt" },
      { key: "timeForLightingOfSplicingWorkplace", label: "Thời gian bật đèn vị trí nối" },
      { key: "delayStartConveyerAfterBrushes", label: "Thời gian khởi động băng tải sau chổi làm sạch" },
      { key: "heatingOnIfPt100IsNotUse", label: "Bật gia nhiệt khi không dùng PT100" },
      { key: "trimmingHeatingTimeForPwm", label: "Thời gian nhiệt khi dùng PWM" }
    ]
  },
  {
    title: "6. Động cơ & Tăng/Giảm tốc",
    accent: "#10b981",
    fields: [
      { key: "accelerationSplicingDevice", label: "Thời gian tăng tốc cơ cấu nối" },
      { key: "decelerationSplicingDevice", label: "Thời gian giảm tốc cơ cấu nối" },
      { key: "manualSpeedSplicingDevice", label: "Tốc độ bằng tay cơ cấu nối" },
      { key: "accelerationPositioningConveyers", label: "Thời gian tăng tốc băng tải định vị" },
      { key: "decelerationPositioningConveyers", label: "Thời gian giảm tốc băng tải định vị" },
      { key: "manualSpeedPositioningConveyers", label: "Tốc độ bằng tay băng tải định vị" },
      { key: "slowAutoSpeedPositioningConveyers", label: "Tốc độ tự động chậm băng tải định vị" },
      { key: "accelerationFeedingDevice", label: "Thời gian tăng tốc cơ cấu cấp liệu" },
      { key: "decelerationFeedingDevice", label: "Thời gian giảm tốc cơ cấu cấp liệu" },
      { key: "manualSpeedFeedingDevice", label: "Tốc độ bằng tay cơ cấu cấp liệu" },
      { key: "testConveyersSpeed", label: "Tốc độ kiểm tra băng tải" }
    ]
  },
  {
    title: "7. Cài đặt góc cắt & nối",
    accent: "#f59e0b",
    fields: [
      { key: "cuttingAngleSettingAutoFastSpeed", label: "Góc cắt - Tốc độ tự động nhanh" },
      { key: "cuttingAngleSettingAutoSlowSpeed", label: "Góc cắt - Tốc độ tự động chậm" },
      { key: "cuttingAngleSettingManualSpeed", label: "Góc cắt - Tốc độ bằng tay" },
      { key: "cuttingAngleSettingRetardation", label: "Góc cắt - Giảm tốc" },
      { key: "cuttingAngleSettingHysteresis", label: "Góc cắt - Độ trễ" },
      { key: "splicingAngleSettingAutoFastSpeed", label: "Góc nối - Tốc độ tự động nhanh" },
      { key: "splicingAngleSettingAutoSlowSpeed", label: "Góc nối - Tốc độ tự động chậm" },
      { key: "splicingAngleSettingManualSpeed", label: "Góc nối - Tốc độ bằng tay" },
      { key: "splicingAngleSettingRetardation", label: "Góc nối - Giảm tốc" },
      { key: "splicingAngleSettingHysteresis", label: "Góc nối - Độ trễ" }
    ]
  },
  {
    title: "8. Hệ thống Cuộn Xả & Cuộn Quấn",
    accent: "#ef4444",
    fields: [
      { key: "windUpManualSpeed", label: "Tốc độ bằng tay cuộn thu" },
      { key: "windUpLenghtOfPulse", label: "Chiều dài một xung cuộn thu" },
      { key: "windUpEmptyDiameter", label: "Đường kính cuộn thu rỗng" },
      { key: "windupAutomaticSpeed", label: "Tốc độ tự động cuộn thu" },
      { key: "letOffMaterialTension", label: "Lực căng vật liệu xả" },
      { key: "letOffMaterialMinTorque", label: "Momen xoắn nhỏ nhất cuộn xả vật liệu" },
      { key: "letOffMaterialMaxTorque", label: "Momen xoắn lớn nhất cuộn xả vật liệu" },
      { key: "letOffWrapTension", label: "Lực căng cuộn quấn" },
      { key: "letOffWrapMinTorque", label: "Momen xoắn nhỏ nhất cuộn quấn" },
      { key: "letOffWrapMaxTorque", label: "Momen xoắn lớn nhất cuộn quấn" },
      { key: "letOffMaterialFullCoil", label: "Đường kính đầy cuộn vật liệu" },
      { key: "letOffWrapEmptyCoil", label: "Đường kính rỗng cuộn quấn" },
      { key: "letOffWrapThickness", label: "Độ dày cuộn quấn" },
      { key: "letOffBeginOfMaterialSpeed", label: "Tốc độ bắt đầu của cuộn vật liệu" },
      { key: "letOffBeginOfWrapSpeed", label: "Lực bắt đầu của cuộn quấn" },
      { key: "letOffEndOfMaterialSpeed", label: "Tốc độ kết thúc của cuộn vật liệu" },
      { key: "letOffEndOfWrapSpeed", label: "Lực kết thúc của cuộn quấn" }
    ]
  },
  {
    title: "9. Bộ tính toán & Dao cắt phụ",
    accent: "#6366f1",
    fields: [
      { key: "angleCalculatorEdge", label: "Bộ tính góc - mép" },
      { key: "angleCalculatorWidth", label: "Bộ tính góc - chiều rộng" },
      { key: "edgeCalculatorWidth", label: "Bộ tính mép - chiều rộng" },
      { key: "edgeCalculatorAngle", label: "Bộ tính mép - góc" },
      { key: "pullRollManualSpeed", label: "Tốc độ tự động tay kéo" },
      { key: "pullRollAutoSpeed", label: "Tốc độ tự động tự kéo" },
      { key: "trimmingManualSpeed", label: "Tốc độ bằng tay dao xén biên" },
      { key: "trimmingAutoSpeed", label: "Tốc độ tự động dao xén biên" },
      { key: "trimmingDistanceFromSensor", label: "Khoảng cách cảm biến đến dao xén" },
      { key: "smoothingRollManualSpeed", label: "Tốc độ bằng tay lô làm phẳng" },
      { key: "edgingConveyerManualSpeed", label: "Tốc độ bằng tay băng tải ép biên" },
      { key: "edgingConveyerAutoSpeed", label: "Tốc độ tự động băng tải ép biên" },
      { key: "edgingBrushesSpeed", label: "Tốc độ chổi ép biên" }
    ]
  },
  {
    title: "10. Lô cắt & Băng chứa dải mảnh",
    accent: "#8b5cf6",
    fields: [
      { key: "stripMagazineManualSpeed", label: "Tốc độ bằng tay băng chứa dải mảnh" },
      { key: "cuttingRollManualSpeed", label: "Tốc độ bằng tay lô cắt" },
      { key: "stripMagazineSpeedFactorNegativeEdge", label: "Hệ số tốc độ băng chứa - mép âm" },
      { key: "stripMagazineSpeedFactorPositiveEdge", label: "Hệ số tốc độ băng chứa - mép dương" },
      { key: "cuttingRollSpeedFactorNegativeEdge", label: "Hệ số tốc độ lô cắt - mép âm" },
      { key: "cuttingRollSpeedFactorPositiveEdge", label: "Hệ số tốc độ lô cắt - mép dương" }
    ]
  },
  {
    title: "11. Điều khiển Puly",
    accent: "#ec4899",
    fields: [
      { key: "pulleysCalculationsStripOverlap", label: "Tính toán puly - độ chồng dải mảnh" },
      { key: "pulleysCalculationsMiddleOffset", label: "Tính toán puly - độ lệch tâm" },
      { key: "pulleysCalculationsDistance", label: "Tính toán puly - khoảng cách" },
      { key: "safetyDistanceBetweenPulleys", label: "Khoảng cách an toàn giữa các puly" }
    ]
  },
  {
    title: "12. Tốc độ rung & Tỷ lệ động cơ",
    accent: "#3b82f6",
    fields: [
      { key: "speedOfBeltVibration", label: "Tốc độ rung băng tải" },
      { key: "switchOffBeltVibration", label: "Ngừng rung băng tải" },
      { key: "autoSpeedFeedingDeviceBw", label: "Tốc độ tự động cơ cấu cấp liệu (lùi)" },
      { key: "feedingDeviceEndPosition", label: "Vị trí cuối cơ cấu cấp liệu" },
      { key: "feedingDeviceBasicPosition", label: "Vị trí gốc cơ cấu cấp liệu" },
      { key: "shearConveyerPrepositioningSpeed", label: "Tốc độ định vị trước băng tải cắt" },
      { key: "offsetDistanceForPrepositioning", label: "Khoảng bù định vị trước" },
      { key: "speedRatioFeedingShearConveyer", label: "Tỷ lệ tốc độ cấp liệu/băng tải dao" },
      { key: "speedRatioSplicingFeedingConveyer", label: "Tỷ lệ tốc độ nối/băng tải cấp liệu" },
      { key: "speedRatioTakeoffSplicingConveyer", label: "Tỷ lệ tốc độ ra liệu/cơ cấu nối" },
      { key: "speedForSwitchOnFastWrapWindUp", label: "Tốc độ chuyển sang quấn cuộn thu nhanh" },
      { key: "windUpTravelFastSpeed", label: "Tốc độ di chuyển nhanh cuộn thu" },
      { key: "windUpTravelSlowSpeed", label: "Tốc độ di chuyển chậm cuộn thu" },
      { key: "cuttingAngleForCalibration", label: "Góc cắt hiệu chuẩn" },
      { key: "splicingAngleForCalibration", label: "Góc nối hiệu chuẩn" },
      { key: "wrapWindUpMinSpeed", label: "Tốc độ nhỏ nhất cuộn thu dây quấn" },
      { key: "wrapWindUpMaxSpeed", label: "Tốc độ lớn nhất cuộn thu dây quấn" }
    ]
  }
];

// ==========================================
// CẤU HÌNH SETTING CHO MÁY 2 & 3 (CV-02/03)
// ==========================================
const settingGroupsCV02_03 = [
  {
    title: "1. Kích thước & Góc cài đặt",
    accent: "#0284c7",
    fields: [
      { key: "widthOfStrip", label: "Chiều rộng dải mảnh" },
      { key: "widthOfInputMaterial", label: "Chiều rộng vật liệu đầu vào" },
      { key: "thicknessOfMaterial", label: "Độ dày vật liệu" },
      { key: "requiredAngle", label: "Góc yêu cầu" },
      { key: "cutAngle", label: "Góc cắt" },
      { key: "splicingAngle", label: "Góc nối" }
    ]
  },
  {
    title: "2. Cấp liệu & Cảm biến",
    accent: "#16a34a",
    fields: [
      { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
      { key: "distanceSensorSplicingFeeding", label: "Khoảng cách từ cảm biến đến vị trí nối phía cấp liệu" },
      { key: "offsetForSlowdownFeeding", label: "Khoảng bù giảm tốc cấp liệu" }
    ]
  },
  {
    title: "3. Ra liệu & Cuộn thu",
    accent: "#ea580c",
    fields: [
      { key: "windUpLenght", label: "Chiều dài cuộn thu" },
      { key: "actualLength", label: "Chiều dài thực tế" }
    ]
  },
  {
    title: "4. Nhiệt độ Dao xén",
    accent: "#7c3aed",
    fields: [
      { key: "trimmingKnivesTemperature", label: "Nhiệt độ dao xén biên" }
    ]
  },
  {
    title: "5. Băng tải ra liệu & Tốc độ chậm",
    accent: "#db2777",
    fields: [
      { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
      { key: "distanceSensorSplicingTakeoff", label: "Khoảng cách từ cảm biến đến vị trí nối phía ra liệu" },
      { key: "offsetForSlowdownTakeOff", label: "Khoảng bù giảm tốc ra liệu" }
    ]
  },
  {
    title: "6. Tốc độ cấp liệu & Cơ cấu nối",
    accent: "#10b981",
    fields: [
      { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
      { key: "autoSpeedSplicingDeviceFw", label: "Tốc độ tự động cơ cấu nối (tiến)" },
      { key: "autoSpeedSplicingDeviceBw", label: "Tốc độ tự động cơ cấu nối (lùi)" }
    ]
  },
  {
    title: "7. Thời gian trễ & Chu kỳ máy",
    accent: "#f59e0b",
    fields: [
      { key: "serviceModeJogTime", label: "Thời gian chạy nhích chế độ bảo trì" },
      { key: "delayConveyerDownAfterCut", label: "Thời gian hạ băng tải sau khi cắt" },
      { key: "timeForLightingOfSplicingWorkplace", label: "Thời gian bật đèn vị trí nối" },
      { key: "delayStartConveyerAfterBrushes", label: "Thời gian khởi động băng tải sau chổi làm sạch" },
      { key: "heatingOnIfPt100IsNotUse", label: "Bật gia nhiệt khi không sử dụng cảm biến PT100" },
      { key: "trimmingHeatingTimeForPwm", label: "Thời gian nhiệt khi dùng cảm biến PWM" }
    ]
  },
  {
    title: "8. Động cơ & Tăng/Giảm tốc",
    accent: "#ef4444",
    fields: [
      { key: "accelerationSplicingDevice", label: "Thời gian tăng tốc cơ cấu nối" },
      { key: "decelerationSplicingDevice", label: "Thời gian giảm tốc cơ cấu nối" },
      { key: "manualSpeedSplicingDevice", label: "Tốc độ bằng tay cơ cấu nối" },
      { key: "accelerationPositioningConveyers", label: "Thời gian tăng tốc băng tải định vị" },
      { key: "decelerationPositioningConveyers", label: "Thời gian giảm tốc băng tải định vị" },
      { key: "manualSpeedPositioningConveyers", label: "Tốc độ bằng tay băng tải định vị" },
      { key: "slowAutoSpeedPositioningConveyers", label: "Tốc độ tự động chậm băng tải định vị" },
      { key: "accelerationFeedingDevice", label: "Thời gian tăng tốc cơ cấu cấp liệu" },
      { key: "decelerationFeedingDevice", label: "Thời gian giảm tốc cơ cấu cấp liệu" },
      { key: "manualSpeedFeedingDevice", label: "Tốc độ bằng tay cơ cấu cấp liệu" },
      { key: "testConveyersSpeed", label: "Tốc độ kiểm tra băng tải" }
    ]
  },
  {
    title: "9. Cài đặt góc cắt & nối",
    accent: "#6366f1",
    fields: [
      { key: "cuttingAngleSettingAutoFastSpeed", label: "Cài đặt góc cắt - tốc độ tự động nhanh" },
      { key: "cuttingAngleSettingAutoSlowSpeed", label: "Cài đặt góc cắt - tốc độ tự động chậm" },
      { key: "cuttingAngleSettingManualSpeed", label: "Cài đặt góc cắt - tốc độ bằng tay" },
      { key: "cuttingAngleSettingRetardation", label: "Cài đặt góc cắt - giảm tốc" },
      { key: "cuttingAngleSettingHysteresis", label: "Cài đặt góc cắt - độ trễ" },
      { key: "splicingAngleSettingAutoFastSpeed", label: "Cài đặt góc nối - tốc độ tự động nhanh" },
      { key: "splicingAngleSettingAutoSlowSpeed", label: "Cài đặt góc nối - tốc độ tự động chậm" },
      { key: "splicingAngleSettingManualSpeed", label: "Cài đặt góc nối - tốc độ bằng tay" },
      { key: "splicingAngleSettingRetardation", label: "Cài đặt góc nối - giảm tốc" },
      { key: "splicingAngleSettingHysteresis", label: "Cài đặt góc nối - độ trễ" },
      { key: "windUpManualSpeed", label: "Tốc độ bằng tay cuộn thu" },
      { key: "windUpLenghtOfPulse", label: "Chiều dài một xung cuộn thu" },
      { key: "windUpEmptyDiameter", label: "Đường kính cuộn thu rỗng" }
    ]
  },
  {
    title: "10. Hệ thống Cuộn Xả & Cuộn Quấn",
    accent: "#8b5cf6",
    fields: [
      { key: "windupAutomaticSpeed", label: "Tốc độ tự động cuộn thu" },
      { key: "letOffMaterialTension", label: "Lực căng vật liệu xả" },
      { key: "letOffMaterialMinTorque", label: "Momen xoắn nhỏ nhất cuộn xả vật liệu" },
      { key: "letOffMaterialMaxTorque", label: "Momen xoắn lớn nhất cuộn xả vật liệu" },
      { key: "letOffWrapTension", label: "Lực căng cuộn quấn" },
      { key: "letOffWrapMinTorque", label: "Momen xoắn nhỏ nhất cuộn quấn" },
      { key: "letOffWrapMaxTorque", label: "Momen xoắn lớn nhất cuộn quấn" },
      { key: "letOffMaterialFullCoil", label: "Đường kính đầy cuộn vật liệu" },
      { key: "letOffWrapEmptyCoil", label: "Đường kính rỗng cuộn quấn" },
      { key: "letOffWrapThickness", label: "Độ dày cuộn quấn" },
      { key: "letOffBeginOfMaterialSpeed", label: "Tốc độ bắt đầu của cuộn vật liệu" },
      { key: "letOffBeginOfWrapSpeed", label: "Lực bắt đầu của cuộn quấn" },
      { key: "letOffEndOfMaterialSpeed", label: "Tốc độ kết thúc của cuộn vật liệu" },
      { key: "letOffEndOfWrapSpeed", label: "Lực kết thúc của cuộn quấn" }
    ]
  },
  {
    title: "11. Bộ tính toán & Kéo xén",
    accent: "#ec4899",
    fields: [
      { key: "angleCalculatorEdge", label: "Giá trị tính toán góc" },
      { key: "angleCalculatorWidth", label: "Bộ tính góc - chiều rộng" },
      { key: "edgeCalculatorWidth", label: "Bộ tính mép - chiều rộng" },
      { key: "edgeCalculatorAngle", label: "Giá trị tính toán mép cắt" },
      { key: "pullRollManualSpeed", label: "Tốc độ tự động tay kéo" },
      { key: "pullRollAutoSpeed", label: "Tốc độ tự động tự kéo" },
      { key: "trimmingManualSpeed", label: "Tốc độ bằng tay dao xén biên" },
      { key: "trimmingAutoSpeed", label: "Tốc độ tự động dao xén biên" },
      { key: "trimmingDistanceFromSensor", label: "Khoảng cách từ cảm biến đến dao xén biên" },
      { key: "smoothingRollManualSpeed", label: "Tốc độ bằng tay lô làm phẳng" },
      { key: "edgingConveyerManualSpeed", label: "Tốc độ bằng tay băng tải ép biên" },
      { key: "edgingConveyerAutoSpeed", label: "Tốc độ tự động băng tải ép biên" },
      { key: "edgingBrushesSpeed", label: "Tốc độ chổi ép biên" }
    ]
  },
  {
    title: "12. Băng chứa dải mảnh & Lô cắt",
    accent: "#3b82f6",
    fields: [
      { key: "stripMagazineManualSpeed", label: "Tốc độ bằng tay băng chứa dải mảnh" },
      { key: "cuttingRollManualSpeed", label: "Tốc độ bằng tay lô cắt" },
      { key: "stripMagazineSpeedFactorNegativeEdge", label: "Hệ số tốc độ băng chứa - mép âm" },
      { key: "stripMagazineSpeedFactorPositiveEdge", label: "Hệ số tốc độ băng chứa - mép dương" },
      { key: "cuttingRollSpeedFactorNegativeEdge", label: "Hệ số tốc độ lô cắt - mép âm" },
      { key: "cuttingRollSpeedFactorPositiveEdge", label: "Hệ số tốc độ lô cắt - mép dương" }
    ]
  },
  {
    title: "13. Điều khiển Puly",
    accent: "#14b8a6",
    fields: [
      { key: "pulleysCalculationsStripOverlap", label: "Tính toán puly - độ chồng dải mảnh" },
      { key: "pulleysCalculationsMiddleOffset", label: "Tính toán puly - độ lệch tâm" },
      { key: "pulleysCalculationsDistance", label: "Tính toán puly - khoảng cách" },
      { key: "safetyDistanceBetweenPulleys", label: "Khoảng cách an toàn giữa các puly" }
    ]
  },
  {
    title: "14. Rung băng & Tỷ lệ động cơ",
    accent: "#f97316",
    fields: [
      { key: "speedOfBeltVibration", label: "Tốc độ rung băng tải" },
      { key: "switchOffBeltVibration", label: "Ngừng rung băng tải" },
      { key: "autoSpeedFeedingDeviceBw", label: "Tốc độ tự động cơ cấu cấp liệu (lùi)" },
      { key: "feedingDeviceEndPosition", label: "Vị trí cuối cơ cấu cấp liệu" },
      { key: "feedingDeviceBasicPosition", label: "Vị trí gốc cơ cấu cấp liệu" },
      { key: "shearConveyerPrepositioningSpeed", label: "Tốc độ định vị trước của băng tải dao cắt" },
      { key: "offsetDistanceForPrepositioning", label: "Khoảng bù định vị trước" },
      { key: "speedRatioFeedingShearConveyer", label: "Tỷ lệ tốc độ băng tải cấp liệu/băng tải dao cắt" },
      { key: "speedRatioSplicingFeedingConveyer", label: "Tỷ lệ tốc độ cơ cấu nối/băng tải cấp liệu" },
      { key: "speedRatioTakeoffSplicingConveyer", label: "Tỷ lệ tốc độ băng tải ra liệu/cơ cấu nối" },
      { key: "speedForSwitchOnFastWrapWindUp", label: "Tốc độ chuyển sang quấn cuộn thu nhanh" },
      { key: "windUpTravelFastSpeed", label: "Tốc độ di chuyển nhanh của cuộn thu" },
      { key: "windUpTravelSlowSpeed", label: "Tốc độ di chuyển chậm của cuộn thu" },
      { key: "cuttingAngleForCalibration", label: "Góc cắt hiệu chuẩn" },
      { key: "splicingAngleForCalibration", label: "Góc nối hiệu chuẩn" },
      { key: "wrapWindUpMinSpeed", label: "Tốc độ nhỏ nhất cuộn thu dây quấn" },
      { key: "wrapWindUpMaxSpeed", label: "Tốc độ lớn nhất cuộn thu dây quấn" }
    ]
  }
];

// ==========================================
// CẤU HÌNH BIỂU ĐỒ & HẰNG SỐ MÁY CẮT VẢI
// ==========================================
const SHIFT_DURATION_SEC = 8 * 3600; // 8 tiếng
const IDLE_META = { name: 'Thời gian trống', fill: '#f1f5f9', ink: '#475569', short: 'Trống' };
const tooltipStyle = {
  fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, border: '1px solid #96afc8', borderRadius: 2,
  // Nền đục + đổ bóng để chữ luôn đọc được khi tooltip nằm chồng lên biểu đồ phía dưới
  background: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.28)'
};

// Recharts đặt z-index ở lớp BỌC NGOÀI tooltip (wrapperStyle), không phải contentStyle.
// Thiếu nó thì tooltip bị các phần tử có z-index/position khác trong trang che mất.
// Dùng chung cho mọi <Tooltip> để tooltip luôn nổi trên cùng.
const tooltipWrapperStyle = { zIndex: 9999, outline: 'none' };

// Phân tích trạng thái SCADA (Bảo đảm logic màu đồng nhất)
const getStatusMeta = (statusNum, statusName) => {
  const nameLower = String(statusName || '').toLowerCase();
  let name = statusName || `Trạng thái ${statusNum}`;
  let fill = '#94a3b8'; // xám
  let ink = '#ffffff';
  let short = 'Dừng';

  if (statusNum === 0) {
    name = 'Không xác định'; fill = '#fff2cc'; ink = '#7c2d12'; short = 'KXD';
  } else if (statusNum === 1 || nameLower.includes('chạy') || nameLower.includes('run')) {
    name = 'Máy chạy'; fill = '#00b050'; ink = '#ffffff'; short = 'Chạy';
  } else if (statusNum === 2) {
    name = 'Máy dừng'; fill = '#ffff00'; ink = '#1e293b'; short = 'Dừng';
  } else if (statusNum === 3) {
    name = 'Máy lỗi'; fill = '#ff0000'; ink = '#ffffff'; short = 'Lỗi';
  } else if (statusNum === 4 || nameLower.includes('mất kết nối') || nameLower.includes('mất kn')) {
    name = 'Mất kết nối PLC'; fill = '#ffc000'; ink = '#1e293b'; short = 'Mất KN';
  } else if (statusNum === 6) {
    name = 'Không có kế hoạch'; fill = '#b4c6e7'; ink = '#1e3a8a'; short = 'Ko KH';
  } else if (statusNum === 7 || nameLower.includes('app tắt') || nameLower.includes('app server')) {
    name = 'App Server tắt'; fill = '#c55a11'; ink = '#ffffff'; short = 'App tắt';
  } else if (statusNum === 8 || nameLower.includes('máy chủ tắt')) {
    name = 'Máy chủ tắt'; fill = '#833c0c'; ink = '#ffffff'; short = 'MC tắt';
  }

  // Khớp màu đối với dữ liệu nhận được từ API/mock
  if (nameLower.includes('chạy')) {
    fill = '#00b050'; ink = '#ffffff'; short = 'Chạy';
  } else if (nameLower.includes('mất kết nối') || nameLower.includes('mất kn')) {
    fill = '#ffc000'; ink = '#1e293b'; short = 'Mất KN';
  } else if (nameLower.includes('app tắt') || nameLower.includes('app server')) {
    fill = '#c55a11'; ink = '#ffffff'; short = 'App tắt';
  } else if (nameLower.includes('máy chủ tắt')) {
    fill = '#833c0c'; ink = '#ffffff'; short = 'MC tắt';
  }

  return { name, fill, ink, short };
};

const getUptimeColor = (pct) => {
  if (pct >= 85) return '#00b050';
  if (pct >= 60) return '#eab308';
  return '#ef4444';
};

const getProgressColor = (percent) => {
  const p = Number(percent) || 0;
  if (p > 100) return '#15803d'; // Vượt 100%: Xanh lá cây đậm
  return '#22c55e';              // Màu Xanh lá cây tươi chuẩn
};

const getTablePercentColor = (percent) => {
  const p = Number(percent) || 0;
  if (p < 20) return '#ef4444';   // Đỏ (<20%)
  if (p < 40) return '#f97316';   // Cam (<40%)
  if (p < 60) return '#fb923c';   // Cam nhạt (<60%)
  if (p < 80) return '#60a5fa';   // Xanh nhạt (<80%)
  if (p < 95) return '#2563eb';   // 80-95%: Màu đậm hơn chút (xanh dương trung bình)
  if (p <= 100) return '#1565C0'; // 95-100%: = màu kế hoạch (#1565C0)
  return '#1e3a8a';               // >100%: Xanh đậm hơn màu KH (#1e3a8a)
};

const getDailyPlanChartColor = (pct) => {
  if (pct >= 100) return '#00b050';
  if (pct >= 80) return '#3b82f6';
  if (pct >= 50) return '#f97316';
  return '#ef4444';
};

// Định dạng giờ phút
const formatClock = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return '--:--';
  const h = String(dateObj.getHours()).padStart(2, '0');
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// Định dạng Date -> 'YYYY-MM-DD' theo giờ máy trạm.
// Không dùng toISOString() vì nó quy về UTC, giờ VN (UTC+7) sẽ bị lùi 1 ngày trong khoảng 00:00-06:59.
const toDateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Định dạng thời lượng
const formatDuration = (totalSec) => {
  if (totalSec <= 0) return '0s';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
const MayCatVaiDashboard = () => {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận dữ liệu truyền từ trang danh sách máy (MayThanhHinhList)
  const locationState = location.state;
  const passedMaQuyCach = locationState?.maQuyCach || locationState?.machine?.MaQuyCach || locationState?.machine?.QCSX || '';
  const [realtimeMaQuyCach, setRealtimeMaQuyCach] = useState(passedMaQuyCach);

  // Tabs cấp cao nhất
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'chartData'
  // Tabs con của tab chartData (Thông số cũ)
  const [chartTab, setChartTab] = useState('realtime'); // 'realtime', 'recipe', 'setting'

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(2000);

  // Trạng thái mở popup lịch sử
  const [showRealtimeHistory, setShowRealtimeHistory] = useState(false);
  const [showRecipeHistory, setShowRecipeHistory] = useState(false);
  const [showSettingHistory, setShowSettingHistory] = useState(false);
  const [showChangeHistory, setShowChangeHistory] = useState(false);

  // States bộ lọc ca, ngày (mặc định lấy ca hiện tại)
  // Quy ước ngày sản xuất: Ca 3 (mã ca = 0) của ngày D chạy từ 22:00 ngày D-1 đến 06:00 ngày D.
  //  - Từ 22:00 đến 23:59 hôm nay  -> đang ở ca 3 của NGÀY MAI  (D + 1)
  //  - Từ 00:00 đến 05:59 hôm nay  -> vẫn là ca 3 của NGÀY HÔM NAY (D)
  const initialShift = React.useMemo(() => {
    const now = new Date();
    const hr = now.getHours();
    const target = new Date(now);
    let ca = '1';

    if (hr >= 6 && hr < 14) ca = '1';
    else if (hr >= 14 && hr < 22) ca = '2';
    else {
      ca = '0';
      if (hr >= 22) target.setDate(target.getDate() + 1);
    }

    const dateStr = toDateKey(target);
    // Log console hỗ trợ test lỗi (Quy tắc 3)
    console.log(`[MayCatVaiDashboard] Ca mặc định theo giờ hiện tại (${hr}h): ca=${ca}, ngày sản xuất=${dateStr}`);
    return { ca, dateStr };
  }, []);

  // Bộ lọc ĐÃ ÁP DỤNG - là thứ thực sự dùng để gọi API và vẽ giao diện
  const [selectedDate, setSelectedDate] = useState(initialShift.dateStr);
  const [selectedCa, setSelectedCa] = useState(initialShift.ca);

  // Bộ lọc NHÁP - giá trị người dùng đang chọn trên toolbar, chỉ áp dụng khi bấm nút "Xem dữ liệu".
  // Tách riêng để việc đổi ca/ngày không lập tức nạp lại dữ liệu (tránh gọi API liên tục khi đang chọn).
  const [draftDate, setDraftDate] = useState(initialShift.dateStr);
  const [draftCa, setDraftCa] = useState(initialShift.ca);

  // Cờ báo bộ lọc nháp đang khác bộ lọc đã áp dụng (dùng để làm nổi bật nút "Xem dữ liệu")
  const hasPendingFilter = draftDate !== selectedDate || draftCa !== selectedCa;

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Bộ đếm phiên tải dữ liệu. Mỗi lần đổi bộ lọc / bấm làm mới sẽ tăng lên 1.
  // Các hàm fetch chỉ ghi kết quả vào state khi phiên của chúng vẫn là phiên mới nhất,
  // nhờ đó response chậm của ca cũ không còn ghi đè lên dữ liệu của ca vừa chọn.
  const fetchSessionRef = React.useRef(0);

  // State phục vụ nút làm mới thủ công.
  // refreshToken tăng lên mỗi lần bấm làm mới khi bộ lọc không đổi, dùng để kích hoạt lại effect tải dữ liệu.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const [machineImage, setMachineImage] = useState(null);

  // Dữ liệu thật từ API cho máy cắt vải
  const [machineStatusTimes, setMachineStatusTimes] = useState([]);
  const [machineStatusMonth, setMachineStatusMonth] = useState([]);

  // Dữ liệu thật về sản xuất tháng và ngày cho máy cắt vải
  // Dữ liệu thật về sản xuất tháng và ngày cho máy cắt vải (sử dụng API Cắt Vải theo máy)
  const [monthlyStatsTheoMay, setMonthlyStatsTheoMay] = useState(null);
  const [dailyPlanData, setDailyPlanData] = useState([]);

  // Dữ liệu BTP thật từ API /btp-theo-may
  const [btpData, setBtpData] = useState([]);
  const [btpLoading, setBtpLoading] = useState(false);

  // Tự động tải quy cách realtime từ API getMachinesWithStats nếu chưa có (ví dụ khi F5 trực tiếp trên URL)
  useEffect(() => {
    const fetchRealtimeMachineQC = async () => {
      try {
        console.log(`[MayCatVaiDashboard] Đang tải getMachinesWithStats để lấy QC Đang SX cho máy ${equipmentId}...`);
        const res = await getMachinesWithStats();
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        const found = list.find(m => {
          const mId = String(m.EquipmentID || m.MaMay || '').toUpperCase().trim();
          const curId = String(equipmentId || '').toUpperCase().trim();
          return mId === curId || mId.replace(/-/g, '') === curId.replace(/-/g, '') || mId.includes(curId) || curId.includes(mId);
        });
        if (found) {
          const qc = found.MaQuyCach || found.QCSX || found.TenQuyCach || '';
          console.log(`>>> [MayCatVaiDashboard Realtime QC] Tìm thấy thông tin máy realtime:`, found, `-> QC: '${qc}'`);
          if (qc) {
            setRealtimeMaQuyCach(qc);
          }
        }
      } catch (err) {
        console.error("[MayCatVaiDashboard] Lỗi tải getMachinesWithStats:", err);
      }
    };

    fetchRealtimeMachineQC();
  }, [equipmentId]);

  // Xác định cấu hình hiển thị parameter dựa trên máy
  const isCV01 = equipmentId && (equipmentId.endsWith('01') || equipmentId.includes('01') || equipmentId.includes('-1'));
  const currentGroupsConfig = isCV01 ? groupsCV01 : groupsCV02_03;
  const currentRecipeConfig = isCV01 ? recipeCV01 : recipeCV02_03;
  const currentSettingGroupsConfig = isCV01 ? settingGroupsCV01 : settingGroupsCV02_03;

  const flatRealtimeFields = currentGroupsConfig.reduce((acc, g) => [...acc, ...g.fields], []);
  const flatSettingFields = currentSettingGroupsConfig.reduce((acc, g) => [...acc, ...g.fields], []);

  // Tải ảnh máy (thử tải từ API, nếu không có sẽ render box mockup)
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const images = await getViewOrcThMachineImageApi();
        const currentMachineImage = images.find(img => img.maMay === equipmentId);
        if (currentMachineImage && currentMachineImage.image) {
          setMachineImage(`data:image/jpeg;base64,${currentMachineImage.image}`);
        }
      } catch (err) {
        console.error("Lỗi lấy ảnh máy cắt vải:", err);
      }
    };
    fetchImage();
  }, [equipmentId]);

  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-');
      if (y && m) {
        setSelectedYear(Number(y));
        setSelectedMonth(Number(m));
      }
    }
  }, [selectedDate]);

  // Helper render thông số
  const renderValue = (val, key) => {
    if (val === null || val === undefined) return '-';
    if (val === true || val === 1 || val === '1') return '1';
    if (val === false || val === 0 || val === '0') return '0';
    if (typeof val === 'string' && val.includes('T') && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      return val.replace('T', ' ');
    }
    return String(val);
  };

  // Tải dữ liệu API thông số (Tab 2)
  const fetchData = useCallback(async () => {
    if (activeTab !== 'chartData') return;
    setLoading(true);
    try {
      let data = [];
      const params = { maMay: equipmentId };
      if (chartTab === 'realtime') {
        data = await getChartRealTimeORCV(params);
      } else if (chartTab === 'recipe') {
        data = await getChartRecipeORCV(params);
      } else if (chartTab === 'setting') {
        data = await getChartSettingORCV(params);
      }

      let filtered = data.filter(item =>
        item.maMay && item.maMay.trim().toUpperCase() === equipmentId.trim().toUpperCase()
      );
      setDataList(filtered);
    } catch (error) {
      console.error(error);
      toast.error(`Lỗi khi tải dữ liệu ${chartTab}`);
    } finally {
      setLoading(false);
    }
  }, [chartTab, equipmentId, activeTab]);

  const fetchDataBackground = useCallback(async () => {
    if (activeTab !== 'chartData') return;
    try {
      let data = [];
      const params = { maMay: equipmentId };
      if (chartTab === 'realtime') {
        data = await getChartRealTimeORCV(params);
      } else if (chartTab === 'recipe') {
        data = await getChartRecipeORCV(params);
      } else if (chartTab === 'setting') {
        data = await getChartSettingORCV(params);
      }

      let filtered = data.filter(item =>
        item.maMay && item.maMay.trim().toUpperCase() === equipmentId.trim().toUpperCase()
      );
      setDataList(filtered);
    } catch (error) {
      console.error("Lỗi cập nhật nền tự động:", error);
    }
  }, [chartTab, equipmentId, activeTab]);

  useEffect(() => {
    fetchData();

    if (activeTab === 'chartData' && chartTab === 'realtime' && refreshInterval > 0) {
      // Chỉ tự động làm mới khi bộ lọc ca/ngày đang ở CA HIỆN TẠI; xem ca lịch sử thì TẮT polling.
      if (!isCurrentShiftSelected(selectedDate, selectedCa)) {
        const current = getCurrentShift();
        console.log(`[MayCatVaiDashboard] Tab thông số: đang xem ca lịch sử (Ca: ${selectedCa}, Ngày: ${selectedDate} | Ca hiện tại: ${current.ca}, Ngày: ${current.dateStr}). TẮT tự động làm mới ngầm.`);
        return;
      }

      console.log(`[MayCatVaiDashboard] Tab thông số: đang ở ca hiện tại. BẬT tự động làm mới ngầm mỗi ${refreshInterval}ms.`);
      const timer = setInterval(() => {
        fetchDataBackground();
      }, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [chartTab, equipmentId, refreshInterval, fetchData, fetchDataBackground, activeTab, selectedDate, selectedCa]);

  const latestRecord = dataList.length > 0 ? dataList[0] : null;

  // ============================================================================
  // GỌI CÁC API TRẠNG THÁI & SẢN LƯỢNG KẾ HOẠCH THẬT CHO MÁY CẮT VẢI
  // ============================================================================

  const fetchMachineStatusTimes = async (session = fetchSessionRef.current) => {
    if (!equipmentId || !selectedDate || selectedCa === '') return;
    try {
      const yearMonthDayShift = selectedDate.replace(/-/g, '') + selectedCa;
      console.log(`[MayCatVaiDashboard] fetchMachineStatusTimes -> Gửi request: maMay=${equipmentId}, shift=${yearMonthDayShift}`);
      const res = await getMachineStatusTimes({
        maMay: equipmentId,
        yearMonthDayShift: yearMonthDayShift
      });

      // Bỏ qua kết quả của phiên cũ: người dùng đã đổi sang ca/ngày khác trong lúc chờ response
      if (session !== fetchSessionRef.current) {
        console.log(`[MayCatVaiDashboard] fetchMachineStatusTimes -> BỎ QUA kết quả cũ của ca ${yearMonthDayShift} (phiên ${session} đã lỗi thời, phiên hiện tại ${fetchSessionRef.current}).`);
        return;
      }

      console.log("[MayCatVaiDashboard] fetchMachineStatusTimes -> Dữ liệu nhận từ API:", res);
      setMachineStatusTimes(prev => {
        const newData = res || [];
        if (JSON.stringify(prev) === JSON.stringify(newData)) {
          return prev;
        }
        return newData;
      });
    } catch (error) {
      console.error("[MayCatVaiDashboard] fetchMachineStatusTimes -> Lỗi:", error);
    }
  };

  const fetchMonthlyDashboardData = async (session = fetchSessionRef.current) => {
    if (!equipmentId || !selectedYear || !selectedMonth) return;
    try {
      // Lấy năm/tháng TRỰC TIẾP từ ngày đang lọc. State selectedYear/selectedMonth được
      // cập nhật qua useEffect nên luôn chậm một nhịp so với selectedDate; dùng chúng ở đây
      // sẽ khiến lượt tải ngay sau khi đổi bộ lọc lấy nhầm dữ liệu của tháng trước đó.
      const [ngayNam, ngayThang] = String(selectedDate).split('-');
      const nam = Number(ngayNam);
      const thang = Number(ngayThang);
      if (!nam || !thang) {
        console.warn("[MayCatVaiDashboard] selectedDate không hợp lệ, bỏ qua lượt tải:", selectedDate);
        return;
      }

      const yearMonth = `${nam}${String(thang).padStart(2, '0')}`;

      // Trích xuất chữ số ở cuối maMay (ví dụ 'orc_cv_01' -> '01') chỉ dành cho 2 API mới theo yêu cầu của user
      const shortMaMay = equipmentId.match(/\d+$/)?.[0] || equipmentId;

      // Biểu đồ theo ngày luôn bắt đầu từ NGÀY 01 CỦA CHÍNH THÁNG ĐANG LỌC.
      // Nếu đang lọc tháng hiện tại thì dừng ở ca/ngày đang lọc (ca sau chưa xảy ra);
      // nếu lọc tháng khác thì lấy TRỌN CẢ THÁNG đó.
      const chartRange = getChartShiftRange(selectedDate, selectedCa);
      const chartStartShift = chartRange?.startShift ?? null;
      const chartEndShift = chartRange?.endShift ?? null;

      console.log(`[MayCatVaiDashboard] fetchMonthlyDashboardData -> Gửi request: maMay=${equipmentId}, shortMaMay=${shortMaMay}, yearMonth=${yearMonth}`);

      // Gọi các API: thống kê tháng theo máy, thống kê ca trong tháng (cho biểu đồ 3 cột Cắt vải) và trạng thái SCADA của tháng
      const [monthlyStatsSet, dailyStatsSet, monthStatusSet] = await Promise.allSettled([
        getMonthlyStatsTheoMay(nam, thang, shortMaMay),
        getShiftStatsForMonthCatVai({ nam_sx: nam, thang_sx: thang, maMay: equipmentId }),
        getMachineStatusTimesByMonth({ maMay: equipmentId, yearMonth })
      ]);

      // Log console hỗ trợ test lỗi: API nào hỏng, API nào chạy được (Quy tắc 3)
      console.log('[MayCatVaiDashboard] Kết quả 3 API tháng (đã cập nhật API getShiftStatsForMonthCatVai Cắt vải):', {
        monthlyStatsTheoMay: monthlyStatsSet.status,
        shiftStatsForMonthCatVai: dailyStatsSet.status,
        machineStatusMonth: monthStatusSet.status
      });
      [
        ['getMonthlyStatsTheoMay', monthlyStatsSet],
        ['getShiftStatsForMonthCatVai', dailyStatsSet],
        ['getMachineStatusTimesByMonth', monthStatusSet]
      ].forEach(([ten, kq]) => {
        if (kq.status === 'rejected') console.error(`[MayCatVaiDashboard] API ${ten} lỗi:`, kq.reason);
      });

      // Bỏ qua kết quả của phiên cũ: người dùng đã đổi sang tháng/ca khác trong lúc chờ response
      if (session !== fetchSessionRef.current) {
        console.log(`[MayCatVaiDashboard] fetchMonthlyDashboardData -> BỎ QUA kết quả cũ của tháng ${yearMonth} (phiên ${session} đã lỗi thời, phiên hiện tại ${fetchSessionRef.current}).`);
        return;
      }

      const monthlyRes = monthlyStatsSet.status === 'fulfilled' ? monthlyStatsSet.value : null;
      const dailyRes = dailyStatsSet.status === 'fulfilled' ? dailyStatsSet.value : null;
      const monthStatusRes = monthStatusSet.status === 'fulfilled' ? monthStatusSet.value : null;

      if (Array.isArray(monthStatusRes)) {
        setMachineStatusMonth(monthStatusRes);
      } else {
        setMachineStatusMonth([]);
      }

      // Xử lý dữ liệu monthly-stats-theo-may
      if (monthlyRes && monthlyRes.success && Array.isArray(monthlyRes.data) && monthlyRes.data.length > 0) {
        console.log(">>> [MayCatVaiDashboard] Dữ liệu monthly-stats-theo-may nhận được:", monthlyRes.data[0]);
        setMonthlyStatsTheoMay(monthlyRes.data[0]);
      } else {
        setMonthlyStatsTheoMay(null);
      }

      // Xử lý dữ liệu tổng hợp ca ngày (mỗi ca một bản ghi -> gom thành từng ngày đủ 3 ca)
      let rawDailyData = [];
      if (dailyRes) {
        if (Array.isArray(dailyRes)) {
          rawDailyData = dailyRes;
        } else if (Array.isArray(dailyRes.data)) {
          rawDailyData = dailyRes.data;
        }
      }

      if (rawDailyData.length > 0) {
        // Truyền tháng đang lọc để biểu đồ luôn dựng ĐỦ số ngày của tháng đó,
        // ngày chưa có dữ liệu vẫn giữ một ô trống -> bề rộng không đổi.
        const chartData = buildTongHopCaNgayChartData(rawDailyData, `${nam}-${String(thang).padStart(2, '0')}`);
        console.log(`>>> [MayCatVaiDashboard] Tổng hợp ca ngày: ${rawDailyData.length} bản ghi ca -> ${chartData.length} ngày trên biểu đồ.`, chartData);
        setDailyPlanData(chartData);
      } else {
        setDailyPlanData([]);
        console.log(">>> [MayCatVaiDashboard] Không có dữ liệu tổng hợp ca ngày.");
      }
    } catch (error) {
      console.error("[MayCatVaiDashboard] fetchMonthlyDashboardData -> Lỗi ngoài dự kiến:", error);
    }
  };

  // Hàm tải danh sách BTP thực tế theo ca nhập kho (Quy tắc 3: log console)
  const fetchBtpTheoMay = useCallback(async (session = fetchSessionRef.current) => {
    if (!equipmentId || !selectedDate || selectedCa === '') return;
    setBtpLoading(true);
    try {
      // Trích xuất chữ số ở cuối maMay (ví dụ 'orc_cv_01' -> '01') giống các API stats khác theo yêu cầu của user
      const shortMaMay = equipmentId.match(/\d+$/)?.[0] || equipmentId;
      const namThangNgayCaNhapKhoStr = selectedDate.replace(/-/g, '') + selectedCa;
      console.log(`[MayCatVaiDashboard] fetchBtpTheoMay -> Gửi request: maMay=${shortMaMay} (gốc: ${equipmentId}), namThangNgayCaNhapKho=${namThangNgayCaNhapKhoStr}`);

      const res = await getBtpTheoMay(shortMaMay, namThangNgayCaNhapKhoStr);

      // Bỏ qua kết quả của phiên cũ: người dùng đã đổi sang ca/ngày khác trong lúc chờ response
      if (session !== fetchSessionRef.current) {
        console.log(`[MayCatVaiDashboard] fetchBtpTheoMay -> BỎ QUA kết quả cũ của ca ${namThangNgayCaNhapKhoStr} (phiên ${session} đã lỗi thời, phiên hiện tại ${fetchSessionRef.current}).`);
        return;
      }

      console.log("[MayCatVaiDashboard] fetchBtpTheoMay -> Kết quả từ API:", res);

      if (res && res.success && Array.isArray(res.data)) {
        setBtpData(res.data);
      } else {
        setBtpData([]);
      }
    } catch (error) {
      console.error("[MayCatVaiDashboard] fetchBtpTheoMay -> Lỗi:", error);
      if (session === fetchSessionRef.current) setBtpData([]);
    } finally {
      if (session === fetchSessionRef.current) setBtpLoading(false);
    }
  }, [equipmentId, selectedDate, selectedCa]);

  // Cập nhật tự động 10s một lần khi đang mở tab Dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      // Mở một phiên tải mới: mọi response của phiên trước (ca/ngày cũ) sẽ bị bỏ qua khi về muộn
      const session = ++fetchSessionRef.current;
      console.log(`[MayCatVaiDashboard] Mở phiên tải dữ liệu #${session} cho ca ${selectedCa} ngày ${selectedDate}.`);

      setIsRefreshing(true);
      Promise.allSettled([
        fetchMachineStatusTimes(session),
        fetchMonthlyDashboardData(session),
        fetchBtpTheoMay(session)
      ]).then(() => {
        if (session !== fetchSessionRef.current) return;
        setIsRefreshing(false);
        setLastUpdatedTime(new Date().toLocaleTimeString('vi-VN'));
      });

      // Chỉ polling khi ca/ngày đang chọn đúng là CA HIỆN TẠI của hệ thống.
      // Xem ca lịch sử thì dữ liệu đã đóng, polling chỉ gây nguy cơ lấy nhầm dữ liệu.
      if (!isCurrentShiftSelected(selectedDate, selectedCa)) {
        const current = getCurrentShift();
        console.log(`[MayCatVaiDashboard] Đang xem dữ liệu lịch sử (Ca: ${selectedCa}, Ngày: ${selectedDate} | Ca hiện tại: ${current.ca}, Ngày: ${current.dateStr}). TẮT polling trạng thái realtime.`);
        return;
      }

      console.log(`[MayCatVaiDashboard] Đang ở ca hiện tại. BẬT polling trạng thái realtime mỗi 10s.`);
      const intervalId = setInterval(() => {
        // Polling luôn dùng phiên hiện hành để không ghi đè khi người dùng vừa đổi bộ lọc
        fetchMachineStatusTimes(fetchSessionRef.current);
        fetchBtpTheoMay(fetchSessionRef.current);
        setLastUpdatedTime(new Date().toLocaleTimeString('vi-VN'));
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [equipmentId, activeTab, selectedDate, selectedCa, selectedYear, selectedMonth, fetchBtpTheoMay, refreshToken]);




  // Đếm số CA thực tế có dữ liệu. Không phải ngày nào cũng đủ 3 ca (máy nghỉ ca,
  // chưa tới ca đó...), nên tiêu đề ghi cứng "× 3 ca" sẽ sai với thực tế hiển thị.
  const dayChartShiftCount = React.useMemo(
    () => dailyPlanData.reduce(
      (sum, row) => sum + SHIFT_ORDER.filter(s => row[`${s.dataKey}_coDuLieu`]).length,
      0
    ),
    [dailyPlanData]
  );

  // Số ngày THỰC SỰ có dữ liệu. dailyPlanData.length luôn bằng số ngày của tháng
  // (các ngày trống vẫn giữ ô để bề rộng biểu đồ không đổi) nên không dùng để đếm được.
  const dayChartDayCount = React.useMemo(
    () => dailyPlanData.filter(
      row => SHIFT_ORDER.some(s => row[`${s.dataKey}_coDuLieu`])
    ).length,
    [dailyPlanData]
  );

  // Bề rộng canvas của biểu đồ theo ngày.
  // Mỗi ngày chiếm cố định DAY_COL_WIDTH px để 3 cột của ngày đó luôn đủ chỗ,
  // nhờ vậy nhãn sản lượng không bị chồng lên nhau dù tháng có 31 ngày.
  // minWidth 100% ở phần tử con lo trường hợp ít ngày: biểu đồ vẫn phủ kín khung.
  // Mỗi ngày chiếm cố định 70px để 3 cột trong ngày luôn giữ nguyên bề dày 16px,
  // KHÔNG bị co lại khi tháng có nhiều ngày — phần vượt khung thì cuộn ngang.
  const DAY_COL_WIDTH = 70;
  const Y_AXIS_WIDTH = 46;
  const DAYS_PER_VIEW = 16; // số ngày thấy trọn trong một khung nhìn ~1180px
  const dayChartWidth = dailyPlanData.length * DAY_COL_WIDTH + Y_AXIS_WIDTH;
  // Vượt quá số ngày hiển thị được thì mới hiện gợi ý kéo ngang
  const isDayChartScrollable = dailyPlanData.length > DAYS_PER_VIEW;

  // Biểu đồ luôn mở ở NGÀY MỚI NHẤT (mép phải), vì đó là dữ liệu người dùng
  // quan tâm trước tiên; muốn xem các ngày đầu tháng thì kéo ngược sang trái.
  //
  // Dùng CALLBACK REF thay vì useEffect: vùng cuộn nằm trong nhánh điều kiện
  // (khi chưa có dữ liệu thì render "mes-empty", chưa có phần tử cuộn nào cả).
  // useEffect chạy khi dailyPlanData đổi có thể gặp ref.current = null ở lần đầu,
  // còn callback ref luôn chạy ĐÚNG LÚC phần tử vừa gắn vào DOM.
  const dayChartScrollRef = React.useRef(null);

  // Đẩy vùng cuộn sang hết bên phải. Gọi lại trong requestAnimationFrame vì ngay
  // lúc phần tử vừa gắn vào DOM, Recharts chưa vẽ xong nên scrollWidth vẫn bằng
  // clientWidth -> gán một lần sẽ không có tác dụng.
  const scrollDayChartToEnd = React.useCallback((node) => {
    if (!node) return;
    node.scrollLeft = node.scrollWidth;
    requestAnimationFrame(() => {
      if (dayChartScrollRef.current === node) {
        node.scrollLeft = node.scrollWidth;
      }
    });
  }, []);

  const attachDayChartScroll = React.useCallback((node) => {
    dayChartScrollRef.current = node;
    scrollDayChartToEnd(node);
  }, [scrollDayChartToEnd]);

  // Đổi bộ lọc mà vùng cuộn vẫn đang tồn tại thì callback ref không chạy lại,
  // nên vẫn cần effect này để đưa biểu đồ về ngày mới nhất.
  useEffect(() => {
    scrollDayChartToEnd(dayChartScrollRef.current);
  }, [dailyPlanData, scrollDayChartToEnd]);

  // Nhãn mô tả khoảng dữ liệu thực tế của biểu đồ theo ngày.
  // Tháng hiện tại thì dừng ở ca/ngày đang lọc, tháng khác thì trọn cả tháng.
  const chartRangeLabel = React.useMemo(() => {
    const range = getChartShiftRange(selectedDate, selectedCa);
    if (!range) return 'Chưa chọn ca/ngày';
    const [y, m] = String(selectedDate).split('-');
    if (range.isCurrentMonth) {
      const dmy = String(selectedDate).split('-').reverse().join('/');
      const caHienThi = selectedCa === '0' ? '3' : selectedCa;
      return `Từ 01/${m}/${y} đến ${dmy} (Ca ${caHienThi})`;
    }
    const lastDay = String(range.endShift).slice(6, 8);
    return `Trọn tháng ${m}/${y} (01/${m} - ${lastDay}/${m})`;
  }, [selectedDate, selectedCa]);

  // Đồng bộ bộ lọc nháp theo bộ lọc thật khi bộ lọc thật bị đổi từ nơi khác
  // (ví dụ vừa bấm áp dụng, hoặc sau này có cơ chế tự nhảy ca), tránh nút cứ sáng cam nhầm.
  useEffect(() => {
    setDraftCa(selectedCa);
    setDraftDate(selectedDate);
  }, [selectedCa, selectedDate]);

  // Áp dụng bộ lọc nháp -> bộ lọc thật (nút "Xem dữ liệu").
  // Nếu bộ lọc không đổi thì chỉ tải lại dữ liệu của chính ca đang xem.
  const handleApplyFilter = () => {
    if (hasPendingFilter) {
      console.log(`[MayCatVaiDashboard] Áp dụng bộ lọc mới: Ca ${draftCa} ngày ${draftDate} (trước đó: Ca ${selectedCa} ngày ${selectedDate}).`);
      setSelectedCa(draftCa);
      setSelectedDate(draftDate);
    } else {
      console.log(`[MayCatVaiDashboard] Làm mới thủ công dữ liệu ca ${selectedCa} ngày ${selectedDate}.`);
      setRefreshToken(t => t + 1);
    }
  };

  // 1. Khung giờ 8h của ca đang chọn — dùng chung cho timeline trạng thái và biểu đồ tròn 8h ca.
  //    Ca 1: 06:00 -> 14:00 cùng ngày
  //    Ca 2: 14:00 -> 22:00 cùng ngày
  //    Ca 3 (mã ca = 0): 22:00 NGÀY HÔM TRƯỚC -> 06:00 ngày đang chọn
  //    (khớp với YearMonthDayShift của API: bản ghi 22:00 ngày 14/8 thuộc ca 202608150)
  const shiftWindow = React.useMemo(() => {
    const [y, m, d] = String(selectedDate || '').split('-').map(Number);
    if (!y || !m || !d) return null;
    const start = new Date(y, m - 1, d);
    if (selectedCa === '0') {
      start.setDate(start.getDate() - 1);
      start.setHours(22, 0, 0, 0);
    }
    else if (selectedCa === '2') start.setHours(14, 0, 0, 0);
    else start.setHours(6, 0, 0, 0);
    const end = new Date(start.getTime() + SHIFT_DURATION_SEC * 1000);
    // Log console hỗ trợ test lỗi (Quy tắc 3)
    console.log(`[MayCatVaiDashboard] Khung ca ${selectedCa === '0' ? 3 : selectedCa} ngày ${selectedDate}: ${start.toLocaleString('vi-VN')} -> ${end.toLocaleString('vi-VN')}`);
    return { start, end, startHour: start.getHours() };
  }, [selectedDate, selectedCa]);

  // 2. Xử lý gộp và giải quyết chồng chéo các segment trạng thái (Overlap Resolver)
  const shiftSegments = React.useMemo(() => {
    if (!shiftWindow || !machineStatusTimes || machineStatusTimes.length === 0) return [];
    const spanMs = SHIFT_DURATION_SEC * 1000;

    const rawSegments = machineStatusTimes.map((item, idx) => {
      if (!item.StartTime) return null;
      const itemStart = new Date(String(item.StartTime).replace(' ', 'T'));
      // API ưu tiên EffectiveEndTime (đã cắt theo ranh giới ca); bản ghi còn mở (IsOpen) thì tính tới thời điểm hiện tại
      const rawEnd = item.EffectiveEndTime || item.EndTime;
      const itemEnd = rawEnd ? new Date(String(rawEnd).replace(' ', 'T')) : new Date();
      if (isNaN(itemStart.getTime()) || isNaN(itemEnd.getTime())) return null;

      const start = new Date(Math.max(itemStart.getTime(), shiftWindow.start.getTime()));
      const end = new Date(Math.min(itemEnd.getTime(), shiftWindow.end.getTime()));
      const durationMs = end.getTime() - start.getTime();
      if (durationMs <= 0) return null;

      const statusNum = Number(item.MachineStatus);
      return {
        idx,
        statusNum,
        statusName: item.StatusName,
        start,
        end,
        durationSec: durationMs / 1000,
        isRunning: statusNum === 1 || ['chạy', 'run'].includes(String(item.StatusName || '').toLowerCase()),
      };
    }).filter(Boolean);

    rawSegments.sort((a, b) => a.start.getTime() - b.start.getTime());

    const resolvedSegments = [];
    rawSegments.forEach(cur => {
      if (resolvedSegments.length === 0) {
        resolvedSegments.push(cur);
        return;
      }

      let last = resolvedSegments[resolvedSegments.length - 1];

      if (cur.start.getTime() >= last.end.getTime()) {
        resolvedSegments.push(cur);
      } else {
        if (cur.end.getTime() <= last.end.getTime()) {
          const lastEndOriginal = last.end;
          last.end = cur.start;
          last.durationSec = (last.end.getTime() - last.start.getTime()) / 1000;

          if (last.durationSec <= 0) {
            resolvedSegments.pop();
          }
          resolvedSegments.push(cur);

          if (cur.end.getTime() < lastEndOriginal.getTime()) {
            resolvedSegments.push({
              ...last,
              start: cur.end,
              end: lastEndOriginal,
              durationSec: (lastEndOriginal.getTime() - cur.end.getTime()) / 1000
            });
          }
        } else {
          last.end = cur.start;
          last.durationSec = (last.end.getTime() - last.start.getTime()) / 1000;

          if (last.durationSec <= 0) {
            resolvedSegments.pop();
          }
          resolvedSegments.push(cur);
        }
      }
    });

    console.log("[ShiftSegments Overlap Resolver] Dữ liệu thật sau xử lý:", resolvedSegments.map(s => ({
      status: s.statusName,
      start: s.start.toLocaleTimeString(),
      end: s.end.toLocaleTimeString(),
      dur: (s.durationSec / 3600).toFixed(2) + 'h'
    })));

    return resolvedSegments.map((seg, idx) => {
      const durationMs = seg.durationSec * 1000;
      return {
        key: `${seg.idx}-${seg.start.getTime()}-${idx}`,
        statusNum: seg.statusNum,
        meta: getStatusMeta(seg.statusNum, seg.statusName),
        start: seg.start,
        end: seg.end,
        durationSec: seg.durationSec,
        leftPct: ((seg.start.getTime() - shiftWindow.start.getTime()) / spanMs) * 100,
        widthPct: (durationMs / spanMs) * 100,
        isRunning: seg.isRunning,
      };
    });
  }, [machineStatusTimes, shiftWindow]);

  // 3. Tổng hợp biểu đồ tròn và KPI máy chạy
  const shiftBreakdown = React.useMemo(() => {
    const totals = {};
    let recordedSec = 0;
    let runSec = 0;

    shiftSegments.forEach(seg => {
      totals[seg.statusNum] = (totals[seg.statusNum] || 0) + seg.durationSec;
      recordedSec += seg.durationSec;
      if (seg.isRunning) runSec += seg.durationSec;
    });

    const slices = Object.keys(totals).map(key => {
      const statusNum = Number(key);
      const meta = getStatusMeta(statusNum);
      return { name: meta.name, value: totals[statusNum], fill: meta.fill };
    }).sort((a, b) => b.value - a.value);

    const idleSec = Math.max(0, SHIFT_DURATION_SEC - recordedSec);
    if (idleSec > 1) {
      slices.push({ name: IDLE_META.name, value: idleSec, fill: IDLE_META.fill });
    }

    const runPct = (runSec / SHIFT_DURATION_SEC) * 100;

    // Log console hỗ trợ test lỗi biểu đồ tròn 8h ca (Quy tắc 3)
    console.log(
      `[MayCatVaiDashboard] Tỉ lệ trạng thái 8h ca: ghi nhận ${(recordedSec / 3600).toFixed(2)}h, chạy ${(runSec / 3600).toFixed(2)}h (${runPct.toFixed(2)}%), trống ${(idleSec / 3600).toFixed(2)}h`,
      slices.map(s => `${s.name}: ${(s.value / 3600).toFixed(2)}h`)
    );

    return { slices, recordedSec, runSec, idleSec, runPct };
  }, [shiftSegments]);

  const avgChay = (shiftBreakdown.runSec / 3600).toFixed(2);
  // Giữ nguyên giá trị % chính xác (không làm tròn về số nguyên) để hiển thị đủ 2 chữ số thập phân
  const uptimePctAPI = Math.min(100, (shiftBreakdown.runSec / (8 * 3600)) * 100);

  // Console log kiểm tra dữ liệu KPI 8h ca thật (Quy tắc 3)
  console.log(`[KPI ca thật] Máy chạy = ${avgChay}h (Uptime: ${uptimePctAPI.toFixed(2)}%), Đã ghi nhận = ${(shiftBreakdown.recordedSec / 3600).toFixed(2)}h, Trống = ${(shiftBreakdown.idleSec / 3600).toFixed(2)}h`);

  const caLabel = selectedCa === '0' ? '3' : (selectedCa || '1');
  const dateLabel = selectedDate ? selectedDate.split('-').reverse().join('/') : '--/--/----';

  const nowOffsetPct = shiftWindow
    ? ((Date.now() - shiftWindow.start.getTime()) / (SHIFT_DURATION_SEC * 1000)) * 100
    : -1;
  const showNowMarker = nowOffsetPct >= 0 && nowOffsetPct <= 100;

  // Trạng thái máy hiện tại (lấy bản ghi cuối cùng của ca)
  const currentStatus = React.useMemo(() => {
    if (!machineStatusTimes || machineStatusTimes.length === 0) {
      return { name: 'Không có dữ liệu', fill: '#94a3b8', ink: '#ffffff', since: null };
    }
    const last = machineStatusTimes[machineStatusTimes.length - 1];
    const meta = getStatusMeta(Number(last.MachineStatus), last.StatusName);
    const since = last.StartTime ? new Date(String(last.StartTime).replace(' ', 'T')) : null;
    return { ...meta, since };
  }, [machineStatusTimes]);

  // 4. Biểu đồ SCADA tháng thật
  const scadaChartData = React.useMemo(() => {
    if (!machineStatusMonth || machineStatusMonth.length === 0) {
      return [{ name: 'Không có dữ liệu', value: 1, fill: '#e2e8f0' }];
    }
    return machineStatusMonth.map(item => {
      const meta = getStatusMeta(item.MachineStatus, item.StatusName);
      return {
        name: meta.name,
        value: item.TotalDurationHours || 0,
        fill: meta.fill
      };
    }).filter(item => item.value > 0);
  }, [machineStatusMonth]);

  // ==========================================
  // DỮ LIỆU SẢN LƯỢNG CA ĐÃ LẤY TỪ API THẬT
  // ==========================================

  // Kế hoạch sản xuất trong ca (Dữ liệu thật lấy từ API /btp-theo-may)
  const displayShiftData = React.useMemo(() => {
    return btpData.map(item => ({
      MaQuycachLop: item.KyHieu_BTP,
      TenQuycachLop: item.Ten_BTP,
      SanluongLopSX: item.SanluongSX || 0,
      SoLuong_KH_HieuLuc: item.SoLuong_KH_DieuChinh !== undefined ? item.SoLuong_KH_DieuChinh : (item.SoLuong_KH || 0)
    }));
  }, [btpData]);

  // ==========================================
  // VIEW RENDER TABS
  // ==========================================

  // RENDER TAB 1: Dashboard hiệu suất
  const renderDashboardTab = () => {
    // Ưu tiên hiển thị:
    // 1. Tên quy cách từ BTP theo máy (nếu có bản ghi BTP trong ca)
    // 2. Ký hiệu / Mã quy cách từ BTP theo máy
    // 3. Quy cách đang sản xuất lấy từ realtime API (getMachinesWithStats)
    // 4. Quy cách truyền từ trang danh sách máy (location.state)
    // 5. 'Không có dữ liệu'
    const tenVai = (displayShiftData.length > 0 && displayShiftData[0].TenQuycachLop)
      ? displayShiftData[0].TenQuycachLop
      : (displayShiftData.length > 0 && displayShiftData[0].MaQuycachLop)
        ? displayShiftData[0].MaQuycachLop
        : (realtimeMaQuyCach || passedMaQuyCach || 'Không có dữ liệu');

    // Console log phục vụ kiểm tra theo Quy tắc 3
    console.log(`[MayCatVaiDashboard] Quy cách vải đang cắt: '${tenVai}' (displayShiftData: ${displayShiftData.length}, realtimeMaQuyCach: '${realtimeMaQuyCach}', passedMaQuyCach: '${passedMaQuyCach}')`);

    return (
      <div className="mes-fade" style={{ padding: '10px', background: '#fff', border: '1px solid #b8cce0', borderRadius: '3px', marginTop: '10px' }}>

        {/* KHỐI 1: KHỐI TỔNG QUAN TẬP TRUNG */}
        <div className="th-overview">
          {/* Cột trái: Ảnh máy */}
          <div className="th-photo">
            {machineImage ? (
              <img src={machineImage} alt={`Máy ${equipmentId}`} />
            ) : (
              <div className="th-photo-empty">
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>📸</span>
                  <span>Chưa có ảnh máy Cắt vải</span>
                  <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 'bold', marginTop: '4px' }}>[MOCK] Ảnh Máy Cắt Vải</div>
                </div>
              </div>
            )}
            <div className="th-photo-cap">
              <span>MÁY CẮT VẢI</span>
              <b>#{equipmentId}</b>
            </div>
          </div>

          {/* Cột phải: Bộ lọc & KPI & Charts */}
          <div className="th-ov-right">
            {/* Hàng 1: Toolbar bộ lọc */}
            <div className="th-toolbar">
              <div className="th-tb-group">
                <span className="th-tb-label">Ca</span>
                <select
                  className="th-tb-pick"
                  value={draftCa}
                  onChange={(e) => setDraftCa(e.target.value)}
                >
                  <option value="1">1 · 06:00 – 14:00</option>
                  <option value="2">2 · 14:00 – 22:00</option>
                  <option value="0">3 · 22:00 – 06:00</option>
                </select>
              </div>

              <div className="th-tb-group">
                <span className="th-tb-label">Ngày</span>
                <input
                  type="date"
                  className="th-tb-pick"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                />
              </div>

              {/* Nút áp dụng bộ lọc / làm mới dữ liệu thủ công */}
              <div className="th-tb-group">
                <button
                  className={`th-tb-btn ${hasPendingFilter ? 'pending' : ''}`}
                  onClick={handleApplyFilter}
                  disabled={isRefreshing}
                  title={hasPendingFilter
                    ? `Áp dụng bộ lọc: Ca ${draftCa === '0' ? '3' : draftCa} ngày ${draftDate}`
                    : 'Tải lại dữ liệu của ca đang xem'}
                >
                  {isRefreshing ? 'Đang tải...' : (hasPendingFilter ? 'Hiển Thị' : 'Refresh')}
                </button>
                {lastUpdatedTime && !isRefreshing && (
                  <span className="th-tb-updated">Cập nhật: {lastUpdatedTime}</span>
                )}
              </div>

              {/* Status Pill thật tự động lấy trạng thái hiện tại từ API */}
              <div
                className="th-status-pill"
                style={{ background: currentStatus.fill, color: currentStatus.ink }}
                title={currentStatus.since ? `Trạng thái từ: ${formatClock(currentStatus.since)}` : undefined}
              >
                <span className="th-status-dot" style={{ background: currentStatus.ink }} />
                {currentStatus.name}
              </div>
            </div>

            {/* Hàng 2: Quy cách sản phẩm đang chạy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: '#1a3a5c', margin: '8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ color: '#1a3a5c' }}>Quy cách vải đang cắt:</span>
              <span style={{ color: '#1e293b', fontWeight: '900' }}>{tenVai}</span>
            </div>

            {/* Hàng 3: KPI máy chạy & Tiêu đề biểu đồ tròn */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 6px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thời gian máy chạy:</span>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#1a3a5c' }}>{avgChay} <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>(h)</span></span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: getUptimeColor(uptimePctAPI) }}>{uptimePctAPI.toFixed(2)}%</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tỉ lệ trạng thái 8h ca
              </div>
            </div>

            {/* Hàng 4: Timeline bên trái và Donut Chart bên phải song song */}
            <div className="th-timeline-donut-row">

              {/* Cột trái: Timeline trạng thái + Trục mốc giờ + Legend dạng 2 cột */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="th-tl-wrap" style={{ position: 'relative' }}>
                  {showNowMarker && (
                    <div className="th-now-flag" style={{ left: `${Math.min(96, Math.max(4, nowOffsetPct))}%` }}>
                      {formatClock(new Date())}
                    </div>
                  )}

                  <div className="th-timeline">
                    {console.log(`>>> [Timeline Test Log] Đang vẽ timeline với ${shiftSegments.length} phân đoạn trạng thái.`)}
                    {shiftSegments.length === 0 ? (
                      <div className="th-tl-empty">Không có dữ liệu trạng thái cho ca này</div>
                    ) : shiftSegments.map(seg => {
                      const fitsLabel = seg.widthPct >= seg.meta.short.length * 1.2 + 2.5;
                      return (
                        <div
                          key={seg.key}
                          className="th-seg"
                          style={{
                            left: `${seg.leftPct}%`,
                            width: `${seg.widthPct}%`,
                            background: seg.meta.fill,
                            color: seg.meta.ink
                          }}
                          title={`${seg.meta.name}\n${formatClock(seg.start)} – ${formatClock(seg.end)}  (${formatDuration(seg.durationSec)})`}
                        >
                          {fitsLabel ? seg.meta.short : ''}
                        </div>
                      );
                    })}

                    <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} style={{
                          position: 'absolute', top: 0, bottom: 0,
                          left: `${(i / 8) * 100}%`,
                          borderLeft: '1px solid rgba(15,23,42,0.18)'
                        }} />
                      ))}
                    </div>

                    {showNowMarker && (
                      <div style={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${nowOffsetPct}%`, width: '2px',
                        background: '#1d4ed8', zIndex: 4, pointerEvents: 'none'
                      }} />
                    )}
                  </div>
                </div>

                {/* Trục mốc giờ theo ca */}
                <div className="th-axis">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                    const startHour = shiftWindow ? shiftWindow.startHour : 6;
                    const h = (startHour + i) % 24;
                    let transform = 'translateX(-50%)';
                    if (i === 0) transform = 'none';
                    else if (i === 8) transform = 'translateX(-100%)';

                    return (
                      <span key={i} style={{ left: `${(i / 8) * 100}%`, transform }}>
                        {String(h).padStart(2, '0')}:00
                      </span>
                    );
                  })}
                </div>

                {/* Chú thích Legend dạng grid 2 cột */}
                <div className="th-legend th-legend-grid-2">
                  {shiftBreakdown.slices.length === 0 ? (
                    <div className="th-legend-row" style={{ gridColumn: 'span 2' }}><span className="th-legend-name">Chưa có dữ liệu trạng thái</span></div>
                  ) : shiftBreakdown.slices.map((slice, index) => (
                    <div className="th-legend-row" key={index}>
                      <span className="th-legend-chip" style={{ background: slice.fill }} />
                      <span className="th-legend-name" title={slice.name}>{slice.name}</span>
                      <span className="th-legend-val">{(slice.value / 3600).toFixed(2)}h</span>
                      <span className="th-legend-pct">{((slice.value / SHIFT_DURATION_SEC) * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột phải: Donut chart tỉ lệ */}
              <div className="th-donut-wrap" style={{ height: '160px', width: '220px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* Donut bắt đầu từ hướng 12h, các trạng thái liền mạch không khe hở */}
                    <Pie
                      data={shiftBreakdown.slices}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={74}
                      dataKey="value"
                      nameKey="name"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      strokeWidth={0}
                      paddingAngle={0}
                      isAnimationActive={false}
                    >
                      {shiftBreakdown.slices.map((entry, index) => (
                        <Cell key={`slice-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      wrapperStyle={tooltipWrapperStyle}
                      formatter={(value, name) => [
                        `${(Number(value) / 3600).toFixed(2)}h · ${((Number(value) / SHIFT_DURATION_SEC) * 100).toFixed(2)}%`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="th-donut-center">
                  <div className="th-donut-hole">
                    <div className="th-donut-big" style={{ color: getUptimeColor(shiftBreakdown.runPct) }}>
                    {shiftBreakdown.runPct.toFixed(2)}%
                    </div>
                    <div className="th-donut-cap">Máy chạy</div>
                    <div className="th-donut-sub">{(shiftBreakdown.runSec / 3600).toFixed(2)}h / 8h</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* KHỐI 2: THEO DÕI KẾ HOẠCH SẢN XUẤT TRONG CA */}
        <div className="th-card" style={{ marginBottom: '12px' }}>
          <div className="th-card-head th-ca-card-head">
            <div className="th-card-title">Theo dõi kế hoạch sản xuất trong ca</div>
            <div className="th-card-meta">
              <span>Ca {caLabel} · {dateLabel}</span>
            </div>
          </div>
          <div className="th-card-body">
            <div className="th-split">
              <div className="th-table-responsive" style={{ minWidth: 0, height: '100%' }}>
                <table className="th-ca-table" style={{ width: '100%', height: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '100px', whiteSpace: 'nowrap' }}>MÃ QUY CÁCH</th>
                      <th style={{ textAlign: 'left', minWidth: '140px' }}>QUY CÁCH VẢI</th>
                      <th style={{ width: '95px', whiteSpace: 'nowrap' }}>THỰC TẾ SX</th>
                      <th style={{ width: '95px', whiteSpace: 'nowrap' }}>KẾ HOẠCH</th>
                      <th style={{ width: '200px', minWidth: '160px' }}>% HOÀN THÀNH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayShiftData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="mes-empty" style={{ padding: '20px 0' }}>Không có dữ liệu kế hoạch ca này</td>
                      </tr>
                    ) : (
                      <>
                        {displayShiftData.map((row, idx) => {
                          const tt = row.SanluongLopSX || 0;
                          const kh = row.SoLuong_KH_HieuLuc || 0;
                          const percent = kh > 0 ? ((tt / kh) * 100).toFixed(2) : 0;
                          const numPercent = Number(percent);
                          const rowColor = getTablePercentColor(numPercent);
                          const isVuotKH = numPercent > 100;

                          return (
                            <tr key={idx} style={{ background: isVuotKH ? '#f0f9ff' : 'transparent' }}>
                              <td style={{ textAlign: 'left', color: '#1565C0', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                {row.MaQuycachLop || '—'}
                              </td>
                              <td style={{ textAlign: 'left', minWidth: '140px' }}>
                                <div style={{ color: '#1565C0', fontWeight: 'bold', fontSize: '13px', lineHeight: '1.25' }}>{row.TenQuycachLop || 'Không có tên quy cách'}</div>
                              </td>
                              <td style={{ color: '#1565C0', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>{tt}</td>
                              <td style={{ color: '#1565C0', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>{kh}</td>
                              <td style={{ minWidth: '160px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '14px', background: '#e2e8f0', borderRadius: '0px', overflow: 'hidden', position: 'relative' }} title={`Tiến độ: ${percent}% (Thang đo 0-120%)`}>
                                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '83.33%', width: '2px', background: '#64748b', zIndex: 2, opacity: 0.6 }} title="Mốc 100% Kế hoạch"></div>
                                    <div style={{ height: '100%', width: `${Math.min((numPercent / 120) * 100, 100)}%`, background: rowColor, transition: 'width 0.5s', borderRadius: '0px' }}></div>
                                  </div>
                                  <span style={{ minWidth: '58px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: rowColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {percent}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {(() => {
                          const tongTT = displayShiftData.reduce((sum, r) => sum + (r.SanluongLopSX || 0), 0);
                          const tongKH = displayShiftData.reduce((sum, r) => sum + (r.SoLuong_KH_HieuLuc || 0), 0);
                          const percentTong = tongKH > 0 ? (tongTT / tongKH * 100).toFixed(2) : 0;
                          const numPercentTong = Number(percentTong);
                          const isVuotKH = numPercentTong > 100;
                          const tongColor = getTablePercentColor(numPercentTong);
                          return (
                            <tr style={{ background: isVuotKH ? '#e0f2fe' : '#f1f5f9' }}>
                              <td colSpan={2} style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '13px', textAlign: 'left', whiteSpace: 'nowrap' }}>TỔNG CỘNG</td>
                              <td style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' }}>{tongTT}</td>
                              <td style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' }}>{tongKH}</td>
                              <td style={{ minWidth: '160px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '14px', background: '#cbd5e1', borderRadius: '0px', overflow: 'hidden', position: 'relative' }} title={`Tổng cộng tiến độ: ${percentTong}% (Thang đo 0-120%)`}>
                                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '83.33%', width: '2px', background: '#475569', zIndex: 2, opacity: 0.8 }} title="Mốc 100% Kế hoạch"></div>
                                    <div style={{ height: '100%', width: `${Math.min((numPercentTong / 120) * 100, 100)}%`, background: tongColor, transition: 'width 0.5s', borderRadius: '0px' }}></div>
                                  </div>
                                  <span style={{ minWidth: '58px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: tongColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {percentTong}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })()}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* BIỂU ĐỒ CỘT TỔNG SX CA */}
              <div className="th-split-side">
                {(() => {
                  const tongTT = displayShiftData.reduce((sum, r) => sum + (r.SanluongLopSX || 0), 0);
                  const tongKH = displayShiftData.reduce((sum, r) => sum + (r.SoLuong_KH_HieuLuc || 0), 0);
                  const percentTong = tongKH > 0 ? (tongTT / tongKH * 100).toFixed(2) : 0;
                  const numPercentTong = Number(percentTong);
                  let barColor = getProgressColor(numPercentTong);

                  return (
                    <div style={{ display: 'flex', height: '100%', minHeight: '130px', alignItems: 'flex-end', paddingBottom: '25px', paddingTop: '15px' }}>
                      {/* Trục Y */}
                      <div style={{ position: 'relative', height: '100%', width: '28px', borderRight: '1px solid #cbd5e1' }}>
                        <span style={{ position: 'absolute', top: '0%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>120</span>
                        <span style={{ position: 'absolute', top: '16.67%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>100</span>
                        <span style={{ position: 'absolute', top: '37.5%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>75</span>
                        <span style={{ position: 'absolute', top: '58.33%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>50</span>
                        <span style={{ position: 'absolute', top: '79.17%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>25</span>

                        <div style={{ position: 'absolute', top: '0%', right: '-1px', width: '4px', height: '1px', background: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '16.67%', right: '-1px', width: '4px', height: '1px', background: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '37.5%', right: '-1px', width: '4px', height: '1px', background: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '58.33%', right: '-1px', width: '4px', height: '1px', background: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '79.17%', right: '-1px', width: '4px', height: '1px', background: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', bottom: '0%', right: '-1px', width: '4px', height: '1px', background: '#cbd5e1' }}></div>
                      </div>
                      {/* Cột hiển thị */}
                      <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: '20px', paddingLeft: '15px' }}>
                        {console.log(`>>> [MayCatVaiDashboard Test Log] Cột KH ca: tongKH = ${tongKH}, Chiều cao cột KH = ${tongKH > 0 ? '83.33%' : '0%'}`)}
                        <div style={{ width: '38px', height: tongKH > 0 ? '83.33%' : '0%', background: '#1565C0', position: 'relative', borderRadius: '0px' }} title="Kế hoạch">
                          <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', color: '#1565C0', fontSize: '11px', fontWeight: 'bold' }}>{tongKH.toLocaleString('vi-VN')}</span>
                          <span style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>100%</span>
                          <span style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>KH</span>
                        </div>
                        <div style={{ width: '38px', height: `${Math.min((numPercentTong / 120) * 100, 100)}%`, background: barColor, position: 'relative', borderRadius: '0px' }} title={`Thực tế: ${percentTong}%`}>
                          <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', color: barColor, fontSize: '11px', fontWeight: 'bold' }}>{tongTT.toLocaleString('vi-VN')}</span>
                          <span style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>{percentTong}%</span>
                          <span style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>THỰC TẾ</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 3: SẢN XUẤT THÁNG VÀ SCADA THÁNG */}
        <div className="th-row-2col">
          {/* Sản xuất tháng (DỮ LIỆU THẬT TỪ API MỚI) */}
          <div className="th-card">
            <div className="th-card-head">
              <div className="th-card-title">Sản xuất tháng {selectedMonth}-{selectedYear}</div>
            </div>
            <div className="th-card-body">
              <div className="th-split">
                <div style={{ minWidth: 0, height: '100%' }}>
                  {(() => {
                    const monthlyKH = monthlyStatsTheoMay?.TongKeHoachDieuChinh || 0;
                    const monthlyTT = monthlyStatsTheoMay?.TongSanLuongThucTe || 0;
                    const monthlyPercent = monthlyKH > 0 ? Number(((monthlyTT / monthlyKH) * 100).toFixed(2)) : 0;
                    const monthlyBarColor = getProgressColor(monthlyPercent);

                    return (
                      <table style={{ width: '100%', height: '100%', fontSize: '14px', fontWeight: 'bold', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #d0dff0' }}>
                            <td style={{ padding: '12px 10px', color: '#1e293b' }}>SL KẾ HOẠCH (CUỘN)</td>
                            <td style={{ textAlign: 'right', color: '#1565C0', padding: '12px 10px' }}>
                              {monthlyKH.toLocaleString('vi-VN')}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #d0dff0' }}>
                            <td style={{ padding: '12px 10px', color: '#1e293b' }}>SL THỰC TẾ (CUỘN)</td>
                            <td style={{ textAlign: 'right', color: monthlyBarColor, padding: '12px 10px' }}>
                              {monthlyTT.toLocaleString('vi-VN')}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 10px', color: '#1e293b' }}>MỨC HOÀN THÀNH</td>
                            <td style={{ textAlign: 'right', color: monthlyBarColor, padding: '12px 10px' }}>
                              {monthlyPercent}%
                              {monthlyPercent > 100 && (
                                <span style={{ background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '0px', marginLeft: '6px' }}>Vượt KH</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  })()}
                </div>

                <div className="th-split-side">
                  {(() => {
                    const tongKH = monthlyStatsTheoMay?.TongKeHoachDieuChinh || 0;
                    const tongTT = monthlyStatsTheoMay?.TongSanLuongThucTe || 0;
                    const percentTong = tongKH > 0 ? (tongTT / tongKH * 100).toFixed(2) : 0;
                    const numPercentTong = Number(percentTong);
                    let barColor = getProgressColor(numPercentTong);

                    return (
                      <div style={{ display: 'flex', height: '100%', minHeight: '130px', alignItems: 'flex-end', paddingBottom: '25px', paddingTop: '15px' }}>
                        <div style={{ position: 'relative', height: '100%', width: '28px', borderRight: '1px solid #cbd5e1' }}>
                          <span style={{ position: 'absolute', top: '0%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>120</span>
                          <span style={{ position: 'absolute', top: '16.67%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>100</span>
                          <span style={{ position: 'absolute', top: '37.5%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>75</span>
                          <span style={{ position: 'absolute', top: '58.33%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>50</span>
                          <span style={{ position: 'absolute', top: '79.17%', right: '5px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', transform: 'translateY(-50%)' }}>25</span>
                        </div>
                        <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: '15px', paddingLeft: '12px' }}>
                          {console.log(`>>> [MayCatVaiDashboard Test Log] Cột KH tháng: tongKH = ${tongKH}, Chiều cao cột KH = ${tongKH > 0 ? '83.33%' : '0%'}`)}
                          <div style={{ width: '35px', height: tongKH > 0 ? '83.33%' : '0%', background: '#3b82f6', position: 'relative', borderRadius: '4px 4px 0 0' }}>
                            <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', color: '#3b82f6', fontSize: '11px', fontWeight: 'bold' }}>{Number(tongKH).toLocaleString('vi-VN')}</span>
                            <span style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>100%</span>
                            <span style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>KH</span>
                          </div>
                          <div style={{ width: '35px', height: `${Math.min((numPercentTong / 120) * 100, 100)}%`, background: barColor, position: 'relative', borderRadius: '4px 4px 0 0' }}>
                            {console.log(`>>> [Label Test Log] Đang vẽ nhãn cột THỰC TẾ tháng cho máy cắt vải (tongTT = ${tongTT}).`)}
                            <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', color: barColor, fontSize: '11px', fontWeight: 'bold' }}>{Number(tongTT).toLocaleString('vi-VN')}</span>
                            <span style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>{numPercentTong}%</span>
                            <span style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>THỰC TẾ</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Biểu đồ trạng thái SCADA tháng (DỮ LIỆT THẬT) */}
          <div className="th-card">
            <div className="th-card-head">
              <div className="th-card-title">Trạng thái SCADA tháng {selectedMonth}-{selectedYear}</div>
            </div>
            <div className="th-card-body">
              <div className="th-scada-flex">
                {/* Bảng chú giải tỉ lệ */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: '340px' }}>
                  <table style={{ width: '100%', fontSize: '11px', fontWeight: 'bold', color: '#475569', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#1e3a8a', fontSize: '11px', fontWeight: 'bold' }}>
                        <th colSpan={2} style={{ padding: '6px 4px 6px 0', textAlign: 'left' }}>TRẠNG THÁI</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>THỜI GIAN</th>
                        <th style={{ padding: '6px 0 6px 12px', textAlign: 'right' }}>TỶ LỆ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Không xác định', fill: '#fff2cc', code: 0 },
                        { label: 'Máy chạy', fill: '#00b050', code: 1 },
                        { label: 'Máy dừng', fill: '#ffff00', code: 2 },
                        { label: 'Máy lỗi', fill: '#ff0000', code: 3 },
                        { label: 'Mất kết nối PLC', fill: '#ffc000', code: 4 },

                        { label: 'Không có kế hoạch', fill: '#b4c6e7', code: 6 },
                        { label: 'App Server tắt', fill: '#c55a11', code: 7 },
                        { label: 'Máy chủ tắt', fill: '#833c0c', code: 8 },
                      ].map((lgd, index) => {
                        const found = scadaChartData.find(d => d.fill === lgd.fill);
                        const valHours = found ? Number(found.value) : 0;
                        const totalHours = scadaChartData.reduce((sum, d) => sum + Number(d.value), 0);
                        const percent = totalHours > 0 ? ((valHours / totalHours) * 100).toFixed(2) : '0.00';

                        return (
                          <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '4px 0', width: '20px' }}>
                              <div style={{ width: 12, height: 12, background: lgd.fill, border: lgd.fill === '#fff2cc' ? '1px solid #cbd5e1' : 'none' }}></div>
                            </td>
                            <td style={{ padding: '4px 0', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lgd.label}>
                              {lgd.label}
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                              {valHours.toFixed(1)}h
                            </td>
                            <td style={{ padding: '4px 0 4px 12px', textAlign: 'right', color: '#64748b' }}>
                              {percent}%
                            </td>
                          </tr>
                        );
                      })}
                      {scadaChartData.filter(d => !['#fff2cc', '#00b050', '#ffff00', '#ff0000', '#ffc000', '#f8cbad', '#b4c6e7', '#c55a11', '#833c0c'].includes(d.fill)).map((entry, idx) => {
                        const valHours = Number(entry.value);
                        const totalHours = scadaChartData.reduce((sum, d) => sum + Number(d.value), 0);
                        const percent = totalHours > 0 ? ((valHours / totalHours) * 100).toFixed(2) : '0.00';
                        return (
                          <tr key={`extra-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '4px 0', width: '20px' }}>
                              <div style={{ width: 12, height: 12, background: entry.fill }}></div>
                            </td>
                            <td style={{ padding: '4px 0', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.name}>
                              {entry.name}
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                              {valHours.toFixed(1)}h
                            </td>
                            <td style={{ padding: '4px 0 4px 12px', textAlign: 'right', color: '#64748b' }}>
                              {percent}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Vòng tròn biểu đồ */}
                <div style={{ flex: 1, minWidth: 0, minHeight: '230px', position: 'relative' }}>
                  {(() => {
                    const RADIAN = Math.PI / 180;
                    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      if (!percent || percent <= 0.0001) return null; // Hiển thị tất cả các lát có dữ liệu (> 0%)
                      const RADIAN = Math.PI / 180;
                      const labelStr = `${(percent * 100).toFixed(2)}%`;

                      // Lát từ 7% trở lên (như 9.14%, 11.02%, 34.10%, 39.32%): Hiển thị ngay BÊN TRONG lát bánh
                      if (percent >= 0.07) {
                        const radius = innerRadius + (outerRadius - innerRadius) * (percent >= 0.15 ? 0.65 : 0.70);
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#0f172a"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={percent >= 0.15 ? "10.5" : "9"}
                            fontWeight="900"
                          >
                            {labelStr}
                          </text>
                        );
                      }

                      // Lát nhỏ (< 7%): Vẽ đường kẻ bậc thang so le tỏa ra ngoài đa hướng (4 tầng so le)
                      const cos = Math.cos(-midAngle * RADIAN);
                      const sin = Math.sin(-midAngle * RADIAN);
                      const tier = (index || 0) % 4;
                      const extendDist = 7 + tier * 9;

                      const sx = cx + (outerRadius + 2) * cos;
                      const sy = cy + (outerRadius + 2) * sin;
                      const mx = cx + (outerRadius + extendDist) * cos;
                      const my = cy + (outerRadius + extendDist) * sin;

                      // Luôn bẻ ngang tách về 2 phía (Bên phải -> bẻ sang Phải, Bên trái -> bẻ sang Trái)
                      const isRightSide = cos >= 0;
                      const elbowLength = 7 + tier * 3;
                      const ex = mx + (isRightSide ? elbowLength : -elbowLength);
                      const ey = my;
                      const textAnchor = isRightSide ? 'start' : 'end';
                      const textX = ex + (isRightSide ? 3 : -3);
                      const textY = ey;

                      return (
                        <g key={`pie-cv-lbl-${index}`}>
                          <path
                            d={`M ${sx},${sy} L ${mx},${my} L ${ex},${ey}`}
                            stroke="#475569"
                            strokeWidth="0.8"
                            fill="none"
                          />
                          <circle cx={sx} cy={sy} r={1.2} fill="#475569" />
                          <text
                            x={textX}
                            y={textY}
                            fill="#0f172a"
                            textAnchor={textAnchor}
                            dominantBaseline="central"
                            fontSize="8.5"
                            fontWeight="bold"
                          >
                            {labelStr}
                          </text>
                        </g>
                      );
                    };

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            minAngle={3}
                            data={scadaChartData}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
                            endAngle={-270}
                            outerRadius={70}
                            dataKey="value"
                            stroke="none"
                            labelLine={false}
                            isAnimationActive={false}
                            label={renderCustomizedLabel}
                          >
                            {scadaChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip wrapperStyle={tooltipWrapperStyle} formatter={(value) => `${Number(value).toFixed(1)} giờ`} />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 4: BIỂU ĐỒ HOÀN THÀNH NGÀY (DỮ LIỆU THẬT TỪ API MỚI) */}
        <div className="th-card">
          <div className="th-card-head th-daychart-head">
            <div className="th-card-title">Thực hiện KH theo ngày ({dayChartDayCount}/{dailyPlanData.length} ngày · {dayChartShiftCount} ca)</div>
            <div className="th-card-meta">
              {chartRangeLabel} · Cột = %KH, số trên cột = sản lượng
              {isDayChartScrollable && (
                <span style={{ marginLeft: 8, color: '#1565C0', fontWeight: 800 }}>
                  ⟵ Kéo sang trái để xem các ngày trước
                </span>
              )}
            </div>
          </div>
          {/* flex:'0 0 280px' bắt buộc phải có: .th-card-body mặc định là flex:1 (flex-basis:0),
              khi đó chiều cao 280px bị bỏ qua nên khung biểu đồ co về 0 và Recharts không vẽ được */}
          <div className="th-card-body" style={{ height: 340, minHeight: 340, flex: '0 0 340px', flexShrink: 0, display: 'block' }}>
            {dailyPlanData.length === 0 ? (
              <div className="mes-empty">Chưa có dữ liệu tỷ lệ hoàn thành theo ngày cho tháng này</div>
            ) : (
              <div className="th-daychart-scroll" ref={attachDayChartScroll}>
                {/* Bề rộng canvas = số ngày × bề rộng mỗi ngày, cộng chỗ cho trục Y.
                    Nhờ đó mỗi ngày luôn đủ rộng cho 3 cột, phần vượt khung thì cuộn ngang. */}
                <div style={{ width: dayChartWidth, height: '100%', minWidth: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={dailyPlanData} margin={{ top: 14, right: 12, left: -10, bottom: 0 }} barSize={18} barGap={1} barCategoryGap="10%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#d0dff0" vertical={false} />
                      <XAxis dataKey="day" interval={0} tick={{ fontSize: 10, fill: '#6890b0' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 120]} ticks={[0, 20, 40, 60, 80, 100, 120]} tick={{ fontSize: 10, fill: '#6890b0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                      {/* shared={false}: tooltip bám theo ĐÚNG CỘT (từng ca) đang trỏ, không gom cả 3 ca của ngày.
                          cursor={false}: Recharts luôn tô sáng trọn băng ngày nên phải tắt, tránh hiểu nhầm là cả ngày. */}
                      <Tooltip
                        wrapperStyle={tooltipWrapperStyle}
                        shared={false}
                        cursor={false}
                        content={<TongHopCaNgayTooltip />}
                      />
                      {/* Mỗi ngày vẽ 3 cột theo thứ tự Ca 1 -> Ca 2 -> Ca 3 (Ca 3 chính là ca có mã 0) */}
                      {SHIFT_ORDER.map(shift => (
                        <Bar key={shift.dataKey} dataKey={`${shift.dataKey}_tyLe`} name={shift.label} radius={[1, 1, 0, 0]}>
                          {dailyPlanData.map((entry, i) => (
                            <Cell
                              key={`cell-${shift.dataKey}-${i}`}
                              fill={getDailyPlanChartColor(entry[`${shift.dataKey}_tyLe`])}
                            />
                          ))}
                          {/* Nhãn sản lượng thực tế hiển thị ngay trên đầu mỗi cột */}
                          <LabelList
                            dataKey={`${shift.dataKey}_sanLuong`}
                            position="top"
                            offset={4}
                            style={{ fontSize: 9, fill: '#475569', fontWeight: 'bold' }}
                            formatter={value => (value > 0 ? value : '')}
                          />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    );
  };

  // State theo dõi tiến trình xuất báo cáo tổng hợp
  const [isExportingCombined, setIsExportingCombined] = useState(false);

  // Hàm xuất BÁO CÁO TỔNG HỢP CẢ 3: Hoạt động (Realtime), Công thức (Recipe) và Cài đặt (Setting) vào 1 file Excel duy nhất
  const handleExportCombinedParameters = async () => {
    console.log(`>>> [MayCatVaiDashboard] Người dùng bấm XUẤT BÁO CÁO EXCEL TỔNG HỢP - Máy: ${equipmentId}`);
    setIsExportingCombined(true);
    toast.info("Đang tổng hợp thông số Hoạt động, Công thức và Cài đặt của máy...");
    try {
      const params = { maMay: equipmentId };
      const [rtData, rcData, stData] = await Promise.all([
        getChartRealTimeORCV(params).catch(err => {
          console.error(">>> [MayCatVaiDashboard] Lỗi tải Realtime:", err);
          return [];
        }),
        getChartRecipeORCV(params).catch(err => {
          console.error(">>> [MayCatVaiDashboard] Lỗi tải Recipe:", err);
          return [];
        }),
        getChartSettingORCV(params).catch(err => {
          console.error(">>> [MayCatVaiDashboard] Lỗi tải Setting:", err);
          return [];
        })
      ]);

      const matchEquipment = (item) => item?.maMay && item.maMay.trim().toUpperCase() === equipmentId.trim().toUpperCase();
      const realTimeRecord = Array.isArray(rtData) ? rtData.find(matchEquipment) || rtData[0] : null;
      const recipeRecord = Array.isArray(rcData) ? rcData.find(matchEquipment) || rcData[0] : null;
      const settingRecord = Array.isArray(stData) ? stData.find(matchEquipment) || stData[0] : null;

      console.log(">>> [MayCatVaiDashboard] Kết quả lấy dữ liệu tổng hợp:", {
        hasRealTime: !!realTimeRecord,
        hasRecipe: !!recipeRecord,
        hasSetting: !!settingRecord
      });

      if (!realTimeRecord && !recipeRecord && !settingRecord) {
        toast.warn("Chưa có dữ liệu thông số nào của máy cắt vải để xuất!");
        return;
      }

      const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

      exportCombinedMachineParametersToExcel({
        equipmentId,
        realTimeRecord,
        realTimeFields: flatRealtimeFields,
        settingRecord,
        settingFields: flatSettingFields,
        recipeRecord,
        recipeFields: currentRecipeConfig,
        fileName: `BaoCao_TongHop_ThongSo_${equipmentId}_${timeStamp}`,
        title: `BÁO CÁO TỔNG HỢP THÔNG SỐ HOẠT ĐỘNG, CÔNG THỨC & CÀI ĐẶT — MÁY ${equipmentId}`
      });
    } catch (err) {
      console.error(">>> [MayCatVaiDashboard] Lỗi khi xuất báo cáo tổng hợp:", err);
      toast.error("Có lỗi xảy ra khi tổng hợp dữ liệu xuất Excel!");
    } finally {
      setIsExportingCombined(false);
    }
  };

  // Hàm xử lý xuất Excel cho thông số hiện tại theo từng tab con (RealTime / Recipe / Setting)
  const handleExportCurrentTabParameters = () => {
    console.log(`>>> [MayCatVaiDashboard] Người dùng bấm Xuất Excel thông số hiện tại tab: ${chartTab}, máy: ${equipmentId}`);
    if (!latestRecord) {
      toast.warn("Chưa có dữ liệu thông số để xuất!");
      return;
    }
    let fields = [];
    let tabName = '';
    let tabTitle = '';
    if (chartTab === 'realtime') {
      fields = flatRealtimeFields;
      tabName = 'RealTime';
      tabTitle = 'THÔNG SỐ HOẠT ĐỘNG (REALTIME)';
    } else if (chartTab === 'recipe') {
      fields = currentRecipeConfig;
      tabName = 'Recipe';
      tabTitle = 'THÔNG SỐ CÔNG THỨC (RECIPE)';
    } else {
      fields = flatSettingFields;
      tabName = 'Setting';
      tabTitle = 'THÔNG SỐ CÀI ĐẶT (SETTING)';
    }
    const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    exportKeyValueListToExcel({
      dataRecord: latestRecord,
      fields,
      fileName: `ThongSo_HienTai_${tabName}_${equipmentId}_${timeStamp}`,
      sheetName: `${tabName}_HienTai`,
      title: `${tabTitle} HIỆN TẠI — MÁY ${equipmentId}`,
      equipmentId
    });
  };

  // RENDER TAB 2: Thông số hoạt động và cài đặt máy (Module cũ)
  const renderChartDataTab = () => {
    return (
      <div className="mes-fade">
        <div style={{
          background: '#ffffff',
          borderRadius: '4px',
          padding: '8px 12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Navigation Tabs Con */}
          <div style={{ display: 'flex', borderBottom: '2px solid #cbd5e1', gap: '4px', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
            {[
              { id: 'realtime', label: 'THÔNG SỐ HOẠT ĐỘNG (REALTIME)' },
              { id: 'recipe', label: 'THÔNG SỐ CÔNG THỨC (RECIPE)' },
              { id: 'setting', label: 'THÔNG SỐ CÀI ĐẶT (SETTING)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setChartTab(tab.id);
                  setDataList([]);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderBottom: chartTab === tab.id ? '3px solid #1e40af' : 'none',
                  background: chartTab === tab.id ? '#f1f5f9' : 'transparent',
                  color: chartTab === tab.id ? '#1e40af' : '#475569',
                  cursor: 'pointer',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters & History Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {chartTab === 'realtime' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Tự động làm mới:</span>
                  <select
                    value={refreshInterval}
                    onChange={e => {
                      const val = Number(e.target.value);
                      console.log(`>>> [Auto Refresh] Chọn khoảng làm mới: ${val}ms`);
                      setRefreshInterval(val);
                    }}
                    style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
                  >
                    <option value={1000}>1 giây</option>
                    <option value={1500}>1.5 giây</option>
                    <option value={2000}>2 giây</option>
                    <option value={0}>Tắt</option>
                  </select>
                </div>
              )}

              <button
                onClick={fetchData}
                style={{
                  height: '28px',
                  padding: '0 14px',
                  fontSize: '11px',
                  background: '#1e40af',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                LÀM MỚI DỮ LIỆU
              </button>

              <button
                onClick={handleExportCombinedParameters}
                disabled={isExportingCombined}
                style={{
                  height: '28px',
                  padding: '0 14px',
                  fontSize: '11px',
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  fontWeight: 'bold',
                  cursor: isExportingCombined ? 'not-allowed' : 'pointer',
                  opacity: isExportingCombined ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
                title="Xuất 1 file Excel báo cáo tổng hợp chứa cả Thông số hoạt động, Công thức và Cài đặt của máy"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                {isExportingCombined ? 'ĐANG TỔNG HỢP...' : 'XUẤT BÁO CÁO EXCEL (TỔNG HỢP)'}
              </button>
            </div>

            {/* Các nút lịch sử nằm góc phải */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  console.log(`>>> [MayCatVaiDashboard] Bấm nút xem lịch sử cho tab: ${chartTab}, máy: ${equipmentId}`);
                  if (chartTab === 'realtime') setShowRealtimeHistory(true);
                  else if (chartTab === 'recipe') setShowRecipeHistory(true);
                  else if (chartTab === 'setting') setShowSettingHistory(true);
                }}
                style={{
                  height: '28px',
                  padding: '0 14px',
                  fontSize: '11px',
                  background: '#ffffff',
                  color: '#334155',
                  border: '1.5px solid #64748b',
                  borderRadius: '3px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s'
                }}
              >
                {chartTab === 'recipe'
                  ? 'LỊCH CÀI ĐẶT CÔNG THỨC'
                  : chartTab === 'setting'
                    ? 'LỊCH THÔNG SỐ CÀI ĐẶT'
                    : 'LỊCH SỬ REALTIME'}
              </button>

              {(chartTab === 'recipe' || chartTab === 'setting') && (
                <button
                  onClick={() => {
                    console.log(`>>> [MayCatVaiDashboard] Bấm nút LỊCH THÔNG SỐ THAY ĐỔI (Change), chartTab: ${chartTab}, máy: ${equipmentId}`);
                    setShowChangeHistory(true);
                  }}
                  style={{
                    height: '28px',
                    padding: '0 14px',
                    fontSize: '11px',
                    background: '#ffffff',
                    color: '#334155',
                    border: '1.5px solid #64748b',
                    borderRadius: '3px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s'
                  }}
                >
                  LỊCH THÔNG SỐ THAY ĐỔI
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lưới hiển thị thông số Realtime */}
        {chartTab === 'realtime' && (
          <div style={{ background: '#ffffff', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '16px', marginBottom: '12px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>Đang tải thông số realtime...</div>
            ) : !latestRecord ? (
              <div className="mes-empty">Không có dữ liệu realtime mới nhất</div>
            ) : (
              <div className="th-responsive-grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
                {flatRealtimeFields.map(field => {
                  const val = latestRecord[field.key];
                  return (
                    <div key={field.key} style={{
                      display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '11px', background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', gap: '8px',
                      minWidth: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}>
                      <span style={{
                        color: '#475569', fontWeight: '600', textAlign: 'left', lineHeight: '1.2',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: 0
                      }} title={field.label}>
                        {field.label}
                      </span>
                      <span style={{
                        color: '#0f172a', fontWeight: 'bold', fontSize: '11px', textAlign: 'right', whiteSpace: 'nowrap',
                        flexShrink: 0, background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', border: '1px solid #e2e8f0'
                      }}>
                        {renderValue(val, field.key)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lưới hiển thị thông số Recipe */}
        {chartTab === 'recipe' && (
          <div style={{ background: '#ffffff', borderRadius: '4px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', marginBottom: '10px', borderBottom: '2px solid #16a34a', paddingBottom: '4px' }}>
              THÔNG SỐ CÔNG THỨC (RECIPE) MỚI NHẤT
            </h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>Đang tải thông số recipe...</div>
            ) : !latestRecord ? (
              <div className="mes-empty">Không có dữ liệu recipe mới nhất</div>
            ) : (
              <div className="th-responsive-grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                {currentRecipeConfig.map(field => {
                  const val = latestRecord[field.key];
                  return (
                    <div key={field.key} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px',
                      background: '#f8fafc', padding: '6px 10px', borderRadius: '2px', borderLeft: '3px solid #16a34a',
                      minWidth: 0, overflow: 'hidden'
                    }}>
                      <span style={{
                        color: '#475569', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: 0, marginRight: '6px'
                      }} title={field.label}>
                        {field.label}
                      </span>
                      <span style={{ color: '#0f172a', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {renderValue(val, field.key)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lưới hiển thị thông số Setting */}
        {chartTab === 'setting' && (
          <div style={{ background: '#ffffff', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '16px', marginBottom: '12px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>Đang tải thông số cài đặt...</div>
            ) : !latestRecord ? (
              <div className="mes-empty">Không có dữ liệu cài đặt mới nhất</div>
            ) : (
              <div className="th-responsive-grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
                {flatSettingFields.map(field => {
                  const val = latestRecord[field.key];
                  return (
                    <div key={field.key} style={{
                      display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '11px', background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', gap: '8px',
                      minWidth: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}>
                      <span style={{
                        color: '#475569', fontWeight: '600', textAlign: 'left', lineHeight: '1.2',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: 0
                      }} title={field.label}>
                        {field.label}
                      </span>
                      <span style={{
                        color: '#0f172a', fontWeight: 'bold', fontSize: '11px', textAlign: 'right', whiteSpace: 'nowrap',
                        flexShrink: 0, background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', border: '1px solid #e2e8f0'
                      }}>
                        {renderValue(val, field.key)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mes-dash">
      <style>{css}</style>

      {/* Header bar */}
      <div className="mes-title-bar">
        <div className="mes-title-left">
          <button className="mes-back-btn" onClick={() => navigate('/dashboard/may-thanh-hinh')} title="Quay lại danh sách máy">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1a3a5c" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="mes-page-eyebrow">Hệ thống SCADA cắt vải</div>
            <h1 className="mes-page-title">GIÁM SÁT THIẾT BỊ MÁY CẮT VẢI #{equipmentId}</h1>
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: '#1e3a8a', fontWeight: 'bold', background: '#eef5fc', border: '1px solid #b8cce0', padding: '5px 12px', borderRadius: '3px' }}>
          MÁY CẮT VẢI: {isCV01 ? "CV01" : "CV02/CV03"}
        </div>
      </div>

      {/* Tabs cấp cao nhất */}
      <div className="mes-tabs">
        <button
          className={`mes-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard hiệu suất
        </button>
        <button
          className={`mes-tab-btn ${activeTab === 'chartData' ? 'active' : ''}`}
          onClick={() => setActiveTab('chartData')}
        >
          Thông số hoạt động và cài đặt của máy
        </button>
      </div>

      {/* NỘI DUNG TABS CHÍNH */}
      {activeTab === 'dashboard' && renderDashboardTab()}
      {activeTab === 'chartData' && renderChartDataTab()}

      {/* Lịch sử Popups */}
      {showRealtimeHistory && (
        <RealTimeORCVHistory
          equipmentId={equipmentId}
          onClose={() => setShowRealtimeHistory(false)}
        />
      )}
      {showRecipeHistory && (
        <RecipeORCVHistory
          equipmentId={equipmentId}
          onClose={() => setShowRecipeHistory(false)}
        />
      )}
      {showSettingHistory && (
        <SettingORCVHistory
          equipmentId={equipmentId}
          onClose={() => setShowSettingHistory(false)}
        />
      )}
      {showChangeHistory && (
        <CatVaiChangeHistory
          equipmentId={equipmentId}
          initialType={chartTab === 'recipe' ? 'recipe' : 'setting'}
          onClose={() => setShowChangeHistory(false)}
        />
      )}
    </div>
  );
};

export default MayCatVaiDashboard;
