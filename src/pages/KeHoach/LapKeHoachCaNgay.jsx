import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createBulkKeHoach, getKeHoachListAll } from '../../api/kehoachApi';
import { getDanhSachMay } from '../../api/thanhhinhApi';
import { useAuth } from '../../context/AuthContext';

/* ─── MES Desktop Style ───────────────────────────────────────────────────── */
const css = `
  * { box-sizing: border-box; }
  @keyframes fadein { from{opacity:0} to{opacity:1} }
  .mes-fade { animation: fadein 0.2s ease; }

  .mes-toolbar {
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    border-bottom: 2px solid #96afc8;
    padding: 4px 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
    user-select: none;
  }
  .mes-tb-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 5px 12px;
    min-width: 65px;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    color: #1e3a5c;
    transition: background 0.1s, border-color 0.1s;
  }
  .mes-tb-btn:hover { background: #c0d4e8; border-color: #80a8c8; }
  .mes-tb-btn:active { background: #a0bcd4; }
  .mes-tb-btn svg { width: 24px; height: 24px; flex-shrink: 0; }
  .mes-tb-btn span { font-size: 11px; font-weight: 700; white-space: nowrap; line-height: 1; }
  
  .mes-tb-btn.primary { background: linear-gradient(180deg, #e6f0ff 0%, #cce0ff 100%); border-color: #99c2ff; }
  .mes-tb-btn.primary:hover { background: linear-gradient(180deg, #cce0ff 0%, #b3d1ff 100%); border-color: #66a3ff; }
  .mes-tb-btn.primary svg { stroke: #1565C0; }
  .mes-tb-btn.primary span { color: #1565C0; }

  .mes-tb-btn.danger svg { stroke: #b91c1c; }
  .mes-tb-btn.danger span { color: #b91c1c; }

  .mes-tb-sep { width: 1px; height: 35px; background: #96afc8; margin: 0 10px; flex-shrink: 0; }

  .mes-form-area {
    padding: 15px 20px;
    flex: 1;
    overflow-y: auto;
    background: #e0eaf4;
  }

  .mes-section {
    background: #fff;
    border: 1px solid #b8cce0;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    max-width: 1000px;
  }
  .mes-section-title {
    background: #f0f6fc;
    border-bottom: 1px solid #b8cce0;
    padding: 8px 15px;
    font-size: 13px;
    font-weight: 800;
    color: #1565C0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .mes-section-content {
    padding: 15px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .mes-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 200px;
  }
  .mes-form-label {
    font-size: 12px;
    font-weight: 700;
    color: #4a6a8a;
  }
  .mes-input, .mes-select {
    border: 1px solid #6890b0;
    background: #ffffff;
    padding: 5px 10px;
    font-size: 13px;
    font-weight: 600;
    color: #1a3a5c;
    border-radius: 3px;
    outline: none;
    height: 32px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mes-input:focus, .mes-select:focus {
    border-color: #1565C0;
    box-shadow: 0 0 0 2px rgba(21,101,192,0.15);
  }
  .mes-input[disabled] {
    background: #f0f4f8;
    color: #6890b0;
    cursor: not-allowed;
  }

  .mes-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .mes-table thead th {
    background: #ccdeed;
    padding: 8px 10px;
    text-align: left;
    font-size: 12px; font-weight: 800; color: #1a3a5c;
    border: 1px solid #96afc8;
    white-space: nowrap;
  }
  .mes-table tbody td {
    padding: 5px 10px;
    border: 1px solid #d8e8f4;
    color: #1a3a5c;
  }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table input.mes-grid-input {
    width: 100%;
    border: 1px solid #b8cce0;
    background: #fff;
    padding: 4px 8px;
    font-size: 13px;
    font-weight: 600;
    color: #1a3a5c;
    outline: none;
    border-radius: 2px;
  }
  .mes-table input.mes-grid-input:focus {
    border-color: #1565C0;
    box-shadow: 0 0 0 2px rgba(21,101,192,0.15);
  }
  .mes-table td.qty-col input {
    text-align: right;
    color: #b91c1c;
    font-weight: 700;
  }
  .mes-table td.adj-col input {
    text-align: right;
    color: #c026d3;
    font-weight: 700;
  }

  .mes-statusbar {
    background: #c0d4e8;
    border-top: 1px solid #96afc8;
    padding: 4px 15px;
    font-size: 12px; font-weight: 600; color: #1a3a5c;
    display: flex; justify-content: space-between;
    flex-shrink: 0;
  }
`;

const TbBtn = ({ icon, label, onClick, disabled, className = '' }) => (
  <button className={`mes-tb-btn ${className}`} onClick={onClick} disabled={disabled} title={label}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
    <span>{label}</span>
  </button>
);

