// src/pages/ThanhHinh/BaoCaoTongHopTheoCaMay.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { getTongHopTheoMay, getCatVaiStores, getCatVaiEquipments } from '../../api/catVaiApi';

const css = `
  .mes-container { display: flex; flex-direction: column; height: 100vh; background: #e0eaf4; font-family: 'Segoe UI', sans-serif; color: #1a3a5c; position: relative; }
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

  /* Style cho popup báo cáo tổng hợp */
  .report-modal-overlay {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  }
  .report-modal-container {
    background: #fff; border: 2px solid #6890b0; border-radius: 4px;
    width: 90%; max-width: 900px; max-height: 90vh;
    display: flex; flex-direction: column;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    font-family: 'Times New Roman', Times, serif; color: #000;
  }
  .report-modal-header {
    background: #f0f6fc; border-bottom: 1px solid #96afc8;
    padding: 8px 15px; display: flex; justify-content: space-between; align-items: center;
    font-family: 'Segoe UI', sans-serif;
  }
  .report-modal-header h3 { margin: 0; font-size: 14px; font-weight: bold; color: #1565c0; }
  .report-modal-body {
    flex: 1; overflow-y: auto; padding: 25px 35px; background: #fafafa;
  }
  .report-modal-footer {
    background: #f0f6fc; border-top: 1px solid #96afc8;
    padding: 8px 15px; display: flex; justify-content: flex-end; gap: 10px;
    font-family: 'Segoe UI', sans-serif;
  }

  /* Layout in ấn */
  .print-page { background: #fff; width: 100%; margin: 0 auto; }
  .print-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
  .print-header-left { text-align: center; font-size: 11px; line-height: 1.4; font-weight: bold; }
  .print-header-right { text-align: center; font-size: 11px; line-height: 1.4; color: #888; }
  .print-title { text-align: center; margin: 15px 0; }
  .print-title h2 { margin: 0 0 5px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; }
  .print-title p { margin: 0; font-size: 12px; }
  .print-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
  .print-table th { border: 1px solid #000; padding: 5px 3px; font-weight: bold; text-align: center; }
  .print-table td { border: 1px solid #000; padding: 4px 5px; }
  .print-sign-row { display: flex; justify-content: space-between; margin-top: 30px; font-size: 12px; font-weight: bold; }
  .print-sign-box { text-align: center; width: 180px; }
  .print-sign-box p { margin: 0; }
  /* CSS hỗ trợ in PDF chuẩn */
  @media print {
    body * { visibility: hidden; }
    .report-modal-overlay { position: absolute; left: 0; top: 0; width: 100%; height: auto; background: none; z-index: 99999; }
    .report-modal-container { border: none; box-shadow: none; width: 100%; max-width: 100%; height: auto; position: absolute; left: 0; top: 0; }
    .report-modal-header, .report-modal-footer { display: none !important; }
    .report-modal-body { padding: 0 !important; background: #fff !important; overflow: visible !important; }
    .print-page, .print-page * { visibility: visible; }
    .print-table th { background: #fff !important; color: #000 !important; }
  }
`;

