import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getViewOrcThanhHinhNhap } from '../../api/viewOrcApi';
import { getStoreListOrth } from '../../api/thanhhinhApi';
import { getDropdownEquipment, getDropdownQuyCach } from '../../api/kiemkeApi';

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

  .mes-table-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .mes-table-header {
    padding: 5px 10px; display: flex; justify-content: space-between; align-items: center;
    background: #f0f6fc; border-bottom: 1px solid #b8cce0;
    font-size: 11px; color: #5a7a9a; flex-shrink: 0;
  }
  .mes-table-wrap { flex: 1; overflow: auto; background: #fff; }
  .mes-table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 12px; }
  .mes-table thead tr { background: #ccdeed; position: sticky; top: 0; z-index: 1; }
  .mes-table thead th {
    padding: 6px 8px; text-align: left;
    font-size: 11px; font-weight: 700; color: #1a3a5c;
    border-right: 1px solid #96afc8; border-bottom: 2px solid #6890b0;
    white-space: nowrap; letter-spacing: 0.2px;
  }
  .mes-table thead th:last-child { border-right: none; }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table tbody td {
    padding: 4px 8px; border-right: 1px solid #d8e8f4;
    border-bottom: 1px solid #d8e8f4; color: #1a3a5c;
    white-space: nowrap;
  }
  .mes-table tbody td:last-child { border-right: none; }

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

/* ─── react-select styles (compact MES) ──────────────────────────────────── */
const mesSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: '#fff',
    borderColor: state.isFocused ? '#1565C0' : '#6890b0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(21,101,192,0.15)' : 'none',
    borderRadius: 2, fontSize: 12, fontWeight: 600, color: '#1a3a5c',
    minHeight: 24, height: 24,
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

const columns = [
  { header: 'Mã vạch thành hình', key: 'barcodeTh' },
  { header: 'Kế hoạch', key: 'idKehoach' },
  { header: 'Mã kho', key: 'storeId' },
  { header: 'Tên kho', key: 'storeName' },
  { header: 'Mã QC', key: 'maQuyCachLop' },
  { header: 'Tên quy cách lốp', key: 'tenQuyCachLop' },
  { header: 'Cận dưới', key: 'spare1' },
  { header: 'Khối Lượng Lốp', key: 'khoiLuongLop' },
  { header: 'Cận trên', key: 'spare7' },
  { header: 'Thời điểm tích mã vạch', key: 'timerTickBarcode' },
  { header: 'Mã NV', key: 'maNvNhap' },
  { header: 'Tên nhân viên nhập', key: 'tenNvNhap' },
  { header: 'Mã máy', key: 'maMay' },
  { header: 'Tên máy', key: 'tenMay' },
  { header: 'Ca SX', key: 'caSx' },
  { header: 'Ngày sản xuất', key: 'timerStart' },
  { header: 'Chất lượng lốp', key: 'chatLuongLop' },
  { header: 'Tình trạng lốp', key: 'statusTyre' },
  { header: 'Mã KT', key: 'maKhuyetTat' },
  { header: 'Mã NV Xuất', key: 'maNvXuat' },
  { header: 'Tên NV xuất', key: 'tenNvXuat' },
  { header: 'Phiếu xuất', key: 'phieuXuatKho' },
  { header: 'Thời điểm tích xuất', key: 'timerTickXuatKho' },
  { header: 'Tình trạng xuất', key: 'tinhTrangXuatKho' },
  { header: 'KH Tháng', key: 'monthlyPlan' },
  { header: 'Ghi chú', key: 'note' },
  { header: 'IPAddress', key: 'ipAddress' },
];

const ViewOrcThanhHinhNhap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Params
  const [tuNgay, setTuNgay] = useState('');
  const [tuCa, setTuCa] = useState('0');
  const [denNgay, setDenNgay] = useState('');
  const [denCa, setDenCa] = useState('0');
  
  const [storeId, setStoreId] = useState('');
  const [maMay, setMaMay] = useState('');
  const [maQuyCachLop, setMaQuyCachLop] = useState('');

  // Dropdown states
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [specs, setSpecs] = useState([]);
  const [specsLoading, setSpecsLoading] = useState(true);

  // Fetch dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setStoresLoading(true);
        const resStores = await getStoreListOrth();
        setStores([{ value: '', label: '— Tất cả kho' }, ...resStores.map(item => ({
          value: item.storeId, label: `${item.storeId} — ${item.storeName || ''}`
        }))]);
      } catch (e) {
        console.error('Error loading stores:', e);
        setStores([{ value: '', label: '— Tất cả kho' }]);
      } finally {
        setStoresLoading(false);
      }

      try {
        setMachinesLoading(true);
        const resMachines = await getDropdownEquipment();
        setMachines([{ value: '', label: '— Tất cả máy' }, ...resMachines.map(item => ({
          value: item.Mamay || item.EquipmentID, label: `${item.Mamay || ''} — ${item.EquipmentName || item.EquipmentID || ''}`
        }))]);
      } catch (e) {
        console.error('Error loading machines:', e);
        setMachines([{ value: '', label: '— Tất cả máy' }]);
      } finally {
        setMachinesLoading(false);
      }

      try {
        setSpecsLoading(true);
        const resSpecs = await getDropdownQuyCach();
        setSpecs([{ value: '', label: '— Tất cả QC' }, ...resSpecs.map(item => ({
          value: item.MaquycachLop, label: `${item.MaquycachLop || ''} — ${item.Ten_QuyCach || ''}`
        }))]);
      } catch (e) {
        console.error('Error loading specs:', e);
        setSpecs([{ value: '', label: '— Tất cả QC' }]);
      } finally {
        setSpecsLoading(false);
      }
    };
    
    fetchDropdowns();
  }, []);

  const exportToExcel = async () => {
    if (data.length === 0) {
      toast.warn('Không có dữ liệu để xuất Excel');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BaoCao');

    // Cấu hình các cột (Header)
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      ...columns.map(col => ({
        header: col.header,
        key: col.key,
        width: Math.max(col.header.length + 5, 18)
      }))
    ];

    // Style dòng Header (In đậm, nền xanh, chữ trắng, viền)
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 30;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1565C0' } // Màu nền xanh đậm (#1565C0)
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF96AFC8' } },
        left: { style: 'thin', color: { argb: 'FF96AFC8' } },
        bottom: { style: 'thin', color: { argb: 'FF96AFC8' } },
        right: { style: 'thin', color: { argb: 'FF96AFC8' } }
      };
    });

    // Thêm dữ liệu
    data.forEach((row, idx) => {
      const rowData = { stt: idx + 1 };
      columns.forEach(col => {
        rowData[col.key] = getCellValue(row, col.key);
      });
      const dataRow = sheet.addRow(rowData);
      
      // Kẻ viền cho các ô dữ liệu
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD8E8F4' } },
          left: { style: 'thin', color: { argb: 'FFD8E8F4' } },
          bottom: { style: 'thin', color: { argb: 'FFD8E8F4' } },
          right: { style: 'thin', color: { argb: 'FFD8E8F4' } }
        };
        // Căn giữa cột STT
        if(colNumber === 1) {
            cell.alignment = { horizontal: 'center' };
        }
      });
    });

    // Cố định dòng Header khi cuộn
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `View_ORC_ThanhHinh_Nhap_${dateStr.replace(/\//g, '')}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
    toast.success('Đã xuất file Excel thành công');
  };

  const handleSearch = async () => {
    setLoading(true);
    
    // Format date + ca (VD: 20260131 + 1 = 202601311)
    const fromDate = tuNgay ? tuNgay.replace(/-/g, '') + tuCa : '';
    const toDate = denNgay ? denNgay.replace(/-/g, '') + denCa : '';
    
    try {
      const res = await getViewOrcThanhHinhNhap({
        storeId, fromDate, toDate, maMay, maQuyCachLop
      });
      console.log(">>> Data fetched for ViewOrcThanhHinhNhap", res);
      if (Array.isArray(res)) {
        setData(res);
        toast.success(`Tìm thấy \${res.length} bản ghi`);
      } else {
        setData([]);
        toast.error('Dữ liệu không hợp lệ');
      }
    } catch (err) {
      setData([]);
      toast.error('Lỗi khi lấy dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setData([]);
    setTuNgay('');
    setTuCa('0');
    setDenNgay('');
    setDenCa('0');
    setStoreId('');
    setMaMay('');
    setMaQuyCachLop('');
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN');
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Get value from row by checking common naming conventions 
  // (Just in case the Java properties differ slightly from our guessed keys)
  const getCellValue = (row, key) => {
    if (row[key] !== undefined && row[key] !== null) return row[key];
    
    // Fallback checks for common capitalization issues
    const lowerKey = key.toLowerCase();
    for (let actualKey in row) {
      if (actualKey.toLowerCase() === lowerKey) {
        return row[actualKey];
      }
    }
    return '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#e0eaf4', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{css}</style>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
      <div className="mes-toolbar">
        <TbBtn
          label="Tải/Làm tươi" className="green"
          onClick={handleSearch} disabled={loading}
          icon={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}
        />
        <TbBtn
          label="Làm trống" className="red"
          onClick={clearAll}
          icon={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
        />
        <div className="mes-tb-sep" />
        <TbBtn
          label="Xuất Excel"
          onClick={exportToExcel} disabled={loading}
          icon={<><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></>}
        />
      </div>

      {loading && (
        <div style={{ height: 3, background: '#b8cce0', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: '40%', background: '#1565C0', animation: 'progress 1.2s infinite ease-in-out' }} />
        </div>
      )}

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="mes-filterbar">
        <div className="mes-fb-group" style={{ gap: 4 }}>
          <span className="mes-fb-label">Từ ngày:</span>
          <input
            type="date" className="mes-input" style={{ width: 120 }}
            value={tuNgay} onChange={e => setTuNgay(e.target.value)}
          />
          <span className="mes-fb-label" style={{ marginLeft: 6 }}>Ca:</span>
          <select className="mes-select" style={{ width: 66, height: 24, fontSize: 12, border: '1px solid #6890b0', borderRadius: 2 }} value={tuCa} onChange={e => setTuCa(e.target.value)}>
            <option value="0">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="mes-fb-group" style={{ gap: 4 }}>
          <span className="mes-fb-label">Đến ngày:</span>
          <input
            type="date" className="mes-input" style={{ width: 120 }}
            value={denNgay} onChange={e => setDenNgay(e.target.value)}
          />
          <span className="mes-fb-label" style={{ marginLeft: 6 }}>Ca:</span>
          <select className="mes-select" style={{ width: 66, height: 24, fontSize: 12, border: '1px solid #6890b0', borderRadius: 2 }} value={denCa} onChange={e => setDenCa(e.target.value)}>
            <option value="0">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Mã Kho:</span>
          <div style={{ minWidth: 150 }}>
            <Select
              placeholder={storesLoading ? 'Đang tải...' : 'Tất cả kho'}
              options={stores}
              value={stores.find(o => o.value === storeId) || null}
              onChange={opt => setStoreId(opt?.value || '')}
              isClearable isLoading={storesLoading} isDisabled={storesLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Mã Máy:</span>
          <div style={{ minWidth: 150 }}>
            <Select
              placeholder={machinesLoading ? 'Đang tải...' : 'Tất cả máy'}
              options={machines}
              value={machines.find(o => o.value === maMay) || null}
              onChange={opt => setMaMay(opt?.value || '')}
              isClearable isLoading={machinesLoading} isDisabled={machinesLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Mã QC:</span>
          <div style={{ minWidth: 180 }}>
            <Select
              placeholder={specsLoading ? 'Đang tải...' : 'Tất cả QC'}
              options={specs}
              value={specs.find(o => o.value === maQuyCachLop) || null}
              onChange={opt => setMaQuyCachLop(opt?.value || '')}
              isClearable isLoading={specsLoading} isDisabled={specsLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>
        <button
          className="mes-search-btn" onClick={handleSearch} disabled={loading}
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

      {/* ── TABLE AREA ──────────────────────────────────────────────────── */}
      <div className="mes-table-area">
        {data.length > 0 ? (
          <>
            <div className="mes-table-header">
              <span>Hiển thị <strong style={{ color: '#1565C0' }}>{data.length}</strong> bản ghi</span>
              <span>Cập nhật: {timeStr}</span>
            </div>
            <div className="mes-table-wrap mes-fade">
              <table className="mes-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>STT</th>
                    {columns.map((col, i) => (
                      <th key={i}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td style={{ textAlign: 'center', color: '#6890b0', fontSize: 11 }}>{rIdx + 1}</td>
                      {columns.map((col, cIdx) => (
                        <td key={cIdx}>{getCellValue(row, col.key)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          !loading && (
            <div className="mes-empty mes-fade">
              <div className="icon">📄</div>
              <p>Chưa có dữ liệu — Thiết lập bộ lọc và nhấn Tìm Kiếm</p>
            </div>
          )
        )}
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="mes-statusbar">
      <span>
  {loading ? 'Đang tải dữ liệu...' : data.length > 0 ? `${data.length} bản ghi · ${dateStr}` : 'Sẵn sàng'}
</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · VIEW ORC THÀNH HÌNH NHẬP</span>
      </div>
    </div>
  );
};

export default ViewOrcThanhHinhNhap;