const LapKeHoachCaNgay = () => {
  const { userInfo } = useAuth();

  // Header State
  const [header, setHeader] = useState({
    idKehoach: '',
    khsxNgay: new Date().toISOString().slice(0, 10), // Dùng chuẩn YYYY-MM-DD cho thẻ input date
    ca: 1,
    maKho: 'RA10',
    tenKho: 'Kho Lốp Thành Hình',
    maMayTh: '',
    tenMayTh: '',
    luuY: '',
  });

  // 7 rows data (Không có khsxThang theo yêu cầu DTO)
  const initialRows = Array.from({ length: 7 }, () => ({
    maQuyCach: '',
    tenQuyCach: '',
    soLuongKh: '',
    slThayDoi: '',
    ghiChu: ''
  }));
  const [rows, setRows] = useState(initialRows);

  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stores] = useState([
    { id: 'RA10', name: 'Kho Lốp Thành Hình RA10' },
    { id: 'RA11', name: 'Kho Lốp Thành Hình RA11' }
  ]);

  useEffect(() => {
    fetchMachines();
    fetchHistory();
  }, []);

  // Tự động sinh ID kế hoạch dựa trên các thông số Kho, Ngày, Ca (giống logic tự sinh của BaoCaoKHSX)
  useEffect(() => {
    if (header.maKho && header.khsxNgay) {
      const parts = header.khsxNgay.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const generatedId = `${header.maKho}.${y}${m}${d}${header.ca || ''}`;
        
        setHeader(prev => {
          if (prev.idKehoach !== generatedId) {
            // log ra màn hình console để kiểm tra lỗi hoặc xác nhận ID được sinh mới
            console.log(`[Auto-gen ID] ID Kế hoạch tự sinh mới: ${generatedId} (Kho: ${header.maKho}, Ngày: ${header.khsxNgay}, Ca: ${header.ca})`);
            return { ...prev, idKehoach: generatedId };
          }
          return prev;
        });
      }
    }
  }, [header.maKho, header.khsxNgay, header.ca]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // Lấy danh sách toàn bộ của tháng hiện tại
      const dateStr = new Date().toISOString().slice(0, 10);
      const [y, m] = dateStr.split('-');
      const res = await getKeHoachListAll({ nam_sx: y, thang_sx: m });
      if (res.success) {
        let list = res.data.content || res.data || [];
        // Sort danh sách để kế hoạch mới nhất (ID lớn nhất) lên đầu
        list.sort((a, b) => {
           const idA = a.idKehoach || a.ID_Kehoach || '';
           const idB = b.idKehoach || b.ID_Kehoach || '';
           return idB.localeCompare(idA);
        });
        setHistoryList(list.slice(0, 50)); // Hiển thị 50 dòng mới nhất cho đỡ nặng DOM
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.error(err);
      setHistoryList([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await getDanhSachMay();
      if (res.success && Array.isArray(res.data)) {
        setMachines(res.data);
      } else if (Array.isArray(res)) {
        setMachines(res);
      }
    } catch (err) {
      setMachines([]);
    }
  };

  const handleHeaderChange = (field, value) => {
    setHeader(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'maKho') {
        const store = stores.find(s => s.id === value);
        if (store) next.tenKho = store.name;
      }
      if (field === 'maMayTh') {
        const machine = machines.find(m => (m.machineNumber || m.MaMay || m.maMay || m) === value);
        if (machine) {
          next.tenMayTh = machine.machineName || machine.TenMay || machine.tenMay || machine.name || '';
        } else {
          next.tenMayTh = '';
        }
      }
      return next;
    });
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleSave = async () => {
    if (!header.idKehoach) {
      toast.warn('Vui lòng nhập ID Kế Hoạch'); return;
    }
    if (!header.maMayTh) {
      toast.warn('Vui lòng chọn Máy Thực Hiện'); return;
    }

    const hasData = rows.some(r => r.maQuyCach && r.maQuyCach.trim() !== '');
    if (!hasData) {
      toast.warn('Vui lòng nhập ít nhất 1 mã quy cách'); return;
    }

    // Decode token để lấy thông tin user chuẩn xác (nếu userInfo trong AuthContext bị thiếu)
    const token = localStorage.getItem('jwt');
    let tokenData = {};
    if (token) {
        try {
            tokenData = JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error('Không thể decode token:', e);
        }
    }

    const payload = {
      idKehoach: header.idKehoach,
      khsxNgay: header.khsxNgay ? header.khsxNgay.split('-').reverse().join('/') : '',
      ca: Number(header.ca),
      maKho: header.maKho,
      tenKho: header.tenKho,
      maNguoiLap: userInfo?.userId || tokenData.userId || tokenData.sub || 'SYSTEM',
      tenNguoiLap: userInfo?.fullName || tokenData.fullName || tokenData.username || userInfo?.username || 'Người Dùng Ẩn',
      maMayTh: header.maMayTh,
      tenMayTh: header.tenMayTh,
      tenMay: header.tenMayTh, // Thêm tenMay dự phòng cho backend
      luuY: header.luuY,
      rows: rows.filter(r => r.maQuyCach && r.maQuyCach.trim() !== '').map(r => ({
        ...r,
        soLuongKh: Number(r.soLuongKh) || 0,
        slThayDoi: Number(r.slThayDoi) || 0,
      }))
    };

    setLoading(true);
    try {
      const res = await createBulkKeHoach(payload);
      if (res.success) {
        toast.success(res.message || 'Lưu kế hoạch thành công');
        setRows(initialRows);
        setHeader(prev => ({ ...prev, luuY: '', maMayTh: '' }));
        fetchHistory(); // Reload danh sách sau khi lưu
      } else {
        toast.error(res.message || 'Lỗi khi lưu kế hoạch');
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi kết nối tới server');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn làm trống form?')) {
      setRows(initialRows);
      setHeader(prev => ({ ...prev, luuY: '', maMayTh: '' }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#e0eaf4', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{css}</style>

      {/* ── TOOLBAR ĐƯỢC LÀM RÕ RÀNG VÀ ĐẶT NÚT LƯU Ở ĐẦU ──────────────────────── */}
      <div className="mes-toolbar">
        <TbBtn
          label="LƯU KẾ HOẠCH"
          className="primary"
          onClick={handleSave}
          disabled={loading}
          icon={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>}
        />

        <div className="mes-tb-sep" />

        <TbBtn
          label="Làm trống"
          className="danger"
          onClick={handleClear}
          disabled={loading}
          icon={<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>}
        />
        <TbBtn
          label="In"
          icon={<><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>}
        />
      </div>

      <div className="mes-form-area mes-fade">
        {/* ── THÔNG TIN CHUNG (Được chia làm 2 dòng rõ ràng) ──────────────── */}
        <div className="mes-section">
          <div className="mes-section-title">Thông Tin Kế Hoạch Chung</div>

          <div className="mes-section-content">
            <div className="mes-form-group" style={{ flex: 1.5 }}>
              <span className="mes-form-label">ID Kế Hoạch *</span>
              <input className="mes-input" style={{ fontWeight: 'bold', color: '#1565C0' }} value={header.idKehoach} onChange={e => handleHeaderChange('idKehoach', e.target.value)} />
            </div>
            <div className="mes-form-group">
              <span className="mes-form-label">Ngày KHSX</span>
              <input type="date" className="mes-input" value={header.khsxNgay} onChange={e => handleHeaderChange('khsxNgay', e.target.value)} />
            </div>
            <div className="mes-form-group" style={{ maxWidth: 100 }}>
              <span className="mes-form-label">Ca *</span>
              <select className="mes-select" value={header.ca} onChange={e => handleHeaderChange('ca', Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div className="mes-form-group">
              <span className="mes-form-label">Mã Kho</span>
              <select className="mes-select" value={header.maKho} onChange={e => handleHeaderChange('maKho', e.target.value)}>
                {stores.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
            </div>
            <div className="mes-form-group" style={{ flex: 2 }}>
              <span className="mes-form-label">Máy Thực Hiện *</span>
              <select className="mes-select" value={header.maMayTh} onChange={e => handleHeaderChange('maMayTh', e.target.value)}>
                <option value="">-- Chọn máy --</option>
                {machines.map((m, i) => {
                  const id = m.machineNumber || m.MaMay || m.maMay || m;
                  const name = m.machineName || m.TenMay || m.tenMay || m.name || '';
                  return <option key={i} value={id}>{id} {name ? `- ${name}` : ''}</option>
                })}
              </select>
            </div>
          </div>

          <div className="mes-section-content" style={{ paddingTop: 0 }}>
            <div className="mes-form-group" style={{ flex: 1.5 }}>
              <span className="mes-form-label">Người lập biểu</span>
              <input className="mes-input" value={userInfo?.fullName || 'Hệ thống'} disabled />
            </div>
            <div className="mes-form-group" style={{ flex: 1 }}>
              <span className="mes-form-label">Tên Kho</span>
              <input className="mes-input" value={header.tenKho} disabled />
            </div>
            <div className="mes-form-group" style={{ flex: 3 }}>
              <span className="mes-form-label">Lưu ý chung</span>
              <input className="mes-input" value={header.luuY} onChange={e => handleHeaderChange('luuY', e.target.value)} placeholder="Nhập ghi chú chung..." />
            </div>
          </div>
        </div>

        {/* ── CHI TIẾT QUY CÁCH (Bảng 7 dòng dễ nhìn) ─────────────────────── */}
        <div className="mes-section">
          <div className="mes-section-title">
            <span>Chi Tiết Sản Xuất Trên Máy</span>
            <span style={{ fontSize: 11, fontWeight: 'normal', color: '#6890b0' }}>Tối đa 7 dòng quy cách</span>
          </div>

          <div style={{ padding: '15px' }}>
            <table className="mes-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>STT</th>
                  <th style={{ width: '20%' }}>Mã Quy Cách</th>
                  <th style={{ width: '25%' }}>Tên Quy Cách</th>
                  <th style={{ width: '15%', textAlign: 'right', color: '#b91c1c' }}>SL Kế Hoạch</th>
                  <th style={{ width: '15%', textAlign: 'right', color: '#c026d3' }}>SL Điều Chỉnh</th>
                  <th style={{ width: '25%' }}>Ghi Chú</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center', color: '#6890b0', fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <input
                        className="mes-grid-input"
                        value={row.maQuyCach}
                        onChange={e => handleRowChange(i, 'maQuyCach', e.target.value)}
                        placeholder="Nhập mã..."
                      />
                    </td>
                    <td>
                      <input
                        className="mes-grid-input"
                        value={row.tenQuyCach}
                        onChange={e => handleRowChange(i, 'tenQuyCach', e.target.value)}
                      />
                    </td>
                    <td className="qty-col">
                      <input
                        type="number"
                        className="mes-grid-input"
                        value={row.soLuongKh}
                        onChange={e => handleRowChange(i, 'soLuongKh', e.target.value)}
                      />
                    </td>
                    <td className="adj-col">
                      <input
                        type="number"
                        className="mes-grid-input"
                        value={row.slThayDoi}
                        onChange={e => handleRowChange(i, 'slThayDoi', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="mes-grid-input"
                        value={row.ghiChu}
                        onChange={e => handleRowChange(i, 'ghiChu', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── DANH SÁCH ĐÃ LẬP (Lưới bên dưới) ─────────────────────── */}
        <div className="mes-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
          <div className="mes-section-title">
            <span>BẢNG KẾ HOẠCH ĐÃ LẬP</span>
            <span style={{ fontSize: 11, fontWeight: 'normal', color: '#1565C0' }}>
              Hiển thị 50 bản ghi mới nhất của tháng hiện tại
            </span>
          </div>

          <div style={{ flex: 1, overflow: 'auto', minHeight: '250px' }}>
            <table className="mes-table" style={{ borderTop: 'none' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>STT</th>
                  <th style={{ textAlign: 'center' }}>Mã Máy</th>
                  <th>Mã QC</th>
                  <th>Tên Quy Cách Lốp</th>
                  <th style={{ textAlign: 'right' }}>SL Kế hoạch</th>
                  <th style={{ textAlign: 'right' }}>SL Điều chỉnh</th>
                  <th style={{ textAlign: 'center' }}>Mã Kho</th>
                  <th style={{ textAlign: 'center' }}>Ca SX</th>
                  <th style={{ textAlign: 'center' }}>ID Kế Hoạch</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((item, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center', color: '#6890b0' }}>{i + 1}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.maMay || item.MaMay}</td>
                    <td><strong style={{ color: '#1565C0' }}>{item.maQuyCachLop || item.MaquycachLop}</strong></td>
                    <td style={{ color: '#4a6a8a' }}>{item.tenQuyCachLop || item.TenQuycachLop}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{(item.soLuongKh || item.SoLuong_KH || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: '#c026d3' }}>{(item.soLuongKhDieuChinh || item.SoLuong_KH_DieuChinh || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>{item.storeId || item.StoreID}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#c2410c' }}>{item.caSx || item.CaSX}</td>
                    <td style={{ textAlign: 'center', color: '#6890b0', fontSize: 11 }}>{item.idKehoach || item.ID_Kehoach}</td>
                  </tr>
                ))}
                        {historyList.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#6890b0', fontStyle: 'italic' }}>
                      {loadingHistory ? 'Đang tải dữ liệu...' : 'Chưa có kế hoạch nào trong tháng này'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="mes-statusbar">
        <span>{loading ? 'Đang xử lý...' : 'Sẵn sàng'}</span>
        <span>CÔNG TY CP CAO SU ĐÀ NẴNG · XN RADIAL · XƯỞNG CVTH</span>
      </div>
    </div>
  );
};

export default LapKeHoachCaNgay;
