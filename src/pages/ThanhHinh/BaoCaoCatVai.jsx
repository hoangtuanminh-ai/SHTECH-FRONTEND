// src/pages/ThanhHinh/BaoCaoCatVai.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { timesNewRomanBase64 } from '../../font/TimesNewRoman-Regular-base64';
import { 
  getBaoCaoKHSXCatVai, 
  getBaoCaoKHSXTheoThang, 
  getBaoCaoTheoXe, 
  getBaoCaoTheoXeRange, 
  getTongHopIDKeHoach, 
  getTongHopTheoMay, 
  getTongHopKhongTheoMay, 
  getCatVaiStores, 
  getCatVaiEquipments 
} from '../../api/catVaiApi';

const css = `
  .mes-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #e0eaf4;
    font-family: 'Segoe UI', Tahoma, sans-serif;
    color: #1a3a5c;
  }
  .mes-tabs {
    display: flex;
    background: #96afc8;
    border-bottom: 2px solid #6890b0;
    flex-shrink: 0;
  }
  .mes-tab {
    padding: 8px 16px;
    background: #b0c4de;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: #1a3a5c;
    border-right: 1px solid #96afc8;
    transition: background 0.1s;
  }
  .mes-tab.active {
    background: #e0eaf4;
    color: #1565c0;
    border-bottom: 2px solid #1565c0;
  }
  .mes-tab:hover { background: #c6d9f1; }
  
  .mes-toolbar {
    background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%);
    border-bottom: 2px solid #96afc8;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 1px;
    flex-shrink: 0;
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
  .mes-tb-btn:disabled { opacity: 0.45; }
  .mes-tb-btn svg { width: 20px; height: 20px; }
  .mes-tb-btn span { font-size: 11px; font-weight: 600; }
  
  .mes-filterbar {
    background: #d4e4f4;
    border-bottom: 1px solid #96afc8;
    padding: 8px 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
    align-items: center;
  }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-fb-label { font-size: 11px; font-weight: 700; color: #1a3a5c; width: 100px; flex-shrink: 0; }
  .mes-input, .mes-select {
    flex: 1;
    border: 1px solid #6890b0;
    background: #fff;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: 600;
    color: #1a3a5c;
    border-radius: 2px;
    height: 24px;
  }
  .mes-table-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .mes-table-wrap { flex: 1; overflow: auto; background: #fff; }
  .mes-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .mes-table thead tr { background: #ccdeed; position: sticky; top: 0; z-index: 1; }
  .mes-table thead th {
    padding: 6px 8px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #1a3a5c;
    border-right: 1px solid #96afc8;
    border-bottom: 2px solid #6890b0;
    white-space: nowrap;
  }
  .mes-table tbody tr { border-bottom: 1px solid #d8e8f4; }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table tbody td {
    padding: 5px 8px;
    border-right: 1px solid #d8e8f4;
    color: #1a3a5c;
    white-space: nowrap;
  }
`;

