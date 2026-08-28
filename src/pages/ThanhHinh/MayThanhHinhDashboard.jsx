// src/pages/ThanhHinh/MayThanhHinhDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getDashboardMay,
  getDashboardStats,
  getTongHopCaNgay,
  getChartRealTime,
  getChartSetting,
  getChartRealTimeTH09,
  getChartSettingTH09,
  getChartRealTimeTH05,
  getChartSettingTH05,
  getShiftStats,
  getMachineStatusTimes,
  getMachineStatusTimesByMonth,
  getViewOrcThMachineImageApi
} from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LabelList,
} from 'recharts';

import RealTimeTH02History from './RealTimeTH02History';
import RealTimeTH09History from './RealTimeTH09History';
import RealTimeTH05History from './RealTimeTH05History';
import SettingTH02History from './SettingTH02History';
import SettingTH09History from './SettingTH09History';
import SettingTH05History from './SettingTH05History';
import ThanhHinhChangeHistory from '../../components/change/ThanhHinhChangeHistory';
import { getCurrentShift, isCurrentShiftSelected } from '../../utils/shiftPolling';
import {
  SHIFT_ORDER,
  getChartShiftRange,
  buildTongHopCaNgayChartData
} from '../../utils/tongHopCaNgayChart';
import TongHopCaNgayTooltip from '../../components/chart/TongHopCaNgayTooltip';

