import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { timesNewRomanBase64 } from '../../font/TimesNewRoman-Regular-base64';
import { timesNewRomanBoldBase64 } from '../../font/TimesNewRoman-Bold-base64';
import { getBaoCaoKeHoachThang, getBaoCaoKeHoachThangCom, getViewStoreListOrks, getDmMayXRay, getListToSx } from '../../api/kcsWebApi';
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
  { key: 'maquycachLop', header: 'Mã QC Lốp' },
  { key: 'tenQuycachLop', header: 'Tên QC Lốp' },
  { key: 'loailop', header: 'Loại Lốp' },
  { key: 'loailop_1', header: 'Loại Lốp 1' },
  { key: 'loaiCaNhap', header: 'Loại Ca Nhập' },
  { key: 'caNhap', header: 'Ca Nhập' },
  { key: 'lopTraxulyNhapkho', header: 'Lốp Trả XL Nhập Kho' },
  { key: 'sanluongTongBaogomLopTraXuly', header: 'Tổng SL (+Trả XL)' },
  { key: 'soluong', header: 'Số Lượng' },
  { key: 'sanluongLoai1', header: 'SL Loại 1' },
  { key: 'sanluongPhetandung', header: 'SL Phế TD' },
  { key: 'sanluongPhebo', header: 'SL Phế Bỏ' },
  { key: 'sanluongTraxuly', header: 'SL Trả XL' }
];

