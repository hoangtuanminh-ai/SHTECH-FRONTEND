import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { getAllLoaiKhuyetTat } from '../../api/kcsWebApi';

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

const columns = [
  { key: 'maKhuyetTat', header: 'Mã Khuyết Tật' },
  { key: 'tenKhuyetTatCoSam', header: 'Tên KT (Có Săm)' },
  { key: 'tenKhuyetTatKhongSam', header: 'Tên KT (Không Săm)' },
  { key: 'viTriKtCoSam', header: 'Vị Trí (Có Săm)' },
  { key: 'viTriKtKhongSam', header: 'Vị Trí (Không Săm)' },
  { key: 'stt', header: 'STT DB' },
  { key: 'shift', header: 'Ca' },
  { key: 'yearMonthDay', header: 'Ngày' },
  { key: 'yearMonthDayShift', header: 'Ngày Ca' },
  { key: 'lockData', header: 'Lock' },
  { key: 'note', header: 'Ghi Chú' },
  { key: 'computerName', header: 'Máy Tính' },
  { key: 'computerId', header: 'ID Máy' },
  { key: 'ipAddress', header: 'IP' },
  { key: 'dateModified', header: 'Ngày Cập Nhật' },
  { key: 'userIdModified', header: 'User Cập Nhật' },
  { key: 'userNameModified', header: 'Tên Cập Nhật' },
  { key: 'userIdCreat', header: 'User Tạo' },
  { key: 'userNameCreat', header: 'Tên Người Tạo' },
  { key: 'creatDate', header: 'Ngày Tạo' },
  { key: 'checkBackup', header: 'Check Backup' }
];

const ViewDrcLoaiKhuyetTat = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllLoaiKhuyetTat();
      if (Array.isArray(res)) {
        setData(res);
        toast.success(`Đã tải \${res.length} bản ghi`);
      } else {
        setData([]);
      }
    } catch (err) {
      setData([]);
      toast.error('Lỗi khi tải dữ liệu: ' + err.message);
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
    const sheet = workbook.addWorksheet('Danh_Muc_Khuyet_Tat');

    sheet.columns = [
      { header: 'STT', key: 'stt_row', width: 6 },
      ...columns.map(col => ({
        header: col.header,
        key: col.key,
        width: Math.max(col.header.length + 5, 15)
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
      const rowData = { stt_row: idx + 1 };
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
    const fileName = `Danh_Muc_Loai_Khuyet_Tat_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
    toast.success('Đã xuất file Excel thành công');
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
          label="Tải dữ liệu" className="green"
          onClick={fetchData} disabled={loading}
          icon={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}
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
              <p>Chưa có dữ liệu</p>
            </div>
          )
        )}
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="mes-statusbar">
        <span>
          {loading ? 'Đang tải dữ liệu...' : data.length > 0 ? `\${data.length} bản ghi · \${dateStr}` : 'Sẵn sàng'}
        </span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · DANH MỤC LOẠI KHUYẾT TẬT KCS</span>
      </div>
    </div>
  );
};

export default ViewDrcLoaiKhuyetTat;
