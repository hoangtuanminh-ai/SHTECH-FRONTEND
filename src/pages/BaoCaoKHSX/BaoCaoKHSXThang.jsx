import React, { useState, useEffect } from 'react';
import { getBaoCaoKHSXThang, getStoreListOrth } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { timesNewRomanBase64 } from '../../font/TimesNewRoman-Regular-base64';

/* ─── MES DESKTOP STYLE (GIỐNG HỆ THỐNG DRC) ────────────────────────────────── */
const css = `
  * { box-sizing: border-box; }
  .mes-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #e0eaf4;
    font-family: 'Segoe UI', Tahoma, sans-serif;
    color: #1a3a5c;
  }

  /* Toolbar */
  .mes-toolbar {
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    border-bottom: 2px solid #96afc8;
    padding: 5px 10px;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .mes-tb-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 8px;
    min-width: 70px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: 0.1s;
  }
  .mes-tb-btn:hover:not(:disabled) { background: #c0d4e8; border-color: #80a8c8; }
  .mes-tb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .mes-tb-btn svg { width: 20px; height: 20px; margin-bottom: 2px; }
  .mes-tb-btn span { font-size: 11px; font-weight: bold; color: #1e3a5c; }
  .mes-tb-sep { width: 1px; height: 30px; background: #96afc8; margin: 0 5px; }

  /* Form Area */
  .mes-content {
    padding: 10px;
    flex: 1;
    overflow-y: auto;
  }
  .mes-section {
    background: #fff;
    border: 1px solid #b8cce0;
    margin-bottom: 10px;
    position: relative;
  }
  .mes-section-title {
    background: #f0f6fc;
    border-bottom: 1px solid #b8cce0;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: bold;
    color: #1565C0;
  }
  .mes-grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
    padding: 10px;
  }

  /* Input & Label */
  .mes-field { display: flex; align-items: center; gap: 8px; }
  .mes-label { font-size: 12px; width: 100px; flex-shrink: 0; font-weight: 600; }
  .mes-input, .mes-select {
    flex: 1;
    height: 24px;
    border: 1px solid #6890b0;
    padding: 2px 5px;
    font-size: 12px;
    outline: none;
  }
  .mes-input:focus { border-color: #1565C0; background: #ffffd1; }

  /* Stats Row */
  .mes-stats-row {
    display: flex;
    gap: 15px;
    padding: 10px;
    background: #fff;
    border: 1px solid #b8cce0;
    margin-bottom: 10px;
  }
  .mes-stat-box {
    flex: 1;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #d8e8f4;
    text-align: center;
    background: #f8fafc;
  }
  .mes-stat-label { font-size: 11px; color: #555; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
  .mes-stat-value { font-size: 18px; font-weight: bold; }
  .mes-stat-value.blue { color: #1565C0; }
  .mes-stat-value.green { color: #2e7d32; }
  .mes-stat-value.red { color: #d32f2f; }
  .mes-stat-value.orange { color: #e65100; }

  /* Table Grid */
  .mes-table-container { padding: 5px; background: #fff; border: 1px solid #b8cce0; overflow-x: auto; }
  .mes-table { width: 100%; border-collapse: collapse; min-width: 900px; }
  .mes-table th {
    background: #ccdeed;
    border: 1px solid #96afc8;
    padding: 6px 4px;
    font-size: 11px;
    color: #1a3a5c;
    position: sticky;
    top: 0;
  }
  .mes-table td { 
    border: 1px solid #d8e8f4; 
    padding: 4px 6px; 
    font-size: 12px;
  }
  .mes-table tr:hover { background: #ffffd1; }
  
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-bold { font-weight: bold; }
  .text-red { color: #d32f2f; }
  .text-blue { color: #1565C0; }
  .text-muted { color: #888; }

  .mes-footer {
    background: #c0d4e8;
    border-top: 1px solid #96afc8;
    padding: 3px 15px;
    font-size: 11px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
`;

