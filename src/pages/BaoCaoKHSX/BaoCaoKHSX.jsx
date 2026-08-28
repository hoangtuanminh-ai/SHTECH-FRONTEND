// src/pages/BaoCaoKHSX.jsx
import React, { useState, useEffect } from 'react';
import { getBaoCaoKHSX, getStoreListOrth } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Thêm thư viện xuất Excel
import { timesNewRomanBase64 } from '../../font/TimesNewRoman-Regular-base64';

/* ─── MES Desktop Style ───────────────────────────────────────────────────── */
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
    display: flex;
    align-items: center;
    gap: 1px;
    flex-shrink: 0;
    user-select: none;
  }
  .mes-tb-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 4px 10px;
    min-width: 58px;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    color: #1e3a5c;
    transition: background 0.1s, border-color 0.1s;
  }
  .mes-tb-btn:hover { background: #c0d4e8; border-color: #80a8c8; }
  .mes-tb-btn:active { background: #a0bcd4; }
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
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-fb-label { font-size: 12px; font-weight: 700; color: #1a3a5c; white-space: nowrap; }
  .mes-select, .mes-input {
    border: 1px solid #6890b0;
    background: #ffffff;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: 600;
    color: #1a3a5c;
    border-radius: 2px;
    outline: none;
    height: 24px;
    font-family: 'Segoe UI', sans-serif;
  }
  .mes-select:focus, .mes-input:focus { border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15); }
  .mes-id-box {
    display: flex; align-items: center; gap: 6px;
    background: #fff; border: 1px solid #6890b0;
    border-radius: 2px; padding: 0 8px; height: 24px;
  }
  .mes-id-label { font-size: 11px; color: #5a7a9a; }
  .mes-id-value { font-size: 12px; font-weight: 800; color: #1a3a5c; letter-spacing: 0.5px; }

  .mes-search-btn {
    display: flex; align-items: center; gap: 5px;
    background: linear-gradient(180deg, #f0f8ff 0%, #d0e8fc 100%);
    border: 1px solid #6890b0; border-radius: 2px;
    padding: 0 14px; height: 24px;
    font-size: 12px; font-weight: 700; color: #1a3a5c;
    cursor: pointer; white-space: nowrap;
    transition: background 0.1s;
  }
  .mes-search-btn:hover { background: linear-gradient(180deg, #d8f0ff 0%, #b8d8f8 100%); }
  .mes-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .mes-kpi-row {
    background: #eaf0f8;
    border-bottom: 1px solid #b8cce0;
    padding: 6px 10px;
    display: flex; gap: 8px; flex-wrap: wrap;
    flex-shrink: 0;
  }
  .mes-kpi-card {
    background: #fff;
    border: 1px solid #b8cce0;
    border-radius: 3px;
    border-left-width: 3px;
    padding: 5px 14px;
    min-width: 110px;
  }
  .mes-kpi-lbl { font-size: 10px; font-weight: 700; color: #6890b0; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 2px; }
  .mes-kpi-val { font-size: 17px; font-weight: 900; font-variant-numeric: tabular-nums; display: block; line-height: 1.1; }

  .mes-table-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .mes-table-header {
    padding: 5px 10px;
    display: flex; justify-content: space-between; align-items: center;
    background: #f0f6fc; border-bottom: 1px solid #b8cce0;
    font-size: 11px; color: #5a7a9a;
    flex-shrink: 0;
  }
  .mes-table-wrap {
    flex: 1; overflow: auto;
    margin: 0; background: #fff;
  }
  .mes-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .mes-table thead tr { background: #ccdeed; position: sticky; top: 0; z-index: 1; }
  .mes-table thead th {
    padding: 6px 8px;
    text-align: left;
    font-size: 11px; font-weight: 700; color: #1a3a5c;
    border-right: 1px solid #96afc8;
    border-bottom: 2px solid #6890b0;
    white-space: nowrap;
    letter-spacing: 0.2px;
  }
  .mes-table thead th:last-child { border-right: none; }
  .mes-table thead th.r { text-align: right; }
  .mes-table thead th.c { text-align: center; }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table tbody td {
    padding: 4px 8px;
    border-right: 1px solid #d8e8f4;
    border-bottom: 1px solid #d8e8f4;
    color: #1a3a5c;
  }
  .mes-table tbody td:last-child { border-right: none; }
  .mes-table td.r { text-align: right; font-variant-numeric: tabular-nums; }
  .mes-table td.c { text-align: center; }

  .mes-badge {
    display: inline-block; padding: 1px 7px;
    border-radius: 2px; font-size: 11px; font-weight: 700;
    white-space: nowrap;
  }
  .mes-badge-blue   { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
  .mes-badge-gray   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
  .mes-badge-gold   { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .mes-badge-red    { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

  .mes-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
    margin: 10px; border: 2px dashed #96afc8;
    border-radius: 3px; background: #f8fbfe; min-height: 200px;
    color: #6890b0;
  }
  .mes-empty .icon { font-size: 36px; }
  .mes-empty p { font-size: 13px; font-weight: 600; }

  .mes-statusbar {
    background: #c0d4e8;
    border-top: 1px solid #96afc8;
    padding: 2px 10px;
    font-size: 11px; color: #1a3a5c;
    display: flex; justify-content: space-between;
    flex-shrink: 0;
  }

  .mes-spinner {
    width: 11px; height: 11px;
    border: 2px solid #90b8d8; border-top-color: #1565C0;
    border-radius: 50%; animation: spin 0.6s linear infinite;
    display: inline-block;
  }
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

/* ─── KPI Card ────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, color }) => (
  <div className="mes-kpi-card" style={{ borderLeftColor: color }}>
    <span className="mes-kpi-lbl">{label}</span>
    <span className="mes-kpi-val" style={{ color }}>{value}</span>
  </div>
);

/* ─── Main ────────────────────────────────────────────────────────────────── */
const BaoCaoKHSX = () => {
  const [idKehoach, setIdKehoach] = useState('');
  const [storeId,   setStoreId]   = useState('RA10');
  const [ngaySX,    setNgaySX]    = useState('');
  const [ca_sx,     setCa_sx]     = useState('');
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [storeList, setStoreList] = useState([]);

  const now     = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN');

  useEffect(() => {
    getStoreListOrth()
      .then(res => {
        setStoreList(res);
        if (res.length > 0 && !storeId) setStoreId(res[0].storeId);
      })
      .catch(() => toast.error('Lỗi tải danh sách kho'));
  }, []);

  const getGeneratedIdKehoach = () => {
    if (idKehoach.trim()) return idKehoach.trim();
    if (!storeId || !ngaySX) return '%';
    const parts = ngaySX.split('-');
    if (parts.length !== 3) return '%';
    const [y, m, d] = parts;
    let id = `${storeId}.${y}${m}${d}`;
    if (ca_sx) id += ca_sx;
    return id;
  };

  const handleSearch = async () => {
    const searchId = getGeneratedIdKehoach();
    if (searchId === '%') { toast.warn('Vui lòng chọn Kho và Ngày'); return; }
    setLoading(true);
    try {
      const res = await getBaoCaoKHSX(searchId, storeId || '%');
      if (res.success) {
        setData(res.data || []);
        toast.success(`Tìm thấy ${res.total || res.data?.length || 0} bản ghi`);
      } else {
        setData([]);
        toast.error(res.message || 'Không tìm thấy dữ liệu');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi hệ thống');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) {
      toast.warn('Không có dữ liệu để xuất Excel');
      return;
    }

    const excelData = data.map((item, i) => ({
      'STT': i + 1,
      'ID Kế hoạch': item.ID_Kehoach || '',
      'Kho': item.StoreID || '',
      'Mã Quy Cách': item.MaquycachLop || '',
      'Tên Quy Cách': item.TenQuycachLop || '',
      'Máy': item.MaMay || '',
      'Ca': item.CaSX || '',
      'KH Gốc': item.SoLuong_KH || 0,
      'KH Điều Chỉnh': item.SoLuong_KH_DieuChinh || 0,
      'Thực Tế': item.SoLuong_SX || 0,
      'Còn Thiếu': item.SoLuong_Thieu || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KHSX_ThanhHinh");

    // Định dạng chiều rộng cột
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 8 }, { wch: 12 }, { wch: 35 }, 
      { wch: 8 }, { wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
    ];

    const fileName = `BaoCao_KHSX_ThanhHinh_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Đã xuất file Excel thành công');
  };

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
    doc.text('TỔNG HỢP KẾ HOẠCH SẢN XUẤT', pageWidth / 2 + 30, 40, { align: 'center' });
    doc.text('THÀNH HÌNH LỐP', pageWidth / 2 + 30, 55, { align: 'center' });
    
    doc.setFontSize(10);
    const dateText = `Ca ${ca_sx || 'Tất cả'}, Ngày ${ngaySX ? ngaySX.split('-')[2] : dateStr.split('/')[0]} tháng ${ngaySX ? ngaySX.split('-')[1] : dateStr.split('/')[1]} năm ${ngaySX ? ngaySX.split('-')[0] : dateStr.split('/')[2]}`;
    doc.text(dateText, pageWidth / 2 + 30, 70, { align: 'center' });
    
    autoTable(doc, {
      startY: 90,
      head: [['STT','ID Kế hoạch','Kho','Mã QC','Tên QC','Máy','Ca','KH','Đ.Chỉnh','Thực','Thiếu']],
      body: data.map((item, i) => [
        i + 1, item.ID_Kehoach||'', item.StoreID||'', item.MaquycachLop||'', item.TenQuycachLop||'',
        item.MaMay||'', item.CaSX||'',
        item.SoLuong_KH?.toLocaleString()||'0', item.SoLuong_KH_DieuChinh?.toLocaleString()||'0',
        item.SoLuong_SX?.toLocaleString()||'0', item.SoLuong_Thieu?.toLocaleString()||'0',
      ]),
      theme: 'grid',
      styles: { font: 'TimesNewRoman', fontSize:7, textColor:[0,0,0], lineColor:[0,0,0], lineWidth: 0.5 },
      headStyles: { font: 'TimesNewRoman', fontStyle:'normal', fillColor:[255,255,255], textColor:[0,0,0], halign:'center', valign: 'middle' },
      columnStyles: {
        0:{cellWidth:25,halign:'center'}, 
        1:{cellWidth:60}, 
        2:{cellWidth:30}, 
        3:{cellWidth:50},
        4:{cellWidth:'auto'}, 
        5:{cellWidth:35,halign:'center'}, 
        6:{cellWidth:20,halign:'center'},
        7:{cellWidth:40,halign:'right'}, 
        8:{cellWidth:40,halign:'right'}, 
        9:{cellWidth:40,halign:'right'}, 
        10:{cellWidth:40,halign:'right'},
      },
      margin: { left:20, right:20 },
      didParseCell: d => { d.cell.styles.font = 'TimesNewRoman'; },
    });
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    
    // Left dotted line
    doc.text('....................', 80, finalY);
    // Center dotted line
    doc.text('....................', pageWidth / 2 - 40, finalY);
    // Right text
    doc.text('NGƯỜI LẬP', pageWidth - 80, finalY, { align: 'center' });
    
    doc.save(`BaoCao_KHSX_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const totalKHGoc  = data.reduce((s, i) => s + (i.SoLuong_KH        || 0), 0);
  const totalThucTe = data.reduce((s, i) => s + (i.SoLuong_SX        || 0), 0);
  const totalThieu  = data.reduce((s, i) => s + (i.SoLuong_Thieu     || 0), 0);
  const generatedId = getGeneratedIdKehoach();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#e0eaf4', fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{css}</style>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
      <div className="mes-toolbar">
        <TbBtn
          label="Làm tươi"
          className="green"
          onClick={handleSearch}
          disabled={loading}
          icon={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}
        />
        <TbBtn
          label="Đóng"
          className="red"
          onClick={() => setData([])}
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
          label="Chốt dữ liệu"
          className="red"
          icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>}
          onClick={() => toast.info('Chức năng Chốt dữ liệu đang phát triển')}
        />
        <TbBtn
          label="Mở dữ liệu"
          icon={<><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></>}
          onClick={() => toast.info('Chức năng Mở dữ liệu đang phát triển')}
        />

        <div className="mes-tb-sep" />

        <TbBtn
          label="Thiết lập"
          icon={<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>}
          onClick={() => toast.info('Thiết lập')}
        />
      </div>

      {/* Loading bar */}
      {loading && (
        <div style={{ height: 3, background: '#b8cce0', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height:'100%', width:'40%', background:'#1565C0', animation:'progress 1.2s infinite ease-in-out' }} />
        </div>
      )}

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="mes-filterbar">
        <div className="mes-fb-group">
          <span className="mes-fb-label">Kế hoạch sản xuất Ca:</span>
          <select
            className="mes-select"
            style={{ width: 55 }}
            value={ca_sx}
            onChange={e => setCa_sx(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ngày:</span>
          <input
            type="date"
            className="mes-input"
            style={{ width: 120 }}
            value={ngaySX}
            onChange={e => setNgaySX(e.target.value)}
          />
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Kho:</span>
          <select
            className="mes-select"
            style={{ width: 180 }}
            value={storeId}
            onChange={e => setStoreId(e.target.value)}
          >
            <option value="">Tất cả</option>
            {storeList.map(s => (
              <option key={s.storeId} value={s.storeId}>{s.storeId} - {s.storeName}</option>
            ))}
          </select>
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">ID thủ công:</span>
          <input
            type="text"
            className="mes-input"
            style={{ width: 140 }}
            value={idKehoach}
            onChange={e => setIdKehoach(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="VD: RA10.202604161"
          />
        </div>

        <div className="mes-id-box">
          <span className="mes-id-label">ID Kế Hoạch:</span>
          <span className="mes-id-value">{generatedId === '%' ? '—' : generatedId}</span>
        </div>

        <button
          className="mes-search-btn"
          onClick={handleSearch}
          disabled={loading}
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
          <KpiCard label="KH Gốc"     value={totalKHGoc.toLocaleString('vi-VN')}   color="#1565C0" />
          <KpiCard label="Thực tế"    value={totalThucTe.toLocaleString('vi-VN')}  color="#166534" />
          <KpiCard
            label="Còn thiếu"
            value={totalThieu > 0 ? `-${totalThieu.toLocaleString('vi-VN')}` : '✓ Đủ'}
            color={totalThieu > 0 ? '#b91c1c' : '#166534'}
          />
          <KpiCard label="Bản ghi"   value={data.length.toString()}               color="#c2410c" />
        </div>
      )}

      {/* ── TABLE AREA ──────────────────────────────────────────────────── */}
      <div className="mes-table-area">
        {data.length > 0 ? (
          <>
            <div className="mes-table-header">
              <span>Hiển thị <strong style={{ color:'#1565C0' }}>{data.length}</strong> bản ghi</span>
              <span>Cập nhật: {timeStr}</span>
            </div>
            <div className="mes-table-wrap mes-fade">
              <table className="mes-table">
                <thead>
                  <tr>
                    <th className="c" style={{ width:36 }}>#</th>
                    <th>ID Kế Hoạch</th>
                    <th>Kho</th>
                    <th>Mã QC</th>
                    <th>Tên Quy Cách</th>
                    <th className="c">Máy</th>
                    <th className="c">Ca</th>
                    <th className="r">KH Gốc</th>
                    <th className="r">KH Đ.Chỉnh</th>
                    <th className="r">Thực Tế</th>
                    <th className="r">Còn Thiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => {
                    const thieu = item.SoLuong_Thieu || 0;
                    return (
                      <tr key={idx}>
                        <td className="c" style={{ color:'#6890b0', fontSize:11 }}>{idx + 1}</td>
                        <td>
                          <span className="mes-badge mes-badge-gray">{item.ID_Kehoach || '—'}</span>
                        </td>
                        <td>
                          <span className="mes-badge mes-badge-blue">{item.StoreID || '—'}</span>
                        </td>
                        <td style={{ fontWeight:700 }}>{item.MaquycachLop || '—'}</td>
                        <td style={{ color:'#4a6a8a', fontSize:11 }}>{item.TenQuycachLop || ''}</td>
                        <td className="c">
                          <span className="mes-badge mes-badge-gray">{item.MaMay || '—'}</span>
                        </td>
                        <td className="c">
                          <span className="mes-badge mes-badge-gold">{item.CaSX || '—'}</span>
                        </td>
                        <td className="r" style={{ color:'#4a6a8a' }}>{(item.SoLuong_KH || 0).toLocaleString('vi-VN')}</td>
                        <td className="r" style={{ color:'#4a6a8a' }}>{(item.SoLuong_KH_DieuChinh || 0).toLocaleString('vi-VN')}</td>
                        <td className="r" style={{ color:'#1565C0', fontWeight:800 }}>{(item.SoLuong_SX || 0).toLocaleString('vi-VN')}</td>
                        <td className="r">
                          {thieu > 0
                            ? <span className="mes-badge mes-badge-red">-{thieu.toLocaleString('vi-VN')}</span>
                            : <span style={{ color:'#6890b0' }}>—</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          !loading && (
            <div className="mes-empty mes-fade">
              <div className="icon">📋</div>
              <p>Chưa có dữ liệu — chọn tham số và nhấn Tìm Kiếm</p>
            </div>
          )
        )}
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="mes-statusbar">
        <span>{loading ? 'Đang tải dữ liệu...' : data.length > 0 ? `${data.length} bản ghi · ${dateStr}` : 'Sẵn sàng'}</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · XN RADIAL · XƯỞNG CVTH</span>
      </div>
    </div>
  );
};

export default BaoCaoKHSX;