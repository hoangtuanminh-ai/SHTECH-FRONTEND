// src/pages/BaoCaoNhapKhoKhongTheoMay.jsx
import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Thêm thư viện xuất Excel
import { timesNewRomanBase64 } from '../../font/TimesNewRoman-Regular-base64';
import { getBaoCaoNhapKhoKhongTheoMay } from '../../api/baoCaoNhapKhoApi';
import { getEquipmentNames } from '../../api/baoCaoNhapKhoApi';
import { getStoreListOrth } from '../../api/thanhhinhApi';

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
    display: flex; align-items: center; gap: 10px;
    flex-wrap: wrap; flex-shrink: 0;
  }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-fb-label { font-size: 12px; font-weight: 700; color: #1a3a5c; white-space: nowrap; }
  .mes-fb-sublabel { font-size: 11px; color: #5a7a9a; white-space: nowrap; }

  .mes-select-wrap { min-width: 110px; }
  .mes-select-wrap-sm { min-width: 75px; }

  .mes-id-box {
    display: flex; align-items: center; gap: 6px;
    background: #fff; border: 1px solid #6890b0;
    border-radius: 2px; padding: 0 8px; height: 24px;
  }
  .mes-id-label { font-size: 11px; color: #5a7a9a; }
  .mes-id-value { font-size: 12px; font-weight: 800; color: #1a3a5c; letter-spacing: 0.5px; font-family: monospace; }

  .mes-input {
    border: 1px solid #6890b0; background: #ffffff;
    padding: 2px 6px; font-size: 12px; font-weight: 600;
    color: #1a3a5c; border-radius: 2px; outline: none; height: 24px;
    font-family: 'Segoe UI', sans-serif;
  }
  .mes-input:focus { border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15); }

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

  .mes-kpi-row {
    background: #eaf0f8; border-bottom: 1px solid #b8cce0;
    padding: 6px 10px; display: flex; gap: 8px; flex-wrap: wrap; flex-shrink: 0;
  }
  .mes-kpi-card {
    background: #fff; border: 1px solid #b8cce0;
    border-radius: 3px; border-left-width: 3px;
    padding: 5px 14px; min-width: 130px;
  }
  .mes-kpi-lbl { font-size: 10px; font-weight: 700; color: #6890b0; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 2px; }
  .mes-kpi-val { font-size: 17px; font-weight: 900; font-variant-numeric: tabular-nums; display: block; line-height: 1.1; }

  .mes-table-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .mes-table-header {
    padding: 5px 10px; display: flex; justify-content: space-between; align-items: center;
    background: #f0f6fc; border-bottom: 1px solid #b8cce0;
    font-size: 11px; color: #5a7a9a; flex-shrink: 0;
  }
  .mes-table-wrap { flex: 1; overflow: auto; background: #fff; }
  .mes-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .mes-table thead tr { background: #ccdeed; position: sticky; top: 0; z-index: 1; }
  .mes-table thead th {
    padding: 6px 8px; text-align: left;
    font-size: 11px; font-weight: 700; color: #1a3a5c;
    border-right: 1px solid #96afc8; border-bottom: 2px solid #6890b0;
    white-space: nowrap; letter-spacing: 0.2px;
  }
  .mes-table thead th:last-child { border-right: none; }
  .mes-table thead th.r { text-align: right; }
  .mes-table thead th.c { text-align: center; }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table tbody td {
    padding: 4px 8px; border-right: 1px solid #d8e8f4;
    border-bottom: 1px solid #d8e8f4; color: #1a3a5c;
  }
  .mes-table tbody td:last-child { border-right: none; }
  .mes-table td.r { text-align: right; font-variant-numeric: tabular-nums; }
  .mes-table td.c { text-align: center; }

  .mes-badge { display: inline-block; padding: 1px 7px; border-radius: 2px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .mes-badge-blue   { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
  .mes-badge-gray   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
  .mes-badge-amber  { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }

  .mes-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; margin: 10px;
    border: 2px dashed #96afc8; border-radius: 3px;
    background: #f8fbfe; min-height: 200px; color: #6890b0;
  }
  .mes-empty .icon { font-size: 36px; }
  .mes-empty p { font-size: 13px; font-weight: 600; }

  .mes-statusbar {
    background: #c0d4e8; border-top: 1px solid #96afc8;
    padding: 2px 10px; font-size: 11px; color: #1a3a5c;
    display: flex; justify-content: space-between; flex-shrink: 0;
  }

  .mes-spinner {
    width: 11px; height: 11px;
    border: 2px solid #90b8d8; border-top-color: #1565C0;
    border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
  }
`;

/* ─── react-select styles (compact, MES tông xanh) ────────────────────────── */
const mesSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: '#fff',
    borderColor: state.isFocused ? '#1565C0' : '#6890b0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(21,101,192,0.15)' : 'none',
    borderRadius: 2,
    fontSize: 12,
    fontWeight: 600,
    color: '#1a3a5c',
    minHeight: 24,
    height: 24,
    '&:hover': { borderColor: '#1565C0' },
  }),
  valueContainer: (base) => ({ ...base, padding: '0 6px', height: 24 }),
  indicatorsContainer: (base) => ({ ...base, height: 24 }),
  dropdownIndicator: (base) => ({ ...base, padding: '0 4px', color: '#5a7a9a' }),
  clearIndicator: (base) => ({ ...base, padding: '0 4px', color: '#5a7a9a' }),
  indicatorSeparator: (base) => ({ ...base, background: '#b8cce0', margin: '4px 0' }),
  menu: (base) => ({
    ...base, background: '#fff', border: '1px solid #96afc8',
    borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 99999,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
  menuList: (base) => ({ ...base, padding: 2 }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? '#d4eaf8' : state.isFocused ? '#eef5fc' : 'transparent',
    color: state.isSelected ? '#1565C0' : '#1a3a5c',
    fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 2, cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: '#1a3a5c', fontSize: 12, fontWeight: 600 }),
  placeholder: (base) => ({ ...base, color: '#8aabca', fontSize: 11 }),
  input: (base) => ({ ...base, color: '#1a3a5c', fontSize: 12, margin: 0, padding: 0 }),
  loadingMessage: (base) => ({ ...base, color: '#5a7a9a', fontSize: 12 }),
  noOptionsMessage: (base) => ({ ...base, color: '#5a7a9a', fontSize: 12 }),
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

/* ─── KPI Card ────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, color }) => (
  <div className="mes-kpi-card" style={{ borderLeftColor: color }}>
    <span className="mes-kpi-lbl">{label}</span>
    <span className="mes-kpi-val" style={{ color }}>{value}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const BaoCaoNhapKhoKhongTheoMay = () => {
  const [form, setForm] = useState({ idKehoach: '', namThangNgayCaStart: '', namThangNgayCaEnd: '', storeId: '', maMay: '' });
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [stores, setStores]   = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [maMayOptions, setMaMayOptions]   = useState([{ value: '', label: '— Tất cả máy' }]);
  const [maMayLoading, setMaMayLoading]   = useState(true);

  const [tuNgay, setTuNgay]   = useState('');
  const [tuCa, setTuCa]       = useState('0');
  const [denNgay, setDenNgay] = useState('');
  const [denCa, setDenCa]     = useState('0');

  const now         = new Date();
  const currentYear = now.getFullYear();
  const timeStr     = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr     = now.toLocaleDateString('vi-VN');

  /* ── Load kho ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setStoresLoading(true);
        const res = await getStoreListOrth();
        const options = res.map(item => ({ value: item.storeId, label: `${item.storeId} - ${item.storeName || 'Không có tên'}` }));
        setStores([{ value: '', label: '— Tất cả kho' }, ...options]);
      } catch {
        toast.error('Không tải được danh sách kho');
        setStores([{ value: '', label: '— Tất cả kho' }]);
      } finally {
        setStoresLoading(false);
      }
    };
    fetchStores();
  }, []);

  /* ── Load máy ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setMaMayLoading(true);
        const res = await getEquipmentNames();
        const options = res.map(item => ({ value: item.spare_5 || item.id, label: item.name }));
        setMaMayOptions([{ value: '', label: '— Tất cả máy' }, ...options]);
      } catch {
        toast.error('Không tải được danh sách máy');
        const fallback = Array.from({ length: 17 }, (_, i) => ({ value: (i+1).toString(), label: `Máy thành hình ${i+1}` }));
        setMaMayOptions([{ value: '', label: '— Tất cả máy' }, ...fallback]);
      } finally {
        setMaMayLoading(false);
      }
    };
    fetchMachines();
  }, []);

  /* ── Date options ───────────────────────────────────────── */
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      namThangNgayCaStart: tuNgay ? tuNgay.replace(/-/g, '') + tuCa : '',
    }));
  }, [tuNgay, tuCa]);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      namThangNgayCaEnd: denNgay ? denNgay.replace(/-/g, '') + denCa : '',
    }));
  }, [denNgay, denCa]);

  /* ── Search ───────────────────────────────────────────────────────────── */
  const handleSearch = async () => {
    if (!form.namThangNgayCaStart || !form.namThangNgayCaEnd) {
      toast.error('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc');
      return;
    }
    setLoading(true);
    try {
      const res = await getBaoCaoNhapKhoKhongTheoMay(form);
      if (res.success) {
        setData(res.data || []);
        toast.success(`Tìm thấy ${res.totalElements || res.data?.length || 0} bản ghi`);
      } else {
        setData([]);
        toast.error(res.message || 'Không tìm thấy dữ liệu');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi kết nối server');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Export Excel ─────────────────────────────────────────────────────── */
  const exportToExcel = () => {
    if (data.length === 0) {
      toast.warn('Không có dữ liệu để xuất Excel');
      return;
    }

    // Map dữ liệu thô sang định dạng tiêu đề tiếng Việt
    const excelData = data.map((row, i) => ({
      'STT': row[0] || i + 1,
      'Mã Quy Cách Lớp': row[1] || '—',
      'Tên Quy Cách Lớp': row[2] || '—',
      'Số Lượng Sản Xuất': row[3] || 0,
      'Đơn Vị': row[4] || 'Chiếc',
      'Ghi Chú': row[5] || '—'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCao");

    // Căn chỉnh chiều rộng cột
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 40 }, { wch: 15 }, { wch: 10 }, { wch: 25 }
    ];

    const fileName = `BaoCao_NhapKho_KhongTheoMay_${now.toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Đã xuất file Excel thành công');
  };

  /* ── Export PDF ───────────────────────────────────────────────────────── */
  const exportToPDF = () => {
    if (data.length === 0) { toast.warn('Không có dữ liệu để xuất PDF'); return; }
    const doc = new jsPDF('portrait', 'pt', 'a4');
    doc.addFileToVFS('TimesNewRoman-Regular.ttf', timesNewRomanBase64);
    doc.addFont('TimesNewRoman-Regular.ttf', 'TimesNewRoman', 'normal');
    
    doc.setFont('TimesNewRoman', 'normal');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(9); 
    doc.text('CÔNG TY CP CAO SU ĐÀ NẴNG', 30, 40);
    doc.text('XN RADIAL - BP. CVTH', 30, 55);
    
    doc.setFontSize(12);
    // Use normal style because bold is not loaded and causes font error
    doc.setFont('TimesNewRoman', 'normal');
    doc.text('TỔNG HỢP LỐP THÀNH HÌNH SẢN XUẤT', pageWidth / 2 + 30, 40, { align: 'center' });
    
    doc.setFont('TimesNewRoman', 'normal');
    doc.setFontSize(10);

    let timeText = '';
    if (tuNgay && denNgay && tuNgay === denNgay) {
      timeText = `Ca ${tuCa === '0' ? 'Tất cả' : tuCa}, Ngày ${tuNgay.split('-')[2]} tháng ${tuNgay.split('-')[1]} năm ${tuNgay.split('-')[0]}`;
    } else {
      const tuText = tuNgay ? `Từ Ca ${tuCa === '0' ? 'Tất cả' : tuCa}, Ngày ${tuNgay.split('-')[2]}/${tuNgay.split('-')[1]}/${tuNgay.split('-')[0]}` : '';
      const denText = denNgay ? `Đến Ca ${denCa === '0' ? 'Tất cả' : denCa}, Ngày ${denNgay.split('-')[2]}/${denNgay.split('-')[1]}/${denNgay.split('-')[0]}` : '';
      timeText = [tuText, denText].filter(Boolean).join(' - ');
      if (!timeText) {
        timeText = `Ca ${tuCa === '0' ? 'Tất cả' : tuCa}, Ngày ${dateStr.split('/')[0]} tháng ${dateStr.split('/')[1]} năm ${dateStr.split('/')[2]}`;
      }
    }

    doc.text(timeText, pageWidth / 2 + 30, 55, { align: 'center' });

    const tableBody = data.map((row, i) => [
      row[0] || i + 1,
      row[2] || '—',   // Quy Cách
      row[1] || '—',   // Ký hiệu mã QC
      row[4] || 'Chiếc', // ĐVT
      (row[3] || 0).toLocaleString('vi-VN'), // Số Lượng
      row[5] || '',   // Ghi Chú
    ]);

    // Footer row
    const totalSL = data.reduce((s, row) => s + (Number(row[3]) || 0), 0);
    tableBody.push([
      { content: 'TỔNG CỘNG', colSpan: 4, styles: { halign: 'center', fontStyle: 'normal' } },
      { content: totalSL.toLocaleString('vi-VN'), styles: { halign: 'right', fontStyle: 'normal' } },
      ''
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['STT', 'Quy Cách', 'Ký hiệu\nmã QC', 'ĐVT', 'Số Lượng', 'GHI CHÚ']],
      body: tableBody,
      theme: 'grid',
      styles: { font: 'TimesNewRoman', fontSize: 10, textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.5 },
      headStyles: { font: 'TimesNewRoman', fontStyle: 'normal', fillColor: [255,255,255], textColor: [0,0,0], halign: 'center', valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center' }, 
        1: { cellWidth: 'auto' }, 
        2: { cellWidth: 70, halign: 'center' },
        3: { cellWidth: 50, halign: 'center' },
        4: { cellWidth: 60, halign: 'right' }, 
        5: { cellWidth: 70 },
      },
      margin: { left: 30, right: 30 },
      didParseCell: d => { d.cell.styles.font = 'TimesNewRoman'; },
    });

    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(11);
    doc.setFont('TimesNewRoman', 'normal');
    
    // Left dotted line
    doc.text('....................', 80, finalY);
    // Center dotted line
    doc.text('....................', pageWidth / 2 - 40, finalY);
    // Right text
    doc.text('NGƯỜI LẬP', pageWidth - 80, finalY, { align: 'center' });

    doc.save(`BaoCao_NhapKho_KhongTheoMay_${now.toISOString().slice(0,10)}.pdf`);
  };

  const clearAll = () => {
    setData([]);
    setTuNgay(''); setTuCa('0');
    setDenNgay(''); setDenCa('0');
    setForm({ idKehoach: '', namThangNgayCaStart: '', namThangNgayCaEnd: '', storeId: '', maMay: '' });
  };

  const totalSL = data.reduce((s, row) => s + (Number(row[3]) || 0), 0);

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#e0eaf4', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{css}</style>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
      <div className="mes-toolbar">
        <TbBtn
          label="Làm tươi" className="green"
          onClick={handleSearch} disabled={loading || storesLoading || maMayLoading}
          icon={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}
        />
        <TbBtn
          label="Đóng" className="red"
          onClick={clearAll}
          icon={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
        />

        <div className="mes-tb-sep" />

        <TbBtn
          label="Xuất Excel"
          onClick={exportToExcel}
          icon={<><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></>}
        />
        <TbBtn
          label="In"
          onClick={exportToPDF}
          icon={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>}
        />

        <div className="mes-tb-sep" />

        <TbBtn
          label="Thiết lập"
          onClick={() => toast.info('Thiết lập')}
          icon={<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>}
        />
      </div>

      {/* Loading bar */}
      {loading && (
        <div style={{ height: 3, background: '#b8cce0', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: '40%', background: '#1565C0', animation: 'progress 1.2s infinite ease-in-out' }} />
        </div>
      )}

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="mes-filterbar">

        {/* Thời gian bắt đầu */}
        <div className="mes-fb-group" style={{ gap: 4 }}>
          <span className="mes-fb-label">Từ ngày:</span>
          <input
            type="date"
            className="mes-input"
            style={{ width: 120 }}
            value={tuNgay}
            onChange={e => setTuNgay(e.target.value)}
          />
          <span className="mes-fb-label" style={{ marginLeft: 6 }}>Ca:</span>
          <select className="mes-select" style={{ width: 66 }} value={tuCa} onChange={e => setTuCa(e.target.value)}>
            <option value="0">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        {/* Mã start */}
        {form.namThangNgayCaStart && (
          <div className="mes-id-box">
            <span className="mes-id-label">Mã:</span>
            <span className="mes-id-value">{form.namThangNgayCaStart}</span>
          </div>
        )}

        <div style={{ width: 1, height: 24, background: '#96afc8', flexShrink: 0 }} />

        {/* Thời gian kết thúc */}
        <div className="mes-fb-group" style={{ gap: 4 }}>
          <span className="mes-fb-label">Đến ngày:</span>
          <input
            type="date"
            className="mes-input"
            style={{ width: 120 }}
            value={denNgay}
            onChange={e => setDenNgay(e.target.value)}
          />
          <span className="mes-fb-label" style={{ marginLeft: 6 }}>Ca:</span>
          <select className="mes-select" style={{ width: 66 }} value={denCa} onChange={e => setDenCa(e.target.value)}>
            <option value="0">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        {/* Mã end */}
        {form.namThangNgayCaEnd && (
          <div className="mes-id-box">
            <span className="mes-id-label">Mã:</span>
            <span className="mes-id-value">{form.namThangNgayCaEnd}</span>
          </div>
        )}

        <div style={{ width: 1, height: 24, background: '#96afc8', flexShrink: 0 }} />

        {/* Kho */}
        <div className="mes-fb-group">
          <span className="mes-fb-label">Kho:</span>
          <div style={{ minWidth: 150 }}>
            <Select
              placeholder={storesLoading ? 'Đang tải...' : 'Tất cả kho'}
              options={stores}
              value={stores.find(o => o.value === form.storeId) || null}
              onChange={opt => setForm(prev => ({ ...prev, storeId: opt?.value || '' }))}
              isClearable isLoading={storesLoading} isDisabled={storesLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>

        {/* Mã máy */}
        <div className="mes-fb-group">
          <span className="mes-fb-label">Máy:</span>
          <div style={{ minWidth: 160 }}>
            <Select
              placeholder={maMayLoading ? 'Đang tải...' : 'Tất cả máy'}
              options={maMayOptions}
              value={maMayOptions.find(o => o.value === form.maMay) || null}
              onChange={opt => setForm(prev => ({ ...prev, maMay: opt?.value || '' }))}
              isClearable isLoading={maMayLoading} isDisabled={maMayLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>

        {/* ID thủ công */}
        <div className="mes-fb-group">
          <span className="mes-fb-label">ID KH:</span>
          <input
            type="text" className="mes-input" style={{ width: 130 }}
            value={form.idKehoach}
            onChange={e => setForm(prev => ({ ...prev, idKehoach: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Để trống = tất cả"
          />
        </div>

        {/* Tìm kiếm */}
        <button
          className="mes-search-btn"
          onClick={handleSearch}
          disabled={loading || storesLoading || maMayLoading}
        >
          {loading ? (
            <><span className="mes-spinner" /> Đang tải...</>
          ) : (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
              Tìm Kiếm
            </>
          )}
        </button>
      </div>

      {/* ── KPI ROW ─────────────────────────────────────────────────────── */}
      {data.length > 0 && (
        <div className="mes-kpi-row mes-fade">
          <KpiCard label="Tổng SL Nhập" value={totalSL.toLocaleString('vi-VN')} color="#c2410c" />
          <KpiCard label="Bản Ghi"      value={data.length.toString()}           color="#1565C0" />
        </div>
      )}

      {/* ── TABLE AREA ──────────────────────────────────────────────────── */}
      <div className="mes-table-area">
        {data.length > 0 ? (
          <>
            <div className="mes-table-header">
              <span>Hiển thị <strong style={{ color: '#1565C0' }}>{data.length}</strong> bản ghi · Tổng SL: <strong style={{ color: '#1a3a5c' }}>{totalSL.toLocaleString('vi-VN')}</strong></span>
              <span>Cập nhật: {timeStr}</span>
            </div>
            <div className="mes-table-wrap mes-fade">
              <table className="mes-table">
                <thead>
                  <tr>
                    <th className="c" style={{ width: 40 }}>#</th>
                    <th style={{ width: 140 }}>Mã Quy Cách Lớp</th>
                    <th>Tên Quy Cách Lớp</th>
                    <th className="r" style={{ width: 110 }}>Số Lượng SX</th>
                    <th className="c" style={{ width: 100 }}>Đơn Vị</th>
                    <th style={{ width: 180 }}>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      <td className="c" style={{ color: '#6890b0', fontSize: 11 }}>{row[0] || idx + 1}</td>
                      <td>
                        <span className="mes-badge mes-badge-amber">{row[1] || '—'}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{row[2] || '—'}</td>
                      <td className="r" style={{ fontWeight: 800, color: '#1565C0', fontSize: 13 }}>
                        {(row[3] || 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="c">
                        <span className="mes-badge mes-badge-blue">{row[4] || 'Chiếc'}</span>
                      </td>
                      <td style={{ color: '#4a6a8a', fontSize: 11 }}>
                        {row[5] || <span style={{ color: '#8aabca' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          !loading && (
            <div className="mes-empty mes-fade">
              <div className="icon">📦</div>
              <p>Chưa có dữ liệu — chọn thời gian và nhấn Tìm Kiếm</p>
            </div>
          )
        )}
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="mes-statusbar">
        <span>
          {loading
            ? 'Đang tải dữ liệu...'
            : data.length > 0
              ? `${data.length} bản ghi · ${dateStr}`
              : 'Sẵn sàng'}
        </span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · XN RADIAL · XƯỞNG CVTH</span>
      </div>
    </div>
  );
};

export default BaoCaoNhapKhoKhongTheoMay;