const BaoCaoKHSXThang = () => {
  const [storeId, setStoreId] = useState('');
  // Sử dụng format YYYY-MM cho thẻ input type="month"
  const [selectedMonth, setSelectedMonth] = useState(''); 
  const [spare2, setSpare2] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeList, setStoreList] = useState([]);

  useEffect(() => {
    getStoreListOrth()
      .then(res => {
        setStoreList(res);
        if (res.length > 0 && !storeId) setStoreId(res[0].storeId);
      })
      .catch(() => toast.error('Lỗi tải danh sách kho'));
  }, []);

  // Chuyển đổi YYYY-MM thành YYYYMM cho API (ví dụ 2023-03 -> 202303)
  const monthlyPlan = selectedMonth ? selectedMonth.replace('-', '') : '';

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN');

  const handleSearch = async () => {
    console.log(">>> Bắt đầu tìm kiếm Báo cáo KHSX Tháng...");
    console.log("Tham số: storeId =", storeId, "| monthlyPlan =", monthlyPlan, "| spare2 =", spare2);
    setLoading(true);
    try {
      const res = await getBaoCaoKHSXThang(storeId || '%', monthlyPlan || 0, spare2 || '%');
      console.log("Kết quả API:", res);
      if (res.success) {
        setData(res.data || []);
        toast.success(`Tìm thấy ${res.total || res.data?.length || 0} bản ghi`);
      } else {
        setData([]);
        toast.error(res.message || 'Không tìm thấy dữ liệu');
      }
    } catch (err) {
      console.error("Lỗi khi gọi API getBaoCaoKHSXThang:", err);
      toast.error(err.message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (data.length === 0) {
      toast.warn('Không có dữ liệu để xuất PDF');
      return;
    }
    
    console.log(">>> Bắt đầu xuất PDF cho", data.length, "bản ghi");

    const doc = new jsPDF('portrait', 'pt', 'a4');
    doc.addFileToVFS('TimesNewRoman-Regular.ttf', timesNewRomanBase64);
    doc.addFont('TimesNewRoman-Regular.ttf', 'TimesNewRoman', 'normal');
    doc.setFont('TimesNewRoman', 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(9);
    doc.text('CÔNG TY CP CAO SU ĐÀ NẴNG', 30, 40);
    doc.text('XN RADIAL - BP. CVTH', 30, 55);

    doc.setFontSize(12);
    doc.text('BÁO CÁO KẾ HOẠCH SẢN XUẤT THÁNG', pageWidth / 2 + 30, 40, { align: 'center' });
    doc.text('THÀNH HÌNH LỐP', pageWidth / 2 + 30, 55, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Tháng: ${monthlyPlan || 'Tất cả'}, Ngày in: ${dateStr}`, pageWidth / 2 + 30, 70, { align: 'center' });

    autoTable(doc, {
      startY: 90,
      head: [['STT','Kho','Mã QC','Tên QC','Máy','Tháng','KH Gốc','KH Đ.C','Spare_2','Thực','Thiếu']],
      body: data.map((item, i) => [
        i+1,
        item.StoreID||'',
        item.MaquycachLop||'',
        item.TenQuycachLop||'',
        item.MaMay||'',
        item.monthlyPlan||'',
        item.SoLuong_KH?.toLocaleString('vi-VN')||'0',
        item.SoLuong_KH_DieuChinh?.toLocaleString('vi-VN')||'0',
        item.Spare_2||'—',
        item.SoLuong_SX?.toLocaleString('vi-VN')||'0',
        item.SoLuong_Thieu?.toLocaleString('vi-VN')||'0'
      ]),
      theme: 'grid',
      styles: { font: 'TimesNewRoman', fontSize: 7, textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.5 },
      headStyles: { font: 'TimesNewRoman', fontStyle:'normal', fillColor:[255,255,255], textColor:[0,0,0], halign:'center', valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 35, halign: 'center' },
        5: { cellWidth: 40, halign: 'center' },
        6: { cellWidth: 40, halign: 'right' },
        7: { cellWidth: 40, halign: 'right' },
        8: { cellWidth: 40, halign: 'center' },
        9: { cellWidth: 40, halign: 'right' },
        10: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 20, right: 20 },
      didParseCell: (d) => { d.cell.styles.font = 'TimesNewRoman'; }
    });

    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    
    // Left dotted line
    doc.text('....................', 80, finalY);
    // Center dotted line
    doc.text('....................', pageWidth / 2 - 40, finalY);
    // Right text
    doc.text('NGƯỜI LẬP', pageWidth - 80, finalY, { align: 'center' });

    doc.save(`BaoCao_KHSX_Thang_${monthlyPlan || 'All'}_${new Date().toISOString().slice(0,10)}.pdf`);
    console.log(">>> Đã xuất PDF thành công");
  };

  const totalKHGoc  = data.reduce((s,i) => s + (i.SoLuong_KH||0), 0);
  const totalThucTe = data.reduce((s,i) => s + (i.SoLuong_SX||0), 0);
  const totalThieu  = data.reduce((s,i) => s + (i.SoLuong_Thieu||0), 0);

  return (
    <div className="mes-container">
      <style>{css}</style>

      {/* TOOLBAR */}
      <div className="mes-toolbar">
        <button className="mes-tb-btn" onClick={handleSearch} disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Tìm kiếm</span>
        </button>
        <button className="mes-tb-btn" onClick={() => {
          setStoreId('');
          setSelectedMonth('');
          setSpare2('');
          setData([]);
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          <span>Làm mới</span>
        </button>
        <div className="mes-tb-sep" />
        <button className="mes-tb-btn" onClick={exportToPDF} disabled={data.length === 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Xuất PDF</span>
        </button>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="mes-content">
        
        {/* Bộ lọc tìm kiếm */}
        <div className="mes-section">
          <div className="mes-section-title">Thông Tin Tìm Kiếm: Báo Cáo Kế Hoạch Sản Xuất Tháng</div>
          <div className="mes-grid-layout">
            <div className="mes-field">
              <span className="mes-label">Kho:</span>
              <select
                className="mes-select"
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
              >
                <option value="">Tất cả</option>
                {storeList.map(s => (
                  <option key={s.storeId} value={s.storeId}>{s.storeId} - {s.storeName}</option>
                ))}
              </select>
            </div>
            <div className="mes-field">
              <span className="mes-label">Tháng Kế Hoạch:</span>
              {/* Sử dụng input type="month" để chọn tháng/năm dễ dàng */}
              <input 
                type="month" 
                className="mes-input" 
                value={selectedMonth}
                onChange={e => {
                  console.log(">>> Chọn tháng:", e.target.value);
                  setSelectedMonth(e.target.value);
                }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="mes-field">
              <span className="mes-label">Spare_2:</span>
              <input 
                type="text" 
                className="mes-input" 
                placeholder="Để trống = tất cả"
                value={spare2}
                onChange={e => setSpare2(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
        </div>

        {/* Thống kê dữ liệu */}
        {data.length > 0 && (
          <div className="mes-stats-row">
            <div className="mes-stat-box">
              <div className="mes-stat-label">KH Gốc</div>
              <div className="mes-stat-value blue">{totalKHGoc.toLocaleString('vi-VN')}</div>
            </div>
            <div className="mes-stat-box">
              <div className="mes-stat-label">Thực Tế</div>
              <div className="mes-stat-value green">{totalThucTe.toLocaleString('vi-VN')}</div>
            </div>
            <div className="mes-stat-box">
              <div className="mes-stat-label">Còn Thiếu</div>
              <div className={"mes-stat-value " + (totalThieu > 0 ? "red" : "green")}>
                {totalThieu > 0 ? `-${totalThieu.toLocaleString('vi-VN')}` : '✓ Đủ'}
              </div>
            </div>
            <div className="mes-stat-box">
              <div className="mes-stat-label">Tổng Bản Ghi</div>
              <div className="mes-stat-value orange">{data.length}</div>
            </div>
          </div>
        )}

        {/* Bảng dữ liệu */}
        <div className="mes-table-container">
          <table className="mes-table">
            <thead>
              <tr>
                <th className="text-center" width="40">STT</th>
                <th>Kho</th>
                <th>Mã QC</th>
                <th>Tên Quy Cách</th>
                <th>Máy</th>
                <th className="text-center">Tháng</th>
                <th className="text-right">KH Gốc</th>
                <th className="text-right">KH Đ.Chỉnh</th>
                <th className="text-right">Spare_2</th>
                <th className="text-right">Thực Tế</th>
                <th className="text-right">Còn Thiếu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center" style={{ padding: '20px' }}>Đang tải dữ liệu...</td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, idx) => {
                  const thieu = item.SoLuong_Thieu || 0;
                  return (
                    <tr key={idx}>
                      <td className="text-center text-muted">{idx + 1}</td>
                      <td>{item.StoreID || '—'}</td>
                      <td className="text-bold">{item.MaquycachLop || '—'}</td>
                      <td>{item.TenQuycachLop || '—'}</td>
                      <td>{item.MaMay || '—'}</td>
                      <td className="text-center">{item.monthlyPlan || '—'}</td>
                      <td className="text-right">{item.SoLuong_KH?.toLocaleString('vi-VN') || '0'}</td>
                      <td className="text-right">{item.SoLuong_KH_DieuChinh?.toLocaleString('vi-VN') || '0'}</td>
                      <td className="text-right">{item.Spare_2 || '—'}</td>
                      <td className="text-right text-blue text-bold">{item.SoLuong_SX?.toLocaleString('vi-VN') || '0'}</td>
                      <td className={`text-right text-bold ${thieu > 0 ? 'text-red' : 'text-muted'}`}>
                        {thieu > 0 ? `-${thieu.toLocaleString('vi-VN')}` : '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="text-center text-muted" style={{ padding: '30px' }}>
                    Chưa có dữ liệu. Vui lòng chọn điều kiện và nhấn Tìm Kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      <div className="mes-footer">
        <span>{loading ? "ĐANG TẢI DỮ LIỆU..." : "SẴN SÀNG"}</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG - XN RADIAL</span>
      </div>
    </div>
  );
};

export default BaoCaoKHSXThang;