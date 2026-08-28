// src/pages/ThanhHinh/BaoCaoKHSXCatVaiCa.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { getBaoCaoKHSXCatVai, getCatVaiStores, getCatVaiEquipments } from '../../api/catVaiApi';

const css = `
  .mes-container { display: flex; flex-direction: column; height: 100vh; background: #e0eaf4; font-family: 'Segoe UI', sans-serif; color: #1a3a5c; }
  .mes-toolbar { background: linear-gradient(180deg, #f0f4f8 0%, #d8e4f0 100%); border-bottom: 2px solid #96afc8; padding: 4px 8px; display: flex; align-items: center; gap: 1px; flex-shrink: 0; }
  .mes-tb-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px 10px; min-width: 58px; border: 1px solid transparent; border-radius: 3px; background: transparent; cursor: pointer; color: #1e3a5c; transition: background 0.1s; }
  .mes-tb-btn:hover { background: #c0d4e8; border-color: #80a8c8; }
  .mes-tb-btn:disabled { opacity: 0.45; }
  .mes-tb-btn svg { width: 20px; height: 20px; }
  .mes-tb-btn span { font-size: 11px; font-weight: 600; }
  .mes-filterbar { background: #d4e4f4; border-bottom: 1px solid #96afc8; padding: 8px 10px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-fb-label { font-size: 11px; font-weight: 700; color: #1a3a5c; white-space: nowrap; }
  .mes-input, .mes-select { border: 1px solid #6890b0; background: #fff; padding: 2px 6px; font-size: 12px; font-weight: 600; color: #1a3a5c; border-radius: 2px; height: 24px; }
  .mes-table-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .mes-table-wrap { flex: 1; overflow: auto; background: #fff; }
  .mes-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .mes-table thead tr { background: #ccdeed; position: sticky; top: 0; z-index: 1; }
  .mes-table thead th { padding: 6px 8px; text-align: left; font-size: 11px; font-weight: 700; color: #1a3a5c; border-right: 1px solid #96afc8; border-bottom: 2px solid #6890b0; white-space: nowrap; }
  .mes-table tbody tr { border-bottom: 1px solid #d8e8f4; }
  .mes-table tbody tr:nth-child(even) { background: #eef5fc; }
  .mes-table tbody tr:hover { background: #d4eaf8 !important; }
  .mes-table tbody td { padding: 5px 8px; border-right: 1px solid #d8e8f4; color: #1a3a5c; white-space: nowrap; }
`;

function BaoCaoKHSXCatVaiCa() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idKehoach, setIdKehoach] = useState('');
  const [storeId, setStoreId] = useState('');
  const [maMay, setMaMay] = useState('');
  const [stores, setStores] = useState([]);
  const [equipments, setEquipments] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [s, e] = await Promise.all([getCatVaiStores(), getCatVaiEquipments()]);
        // log dữ liệu ra console để kiểm tra lỗi theo quy tắc 3
        console.log("getCatVaiStores response:", s);
        console.log("getCatVaiEquipments response:", e);
        
        if (s && s.success) {
          setStores(s.data || []);
        } else if (Array.isArray(s)) {
          setStores(s);
        }
        
        if (e && e.success) {
          setEquipments(e.data || []);
        } else if (Array.isArray(e)) {
          setEquipments(e);
        }
      } catch (err) {
        console.error("Lỗi meta:", err);
      }
    };
    fetchMeta();
  }, []);

  const [idDate, setIdDate] = useState("");
  const [idShiftVal, setIdShiftVal] = useState("1");

  // Tự động ghép idKehoach = [storeId].[idDate_yyyyMMdd][idShiftVal] khi thay đổi
  useEffect(() => {
    if (storeId && idDate) {
      const formattedDate = idDate.replace(/-/g, "");
      setIdKehoach(`${storeId}.${formattedDate}${idShiftVal}`);
    } else {
      setIdKehoach("");
    }
  }, [storeId, idDate, idShiftVal]);

  const handleSearch = async () => {
    if (!storeId) {
      toast.error("Vui lòng chọn Kho");
      return;
    }
    // idKehoach không bắt buộc, nếu rỗng thì gửi chuỗi rỗng đi
    const queryIdKehoach = idKehoach || "";
    setLoading(true);
    try {
      console.log(`Searching BaoCaoKHSXCatVaiCa: idKehoach=${queryIdKehoach}, storeId=${storeId}, maMay=${maMay}`);
      const res = await getBaoCaoKHSXCatVai(queryIdKehoach, storeId, maMay || '%');
      if (res && res.success) {
        setData(res.data || []);
        toast.success(res.message || "Tải dữ liệu thành công");
      } else {
        toast.error(res?.message || "Lỗi tải báo cáo");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!data.length) { toast.warn("Không có dữ liệu"); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KHSX Ca");
    XLSX.writeFile(wb, "BaoCao_KHSX_CatVai_Ca.xlsx");
  };

  return (
    <div className="mes-container">
      <style>{css}</style>
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

      <div className="mes-filterbar">
        <div className="mes-fb-group" style={{ background: 'rgba(21,101,192,0.06)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #b0c4de' }}>
          <span className="mes-fb-label" style={{ color: '#1565c0' }}>Kế hoạch ngày:</span>
          <input type="date" className="mes-input" value={idDate} onChange={(e) => setIdDate(e.target.value)} style={{ borderColor: '#1565c0' }} />
          <span className="mes-fb-label" style={{ marginLeft: 3, color: '#1565c0' }}>Ca:</span>
          <select className="mes-select" value={idShiftVal} onChange={(e) => setIdShiftVal(e.target.value)} style={{ borderColor: '#1565c0' }}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Mã ID ghép:</span>
          <input type="text" className="mes-input" value={idKehoach} readOnly placeholder="Chưa ghép..." style={{ background: '#f1f5f9', cursor: 'not-allowed', width: '130px' }} />
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Kho:</span>
          <select className="mes-select" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">— Chọn kho —</option>
            {stores.map((s, idx) => {
              const code = s.storeId || s.StoreID || s.value || '';
              const name = s.storeName || s.StoreName || s.label || code;
              return <option key={idx} value={code}>{code} — {name}</option>;
            })}
          </select>
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Máy:</span>
          <select className="mes-select" value={maMay} onChange={(e) => setMaMay(e.target.value)}>
            <option value="">— Tất cả máy —</option>
            {equipments.map((e, idx) => {
              const id = e.Mamay || e.maMay || e.MaMay || e.EquipmentID || e.EquipmentId || e.id || '';
              const name = e.EquipmentName || e.name || e.tenMay || e.TenMay || id;
              return <option key={idx} value={id}>{name}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="mes-table-area">
        <div className="mes-table-wrap">
          <table className="mes-table">
            <thead>
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
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="12" style={{ textAlign: "center", padding: "20px" }}>Đang tải báo cáo...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="12" style={{ textAlign: "center", padding: "20px" }}>Không có dữ liệu</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx}>
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

export default BaoCaoKHSXCatVaiCa;
