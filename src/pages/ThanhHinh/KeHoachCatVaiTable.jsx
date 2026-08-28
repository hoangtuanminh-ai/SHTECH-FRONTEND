// src/pages/ThanhHinh/KeHoachCatVaiTable.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { getKeHoachCatVai, getCatVaiStores } from "../../api/catVaiApi";

const css = `
  .mes-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #e0eaf4;
    font-family: 'Segoe UI', Tahoma, sans-serif;
    color: #1a3a5c;
  }
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
  .mes-tb-btn:active { background: #a0bcd4; }
  .mes-tb-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .mes-tb-btn svg { width: 20px; height: 20px; }
  .mes-tb-btn span { font-size: 11px; font-weight: 600; }
  .mes-tb-sep { width: 1px; height: 35px; background: #96afc8; margin: 0 5px; }
  .mes-filterbar {
    background: #d4e4f4;
    border-bottom: 1px solid #96afc8;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .mes-fb-group { display: flex; align-items: center; gap: 5px; }
  .mes-fb-label { font-size: 12px; font-weight: 700; color: #1a3a5c; }
  .mes-input, .mes-select {
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
  .mes-pagination {
    background: #eaf0f8;
    border-top: 1px solid #b8cce0;
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
  }
  .mes-page-btn {
    padding: 2px 8px;
    border: 1px solid #96afc8;
    background: #fff;
    cursor: pointer;
    border-radius: 2px;
    font-size: 11px;
  }
  .mes-page-btn:hover:not(:disabled) { background: #d4eaf8; }
  .mes-page-btn:disabled { opacity: 0.4; }
  .mes-badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 700; }
  .mes-badge-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .mes-badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
`;

function KeHoachCatVaiTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchDate, setSearchDate] = useState("");
  const [searchShift, setSearchShift] = useState("1");

  // Tự động ghép date & shift thành searchKey (yyyyMMddCa) mỗi khi thay đổi
  useEffect(() => {
    if (searchDate) {
      const formattedDate = searchDate.replace(/-/g, ""); // yyyy-MM-dd -> yyyyMMdd
      setSearchKey(formattedDate + searchShift);
    } else {
      setSearchKey("");
    }
  }, [searchDate, searchShift]);

  const fetchKeHoach = async () => {
    setLoading(true);
    try {
      console.log(`Fetching kehoach cat vai: searchKey=${searchKey}, page=${page}, size=${size}`);
      const res = await getKeHoachCatVai(searchKey, page, size);
      if (res && res.success) {
        setData(res.data || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
      } else {
        toast.error(res.message || "Lấy dữ liệu thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeHoach();
  }, [page, size]);

  const handleSearch = () => {
    setPage(0);
    fetchKeHoach();
  };

  const exportExcel = () => {
    if (!data.length) {
      toast.warn("Không có dữ liệu để xuất");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kế hoạch cắt vải");
    XLSX.writeFile(wb, "KeHoachCatVai.xlsx");
    toast.success("Xuất excel thành công");
  };

  return (
    <div className="mes-container">
      <style>{css}</style>
      
      {/* Toolbar */}
      <div className="mes-toolbar">
        <button className="mes-tb-btn" onClick={fetchKeHoach} disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Làm mới</span>
        </button>
        <button className="mes-tb-btn" onClick={exportExcel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Filterbar */}
      <div className="mes-filterbar">
        <div className="mes-fb-group">
          <span className="mes-fb-label">Ngày sản xuất:</span>
          <input
            type="date"
            className="mes-input"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
        <div className="mes-fb-group">
          <span className="mes-fb-label">Ca:</span>
          <select className="mes-select" value={searchShift} onChange={(e) => setSearchShift(e.target.value)}>
            <option value="1">Ca 1</option>
            <option value="2">Ca 2</option>
            <option value="3">Ca 3</option>
          </select>
        </div>
        {searchKey && (
          <div className="mes-fb-group" style={{ background: '#fff', padding: '0 8px', border: '1px solid #6890b0', borderRadius: '2px', height: '24px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#5a7a9a' }}>Mã truyền đi: </span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a3a5c', marginLeft: '5px' }}>{searchKey}</span>
          </div>
        )}
        <button className="mes-input" style={{ background: "#1565c0", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }} onClick={handleSearch}>
          Tìm kiếm
        </button>
      </div>

      {/* Table Area */}
      <div className="mes-table-area">
        <div className="mes-table-wrap">
          <table className="mes-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>ID Kế hoạch</th>
                <th>Tên BTP</th>
                <th>Ký hiệu BTP</th>
                <th>Loại BTP</th>
                <th>Máy</th>
                <th>Số lượng KH</th>
                <th>SL KH Điều chỉnh</th>
                <th>Số lượng SX</th>
                <th>Số lượng Thiếu</th>
                <th>Kho</th>
                <th>Ca SX</th>
                <th>Ngày SX</th>
                <th>Tình trạng Nhập</th>
                <th>Nhân viên Lập</th>
                <th>Phiếu Nhập</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="17" style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="17" style={{ textAlign: "center", padding: "20px" }}>Không có dữ liệu</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td>{row.stt || idx + 1 + page * size}</td>
                    <td style={{ fontWeight: "bold" }}>{row.idKehoach}</td>
                    <td>{row.tenBtp}</td>
                    <td>{row.kyHieuBtp}</td>
                    <td>{row.loaiBtp}</td>
                    <td>{row.tenMay || row.maMay}</td>
                    <td>{row.soLuongKh}</td>
                    <td>{row.soLuongKhDieuChinh}</td>
                    <td style={{ color: "#166534", fontWeight: "bold" }}>{row.soLuongSx}</td>
                    <td style={{ color: "#b91c1c", fontWeight: "bold" }}>{row.soLuongThieu}</td>
                    <td>{row.storeName || row.storeId}</td>
                    <td>{row.caSx}</td>
                    <td>{row.ngaySxDateTime ? new Date(row.ngaySxDateTime).toLocaleDateString("vi-VN") : `${row.ngaySx}/${row.thangSx}/${row.namSx}`}</td>
                    <td>
                      <span className={`mes-badge ${row.tinhTrangNhapKho === "Đã nhập" ? "mes-badge-green" : "mes-badge-red"}`}>
                        {row.tinhTrangNhapKho || "Chưa nhập"}
                      </span>
                    </td>
                    <td>{row.tenNvLap || row.maNvLap}</td>
                    <td>{row.phieuNhapKho || "—"}</td>
                    <td>{row.note || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mes-pagination">
          <div>Tổng số: <strong>{totalElements}</strong> bản ghi</div>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button className="mes-page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Trang trước</button>
            <span>Trang {page + 1} / {totalPages || 1}</span>
            <button className="mes-page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Trang sau</button>
            
            <select className="mes-select" style={{ height: "22px", padding: "0 2px" }} value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeHoachCatVaiTable;
