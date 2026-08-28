// src/pages/ThanhHinh/DanhSachLopTHLH.jsx
import React, { useState, useEffect } from 'react';
import { getDanhSachLopTHLH, getDanhSachMay, getStoreListOrth } from '../../api/thanhhinhApi';
import { getDropdownQuyCach } from '../../api/kiemkeApi';
import { toast } from 'react-toastify';

/* ─── MES Desktop Style ───────────────────────────────────────────────────── */
// Giữ nguyên style CSS tương tự các trang khác để đồng bộ UI
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
  .mes-table td.c { text-align: center; }

  .mes-badge {
    display: inline-block; padding: 1px 7px;
    border-radius: 2px; font-size: 11px; font-weight: 700;
    white-space: nowrap;
  }
  .mes-badge-blue   { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
  .mes-badge-gray   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

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

  /* Pagination styles */
  .mes-pagination {
    display: flex; gap: 5px; align-items: center; justify-content: flex-end;
    padding: 5px 10px; border-top: 1px solid #b8cce0; background: #f0f6fc;
  }
  .mes-page-btn {
    border: 1px solid #96afc8; background: #fff; padding: 2px 8px; border-radius: 2px;
    font-size: 11px; cursor: pointer; color: #1a3a5c; font-weight: 600;
  }
  .mes-page-btn:hover:not(:disabled) { background: #d4e4f4; }
  .mes-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .mes-page-info { font-size: 11px; color: #5a7a9a; margin: 0 10px; }
`;

/* ─── Toolbar Button Component ───────────────────────────────────────────── */
const TbBtn = ({ icon, label, onClick, disabled, className = '' }) => (
  <button className={`mes-tb-btn ${className}`} onClick={onClick} disabled={disabled} title={label}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
    <span>{label}</span>
  </button>
);

const DanhSachLopTHLH = () => {
  // --- Các state để lưu giá trị filter ---
  const [storeId, setStoreId] = useState('');
  const [maMay, setMaMay] = useState('');
  const [maQuyCachLop, setMaQuyCachLop] = useState('');
  const [ngayNhapKho, setNgayNhapKho] = useState(''); // yyyy-mm-dd
  const [caNhapKho, setCaNhapKho] = useState(''); // 1, 2, 3
  
  // State danh sách máy lấy từ API
  const [danhSachMay, setDanhSachMay] = useState([]);
  const [quyCachList, setQuyCachList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  
  // --- State dữ liệu và phân trang ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0); // backend nhận page từ 0
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    // Lấy danh sách máy và mã QC khi component mount
    const fetchDataInit = async () => {
      try {
        const [resMay, resQC, resStores] = await Promise.all([
          getDanhSachMay(),
          getDropdownQuyCach(),
          getStoreListOrth()
        ]);
        if (resMay && resMay.success && resMay.data) {
          setDanhSachMay(resMay.data);
        }
        if (resQC) {
          // Tùy theo định dạng trả về của getDropdownQuyCach
          setQuyCachList(resQC.data || resQC || []);
        }
        if (resStores) {
          setStoreList(resStores);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo dữ liệu:", error);
      }
    };
    fetchDataInit();
  }, []);

  // --- Hàm gọi API ---
  const fetchData = async (currentPage = 0) => {
    setLoading(true);
    
    // Tạo chuỗi namThangNgayCaNhapKho từ ngayNhapKho và caNhapKho
    // Ví dụ: ngayNhapKho = '2026-04-16', caNhapKho = '1' -> '202604161'
    let namThangNgayCaNhapKhoStr = '';
    if (ngayNhapKho) {
      const parts = ngayNhapKho.split('-'); // ['2026', '04', '16']
      if (parts.length === 3) {
        namThangNgayCaNhapKhoStr = `${parts[0]}${parts[1]}${parts[2]}${caNhapKho}`;
      }
    }

    // In ra console để theo dõi khi test lỗi như yêu cầu
    console.log("=== BẮT ĐẦU GỌI API ===");
    console.log("Tham số truyền vào:", { storeId, maMay, maQuyCachLop, namThangNgayCaNhapKho: namThangNgayCaNhapKhoStr, page: currentPage, size });

    try {
      const res = await getDanhSachLopTHLH({
        storeId: storeId || undefined,
        maMay: maMay || undefined,
        maQuyCachLop: maQuyCachLop || undefined,
        namThangNgayCaNhapKho: namThangNgayCaNhapKhoStr || undefined,
        page: currentPage,
        size
      });

      console.log("=== KẾT QUẢ API ===", res);

      if (res && res.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
        setPage(currentPage);
        toast.success(`Tải dữ liệu thành công!`);
      } else {
        setData([]);
        setTotal(0);
        toast.error(res?.message || 'Không tìm thấy dữ liệu');
      }
    } catch (err) {
      console.error("LỖI GỌI API:", err);
      toast.error(err.message || 'Lỗi hệ thống');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Tự động load dữ liệu lần đầu nếu muốn (bỏ comment nếu cần load ngay khi mở)
  // useEffect(() => { fetchData(0); }, []);

  const handleSearch = () => {
    setPage(0); // Khi search mới thì reset về trang 0
    fetchData(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(total / size)) {
      fetchData(newPage);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#e0eaf4', fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{css}</style>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
      <div className="mes-toolbar">
        <TbBtn
          label="Làm mới"
          className="green"
          onClick={handleSearch}
          disabled={loading}
          icon={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}
        />
        <TbBtn
          label="Đóng"
          className="red"
          onClick={() => {
            setData([]); setTotal(0); setPage(0);
          }}
          icon={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
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
          <span className="mes-fb-label">Mã Máy:</span>
          <select
            className="mes-select"
            style={{ width: 100 }}
            value={maMay}
            onChange={e => setMaMay(e.target.value)}
          >
            <option value="">Tất cả</option>
            {danhSachMay.map((m, i) => (
              <option key={i} value={m.MaMay}>{m.MaMay}</option>
            ))}
          </select>
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Mã QC:</span>
          <select
            className="mes-select"
            style={{ width: 150 }}
            value={maQuyCachLop}
            onChange={e => setMaQuyCachLop(e.target.value)}
          >
            <option value="">Tất cả</option>
            {quyCachList.map(q => (
              <option key={q.MaquycachLop} value={q.MaquycachLop}>{q.MaquycachLop} - {q.Ten_QuyCach}</option>
            ))}
          </select>
        </div>

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ngày Nhập:</span>
          <input
            type="date"
            className="mes-input"
            style={{ width: 120 }}
            value={ngayNhapKho}
            onChange={e => setNgayNhapKho(e.target.value)}
          />
        </div>
        
        <div className="mes-fb-group">
          <span className="mes-fb-label">Ca:</span>
          <select
            className="mes-select"
            style={{ width: 60 }}
            value={caNhapKho}
            onChange={e => setCaNhapKho(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
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

      {/* ── TABLE AREA ──────────────────────────────────────────────────── */}
      <div className="mes-table-area">
        {data.length > 0 ? (
          <>
            <div className="mes-table-header">
              <span>Tìm thấy tổng <strong style={{ color:'#1565C0' }}>{total}</strong> bản ghi. Đang hiển thị trang {page + 1}/{Math.ceil(total / size)}</span>
              <span>Cập nhật: {timeStr}</span>
            </div>
            <div className="mes-table-wrap mes-fade">
              <table className="mes-table">
                <thead>
                  <tr>
                    <th className="c" style={{ width: 40 }}>STT</th>
                    <th>Mã Kho</th>
                    <th>ID Nhập Kho</th>
                    <th>Mã Máy</th>
                    <th>Mã Quy Cách</th>
                    <th>Barcode</th>
                    <th>Người Tạo</th>
                    <th>Ngày Tạo</th>
                    {/* Thêm các cột khác tùy theo schema của View_ORC_ThanhHinh_Nhap_Lienket_LuuHoa */}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => {
                    return (
                      <tr key={idx}>
                        <td className="c" style={{ color:'#6890b0', fontSize:11 }}>{page * size + idx + 1}</td>
                        <td><span className="mes-badge mes-badge-blue">{item.StoreID || '—'}</span></td>
                        <td><span className="mes-badge mes-badge-gray">{item.NamthangNgayCaNhapkho || '—'}</span></td>
                        <td style={{ fontWeight: 600 }}>{item.MaMay || '—'}</td>
                        <td style={{ color: '#1565C0', fontWeight: 600 }}>{item.MaquycachLop || '—'}</td>
                        <td style={{ color: '#4a6a8a' }}>{item.Barcode || '—'}</td>
                        <td>{item.Nguoitao || '—'}</td>
                        <td>{item.Ngaytao ? new Date(item.Ngaytao).toLocaleString('vi-VN') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {total > size && (
              <div className="mes-pagination">
                <button 
                  className="mes-page-btn" 
                  disabled={page === 0} 
                  onClick={() => handlePageChange(page - 1)}
                >
                  ◀ Trước
                </button>
                <span className="mes-page-info">Trang {page + 1} / {Math.ceil(total / size)}</span>
                <button 
                  className="mes-page-btn" 
                  disabled={page >= Math.ceil(total / size) - 1} 
                  onClick={() => handlePageChange(page + 1)}
                >
                  Tiếp ▶
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="mes-empty mes-fade">
              <div className="icon">📋</div>
              <p>Chưa có dữ liệu — nhập tham số và nhấn Tìm Kiếm</p>
            </div>
          )
        )}
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="mes-statusbar">
        <span>{loading ? 'Đang tải dữ liệu...' : data.length > 0 ? `Hiển thị ${data.length} trên tổng số ${total} bản ghi` : 'Sẵn sàng'}</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · XN RADIAL · XƯỞNG CVTH</span>
      </div>
    </div>
  );
};

export default DanhSachLopTHLH;
