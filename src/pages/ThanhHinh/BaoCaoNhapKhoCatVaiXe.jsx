// src/pages/ThanhHinh/BaoCaoNhapKhoCatVaiXe.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { getBaoCaoTheoXe, getCatVaiStores, getCatVaiEquipments } from '../../api/catVaiApi';

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

function BaoCaoNhapKhoCatVaiXe() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearMonthDayShift, setYearMonthDayShift] = useState('');
  const [storeId, setStoreId] = useState('');
  const [maMay, setMaMay] = useState('');
  const [stores, setStores] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [searchShift, setSearchShift] = useState("1");

  useEffect(() => {
    if (searchDate) {
      const formattedDate = searchDate.replace(/-/g, ""); // yyyy-MM-dd -> yyyyMMdd
      setYearMonthDayShift(formattedDate + searchShift);
    } else {
      setYearMonthDayShift("");
    }
  }, [searchDate, searchShift]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [s, e] = await Promise.all([getCatVaiStores(), getCatVaiEquipments()]);
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

  const handleSearch = async () => {
    if (!yearMonthDayShift || !storeId) {
      toast.error("Vui lòng chọn Ngày sản xuất, Ca và chọn Kho");
      return;
    }
    setLoading(true);
    try {
      console.log(`Searching BaoCaoNhapKhoCatVaiXe: yearMonthDayShift=${yearMonthDayShift}, storeId=${storeId}, maMay=${maMay}`);
      const res = await getBaoCaoTheoXe(yearMonthDayShift, storeId, maMay || '%');
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
    XLSX.utils.book_append_sheet(wb, ws, "Nhập BCP Theo Xe");
    XLSX.writeFile(wb, "BaoCao_NhapKho_CatVai_TheoXe.xlsx");
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
        <div className="mes-fb-group">
          <span className="mes-fb-label">Ngày sản xuất:</span>
          <input type="date" className="mes-input" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Ca:</span>
          <select className="mes-select" value={searchShift} onChange={(e) => setSearchShift(e.target.value)}>
            <option value="1">Ca 1</option>
            <option value="2">Ca 2</option>
            <option value="3">Ca 3</option>
          </select>
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
                <th>STT</th>
                <th>Mã Barcode BCP</th>
                <th>Ký hiệu BTP</th>
                <th>Tên BTP</th>
                <th>Mã Xe Cuộn</th>
                <th>Số Lượng BCP</th>
                <th>Mã Máy</th>
                <th>Tên Máy</th>
                <th>Ca SX</th>
                <th>Ngày SX</th>
                <th>Người Nhập</th>
                <th>Phiếu Nhập</th>
                <th>Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="13" style={{ textAlign: "center", padding: "20px" }}>Đang tải báo cáo...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="13" style={{ textAlign: "center", padding: "20px" }}>Không có dữ liệu</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 'bold' }}>{row.barcodeBcp || row.Barcode_BCP}</td>
                    <td>{row.kyHieuBtp || row.KyHieu_BTP}</td>
                    <td>{row.tenBtp || row.Ten_BTP}</td>
                    <td>{row.maXeCuon || row.MaXe_Cuon}</td>
                    <td style={{ color: "#166534", fontWeight: "bold" }}>{row.soluongBcp || row.Soluong_BCP}</td>
                    <td>{row.maMay || row.MaMay}</td>
                    <td>{row.tenMay || row.TenMay}</td>
                    <td>{row.caSx || row.CaSX}</td>
                    <td>{row.ngaySx ? new Date(row.ngaySx).toLocaleDateString("vi-VN") : ""}</td>
                    <td>{row.tenNvNhap || row.TenNV_Nhap}</td>
                    <td>{row.phieuNhapKho || row.PhieuNhapKho || "—"}</td>
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

export default BaoCaoNhapKhoCatVaiXe;