function BaoCaoCatVai() {
  const [activeTab, setActiveTab] = useState('khsx');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [idKehoach, setIdKehoach] = useState('');
  const [storeId, setStoreId] = useState('');
  const [maMay, setMaMay] = useState('');
  const [monthlyPlan, setMonthlyPlan] = useState('');
  const [yearMonthDayShift, setYearMonthDayShift] = useState('');
  const [startShift, setStartShift] = useState('');
  const [endShift, setEndShift] = useState('');

  // Dropdown lists
  const [stores, setStores] = useState([]);
  const [equipments, setEquipments] = useState([]);

  useEffect(() => {
    // Load metadata
    const loadMetadata = async () => {
      try {
        const [storesRes, equipRes] = await Promise.all([getCatVaiStores(), getCatVaiEquipments()]);
        if (storesRes.success) setStores(storesRes.data || []);
        if (equipRes.success) setEquipments(equipRes.data || []);
      } catch (err) {
        console.error("Không load được metadata:", err);
      }
    };
    loadMetadata();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'khsx') {
        if (!idKehoach || !storeId) {
          toast.error("Vui lòng nhập ID Kế hoạch và chọn Kho");
          setLoading(false);
          return;
        }
        res = await getBaoCaoKHSXCatVai(idKehoach, storeId, maMay || '%');
      } else if (activeTab === 'khsx-thang') {
        if (!storeId || !monthlyPlan) {
          toast.error("Vui lòng chọn Kho và Kế hoạch tháng (yyyyMM)");
          setLoading(false);
          return;
        }
        res = await getBaoCaoKHSXTheoThang(storeId, Number(monthlyPlan), maMay || '%');
      } else if (activeTab === 'theo-xe') {
        if (!yearMonthDayShift || !storeId) {
          toast.error("Vui lòng chọn Ca (yyyyMMddCa) và Kho");
          setLoading(false);
          return;
        }
        res = await getBaoCaoTheoXe(yearMonthDayShift, storeId, maMay || '%');
      } else if (activeTab === 'theo-xe-range') {
        if (!startShift || !endShift || !storeId) {
          toast.error("Vui lòng chọn Khoảng ca bắt đầu/kết thúc và Kho");
          setLoading(false);
          return;
        }
        res = await getBaoCaoTheoXeRange(startShift, endShift, storeId, maMay || '%');
      } else if (activeTab === 'tonghop-id') {
        if (!idKehoach || !startShift || !endShift || !storeId) {
          toast.error("Vui lòng nhập đầy đủ thông tin lọc");
          setLoading(false);
          return;
        }
        res = await getTongHopIDKeHoach(idKehoach, Number(startShift), Number(endShift), storeId, maMay || '%');
      } else if (activeTab === 'tonghop-may') {
        if (!idKehoach || !startShift || !endShift || !storeId) {
          toast.error("Vui lòng nhập đầy đủ thông tin lọc");
          setLoading(false);
          return;
        }
        res = await getTongHopTheoMay(idKehoach, Number(startShift), Number(endShift), storeId, maMay || '%');
      } else if (activeTab === 'tonghop-khong-may') {
        if (!idKehoach || !startShift || !endShift || !storeId) {
          toast.error("Vui lòng nhập đầy đủ thông tin lọc");
          setLoading(false);
          return;
        }
        res = await getTongHopKhongTheoMay(idKehoach, Number(startShift), Number(endShift), storeId, maMay || '%');
      }

      if (res && res.success) {
        setData(res.data || []);
        toast.success(res.message || "Tải báo cáo thành công");
      } else {
        toast.error(res?.message || "Lấy dữ liệu thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!data.length) {
      toast.warn("Không có dữ liệu để xuất");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BaoCaoCatVai");
    XLSX.writeFile(wb, `BaoCaoCatVai_${activeTab}.xlsx`);
    toast.success("Xuất file Excel thành công");
  };

  return (
    <div className="mes-container">
      <style>{css}</style>
      
      {/* Tabs */}
      <div className="mes-tabs">
        <button className={`mes-tab ${activeTab === 'khsx' ? 'active' : ''}`} onClick={() => { setActiveTab('khsx'); setData([]); }}>Báo cáo KHSX</button>
        <button className={`mes-tab ${activeTab === 'khsx-thang' ? 'active' : ''}`} onClick={() => { setActiveTab('khsx-thang'); setData([]); }}>Báo cáo KHSX Tháng</button>
        <button className={`mes-tab ${activeTab === 'theo-xe' ? 'active' : ''}`} onClick={() => { setActiveTab('theo-xe'); setData([]); }}>Báo cáo Theo Xe</button>
        <button className={`mes-tab ${activeTab === 'theo-xe-range' ? 'active' : ''}`} onClick={() => { setActiveTab('theo-xe-range'); setData([]); }}>Khoảng Ca</button>
        <button className={`mes-tab ${activeTab === 'tonghop-id' ? 'active' : ''}`} onClick={() => { setActiveTab('tonghop-id'); setData([]); }}>Tổng Hợp ID Kế Hoạch</button>
        <button className={`mes-tab ${activeTab === 'tonghop-may' ? 'active' : ''}`} onClick={() => { setActiveTab('tonghop-may'); setData([]); }}>Tổng Hợp Theo Máy</button>
        <button className={`mes-tab ${activeTab === 'tonghop-khong-may' ? 'active' : ''}`} onClick={() => { setActiveTab('tonghop-khong-may'); setData([]); }}>Tổng Hợp Không Theo Máy</button>
      </div>

      {/* Toolbar */}
      <div className="mes-toolbar">
        <button className="mes-tb-btn" onClick={handleSearch} disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Tìm kiếm</span>
        </button>
        <button className="mes-tb-btn" onClick={exportExcel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Filterbar */}
      <div className="mes-filterbar">
        {/* Lọc chung: Kho */}
        <div className="mes-fb-group">
          <span className="mes-fb-label">Kho hàng:</span>
          <select className="mes-select" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">— Chọn kho —</option>
            {stores.map((s, idx) => (
              <option key={s.storeId || idx} value={s.storeId}>{s.storeName || s.storeId}</option>
            ))}
          </select>
        </div>

        {/* Lọc chung: Máy */}
        <div className="mes-fb-group">
          <span className="mes-fb-label">Máy cắt:</span>
          <select className="mes-select" value={maMay} onChange={(e) => setMaMay(e.target.value)}>
            <option value="">— Tất cả máy —</option>
            {equipments.map((e, idx) => (
              <option key={e.id || idx} value={e.id}>{e.name || e.id}</option>
            ))}
          </select>
        </div>

        {/* Lọc có điều kiện theo tab */}
        {(activeTab === 'khsx' || activeTab === 'tonghop-id' || activeTab === 'tonghop-may' || activeTab === 'tonghop-khong-may') && (
          <div className="mes-fb-group">
            <span className="mes-fb-label">ID Kế hoạch:</span>
            <input type="text" className="mes-input" value={idKehoach} onChange={(e) => setIdKehoach(e.target.value)} placeholder="Nhập ID Kế hoạch" />
          </div>
        )}

        {activeTab === 'khsx-thang' && (
          <div className="mes-fb-group">
            <span className="mes-fb-label">KH Tháng (yyyyMM):</span>
            <input type="number" className="mes-input" value={monthlyPlan} onChange={(e) => setMonthlyPlan(e.target.value)} placeholder="Ví dụ: 202604" />
          </div>
        )}

        {activeTab === 'theo-xe' && (
          <div className="mes-fb-group">
            <span className="mes-fb-label">Mã Ca (yyyyMMddCa):</span>
            <input type="text" className="mes-input" value={yearMonthDayShift} onChange={(e) => setYearMonthDayShift(e.target.value)} placeholder="Ví dụ: 202604161" />
          </div>
        )}

        {(activeTab === 'theo-xe-range' || activeTab === 'tonghop-id' || activeTab === 'tonghop-may' || activeTab === 'tonghop-khong-may') && (
          <>
            <div className="mes-fb-group">
              <span className="mes-fb-label">Ca bắt đầu:</span>
              <input type="text" className="mes-input" value={startShift} onChange={(e) => setStartShift(e.target.value)} placeholder="Ví dụ: 202604161" />
            </div>
            <div className="mes-fb-group">
              <span className="mes-fb-label">Ca kết thúc:</span>
              <input type="text" className="mes-input" value={endShift} onChange={(e) => setEndShift(e.target.value)} placeholder="Ví dụ: 202604163" />
            </div>
          </>
        )}
      </div>

      {/* Table Area */}
      <div className="mes-table-area">
        <div className="mes-table-wrap">
          <table className="mes-table">
            <thead>
              {activeTab === 'khsx' || activeTab === 'khsx-thang' ? (
                <tr>
                  <th>ID Kế hoạch</th>
                  <th>Kho</th>
                  <th>Ký hiệu BTP</th>
                  <th>Tên BTP</th>
                  <th>Mã Máy</th>
                  <th>Tên Máy</th>
                  <th>Ca SX</th>
                  <th>SL Kế Hoạch</th>
                  <th>SL Điều Chỉnh</th>
                  <th>SL Thực Tế</th>
                  <th>SL Thiếu</th>
                  <th>Ghi chú</th>
                </tr>
              ) : (
                <tr>
                  <th>STT</th>
                  <th>Ký hiệu BTP</th>
                  <th>Tên BTP</th>
                  <th>Số Lượng SX</th>
                  <th>Mã Máy</th>
                  <th>Đơn Vị Tính</th>
                  <th>Ghi chú</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center", padding: "20px" }}>Đang tải báo cáo...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center", padding: "20px" }}>Không có dữ liệu</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx}>
                    {activeTab === 'khsx' || activeTab === 'khsx-thang' ? (
                      <>
                        <td style={{ fontWeight: 'bold' }}>{row.idKehoach || row.ID_Kehoach}</td>
                        <td>{row.storeName || row.StoreName || row.storeId}</td>
                        <td>{row.kyHieuBtp || row.KyHieu_BTP}</td>
                        <td>{row.tenBtp || row.Ten_BTP}</td>
                        <td>{row.maMay || row.MaMay}</td>
                        <td>{row.tenMay || row.TenMay}</td>
                        <td>{row.caSx || row.CaSX}</td>
                        <td>{row.soLuongKh || row.SoLuong_KH}</td>
                        <td>{row.soLuongKhDieuChinh || row.SoLuong_KH_DieuChinh}</td>
                        <td style={{ color: "#166534", fontWeight: "bold" }}>{row.soLuongSx || row.SoLuong_SX}</td>
                        <td style={{ color: "#b91c1c", fontWeight: "bold" }}>{row.soLuongThieu || row.SoLuong_Thieu}</td>
                        <td>{row.note || row.Note || ""}</td>
                      </>
                    ) : (
                      <>
                        <td>{row.stt || row.STT || idx + 1}</td>
                        <td>{row.kyHieuBtp || row.KyHieu_BTP}</td>
                        <td>{row.tenBtp || row.Ten_BTP}</td>
                        <td style={{ color: "#166534", fontWeight: "bold" }}>{row.soLuongSx || row.SoLuong_SX || row.Soluong_BCP}</td>
                        <td>{row.maMay || row.MaMay || "—"}</td>
                        <td>{row.donViTinh || row.DonViTinh || "m"}</td>
                        <td>{row.note || row.Note || ""}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BaoCaoCatVai;
