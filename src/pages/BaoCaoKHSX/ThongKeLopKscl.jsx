import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { timesNewRomanBase64 } from '../../font/TimesNewRoman-Regular-base64';
import { timesNewRomanBoldBase64 } from '../../font/TimesNewRoman-Bold-base64';
import { getThongKeLopKscl, getThongKeLopKsclCom, getThongKeLopKsclKeHoachThang, getViewStoreListOrks, getDmMayXRay, getListToSx } from '../../api/kcsWebApi';

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
  { key: 'maquycachLop', header: 'Mã QC' },
  { key: 'tenQuycachLop', header: 'Tên Quy Cách' },
  { key: 'maKhuyeTat', header: 'Mã KT' },
  { key: 'tenKhuyetTat', header: 'Tên Khuyết Tật' },
  { key: 'loailop_1', header: 'Loại lốp 1' },
  { key: 'loailop', header: 'Loại lốp' },
  { key: 'loaiCaNhap', header: 'Loại ca nhập' },
  { key: 'sanluongTongBaogomLopTraXuly', header: 'SL Tổng (Gồm trả XL)' },
  { key: 'soluong', header: 'Số Lượng' },
  { key: 'sanluongLoai1', header: 'SL Loại 1' },
  { key: 'khuyetTatLoai1', header: 'Khuyết tật L1' },
  { key: 'sanluongPhetandung', header: 'SL Phế Tận Dụng' },
  { key: 'khuyetTatLoaiPheTanDung', header: 'Khuyết tật phế TĐ' },
  { key: 'sanluongPhebo', header: 'SL Phế Bỏ' },
  { key: 'khuyetTatLoaiPhe', header: 'Khuyết tật loại phế' },
  { key: 'sanluongTraxuly', header: 'SL Trả Xử Lý' },
  { key: 'khuyetTatTraXuLy', header: 'Khuyết tật trả XL' },
  { key: 'sanluong_KiemTraXuly_Loai1', header: 'SL KT Xử Lý Loại 1' }
];

const ThongKeLopKscl = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Params
  const [tuNgay, setTuNgay] = useState('');
  const [tuCa, setTuCa] = useState('0');
  const [denNgay, setDenNgay] = useState('');
  const [denCa, setDenCa] = useState('0');

  const [toSX, setToSX] = useState('');
  const [storeID, setStoreID] = useState('');
  const [maMay, setMaMay] = useState('');
  const [caNhap, setCaNhap] = useState('');
  const [monthlyPlan, setMonthlyPlan] = useState('');
  const [isKeHoachThang, setIsKeHoachThang] = useState(false);

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
    // Format date + ca (VD: 20260131 + 1 = 202601311)
    const namThangNgayCaStart = tuNgay ? tuNgay.replace(/-/g, '') + tuCa : '';
    const namThangNgayCaEnd = denNgay ? denNgay.replace(/-/g, '') + denCa : '';

    console.log("=== BẮT ĐẦU TÌM KIẾM KCS ===");
    console.log("isKeHoachThang:", isKeHoachThang);
    console.log("maMay (chọn từ dropdown):", maMay);
    console.log("namThangNgayCaStart:", namThangNgayCaStart);
    console.log("namThangNgayCaEnd:", namThangNgayCaEnd);

    if (!namThangNgayCaStart || !namThangNgayCaEnd) {
      toast.warn('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc');
      console.warn("Tìm kiếm bị chặn: thiếu thời gian bắt đầu hoặc kết thúc");
      return;
    }

    if (isKeHoachThang && !monthlyPlan) {
      toast.warn('Vui lòng nhập Kế hoạch tháng (VD: 202605)');
      console.warn("Tìm kiếm bị chặn: thiếu monthlyPlan khi isKeHoachThang=true");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        namThangNgayCaStart: Number(namThangNgayCaStart),
        namThangNgayCaEnd: Number(namThangNgayCaEnd),
        toSX: toSX || undefined,
        storeID: storeID || undefined,
        maMay: maMay || undefined,
        caNhap: caNhap || undefined
      };

      console.log("Payload gửi đi:", payload);

      // Thêm log ngay tại vị trí rẽ nhánh để bắt quả tang hành vi của code:
      console.log("--- KIỂM TRA ĐIỀU KIỆN TRƯỚC KHI GỌI API ---");
      console.log("Giá trị thực tế của maMay tại đây:", maMay, "Loại dữ liệu:", typeof maMay);
      console.log("Kết quả kiểm tra (!maMay):", !maMay);

      let res = [];
      if (isKeHoachThang) {
        console.log("Trường hợp: Tích tháng kế hoạch -> Gọi getThongKeLopKsclKeHoachThang");
        res = await getThongKeLopKsclKeHoachThang({ ...payload, monthlyPlan: Number(monthlyPlan) });
      } else {
        // Thêm phương thức ép kiểu chuỗi hoặc dùng toán sớ logic tường minh hơn
        if (maMay === undefined || maMay === null || String(maMay).trim() === '') {
          console.log("=> Thực tế chạy vào nhánh: KHÔNG CÓ MÁY -> getThongKeLopKscl");
          res = await getThongKeLopKscl(payload);
        } else {
          console.log("=> Thực tế chạy vào nhánh: CÓ MÁY -> getThongKeLopKsclCom");
          res = await getThongKeLopKsclCom(payload);
        }
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
    const sheet = workbook.addWorksheet('ThongKe');

    // Cấu hình các cột (Header)
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      ...columns.map(col => ({
        header: col.header,
        key: col.key,
        width: Math.max(col.header.length + 5, 18)
      }))
    ];

    // Style dòng Header
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

    // Thêm dữ liệu
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
        if (colNumber === 1) {
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `ThongKe_Lop_KSCL_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
    toast.success('Đã xuất file Excel thành công');
  };

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const formatNum = (val) => {
    if (val === null || val === undefined || val === 0 || val === '0' || val === '') return '';
    return Number(val).toLocaleString('vi-VN');
  };

  const formatKT = (val) => {
    if (!val || val === '0' || val === '-' || String(val).trim() === '') return '';
    return val;
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
    
    // Thêm font in đậm Times New Roman Bold
    doc.addFileToVFS('TimesNewRoman-Bold.ttf', timesNewRomanBoldBase64);
    doc.addFont('TimesNewRoman-Bold.ttf', 'TimesNewRoman', 'bold');
    
    doc.setFont('TimesNewRoman', 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Vẽ thông tin góc trên bên trái (Căn giữa đồng tâm)
    doc.setFontSize(8.5);
    const leftHeaderX = 23.6 + doc.getTextWidth('CÔNG TY CP CAO SU ĐÀ NẴNG') / 2;
    doc.text('CÔNG TY CP CAO SU ĐÀ NẴNG', leftHeaderX, 30, { align: 'center' });
    doc.text('PHÒNG KCS', leftHeaderX, 42, { align: 'center' });
    
    // Lấy thông tin tổ sản xuất và ca sản xuất từ bộ lọc
    const selectedToSX = toSX || '...';
    const selectedCa = tuCa !== '0' ? tuCa : (caNhap || '...');
    doc.text(`Ca SX: ${selectedCa}${toSX ? `  -  Tổ: ${toSX}` : ''}`, leftHeaderX, 54, { align: 'center' });

    // 2. Vẽ thông tin góc trên bên phải
    doc.setFontSize(8.5);
    doc.text('KS.1.1/BH01', pageWidth - 23.6, 30, { align: 'right' });

    // 3. Vẽ Tiêu đề chính ở giữa (Căn giữa chuẩn xác bằng cách đo độ rộng chuỗi tiếng Việt thực tế và dùng font bold)
    doc.setFontSize(11.5);
    doc.setFont('TimesNewRoman', 'bold');
    const titleText = 'BIỂU KIỂM TRA CHẤT LƯỢNG LỐP Ô TÔ';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, 43);
    doc.setFont('TimesNewRoman', 'normal'); // Reset lại font thường

    // 4. Vẽ Từ ngày ... đến ngày ...
    doc.setFontSize(9);
    const fromText = tuNgay ? formatDateDMY(tuNgay) : '__-__-____';
    const toText = denNgay ? formatDateDMY(denNgay) : '__-__-____';
    const dateRangeText = `Từ ngày: ${fromText} đến ngày: ${toText}`;
    const dateRangeWidth = doc.getTextWidth(dateRangeText);
    doc.text(dateRangeText, (pageWidth - dateRangeWidth) / 2, 55);

    // Vẽ động dòng Mã Máy X-Quang nếu có tìm kiếm theo máy
    let startYTable = 75;
    const selectedMachineOpt = machines.find(o => o.value === maMay);
    const selectedMachineLabel = selectedMachineOpt && selectedMachineOpt.value ? selectedMachineOpt.label.split(' — ')[0] : '';
    if (selectedMachineLabel) {
      const machineText = `Mã Máy X-Quang: ${selectedMachineLabel}`;
      const machineWidth = doc.getTextWidth(machineText);
      doc.text(machineText, (pageWidth - machineWidth) / 2, 67);
      startYTable = 90;
    }

    // 6. Định nghĩa và định dạng dữ liệu cho bảng
    let lastQuyCach = null;
    const tableBody = data.map((row, idx) => {
      const currentQuyCach = row.tenQuycachLop || '';
      const displayQuyCach = currentQuyCach === lastQuyCach ? '' : currentQuyCach;
      lastQuyCach = currentQuyCach;

      return [
        idx + 1, // STT
        displayQuyCach, // QUY CÁCH
        
        // LOẠI 1
        formatNum(row.sanluongLoai1), // Số lượng
        formatKT(row.khuyetTatLoai1), // Kh.t
        
        // PHẾ TẬN DỤNG
        formatNum(row.sanluongPhetandung), // Số lượng
        formatKT(row.khuyetTatLoaiPheTanDung), // Kh.t
        
        // LOẠI PHẾ
        formatNum(row.sanluongPhebo), // Số lượng
        formatKT(row.khuyetTatLoaiPhe), // Kh.t
        
        // TRẢ XỬ LÝ
        formatNum(row.sanluongTraxuly), // Số lượng
        formatKT(row.khuyetTatTraXuLy), // Kh.t
        
        // GHI CHÚ
        formatNum(row.sanluong_KiemTraXuly_Loai1) // Ghi chú
      ];
    });

    // Tính tổng cộng cho các cột số lượng
    const totalLoai1 = data.reduce((sum, r) => sum + (Number(r.sanluongLoai1) || 0), 0);
    const totalPheTD = data.reduce((sum, r) => sum + (Number(r.sanluongPhetandung) || 0), 0);
    const totalLoaiPhe = data.reduce((sum, r) => sum + (Number(r.sanluongPhebo) || 0), 0);
    const totalTraXL = data.reduce((sum, r) => sum + (Number(r.sanluongTraxuly) || 0), 0);
    const totalKtxlL1 = data.reduce((sum, r) => sum + (Number(r.sanluong_KiemTraXuly_Loai1) || 0), 0);

    // Thêm hàng tổng cộng vào cuối bảng (in đậm chữ TỔNG CỘNG)
    tableBody.push([
      { content: 'TỔNG CỘNG', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
      formatNum(totalLoai1), '',
      formatNum(totalPheTD), '',
      formatNum(totalLoaiPhe), '',
      formatNum(totalTraXL), '',
      formatNum(totalKtxlL1)
    ]);

    // 7. Gọi autoTable để vẽ bảng với kích thước và padding tối ưu để không xuống dòng tên cột
    autoTable(doc, {
      startY: startYTable,
      margin: { left: 23.6, right: 23.6, bottom: 40 }, // Lề đối xứng 23.6pt (~8.3mm) chuẩn báo cáo quốc tế
      theme: 'grid',
      styles: {
        font: 'TimesNewRoman',
        fontSize: 9.7, // Tăng cỡ chữ nội dung bảng lên 9.7pt (to lên thêm 1 cỡ chuẩn)
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        valign: 'middle',
        cellPadding: { top: 5, bottom: 5, left: 3, right: 3 } // Tăng nhẹ padding dọc để thoáng chữ
      },
      headStyles: {
        font: 'TimesNewRoman',
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        fontStyle: 'bold',
        fontSize: 9.2, // Tăng cỡ chữ Header cột lên 9.2pt (to lên thêm 1 cỡ chuẩn)
        cellPadding: { top: 5.5, bottom: 5.5, left: 1.5, right: 1.5 } // Điều chỉnh padding dọc tương xứng
      },
      head: [
        [
          { content: 'STT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'QUY CÁCH', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'LOẠI 1', colSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'PHẾ TẬN DỤNG', colSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'LOẠI PHẾ', colSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'TRẢ XỬ LÝ', colSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'GHI CHÚ', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
        ],
        [
          { content: 'Số lượng', styles: { halign: 'center' } },
          { content: 'Kh.t', styles: { halign: 'center' } },
          { content: 'Số lượng', styles: { halign: 'center' } },
          { content: 'Kh.t', styles: { halign: 'center' } },
          { content: 'Số lượng', styles: { halign: 'center' } },
          { content: 'Kh.t', styles: { halign: 'center' } },
          { content: 'Số lượng', styles: { halign: 'center' } },
          { content: 'Kh.t', styles: { halign: 'center' } }
        ]
      ],
      body: tableBody,
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' }, // STT
        1: { cellWidth: 173, halign: 'left' }, // QUY CÁCH
        2: { cellWidth: 44, halign: 'right' }, // LOẠI 1 - SL
        3: { cellWidth: 30, halign: 'center' }, // LOẠI 1 - KT
        4: { cellWidth: 44, halign: 'right' }, // PHẾ TD - SL
        5: { cellWidth: 30, halign: 'center' }, // PHẾ TD - KT
        6: { cellWidth: 44, halign: 'right' }, // LOẠI PHẾ - SL
        7: { cellWidth: 30, halign: 'center' }, // LOẠI PHẾ - KT
        8: { cellWidth: 44, halign: 'right' }, // TRẢ XL - SL
        9: { cellWidth: 30, halign: 'center' }, // TRẢ XL - KT
        10: { cellWidth: 59, halign: 'right' } // GHI CHÚ
      },
      didParseCell: (d) => {
        d.cell.styles.font = 'TimesNewRoman';
        if (d.row.index === tableBody.length - 1) {
          d.cell.styles.fontStyle = 'bold'; // Thiết lập in đậm cho dòng tổng cộng
        }
      }
    });

    // 8. Vẽ Footer ký tên (Căn lề đối xứng 2 bên tại trục x=120 và x=pageWidth-120)
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(10.5);
    doc.setFont('TimesNewRoman', 'bold'); // In đậm chức danh ký tên
    doc.text('PHÒNG KCS', 120, finalY, { align: 'center' });
    doc.text('TỔ KIỂM', pageWidth - 120, finalY, { align: 'center' });

    // 9. Lưu file
    const docName = `Bieu_Kiem_Tra_Chat_Luong_Lop_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
    doc.save(docName);
    toast.success('Đã xuất file PDF thành công');
  };

  const clearAll = () => {
    setData([]);
    setTuNgay(''); setTuCa('0');
    setDenNgay(''); setDenCa('0');
    setToSX('');
    setStoreID('');
    setMaMay('');
    setCaNhap('');
    setMonthlyPlan('');
    setIsKeHoachThang(false);
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
          icon={<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>}
        />
        <TbBtn
          label="Làm trống" className="red"
          onClick={clearAll}
          icon={<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>}
        />
        <div className="mes-tb-sep" />
        <TbBtn
          label="Xuất Excel"
          onClick={exportToExcel} disabled={loading}
          icon={<><rect x="3" y="3" width="18" height="18" rx="1" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></>}
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

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ca Nhập:</span>
          <select className="mes-select" style={{ width: 66, height: 24, fontSize: 12, border: '1px solid #6890b0', borderRadius: 2 }} value={caNhap} onChange={e => setCaNhap(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        <div className="mes-fb-group" style={{ marginLeft: 10, background: '#fff', padding: '2px 8px', borderRadius: 3, border: '1px solid #6890b0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#1a3a5c', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isKeHoachThang}
              onChange={e => setIsKeHoachThang(e.target.checked)}
              style={{ margin: 0 }}
            />
            Kế hoạch tháng
          </label>
        </div>

        {isKeHoachThang && (
          <div className="mes-fb-group">
            <span className="mes-fb-label">Tháng KH:</span>
            <input
              type="text" className="mes-input" style={{ width: 80 }}
              value={monthlyPlan} onChange={e => setMonthlyPlan(e.target.value)}
              placeholder="VD: 202605"
            />
          </div>
        )}

        <button
          className="mes-search-btn" onClick={handleSearch} disabled={loading}
        >
          {loading ? (
            <><span className="mes-spinner" /> Đang tải...</>
          ) : (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
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
                      {columns.map((col, cIdx) => {
                        let val = row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : '';
                        // Nếu là cột Tên Quy Cách (tenQuycachLop) và trùng với hàng phía trước thì để trống
                        if (col.key === 'tenQuycachLop' && rIdx > 0 && data[rIdx - 1].tenQuycachLop === row.tenQuycachLop) {
                          val = '';
                        }
                        return <td key={cIdx}>{val}</td>;
                      })}
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
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · THỐNG KÊ LỐP KSCL</span>
      </div>
    </div>
  );
};

export default ThongKeLopKscl;