function BaoCaoTongHopTheoCaMay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idKehoach, setIdKehoach] = useState('');
  const [storeId, setStoreId] = useState('');
  const [maMay, setMaMay] = useState('');
  const [startShift, setStartShift] = useState('');
  const [endShift, setEndShift] = useState('');
  const [stores, setStores] = useState([]);
  const [equipments, setEquipments] = useState([]);

  // Popup xuất báo cáo
  const [showReportPopup, setShowReportPopup] = useState(false);

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
    if (!storeId || !startShift || !endShift) {
      toast.error("Vui lòng chọn Kho, Ca bắt đầu và Ca kết thúc");
      return;
    }
    setLoading(true);
    try {
      console.log(`Searching BaoCaoTongHopTheoCaMay: idKehoach=${idKehoach}, startShift=${startShift}, endShift=${endShift}, storeId=${storeId}, maMay=${maMay}`);
      const res = await getTongHopTheoMay(idKehoach || '%', Number(startShift), Number(endShift), storeId, maMay || '%');
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
    XLSX.utils.book_append_sheet(wb, ws, "Tổng Hợp Theo Ca Máy");
    XLSX.writeFile(wb, "BaoCao_TongHop_TheoCaMay.xlsx");
    toast.success("Xuất file Excel thành công");
  };

  const [startDate, setStartDate] = useState("");
  const [startShiftVal, setStartShiftVal] = useState("1");
  const [endDate, setEndDate] = useState("");
  const [endShiftVal, setEndShiftVal] = useState("3");

  useEffect(() => {
    if (startDate) {
      setStartShift(startDate.replace(/-/g, "") + startShiftVal);
    } else {
      setStartShift("");
    }
  }, [startDate, startShiftVal]);

  useEffect(() => {
    if (endDate) {
      setEndShift(endDate.replace(/-/g, "") + endShiftVal);
    } else {
      setEndShift("");
    }
  }, [endDate, endShiftVal]);

  // Tính tổng số lượng
  const totalQuantity = data.reduce((acc, cur) => acc + (Number(cur.soLuongSx || cur.SoLuong_SX) || 0), 0);

  // Helper hiển thị ngày tháng tiếng Việt cho tiêu đề báo cáo
  const formatVietnameseDate = (dateStr) => {
    if (!dateStr || dateStr.length < 8) return "";
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    return `ngày ${Number(d)} tháng ${Number(m)} năm ${y}`;
  };

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

  return (
    <div className="mes-container">
      <style>{css}</style>
      <div className="mes-toolbar">
        <button className="mes-tb-btn" onClick={handleSearch} disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Tìm kiếm</span>
        </button>
        <button className="mes-tb-btn" onClick={() => {
          if (!data.length) {
            toast.error("Vui lòng thực hiện tìm kiếm dữ liệu trước khi xuất báo cáo");
            return;
          }
          setShowReportPopup(true);
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span>Xuất Báo Cáo</span>
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
        <div className="mes-fb-group">
          <span className="mes-fb-label">Từ ngày:</span>
          <input type="date" className="mes-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="mes-fb-label" style={{ marginLeft: 3 }}>Ca:</span>
          <select className="mes-select" value={startShiftVal} onChange={(e) => setStartShiftVal(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Đến ngày:</span>
          <input type="date" className="mes-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <span className="mes-fb-label" style={{ marginLeft: 3 }}>Ca:</span>
          <select className="mes-select" value={endShiftVal} onChange={(e) => setEndShiftVal(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>

      <div className="mes-table-area">
        <div className="mes-table-wrap">
          <table className="mes-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ký hiệu BTP</th>
                <th>Tên BTP</th>
                <th>Số Lượng SX</th>
                <th>Mã Máy</th>
                <th>Đơn Vị Tính</th>
                <th>Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>Đang tải báo cáo...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>Không có dữ liệu</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.stt || row.STT || idx + 1}</td>
                    <td>{row.kyHieuBtp || row.KyHieu_BTP}</td>
                    <td>{row.tenBtp || row.Ten_BTP}</td>
                    <td style={{ color: "#166534", fontWeight: "bold" }}>{row.soLuongSx || row.SoLuong_SX}</td>
                    <td>{row.maMay || row.MaMay || "—"}</td>
                    <td>{row.donViTinh || row.DonViTinh || "m"}</td>
                    <td>{row.note || row.Note || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT PREVIEW MODAL */}
      {showReportPopup && (
        <div className="report-modal-overlay">
          <div className="report-modal-container">
            <div className="report-modal-header">
              <h3>Xem trước Báo cáo Tổng hợp Sản xuất Công đoạn Cắt vải</h3>
              <button 
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', fontWeight: 'bold' }} 
                onClick={() => setShowReportPopup(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="report-modal-body">
              <div className="print-page">
                <div className="print-header">
                  <div className="print-header-left">
                    CÔNG TY CP CAO SU ĐÀ NẴNG<br/>
                    XN LỐP RADIAL
                  </div>
                  <div className="print-header-right" style={{ fontFamily: 'sans-serif' }}>
                    OR.SX.06/BH01
                  </div>
                </div>

                <div className="print-title">
                  <h2>TỔNG HỢP SẢN XUẤT CÔNG ĐOẠN CẮT VẢI</h2>
                  <p>Từ ca {startShiftVal} {formatVietnameseDate(startShift)} đến ca {endShiftVal} {formatVietnameseDate(endShift)}</p>
                </div>

                <table className="print-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>STT</th>
                      <th>Tên bán chế phẩm</th>
                      <th>Ký hiệu BCP</th>
                      <th style={{ width: '60px' }}>Mã máy</th>
                      <th style={{ width: '60px' }}>ĐVT</th>
                      <th style={{ width: '90px' }}>Số Lượng</th>
                      <th>GHI CHÚ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center' }}>{row.stt || row.STT || idx + 1}</td>
                        <td>{row.tenBtp || row.Ten_BTP || '—'}</td>
                        <td>{row.kyHieuBtp || row.KyHieu_BTP || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{row.maMay || row.MaMay || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{row.donViTinh || row.DonViTinh || 'm'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{(row.soLuongSx || row.SoLuong_SX || 0).toLocaleString('vi-VN')}</td>
                        <td>{row.note || row.Note || ''}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold' }}>
                      <td colSpan="2" style={{ textAlign: 'center' }}>TỔNG CỘNG</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>{totalQuantity.toLocaleString('vi-VN')}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                <div className="print-sign-row">
                  <div className="print-sign-box">
                    <p>...............</p>
                  </div>
                  <div className="print-sign-box">
                    <p>...............</p>
                  </div>
                  <div className="print-sign-box">
                    <p>NGƯỜI LẬP</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-modal-footer">
              <button 
                className="mes-input" 
                style={{ background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} 
                onClick={() => window.print()}
              >
                In báo cáo (PDF)
              </button>
              <button 
                className="mes-input" 
                style={{ background: '#1565c0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} 
                onClick={exportExcel}
              >
                Tải Excel
              </button>
              <button 
                className="mes-input" 
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', cursor: 'pointer' }} 
                onClick={() => setShowReportPopup(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BaoCaoTongHopTheoCaMay;
