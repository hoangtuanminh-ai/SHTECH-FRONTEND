import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
  getDropdownUsers,
  getDropdownQuyCach,
  saveKiemKe
} from '../../api/kiemkeApi';
import { getStoreListOrth } from '../../api/thanhhinhApi';

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
  .mes-tb-btn:hover { background: #c0d4e8; border-color: #80a8c8; }
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
  .mes-input.readonly { background: #f0f4f8; color: #555; }

  /* Table Grid */
  .mes-table-container { padding: 5px; background: #fff; border: 1px solid #b8cce0; }
  .mes-table { width: 100%; border-collapse: collapse; }
  .mes-table th {
    background: #ccdeed;
    border: 1px solid #96afc8;
    padding: 4px;
    font-size: 11px;
    color: #1a3a5c;
  }
  .mes-table td { border: 1px solid #d8e8f4; padding: 0; }
  .mes-grid-input {
    width: 100%;
    height: 26px;
    border: none;
    padding: 0 5px;
    font-size: 12px;
    background: transparent;
  }
  .mes-grid-input:focus { background: #ffffd1; outline: none; }

  .mes-footer {
    background: #c0d4e8;
    border-top: 1px solid #96afc8;
    padding: 3px 15px;
    font-size: 11px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
  .mes-row-clear-btn:hover {
    background: #fee2e2 !important;
  }
`;

const LapKiemKeTonKho = () => {
  const { userInfo } = useAuth();

  // 1. STATE FORM
  const [header, setHeader] = useState({
    maNguoiLap: '',
    tenNguoiLap: '',
    maKho: '',
    tenKho: '',
    khsxThang: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    idKeHoach: '',
    phieuKiemKe: '',
    ghiChu: '',
    lan: 1,
    caNhap: '1',
    ngayLap: new Date().toISOString().slice(0, 10),
  });

  const [rows, setRows] = useState(Array.from({ length: 15 }, () => ({
    maQc: '',
    tenQuyCach: '',
    slTon: '',
    khThang: '',
    ghiChu: '',
  })));

  // 2. DROPDOWNS
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [quyCachList, setQuyCachList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 3. LOGIC TẠO ID THEO BACKEND
  useEffect(() => {
    const generateIDs = () => {
      const yearMonth = header.khsxThang; // Định dạng đã là YYYYMM (ví dụ 202607)
      const phieu = `${header.maKho}.${yearMonth}`;
      const idKiemKe = `${phieu}.${header.lan}`;

      setHeader(prev => ({
        ...prev,
        phieuKiemKe: phieu,
        idKeHoach: idKiemKe
      }));
    };
    if (header.maKho && header.khsxThang) {
      generateIDs();
    }
  }, [header.maKho, header.khsxThang, header.lan]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, q, u] = await Promise.all([
          getStoreListOrth(),
          getDropdownQuyCach(),
          getDropdownUsers()
        ]);
        setStores(s || []);
        setQuyCachList(q || []);
        setUsers(u || []);

        // Gán user mặc định từ Auth và JWT Token
        const token = localStorage.getItem('jwt');
        let tokenData = {};
        if (token && token.includes('.')) {
          try {
            tokenData = JSON.parse(atob(token.split('.')[1]));
          } catch (e) {
            console.error('Không thể decode token:', e);
          }
        }
        const loggedInUserId = userInfo?.userId || tokenData.userId || tokenData.sub || '';
        
        let loggedInFullName = userInfo?.fullName || tokenData.fullName || tokenData.username || userInfo?.username || '';
        if (u && loggedInUserId) {
          const matchedUser = u.find(user => (user.UserId || user.EmployeeCode || '').toString() === loggedInUserId.toString());
          if (matchedUser) {
            loggedInFullName = matchedUser.UserName || matchedUser.fullName || matchedUser.username || loggedInFullName;
          }
        }

        // Console log kiểm tra thông tin user lập biểu được gán tự động
        console.log(`[KiemKe Auth] Thiết lập mã người lập: ${loggedInUserId}, Tên: ${loggedInFullName}`);

        setHeader(prev => ({
          ...prev,
          maNguoiLap: loggedInUserId,
          tenNguoiLap: loggedInFullName
        }));
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchData();
  }, [userInfo]);

  // 4. XỬ LÝ SỰ KIỆN
  const handleHeaderChange = (field, value) => {
    setHeader(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'maKho') {
        const s = stores.find(i => i.storeId === value);
        if (s) next.tenKho = s.storeName;
      }
      if (field === 'maNguoiLap') {
        const u = users.find(i => i.UserId === value || i.EmployeeCode === value);
        if (u) next.tenNguoiLap = u.UserName;
      }
      return next;
    });
  };

  const handleRowChange = (idx, field, val) => {
    const newRows = [...rows];
    newRows[idx][field] = val;
    if (field === 'maQc') {
      const qc = quyCachList.find(i => i.MaquycachLop === val);
      if (qc) {
        newRows[idx].tenQuyCach = qc.Ten_QuyCach;
        // Tự động gán KH Tháng từ Header khi chọn quy cách
        newRows[idx].khThang = header.khsxThang || '';
      } else {
        newRows[idx].tenQuyCach = '';
        newRows[idx].khThang = '';
      }
    }
    setRows(newRows);
  };

  // Làm trống một dòng quy cách kiểm kê
  const handleClearRow = (idx) => {
    setRows(prevRows => {
      const newRows = [...prevRows];
      newRows[idx] = {
        maQc: '',
        tenQuyCach: '',
        slTon: '',
        khThang: '',
        ghiChu: '',
      };
      // log ra console xác nhận hành động
      console.log(`[Clear Row] Đã làm trống dòng STT ${idx + 1}`);
      return newRows;
    });
  };

  // Đồng bộ KH Tháng của bảng chi tiết khi KHSX Tháng trên Header thay đổi
  useEffect(() => {
    setRows(prevRows => 
      prevRows.map(row => {
        if (row.maQc && row.maQc.trim() !== '') {
          return { ...row, khThang: header.khsxThang || '' };
        }
        return row;
      })
    );
    console.log(`[Sync KHSX Tháng] Đồng bộ KH Tháng dưới bảng chi tiết thành: ${header.khsxThang}`);
  }, [header.khsxThang]);

  const onSave = async () => {
    if (!header.maKho || !header.idKeHoach) {
      toast.error("Vui lòng nhập đầy đủ thông tin kho và ID");
      return;
    }

    const details = rows
      .filter(r => r.maQc.trim() !== '')
      .map(r => ({
        maQc: r.maQc,
        tenQuyCach: r.tenQuyCach,
        slTon: parseInt(r.slTon) || 0,
        khThang: parseInt(r.khThang) || 0,
        maKho: header.maKho,
        tenKho: header.tenKho,
        maNvLap: header.maNguoiLap,
        tenNvLap: header.tenNguoiLap,
        ghiChu: r.ghiChu,
        modeChangeData: 'Insert',
        latchData: true,
        lockData: false
      }));

    if (details.length === 0) {
      toast.warn("Chưa có dữ liệu quy cách để lưu");
      return;
    }

    const payload = { ...header, details };
    setLoading(true);
    try {
      const res = await saveKiemKe(payload);
      if (res && res.success) {
        toast.success("Lưu thành công: " + res.idKeHoach);
      } else {
        toast.error(res.message || "Lỗi lưu dữ liệu");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mes-container">
      <style>{css}</style>

      {/* TOOLBAR */}
      <div className="mes-toolbar">
        <div className="mes-tb-btn" onClick={onSave}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          <span>Lưu</span>
        </div>
        <div className="mes-tb-btn" onClick={() => window.location.reload()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          <span>Làm tươi</span>
        </div>
        <div className="mes-tb-sep" />
        <div className="mes-tb-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          <span>In</span>
        </div>
      </div>

      <div className="mes-content">
        <div className="mes-section">
          <div className="mes-section-title">Kiểm kê Sản lượng Phối Lốp</div>
          <div className="mes-grid-layout">

            {/* Cột 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className="mes-field">
                <span className="mes-label">Người lập biểu:</span>
                <div style={{ display: 'flex', gap: '5px', flex: 1, minWidth: 0 }}>
                  <input className="mes-input readonly font-bold" style={{ color: '#1565C0', width: '50px', minWidth: '50px', maxWidth: '50px', textAlign: 'center', flex: 'none' }} value={header.maNguoiLap} readOnly />
                  <input className="mes-input readonly" style={{ flex: 1, minWidth: 0 }} value={header.tenNguoiLap} readOnly />
                </div>
              </div>
              <div className="mes-field">
                <span className="mes-label">Kho:</span>
                <select className="mes-select" value={header.maKho} onChange={e => handleHeaderChange('maKho', e.target.value)}>
                  <option value="">-- Chọn Kho --</option>
                  {stores.map(s => <option key={s.storeId} value={s.storeId}>{s.storeId} - {s.storeName}</option>)}
                </select>
              </div>
              <div className="mes-field">
                <span className="mes-label">KHSX Tháng:</span>
                <input 
                  type="month" 
                  className="mes-input" 
                  value={(() => {
                    if (!header.khsxThang || header.khsxThang.length !== 6) return '';
                    const y = header.khsxThang.slice(0, 4);
                    const m = header.khsxThang.slice(4, 6);
                    return `${y}-${m}`;
                  })()} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val && val.includes('-')) {
                      const [y, m] = val.split('-');
                      const yyyyMm = `${y}${m}`;
                      // log console kiểm tra việc chuyển đổi định dạng
                      console.log(`[MonthPicker] Chọn KHSX Tháng: ${val} -> Định dạng hệ thống: ${yyyyMm}`);
                      handleHeaderChange('khsxThang', yyyyMm);
                    }
                  }} 
                />
              </div>
            </div>

            {/* Cột 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className="mes-field">
                <span className="mes-label">ID Kế Hoạch:</span>
                <input className="mes-input readonly" value={header.idKeHoach} readOnly />
              </div>
              <div className="mes-field">
                <span className="mes-label">Phiếu Kiểm Kê:</span>
                <input className="mes-input readonly" value={header.phieuKiemKe} readOnly />
              </div>
              <div className="mes-field">
                <span className="mes-label">Ghi chú:</span>
                <input className="mes-input" value={header.ghiChu} onChange={e => handleHeaderChange('ghiChu', e.target.value)} />
              </div>
            </div>

            {/* Cột 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className="mes-field">
                <span className="mes-label">Lần:</span>
                <select className="mes-select" value={header.lan} onChange={e => handleHeaderChange('lan', e.target.value)}>
                  {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="mes-field">
                <span className="mes-label">Ca nhập:</span>
                <select className="mes-select" value={header.caNhap} onChange={e => handleHeaderChange('caNhap', e.target.value)}>
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
              </div>
              <div className="mes-field">
                <span className="mes-label">Ngày lập:</span>
                <input type="date" className="mes-input" value={header.ngayLap} onChange={e => handleHeaderChange('ngayLap', e.target.value)} />
              </div>
            </div>

          </div>
        </div>

        {/* GRID TABLE */}
        <div className="mes-table-container">
          <table className="mes-table">
            <thead>
              <tr>
                <th width="40">STT</th>
                <th width="150">Mã QC</th>
                <th>Tên Quy Cách</th>
                <th width="100">SL Tồn</th>
                <th width="100">KH Tháng</th>
                <th width="200">Ghi Chú</th>
                <th width="45">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td align="center" style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>{idx + 1}</td>
                  <td>
                    <input
                      className="mes-grid-input"
                      list="qc-list"
                      value={row.maQc}
                      onChange={e => handleRowChange(idx, 'maQc', e.target.value)}
                    />
                  </td>
                  <td><input className="mes-grid-input readonly" value={row.tenQuyCach} readOnly /></td>
                  <td><input className="mes-grid-input" type="number" style={{ textAlign: 'right', color: 'red', fontWeight: 'bold' }} value={row.slTon} onChange={e => handleRowChange(idx, 'slTon', e.target.value)} /></td>
                  <td><input className="mes-grid-input readonly" type="number" style={{ textAlign: 'right', color: 'purple', fontWeight: 'bold' }} value={row.khThang} readOnly /></td>
                  <td><input className="mes-grid-input" value={row.ghiChu} onChange={e => handleRowChange(idx, 'ghiChu', e.target.value)} /></td>
                  {/* Nút thùng rác để xóa nhanh dòng quy cách */}
                  <td align="center" style={{ verticalAlign: 'middle' }}>
                    <button 
                      type="button"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '4px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '3px',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => handleClearRow(idx)}
                      title="Làm trống dòng này"
                      className="mes-row-clear-btn"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="qc-list">
            {quyCachList.map(q => <option key={q.MaquycachLop} value={q.MaquycachLop}>{q.Ten_QuyCach}</option>)}
          </datalist>
        </div>
      </div>

      <div className="mes-footer">
        <span>{loading ? "ĐANG LƯU DỮ LIỆU..." : "SẴN SÀNG"}</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG - XN RADIAL</span>
      </div>
    </div>
  );
};

export default LapKiemKeTonKho;