/* ─── MES Desktop Style ──────────────────────────────────────────────────── */
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

  /* ── Filter bar ── */
  .mes-filterbar {
    background: #d4e4f4; border: 1px solid #96afc8; border-radius: 3px;
    padding: 5px 10px;
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .mes-fb-label { font-size: 12px; font-weight: 700; color: #1a3a5c; white-space: nowrap; }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-select {
    border: 1px solid #6890b0; background: #fff;
    padding: 2px 6px; font-size: 12px; font-weight: 600; color: #1a3a5c;
    border-radius: 2px; outline: none; height: 24px;
    font-family: Arial, Helvetica, sans-serif;
  }
  .mes-select:focus { border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15); }
  .mes-filter-btn {
    display: flex; align-items: center; gap: 5px;
    background: linear-gradient(180deg, #f0f8ff 0%, #d0e8fc 100%);
    border: 1px solid #6890b0; border-radius: 2px;
    padding: 0 14px; height: 24px;
    font-size: 12px; font-weight: 700; color: #1a3a5c;
    cursor: pointer; white-space: nowrap; transition: background 0.1s;
  }
  .mes-filter-btn:hover { background: linear-gradient(180deg, #d8f0ff 0%, #b8d8f8 100%); }

  /* ── KPI row ── */
  .mes-kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px; margin-bottom: 10px;
  }
  .mes-kpi-card {
    background: #fff; border: 1px solid #b8cce0;
    border-left: 3px solid #1565C0; border-radius: 3px;
    padding: 8px 12px;
  }
  .mes-kpi-lbl {
    font-size: 10px; font-weight: 700; color: #6890b0;
    text-transform: uppercase; letter-spacing: 0.8px;
    display: block; margin-bottom: 4px;
  }
  .mes-kpi-val {
    font-size: 19px; font-weight: 900;
    font-variant-numeric: tabular-nums;
    display: block; line-height: 1.1;
  }
  .mes-kpi-unit { font-size: 10px; font-weight: 600; color: #96afc8; margin-top: 2px; display: block; }

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

  /* ── 2-col grid ── */
  .mes-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  @media (max-width: 800px) { .mes-grid-2 { grid-template-columns: 1fr; } }

  /* ── Stats list inside panel ── */
  .mes-stat-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 7px 10px; background: #eef5fc;
    border: 1px solid #d0dff0; border-radius: 2px; margin-bottom: 5px;
  }
  .mes-stat-row-label { font-size: 12px; font-weight: 600; color: #4a6a8a; }
  .mes-stat-row-value { font-size: 13px; font-weight: 900; font-variant-numeric: tabular-nums; }

  /* ── Progress bars in donut panel ── */
  .mes-prog-wrap { height: 7px; background: #d8e8f4; border-radius: 1px; overflow: hidden; margin-top: 4px; }
  .mes-prog-fill { height: 100%; border-radius: 1px; transition: width 1s ease; }

  /* ── Info box (kế hoạch / thực tế) ── */
  .mes-info-box {
    padding: 8px 12px; border-radius: 2px;
    border: 1px solid #d0dff0; margin-bottom: 6px;
  }
  .mes-info-lbl { font-size: 11px; color: #96afc8; font-weight: 600; margin-bottom: 2px; display: block; }
  .mes-info-val { font-size: 14px; font-weight: 900; font-variant-numeric: tabular-nums; }

  /* ── Legend pills ── */
  .mes-legend { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 8px; }
  .mes-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #4a6a8a; }
  .mes-legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
  .mes-legend-line { width: 20px; height: 3px; border-radius: 1px; flex-shrink: 0; }

  /* ── Uptime pills ── */
  .mes-uptime-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
  .mes-uptime-pill {
    padding: 5px 12px; border-radius: 2px;
    border: 1px solid; display: flex; align-items: center; gap: 6px;
  }
  .mes-uptime-pill-lbl { font-size: 11px; font-weight: 700; color: #4a6a8a; }
  .mes-uptime-pill-val { font-size: 13px; font-weight: 900; font-variant-numeric: tabular-nums; }

  /* ── Empty state ── */
  .mes-empty {
    text-align: center; padding: 50px 20px;
    color: #96afc8; font-size: 13px; font-weight: 600;
  }

  /* ── Quality rows ── */
  .mes-quality-row {
    display: flex; justify-content: space-between;
    padding: 6px 10px; background: #eef5fc;
    border: 1px solid #d0dff0; border-radius: 2px; margin-bottom: 4px;
  }

  /* ── Spinner ── */
  .mes-spinner-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    font-family: Arial, Helvetica, sans-serif;
  }
  .mes-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid #b8cce0; border-top-color: #1565C0;
    animation: spin 0.7s linear infinite; margin: 0 auto 12px;
  }
  .mes-spinner-lbl { font-size: 13px; font-weight: 600; color: #5a7a9a; text-align: center; }

  /* ── Tooltip recharts ── */
  .recharts-default-tooltip {
    font-family: Arial, Helvetica, sans-serif !important;
    font-size: 11px !important;
    border: 1px solid #96afc8 !important;
    border-radius: 2px !important;
  }

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

  /* ── Modal popup ── */
  .mes-modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadein 0.2s ease both;
  }
  .mes-modal-content {
    background: #fff; border-radius: 4px; width: 100%; max-width: 900px;
    max-height: 90vh; overflow-y: auto; border: 1px solid #96afc8;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex; flex-direction: column;
  }
  .mes-modal-header {
    background: linear-gradient(180deg, #d8e8f4 0%, #c8ddf0 100%);
    border-bottom: 1px solid #96afc8; padding: 10px 15px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .mes-modal-title { font-size: 13px; font-weight: 900; color: #1a3a5c; text-transform: uppercase; }
  .mes-modal-close {
    background: transparent; border: none; font-size: 20px; font-weight: 700;
    color: #4a6a8a; cursor: pointer; line-height: 1;
  }
  .mes-modal-close:hover { color: #b91c1c; }
  .mes-modal-body { padding: 15px; }

  /* ── Details Grid ── */
  .mes-details-section { margin-bottom: 15px; }
  .mes-details-section-title {
    font-size: 11px; font-weight: 800; color: #c2410c;
    text-transform: uppercase; border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px; margin-bottom: 8px;
  }
  .mes-details-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 8px;
  }
  .mes-detail-item {
    display: flex; justify-content: space-between; background: #f8fafc;
    border: 1px solid #e2e8f0; padding: 5px 8px; border-radius: 2px;
    font-size: 11px; gap: 10px;
  }
  .mes-detail-name { color: #5a7a9a; font-weight: 600; text-align: left; }
  .mes-detail-value { color: #1a3a5c; font-weight: 700; font-variant-numeric: tabular-nums; word-break: break-all; text-align: right; }

  /* ── Table Styles ── */
  .mes-table-container {
    width: 100%; max-height: 480px; overflow-y: auto; overflow-x: auto;
    border: 1px solid #b8cce0; border-radius: 3px; background: #fff;
    margin-bottom: 10px; position: relative;
  }
  .mes-table {
    width: max-content; min-width: 100%; border-collapse: collapse; text-align: left;
    font-size: 11px; font-family: Arial, Helvetica, sans-serif;
  }
  .mes-table th {
    position: sticky; top: 0; z-index: 10;
    background: linear-gradient(180deg, #eef5fc 0%, #d8e8f4 100%);
    color: #1a3a5c; font-weight: 700; padding: 6px 10px;
    border-bottom: 2px solid #96afc8; border-right: 1px solid #d0dff0;
    white-space: nowrap; box-shadow: inset 0 -1px 0 #96afc8;
  }
  .mes-table td {
    padding: 6px 10px; border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0; color: #334155;
    white-space: nowrap;
  }
  .mes-table tr:nth-child(even) { background: #f8fafc; }
  .mes-table tr:hover { background: #f1f5f9; }
  
  /* ── Action buttons in table ── */
  .mes-btn-sm {
    padding: 2px 8px; font-size: 10px; font-weight: 700;
    border-radius: 2px; cursor: pointer; border: 1px solid #6890b0;
    background: linear-gradient(180deg, #f0f8ff 0%, #d0e8fc 100%);
    color: #1a3a5c; transition: all 0.1s;
  }
  .mes-btn-sm:hover {
    background: linear-gradient(180deg, #d8f0ff 0%, #b8d8f8 100%);
  }

  /* ── Pagination ── */
  .mes-pagination {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 8px; margin-top: 5px; flex-wrap: wrap; margin-bottom: 5px;
  }
  .mes-pag-info { font-size: 11px; color: #5a7a9a; font-weight: 600; margin-right: 10px; }
  .mes-pag-btn {
    padding: 2px 8px; font-size: 11px; font-weight: 700;
    background: #fff; border: 1px solid #cbd5e1; border-radius: 2px;
    color: #475569; cursor: pointer; transition: all 0.1s;
  }
  .mes-pag-btn:hover:not(:disabled) {
    background: #f1f5f9; border-color: #94a3b8; color: #0f172a;
  }
  .mes-pag-btn:disabled {
    opacity: 0.5; cursor: not-allowed;
  }

  /* ── Input Filters ── */
  .mes-fb-input {
    border: 1px solid #6890b0; background: #fff;
    padding: 2px 8px; font-size: 12px; font-weight: 600; color: #1a3a5c;
    border-radius: 2px; outline: none; height: 24px;
    width: 140px;
  }
  .mes-fb-input:focus {
    border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15);
  }
  .mes-btn-primary {
    background: linear-gradient(180deg, #1e88e5 0%, #1565c0 100%);
    border: 1px solid #1565c0; color: #fff;
  }
  .mes-btn-primary:hover {
    background: linear-gradient(180deg, #2196f3 0%, #1e88e5 100%);
  }

  /* ══ KHỐI TỔNG QUAN TRẠNG THÁI CA (ảnh máy | bộ lọc + KPI + 2 biểu đồ) ══ */
  .th-overview {
    display: grid;
    grid-template-columns: 380px minmax(0, 1fr);
    gap: 12px; align-items: stretch; margin-bottom: 12px;
  }
  @media (max-width: 1100px) { .th-overview { grid-template-columns: 1fr; } }
  /* Cột phải của khối tổng quan: thanh lọc + KPI, tự giãn để cao bằng ảnh máy */
  .th-ov-right { display: flex; flex-direction: column; gap: 10px; min-width: 0; }

  /* ── Ảnh máy: ảnh tự giãn lấp đầy chiều cao của hàng, không để lại khoảng trắng ── */
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

  /* ── Dải KPI của ca ── */
  .th-kpis {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px; flex: 1;
  }
  .th-kpi {
    background: #fff; border: 1px solid #cbd5e1; border-left: 3px solid #1565C0;
    border-radius: 4px; padding: 8px 12px; min-width: 0;
    display: flex; flex-direction: column; justify-content: center;
  }
  .th-kpi-lbl {
    display: block; margin-bottom: 4px;
    font-size: 10px; font-weight: 800; color: #6890b0;
    text-transform: uppercase; letter-spacing: 0.8px;
  }
  .th-kpi-line { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  .th-kpi-val { font-size: 23px; font-weight: 900; color: #1e3a8a; line-height: 1.05; }
  .th-kpi-val small { font-size: 12px; font-weight: 800; color: #64748b; margin-left: 2px; }
  .th-kpi-pct { font-size: 15px; font-weight: 900; }
  .th-kpi-sub { display: block; margin-top: 4px; font-size: 10.5px; font-weight: 700; color: #94a3b8; }
  .th-kpi-spec {
    display: block; font-size: 16px; font-weight: 900; color: #1e293b;
    line-height: 1.25; word-break: break-word;
  }
  .th-meter { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-top: 6px; }
  .th-meter-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }

  /* ── Lưới 2 biểu đồ trạng thái (chiếm trọn bề ngang, 2 thẻ luôn cao bằng nhau) ── */
  .th-chart-grid {
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
    gap: 12px; align-items: stretch; margin-bottom: 12px;
  }
  @media (max-width: 1150px) { .th-chart-grid { grid-template-columns: 1fr; } }

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
  /* Phần dư chiều cao được ô số liệu hút hết, không để hở đáy thẻ */
  .th-card-body--spread { gap: 12px; }

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

  /* ── Ô số liệu nhỏ dưới timeline ── */
  .th-mini-row {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 8px; flex: 1; align-content: stretch;
  }
  .th-mini {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3px; padding: 6px 10px;
    display: flex; flex-direction: column; justify-content: center;
  }
  .th-mini-lbl {
    display: block; font-size: 9.5px; font-weight: 800; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px;
  }
  .th-mini-val {
    font-size: 14px; font-weight: 900; color: #1e293b; font-variant-numeric: tabular-nums;
  }

  /* ── Donut 8h: vòng tròn bên trái, chú thích bên phải để thẻ không bị cao lêu nghêu ── */
  .th-donut-body { display: flex; align-items: center; gap: 14px; flex: 1; }
  @media (max-width: 1150px) { .th-donut-body { justify-content: center; } }
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

  /* ── Chú thích trạng thái (dùng chung cho cả 2 biểu đồ) ── */
  .th-legend {
    flex: 1; min-width: 0; align-self: stretch;
    border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;
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
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 6px;
  }

  /* ── Media Queries Responsive Toàn Diện ── */
  @media (max-width: 1200px) {
    .th-overview { grid-template-columns: 320px minmax(0, 1fr); }
    .th-chart-grid { grid-template-columns: 1fr; }
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
    .th-kpis {
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    .th-kpi { padding: 6px 8px; }
    .th-kpi-val { font-size: 18px; }
    .th-kpi-spec { font-size: 13px; }
    .th-legend-grid-2 {
      grid-template-columns: 1fr;
      gap: 2px;
    }
    .th-donut-body {
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .th-split {
      grid-template-columns: 1fr;
    }
    .th-split-side {
      border-left: none;
      padding-left: 0;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
    .mes-details-grid {
      grid-template-columns: 1fr;
    }
    .mes-modal-content {
      max-width: 95vw;
      max-height: 94vh;
      margin: 10px;
    }
  }

  @media (max-width: 480px) {
    .th-kpis {
      grid-template-columns: 1fr;
    }
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
    .th-mini-row {
      grid-template-columns: 1fr 1fr;
    }
    .th-responsive-grid-auto {
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 4px;
    }
  }
`;

/* ─── Shared chart styles ────────────────────────────────────────────────── */
const axisStyle = { fontSize: 10, fontFamily: "Arial, Helvetica, sans-serif", fill: '#5a7a9a' };
const tooltipStyle = {
  fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, border: '1px solid #96afc8', borderRadius: 2,
  // Nền đục + đổ bóng để chữ luôn đọc được khi tooltip nằm chồng lên biểu đồ phía dưới
  background: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.28)'
};

// Recharts đặt z-index ở lớp BỌC NGOÀI tooltip (wrapperStyle), không phải contentStyle.
// Thiếu nó thì tooltip bị các phần tử có z-index/position khác trong trang che mất.
// Dùng chung cho mọi <Tooltip> để tooltip luôn nổi trên cùng.
const tooltipWrapperStyle = { zIndex: 9999, outline: 'none' };

/* ─── Hằng số thuộc tính TH09+ ────────────────────────────────────────────── */
const realTimeTH09Fields = [
  { key: 'viTriCaSauHuongTam', label: 'Vị trí cà sau hướng tâm' },
  { key: 'viTriCaSauHuongTruc', label: 'Vị trí cà sau hướng trục' },
  { key: 'rongVaiLop', label: 'Rộng vai lốp(mm)' },
  { key: 'noiAp', label: 'Nội áp(bar)' },
  { key: 'apLucCaSau', label: 'Áp lực cà sau(bar)' },
  { key: 'apLucCaTanh', label: 'Áp lực cà tanh(bar)' },
  { key: 'apLucCaVai', label: 'Áp lực cà vai(bar)' },
  { key: 'globalDisableBarcode', label: 'Yêu cầu tích mã vạch' },
  { key: 'globalEnableBarcode', label: 'Trạng thái tích mã vạch' }
];

const settingTH09Fields = [
  { key: 'duongKinhBungTrongThan', label: 'ĐK bụng trống thân' },
  { key: 'duongKinhDanHopTrongThan', label: 'ĐK dán hợp trống thân' },
  { key: 'duongKinhTrongThanThuLai', label: 'ĐK trống thân thu lại' },
  { key: 'duongKinhTrongBungKhiCaVaiThan', label: 'ĐK trống bung khi cà vai thân' },
  { key: 'duongKinhBungTrongThanLonNhat', label: 'ĐK bung trống thân lớn nhất' },
  { key: 'duongKinhBungTrongThanNhoNhat', label: 'ĐK bung trống thân nhỏ nhất' },
  { key: 'trongSHGiaTriThamChieu', label: 'Trống SH giá trị tham chiếu' },
  { key: 'trongSHGioiHanMoLonNhat', label: 'Trống SH giới hạn mở lớn nhất' },
  { key: 'gioiHanDongNhoNhat', label: 'Giới hạn đóng nhỏ nhất' },
  { key: 'rongCongNghe', label: 'Rộng công nghệ' },
  { key: 'viTriDuDinhHinh', label: 'Vị trí dư định hình' },
  { key: 'viTriDinhHinh', label: 'Vị trí định hình' },
  { key: 'viTriSieuDinhHinh', label: 'Vị trí siêu định hình' },
  { key: 'dieuChinhViTriVen', label: 'Điều chỉnh vị trí vén' },
  { key: 'chieuDaiVaiThan', label: 'Chiều dài vai thân' },
  { key: 'chieuDaiHieuChuanVaiThan', label: 'CD hiệu chuẩn vai thân' },
  { key: 'chieuDaiToHopTangLotTrongPA', label: 'CD tổ hợp tầng lót trong PA' },
  { key: 'chieuDaiHieuChuanToHopTangLotTrongPA', label: 'CD hiệu chuẩn TH tầng lót trong PA' },
  { key: 'viTriChoCaToHopTangLotTrongPA', label: 'Vị trí chờ cà TH tầng lót trong PA' },
  { key: 'viTriCuoiCaToHopTangLotTrongPA', label: 'Vị trí cuối cà TH tầng lót trong PA' },
  { key: 'tocDoCaVaiThanGiaiDoan1', label: 'Tốc độ cà vải thân GĐ1' },
  { key: 'viTriCuoiCaVaiThanGiaiDoan1', label: 'Vị trí cuối cà vải thân GĐ1' },
  { key: 'apLucConCaTraiVaiThanGiaiDoan1', label: 'Áp lực con cà trái vải thân GĐ1' },
  { key: 'apLucConCaPhaiVaiThanGiaiDoan1', label: 'Áp lực con cà phải vải thân GĐ1' },
  { key: 'tocDoCaVaiThanGiaiDoan2', label: 'Tốc độ cà vải thân GĐ2' },
  { key: 'viTriCuoiCaVaiThanGiaiDoan2', label: 'Vị trí cuối cà vải thân GĐ2' },
  { key: 'apLucConCaTraiVaiThanGiaiDoan2', label: 'Áp lực con cà trái vải thân GĐ2' },
  { key: 'apLucConCaPhaiVaiThanGiaiDoan2', label: 'Áp lực con cà phải vải thân GĐ2' },
  { key: 'tocDoCaVaiThanGiaiDoan3', label: 'Tốc độ cà vải thân GĐ3' },
  { key: 'viTriCuoiCaVaiThanGiaiDoan3', label: 'Vị trí cuối cà vải thân GĐ3' },
  { key: 'apLucConCaTraiVaiThanGiaiDoan3', label: 'Áp lực con cà trái vải thân GĐ3' },
  { key: 'apLucConCaPhaiVaiThanGiaiDoan3', label: 'Áp lực con cà phải vải thân GĐ3' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan1', label: 'Tốc độ H.Tâm cà mặt chạy GĐ1' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan1', label: 'Vị trí H.Tâm cà mặt chạy GĐ1' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan1', label: 'Tốc độ H.Trục cà mặt chạy GĐ1' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan1', label: 'Vị trí H.Trục cà mặt chạy GĐ1' },
  { key: 'apLucCaMatChayGiaiDoan1', label: 'Áp lực cà mặt chạy GĐ1' },
  { key: 'gocXoayCaMatChayGiaiDoan1', label: 'Góc xoay cà mặt chạy GĐ1' },
  { key: 'tocDoXoayCaMatChayGiaiDoan1', label: 'Tốc độ xoay cà mặt chạy GĐ1' },
  { key: 'thoiGianCaMatChayGiaiDoan1', label: 'Thời gian cà mặt chạy GĐ1' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan2', label: 'Tốc độ H.Tâm cà mặt chạy GĐ2' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan2', label: 'Vị trí H.Tâm cà mặt chạy GĐ2' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan2', label: 'Tốc độ H.Trục cà mặt chạy GĐ2' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan2', label: 'Vị trí H.Trục cà mặt chạy GĐ2' },
  { key: 'apLucCaMatChayGiaiDoan2', label: 'Áp lực cà mặt chạy GĐ2' },
  { key: 'gocXoayCaMatChayGiaiDoan2', label: 'Góc xoay cà mặt chạy GĐ2' },
  { key: 'tocDoXoayCaMatChayGiaiDoan2', label: 'Tốc độ xoay cà mặt chạy GĐ2' },
  { key: 'thoiGianCaMatChayGiaiDoan2', label: 'Thời gian cà mặt chạy GĐ2' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan3', label: 'Tốc độ H.Tâm cà mặt chạy GĐ3' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan3', label: 'Vị trí H.Tâm cà mặt chạy GĐ3' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan3', label: 'Tốc độ H.Trục cà mặt chạy GĐ3' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan3', label: 'Vị trí H.Trục cà mặt chạy GĐ3' },
  { key: 'apLucCaMatChayGiaiDoan3', label: 'Áp lực cà mặt chạy GĐ3' },
  { key: 'gocXoayCaMatChayGiaiDoan3', label: 'Góc xoay cà mặt chạy GĐ3' },
  { key: 'tocDoXoayCaMatChayGiaiDoan3', label: 'Tốc độ xoay cà mặt chạy GĐ3' },
  { key: 'thoiGianCaMatChayGiaiDoan3', label: 'Thời gian cà mặt chạy GĐ3' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan4', label: 'Tốc độ H.Tâm cà mặt chạy GĐ4' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan4', label: 'Vị trí H.Tâm cà mặt chạy GĐ4' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan4', label: 'Tốc độ H.Trục cà mặt chạy GĐ4' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan4', label: 'Vị trí H.Trục cà mặt chạy GĐ4' },
  { key: 'apLucCaMatChayGiaiDoan4', label: 'Áp lực cà mặt chạy GĐ4' },
  { key: 'gocXoayCaMatChayGiaiDoan4', label: 'Góc xoay cà mặt chạy GĐ4' },
  { key: 'tocDoXoayCaMatChayGiaiDoan4', label: 'Tốc độ xoay cà mặt chạy GĐ4' },
  { key: 'thoiGianCaMatChayGiaiDoan4', label: 'Thời gian cà mặt chạy GĐ4' },
  { key: 'caVongTanhViTriCho', label: 'Cà vòng tanh vị trí chờ' },
  { key: 'apLucCaVongTanh', label: 'Áp lực cà vòng tanh' },
  { key: 'caVongTanhViTriCuoi', label: 'Cà vòng tanh vị trí cuối' },
  { key: 'tocDoCaVongTanh', label: 'Tốc độ cà vòng tanh' },
  { key: 'viTriCuoiCaBocGot', label: 'Vị trí cuối cà bóc gót' },
  { key: 'apLucCaBocGotTrai', label: 'Áp lực cà bóc gót trái' },
  { key: 'apLucCaBocGotPhai', label: 'Áp lực cà bóc gót phải' },
  { key: 'viTriChoCaBocGot', label: 'Vị trí chờ cà bóc gót' },
  { key: 'caHongViTriGiaiDoan1', label: 'Cà hông vị trí GĐ1' },
  { key: 'caHongTocDoGiaiDoan1', label: 'Cà hông tốc độ GĐ1' },
  { key: 'thoiGianCaHongGiaiDoan1', label: 'Thời gian cà hông GĐ1' },
  { key: 'apLucCaHongGiaiDoan1', label: 'Áp lực cà hông GĐ1' },
  { key: 'caHongViTriGiaiDoan2', label: 'Cà hông vị trí GĐ2' },
  { key: 'caHongTocDoGiaiDoan2', label: 'Cà hông tốc độ GĐ2' },
  { key: 'thoiGianCaHongGiaiDoan2', label: 'Thời gian cà hông GĐ2' },
  { key: 'apLucCaHongGiaiDoan2', label: 'Áp lực cà hông GĐ2' },
  { key: 'caHongViTriGiaiDoan3', label: 'Cà hông vị trí GĐ3' },
  { key: 'caHongTocDoGiaiDoan3', label: 'Cà hông tốc độ GĐ3' },
  { key: 'thoiGianCaHongGiaiDoan3', label: 'Thời gian cà hông GĐ3' },
  { key: 'apLucCaHongGiaiDoan3', label: 'Áp lực cà hông GĐ3' },
  { key: 'caTamGiac2GiaiDoanViTriCuoi', label: 'Cà tam giác 2 GĐ VT cuối' },
  { key: 'caTamGiac2GiaiDoanTocDoConLan', label: 'Cà tam giác 2 GĐ tốc độ con lăn' },
  { key: 'caTamGiac2GiaiDoanApLuc', label: 'Cà tam giác 2 GĐ áp lực' }
];

const realTimeTH02Fields = [
  { key: 'prgmServoBDSVActualVelocity', label: 'Tốc độ trống hoán xung' },
  { key: 'prgmServoBDSVCActPos', label: 'Góc định vị BD' },
  { key: 'prgmServoCDSVActualVelocity', label: 'Tốc độ trống thân' },
  { key: 'prgmServoSDSVActualVelocity', label: 'Tốc độ trống chính' },
  { key: 'prgmServoSDSVCActPos', label: 'Góc định vị SD' },
  { key: 'prgmServoSDSDWid', label: 'Khoảng cách đặt tanh' },
  { key: 'prgmServoStRdSVCActPos', label: 'Vị trí cà hướng tâm mm' },
  { key: 'prgmServoStRtSVCActPos', label: 'Vị trí cà xoay' },
  { key: 'globalAISDLkPres', label: 'Áp lực nan quạt' },
  { key: 'globalAISDPres', label: 'Nội áp' },
  { key: 'globalDisableBarcode', label: 'Yêu cầu tích mã vạch' },
  { key: 'globalEnableBarcode', label: 'Trạng thái tích mã vạch' }
];

const settingTH02Fields = [
  { key: 'apLucCaBocGot', label: 'AL cà bóc gót' },
  { key: 'tocDoCaBocGot', label: 'Tốc độ cà bóc gót' },
  { key: 'thoiGianCaBocGot', label: 'Thời gian cà bóc gót' },
  { key: 'apLucCaoCaVaiThan', label: 'AL cao cà vải thân' },
  { key: 'apLucThapCaVaiThan', label: 'AL thấp cà vải thân' },
  { key: 'doRongSieuDinhHinhTrongChinh', label: 'Độ rộng siêu định hình trống chính' },
  { key: 'khoangCachDatTanhTrongChinh', label: 'KC đặt tanh trống chính' },
  { key: 'doRongDuDinhHinh', label: 'Độ rộng dư định hình' },
  { key: 'doRongDinhHinhTrongChinh', label: 'Độ rộng định hình trống chính' },
  { key: 'chieuDaiCatVaiThan', label: 'CD cắt vải thân' },
  { key: 'chieuDaiHieuChuanVaiThan', label: 'CD hiệu chuẩn vải thân' },
  { key: 'duongKinhDanHopTrongThan', label: 'ĐK dán hợp trống thân' },
  { key: 'duongKinhTrongThanLonNhat', label: 'ĐK trống thân lớn nhất' },
  { key: 'duongKinhTrongThanNhoNhat', label: 'ĐK trống thân nhỏ nhất' },
  { key: 'chieuDaiCatToHopTLTPA', label: 'CD cắt tổ hợp TLT(PA)' },
  { key: 'chieuDaiCatToHopHieuChuanTLTPA', label: 'CD cắt tổ hợp hiệu chuẩn TLT(PA)' },
  { key: 'caHongCaoAp', label: 'Cà hông cao áp' },
  { key: 'caHongThapAp', label: 'Cà hông thấp áp' },
  { key: 'apLucCaHongDuoi', label: 'AL cà hông dưới' },
  { key: 'apLucCaHongSuTamGiac', label: 'AL cà hông su tam giác' },
  { key: 'apLucCaHongTren', label: 'AL cà hông trên' },
  { key: 'apLucCaKhuVucGiua', label: 'AL cà khu vực giữa' },
  { key: 'apLucCaPhanVai', label: 'AL cà phân vai' },
  { key: 'apLucCaMepBien', label: 'AL cà mép biên' },
  { key: 'viTriDauCaMatChayViTriHuongTam', label: 'VT đầu cà mặt chạy VT H.Tâm' },
  { key: 'viTriDauCaMatChayViTriHuongTruc', label: 'VT đầu cà mặt chạy VT H.Trục' },
  { key: 'viTriDauCaMatChayViTriHuongXoay', label: 'VT đầu cà mặt chạy VT H.Xoay' },
  { key: 'viTriCuoiVungCaThapApViTriTam', label: 'VT cuối vùng cà thấp áp VT H.Tâm' },
  { key: 'viTriCuoiVungCaThapApViTriHuongTruc', label: 'VT cuối vùng cà thấp áp VT H.Trục' },
  { key: 'viTriCuoiVungCaThapApViTriHuongXoay', label: 'VT cuối vùng cà thấp áp VT H.Xoay' },
  { key: 'viTriDauCaCaoApViTriXoay', label: 'VT đầu cà cao áp VT H.Xoay' },
  { key: 'viTriDauCaCaoApViTriHuongTam', label: 'VT đầu cà cao áp VT H.Tâm' },
  { key: 'viTriDauCaCaoApViTriHuongTruc', label: 'VT đầu cà cao áp VT H.Trục' },
  { key: 'viTriMepBienMatLopViTriXoay', label: 'VT mép biên mặt lốp VT H.Xoay' },
  { key: 'viTriMepBienMatLopViTriHuongTruc', label: 'VT mép biên mặt lốp VT H.Trục' },
  { key: 'viTriMepBienMatLopViTriXoay1', label: 'VT mép biên mặt lốp VT H.Xoay_1' },
  { key: 'gocCa1HoanThanhViTriHuongTam', label: 'Góc cà 1 HT vị trí  H.Tâm' },
  { key: 'gocCa1HoanThanhViTriHuongTruc', label: 'Góc cà 1 HT vị trí H.Trục' },
  { key: 'gocCa1HoanThanhViTriXoay', label: 'Góc cà 1 HT vị trí H.Xoay' },
  { key: 'gocCa2HoanThanhViTriHuongTam', label: 'Góc cà 2 HT vị trí H.Tâm' },
  { key: 'gocCa2HoanThanhViTriHuongTruc', label: 'Góc cà 2 HT vị trí H.Trục' },
  { key: 'gocCa2HoanThanhViTriXoay', label: 'Góc cà 2 HT vị trí H.Xoay' },
  { key: 'viTriChoCaHuongTamViTriHuongTam', label: 'VT Chờ cà H.Tâm VT H.Tâm' },
  { key: 'viTriChoCaHuongTamViTriHuongTruc', label: 'VT Chờ cà H.Tâm VT H.Trục' },
  { key: 'viTriChoCaHuongTamViTriXoay', label: 'VT Chờ cà H.Tâm VT H.Xoay' },
  { key: 'viTriDauCaHongViTriHuongTam', label: 'VT Đầu cà hông VT H.Tâm' },
  { key: 'viTriDauCaHongViTriHuongTruc', label: 'VT Đầu cà hông VT H.Trục' },
  { key: 'viTriDauCaHongViTriXoay', label: 'VT Đầu cà hông VT H.Xoay' },
  { key: 'viTriDauCaThapApVungGiuaHoanThanhViTriHuongTam', label: 'VT Đầu cà thấp áp vùng giữa HT VT H.Tâm' },
  { key: 'viTriDauCaThapApVungGiuaViTriHuongTruc', label: 'VT Đầu cà thấp áp vùng giữa VT H.Trục' },
  { key: 'viTriDauCaThapApVungGiuaViTriXoay', label: 'VT Đầu cà thấp áp vùng giữa VT Xoay' },
  { key: 'viTriDauCaThapApVungTrenHoanThanhViTriHuongTam', label: 'VT Đầu cà thấp áp vùng trên HT VT H.Tâm' },
  { key: 'viTriDauCaThapApVungTrenViTriHuongTruc', label: 'VT Đầu cà thấp áp vùng trên VT H.Trục' },
  { key: 'viTriDauCaThapApVungTrenViTriXoay', label: 'VT Đầu cà thấp áp vùng trên VT Xoay' },
  { key: 'viTriCuoiCaHongHoanThanhViTriHuongTam', label: 'VT Cuối cà hông VT H.Tâm' },
  { key: 'viTriCuoiCaHongHoanThanhViTriHuongTruc', label: 'VT Cuối cà hông VT H.Trục' },
  { key: 'viTriCuoiCaHongHoanThanhViTriXoay', label: 'VT Cuối cà hông VT H.Xoay' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTam', label: 'VT Đầu cà su tam giác VT H.Tâm' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTruc', label: 'VT Đầu cà su tam giác VT H.Trục' },
  { key: 'viTriDauCaSuTamGiacViTriXoay', label: 'VT Đầu cà su tam giác VT H.Xoay' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTam1', label: 'VT Đầu cà su tam giác 1 VT H.Tâm' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTruc1', label: 'VT Đầu cà su tam giác 1 VT H.Trục' },
  { key: 'viTriDauCaSuTamGiacViTriXoay1', label: 'VT Đầu cà su tam giác 1 VT H.Xoay' },
  { key: 'viTriCuoiHoanThanhViTriHuongTam', label: 'VT Cuối HT VT H.Tâm' },
  { key: 'viTriCuoiHoanThanhViTriHuongTruc', label: 'VT Cuối HT VT H.Trục' },
  { key: 'viTriCuoiHoanThanhViTriXoay', label: 'VT Cuối HT VT H.Xoay' },
  { key: 'viTriChuyenThapApViTriHuongTam', label: 'VT Chuyển thấp áp VT H.Tâm' },
  { key: 'viTriChuyenThapApViTriHuongTruc', label: 'VT Chuyển thấp áp VT H.Trục' },
  { key: 'viTriChuyenThapApViTriXoay', label: 'VT Chuyển thấp áp VT H.Xoay' },
  { key: 'duongKinhBungTrongThan', label: 'ĐK bung trống thân' },
  { key: 'duongKinhTrongThanDuBi', label: 'ĐK trống thân dự bị' }
];

const realTimeTH05Fields = [
  { key: 'prgmServoBDSVActualVelocity', label: 'Tốc độ trống hoãn xung (°/s)' },
  { key: 'prgmServoBDSVCActPos', label: 'Góc Servo trống hoãn xung (°)' },
  { key: 'prgmServoBtrSVActualVelocity', label: 'Tốc độ vòng BTR (mm/s)' },
  { key: 'prgmServoBtrSVCActPos', label: 'Vị trí servo vòng BTR (mm)' },
  { key: 'prgmServoSDSVActualVelocity', label: 'Tốc độ trống chính' },
  { key: 'prgmServoSDSDEncodWid', label: 'Vị trí hiện tại trống thành hình (°)' },
  { key: 'prgmServoSDSVCActPos', label: 'Góc Servo trống thành hình' },
  { key: 'prgmServoSt3SVCActPos', label: 'Vị trí trục 3 cà sau (mm)' },
  { key: 'prgmServoSt4SVCActPos', label: 'Vị trí trục 4 cà sau (mm)' },
  { key: 'globalAISDLkPres', label: 'Áp lực nan quạt' },
  { key: 'globalAISDPres', label: 'Nội áp' }
];

const settingTH05Fields = [
  { key: 'apLucCaBocGot', label: 'Áp lực cà bóc gót' },
  { key: 'apLucCaThanLopGiaiDoan1', label: 'Áp lực cà thân lốp giai đoạn 1' },
  { key: 'apLucCaThanLopGiaiDoan2', label: 'Áp lực cà thân lốp giai đoạn 2' },
  { key: 'sieuDinhHinh', label: 'Siêu định hình' },
  { key: 'thoiGianBomCaoAp', label: 'Thời gian bơm cao áp' },
  { key: 'dinhHinhCaoAp', label: 'Định hình cao áp' },
  { key: 'dinhHinhThapAp', label: 'Định hình thấp áp' },
  { key: 'rongCongNghe', label: 'Rộng công nghệ' },
  { key: 'doRongDuDinhHinh', label: 'Độ rộng dư định hình' },
  { key: 'doRongDinhHinhTrongChinh', label: 'Độ rộng định hình trống chính' },

  { key: 'chieuDaiCatVaiThan', label: 'Chiều dài cắt vải thân' },
  { key: 'chieuDaiHieuChuanCatVaiThan', label: 'Chiều dài hiệu chuẩn cắt vải thân' },
  { key: 'duongKinhDanHopTrongThan', label: 'Đường kính dán hợp trống thân' },
  { key: 'tocDoTrongThan', label: 'Tốc độ trống thân' },
  { key: 'duongKinhLonNhatTrongThan', label: 'Đường kính lớn nhất trống thân' },
  { key: 'duongKinhNhoNhatTrongThan', label: 'Đường kính nhỏ nhất trống thân' },
  { key: 'tocDoQuayTrongThanKhiCaThanLop', label: 'Tốc độ quay trống thân khi cà thân lốp' },
  { key: 'chieuDaiCatToHopTLTPA', label: 'Chiều dài cắt tổ hợp TLT PA' },
  { key: 'chieuDaiHieuChuanCatToHopTLTPA', label: 'Chiều dài hiệu chuẩn cắt tổ hợp TLT PA' },

  { key: 'gocTrongQuayCaBocGot', label: 'Góc trống quay cà bóc gót' },
  { key: 'duongKinhCaVaiThan', label: 'Đường kính cà vải thân' },
  { key: 'viTriCuoiCaTamGiac', label: 'Vị trí cuối cà tam giác' },
  { key: 'tocDoCaTamGiacOViTriCuoi', label: 'Tốc độ cà tam giác ở vị trí cuối' },
  { key: 'apLucCaTamGiacViTriCuoi', label: 'Áp lực cà tam giác vị trí cuối' },
  { key: 'viTriBatDauCaTamGiac', label: 'Vị trí bắt đầu cà tam giác' },
  { key: 'tocDoCaTamGiacOViTriBatDau', label: 'Tốc độ cà tam giác ở vị trí bắt đầu' },
  { key: 'apLucCaTamGiacOViTriDau', label: 'Áp lực cà tam giác ở vị trí đầu' },
  { key: 'viTriChoCaTamGiac', label: 'Vị trí chờ cà tam giác' },
  { key: 'tocDoCaTamGiacOViTriCho', label: 'Tốc độ cà tam giác ở vị trí chờ' },
  { key: 'tocDoCaHongLopOViTriTamGiac', label: 'Tốc độ cà hông lốp ở vị trí tam giác' },
  { key: 'apLucCaTamGiacOViTriVaiThan', label: 'Áp lực cà tam giác ở vị trí vải thân' },
  { key: 'viTriBatDauCaHongLop', label: 'Vị trí bắt đầu cà hông lốp' },
  { key: 'tocDoCaHongLopOViTriBatDau', label: 'Tốc độ cà hông lốp ở vị trí bắt đầu' },
  { key: 'apLucCaHongLopViTriBatDau', label: 'Áp lực cà hông lốp ở vị trí bắt đầu' },
  { key: 'viTriCuoiVaiThanCaHongLop', label: 'Vị trí cuối vải thân cà hông lốp' },
  { key: 'tocDoCaHongLopOViTriVaiThan', label: 'Tốc độ cà hông lốp ở vị trí vải thân' },
  { key: 'apLucCaHongLopOViTriVaiThan', label: 'Áp lực cà hông lốp ở vị trí vải thân' },
  { key: 'viTriCuoiBocGotCaHongLop', label: 'Vị trí cuối bóc gót cà hông lốp' },
  { key: 'tocDoCaHongLopOViTriBocGot', label: 'Tốc độ cà hông lốp ở vị trí bóc gót' },
  { key: 'apLucCaHongLopViTriBocGot', label: 'Áp lực cà hông lốp vị trí bóc gót' },
  { key: 'viTriCuoiMatLopCaHongLop', label: 'Vị trí cuối mặt lốp cà hông lốp' },
  { key: 'tocDoCaHongLopOViTriMatChay', label: 'Tốc độ cà hông lốp ở vị trí mặt chạy' },
  { key: 'apLucCaHongLopOViTriMatLop', label: 'Áp lực cà hông lốp ở vị trí mặt lốp' },
  { key: 'tocDoCaHongLopOViTriCho', label: 'Tốc độ cà hông lốp ở vị trí chờ' },

  { key: 'gocQuayTrongChinhTrucCa1', label: 'Góc quay trống chính trục cà 1' },
  { key: 'tocDoTrucCa2', label: 'Tốc độ trục cà 2' },
  { key: 'apLucKetThucCa2Quay', label: 'Áp lực kết thúc cà 2 quay' },
  { key: 'apLucCa2OViTriChuyenGoc', label: 'Áp lực cà 2 ở vị trí chuyển góc' },
  { key: 'apLucCa2OViTriDungQuayGoc1', label: 'Áp lực cà 2 ở vị trí dừng quay góc 1' },
  { key: 'apLucCa2OViTriDungQuayGoc2', label: 'Áp lực cà 2 ở vị trí dừng quay góc 2' },
  { key: 'viTriBatDauCaTruc4', label: 'Vị trí bắt đầu cà trục 4' },
  { key: 'tocDoTaiViTriBatDauCaTruc4', label: 'Tốc độ tại vị trí bắt đầu cà trục 4' },
  { key: 'apLucTaiViTriBatDauCaTruc4', label: 'Áp lực tại vị trí bắt đầu cà trục 4' },
  { key: 'tocDoCaTruc4TaiViTriBatDauCaoAp', label: 'Tốc độ cà trục 4 tại vị trí bắt đầu cao áp' },
  { key: 'viTriBatDauCaoApCaTruc4', label: 'Vị trí bắt đầu cao áp cà trục 4' },
  { key: 'apLucTaiViTriBatDauCaoApCaTruc4', label: 'Áp lực tại vị trí bắt đầu cao áp cà trục 4' },
  { key: 'viTriKetThucThapApCaTruc4', label: 'Vị trí kết thúc thấp áp cà trục 4' },
  { key: 'tocDoCaTruc4TaiViTriKetThucThapAp', label: 'Tốc độ cà trục 4 tại vị trí kết thúc thấp áp' },
  { key: 'apLucTaiViTriKetThucThapApCaTruc4', label: 'Áp lực tại vị trí kết thúc thấp áp cà trục 4' },
  { key: 'viTriDungQuayGoc1CaTruc4', label: 'Vị trí dừng quay góc 1 cà trục 4' },
  { key: 'tocDoTaiViTriDungQuayGoc1CaTruc4', label: 'Tốc độ tại vị trí dừng quay góc 1 cà trục 4' },
  { key: 'viTriDungQuayGoc2CaTruc4', label: 'Vị trí dừng quay góc 2 cà trục 4' },
  { key: 'tocDoTaiViTriDungQuayGoc2CaTruc4', label: 'Tốc độ tại vị trí dừng quay góc 2 cà trục 4' },
  { key: 'viTriChuyenGocQuayCaTruc4', label: 'Vị trí chuyển góc quay cà trục 4' },
  { key: 'tocDoChuyenGocQuayCaTruc4', label: 'Tốc độ chuyển góc quay cà trục 4' },
  { key: 'viTriKetThucQuayCaTruc4', label: 'Vị trí kết thúc quay cà trục 4' },
  { key: 'tocDoTaiViTriKetThucQuayCaTruc4', label: 'Tốc độ tại vị trí kết thúc quay cà trục 4' },
  { key: 'apLucTaiViTriKetThucQuayCaTruc4', label: 'Áp lực tại vị trí kết thúc quay cà trục 4' },
  { key: 'apLucCaTruc4OViTriDungQuayGoc1', label: 'Áp lực cà trục 4 ở vị trí dừng quay góc 1' },
  { key: 'apLucCaTruc4OViTriDungQuayGoc2', label: 'Áp lực cà trục 4 ở vị trí dừng quay góc 2' },
  { key: 'apLucCaTruc4OViTriChuyenGocQuay', label: 'Áp lực cà trục 4 ở vị trí chuyển góc quay' },
  { key: 'viTriKetThucMatChayCaTruc4', label: 'Vị trí kết thúc mặt chạy cà trục 4' },
  { key: 'tocDoTaiViTriKetThucMatChayCaTruc4', label: 'Tốc độ tại vị trí kết thúc mặt chạy cà trục 4' },
  { key: 'apLucTaiViTriKetThucMatChayCaTruc4', label: 'Áp lực tại vị trí kết thúc mặt chạy cà trục 4' },

  { key: 'apLucCaVaiThanGiaiDoan3', label: 'Áp lực cà vải thân giai đoạn 3' },
  { key: 'apLucCaVaiThanGiaiDoan4', label: 'Áp lực cà vải thân giai đoạn 4' },
  { key: 'viTriCaVaiThanGiaiDoan1', label: 'Vị trí cà vải thân giai đoạn 1' },
  { key: 'viTriCaVaiThanGiaiDoan2', label: 'Vị trí cà vải thân giai đoạn 2' },
  { key: 'viTriCaVaiThanGiaiDoan3', label: 'Vị trí cà vải thân giai đoạn 3' },
  { key: 'viTriCaVaiThanGiaiDoan4', label: 'Vị trí cà vải thân giai đoạn 4' },
  { key: 'viTriBatDauCaBocGot', label: 'Vị trí bắt đầu cà bóc gót' },
  { key: 'viTriKetThucCaBocGot', label: 'Vị trí kết thúc cà bóc gót' }
];

/* ─── Panel wrapper ──────────────────────────────────────────────────────── */
const Panel = ({ title, accentColor = '#1565C0', children }) => (
  <div className="mes-panel">
    <div className="mes-panel-header">
      <div className="mes-panel-accent" style={{ background: accentColor }} />
      {title}
    </div>
    <div className="mes-panel-body">{children}</div>
  </div>
);

/* ─── Dải màu dành riêng cho Cột % Hoàn thành trong Bảng SẢN XUẤT TRONG THEO CA ─── */
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

/* ─── Dải màu dành riêng cho Biểu đồ KH Sản xuất Tháng Theo Ngày (Tông màu xanh lá) ─── */
const getDailyPlanChartColor = (percent) => {
  const p = Number(percent) || 0;
  if (p < 20) return '#ef4444';   // Đỏ (<20%)
  if (p < 40) return '#f97316';   // Cam (<40%)
  if (p < 60) return '#fb923c';   // Cam nhạt (<60%)
  if (p < 80) return '#4ade80';   // Xanh lá nhạt (<80%)
  if (p < 95) return '#22c55e';   // 80-95%: Màu xanh lá đậm hơn chút
  if (p <= 100) return '#16a34a'; // 95-100%: = màu kế hoạch xanh lá chuẩn (#16a34a)
  return '#15803d';               // >100%: Xanh lá đậm hơn màu KH (#15803d)
};

/* ─── Màu cho Cột Thực Tế ở các Biểu Đồ (Vẫn là màu Xanh Lá Cây như cũ) ─── */
const getProgressColor = (percent) => {
  const p = Number(percent) || 0;
  if (p > 100) return '#15803d'; // Vượt 100%: Xanh lá cây đậm
  return '#22c55e';              // Màu Xanh lá cây tươi chuẩn như cũ
};

/* ─── Bảng màu/nhãn trạng thái thiết bị (DÙNG CHUNG cho: pill trạng thái hiện tại,
       timeline theo ca và biểu đồ tròn 8h — cùng 1 mã trạng thái luôn cùng 1 màu) ─── */
const SHIFT_DURATION_SEC = 8 * 3600; // 1 ca = 8 giờ = 28.800 giây

const STATUS_META = {
  0: { name: 'Không xác định', short: 'N/A', fill: '#fff2cc', ink: '#1e293b' },
  1: { name: 'Máy chạy', short: 'Chạy', fill: '#22c55e', ink: '#ffffff' },
  2: { name: 'Máy dừng', short: 'Dừng', fill: '#facc15', ink: '#1e293b' },
  3: { name: 'Máy lỗi', short: 'Lỗi', fill: '#ef4444', ink: '#ffffff' },
  4: { name: 'Mất kết nối PLC', short: 'Mất KN', fill: '#f97316', ink: '#ffffff' },
  6: { name: 'Không có kế hoạch', short: 'Chờ KH', fill: '#b4c6e7', ink: '#1e293b' },
  7: { name: 'App Server tắt', short: 'App tắt', fill: '#c55a11', ink: '#ffffff' },
  8: { name: 'Máy chủ tắt', short: 'Máy chủ tắt', fill: '#833c0c', ink: '#ffffff' },
};

const IDLE_META = { name: 'Thời gian trống', short: '', fill: '#e2e8f0', ink: '#64748b' };

const getStatusMeta = (statusNum, statusName) => {
  const meta = STATUS_META[Number(statusNum)];
  if (meta) return meta;
  // Fallback theo tên trạng thái khi mã trạng thái không nằm trong bảng chuẩn
  const s = String(statusName || '').toLowerCase();
  if (s === 'chạy' || s === 'run') return STATUS_META[1];
  if (s === 'dừng' || s === 'stop') return STATUS_META[2];
  if (s === 'mất kết nối') return STATUS_META[4];
  return { name: statusName || 'Không xác định', short: statusName || 'N/A', fill: '#94a3b8', ink: '#ffffff' };
};

/* Định dạng thời lượng giây -> "2h 05m" / "12m 30s" / "45s" */
const formatDuration = (seconds) => {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(r).padStart(2, '0')}s`;
  return `${r}s`;
};

/* Định dạng giờ phút HH:MM từ Date */
const formatClock = (date) => {
  if (!date || isNaN(date.getTime())) return '--:--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/* Màu cảnh báo theo tỉ lệ chạy của ca (dùng cho KPI + số liệu trung tâm donut) */
const getUptimeColor = (pct) => {
  const p = Number(pct) || 0;
  if (p >= 70) return '#16a34a';
  if (p >= 40) return '#d97706';
  return '#dc2626';
};

const MayThanhHinhDashboard = () => {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const th05Machines = ['05', '14', '15', '16', '17', '5', 'TH05', 'TH14', 'TH15', 'TH16', 'TH17'];
  const getMachineNumberStr = (id) => {
    if (!id) return '';
    const match = id.match(/\d+/);
    return match ? match[0] : '';
  };
  const isTH05Group = th05Machines.includes(equipmentId) || th05Machines.includes(getMachineNumberStr(equipmentId));

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [pieData, setPieData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [dailyPlanData, setDailyPlanData] = useState([]);
  const [machineStatusTimes, setMachineStatusTimes] = useState([]);
  const [machineStatusMonth, setMachineStatusMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(Number(searchParams.get('nam_sx')) || currentYear);
  const [selectedMonth, setSelectedMonth] = useState(Number(searchParams.get('thang_sx')) || currentMonth);

  const years = Array.from({ length: currentYear - 2019 + 2 }, (_, i) => 2019 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // ── Tab state: Mặc định tab 'dashboard' (Dashboard hiệu suất) hiển thị đầu tiên ──
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── State bộ lọc chung cho Tab Chart Data ──
  const [barcodeFilter, setBarcodeFilter] = useState('');
  const [maMayFilter, setMaMayFilter] = useState(equipmentId || '');

  // ── State Parameter RealTime ──
  const [realTimeData, setRealTimeData] = useState([]);
  const [realTimePage, setRealTimePage] = useState(0);
  const [realTimeSize, setRealTimeSize] = useState(10);
  const [realTimeTotalPages, setRealTimeTotalPages] = useState(0);
  const [realTimeTotalElements, setRealTimeTotalElements] = useState(0);
  const [realTimeLoading, setRealTimeLoading] = useState(false);
  const [selectedRealTimeId, setSelectedRealTimeId] = useState(null);
  const [realTimeRefreshInterval, setRealTimeRefreshInterval] = useState(1500);

  // ── State Parameter Setting ──
  const [settingData, setSettingData] = useState([]);
  const [settingPage, setSettingPage] = useState(0);
  const [settingSize, setSettingSize] = useState(10);
  const [settingTotalPages, setSettingTotalPages] = useState(0);
  const [settingTotalElements, setSettingTotalElements] = useState(0);
  const [settingLoading, setSettingLoading] = useState(false);
  const [selectedSettingId, setSelectedSettingId] = useState(null);

  const [showRealTimeHistory, setShowRealTimeHistory] = useState(false);
  const [showSettingHistory, setShowSettingHistory] = useState(false);
  const [showChangeHistory, setShowChangeHistory] = useState(false);
  const [showAbbreviations, setShowAbbreviations] = useState(false);

  const [initialShift] = useState(() => {
    const now = new Date();
    const hour = now.getHours();
    let ca = '0';
    let targetDate = new Date(now);

    if (hour >= 6 && hour < 14) {
      ca = '1';
    } else if (hour >= 14 && hour < 22) {
      ca = '2';
    } else {
      // Ca 3 (mã ca = 0) của ngày D chạy từ 22:00 ngày D-1 đến 06:00 ngày D:
      //  - 22:00-23:59 hôm nay -> thuộc ca 3 của NGÀY MAI
      //  - 00:00-05:59 hôm nay -> vẫn là ca 3 của NGÀY HÔM NAY
      ca = '0';
      if (hour >= 22) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    return { dateStr: `${yyyy}-${mm}-${dd}`, ca };
  });

  // ── States & Effects cho Biểu đồ Sản lượng & Kế hoạch theo ca ──
  const [shiftStatsData, setShiftStatsData] = useState([]);
  const [shiftLoading, setShiftLoading] = useState(false);

  // States chọn ngày, chọn ca và ID Kế hoạch (bộ lọc ĐÃ ÁP DỤNG - thứ thực sự dùng để gọi API)
  const [selectedDate, setSelectedDate] = useState(initialShift.dateStr);
  const [selectedCa, setSelectedCa] = useState(initialShift.ca);
  const [machineImage, setMachineImage] = useState(null);

  // ID Kế hoạch được TÍNH TRỰC TIẾP từ ca/ngày đang áp dụng.
  // Trước đây idKehoach là state cập nhật qua useEffect nên luôn chậm một nhịp so với selectedDate/selectedCa,
  // khiến effect tải dữ liệu chạy 2 lần và lần đầu gọi API bằng id của ca CŨ.
  const idKehoach = React.useMemo(() => {
    if (!selectedDate || selectedCa === '') return '';
    const id = `RA10.${selectedDate.replace(/-/g, '')}${selectedCa}`;
    console.log("[MayThanhHinhDashboard] idKehoach áp dụng:", id);
    return id;
  }, [selectedDate, selectedCa]);

  // Bộ lọc NHÁP - giá trị người dùng đang chọn trên toolbar, chỉ áp dụng khi bấm nút "Xem dữ liệu".
  // Tách riêng để việc đổi ca/ngày không lập tức nạp lại dữ liệu (tránh gọi API liên tục khi đang chọn).
  // Bộ đếm phiên tải dữ liệu. Mỗi lần đổi bộ lọc / bấm làm mới sẽ tăng lên 1.
  // Các hàm fetch chỉ ghi kết quả vào state khi phiên của chúng vẫn là phiên mới nhất,
  // nhờ đó response chậm của ca cũ không còn ghi đè lên dữ liệu của ca vừa chọn.
  const fetchSessionRef = React.useRef(0);

  // State phục vụ nút làm mới thủ công.
  // refreshToken tăng lên mỗi lần bấm làm mới khi bộ lọc không đổi, dùng để kích hoạt lại effect tải dữ liệu.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const images = await getViewOrcThMachineImageApi();
        const currentMachineImage = images.find(img => img.maMay === equipmentId);
        if (currentMachineImage && currentMachineImage.image) {
          setMachineImage(`data:image/jpeg;base64,${currentMachineImage.image}`);
        }
      } catch (err) {
        console.error("Lỗi lấy ảnh máy:", err);
      }
    };
    fetchImage();
  }, [equipmentId]);

  // Đồng bộ năm/tháng theo ngày đang chọn (phục vụ các biểu đồ thống kê tháng)
  useEffect(() => {
    if (selectedDate && selectedCa !== '') {
      const [y, m] = selectedDate.split('-');
      if (y && m) {
        setSelectedYear(Number(y));
        setSelectedMonth(Number(m));
      }
    }
  }, [selectedDate, selectedCa]);

  // Hàm gọi API /shift-stats lấy sản lượng và kế hoạch theo ca ngày
  const fetchShiftStats = async (session = fetchSessionRef.current) => {
    if (!equipmentId) return;
    setShiftLoading(true);
    try {
      // Log console tham số đầu vào phục vụ test lỗi (Quy tắc 3)
      console.log(`[MayThanhHinhDashboard] fetchShiftStats -> Gửi request: maMay=${equipmentId}, id_kehoach=${idKehoach}`);

      const res = await getShiftStats({
        maMay: equipmentId,
        id_kehoach: idKehoach
      });

      // Bỏ qua kết quả của phiên cũ: người dùng đã đổi sang ca/ngày khác trong lúc chờ response
      if (session !== fetchSessionRef.current) {
        console.log(`[MayThanhHinhDashboard] fetchShiftStats -> BỎ QUA kết quả cũ của ${idKehoach} (phiên ${session} đã lỗi thời, phiên hiện tại ${fetchSessionRef.current}).`);
        return;
      }

      // Log console kết quả trả về để test lỗi (Quy tắc 3)
      console.log("[MayThanhHinhDashboard] fetchShiftStats -> Dữ liệu nhận từ API:", res);

      if (res && res.success) {
        setShiftStatsData(res.data || []);
      } else {
        setShiftStatsData([]);
        toast.error(res?.message || 'Lỗi tải dữ liệu thống kê ca');
      }
    } catch (error) {
      console.error("[MayThanhHinhDashboard] fetchShiftStats -> Lỗi:", error);
      if (session === fetchSessionRef.current) {
        toast.error(error.message || 'Lỗi tải dữ liệu thống kê ca');
        setShiftStatsData([]);
      }
    } finally {
      if (session === fetchSessionRef.current) setShiftLoading(false);
    }
  };

  const fetchMachineStatusTimes = async (session = fetchSessionRef.current) => {
    if (!equipmentId || !selectedDate || selectedCa === '') return;
    try {
      const yearMonthDayShift = selectedDate.replace(/-/g, '') + selectedCa;
      console.log(`[TEST LỖI - fetchMachineStatusTimes] Gửi request: maMay=${equipmentId}, yearMonthDayShift=${yearMonthDayShift}`);
      const res = await getMachineStatusTimes({
        maMay: equipmentId,
        yearMonthDayShift: yearMonthDayShift
      });

      // Bỏ qua kết quả của phiên cũ: người dùng đã đổi sang ca/ngày khác trong lúc chờ response
      if (session !== fetchSessionRef.current) {
        console.log(`[MayThanhHinhDashboard] fetchMachineStatusTimes -> BỎ QUA kết quả cũ của ca ${yearMonthDayShift} (phiên ${session} đã lỗi thời, phiên hiện tại ${fetchSessionRef.current}).`);
        return;
      }

      console.log(`[TEST LỖI - fetchMachineStatusTimes] Phản hồi từ API:`, res);
      setMachineStatusTimes(prev => {
        const newData = res || [];
        if (JSON.stringify(prev) === JSON.stringify(newData)) {
          return prev;
        }
        return newData;
      });
    } catch (error) {
      console.error("[MayThanhHinhDashboard] fetchMachineStatusTimes -> Lỗi:", error);
    }
  };


  useEffect(() => {
    if (activeTab === 'dashboard') {
      // Mở một phiên tải mới: mọi response của phiên trước (ca/ngày cũ) sẽ bị bỏ qua khi về muộn
      const session = ++fetchSessionRef.current;
      console.log(`[MayThanhHinhDashboard] Mở phiên tải dữ liệu #${session} cho ca ${selectedCa} ngày ${selectedDate}.`);

      setIsRefreshing(true);
      Promise.allSettled([
        fetchShiftStats(session),
        fetchMachineStatusTimes(session)
      ]).then(() => {
        if (session !== fetchSessionRef.current) return;
        setIsRefreshing(false);
        setLastUpdatedTime(new Date().toLocaleTimeString('vi-VN'));
      });

      // Chỉ polling khi ca/ngày đang chọn đúng là CA HIỆN TẠI của hệ thống.
      // Xem ca lịch sử thì dữ liệu đã đóng, polling chỉ gây nguy cơ lấy nhầm dữ liệu.
      if (!isCurrentShiftSelected(selectedDate, selectedCa)) {
        const current = getCurrentShift();
        console.log(`[MayThanhHinhDashboard] Đang xem dữ liệu lịch sử (Ca: ${selectedCa}, Ngày: ${selectedDate} | Ca hiện tại: ${current.ca}, Ngày: ${current.dateStr}). TẮT polling trạng thái realtime.`);
        return;
      }

      console.log(`[MayThanhHinhDashboard] Đang ở ca hiện tại. BẬT polling trạng thái realtime mỗi 10s.`);
      const intervalId = setInterval(() => {
        // Polling luôn dùng phiên hiện hành để không ghi đè khi người dùng vừa đổi bộ lọc
        fetchMachineStatusTimes(fetchSessionRef.current);
        setLastUpdatedTime(new Date().toLocaleTimeString('vi-VN'));
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [equipmentId, activeTab, idKehoach, selectedDate, selectedCa, refreshToken]);




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

  // Helper render giá trị boolean
  const renderBool = (val) => {
    if (val === true || val === 1 || val === '1') return <span style={{ fontWeight: 'bold', color: '#1e293b' }}>1</span>;
    if (val === false || val === 0 || val === '0') return <span style={{ fontWeight: 'bold', color: '#1e293b' }}>0</span>;
    return '-';
  };

  // Đồng bộ maMayFilter khi equipmentId từ URL thay đổi
  useEffect(() => {
    setMaMayFilter(equipmentId || '');
  }, [equipmentId]);

  // Format ngày giờ
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('vi-VN');
    } catch (e) {
      return dateTimeStr;
    }
  };

  // Fetch dữ liệu RealTime
  const fetchRealTime = async (page = 0, size = 10) => {
    setRealTimeLoading(true);
    try {
      const params = {
        barcode: barcodeFilter.trim() || undefined,
        maMay: equipmentId || undefined, // Luôn lấy cố định theo equipmentId từ trang trước
        page,
        size
      };
      const getMachineNumber = (id) => {
        if (!id) return 0;
        const match = id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      const isTH09Plus = getMachineNumber(equipmentId) >= 9;

      console.log(">>> [FETCH REALTIME] Gọi API. isTH05Group:", isTH05Group, "isTH09Plus:", isTH09Plus, "params:", params);
      const res = isTH05Group
        ? await getChartRealTimeTH05(params)
        : (isTH09Plus ? await getChartRealTimeTH09(params) : await getChartRealTime(params));
      console.log(">>> [FETCH REALTIME RESPONSE] Trả về:", res);

      if (res) {
        const content = isTH05Group
          ? (res.content || [])
          : (isTH09Plus ? (Array.isArray(res) ? res : []) : (res.content || []));
        setRealTimeData(content);
        setRealTimeTotalPages(isTH05Group ? (res.totalPages || 0) : (isTH09Plus ? 1 : (res.totalPages || 0)));
        setRealTimeTotalElements(isTH05Group ? (res.totalElements || 0) : (isTH09Plus ? content.length : (res.totalElements || 0)));
        setRealTimePage(isTH05Group ? (res.number || 0) : (isTH09Plus ? 0 : (res.number || 0)));
        if (content.length > 0) {
          setSelectedRealTimeId(content[0].id);
        } else {
          setSelectedRealTimeId(null);
        }
      }
    } catch (error) {
      console.error(">>> [FETCH REALTIME ERROR] Chi tiết lỗi:", error);
      toast.error(error.message || 'Lỗi tải dữ liệu RealTime');
    } finally {
      setRealTimeLoading(false);
    }
  };

  // Fetch dữ liệu RealTime ngầm không làm chớp nháy giao diện
  const fetchRealTimeSilence = async (page = 0, size = 10) => {
    try {
      const params = {
        barcode: barcodeFilter.trim() || undefined,
        maMay: equipmentId || undefined,
        page,
        size
      };
      const getMachineNumber = (id) => {
        if (!id) return 0;
        const match = id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      const isTH09Plus = getMachineNumber(equipmentId) >= 9;

      const res = isTH05Group
        ? await getChartRealTimeTH05(params)
        : (isTH09Plus ? await getChartRealTimeTH09(params) : await getChartRealTime(params));
      if (res) {
        const content = isTH05Group
          ? (res.content || [])
          : (isTH09Plus ? (Array.isArray(res) ? res : []) : (res.content || []));
        setRealTimeData(content);
        setRealTimeTotalPages(isTH05Group ? (res.totalPages || 0) : (isTH09Plus ? 1 : (res.totalPages || 0)));
        setRealTimeTotalElements(isTH05Group ? (res.totalElements || 0) : (isTH09Plus ? content.length : (res.totalElements || 0)));
        setRealTimePage(isTH05Group ? (res.number || 0) : (isTH09Plus ? 0 : (res.number || 0)));
        if (content.length > 0) {
          if (!content.some(item => item.id === selectedRealTimeId)) {
            setSelectedRealTimeId(content[0].id);
          }
        } else {
          setSelectedRealTimeId(null);
        }
      }
    } catch (error) {
      console.error(">>> [FETCH REALTIME SILENCE ERROR] Chi tiết:", error);
    }
  };

  // Fetch dữ liệu Setting
  const fetchSetting = async (page = 0, size = 10) => {
    setSettingLoading(true);
    try {
      const params = {
        barcode: barcodeFilter.trim() || undefined,
        maMay: equipmentId || undefined, // Luôn lấy cố định theo equipmentId từ trang trước
        page,
        size
      };
      const getMachineNumber = (id) => {
        if (!id) return 0;
        const match = id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      const isTH09Plus = getMachineNumber(equipmentId) >= 9;

      console.log(">>> [FETCH SETTING] Gọi API. isTH05Group:", isTH05Group, "isTH09Plus:", isTH09Plus, "params:", params);
      const res = isTH05Group
        ? await getChartSettingTH05(params)
        : (isTH09Plus ? await getChartSettingTH09(params) : await getChartSetting(params));
      console.log(">>> [FETCH SETTING RESPONSE] Trả về:", res);

      if (res) {
        const content = isTH05Group
          ? (res.content || [])
          : (isTH09Plus ? (Array.isArray(res) ? res : []) : (res.content || []));
        setSettingData(content);
        setSettingTotalPages(isTH05Group ? (res.totalPages || 0) : (isTH09Plus ? 1 : (res.totalPages || 0)));
        setSettingTotalElements(isTH05Group ? (res.totalElements || 0) : (isTH09Plus ? content.length : (res.totalElements || 0)));
        setSettingPage(isTH05Group ? (res.number || 0) : (isTH09Plus ? 0 : (res.number || 0)));
        if (content.length > 0) {
          setSelectedSettingId(content[0].id);
        } else {
          setSelectedSettingId(null);
        }
      }
    } catch (error) {
      console.error(">>> [FETCH SETTING ERROR] Chi tiết lỗi:", error);
      toast.error(error.message || 'Lỗi tải dữ liệu Setting');
    } finally {
      setSettingLoading(false);
    }
  };

  // Nút tìm kiếm
  const handleSearch = () => {
    console.log(">>> [FILTER SEARCH CLICK] barcode:", barcodeFilter, "maMay (cố định):", equipmentId);
    fetchRealTime(0, realTimeSize);
    fetchSetting(0, settingSize);
  };

  // Nút đặt lại bộ lọc
  const handleReset = () => {
    console.log(">>> [FILTER RESET CLICK] Reset bộ lọc về mặc định của máy:", equipmentId);
    setBarcodeFilter('');
    setMaMayFilter(equipmentId || '');

    const getMachineNumber = (id) => {
      if (!id) return 0;
      const match = id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    const isTH09Plus = getMachineNumber(equipmentId) >= 9;

    // Gọi fetch ngay lập tức với params mặc định để tránh độ trễ state
    const paramsDefault = {
      barcode: undefined,
      maMay: equipmentId || undefined,
      page: 0,
      size: 10
    };

    const resetRealTime = async () => {
      setRealTimeLoading(true);
      try {
        const res = isTH05Group
          ? await getChartRealTimeTH05(paramsDefault)
          : (isTH09Plus ? await getChartRealTimeTH09(paramsDefault) : await getChartRealTime(paramsDefault));
        if (res) {
          const content = isTH05Group
            ? (res.content || [])
            : (isTH09Plus ? (Array.isArray(res) ? res : []) : (res.content || []));
          setRealTimeData(content);
          setRealTimeTotalPages(isTH05Group ? (res.totalPages || 0) : (isTH09Plus ? 1 : (res.totalPages || 0)));
          setRealTimeTotalElements(isTH05Group ? (res.totalElements || 0) : (isTH09Plus ? content.length : (res.totalElements || 0)));
          setRealTimePage(isTH05Group ? (res.number || 0) : (isTH09Plus ? 0 : (res.number || 0)));
          if (content.length > 0) {
            setSelectedRealTimeId(content[0].id);
          } else {
            setSelectedRealTimeId(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRealTimeLoading(false);
      }
    };

    const resetSetting = async () => {
      setSettingLoading(true);
      try {
        const res = isTH05Group
          ? await getChartSettingTH05(paramsDefault)
          : (isTH09Plus ? await getChartSettingTH09(paramsDefault) : await getChartSetting(paramsDefault));
        if (res) {
          const content = isTH05Group
            ? (res.content || [])
            : (isTH09Plus ? (Array.isArray(res) ? res : []) : (res.content || []));
          setSettingData(content);
          setSettingTotalPages(isTH05Group ? (res.totalPages || 0) : (isTH09Plus ? 1 : (res.totalPages || 0)));
          setSettingTotalElements(isTH05Group ? (res.totalElements || 0) : (isTH09Plus ? content.length : (res.totalElements || 0)));
          setSettingPage(isTH05Group ? (res.number || 0) : (isTH09Plus ? 0 : (res.number || 0)));
          if (content.length > 0) {
            setSelectedSettingId(content[0].id);
          } else {
            setSelectedSettingId(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSettingLoading(false);
      }
    };

    resetRealTime();
    resetSetting();
  };

  // Gọi API lần đầu hoặc khi đổi tab / đổi máy
  useEffect(() => {
    console.log(`>>> [MayThanhHinhDashboard] Đang mở Tab: ${activeTab}, Máy: ${equipmentId}`);
    if (activeTab === 'chartData') {
      fetchRealTime(0, realTimeSize);
      fetchSetting(0, settingSize);
    }
  }, [activeTab, equipmentId]);

  // Thiết lập tự động làm mới ngầm (silence refresh) cho RealTime theo chu kỳ đã chọn.
  // Chỉ chạy khi bộ lọc ca/ngày đang ở CA HIỆN TẠI; xem ca lịch sử thì TẮT polling.
  useEffect(() => {
    if (activeTab === 'chartData') {
      if (!isCurrentShiftSelected(selectedDate, selectedCa)) {
        const current = getCurrentShift();
        console.log(`[MayThanhHinhDashboard] Tab thông số: đang xem ca lịch sử (Ca: ${selectedCa}, Ngày: ${selectedDate} | Ca hiện tại: ${current.ca}, Ngày: ${current.dateStr}). TẮT tự động làm mới ngầm.`);
        return;
      }

      console.log(`[MayThanhHinhDashboard] Tab thông số: đang ở ca hiện tại. BẬT tự động làm mới ngầm mỗi ${realTimeRefreshInterval}ms.`);
      const interval = setInterval(() => {
        fetchRealTimeSilence(realTimePage, realTimeSize);
      }, realTimeRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [activeTab, equipmentId, realTimePage, realTimeSize, realTimeRefreshInterval, barcodeFilter, selectedRealTimeId, selectedDate, selectedCa]);

  const renderChartDataTab = () => {
    return (
      <div className="mes-fade" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 'calc(100vh - 120px)', height: 'auto', overflowY: 'auto' }}>
        {/* Bộ lọc chung */}


        {/* Phân vùng RealTime */}
        <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: '#1565C0', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>THÔNG SỐ HOẠT ĐỘNG</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#64748b', fontWeight: 'normal' }}>
                <span style={{ fontSize: '10px' }}>Làm mới:</span>
                <select
                  value={realTimeRefreshInterval}
                  onChange={(e) => setRealTimeRefreshInterval(Number(e.target.value))}
                  style={{ fontSize: '10px', padding: '1px 3px', height: '18px', border: '1px solid #cbd5e1', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <option value={1000}>1s</option>
                  <option value={1500}>1.5s</option>
                  <option value={2000}>2s</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowRealTimeHistory(true)}
              style={{
                background: '#1565C0',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              XEM LỊCH SỬ THAY ĐỔI
            </button>
          </div>

          {showRealTimeHistory && (
            (() => {
              if (isTH05Group) {
                return <RealTimeTH05History equipmentId={equipmentId} onClose={() => setShowRealTimeHistory(false)} />;
              }
              const getMachineNumber = (id) => {
                if (!id) return 0;
                const match = id.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
              };
              const isTH09Plus = getMachineNumber(equipmentId) >= 9;
              return isTH09Plus ? (
                <RealTimeTH09History equipmentId={equipmentId} onClose={() => setShowRealTimeHistory(false)} />
              ) : (
                <RealTimeTH02History equipmentId={equipmentId} onClose={() => setShowRealTimeHistory(false)} />
              );
            })()
          )}

          {realTimeLoading ? (
            <div style={{ textAlign: 'center', padding: '10px', fontSize: '11px' }}>Đang tải dữ liệu RealTime...</div>
          ) : realTimeData.length === 0 ? (
            <div style={{ padding: '10px', fontSize: '11px', color: '#94a3b8' }}>Không tìm thấy dữ liệu Parameter RealTime nào.</div>
          ) : (
            <>
              {(() => {
                const selectedRecord = realTimeData[0]; // Luôn lấy bản ghi RealTime mới nhất
                if (!selectedRecord) return null;
                console.log(">>> [DEBUG REALTIME RECORD SELECTED]:", selectedRecord);

                let fields;
                if (isTH05Group) {
                  fields = realTimeTH05Fields;
                } else {
                  const getMachineNumber = (id) => {
                    if (!id) return 0;
                    const match = id.match(/\d+/);
                    return match ? parseInt(match[0], 10) : 0;
                  };
                  const isTH09Plus = getMachineNumber(equipmentId) >= 9;
                  fields = isTH09Plus ? realTimeTH09Fields : realTimeTH02Fields;
                }

                // Thực hiện lọc động chỉ render các trường thực tế có trong dữ liệu cho nhóm TH05
                const fieldsToRender = isTH05Group
                  ? fields.filter(field => field.key in selectedRecord)
                  : fields;

                return (
                  <div style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '6px'
                  }}>
                    <div className="th-responsive-grid-auto" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                      gap: '6px'
                    }}>
                      {fieldsToRender.map(field => {
                        const val = selectedRecord[field.key];
                        let renderedVal = val ?? '-';
                        let isBarcodeField = false;
                        let badgeStyle = {
                          background: '#f1f5f9',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1'
                        };

                        if (field.key === 'globalDisableBarcode') {
                          isBarcodeField = true;
                          const isRequire = (val === 1 || val === true || val === '1');
                          renderedVal = isRequire ? 'Yêu cầu tích mã vạch' : 'Bỏ qua tích mã vạch';
                          badgeStyle = isRequire
                            ? { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }
                            : { background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' };
                        } else if (field.key === 'globalEnableBarcode') {
                          isBarcodeField = true;
                          const isOk = (val === 1 || val === true || val === '1');
                          renderedVal = isOk ? 'Mã vạch OK' : 'Mã vạch không đúng';
                          badgeStyle = isOk
                            ? { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }
                            : { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
                        } else if (field.isBool) {
                          renderedVal = renderBool(val);
                        } else if (typeof val === 'number') {
                          renderedVal = Number.isInteger(val) ? val : Number(val.toFixed(2));
                        }

                        return (
                          <div
                            key={field.key}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '11px',
                              gridColumn: isBarcodeField ? 'span 2' : 'span 1',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              minWidth: 0,
                              overflow: 'hidden'
                            }}
                          >
                            <span
                              style={{
                                color: '#475569',
                                fontWeight: '600',
                                fontSize: '10.5px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginRight: '8px',
                                flex: '1 1 auto',
                                minWidth: 0
                              }}
                              title={field.label}
                            >
                              {field.label}
                            </span>
                            <span
                              style={{
                                fontWeight: 'bold',
                                fontSize: isBarcodeField ? '10px' : '11px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                padding: '2px 8px',
                                borderRadius: '3px',
                                ...badgeStyle
                              }}
                            >
                              {renderedVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* PHÂN VÙNG 2: SETTING (Chiếm toàn bộ không gian còn lại ở dưới) */}
        <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minHeight: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: '#c2410c', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
            <span>THÔNG SỐ CÀI ĐẶT</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  console.log(`>>> [MayThanhHinhDashboard] Bấm nút xem LỊCH THÔNG SỐ CÀI ĐẶT, máy: ${equipmentId}`);
                  setShowSettingHistory(true);
                }}
                style={{
                  background: '#c2410c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                LỊCH THÔNG SỐ CÀI ĐẶT
              </button>
              <button
                onClick={() => {
                  console.log(`>>> [MayThanhHinhDashboard] Bấm nút xem LỊCH THÔNG SỐ THAY ĐỔI (Change), máy: ${equipmentId}`);
                  setShowChangeHistory(true);
                }}
                style={{
                  background: '#ea580c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                LỊCH THÔNG SỐ THAY ĐỔI
              </button>
            </div>
          </div>

          {showSettingHistory && (
            (() => {
              if (isTH05Group) {
                return <SettingTH05History equipmentId={equipmentId} onClose={() => setShowSettingHistory(false)} />;
              }
              const getMachineNumber = (id) => {
                if (!id) return 0;
                const match = id.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
              };
              const isTH09Plus = getMachineNumber(equipmentId) >= 9;
              return isTH09Plus ? (
                <SettingTH09History equipmentId={equipmentId} onClose={() => setShowSettingHistory(false)} />
              ) : (
                <SettingTH02History equipmentId={equipmentId} onClose={() => setShowSettingHistory(false)} />
              );
            })()
          )}

          {settingLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '11px' }}>
              <div className="mes-spinner" style={{ width: '20px', height: '20px', margin: '0 auto' }} />
              <div style={{ marginTop: '5px' }}>Đang tải dữ liệu Setting...</div>
            </div>
          ) : settingData.length === 0 ? (
            <div style={{ padding: '20px', fontSize: '11px', color: '#94a3b8' }}>Không tìm thấy dữ liệu Parameter Setting nào.</div>
          ) : (
            <>
              {(() => {
                const selectedRecord = settingData[0]; // Luôn lấy bản ghi Setting mới nhất
                if (!selectedRecord) return null;

                let fields;
                if (isTH05Group) {
                  fields = settingTH05Fields;
                } else {
                  const getMachineNumber = (id) => {
                    if (!id) return 0;
                    const match = id.match(/\d+/);
                    return match ? parseInt(match[0], 10) : 0;
                  };
                  const isTH09Plus = getMachineNumber(equipmentId) >= 9;
                  fields = isTH09Plus ? settingTH09Fields : settingTH02Fields;
                }

                // Thực hiện lọc động chỉ render các trường thực tế có trong dữ liệu cho nhóm TH05
                const fieldsToRender = isTH05Group
                  ? fields.filter(field => field.key in selectedRecord)
                  : fields;

                return (
                  <div style={{
                    width: '100%',
                    overflowY: 'auto',
                    maxHeight: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '6px'
                  }}>
                    <div className="th-responsive-grid-auto" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '5px'
                    }}>
                      {fieldsToRender.map(field => {
                        let val = selectedRecord[field.key] ?? '-';
                        if (typeof val === 'number') {
                          val = Number.isInteger(val) ? val : Number(val.toFixed(2));
                        }
                        return (
                          <div
                            key={field.key}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '5px 8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '11px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              minWidth: 0,
                              overflow: 'hidden'
                            }}
                          >
                            <span
                              style={{
                                color: '#475569',
                                fontWeight: '600',
                                fontSize: '10.5px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginRight: '6px',
                                flex: '1 1 auto',
                                minWidth: 0
                              }}
                              title={field.label}
                            >
                              {field.label}
                            </span>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: '#0f172a',
                                fontSize: '11px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                background: '#f8fafc',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* THANH TOGGLE BẢNG CHÚ THÍCH */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0', flexShrink: 0 }}>
          <button
            onClick={() => setShowAbbreviations(!showAbbreviations)}
            style={{
              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px',
              padding: '2px 10px', fontSize: '10px', fontWeight: 'bold', color: '#475569',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <span>{showAbbreviations ? 'ẨN BẢNG CHÚ THÍCH TỪ VIẾT TẮT' : 'HIỂN THỊ BẢNG CHÚ THÍCH TỪ VIẾT TẮT'}</span>
            <svg
              width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
              style={{ transform: showAbbreviations ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ── BẢNG CHÚ THÍCH CÁC TỪ VIẾT TẮT ────────────────────────────────── */}
        {showAbbreviations && (
          <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '8px', flexShrink: 0, marginTop: '2px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Bảng Chú Thích Các Từ Viết Tắt Hệ Thống Thành Hình
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '4px', fontSize: '9.5px' }}>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>ĐK:</strong> Đường kính</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>CD:</strong> Chiều dài</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>KC:</strong> Khoảng cách</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>AL / Pres:</strong> Áp lực (Pressure)</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>VT:</strong> Vị trí</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>GĐ:</strong> Giai đoạn</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>HT:</strong> Hoàn thành</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>H.Tâm / Rd:</strong> Hướng tâm (Radial)</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>H.Trục:</strong> Hướng trục</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>H.Xoay / Rt:</strong> Hướng xoay (Rotation)</div>
              <div style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#7e22ce' }}><strong>TH:</strong> Tổ hợp</div>

            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy năm/tháng TRỰC TIẾP từ ngày đang lọc, không dùng state selectedYear/selectedMonth.
        // Hai state đó khởi tạo từ URL (nam_sx/thang_sx) nên ở lần render đầu có thể là
        // tháng cũ, trong khi selectedDate đã là hôm nay -> nếu dùng chúng, lượt tải đầu tiên
        // sẽ lấy dữ liệu tháng trước và biểu đồ loé lên các ngày của tháng đó.
        const [ngayNam, ngayThang] = String(selectedDate).split('-');
        const nam = Number(ngayNam);
        const thang = Number(ngayThang);
        if (!nam || !thang) {
          console.warn(">>> [MayThanhHinhDashboard] selectedDate không hợp lệ, bỏ qua lượt tải:", selectedDate);
          setLoading(false);
          return;
        }

        const params = { nam_sx: nam, thang_sx: thang };
        const yearMonth = `${nam}${String(thang).padStart(2, '0')}`;

        // Biểu đồ theo ngày luôn bắt đầu từ NGÀY 01 CỦA CHÍNH THÁNG ĐANG LỌC.
        // Nếu đang lọc tháng hiện tại thì dừng ở ca/ngày đang lọc (ca sau chưa xảy ra);
        // nếu lọc tháng khác thì lấy TRỌN CẢ THÁNG đó.
        const chartRange = getChartShiftRange(selectedDate, selectedCa);
        const chartStartShift = chartRange?.startShift ?? null;
        const chartEndShift = chartRange?.endShift ?? null;

        console.log(">>> [MayThanhHinhDashboard] Tải dữ liệu tháng:", { equipmentId, nam, thang, yearMonth, chartStartShift, chartEndShift, isCurrentMonth: chartRange?.isCurrentMonth });

        // Bắt lỗi độc lập cho từng API để tránh một API lỗi làm hỏng toàn bộ Promise.all
        const [pieRes, statsRes, dailyRes, monthStatusRes] = await Promise.all([
          getDashboardMay(equipmentId, params).catch(err => {
            console.error(">>> [MayThanhHinhDashboard] Lỗi getDashboardMay:", err);
            return { success: false, message: err.message || 'Lỗi tải biểu đồ tròn' };
          }),
          getDashboardStats({ equipmentId, ...params }).catch(err => {
            console.error(">>> [MayThanhHinhDashboard] Lỗi getDashboardStats:", err);
            return { success: false, message: err.message || 'Lỗi tải thống kê tháng' };
          }),
          getTongHopCaNgay({ startShift: chartStartShift, endShift: chartEndShift, maMay: equipmentId }).catch(err => {
            console.error(">>> [MayThanhHinhDashboard] Lỗi getTongHopCaNgay:", err);
            return { success: false, message: err.message || 'Lỗi tải tổng hợp ca ngày' };
          }),
          getMachineStatusTimesByMonth({ maMay: equipmentId, yearMonth }).catch(err => {
            console.error(">>> [MayThanhHinhDashboard] Lỗi getMachineStatusTimesByMonth:", err);
            return [];
          })
        ]);

        if (Array.isArray(monthStatusRes)) {
          setMachineStatusMonth(monthStatusRes);
        } else {
          setMachineStatusMonth([]);
        }

        if (pieRes && pieRes.success) {
          setPieData(pieRes.data);
        } else {
          setPieData(null);
          console.warn(">>> [MayThanhHinhDashboard] Lỗi tải biểu đồ tròn:", pieRes?.message);
        }

        if (statsRes && statsRes.success) {
          setStatsData(statsRes.data);
        } else {
          setStatsData(null);
          console.warn(">>> [MayThanhHinhDashboard] Lỗi tải thống kê tháng:", statsRes?.message);
        }

        // Xử lý dữ liệu tổng hợp theo ca/ngày (chấp nhận cả mảng trực tiếp hoặc bọc trong data)
        let rawDailyData = [];
        if (dailyRes) {
          if (Array.isArray(dailyRes)) {
            rawDailyData = dailyRes;
          } else if (dailyRes.success && Array.isArray(dailyRes.data)) {
            rawDailyData = dailyRes.data;
          } else if (Array.isArray(dailyRes.data)) {
            rawDailyData = dailyRes.data;
          }
        }

        if (rawDailyData.length > 0) {
          // Gom các bản ghi theo ca thành từng ngày, mỗi ngày có đủ 3 ca để vẽ 3 cột cạnh nhau
          // Truyền tháng đang lọc để biểu đồ luôn dựng ĐỦ số ngày của tháng đó,
          // ngày chưa có dữ liệu vẫn giữ một ô trống -> bề rộng không đổi.
          const chartData = buildTongHopCaNgayChartData(rawDailyData, `${nam}-${String(thang).padStart(2, '0')}`);
          console.log(`>>> [MayThanhHinhDashboard] Tổng hợp ca ngày: ${rawDailyData.length} bản ghi ca -> ${chartData.length} ngày trên biểu đồ.`, chartData);
          setDailyPlanData(chartData);
        } else {
          setDailyPlanData([]);
          console.log(">>> [MayThanhHinhDashboard] Không có dữ liệu tổng hợp ca ngày.");
        }

      } catch (err) {
        console.error(">>> [MayThanhHinhDashboard] Lỗi xử lý dữ liệu tổng hợp:", err);
        toast.error(err.message || 'Lỗi kết nối hệ thống');
        setDailyPlanData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // KHÔNG phụ thuộc selectedYear/selectedMonth: hai biến đó có thể đến từ URL
    // (nam_sx/thang_sx) nên ở lần render đầu chúng có thể lệch với selectedDate,
    // làm effect chạy một lượt với tháng cũ và biểu đồ loé lên ngày của tháng trước.
    // Khoảng dữ liệu của biểu đồ vốn đã được getChartShiftRange tính từ selectedDate.
  }, [equipmentId, selectedDate, selectedCa]);

  const tyLeDat = pieData?.tyLeDat ?? 0;
  const tyLeThieu = pieData?.tyLeThieu ?? 0;
  const donutData = [
    { name: 'Đạt kế hoạch', value: tyLeDat },
    { name: 'Thiếu kế hoạch', value: tyLeThieu },
  ];

  const scadaChartData = React.useMemo(() => {
    if (!machineStatusMonth || machineStatusMonth.length === 0) {
      return [{ name: 'Không có dữ liệu', value: 1, fill: '#e2e8f0' }];
    }
    return machineStatusMonth.map(item => {
      let fill = '#94a3b8'; // fallback màu xám nếu mã không xác định
      let standardName = item.StatusName || `Trạng thái ${item.MachineStatus}`;

      if (item.MachineStatus === 0) { fill = '#fff2cc'; standardName = 'Không xác định'; }
      else if (item.MachineStatus === 1) { fill = '#00b050'; standardName = 'Máy chạy'; }
      else if (item.MachineStatus === 2) { fill = '#ffff00'; standardName = 'Máy dừng'; }
      else if (item.MachineStatus === 3) { fill = '#ff0000'; standardName = 'Máy lỗi'; }
      else if (item.MachineStatus === 4) { fill = '#ffc000'; standardName = 'Mất kết nối PLC'; }

      else if (item.MachineStatus === 6) { fill = '#b4c6e7'; standardName = 'Không có kế hoạch'; }
      else if (item.MachineStatus === 7) { fill = '#c55a11'; standardName = 'App Server SCADA tắt'; }
      else if (item.MachineStatus === 8) { fill = '#833c0c'; standardName = 'Máy chủ SCADA tắt'; }

      return {
        name: standardName,
        value: item.TotalDurationHours || 0,
        fill: fill
      };
    }).filter(item => item.value > 0);
  }, [machineStatusMonth]);

  // Đã chuyển logic tính toán avgChay và uptimePctAPI xuống dưới shiftBreakdown để đồng bộ số liệu 8h ca

  /* ── Khung thời gian 8h của ca đang chọn (Ca 1: 6h-14h, Ca 2: 14h-22h, Ca 3: 22h-6h) ──
     Tính 1 lần, dùng chung cho timeline trạng thái + biểu đồ tròn 8h để 2 biểu đồ luôn khớp nhau */
  const shiftWindow = React.useMemo(() => {
    const [y, m, d] = String(selectedDate || '').split('-').map(Number);
    if (!y || !m || !d) return null;
    const start = new Date(y, m - 1, d);
    if (selectedCa === '0') {
      // Ca 3 (Ca 0) bắt đầu từ 22:00 ngày hôm trước (d - 1)
      start.setDate(start.getDate() - 1);
      start.setHours(22, 0, 0, 0);
    } else if (selectedCa === '2') {
      start.setHours(14, 0, 0, 0);
    } else {
      start.setHours(6, 0, 0, 0);
    }
    const end = new Date(start.getTime() + SHIFT_DURATION_SEC * 1000);
    console.log("[TEST LỖI - shiftWindow] selectedDate:", selectedDate, "selectedCa:", selectedCa, "start:", start.toLocaleString('vi-VN'), "end:", end.toLocaleString('vi-VN'));
    return { start, end, startHour: start.getHours() };
  }, [selectedDate, selectedCa]);

  /* ── Cắt các khoảng trạng thái về đúng phạm vi ca, xử lý gộp chồng chéo và quy đổi sang % vị trí trên timeline ── */
  const shiftSegments = React.useMemo(() => {
    if (!shiftWindow) return [];
    const spanMs = SHIFT_DURATION_SEC * 1000;

    const segments = machineStatusTimes.map((item, idx) => {
      if (!item.StartTime) return null;
      const itemStart = new Date(String(item.StartTime).replace(' ', 'T'));
      const itemEnd = item.EndTime ? new Date(String(item.EndTime).replace(' ', 'T')) : new Date();
      if (isNaN(itemStart.getTime()) || isNaN(itemEnd.getTime())) return null;

      // Giới hạn start và end nằm trong shiftWindow của ca
      const start = new Date(Math.max(itemStart.getTime(), shiftWindow.start.getTime()));
      const end = new Date(Math.min(itemEnd.getTime(), shiftWindow.end.getTime()));
      const durationMs = end.getTime() - start.getTime();

      // Sử dụng trường EffectiveDurationSeconds từ API nếu có, nếu không thì lấy durationMs tự tính
      const durationSec = (item.EffectiveDurationSeconds !== undefined && item.EffectiveDurationSeconds !== null)
        ? Number(item.EffectiveDurationSeconds)
        : Math.max(0, durationMs / 1000);

      // Nếu cả hai đều <= 0 thì bỏ qua phân đoạn không hợp lệ này
      if (durationSec <= 0 && durationMs <= 0) return null;

      const statusNum = Number(item.MachineStatus);
      return {
        key: `${item.ID || idx}-${idx}`,
        statusNum,
        statusName: item.StatusName,
        meta: getStatusMeta(statusNum, item.StatusName),
        start,
        end,
        durationSec,
        leftPct: Math.min(100, Math.max(0, ((start.getTime() - shiftWindow.start.getTime()) / spanMs) * 100)),
        widthPct: Math.min(100, Math.max(0, ((end.getTime() - start.getTime()) / spanMs) * 100)),
        isRunning: statusNum === 1 || ['chạy', 'run'].includes(String(item.StatusName || '').toLowerCase()),
      };
    }).filter(Boolean);

    // Sắp xếp các segments theo thời gian bắt đầu
    segments.sort((a, b) => a.start.getTime() - b.start.getTime());

    console.log("[TEST LỖI - shiftSegments] Danh sách phân đoạn trạng thái thực tế:", segments.map(s => ({
      status: s.statusName,
      start: s.start.toLocaleString('vi-VN'),
      end: s.end.toLocaleString('vi-VN'),
      durSec: s.durationSec,
      leftPct: s.leftPct.toFixed(2) + '%',
      widthPct: s.widthPct.toFixed(2) + '%'
    })));

    return segments;
  }, [machineStatusTimes, shiftWindow]);

  /* ── Tổng hợp thời lượng theo trạng thái -> dữ liệu biểu đồ tròn 8h + chú thích dùng chung ── */
  const shiftBreakdown = React.useMemo(() => {
    const totals = {};
    let recordedSec = 0;
    let runSec = 0;

    shiftSegments.forEach(seg => {
      totals[seg.statusNum] = (totals[seg.statusNum] || 0) + seg.durationSec;
      recordedSec += seg.durationSec;
      if (seg.isRunning) runSec += seg.durationSec;
    });

    // Sắp xếp giảm dần để lát lớn nhất đứng đầu (dễ đọc hơn thứ tự mã trạng thái)
    const slices = Object.keys(totals).map(key => {
      const statusNum = Number(key);
      const meta = getStatusMeta(statusNum);
      return { name: meta.name, value: totals[statusNum], fill: meta.fill };
    }).sort((a, b) => b.value - a.value);

    // Phần thời gian của ca chưa có dữ liệu ghi nhận (ca chưa diễn ra hết / mất log)
    const idleSec = Math.max(0, SHIFT_DURATION_SEC - recordedSec);
    if (idleSec > 1) slices.push({ name: IDLE_META.name, value: idleSec, fill: IDLE_META.fill });

    const runPct = (runSec / SHIFT_DURATION_SEC) * 100;

    console.log(`[Trạng thái ca] Ca ${selectedCa} ngày ${selectedDate}: ghi nhận ${(recordedSec / 3600).toFixed(2)}h, chạy ${(runSec / 3600).toFixed(2)}h (${runPct.toFixed(2)}%), trống ${(idleSec / 3600).toFixed(2)}h`,
      slices.map(s => `${s.name}: ${(s.value / 3600).toFixed(2)}h`));

    return { slices, recordedSec, runSec, idleSec, runPct };
  }, [shiftSegments, selectedCa, selectedDate]);

  const avgChay = (shiftBreakdown.runSec / 3600).toFixed(2);
  // Giữ nguyên giá trị % chính xác (không làm tròn về số nguyên) để hiển thị đủ 2 chữ số thập phân
  const uptimePctAPI = Math.min(100, (shiftBreakdown.runSec / (8 * 3600)) * 100);
  // Console log hỗ trợ kiểm tra dữ liệu KPI 8h ca (quy tắc 3)
  console.log(`[Tính toán KPI ca] Máy chạy = ${avgChay}h (Uptime: ${uptimePctAPI.toFixed(2)}%), Đã ghi nhận = ${(shiftBreakdown.recordedSec / 3600).toFixed(2)}h, Thời gian trống = ${(shiftBreakdown.idleSec / 3600).toFixed(2)}h`);

  // timelineStats đã được lược bỏ vì không còn sử dụng trong layout mới

  /* ── Trạng thái hiện tại (bản ghi mới nhất) ── */
  const currentStatus = React.useMemo(() => {
    if (!machineStatusTimes || machineStatusTimes.length === 0) {
      return { name: 'Không có dữ liệu', fill: '#94a3b8', ink: '#ffffff', since: null };
    }
    const last = machineStatusTimes[machineStatusTimes.length - 1];
    const meta = getStatusMeta(Number(last.MachineStatus), last.StatusName);
    const since = last.StartTime ? new Date(String(last.StartTime).replace(' ', 'T')) : null;
    return { ...meta, since };
  }, [machineStatusTimes]);

  /* ── Nhãn ca + mốc "bây giờ" trên timeline (chỉ hiện khi ca đang diễn ra) ── */
  const caLabel = selectedCa === '0' ? '3' : (selectedCa || '1');
  const dateLabel = selectedDate ? selectedDate.split('-').reverse().join('/') : '--/--/----';
  // shiftRangeLabel đã được lược bỏ vì không còn sử dụng trong layout mới
  const nowOffsetPct = shiftWindow
    ? ((Date.now() - shiftWindow.start.getTime()) / (SHIFT_DURATION_SEC * 1000)) * 100
    : -1;
  const showNowMarker = nowOffsetPct >= 0 && nowOffsetPct <= 100;

  // Chuẩn bị dữ liệu hiển thị cố định 3 ca (Ca 1, Ca 2, Ca 3). Ca nào có dữ liệu thì nhô cột, ca nào không có dữ liệu thì cột bằng 0.
  const displayShiftData = React.useMemo(() => {
    console.log(">>> [MayThanhHinhDashboard] Chuẩn bị dữ liệu hiển thị ca cố định từ shiftStatsData:", shiftStatsData);
    return [1, 2, 3].map(ca => {
      const found = shiftStatsData.find(item => Number(item.CaSX) === ca);
      return found ? {
        ...found,
        CaSX: ca
      } : {
        CaSX: ca,
        TongKeHoach: 0,
        TongThucTe: 0,
        TongThieu: 0
      };
    });
  }, [shiftStatsData]);

  /* ── Loading ── */
  if (loading) return (
    <div className="mes-spinner-wrap">
      <style>{css}</style>
      <div>
        <div className="mes-spinner" />
        <div className="mes-spinner-lbl">Đang tải dữ liệu máy {equipmentId}...</div>
      </div>
    </div>
  );

  return (
    <div className="mes-dash">
      <style>{css}</style>

      {/* ── TITLE BAR ───────────────────────────────────────────────── */}
      <div className="mes-title-bar mes-fade">
        <div className="mes-title-left">
          <button className="mes-back-btn" onClick={() => navigate('/dashboard/may-thanh-hinh')} title="Quay lại">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1a3a5c" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="mes-page-eyebrow">Giám sát thiết bị</div>
            <div className="mes-page-title">Máy Thành Hình #{equipmentId}</div>
          </div>
        </div>
      </div>

      {/* ── TABS ĐIỀU HƯỚNG: Mặc định Tab Dashboard hiển thị đầu tiên, tiếp theo là Tab Thông số ── */}
      <div className="mes-tabs mes-fade">
        <button
          className={`mes-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            console.log(">>> [MayThanhHinhDashboard] Người dùng bấm chuyển sang Tab: Dashboard hiệu suất");
            setActiveTab('dashboard');
          }}
        >
          Dashboard hiệu suất
        </button>
        <button
          className={`mes-tab-btn ${activeTab === 'chartData' ? 'active' : ''}`}
          onClick={() => {
            console.log(">>> [MayThanhHinhDashboard] Người dùng bấm chuyển sang Tab: Thông số hoạt động và cài đặt của máy");
            setActiveTab('chartData');
          }}
        >
          Thông số hoạt động và cài đặt của máy
        </button>
      </div>

      {/* ── NỘI DUNG TAB 1: Dashboard hiệu suất (Hiển thị mặc định) ── */}
      {activeTab === 'chartData' && renderChartDataTab()}

      {/* ── NỘI DUNG TAB 2: Dashboard cũ ── */}
      {activeTab === 'dashboard' && (
        <div style={{ padding: '10px', background: '#fff', border: '1px solid #b8cce0', borderRadius: '3px', marginTop: '10px' }}>

          <div className="th-overview">
            {/* ── HÌNH ẢNH MÁY ── */}
            <div className="th-photo">
              {machineImage
                ? <img src={machineImage} alt={`Máy ${equipmentId}`} />
                : <div className="th-photo-empty">Chưa có ảnh máy</div>}
              <div className="th-photo-cap">
                <span>Máy thành hình</span>
                <b>#{equipmentId}</b>
              </div>
            </div>

            <div className="th-ov-right">
              {/* ── THANH LỌC DÙNG CHUNG (Ca / Ngày) + TRẠNG THÁI HIỆN TẠI ── */}
              <div className="th-toolbar">
                <div className="th-tb-group">
                  <span className="th-tb-label">Ca</span>
                  <select
                    className="th-tb-pick"
                    value={selectedCa}
                    onChange={(e) => {
                      const caVal = e.target.value;
                      console.log("[TEST LỖI] Ca được chọn:", caVal);
                      setSelectedCa(caVal);
                    }}
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
                    value={selectedDate}
                    onChange={(e) => {
                      const dateVal = e.target.value;
                      console.log("[TEST LỖI] Ngày được chọn từ DatePicker:", dateVal);
                      setSelectedDate(dateVal);
                    }}
                  />
                </div>

                {/* Nút làm mới dữ liệu thủ công */}
                <div className="th-tb-group">
                  <button
                    className="th-tb-btn"
                    onClick={() => setRefreshToken(t => t + 1)}
                    disabled={isRefreshing}
                    title="Tải lại dữ liệu của ca đang xem"
                  >
                    {isRefreshing ? 'Đang tải...' : 'Refresh'}
                  </button>
                  {lastUpdatedTime && !isRefreshing && (
                    <span className="th-tb-updated">Cập nhật: {lastUpdatedTime}</span>
                  )}
                </div>

                <div
                  className="th-status-pill"
                  style={{ background: currentStatus.fill, color: currentStatus.ink }}
                  title={currentStatus.since ? `Bắt đầu lúc ${formatClock(currentStatus.since)}` : 'Chưa có bản ghi trạng thái'}
                >
                  <span className="th-status-dot" />
                  {currentStatus.name}
                </div>
              </div>

              {(() => {
                const tenLop = shiftStatsData && shiftStatsData.length > 0
                  ? (shiftStatsData[0].TenQuycachLop || 'Không có tên quy cách')
                  : 'Không có dữ liệu';

                return (
                  <>
                    {/* Hàng 2: Lốp đang sản xuất */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: '#1a3a5c', margin: '8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <span>Lốp đang sản xuất:</span>
                      <span style={{ color: '#1e293b', fontWeight: '900' }}>{tenLop}</span>
                    </div>

                    {/* Hàng 3: Thời gian máy chạy & Tiêu đề biểu đồ tròn */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 6px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#6890b0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thời gian máy chạy:</span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#1a3a5c' }}>{avgChay} <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>(h)</span></span>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: getUptimeColor(uptimePctAPI) }}>{uptimePctAPI.toFixed(2)}%</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#1a3a5c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Tỉ lệ trạng thái 8h ca
                      </div>
                    </div>

                    {/* Hàng 4: Timeline bên trái và Donut Chart bên phải song song */}
                    <div className="th-timeline-donut-row">

                      {/* Cột trái: Timeline trạng thái + Trục mốc giờ + Chú thích legend dạng grid 2 cột */}
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

                      {/* Cột phải: Donut chart tỉ lệ trạng thái */}
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

                        {/* Số liệu trọng tâm đặt giữa vòng tròn */}
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
                  </>
                );
              })()}
            </div>
          </div>

          {/* ── SẢN XUẤT TRONG THEO CA ── */}
          <div className="th-card" style={{ marginBottom: '12px' }}>
            <div className="th-card-head">
              <div className="th-card-title">Theo dõi kế hoạch sản xuất trong ca</div>
              <div className="th-card-meta">Ca {caLabel} · {dateLabel}</div>
            </div>
            <div className="th-card-body">
              <div className="th-split">
                <div style={{ minWidth: 0, height: '100%' }}>
                  {/* height:100% để các dòng giãn đều, không hở đáy khi bảng ít dòng */}
                  <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '12px' }}>
                        <th style={{ textAlign: 'left', borderBottom: '2px solid #cbd5e1', padding: '10px 12px', width: '15%' }}>MÃ QUY CÁCH</th>
                        <th style={{ textAlign: 'left', borderBottom: '2px solid #cbd5e1', padding: '10px 12px' }}>QUY CÁCH LỐP</th>
                        <th style={{ borderBottom: '2px solid #cbd5e1', padding: '10px 12px' }}>THỰC TẾ SX</th>
                        <th style={{ borderBottom: '2px solid #cbd5e1', padding: '10px 12px' }}>KẾ HOẠCH</th>
                        <th style={{ borderBottom: '2px solid #cbd5e1', padding: '10px 12px', width: '35%' }}>% HOÀN THÀNH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftStatsData.map((row, idx) => {
                        const percent = row.SoLuong_KH_HieuLuc > 0 ? (row.SanluongLopSX / row.SoLuong_KH_HieuLuc * 100).toFixed(2) : 0;
                        const numPercent = Number(percent);
                        const isVuotKH = numPercent > 100;
                        const rowColor = getTablePercentColor(numPercent);

                        // Console log hỗ trợ kiểm tra dữ liệu sản xuất theo ca khi test lỗi (Quy tắc 3)
                        console.log(`[ShiftStats] Dòng ${idx}: Quy cách = ${row.MaquycachLop || row.maQuyCachLop || 'N/A'}, Thực tế = ${row.SanluongLopSX || 0}, Kế hoạch = ${row.SoLuong_KH_HieuLuc || 0}, % = ${percent}%, Màu = ${rowColor}`);

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: isVuotKH ? '#f0f9ff' : 'transparent' }}>
                            <td style={{ textAlign: 'left', padding: '12px', color: '#1565C0', fontWeight: 'bold', fontSize: '13px' }}>
                              {row.MaquycachLop || row.maQuyCachLop || row.MaQuyCach || row.maQuyCach || '—'}
                            </td>
                            <td style={{ textAlign: 'left', padding: '12px' }}>
                              <div style={{ color: '#1565C0', fontWeight: 'bold', fontSize: '14px' }}>{row.TenQuycachLop || 'Không có tên quy cách'}</div>
                            </td>
                            <td style={{ color: '#1565C0', fontWeight: 'bold', fontSize: '15px', padding: '12px' }}>{row.SanluongLopSX || 0}</td>
                            <td style={{ color: '#1565C0', fontWeight: 'bold', fontSize: '15px', padding: '12px' }}>{row.SoLuong_KH_HieuLuc || 0}</td>
                            <td style={{ padding: '12px' }}>
                              {/* Container tổng chứa thanh tiến độ và phần trăm */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Thanh tiến độ nền */}
                                <div style={{ flex: 1, height: '16px', background: '#e2e8f0', borderRadius: '0px', overflow: 'hidden', position: 'relative' }} title={`Tiến độ: ${percent}% (Thang đo 0-120%)`}>
                                  {/* Vạch mốc 100% Kế hoạch */}
                                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '83.33%', width: '2px', background: '#64748b', zIndex: 2, opacity: 0.6 }} title="Mốc 100% Kế hoạch"></div>
                                  {/* Thanh phần trăm tiến độ đã hoàn thành (sử dụng dải màu getTablePercentColor) */}
                                  <div style={{ height: '100%', width: `${Math.min((numPercent / 120) * 100, 100)}%`, background: rowColor, transition: 'width 0.5s', borderRadius: '0px' }}></div>
                                </div>
                                {/* Khối hiển thị số % và nhãn Vượt KH */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '95px', justifyContent: 'flex-end' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: rowColor }}>{percent}%</span>
                                  {isVuotKH && (
                                    <span style={{ background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', fontSize: '9px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '0px', whiteSpace: 'nowrap' }}>
                                      Vượt KH
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {(() => {
                        const tongTT = shiftStatsData.reduce((sum, r) => sum + (r.SanluongLopSX || 0), 0);
                        const tongKH = shiftStatsData.reduce((sum, r) => sum + (r.SoLuong_KH_HieuLuc || 0), 0);
                        const percentTong = tongKH > 0 ? (tongTT / tongKH * 100).toFixed(2) : 0;
                        const numPercentTong = Number(percentTong);
                        const isVuotKH = numPercentTong > 100;
                        const tongColor = getTablePercentColor(numPercentTong);
                        return (
                          <tr style={{ background: isVuotKH ? '#e0f2fe' : '#f1f5f9' }}>
                            <td colSpan={2} style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '14px', padding: '12px', textAlign: 'left' }}>TỔNG CỘNG</td>
                            <td style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '16px', padding: '12px' }}>{tongTT}</td>
                            <td style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '16px', padding: '12px' }}>{tongKH}</td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1, height: '16px', background: '#cbd5e1', borderRadius: '0px', overflow: 'hidden', position: 'relative' }} title={`Tổng cộng tiến độ: ${percentTong}% (Thang đo 0-120%)`}>
                                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '83.33%', width: '2px', background: '#475569', zIndex: 2, opacity: 0.8 }} title="Mốc 100% Kế hoạch"></div>
                                  <div style={{ height: '100%', width: `${Math.min((numPercentTong / 120) * 100, 100)}%`, background: tongColor, transition: 'width 0.5s', borderRadius: '0px' }}></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '95px', justifyContent: 'flex-end' }}>
                                  <span style={{ color: tongColor, fontWeight: 'bold', fontSize: '15px' }}>{percentTong}%</span>
                                  {isVuotKH && (
                                    <span style={{ background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', fontSize: '9px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '0px', whiteSpace: 'nowrap' }}>
                                      Vượt KH
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* ── BIỂU ĐỒ CỘT CA (Scale 0 -> 120, Vuông vắn, KH màu #1565C0) ── */}
                <div className="th-split-side">
                  {(() => {
                    const tongTT = shiftStatsData.reduce((sum, r) => sum + (r.SanluongLopSX || 0), 0);
                    const tongKH = shiftStatsData.reduce((sum, r) => sum + (r.SoLuong_KH_HieuLuc || 0), 0);
                    const percentTong = tongKH > 0 ? (tongTT / tongKH * 100).toFixed(2) : 0;
                    const numPercentTong = Number(percentTong);

                    let barColor = getProgressColor(numPercentTong);

                    return (
                      <div style={{ display: 'flex', height: '100%', minHeight: '130px', alignItems: 'flex-end', paddingBottom: '25px', paddingTop: '15px' }}>
                        {/* Y-Axis (Trục mốc 0 - 120) */}
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
                        {/* Bars (Vuông vắn: borderRadius 0px, KH màu #1565C0) */}
                        <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: '20px', paddingLeft: '15px' }}>
                          {console.log(`>>> [MayThanhHinhDashboard Test Log] Cột KH ca: tongKH = ${tongKH}, Chiều cao cột KH = ${tongKH > 0 ? '83.33%' : '0%'}`)}
                          <div style={{ width: '38px', height: tongKH > 0 ? '83.33%' : '0%', background: '#1565C0', position: 'relative', borderRadius: '0px' }} title="Kế hoạch (100%)">
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
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 3: SẢN XUẤT THÁNG & SCADA ── */}
          <div className="th-row-2col">
            {/* SẢN XUẤT THÁNG */}
            <div className="th-card">
              <div className="th-card-head">
                <div className="th-card-title">TỔNG HỢP THỰC HIỆN KHSX THÁNG {String(selectedMonth).padStart(2, '0')}-{selectedYear}</div>
              </div>
              <div className="th-card-body">
                <div className="th-split">
                  <div style={{ minWidth: 0, height: '100%' }}>
                    <table style={{ width: '100%', height: '100%', fontSize: '14px', fontWeight: 'bold', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #d0dff0' }}>
                          <td style={{ padding: '12px 10px', color: '#1e293b' }}>SL KẾ HOẠCH</td>
                          <td style={{ textAlign: 'right', color: '#1565C0', padding: '12px 10px' }}>{(pieData?.keHoachThang || statsData?.tongKeHoachThang || 0).toLocaleString('vi-VN')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #d0dff0' }}>
                          <td style={{ padding: '12px 10px', color: '#1e293b' }}>SL THỰC TẾ</td>
                          <td style={{ textAlign: 'right', color: getProgressColor(pieData?.tyLeDat ?? 0), padding: '12px 10px' }}>{(pieData?.sanLuongThucTe || statsData?.tongSanLuongThucTe || 0).toLocaleString('vi-VN')}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 10px', color: '#1e293b' }}>MỨC HOÀN THÀNH</td>
                          <td style={{ textAlign: 'right', color: getProgressColor(pieData?.tyLeDat ?? 0), padding: '12px 10px' }}>
                            {(Number(pieData?.tyLeDat) || 0).toFixed(2)}%
                            {(pieData?.tyLeDat ?? 0) > 100 && (
                              <span style={{ background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '0px', marginLeft: '6px' }}>Vượt KH</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* BIỂU ĐỒ CỘT THÁNG (Scale 0 -> 120, Vuông vắn, KH màu #1565C0) */}
                  <div className="th-split-side">
                    {(() => {
                      const tongKH = pieData?.keHoachThang || statsData?.tongKeHoachThang || 0;
                      const tongTT = pieData?.sanLuongThucTe || statsData?.tongSanLuongThucTe || 0;
                      // Chuẩn hoá về 2 chữ số thập phân dù tyLeDat của backend trả về dạng số thô
                      const rawPercentTong = pieData?.tyLeDat ?? (tongKH > 0 ? (tongTT / tongKH * 100) : 0);
                      const numPercentTong = Number(rawPercentTong) || 0;
                      const percentTong = numPercentTong.toFixed(2);

                      let barColor = getProgressColor(numPercentTong);

                      return (
                        <div style={{ display: 'flex', height: '100%', minHeight: '130px', alignItems: 'flex-end', paddingBottom: '25px', paddingTop: '15px' }}>
                          {/* Y-Axis (Trục mốc 0 - 120) */}
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
                          {/* Bars */}
                          <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: '15px', paddingLeft: '12px' }}>
                            {console.log(`>>> [MayThanhHinhDashboard Test Log] Cột KH tháng: tongKH = ${tongKH}, Chiều cao cột KH = ${tongKH > 0 ? '83.33%' : '0%'}`)}
                            <div style={{ width: '35px', height: tongKH > 0 ? '83.33%' : '0%', background: '#3b82f6', position: 'relative', borderRadius: '4px 4px 0 0' }} title="Kế hoạch (100%)">
                              <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', color: '#3b82f6', fontSize: '11px', fontWeight: 'bold' }}>{Number(tongKH).toLocaleString('vi-VN')}</span>
                              <span style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>100%</span>
                              <span style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>KH</span>
                            </div>
                            <div style={{ width: '35px', height: `${Math.min((numPercentTong / 120) * 100, 100)}%`, background: barColor, position: 'relative', borderRadius: '4px 4px 0 0' }} title={`Thực tế: ${percentTong}%`}>
                              <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', color: barColor, fontSize: '11px', fontWeight: 'bold' }}>{Number(tongTT).toLocaleString('vi-VN')}</span>
                              <span style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>{percentTong}%</span>
                              <span style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>THỰC TẾ</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* BIỂU ĐỒ TRẠNG THÁI SCADA */}
            <div className="th-card">
              <div className="th-card-head">
                <div className="th-card-title">Biểu đồ trạng thái SCADA tháng {String(selectedMonth).padStart(2, '0')}-{selectedYear}</div>
              </div>
              <div className="th-card-body">
                <div className="th-scada-flex">
                  {/* Legend Table */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: '340px' }}>
                    {(() => {
                      // Log console dữ liệu SCADA hỗ trợ test lỗi theo quy tắc 3
                      console.log("[SCADA Chart] Dữ liệu biểu đồ trạng thái tháng:", scadaChartData);
                      return (
                        <table style={{ width: '100%', fontSize: '11px', fontWeight: 'bold', color: '#475569', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#1e3a8a', fontSize: '11px', fontWeight: 'bold' }}>
                              <th colSpan={2} style={{ padding: '6px 4px 6px 0', textAlign: 'left' }}>TRẠNG THÁI</th>
                              <th style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>THỜI GIAN</th>
                              <th style={{ padding: '6px 0 6px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>TỶ LỆ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: 'Không xác định', fill: '#fff2cc' },
                              { label: 'Máy chạy', fill: '#00b050' },
                              { label: 'Máy dừng', fill: '#ffff00' },
                              { label: 'Máy lỗi', fill: '#ff0000' },
                              { label: 'Mất kết nối PLC', fill: '#ffc000' },
                              { label: 'Không có kế hoạch', fill: '#b4c6e7' },
                              { label: 'App Server tắt', fill: '#c55a11' },
                              { label: 'Máy chủ tắt', fill: '#833c0c' },
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
                                  <td style={{ padding: '4px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    {valHours.toFixed(1)}h
                                  </td>
                                  <td style={{ padding: '4px 0 4px 12px', textAlign: 'right', color: '#64748b', whiteSpace: 'nowrap' }}>
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
                                  <td style={{ padding: '4px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    {valHours.toFixed(1)}h
                                  </td>
                                  <td style={{ padding: '4px 0 4px 12px', textAlign: 'right', color: '#64748b', whiteSpace: 'nowrap' }}>
                                    {percent}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                  {/* Khung chứa Biểu đồ PieChart, tự giãn hết chiều cao của thẻ */}
                  <div style={{ flex: 1, minWidth: 0, minHeight: '230px', position: 'relative' }}>
                    {(() => {
                      const RADIAN = Math.PI / 180;
                      const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        if (!percent || percent < 0.002) return null; // Hiển thị tất cả các lát từ 0.2% trở lên
                        const RADIAN = Math.PI / 180;

                        // Lát từ 7% trở lên (như 9.8%, 86.5%): Hiển thị ngay BÊN TRONG lát bánh
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
                              fontSize={percent >= 0.15 ? "11" : "9.5"}
                              fontWeight="900"
                            >
                              {`${(percent * 100).toFixed(1)}%`}
                            </text>
                          );
                        }

                        // Lát nhỏ (< 7%): Vẽ đường kẻ bậc thang so le tỏa ra ngoài đa hướng
                        const cos = Math.cos(-midAngle * RADIAN);
                        const sin = Math.sin(-midAngle * RADIAN);
                        const tier = (index || 0) % 3;
                        const extendDist = 6 + tier * 10;

                        const sx = cx + (outerRadius + 2) * cos;
                        const sy = cy + (outerRadius + 2) * sin;
                        const mx = cx + (outerRadius + extendDist) * cos;
                        const my = cy + (outerRadius + extendDist) * sin;

                        let ex = mx;
                        let ey = my;
                        let textAnchor = 'middle';
                        let textX = mx;
                        let textY = my;

                        if (Math.abs(cos) < 0.18) {
                          // Đỉnh hoặc đáy
                          ey = my + (sin < 0 ? -4 : 4);
                          textY = ey + (sin < 0 ? -3 : 3);
                          textAnchor = 'middle';
                        } else {
                          // Hai bên trái / phải
                          ex = mx + (cos >= 0 ? 1 : -1) * (6 + tier * 2);
                          textX = ex + (cos >= 0 ? 3 : -3);
                          textAnchor = cos >= 0 ? 'start' : 'end';
                        }

                        return (
                          <g key={`pie-th-lbl-${index}`}>
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
                              {`${(percent * 100).toFixed(1)}%`}
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
                            <Tooltip wrapperStyle={tooltipWrapperStyle} formatter={(value) => `${Number(value).toFixed(2)} giờ`} />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BIỂU ĐỒ THỰC HIỆN KH THEO NGÀY ── */}
          <div className="th-card">
            <div className="th-card-head th-daychart-head">
              <div className="th-card-title">TỔNG HỢP THỰC HIỆN KHSX THÁNG THEO TỪNG CA </div>
              <div className="th-card-meta">

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
                                fill={entry[`${shift.dataKey}_coDuLieu`] ? getDailyPlanChartColor(entry[`${shift.dataKey}_tyLe`]) : 'transparent'}
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
      )}

      {showChangeHistory && (
        <ThanhHinhChangeHistory
          equipmentId={equipmentId}
          onClose={() => setShowChangeHistory(false)}
        />
      )}
    </div>
  );
};

export default MayThanhHinhDashboard;