const BaoCaoKeHoachThang = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Params (Từ ngày, Đến ngày và Ca đã bị ẩn, truyền giá trị mặc định khi gọi API)
  const [tuKHThang, setTuKHThang] = useState('');
  const [denKHThang, setDenKHThang] = useState('');

  const [toSX, setToSX] = useState('');
  const [storeID, setStoreID] = useState('');
  const [maMay, setMaMay] = useState('');

  // Dropdown states
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [tosxList, setTosxList] = useState([]);
  const [tosxLoading, setTosxLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(true);

  // Fetch dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setTosxLoading(true);
        const resTosx = await getListToSx();
        setTosxList([{ value: '', label: '— Tất cả tổ SX' }, ...resTosx.map(item => ({
          value: item.to_noiLamViec || item.To_noiLamViec, label: `${item.to_noiLamViec || item.To_noiLamViec} — ${item.nhom_Noilamviec || item.Nhom_Noilamviec || ''}`
        }))]);
      } catch (e) {
        console.error('Error loading tosx:', e);
        setTosxList([{ value: '', label: '— Tất cả tổ SX' }]);
      } finally {
        setTosxLoading(false);
      }

      try {
        setStoresLoading(true);
        const resStores = await getViewStoreListOrks();
        setStores([{ value: '', label: '— Tất cả kho' }, ...resStores.map(item => ({
          value: item.storeID || item.StoreID || item.storeId, label: `${item.storeID || item.StoreID || item.storeId} — ${item.storeName || item.StoreName || item.storename || ''}`
        }))]);
      } catch (e) {
        console.error('Error loading stores:', e);
        setStores([{ value: '', label: '— Tất cả kho' }]);
      } finally {
        setStoresLoading(false);
      }

      try {
        setMachinesLoading(true);
        const resMachines = await getDmMayXRay();
        setMachines([{ value: '', label: '— Tất cả máy' }, ...resMachines.map(item => ({
          value: item.maMay || item.MaMay || item.Mamay || item.EquipmentID || item.equipmentID || item.equipmentId, label: `${item.maMay || item.MaMay || item.Mamay || item.EquipmentID || item.equipmentID || item.equipmentId} — ${item.tenMay || item.TenMay || item.EquipmentName || item.equipmentName || ''}`
        }))]);
      } catch (e) {
        console.error('Error loading machines:', e);
        setMachines([{ value: '', label: '— Tất cả máy' }]);
      } finally {
        setMachinesLoading(false);
      }
    };
    
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    const namThangNgayCaStart = '190001010'; // Giá trị mặc định
    const namThangNgayCaEnd = '210001010';   // Giá trị mặc định
    const monthlyPlanStart = tuKHThang ? tuKHThang.replace(/-/g, '') : '';
    const monthlyPlanEnd = denKHThang ? denKHThang.replace(/-/g, '') : '';

    if (!monthlyPlanStart || !monthlyPlanEnd) {
      toast.warn('Vui lòng chọn đầy đủ thời gian KH tháng');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        namThangNgayCaStart: Number(namThangNgayCaStart),
        namThangNgayCaEnd: Number(namThangNgayCaEnd),
        monthlyPlanStart: Number(monthlyPlanStart),
        monthlyPlanEnd: Number(monthlyPlanEnd),
        toSX: toSX || undefined,
        storeID: storeID || undefined,
        maMay: maMay || undefined
      };

      let res;
      if (maMay) {
        res = await getBaoCaoKeHoachThang(payload);
      } else {
        res = await getBaoCaoKeHoachThangCom(payload);
      }

      if (Array.isArray(res)) {
        setData(res);
        toast.success(`Tìm thấy ${res.length} bản ghi`);
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

  const exportToExcel = async () => {
    if (data.length === 0) {
      toast.warn('Không có dữ liệu để xuất Excel');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BaoCao');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      ...columns.map(col => ({
        header: col.header,
        key: col.key,
        width: Math.max(col.header.length + 5, 18)
      }))
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 30;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1565C0' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF96AFC8' } },
        left: { style: 'thin', color: { argb: 'FF96AFC8' } },
        bottom: { style: 'thin', color: { argb: 'FF96AFC8' } },
        right: { style: 'thin', color: { argb: 'FF96AFC8' } }
      };
    });

    data.forEach((row, idx) => {
      const rowData = { stt: idx + 1 };
      columns.forEach(col => {
        rowData[col.key] = row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '';
      });
      const dataRow = sheet.addRow(rowData);
      
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD8E8F4' } },
          left: { style: 'thin', color: { argb: 'FFD8E8F4' } },
          bottom: { style: 'thin', color: { argb: 'FFD8E8F4' } },
          right: { style: 'thin', color: { argb: 'FFD8E8F4' } }
        };
        if(colNumber === 1) {
            cell.alignment = { horizontal: 'center' };
        }
      });
    });

    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Bao_Cao_Ke_Hoach_Thang_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
    toast.success('Đã xuất file Excel thành công');
  };

  const exportToPDF = () => {
    if (data.length === 0) {
      toast.warn('Không có dữ liệu để xuất PDF');
      return;
    }

    const doc = new jsPDF('portrait', 'pt', 'a4');

    // Thêm font chữ tiếng Việt
    doc.addFileToVFS('TimesNewRoman-Regular.ttf', timesNewRomanBase64);
    doc.addFont('TimesNewRoman-Regular.ttf', 'TimesNewRoman', 'normal');
    doc.addFileToVFS('TimesNewRoman-Bold.ttf', timesNewRomanBoldBase64);
    doc.addFont('TimesNewRoman-Bold.ttf', 'TimesNewRoman', 'bold');
    doc.setFont('TimesNewRoman', 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header trái
    doc.setFontSize(8);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('CÔNG TY CP CAO SU ĐÀ NẴNG', 110, 30, { align: 'center' });
    doc.text('PHÒNG KCS', 110, 42, { align: 'center' });
    
    // Ánh xạ Ca
    let caText = 'Tất cả';
    doc.setFont('TimesNewRoman', 'normal');
    doc.text(`Ca SX: ${caText}`, 110, 54, { align: 'center' });

    // 2. Header phải
    doc.setFontSize(8.5);
    doc.text('KS.1.3/BH01', pageWidth - 23.6, 30, { align: 'right' });

    // 3. Header giữa (Tiêu đề chính)
    doc.setFontSize(12.5);
    doc.setFont('TimesNewRoman', 'bold');
    const titleText = 'TỔNG HỢP SẢN LƯỢNG VÀ CHẤT LƯỢNG KIỂM';
    doc.text(titleText, pageWidth / 2, 70, { align: 'center' });

    // Xác định Tháng/Năm hiển thị
    let filterMonthText = '';
    if (tuKHThang) {
      const [y, m] = tuKHThang.split('-');
      filterMonthText = `Tháng ${Number(m)} năm ${y}`;
    } else {
      const today = new Date();
      filterMonthText = `Tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    }

    doc.setFont('TimesNewRoman', 'bold');
    doc.setFontSize(11);
    doc.text(filterMonthText, pageWidth / 2, 83, { align: 'center' });

    // Hiển thị máy X-Quang nếu có chọn máy
    let currentY = 96;
    if (maMay) {
      const machineText = `Mã Máy X-Quang: ${maMay}`;
      doc.setFont('TimesNewRoman', 'normal');
      doc.setFontSize(9.5);
      doc.text(machineText, pageWidth / 2, currentY, { align: 'center' });
      currentY += 14;
    }

    // 4. Định nghĩa dữ liệu bảng
    const tableBody = data.map((row, idx) => {
      // Để trống nếu giá trị bằng 0 hoặc null để bảng thoáng và giống ảnh mẫu
      const getVal = (val) => {
        const num = Number(val);
        return isNaN(num) || num === 0 ? '' : num.toLocaleString('vi-VN');
      };

      return [
        idx + 1, // STT
        row.tenQuycachLop || '', // QUY CÁCH
        getVal(row.soluong), // TỔNG SP
        getVal(row.sanluongLoai1), // LOẠI 1
        getVal(row.sanluongPhetandung), // LOẠI PHẾ TẬN DỤNG
        getVal(row.sanluongPhebo), // LOẠI PHẾ
        getVal(row.sanluongTraxuly), // TRẢ XN XỬ LÝ
        row.note || '' // GHI CHÚ
      ];
    });

    // Tính tổng cộng cho các cột số lượng
    const grandTotalSP = data.reduce((sum, r) => sum + (Number(r.soluong) || 0), 0);
    const grandTotalL1 = data.reduce((sum, r) => sum + (Number(r.sanluongLoai1) || 0), 0);
    const grandTotalPheTD = data.reduce((sum, r) => sum + (Number(r.sanluongPhetandung) || 0), 0);
    const grandTotalPhe = data.reduce((sum, r) => sum + (Number(r.sanluongPhebo) || 0), 0);
    const grandTotalTraXL = data.reduce((sum, r) => sum + (Number(r.sanluongTraxuly) || 0), 0);

    const fmtNum = (val) => val === 0 ? '' : val.toLocaleString('vi-VN');

    // Thêm hàng TỔNG CỘNG
    tableBody.push([
      { content: 'TỔNG CỘNG', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
      { content: fmtNum(grandTotalSP), styles: { fontStyle: 'bold' } },
      { content: fmtNum(grandTotalL1), styles: { fontStyle: 'bold' } },
      { content: fmtNum(grandTotalPheTD), styles: { fontStyle: 'bold' } },
      { content: fmtNum(grandTotalPhe), styles: { fontStyle: 'bold' } },
      { content: fmtNum(grandTotalTraXL), styles: { fontStyle: 'bold' } },
      '' // Ghi chú trống
    ]);

    // Gọi autoTable vẽ bảng
    autoTable(doc, {
      startY: currentY,
      margin: { left: 23.6, right: 23.6, bottom: 40 },
      theme: 'grid',
      styles: {
        font: 'TimesNewRoman',
        fontSize: 9.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        valign: 'middle',
        cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
      },
      headStyles: {
        font: 'TimesNewRoman',
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 }
      },
      head: [
        // Dòng header group thứ nhất
        [
          { content: 'STT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'QUY CÁCH', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'TỔNG SP', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'LOẠI 1', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'LOẠI THỨ PHẨM', colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
          { content: 'GHI CHÚ', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
        ],
        // Dòng header con thứ hai
        [
          { content: 'LOẠI PHẾ\nTẬN DỤNG', styles: { halign: 'center', valign: 'middle', fontSize: 7.5 } },
          { content: 'LOẠI\nPHẾ', styles: { halign: 'center', valign: 'middle', fontSize: 7.5 } },
          { content: 'TRẢ XN\nXỬ LÝ', styles: { halign: 'center', valign: 'middle', fontSize: 7.5 } }
        ]
      ],
      body: tableBody,
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' }, // STT
        1: { cellWidth: 200, halign: 'left' },  // QUY CÁCH
        2: { cellWidth: 50, halign: 'right' },  // TỔNG SP
        3: { cellWidth: 45, halign: 'right' },  // LOẠI 1
        4: { cellWidth: 55, halign: 'right' },  // LOẠI PHẾ TẬN DỤNG
        5: { cellWidth: 45, halign: 'right' },  // LOẠI PHẾ
        6: { cellWidth: 50, halign: 'right' },  // TRẢ XN XỬ LÝ
        7: { cellWidth: 70, halign: 'left' }    // GHI CHÚ
      },
      didParseCell: (d) => {
        d.cell.styles.font = 'TimesNewRoman';
        if (d.row.index === tableBody.length - 1) {
          d.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // 5. Vẽ Footer ký tên dưới bảng
    const finalY = doc.lastAutoTable.finalY + 35;
    doc.setFontSize(10);
    doc.setFont('TimesNewRoman', 'bold');
    
    doc.text('P.KCS', 80, finalY, { align: 'center' });
    doc.text('Kỹ Thuật', pageWidth / 2, finalY, { align: 'center' });
    doc.text('Tổ trưởng', pageWidth - 80, finalY, { align: 'center' });

    // 6. Lưu file PDF
    const docName = `Bao_Cao_Ke_Hoach_Thang_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
    doc.save(docName);
    toast.success('Đã xuất file PDF thành công');
  };

  const clearAll = () => {
    setData([]);
    setTuKHThang(''); setDenKHThang('');
    setToSX('');
    setStoreID('');
    setMaMay('');
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN');
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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
        <TbBtn
          label="In PDF"
          onClick={exportToPDF} disabled={loading}
          icon={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>}
        />
      </div>

      {loading && (
        <div style={{ height: 3, background: '#b8cce0', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: '40%', background: '#1565C0', animation: 'progress 1.2s infinite ease-in-out' }} />
        </div>
      )}

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="mes-filterbar">
        {/* Đã ẩn tham số Từ ngày, Đến ngày và Ca */}

        <div className="mes-fb-group" style={{ gap: 4 }}>
          <span className="mes-fb-label">Từ KH tháng:</span>
          <input
            type="month" className="mes-input" style={{ width: 120 }}
            value={tuKHThang} onChange={e => setTuKHThang(e.target.value)}
          />
        </div>

        <div className="mes-fb-group" style={{ gap: 4 }}>
          <span className="mes-fb-label">Đến KH tháng:</span>
          <input
            type="month" className="mes-input" style={{ width: 120 }}
            value={denKHThang} onChange={e => setDenKHThang(e.target.value)}
          />
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Tổ SX:</span>
          <div style={{ minWidth: 150 }}>
            <Select
              placeholder={tosxLoading ? 'Đang tải...' : 'Tất cả tổ SX'}
              options={tosxList}
              value={tosxList.find(o => o.value === toSX) || null}
              onChange={opt => setToSX(opt?.value || '')}
              isClearable isLoading={tosxLoading} isDisabled={tosxLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Mã Kho:</span>
          <div style={{ minWidth: 150 }}>
            <Select
              placeholder={storesLoading ? 'Đang tải...' : 'Tất cả kho'}
              options={stores}
              value={stores.find(o => o.value === storeID) || null}
              onChange={opt => setStoreID(opt?.value || '')}
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
                        <td key={cIdx}>{row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : ''}</td>
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
          {loading ? 'Đang tải dữ liệu...' : data.length > 0 ? `\${data.length} bản ghi · \${dateStr}` : 'Sẵn sàng'}
        </span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · BÁO CÁO KẾ HOẠCH THÁNG</span>
      </div>
    </div>
  );
};

export default BaoCaoKeHoachThang;
