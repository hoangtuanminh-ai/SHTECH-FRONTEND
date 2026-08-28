// src/pages/ThanhHinhTable.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as XLSX from 'xlsx'; // Thêm thư viện xuất Excel
import { toast } from 'react-toastify';
import {
  getDanhSachMay,
  getThanhHinhAllMachines,
  getThanhHinhByMachine,
} from "../../api/thanhhinhApi";

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
  .mes-select:focus, .mes-input:focus {
    border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15);
  }

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
  .mes-reset-btn {
    display: flex; align-items: center; gap: 5px;
    background: linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%);
    border: 1px solid #96afc8; border-radius: 2px;
    padding: 0 12px; height: 24px;
    font-size: 12px; font-weight: 600; color: #4a6a8a;
    cursor: pointer; white-space: nowrap; transition: background 0.1s;
  }
  .mes-reset-btn:hover { background: linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%); }

  .mes-kpi-row {
    background: #eaf0f8; border-bottom: 1px solid #b8cce0;
    padding: 5px 10px; display: flex; gap: 8px; flex-wrap: wrap; flex-shrink: 0;
    align-items: center;
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
    font-size: 11px; color: #5a7a9a; flex-shrink: 0; flex-wrap: wrap; gap: 6px;
  }
  .mes-table-wrap { flex: 1; overflow: auto; background: #fff; }

  .mes-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
  .mes-table thead tr { background: #ccdeed; position: sticky; top: 0; z-index: 2; }
  .mes-table thead th {
    padding: 6px 8px; text-align: left;
    font-size: 10px; font-weight: 700; color: #1a3a5c;
    border-right: 1px solid #96afc8; border-bottom: 2px solid #6890b0;
    white-space: nowrap; letter-spacing: 0.3px; overflow: hidden; text-overflow: ellipsis;
  }
  .mes-table thead th:last-child { border-right: none; }
  .mes-table thead th.r { text-align: right; }
  .mes-table thead th.c { text-align: center; }
  .mes-table tbody tr { cursor: pointer; border-bottom: 1px solid #d8e8f4; transition: background 0.08s; }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table tbody td {
    padding: 4px 8px; border-right: 1px solid #d8e8f4;
    color: #1a3a5c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .mes-table tbody td:last-child { border-right: none; }
  .mes-table td.r { text-align: right; font-variant-numeric: tabular-nums; }
  .mes-table td.c { text-align: center; }

  .mes-badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 700; white-space: nowrap; line-height: 1.4; }
  .mes-badge-teal   { background: #f0fdfa; color: #0f766e; border: 1px solid #99f6e4; }
  .mes-badge-sky    { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
  .mes-badge-amber  { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .mes-badge-violet { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
  .mes-badge-gray   { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }

  /* Pagination */
  .mes-pagination {
    background: #eaf0f8; border-top: 1px solid #b8cce0;
    padding: 5px 10px; display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap; gap: 6px; flex-shrink: 0;
    font-size: 11px; color: #4a6a8a;
  }
  .mes-page-btn {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 26px; height: 22px; padding: 0 6px;
    border: 1px solid #96afc8; border-radius: 2px;
    background: #fff; font-size: 11px; font-weight: 600; color: #1a3a5c;
    cursor: pointer; transition: background 0.1s;
  }
  .mes-page-btn:hover:not(:disabled) { background: #d4eaf8; }
  .mes-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .mes-page-btn.active { background: #1565C0; color: #fff; border-color: #1565C0; }
  .mes-page-size {
    border: 1px solid #96afc8; background: #fff; border-radius: 2px;
    padding: 2px 4px; font-size: 11px; color: #1a3a5c; outline: none; height: 22px;
  }
  .mes-jump-input {
    width: 40px; height: 22px; text-align: center;
    border: 1px solid #96afc8; border-radius: 2px; font-size: 11px; color: #1a3a5c;
    outline: none; background: #fff;
  }

  /* Mobile cards */
  .mes-mobile-card {
    background: #fff; border: 1px solid #b8cce0; border-radius: 3px;
    padding: 8px 10px; margin: 4px 8px; cursor: pointer;
    transition: background 0.1s; border-left: 3px solid #1565C0;
  }
  .mes-mobile-card:hover { background: #d4eaf8; }

  /* Detail modal */
  .mes-modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .mes-modal {
    background: #fff; border-radius: 4px; border: 1px solid #96afc8;
    width: 100%; max-width: 900px; max-height: 90vh;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  }
  .mes-modal-header {
    background: linear-gradient(180deg, #d8e8f8 0%, #c8daf0 100%);
    border-bottom: 2px solid #96afc8;
    padding: 8px 14px; display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .mes-modal-title { font-size: 13px; font-weight: 700; color: #1a3a5c; }
  .mes-modal-sub   { font-size: 11px; color: #5a7a9a; margin-top: 2px; }
  .mes-modal-close {
    width: 24px; height: 24px; border: 1px solid #96afc8; border-radius: 2px;
    background: #fff; font-size: 14px; color: #5a7a9a; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.1s;
  }
  .mes-modal-close:hover { background: #fecaca; color: #b91c1c; border-color: #fca5a5; }
  .mes-modal-body { padding: 14px; overflow-y: auto; flex: 1; }
  .mes-modal-footer {
    background: #eaf0f8; border-top: 1px solid #b8cce0;
    padding: 6px 14px; display: flex; justify-content: flex-end; flex-shrink: 0;
  }
  .mes-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 600px) { .mes-detail-grid { grid-template-columns: 1fr; } }
  .mes-detail-card { border: 1px solid #b8cce0; border-radius: 3px; overflow: hidden; }
  .mes-detail-card-header {
    background: #d4e4f4; border-bottom: 1px solid #b8cce0;
    padding: 4px 10px; font-size: 10px; font-weight: 700;
    color: #1a3a5c; text-transform: uppercase; letter-spacing: 1px;
  }
  .mes-detail-card-body { padding: 6px 10px; }
  .mes-detail-row {
    display: flex; justify-content: space-between; gap: 8px;
    padding: 3px 0; border-bottom: 1px solid #eef5fc; font-size: 11px;
  }
  .mes-detail-row:last-child { border-bottom: none; }
  .mes-detail-label { color: #5a7a9a; flex-shrink: 0; width: 140px; }
  .mes-detail-value { color: #1a3a5c; font-weight: 600; text-align: right; word-break: break-all; }

  .mes-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; margin: 10px;
    border: 2px dashed #96afc8; border-radius: 3px;
    background: #f8fbfe; min-height: 200px; color: #6890b0;
  }
  .mes-spinner {
    width: 16px; height: 16px;
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
  .mes-error-bar {
    background: #fee2e2; border-bottom: 1px solid #fca5a5;
    padding: 5px 10px; font-size: 12px; color: #b91c1c;
    display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const toDisplay = (v) =>
  v === null || v === undefined || v === "" ? "—" : String(v);

const toDateTime = (v) => {
  if (!v) return "—";
  try { return format(new Date(v), "dd/MM/yyyy HH:mm", { locale: vi }); }
  catch { return "—"; }
};

const toNgaySx = (row) =>
  row?.ngaySx && row?.thangSx && row?.namSx
    ? `${String(row.ngaySx).padStart(2,"0")}/${String(row.thangSx).padStart(2,"0")}/${row.namSx}`
    : "—";

const daysInMonthOf = (y, m) => new Date(Number(y), Number(m), 0).getDate();

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const set = new Set([0, total - 1]);
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) set.add(i);
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  let prev = -1;
  for (const p of sorted) {
    if (p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

const KEY_MAP = {
  barcodeTh:"Barcode TH", barcodeLh:"Barcode LH",
  idKehoach:"ID kế hoạch", maQuyCachLop:"Mã quy cách lớp",
  tenQuyCachLop:"Tên quy cách lớp", maMay:"Mã máy", tenMay:"Tên máy",
  ngaySx:"Ngày SX", thangSx:"Tháng SX", namSx:"Năm SX", caSx:"Ca SX",
  soLuongSx:"Số lượng SX", storeId:"Store ID", storeName:"Store Name",
  timerStart:"Thời gian bắt đầu", timerEnd:"Thời gian kết thúc",
  note:"Ghi chú", creatDate:"Ngày tạo", dateModified:"Ngày sửa",
  userNameCreat:"Người tạo", userIdCreat:"User ID tạo",
  userNameModified:"Người sửa", userIdModified:"User ID sửa",
};

/* ─── Toolbar Button ──────────────────────────────────────────────────────── */
const TbBtn = ({ icon, label, onClick, disabled, className = '' }) => (
  <button className={`mes-tb-btn ${className}`} onClick={onClick} disabled={disabled} title={label}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
    <span>{label}</span>
  </button>
);

/* ─── Badge Ca ────────────────────────────────────────────────────────────── */
const CaBadge = ({ value }) => {
  if (!value && value !== 0) return <span style={{ color: '#96afc8', fontSize: 11 }}>—</span>;
  const cls = { 1: 'mes-badge-sky', 2: 'mes-badge-amber', 3: 'mes-badge-violet' }[value] ?? 'mes-badge-gray';
  return <span className={`mes-badge ${cls}`}>{value}</span>;
};

/* ─── Detail Row / Card ───────────────────────────────────────────────────── */
const DRow = ({ label, value }) => (
  <div className="mes-detail-row">
    <span className="mes-detail-label">{label}</span>
    <span className="mes-detail-value">{toDisplay(value)}</span>
  </div>
);

const DCard = ({ title, children }) => (
  <div className="mes-detail-card">
    <div className="mes-detail-card-header">{title}</div>
    <div className="mes-detail-card-body">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const ThanhHinhTable = () => {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [machineOptions, setMachineOptions] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize,  setPageSize]  = useState(20);
  const [jumpValue, setJumpValue] = useState("1");

  const now          = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const dateStr      = now.toLocaleDateString('vi-VN');

  const initFilters = {
    machine_number: "",
    id_kehoach:     "",
    date_sx:        new Date().toISOString().slice(0, 10),
    ca_sx:          "",
  };
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    return {
      machine_number: "",
      id_kehoach:     "",
      date_sx:        today.toISOString().slice(0, 10),
      ca_sx:          "",
    };
  });

  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // Tự động sinh ID kế hoạch dựa trên date_sx và ca_sx
  useEffect(() => {
    if (filters.date_sx) {
      const parts = filters.date_sx.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const generatedId = `RA10.${y}${m}${d}${filters.ca_sx || ''}`;
        setFilters(prev => ({ ...prev, id_kehoach: generatedId }));
        console.log(`[ThanhHinhTable Auto ID] Sinh tự động ID kế hoạch: ${generatedId} (Ngày: ${filters.date_sx}, Ca: ${filters.ca_sx || 'Tất cả'})`);
      }
    } else {
      setFilters(prev => ({ ...prev, id_kehoach: '' }));
    }
  }, [filters.date_sx, filters.ca_sx]);

  useEffect(() => { setJumpValue(String(pageIndex + 1)); }, [pageIndex]);

  /* Load máy */
  useEffect(() => {
    (async () => {
      try {
        const res = await getDanhSachMay();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMachineOptions(list);
      } catch (e) { console.error("Lỗi tải danh sách máy:", e); }
    })();
  }, []);

  const normalizedMachines = useMemo(() => {
    const map = new Map();
    for (const m of machineOptions) {
      const maMay = m?.maMay ?? m?.MaMay ?? m?.machine_number ?? m?.machineNumber;
      const tenMay = m?.tenMay ?? m?.TenMay ?? m?.machine_name ?? m?.machineName ?? "";
      if (maMay == null || maMay === "") continue;
      const key = String(maMay);
      if (!map.has(key)) map.set(key, { maMay: key, tenMay: String(tenMay) });
    }
    return [...map.values()].sort((a, b) => Number(a.maMay) - Number(b.maMay));
  }, [machineOptions]);

  const fetchThanhHinh = useCallback(async (pi, ps) => {
    const f = filtersRef.current;
    setLoading(true);
    setError("");
    try {
      let nam_sx = new Date().getFullYear();
      let thang_sx = new Date().getMonth() + 1;
      let ngay_sx = "";

      if (f.date_sx) {
        const parts = f.date_sx.split('-');
        if (parts.length === 3) {
          nam_sx = Number(parts[0]);
          thang_sx = Number(parts[1]);
          ngay_sx = Number(parts[2]);
        }
      }

      console.log(`[Fetch ThanhHinh] Gửi request: machine_number=${f.machine_number}, nam_sx=${nam_sx}, thang_sx=${thang_sx}, ngay_sx=${ngay_sx}, ca_sx=${f.ca_sx}`);

      const params = {
        page: pi, size: ps,
        nam_sx,
        thang_sx,
        ...(ngay_sx && { ngay_sx }),
        ...(f.ca_sx && { ca_sx: Number(f.ca_sx) }),
      };
      const res = f.machine_number
        ? await getThanhHinhByMachine(Number(f.machine_number), params)
        : await getThanhHinhAllMachines(params);

      setData(Array.isArray(res?.data) ? res.data : []);
      setTotal(Number(res?.total ?? res?.totalElements ?? res?.data?.length ?? 0));
    } catch (e) {
      console.error("[Fetch ThanhHinh] Lỗi:", e);
      setError(e?.message || "Không thể tải dữ liệu thành hình");
      setData([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThanhHinh(pageIndex, pageSize); }, [pageIndex, pageSize, fetchThanhHinh]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (pageIndex !== 0) { setPageIndex(0); }
    else { fetchThanhHinh(0, pageSize); }
  };

  const handleResetFilters = () => { setFilters(initFilters); };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageIndex(0);
  };

  const goPage = useCallback((p) => {
    setPageIndex(Math.max(0, Math.min(p, pageCount - 1)));
  }, [pageCount]);

  const handleJump = () => {
    const p = parseInt(jumpValue, 10);
    if (!isNaN(p) && p >= 1) goPage(p - 1);
  };

  /* Xuất Excel cho tất cả các trang dựa trên bộ lọc hiện tại */
  const exportToExcel = async () => {
    if (total === 0) {
      toast.warn("Không có dữ liệu để xuất");
      return;
    }

    setLoading(true);
    toast.info("Đang chuẩn bị dữ liệu xuất Excel...");
    try {
      const f = filtersRef.current;
      let nam_sx = new Date().getFullYear();
      let thang_sx = new Date().getMonth() + 1;
      let ngay_sx = "";

      if (f.date_sx) {
        const parts = f.date_sx.split('-');
        if (parts.length === 3) {
          nam_sx = Number(parts[0]);
          thang_sx = Number(parts[1]);
          ngay_sx = Number(parts[2]);
        }
      }

      console.log(`[Export Excel ThanhHinh] Gửi request: machine_number=${f.machine_number}, nam_sx=${nam_sx}, thang_sx=${thang_sx}, ngay_sx=${ngay_sx}, ca_sx=${f.ca_sx}`);

      const params = {
        page: 0, 
        size: total, // Lấy toàn bộ bản ghi
        nam_sx,
        thang_sx,
        ...(ngay_sx && { ngay_sx }),
        ...(f.ca_sx && { ca_sx: Number(f.ca_sx) }),
      };

      const res = f.machine_number
        ? await getThanhHinhByMachine(Number(f.machine_number), params)
        : await getThanhHinhAllMachines(params);

      const allData = Array.isArray(res?.data) ? res.data : [];

      const excelRows = allData.map((item, idx) => ({
        "STT": idx + 1,
        "Mã Máy": item.maMay || "",
        "Tên Máy": item.tenMay || "",
        "ID Kế Hoạch": item.idKehoach || "",
        "Mã Quy Cách": item.maQuyCachLop || "",
        "Tên Quy Cách": item.tenQuyCachLop || "",
        "Ngày SX": toNgaySx(item),
        "Ca SX": item.caSx || "",
        "Barcode TH": item.barcodeTh || "",
        "Barcode LH": item.barcodeLh || "",
        "Thời Gian Bắt Đầu": toDateTime(item.timerStart),
        "Thời Gian Kết Thúc": toDateTime(item.timerEnd),
        "Ghi Chú": item.note || "",
        "Ngày Tạo": toDateTime(item.creatDate)
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ThanhHinhData");

      // Set độ rộng cột cơ bản
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
        { wch: 40 }, { wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 20 },
        { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
      ];

      XLSX.writeFile(workbook, `ThanhHinh_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success("Xuất Excel thành công");
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xuất Excel");
    } finally {
      setLoading(false);
    }
  };

  /* Columns */
  const columns = useMemo(() => [
    {
      id: "stt", header: "STT", size: 46,
      cell: ({ row }) => (
        <span style={{ color: '#6890b0', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
          {pageIndex * pageSize + row.index + 1}
        </span>
      ),
    },
    {
      header: "Mã máy", accessorKey: "maMay", size: 72,
      cell: ({ getValue }) => <span className="mes-badge mes-badge-teal">{toDisplay(getValue())}</span>,
    },
    {
      header: "Tên máy", accessorKey: "tenMay", size: 130,
      cell: ({ getValue }) => <span style={{ fontSize: 11, color: '#4a6a8a' }}>{toDisplay(getValue())}</span>,
    },
    {
      header: "ID kế hoạch", accessorKey: "idKehoach", size: 118,
      cell: ({ getValue }) => <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#4a6a8a' }}>{toDisplay(getValue())}</span>,
    },
    {
      header: "Mã quy cách", accessorKey: "maQuyCachLop", size: 106,
      cell: ({ getValue }) => <span style={{ fontSize: 11, color: '#4a6a8a' }}>{toDisplay(getValue())}</span>,
    },
    {
      header: "Tên quy cách", accessorKey: "tenQuyCachLop", size: 178,
      cell: ({ getValue }) => <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{toDisplay(getValue())}</span>,
    },
    {
      id: "ngaySx", header: "Ngày SX", accessorFn: toNgaySx, size: 90,
      cell: ({ getValue }) => <span style={{ fontSize: 11, color: '#4a6a8a', fontVariantNumeric: 'tabular-nums' }}>{getValue()}</span>,
    },
    {
      header: "Ca", accessorKey: "caSx", size: 48,
      cell: ({ getValue }) => <CaBadge value={getValue()} />,
    },
    {
      header: "Barcode TH", accessorKey: "barcodeTh", size: 136,
      cell: ({ getValue }) => <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#4a6a8a' }}>{toDisplay(getValue())}</span>,
    },
    {
      header: "Bắt đầu", accessorKey: "timerStart", size: 126,
      cell: ({ getValue }) => <span style={{ fontSize: 11, color: '#4a6a8a', fontVariantNumeric: 'tabular-nums' }}>{toDateTime(getValue())}</span>,
    },
    {
      header: "Ghi chú", accessorKey: "note", size: 118,
      cell: ({ getValue }) => {
        const v = getValue();
        return v
          ? <span style={{ fontSize: 11, color: '#5a7a9a', fontStyle: 'italic' }}>{v}</span>
          : <span style={{ color: '#96afc8', fontSize: 11 }}>—</span>;
      },
    },
    {
      header: "Ngày tạo", accessorKey: "creatDate", size: 126,
      cell: ({ getValue }) => <span style={{ fontSize: 11, color: '#6890b0', fontVariantNumeric: 'tabular-nums' }}>{toDateTime(getValue())}</span>,
    },
  ], [pageIndex, pageSize]);

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
  });

  const remainingFields = useMemo(() => {
    if (!selectedDetail) return [];
    const skip = new Set(Object.keys(KEY_MAP));
    return Object.entries(selectedDetail)
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v]);
  }, [selectedDetail]);

  const pageList = useMemo(() => buildPageList(pageIndex, pageCount), [pageIndex, pageCount]);
  const rangeStart = total === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd   = Math.min((pageIndex + 1) * pageSize, total);

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
          label="Đặt lại" className="red"
          onClick={handleResetFilters}
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

      {loading && (
        <div style={{ height: 3, background: '#b8cce0', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: '40%', background: '#1565C0', animation: 'progress 1.2s infinite ease-in-out' }} />
        </div>
      )}

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
          <span className="mes-fb-label">Mã máy:</span>
          <select
            className="mes-select" style={{ width: 160 }}
            value={filters.machine_number}
            onChange={(e) => setFilters((p) => ({ ...p, machine_number: e.target.value }))}
          >
            <option value="">Tất cả máy</option>
            {normalizedMachines.map((m) => (
              <option key={m.maMay} value={m.maMay}>
                {m.tenMay ? `${m.maMay} – ${m.tenMay}` : `Máy ${m.maMay}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">ID KH:</span>
          <input
            type="text" className="mes-input" style={{ width: 130, fontWeight: 'bold', color: '#1565C0' }}
            value={filters.id_kehoach}
            disabled
            placeholder="Tự động sinh..."
          />
        </div>

        <div style={{ width: 1, height: 24, background: '#96afc8', flexShrink: 0 }} />

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ngày sản xuất:</span>
          <input
            type="date" className="mes-input" style={{ width: 130 }}
            value={filters.date_sx}
            onChange={(e) => setFilters((p) => ({ ...p, date_sx: e.target.value }))}
          />
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ca:</span>
          <select
            className="mes-select" style={{ width: 80 }}
            value={filters.ca_sx}
            onChange={(e) => setFilters((p) => ({ ...p, ca_sx: e.target.value ? Number(e.target.value) : "" }))}
          >
            <option value="">Tất cả ca</option>
            <option value={1}>Ca 1</option>
            <option value={2}>Ca 2</option>
            <option value={3}>Ca 3</option>
          </select>
        </div>

        <button className="mes-search-btn" onClick={handleSearch} disabled={loading}>
          Tìm kiếm
        </button>

        <button className="mes-reset-btn" onClick={handleResetFilters}>
          Đặt lại
        </button>
      </div>

      {total > 0 && !loading && (
        <div className="mes-kpi-row mes-fade">
          <div className="mes-kpi-card" style={{ borderLeftColor: '#1565C0' }}>
            <span className="mes-kpi-lbl">Tổng bản ghi</span>
            <span className="mes-kpi-val" style={{ color: '#1565C0' }}>{total.toLocaleString('vi-VN')}</span>
          </div>
          <div className="mes-kpi-card" style={{ borderLeftColor: '#166534' }}>
            <span className="mes-kpi-lbl">Trang hiện tại</span>
            <span className="mes-kpi-val" style={{ color: '#166534' }}>{pageIndex + 1}/{pageCount}</span>
          </div>
          <div className="mes-kpi-card" style={{ borderLeftColor: '#c2410c' }}>
            <span className="mes-kpi-lbl">Hiển thị</span>
            <span className="mes-kpi-val" style={{ color: '#c2410c' }}>{rangeStart}–{rangeEnd}</span>
          </div>
        </div>
      )}

      <div className="mes-table-area">
        <div className="mes-table-wrap mes-fade">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, color: '#6890b0' }}>
              <div className="mes-spinner-lg" />
              <span style={{ fontSize: 12 }}>Đang tải dữ liệu...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="mes-empty">
              <div style={{ fontSize: 36 }}>📋</div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Không tìm thấy dữ liệu</p>
            </div>
          ) : (
            <table className="mes-table">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th key={h.id} style={{ width: h.column.columnDef.size }}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedDetail(row.original)}>
                    {row.getVisibleCells().map((cell) => (
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

      <div className="mes-pagination">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>
            {total === 0
              ? 'Không có dữ liệu'
              : `${rangeStart.toLocaleString('vi-VN')} – ${rangeEnd.toLocaleString('vi-VN')} / ${total.toLocaleString('vi-VN')} bản ghi`}
          </span>
          <select className="mes-page-size" value={pageSize} onChange={handlePageSizeChange}>
            {[10, 20, 30, 50, 100].map((s) => (
              <option key={s} value={s}>{s} dòng/trang</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <button className="mes-page-btn" onClick={() => goPage(pageIndex - 1)} disabled={pageIndex === 0 || loading}>‹ Trước</button>
          {pageList.map((p, idx) =>
            p === "ellipsis" ? (
              <span key={`el-${idx}`} style={{ padding: '0 4px', color: '#6890b0', fontSize: 11 }}>…</span>
            ) : (
              <button
                key={p}
                className={`mes-page-btn${p === pageIndex ? ' active' : ''}`}
                onClick={() => goPage(p)}
                disabled={loading}
              >
                {p + 1}
              </button>
            )
          )}
          <button className="mes-page-btn" onClick={() => goPage(pageIndex + 1)} disabled={pageIndex >= pageCount - 1 || loading}>Sau ›</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 6 }}>
            <span>Đến trang</span>
            <input
              type="number" min={1} max={pageCount}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onBlur={handleJump}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleJump(); } }}
              className="mes-jump-input"
            />
            <span>/ {pageCount}</span>
          </div>
        </div>
      </div>

      <div className="mes-statusbar">
        <span>{loading ? 'Đang tải dữ liệu...' : total > 0 ? `${total.toLocaleString('vi-VN')} bản ghi · ${dateStr}` : 'Sẵn sàng'}</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · XN RADIAL · XƯỞNG CVTH</span>
      </div>

      {selectedDetail && (
        <div className="mes-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedDetail(null); }}>
          <div className="mes-modal">
            <div className="mes-modal-header">
              <div>
                <div className="mes-modal-title">Chi tiết dữ liệu thành hình</div>
                <div className="mes-modal-sub">
                  Barcode TH: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{toDisplay(selectedDetail.barcodeTh)}</span>
                </div>
              </div>
              <button className="mes-modal-close" onClick={() => setSelectedDetail(null)}>×</button>
            </div>
            <div className="mes-modal-body">
              <div className="mes-detail-grid">
                <DCard title="Thông tin cơ bản">
                  <DRow label="ID kế hoạch"      value={selectedDetail.idKehoach} />
                  <DRow label="Mã quy cách lớp"  value={selectedDetail.maQuyCachLop} />
                  <DRow label="Tên quy cách lớp" value={selectedDetail.tenQuyCachLop} />
                  <DRow label="Mã máy"           value={selectedDetail.maMay} />
                  <DRow label="Tên máy"          value={selectedDetail.tenMay} />
                  <DRow label="Ngày sản xuất"    value={toNgaySx(selectedDetail)} />
                  <DRow label="Ca sản xuất"      value={selectedDetail.caSx} />
                </DCard>
                <DCard title="Sản xuất">
                  <DRow label="Barcode TH"         value={selectedDetail.barcodeTh} />
                  <DRow label="Barcode LH"         value={selectedDetail.barcodeLh} />
                  <DRow label="Số lượng SX"        value={selectedDetail.soLuongSx} />
                  <DRow label="Thời gian bắt đầu"  value={toDateTime(selectedDetail.timerStart)} />
                  <DRow label="Thời gian kết thúc" value={toDateTime(selectedDetail.timerEnd)} />
                  <DRow label="Ghi chú"            value={selectedDetail.note} />
                </DCard>
                <DCard title="Hệ thống">
                  <DRow label="Ngày tạo"  value={toDateTime(selectedDetail.creatDate)} />
                  <DRow label="Ngày sửa"  value={toDateTime(selectedDetail.dateModified)} />
                  <DRow label="Người tạo" value={selectedDetail.userNameCreat || selectedDetail.userIdCreat} />
                </DCard>
              </div>
            </div>
            <div className="mes-modal-footer">
              <button className="mes-search-btn" onClick={() => setSelectedDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThanhHinhTable;