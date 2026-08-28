// src/pages/Dashboard/KeHoach/KeHoachTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import * as XLSX from 'xlsx'; // Thêm thư viện xuất Excel
import { toast } from 'react-toastify';
import { getKeHoachById, getKeHoachList, getKeHoachDetail } from "../../api/kehoachApi";

/* ─── MES Desktop CSS ─────────────────────────────────────────────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadein { from{opacity:0} to{opacity:1} }
  .mes-fade { animation: fadein 0.2s ease; }

  .mes-toolbar {
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    border-bottom: 2px solid #96afc8;
    padding: 4px 8px;
    display: flex; align-items: center; gap: 1px;
    flex-shrink: 0; user-select: none;
  }
  .mes-tb-btn {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 2px;
    padding: 4px 10px; min-width: 58px;
    border: 1px solid transparent; border-radius: 3px;
    background: transparent; cursor: pointer; color: #1e3a5c;
    transition: background 0.1s, border-color 0.1s;
  }
  .mes-tb-btn:hover { background: #c0d4e8; border-color: #80a8c8; }
  .mes-tb-btn:active { background: #a0bcd4; }
  .mes-tb-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .mes-tb-btn svg { width: 22px; height: 22px; flex-shrink: 0; }
  .mes-tb-btn span { font-size: 11px; font-weight: 600; white-space: nowrap; line-height: 1; }
  .mes-tb-btn.red span { color: #b91c1c; }
  .mes-tb-btn.red svg { stroke: #b91c1c; }
  .mes-tb-btn.green svg { stroke: #166534; }
  .mes-tb-btn.green span { color: #166534; }
  .mes-tb-sep { width: 1px; height: 46px; background: #96afc8; margin: 0 5px; flex-shrink: 0; }

  .mes-filterbar {
    background: #d4e4f4;
    border-bottom: 1px solid #96afc8;
    padding: 6px 10px;
    display: flex; align-items: center; gap: 8px;
    flex-wrap: wrap; flex-shrink: 0;
  }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-fb-label { font-size: 12px; font-weight: 700; color: #1a3a5c; white-space: nowrap; }

  .mes-select, .mes-input {
    border: 1px solid #6890b0; background: #ffffff;
    padding: 2px 6px; font-size: 12px; font-weight: 600;
    color: #1a3a5c; border-radius: 2px; outline: none; height: 24px;
    font-family: 'Segoe UI', sans-serif;
  }
  .mes-select:focus, .mes-input:focus { border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15); }
  .mes-select:disabled, .mes-input:disabled { background: #dce8f4; color: #8aabca; cursor: not-allowed; opacity: 0.7; }

  .mes-search-btn {
    display: flex; align-items: center; gap: 5px;
    background: linear-gradient(180deg, #f0f8ff 0%, #d0e8fc 100%);
    border: 1px solid #6890b0; border-radius: 2px;
    padding: 0 14px; height: 24px;
    font-size: 12px; font-weight: 700; color: #1a3a5c;
    cursor: pointer; white-space: nowrap; transition: background 0.1s;
  }
  .mes-search-btn:hover { background: linear-gradient(180deg, #d8f0ff 0%, #b8d8f8 100%); }
  .mes-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .mes-id-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: #dbeafe; border: 1px solid #93c5fd; border-radius: 2px;
    padding: 2px 8px; font-size: 11px; font-weight: 700; color: #1d4ed8;
    font-family: monospace;
  }

  .mes-kpi-row {
    background: #eaf0f8; border-bottom: 1px solid #b8cce0;
    padding: 5px 10px; display: flex; gap: 8px; flex-wrap: wrap;
    flex-shrink: 0; align-items: center;
  }
  .mes-kpi-card {
    background: #fff; border: 1px solid #b8cce0;
    border-radius: 3px; border-left-width: 3px;
    padding: 4px 12px; min-width: 110px;
  }
  .mes-kpi-lbl { font-size: 10px; font-weight: 700; color: #6890b0; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 1px; }
  .mes-kpi-val { font-size: 15px; font-weight: 900; font-variant-numeric: tabular-nums; display: block; line-height: 1.1; }

  .mes-table-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .mes-table-header {
    padding: 4px 10px; display: flex; justify-content: space-between; align-items: center;
    background: #f0f6fc; border-bottom: 1px solid #b8cce0;
    font-size: 11px; color: #5a7a9a; flex-shrink: 0; flex-wrap: wrap; gap: 4px;
  }
  .mes-table-wrap { flex: 1; overflow: auto; background: #fff; }

  .mes-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .mes-table thead tr { background: #ccdeed; position: sticky; top: 0; z-index: 2; }
  .mes-table thead th {
    padding: 6px 8px; text-align: left;
    font-size: 10px; font-weight: 700; color: #1a3a5c;
    border-right: 1px solid #96afc8; border-bottom: 2px solid #6890b0;
    white-space: nowrap; letter-spacing: 0.3px;
  }
  .mes-table thead th:last-child { border-right: none; }
  .mes-table tbody tr { cursor: pointer; border-bottom: 1px solid #d8e8f4; transition: background 0.08s; }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table tbody td {
    padding: 5px 8px; border-right: 1px solid #d8e8f4;
    color: #1a3a5c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 200px;
  }
  .mes-table tbody td:last-child { border-right: none; }

  .mes-badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 700; white-space: nowrap; line-height: 1.4; }
  .mes-badge-sky    { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
  .mes-badge-amber  { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .mes-badge-violet { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
  .mes-badge-blue   { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }

  /* Pagination */
  .mes-pagination {
    background: #eaf0f8; border-top: 1px solid #b8cce0;
    padding: 5px 10px; display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap; gap: 6px; flex-shrink: 0;
    font-size: 11px; color: #4a6a8a;
  }
  .mes-page-btn {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 26px; height: 22px; padding: 0 8px;
    border: 1px solid #96afc8; border-radius: 2px;
    background: #fff; font-size: 11px; font-weight: 600; color: #1a3a5c;
    cursor: pointer; transition: background 0.1s; gap: 4px;
  }
  .mes-page-btn:hover:not(:disabled) { background: #d4eaf8; }
  .mes-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .mes-page-btn.active { background: #1565C0; color: #fff; border-color: #1565C0; }
  .mes-page-size {
    border: 1px solid #96afc8; background: #fff; border-radius: 2px;
    padding: 2px 4px; font-size: 11px; color: #1a3a5c; outline: none; height: 22px;
  }

  .mes-error-bar {
    background: #fee2e2; border-bottom: 1px solid #fca5a5;
    padding: 5px 10px; font-size: 12px; color: #b91c1c;
    display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  }

  .mes-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; margin: 10px;
    border: 2px dashed #96afc8; border-radius: 3px;
    background: #f8fbfe; min-height: 200px; color: #6890b0;
  }
  .mes-spinner {
    width: 11px; height: 11px;
    border: 2px solid #90b8d8; border-top-color: #1565C0;
    border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
  }
  .mes-spinner-lg {
    width: 28px; height: 28px;
    border: 3px solid #90b8d8; border-top-color: #1565C0;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  .mes-statusbar {
    background: #c0d4e8; border-top: 1px solid #96afc8;
    padding: 2px 10px; font-size: 11px; color: #1a3a5c;
    display: flex; justify-content: space-between; flex-shrink: 0;
  }

  /* ── MODAL ── */
  .mes-modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: fadein 0.18s ease;
  }
  .mes-modal {
    background: #fff; border-radius: 4px; border: 1px solid #96afc8;
    width: 100%; max-width: 1020px; max-height: 92vh;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.22);
  }
  .mes-modal-header {
    background: linear-gradient(180deg, #d8e8f8 0%, #c8daf0 100%);
    border-bottom: 2px solid #96afc8;
    padding: 8px 14px; flex-shrink: 0;
  }
  .mes-modal-title-row {
    display: flex; align-items: center; justify-content: space-between; gap: 10; margin-bottom: 8px;
  }
  .mes-modal-title { font-size: 13px; font-weight: 700; color: #1a3a5c; }
  .mes-modal-sub   { font-size: 11px; color: #5a7a9a; margin-top: 1px; font-family: monospace; }
  .mes-modal-close {
    width: 24px; height: 24px; border: 1px solid #96afc8; border-radius: 2px;
    background: #fff; font-size: 14px; color: #5a7a9a; cursor: pointer;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: background 0.1s;
  }
  .mes-modal-close:hover { background: #fecaca; color: #b91c1c; border-color: #fca5a5; }

  /* Chips row */
  .mes-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
  .mes-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 9px; border-radius: 2px;
    font-family: monospace; font-size: 11px; font-weight: 700;
    border: 1px solid;
  }
  .mes-chip-lbl { font-size: 9px; font-weight: 600; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.8px; }

  /* Tab bar */
  .mes-tabs { display: flex; gap: 2px; background: #e0ecf8; border: 1px solid #96afc8; border-radius: 2px; padding: 3px; flex-wrap: wrap; }
  .mes-tab {
    display: flex; align-items: center; gap: 5px; padding: 4px 12px;
    border: 1px solid transparent; border-radius: 2px;
    background: transparent; font-size: 11px; font-weight: 600; color: #4a6a8a;
    cursor: pointer; transition: all 0.1s; white-space: nowrap;
  }
  .mes-tab:hover:not(.active) { background: #c8daf0; color: #1a3a5c; }
  .mes-tab.active { background: #fff; border-color: #96afc8; color: #1565C0; font-weight: 700; }

  .mes-modal-body { flex: 1; overflow-y: auto; padding: 12px 14px; background: #f0f6fc; }
  .mes-modal-footer {
    background: #e0ecf8; border-top: 1px solid #96afc8;
    padding: 6px 14px; display: flex; justify-content: space-between;
    align-items: center; flex-shrink: 0; flex-wrap: wrap; gap: 8px;
  }

  /* Detail grid & cards */
  .mes-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 680px) { .mes-detail-grid { grid-template-columns: 1fr; } }
  .mes-detail-fullwidth { grid-column: 1 / -1; }
  .mes-detail-card { background: #fff; border: 1px solid #b8cce0; border-radius: 3px; overflow: hidden; }
  .mes-detail-card-hdr {
    background: #d4e4f4; border-bottom: 1px solid #b8cce0;
    padding: 4px 10px; font-size: 10px; font-weight: 700;
    color: #1a3a5c; text-transform: uppercase; letter-spacing: 1px;
    display: flex; align-items: center; gap: 6px;
  }
  .mes-detail-card-body { padding: 4px 0; }
  .mes-detail-row {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 4px 10px; border-bottom: 1px solid #eef5fc; font-size: 11px;
  }
  .mes-detail-row:last-child { border-bottom: none; }
  .mes-detail-row:hover { background: #eef5fc; }
  .mes-detail-lbl { color: #5a7a9a; flex-shrink: 0; width: 170px; font-family: monospace; line-height: 18px; }
  .mes-detail-val { color: #1a3a5c; font-weight: 600; word-break: break-word; line-height: 18px; flex: 1; }
  .mes-detail-val.accent { color: #1565C0; font-family: monospace; }
  .mes-detail-empty { color: #96afc8; font-style: italic; font-weight: 400; }
`;

/* ─── Toolbar Button ──────────────────────────────────────────────────────── */
const TbBtn = ({ icon, label, onClick, disabled, className = '' }) => (
  <button className={`mes-tb-btn ${className}`} onClick={onClick} disabled={disabled} title={label}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
    <span>{label}</span>
  </button>
);

/* ─── Detail Row / Card ───────────────────────────────────────────────────── */
const DRow = ({ label, value, accent }) => {
  const empty = value === null || value === undefined || value === '';
  const disp  = empty ? null
    : typeof value === 'number' && !isNaN(value)
      ? value.toLocaleString('vi-VN')
      : String(value);
  return (
    <div className="mes-detail-row">
      <span className="mes-detail-lbl">{label}</span>
      <span className={`mes-detail-val${accent ? ' accent' : ''}${empty ? ' mes-detail-empty' : ''}`}>
        {disp ?? '—'}
      </span>
    </div>
  );
};

const DCard = ({ title, icon, fullWidth, children }) => (
  <div className={`mes-detail-card${fullWidth ? ' mes-detail-fullwidth' : ''}`}>
    <div className="mes-detail-card-hdr">
      {icon && <span>{icon}</span>}
      {title}
    </div>
    <div className="mes-detail-card-body">{children}</div>
  </div>
);

/* ─── CaBadge ─────────────────────────────────────────────────────────────── */
const CaBadge = ({ value }) => {
  if (!value && value !== 0) return <span style={{ color: '#96afc8' }}>—</span>;
  const cls = { 1: 'mes-badge-sky', 2: 'mes-badge-amber', 3: 'mes-badge-violet' }[value] ?? 'mes-badge-blue';
  return <span className={`mes-badge ${cls}`}>{value}</span>;
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const KeHoachTable = () => {
  const [data,           setData]           = useState([]);
  const [pagination,     setPagination]     = useState({ pageIndex: 0, pageSize: 20 });
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalElements,  setTotalElements]  = useState(0);
  const [filters,        setFilters]        = useState(() => {
    const today = new Date();
    return {
      id_kehoach: '',
      date_sx:    today.toISOString().slice(0, 10),
      ca_sx:      '',
    };
  });
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading,  setDetailLoading]  = useState(false);
  const [detailError,    setDetailError]    = useState(null);
  const [activeTab,      setActiveTab]      = useState(0);

  const now     = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN');

  // Tự động sinh ID kế hoạch dựa trên date_sx và ca_sx
  useEffect(() => {
    if (filters.date_sx) {
      const parts = filters.date_sx.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const generatedId = `RA10.${y}${m}${d}${filters.ca_sx || ''}`;
        setFilters(prev => ({ ...prev, id_kehoach: generatedId }));
        console.log(`[Auto ID KeHoach] Sinh tự động ID: ${generatedId} (Ngày: ${filters.date_sx}, Ca: ${filters.ca_sx || 'Tất cả'})`);
      }
    } else {
      setFilters(prev => ({ ...prev, id_kehoach: '' }));
    }
  }, [filters.date_sx, filters.ca_sx]);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchKeHoach = async () => {
    setLoading(true); setError(null);
    try {
      let response;
      let nam_sx = new Date().getFullYear();
      let thang_sx = new Date().getMonth() + 1;
      let ngay_sx = '';

      if (filters.date_sx) {
        const parts = filters.date_sx.split('-');
        if (parts.length === 3) {
          nam_sx = Number(parts[0]);
          thang_sx = Number(parts[1]);
          ngay_sx = Number(parts[2]);
        }
      }

      console.log(`[Fetch KeHoach] Gửi request với params: nam_sx=${nam_sx}, thang_sx=${thang_sx}, ngay_sx=${ngay_sx}, ca_sx=${filters.ca_sx}`);

      response = await getKeHoachList(
        { 
          nam_sx, 
          thang_sx,
          ...(ngay_sx && { ngay_sx }),
          ...(filters.ca_sx && { ca_sx: Number(filters.ca_sx) }) 
        },
        { page: pagination.pageIndex, size: pagination.pageSize, sort: 'creatDate,desc' }
      );
      setData(response.data || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("[Fetch KeHoach] Lỗi khi tải kế hoạch:", err);
      setError(err.message || 'Không thể tải dữ liệu kế hoạch sản xuất');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeHoach(); }, [pagination.pageIndex, pagination.pageSize]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPagination(p => ({ ...p, pageIndex: 0 }));
    fetchKeHoach();
  };

  const exportToExcel = async () => {
    if (totalElements === 0) {
      toast.warn("Không có dữ liệu để xuất");
      return;
    }

    setLoading(true);
    toast.info("Đang chuẩn bị dữ liệu xuất Excel toàn bộ...");
    try {
      let response;
      let nam_sx = new Date().getFullYear();
      let thang_sx = new Date().getMonth() + 1;
      let ngay_sx = '';

      if (filters.date_sx) {
        const parts = filters.date_sx.split('-');
        if (parts.length === 3) {
          nam_sx = Number(parts[0]);
          thang_sx = Number(parts[1]);
          ngay_sx = Number(parts[2]);
        }
      }

      console.log(`[Export Excel] Gửi request với params: nam_sx=${nam_sx}, thang_sx=${thang_sx}, ngay_sx=${ngay_sx}, ca_sx=${filters.ca_sx}`);

      response = await getKeHoachList(
        { 
          nam_sx, 
          thang_sx,
          ...(ngay_sx && { ngay_sx }),
          ...(filters.ca_sx && { ca_sx: Number(filters.ca_sx) }) 
        },
        { page: 0, size: totalElements, sort: 'creatDate,desc' }
      );

      const allData = response.data || [];
      const excelRows = allData.map((d, idx) => ({
        "STT": idx + 1,
        "ID Kế hoạch": d.idKehoach || "",
        "Mã Quy Cách": d.maQuyCachLop || "",
        "Tên Quy Cách": d.tenQuyCachLop || "",
        "Ngày SX": d.ngaySx && d.thangSx && d.namSx ? `${d.ngaySx}/${d.thangSx}/${d.namSx}` : "",
        "Ca": d.caSx || "",
        "Mã Máy": d.maMay || "",
        "Tên Máy": d.tenMay || "",
        "Số Lượng KH": d.soLuongKh || 0,
        "SL KH Điều Chỉnh": d.soLuongKhDieuChinh || 0,
        "Ngày Lập": d.timerStart ? format(new Date(d.timerStart), 'dd/MM/yyyy HH:mm') : "",
        "Ghi Chú": d.note || "",
        "Ngày Tạo": d.creatDate ? format(new Date(d.creatDate), 'dd/MM/yyyy HH:mm') : ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "KeHoachSanXuat");

      // Căn chỉnh độ rộng cột
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 12 },
        { wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
        { wch: 20 }, { wch: 20 }, { wch: 20 }
      ];

      XLSX.writeFile(workbook, `BaoCao_KeHoachSX_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success("Xuất Excel thành công");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xuất dữ liệu Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (row) => {
    const id = row.original.idKehoachMamayQc?.trim();
    if (!id) return;
    setSelectedDetail(null); setDetailError(null); setDetailLoading(true); setActiveTab(0);
    try {
      const res = await getKeHoachDetail(id);
      if (res.success) setSelectedDetail(res.data);
      else setDetailError(res.message || 'Không tìm thấy chi tiết');
    } catch (err) {
      setDetailError(err.message || 'Lỗi khi tải chi tiết');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => { setSelectedDetail(null); setDetailError(null); };

  /* ── Columns ───────────────────────────────────────────────────────────── */
  const columns = useMemo(() => [
    {
      header: 'STT', size: 46,
      cell: ({ row }) => (
        <span style={{ color: '#6890b0', fontSize: 11 }}>
          {pagination.pageIndex * pagination.pageSize + row.index + 1}
        </span>
      ),
    },
    { header: 'ID Kế hoạch',      accessorKey: 'idKehoach',     size: 140,
      cell: ({ getValue }) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#1565C0', fontWeight: 700 }}>{getValue() || '—'}</span> },
    { header: 'Mã quy cách',      accessorKey: 'maQuyCachLop',  size: 110,
      cell: ({ getValue }) => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{getValue() || '—'}</span> },
    { header: 'Tên quy cách lớp', accessorKey: 'tenQuyCachLop',
      cell: ({ getValue }) => <span style={{ fontWeight: 600, fontSize: 12 }}>{getValue() || '—'}</span> },
    {
      header: 'Ngày SX', size: 100,
      accessorFn: row => row.ngaySx && row.thangSx && row.namSx
        ? `${String(row.ngaySx).padStart(2,'0')}/${String(row.thangSx).padStart(2,'0')}/${row.namSx}`
        : '—',
      cell: ({ getValue }) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a6a8a' }}>{getValue()}</span>,
    },
    { header: 'Ca', accessorKey: 'caSx', size: 48,
      cell: ({ getValue }) => <CaBadge value={getValue()} /> },
    { header: 'Mã máy', accessorKey: 'maMay', size: 80,
      cell: ({ getValue }) => <span className="mes-badge mes-badge-blue">{getValue() || '—'}</span> },
    { header: 'Tên máy', accessorKey: 'tenMay',
      cell: ({ getValue }) => <span style={{ fontSize: 11, color: '#4a6a8a' }}>{getValue() || '—'}</span> },
    { header: 'SL KH', accessorKey: 'soLuongKh', size: 85,
      cell: ({ getValue }) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 12 }}>{getValue()?.toLocaleString('vi-VN') || '—'}</span> },
    { header: 'SL KH ĐC', accessorKey: 'soLuongKhDieuChinh', size: 100,
      cell: ({ getValue }) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, color: '#4a6a8a' }}>{getValue()?.toLocaleString('vi-VN') || '—'}</span> },
    {
      header: 'Bắt đầu', accessorKey: 'timerStart', size: 130,
      cell: ({ getValue }) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a6a8a' }}>
        {getValue() ? format(new Date(getValue()), 'dd/MM/yyyy HH:mm', { locale: vi }) : '—'}
      </span>,
    },
    { header: 'Ghi chú', accessorKey: 'note',
      cell: ({ getValue }) => <span style={{ fontSize: 11, color: '#5a7a9a', fontStyle: getValue() ? 'normal' : 'italic' }}>{getValue() || '—'}</span> },
    {
      header: 'Ngày tạo', accessorKey: 'creatDate', size: 130,
      cell: ({ getValue }) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6890b0' }}>
        {getValue() ? format(new Date(getValue()), 'dd/MM/yyyy HH:mm', { locale: vi }) : '—'}
      </span>,
    },
  ], [pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  const fmtDate      = (v) => v ? format(new Date(v), 'dd/MM/yyyy HH:mm:ss', { locale: vi }) : '—';
  const fmtDateShort = (v) => v ? format(new Date(v), 'dd/MM/yyyy HH:mm',    { locale: vi }) : '—';

  /* ── Tabs ──────────────────────────────────────────────────────────────── */
  const TABS = [
    { label: 'Tổng quan',         icon: '🏷️' },
    { label: 'Số lượng',          icon: '📊' },
    { label: 'Thời gian',         icon: '🕐' },
    { label: 'Nhập kho',          icon: '📦' },
    { label: 'Hệ thống',          icon: '⚙️' },
    { label: 'Người thực hiện',   icon: '👤' },
  ];

  const renderTabContent = (d) => {
    const ngaySx = d.ngaySx && d.thangSx && d.namSx
      ? `${String(d.ngaySx).padStart(2,'0')}/${String(d.thangSx).padStart(2,'0')}/${d.namSx}`
      : '—';

    if (activeTab === 0) return (
      <div className="mes-detail-grid">
        <DCard title="Thông tin cơ bản" icon="🏷️">
          <DRow label="ID Kế hoạch"       value={d.idKehoach}         accent />
          <DRow label="ID chính (Máy+QC)" value={d.idKehoachMamayQc} accent />
          <DRow label="Mã quy cách lớp"   value={d.maQuyCachLop} />
          <DRow label="Tên quy cách lớp"  value={d.tenQuyCachLop} />
          <DRow label="Mã máy"            value={d.maMay} />
          <DRow label="Tên máy"           value={d.tenMay} />
          <DRow label="Ngày sản xuất"     value={ngaySx} />
          <DRow label="Ca sản xuất"       value={d.caSx} />
        </DCard>
        <DCard title="Thông tin bổ sung" icon="📋">
          <DRow label="Store ID"    value={d.storeId} />
          <DRow label="Store Name"  value={d.storeName} />
          <DRow label="Mã NV lập"   value={d.maNvLap} />
          <DRow label="Tên NV lập"  value={d.tenNvLap} />
          <DRow label="Selected"    value={d.selected} />
          <DRow label="Ghi chú"     value={d.note} />
        </DCard>
      </div>
    );
    if (activeTab === 1) return (
      <div className="mes-detail-grid">
        <DCard title="Số lượng & Kế hoạch" icon="📊">
          <DRow label="Số lượng KH"     value={d.soLuongKh?.toLocaleString('vi-VN')} />
          <DRow label="KH điều chỉnh"   value={d.soLuongKhDieuChinh?.toLocaleString('vi-VN')} />
          <DRow label="Số lượng SX"     value={d.soLuongSx?.toLocaleString('vi-VN')} />
          <DRow label="Số lượng thiếu"  value={d.soLuongThieu?.toLocaleString('vi-VN')} />
          <DRow label="TT lớp bắt đầu"  value={d.thutuLopBatDau} />
          <DRow label="TT lớp kết thúc" value={d.thutuLopKetThuc} />
        </DCard>
      </div>
    );
    if (activeTab === 2) return (
      <div className="mes-detail-grid">
        <DCard title="Thời gian" icon="🕐">
          <DRow label="Timer Start" value={fmtDate(d.timerStart)} />
          <DRow label="Timer End"   value={fmtDate(d.timerEnd)} />
          <DRow label="Ngày lập"    value={fmtDateShort(d.ngayLap)} />
          <DRow label="Ngày tạo"    value={fmtDateShort(d.creatDate)} />
          <DRow label="Ngày sửa"    value={fmtDateShort(d.dateModified)} />
        </DCard>
      </div>
    );
    if (activeTab === 3) return (
      <div className="mes-detail-grid">
        <DCard title="Nhập kho & Chất lượng" icon="📦">
          <DRow label="Phiếu nhập kho"       value={d.phieuNhapKho} />
          <DRow label="Chất lượng lớp"       value={d.chatLuongLop} />
          <DRow label="Tình trạng nhập kho"  value={d.tinhTrangNhapKho} />
          <DRow label="Ngày tháng NK"        value={d.namThangNgayNhapKho} />
          <DRow label="Ngày tháng ca NK"     value={d.namThangNgayCaNhapKho} />
        </DCard>
      </div>
    );
    if (activeTab === 4) return (
      <div className="mes-detail-grid">
        <DCard title="Thông tin hệ thống" icon="⚙️">
          <DRow label="STT"               value={d.stt} />
          <DRow label="Shift"             value={d.shift} />
          <DRow label="Mode Change Data" value={d.modeChangeData} />
          <DRow label="Year"              value={d.year} />
          <DRow label="Year Month"        value={d.yearMonth} />
          <DRow label="Year Month Day"    value={d.yearMonthDay} />
          <DRow label="YMD Shift"         value={d.yearMonthDayShift} />
          <DRow label="Latch Data"        value={d.latchData} />
          <DRow label="Lock Data"         value={d.lockData} />
          <DRow label="Computer Name"     value={d.computerName} />
          <DRow label="Computer ID"       value={d.computerId} />
          <DRow label="IP Address"        value={d.ipAddress} />
          <DRow label="Check Backup"      value={d.checkBackup} />
        </DCard>
        <DCard title="Spare Fields" icon="🗃️">
          {Array.from({ length: 9 }, (_, i) => (
            <DRow key={i} label={`Spare ${i + 1}`} value={d[`spare${i + 1}`]} />
          ))}
        </DCard>
      </div>
    );
    if (activeTab === 5) return (
      <div className="mes-detail-grid">
        <DCard title="Người thực hiện" icon="👤" fullWidth>
          <DRow label="User ID tạo"   value={d.userIdCreat} />
          <DRow label="User Name tạo" value={d.userNameCreat} />
          <DRow label="User ID sửa"   value={d.userIdModified} />
          <DRow label="User Name sửa" value={d.userNameModified} />
        </DCard>
      </div>
    );
  };

  /* ─── Page list for pagination ────────────────────────────────────────── */
  const curr      = table.getState().pagination.pageIndex;
  const pageTotal = table.getPageCount() || 1;
  const pageNums  = useMemo(() => {
    const pages = [];
    for (let i = 0; i < Math.min(5, pageTotal); i++) {
      let p;
      if (pageTotal <= 5) p = i;
      else if (curr < 3) p = i;
      else if (curr > pageTotal - 4) p = pageTotal - 5 + i;
      else p = curr - 2 + i;
      pages.push(p);
    }
    return pages;
  }, [curr, pageTotal]);

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#e0eaf4', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{css}</style>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
      <div className="mes-toolbar">
        <TbBtn
          label="Làm tươi" className="green"
          onClick={handleSearch} disabled={loading}
          icon={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}
        />
        <TbBtn
          label="Đóng" className="red"
          onClick={() => { setData([]); setTotalElements(0); }}
          icon={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
        />

        <div className="mes-tb-sep" />

        <TbBtn
          label="Xuất Excel"
          onClick={exportToExcel}
          disabled={loading}
          icon={<><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></>}
        />
        <TbBtn
          label="In"
          onClick={() => window.print()}
          icon={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>}
        />

        <div className="mes-tb-sep" />

        <TbBtn
          label="Thiết lập"
          onClick={() => {}}
          icon={<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>}
        />
      </div>

      {/* Loading bar */}
      {loading && (
        <div style={{ height: 3, background: '#b8cce0', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: '40%', background: '#1565C0', animation: 'progress 1.2s infinite ease-in-out' }} />
        </div>
      )}

      {/* Error bar */}
      {error && (
        <div className="mes-error-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="mes-filterbar">

        <div className="mes-fb-group">
          <span className="mes-fb-label">ID Kế hoạch:</span>
          <input
            type="text" className="mes-input" style={{ width: 155, fontWeight: 'bold', color: '#1565C0' }}
            value={filters.id_kehoach}
            disabled
            placeholder="Tự động sinh..."
          />
          <span className="mes-id-chip">Tự động</span>
        </div>

        <div style={{ width: 1, height: 24, background: '#96afc8', flexShrink: 0 }} />

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ngày sản xuất:</span>
          <input
            type="date" className="mes-input" style={{ width: 130 }}
            value={filters.date_sx}
            onChange={e => setFilters({ ...filters, date_sx: e.target.value })}
          />
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ca:</span>
          <select
            className="mes-select" style={{ width: 82 }}
            value={filters.ca_sx}
            onChange={e => setFilters({ ...filters, ca_sx: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">Tất cả</option>
            <option value={1}>Ca 1</option>
            <option value={2}>Ca 2</option>
            <option value={3}>Ca 3</option>
          </select>
        </div>

        <div style={{ width: 1, height: 24, background: '#96afc8', flexShrink: 0 }} />

        <button className="mes-search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? (
            <><span className="mes-spinner" /> Đang tải...</>
          ) : (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
              Tìm kiếm
            </>
          )}
        </button>
      </div>

      {/* ── KPI ROW ─────────────────────────────────────────────────────── */}
      {totalElements > 0 && !loading && (
        <div className="mes-kpi-row mes-fade">
          <div className="mes-kpi-card" style={{ borderLeftColor: '#1565C0' }}>
            <span className="mes-kpi-lbl">Tổng kế hoạch</span>
            <span className="mes-kpi-val" style={{ color: '#1565C0' }}>{totalElements.toLocaleString('vi-VN')}</span>
          </div>
          <div className="mes-kpi-card" style={{ borderLeftColor: '#166534' }}>
            <span className="mes-kpi-lbl">Trang hiện tại</span>
            <span className="mes-kpi-val" style={{ color: '#166534' }}>{curr + 1}/{pageTotal}</span>
          </div>
          <div className="mes-kpi-card" style={{ borderLeftColor: '#c2410c' }}>
            <span className="mes-kpi-lbl">Hiển thị</span>
            <span className="mes-kpi-val" style={{ color: '#c2410c' }}>{data.length}</span>
          </div>
        </div>
      )}

      {/* ── TABLE ───────────────────────────────────────────────────────── */}
      <div className="mes-table-area">
        <div className="mes-table-header">
          <span>
            Hiển thị <strong style={{ color: '#1565C0' }}>{data.length}</strong> / <strong>{totalElements.toLocaleString('vi-VN')}</strong> kế hoạch
          </span>
          <span>Nhấn vào dòng để xem chi tiết</span>
        </div>

        <div className="mes-table-wrap mes-fade">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, color: '#6890b0' }}>
              <div className="mes-spinner-lg" />
              <span style={{ fontSize: 12 }}>Đang tải dữ liệu...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="mes-empty">
              <div style={{ fontSize: 36 }}>📋</div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Không tìm thấy kế hoạch sản xuất nào</p>
            </div>
          ) : (
            <table className="mes-table">
              <thead>
                <tr>
                  {table.getHeaderGroups().map(hg => hg.headers.map(header => (
                    <th key={header.id} style={{ width: header.column.columnDef.size }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} onClick={() => handleRowClick(row)}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── PAGINATION ──────────────────────────────────────────────────── */}
      <div className="mes-pagination">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Trang <strong style={{ color: '#1565C0' }}>{curr + 1}</strong> / {pageTotal}</span>
          <select className="mes-page-size" value={pagination.pageSize}
            onChange={e => { table.setPageSize(Number(e.target.value)); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
            {[10, 20, 30, 50, 100].map(s => <option key={s} value={s}>{s} dòng/trang</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button className="mes-page-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || loading}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Trước
          </button>

          {pageNums.map(p => (
            <button key={p}
              className={`mes-page-btn${p === curr ? ' active' : ''}`}
              onClick={() => table.setPageIndex(p)}
              disabled={loading}>
              {p + 1}
            </button>
          ))}

          <button className="mes-page-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || loading}>
            Sau
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="mes-statusbar">
        <span>{loading ? 'Đang tải dữ liệu...' : totalElements > 0 ? `${totalElements.toLocaleString('vi-VN')} kế hoạch · ${dateStr}` : 'Sẵn sàng'}</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · XN RADIAL · XƯỞNG CVTH</span>
      </div>

      {/* ── DETAIL MODAL ────────────────────────────────────────────────── */}
      {(selectedDetail || detailLoading || detailError) && (
        <div className="mes-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="mes-modal">

            {/* Header */}
            <div className="mes-modal-header">
              <div className="mes-modal-title-row">
                <div>
                  <div className="mes-modal-title">Chi tiết kế hoạch sản xuất</div>
                  {selectedDetail && (
                    <div className="mes-modal-sub">{selectedDetail.idKehoachMamayQc || '—'}</div>
                  )}
                </div>
                <button className="mes-modal-close" onClick={closeModal}>×</button>
              </div>

              {/* Chips */}
              {selectedDetail && (
                <div className="mes-chips">
                  {[
                    { lbl: 'Mã máy', val: selectedDetail.maMay,    bg: '#dbeafe', bd: '#93c5fd', c: '#1d4ed8' },
                    { lbl: `Ca ${selectedDetail.caSx}`, val: null, bg: '#f0fdf4', bd: '#86efac', c: '#166534' },
                    { lbl: 'SL KH',  val: selectedDetail.soLuongKh?.toLocaleString('vi-VN'),           bg: '#fef9ec', bd: '#f0d070', c: '#b8860b' },
                    { lbl: 'SL ĐC',  val: selectedDetail.soLuongKhDieuChinh?.toLocaleString('vi-VN'),  bg: '#f1f5f9', bd: '#cbd5e1', c: '#475569' },
                  ].filter(ch => ch.lbl && !ch.lbl.includes('undefined')).map((ch, i) => (
                    <span key={i} className="mes-chip" style={{ background: ch.bg, borderColor: ch.bd, color: ch.c }}>
                      <span className="mes-chip-lbl">{ch.lbl}</span>
                      {ch.val && <span>{ch.val}</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Tabs */}
              {selectedDetail && (
                <div className="mes-tabs">
                  {TABS.map((tab, idx) => (
                    <button
                      key={tab.label}
                      className={`mes-tab${activeTab === idx ? ' active' : ''}`}
                      onClick={() => setActiveTab(idx)}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="mes-modal-body">
              {detailLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '50px 0', color: '#6890b0' }}>
                  <div className="mes-spinner-lg" />
                  <span style={{ fontSize: 12 }}>Đang tải chi tiết...</span>
                </div>
              ) : detailError ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#b91c1c', fontWeight: 600 }}>{detailError}</div>
              ) : selectedDetail && (
                <div className="mes-fade">{renderTabContent(selectedDetail)}</div>
              )}
            </div>

            {/* Footer */}
            <div className="mes-modal-footer">
              <span style={{ fontSize: 11, color: '#5a7a9a', fontFamily: 'monospace' }}>
                {selectedDetail ? (
                  <>Tạo: <strong style={{ color: '#1a3a5c' }}>{fmtDateShort(selectedDetail.creatDate)}</strong>
                    {selectedDetail.dateModified && <> · Sửa: <strong style={{ color: '#1a3a5c' }}>{fmtDateShort(selectedDetail.dateModified)}</strong></>}
                  </>
                ) : ''}
              </span>
              <button className="mes-search-btn" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeHoachTable;