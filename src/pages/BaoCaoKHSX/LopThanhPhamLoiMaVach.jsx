import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getLopThanhPhamLoiMaVachList } from '../../api/kcsWebApi';

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

  
  .mes-pagination {
    display: flex; align-items: center; justify-content: center; gap: 15px;
    padding: 8px; background: #f0f6fc; border-bottom: 1px solid #b8cce0;
    font-size: 12px; color: #1a3a5c; flex-shrink: 0;
  }
  .mes-page-btn {
    padding: 4px 10px; background: #fff; border: 1px solid #96afc8;
    border-radius: 3px; cursor: pointer; color: #1565C0; font-weight: 600;
    transition: all 0.1s;
  }
  .mes-page-btn:hover:not(:disabled) { background: #eef5fc; border-color: #1565C0; }
  .mes-page-btn:disabled { opacity: 0.5; cursor: not-allowed; color: #5a7a9a; border-color: #b8cce0; }
  .mes-page-info { font-weight: 600; }

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
  { key: 'selected', header: 'Selected' },
  { key: 'barcode_LH', header: 'Barcode LH' },
  { key: 'maquycachLop', header: 'Mã QC' },
  { key: 'tenQuycachLop', header: 'Tên QC' },
  { key: 'maNV_Nhap', header: 'Mã NV Nhập' },
  { key: 'tenNV_Nhap', header: 'Tên NV Nhập' },
  { key: 'caNhap', header: 'Ca Nhập' },
  { key: 'ngayKiemTra', header: 'Ngày Kiểm Tra' },
  { key: 'mayLuuhoa', header: 'Máy Lưu Hóa' },
  { key: 'thutulopLuuhoa', header: 'Thứ Tự LH' },
  { key: 'loaiCaNhap', header: 'Loại Ca Nhập' },
  { key: 'phieuNhapKho', header: 'Phiếu Nhập Kho' },
  { key: 'timer_TickNhapKho', header: 'TG Tick Nhập Kho' },
  { key: 'khoiLuongLop', header: 'Khối Lượng Lốp' },
  { key: 'chatluongLop', header: 'Chất Lượng Lốp' },
  { key: 'maKhuyeTat', header: 'Mã KT' },
  { key: 'tenKhuyetTat', header: 'Tên KT' },
  { key: 'tinhtrangNhapKho', header: 'TT Nhập Kho' },
  { key: 'namthangNgayNhapKho', header: 'YMD Nhập Kho' },
  { key: 'namthangNgayCaNhapkho', header: 'YMD Ca Nhập Kho' },
  { key: 'ghiChuNhapKho', header: 'Ghi Chú NK' },
  { key: 'maNV_Xuat', header: 'Mã NV Xuất' },
  { key: 'tenNV_Xuat', header: 'Tên NV Xuất' },
  { key: 'phieuXuatkho', header: 'Phiếu Xuất Kho' },
  { key: 'timer_TickXuatKho', header: 'TG Tick Xuất Kho' },
  { key: 'ngayXuatKho', header: 'Ngày Xuất Kho' },
  { key: 'tinhTrangXuatKho', header: 'TT Xuất Kho' },
  { key: 'namthangNgayXuatkho', header: 'YMD Xuất Kho' },
  { key: 'namthangNgayCaXuatkho', header: 'YMD Ca Xuất Kho' },
  { key: 'ghiChuXuatKho', header: 'Ghi Chú XK' },
  { key: 'chatluong_Loai_1', header: 'CL Loại 1' },
  { key: 'chatluong_Phebo', header: 'CL Phế Bỏ' },
  { key: 'chatluong_Phetandung', header: 'CL Phế Tận Dụng' },
  { key: 'chatluong_Xuly', header: 'CL Xử Lý' },
  { key: 'khoadulieu', header: 'Khóa DL' },
  { key: 'lopTraxulyNhapkho', header: 'Lốp Trả XL Nhập Kho' },
  { key: 'toSanXuat', header: 'Tổ SX' },
  { key: 'storeID', header: 'Mã Kho' },
  { key: 'storeName', header: 'Tên Kho' },
  { key: 'monthlyPlan', header: 'KH Tháng' },
  { key: 'shift_', header: 'Shift' },
  { key: 'yearMonthDay', header: 'YMD' },
  { key: 'yearMonthDayShift', header: 'YMD Shift' },
  { key: 'lockData', header: 'Lock Data' },
  { key: 'note', header: 'Note' },
  { key: 'computerName', header: 'Computer Name' },
  { key: 'computerID', header: 'Computer ID' },
  { key: 'iPAddress', header: 'IP Address' },
  { key: 'dateModified', header: 'Date Modified' },
  { key: 'userId_Modified', header: 'User Modified' },
  { key: 'userName_Modified', header: 'User Name Mod' },
  { key: 'userId_Creat', header: 'User Creat' },
  { key: 'userName_Creat', header: 'User Name Creat' },
  { key: 'creatDate', header: 'Creat Date' },
  { key: 'checkBackup', header: 'Check Backup' }
];

const LopThanhPhamLoiMaVach = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchData = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await getLopThanhPhamLoiMaVachList({ page: pageNum });
      if (res && Array.isArray(res.content)) {
        setData(res.content);
        setTotalPages(res.totalPages || 0);
        setPage(res.number || 0);
        setTotalElements(res.totalElements || 0);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu!');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  const handleSearch = () => {
    fetchData(0);
  };

  // Hàm xuất dữ liệu ra file Excel
  const exportToExcel = async () => {
    // Ghi log phục vụ kiểm tra lỗi và debug dữ liệu
    console.log("Bắt đầu xuất dữ liệu ra file Excel...");
    console.log("Số lượng bản ghi cần xuất:", data.length);

    if (data.length === 0) {
      console.warn("Không có dữ liệu trong mảng 'data' để xuất Excel!");
      toast.warn('Không có dữ liệu để xuất Excel');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('ThongKe');
      sheet.columns = columns.map(col => ({ header: col.header, key: col.key, width: 18 }));
      data.forEach((row, idx) => {
          sheet.addRow({ ...row, stt: idx + 1 });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Lop_Thanh_Pham_Loi_Ma_Vach_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.xlsx`;
      saveAs(new Blob([buffer]), fileName);

      // Ghi log thành công
      console.log("Đã xuất file Excel thành công với tên: " + fileName);
      toast.success('Đã xuất file Excel thành công');
    } catch (error) {
      // Ghi log lỗi chi tiết khi xảy ra sự cố
      console.error("Lỗi xảy ra trong quá trình xuất Excel:", error);
      toast.error('Lỗi khi xuất file Excel!');
    }
  };

  // Hàm xóa sạch màn hình / đặt lại dữ liệu
  const clearAll = () => {
    // Ghi log bắt đầu thao tác đặt lại
    console.log("Thực hiện chức năng Xóa / Đặt lại dữ liệu trên giao diện.");
    setData([]);
    setPage(0);
    setTotalPages(0);
    setTotalElements(0);
    console.log("Trạng thái dữ liệu đã được đưa về mặc định (trống).");
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN');
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#e0eaf4', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{css}</style>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
      <div className="mes-toolbar">
        {/* Nút Tải/Làm tươi dữ liệu */}
        <TbBtn
          label="Tải/Làm tươi" className="green"
          onClick={handleSearch} disabled={loading}
          icon={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}
        />
        {/* Nút Xóa / Đặt lại (sử dụng TbBtn đồng bộ giao diện có icon hình tròn gạch chéo đỏ dễ nhìn) */}
        <TbBtn
          label="Xóa / Đặt lại" className="red"
          onClick={clearAll}
          icon={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
        />
        <div className="mes-tb-sep" />
        {/* Nút Xuất Excel (sử dụng TbBtn đồng bộ giao diện, có icon dạng lưới bảng tính màu xanh lá dễ nhìn) */}
        <TbBtn
          label="Xuất Excel" className="green"
          onClick={exportToExcel} disabled={loading || data.length === 0}
          icon={<><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></>}
        />
      </div>

      

      {loading && (
        <div style={{ height: 3, background: '#b8cce0', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: '40%', background: '#1565C0', animation: 'progress 1.2s infinite ease-in-out' }} />
        </div>
      )}
      {/* ── TABLE AREA ──────────────────────────────────────────────────── */}
      <div className="mes-table-area">
        {data.length > 0 ? (
          <>
            <div className="mes-table-header" style={{ borderBottom: 'none' }}>
              <span>Hiển thị <strong style={{ color: '#1565C0' }}>{data.length}</strong> / Tổng <strong style={{ color: '#1565C0' }}>{totalElements}</strong> bản ghi</span>
              <span>Cập nhật: {timeStr}</span>
            </div>
            {totalPages > 1 && (
              <div className="mes-pagination">
                <button className="mes-page-btn" disabled={page === 0 || loading} onClick={() => fetchData(0)}>Đầu</button>
                <button className="mes-page-btn" disabled={page === 0 || loading} onClick={() => fetchData(page - 1)}>Trước</button>
                <span className="mes-page-info">Trang {page + 1} / {totalPages}</span>
                <button className="mes-page-btn" disabled={page >= totalPages - 1 || loading} onClick={() => fetchData(page + 1)}>Sau</button>
                <button className="mes-page-btn" disabled={page >= totalPages - 1 || loading} onClick={() => fetchData(totalPages - 1)}>Cuối</button>
              </div>
            )}
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
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · LỐP THÀNH PHẨM LỖI MÃ VẠCH</span>
      </div>
    </div>
  );
};

export default LopThanhPhamLoiMaVach;
