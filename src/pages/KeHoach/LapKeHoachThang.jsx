import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
    getDropdownStore, 
    getDropdownUsers, 
    getDropdownQuyCach, 
    saveKeHoachThang 
} from '../../api/keHoachThangApi';

const LapKeHoachThang = () => {
    // Phòng thủ lỗi destructure userInfo
    const auth = useAuth() || {};
    const { userInfo } = auth;

    // --- STATE HEADER & CÁC TRƯỜNG KỸ THUẬT (BÊN PHẢI ẢNH) ---
    const [header, setHeader] = useState({
        khsxThang: '05/2026',
        lan: '1',
        idKehoachDisplay: 'RA10.202605.',
        idKehoachReal: 'RA10.202605',
        maNguoiLap: 'C02',
        tenNguoiLap: 'Lê Đức Dũng',
        maKho: 'RA10',
        tenKho: 'Kho Lốp Thành Hình',
        ngayLap: '13/05/2026',
        maMayTh: '01',
        tenMayTh: 'ORC-TH-01',
        maQuyCachSelected: '',
        tenQuyCachSelected: '',
        ghiChuChung: '',
        
        // CÁC TRƯỜNG KỸ THUẬT MỚI BỔ SUNG
        soLuong: 0,      // Số lượng tổng (tự tính từ 31 ô đỏ)
        stt: '',         // STT
        sksx: '',        // SKSX
        quyCachDetail: '', // Ô Quy Cách (chi tiết)
        htd: '',         // HTD
        capTocDo: '',    // Cấp tốc độ
        hoaLop: '',      // Hoa Lốp
        soPr: '',        // Số PR
        taiTrong: '',    // Tải trọng
        stk: '',         // STK (nằm ở dòng KH)
        lac: ''          // Lắc (nằm ở dòng Ghi chú)
    });

    const [quickInputDays, setQuickInputDays] = useState(Array(31).fill(0));
    const [rows, setRows] = useState([]);
    const [stores, setStores] = useState([]);
    const [users, setUsers] = useState([]);
    const [quyCachList, setQuyCachList] = useState([]);

    // Load danh mục
    useEffect(() => {
        const loadInit = async () => {
            const [s, u, q] = await Promise.all([getDropdownStore(), getDropdownUsers(), getDropdownQuyCach()]);
            setStores(s || []);
            setUsers(u || []);
            setQuyCachList(q || []);
            if (userInfo) {
                setHeader(prev => ({ ...prev, maNguoiLap: userInfo.userId || 'C02', tenNguoiLap: userInfo.fullName || 'Lê Đức Dũng' }));
            }
        };
        loadInit();
    }, [userInfo]);

    // Handler thay đổi ô nhập 31 ngày (ô đỏ)
    const handleQuickDayChange = (idx, val) => {
        const newDays = [...quickInputDays];
        newDays[idx] = parseInt(val) || 0;
        setQuickInputDays(newDays);
        
        // Tự động cộng tổng vào ô "Số lượng"
        const total = newDays.reduce((a, b) => a + b, 0);
        setHeader(prev => ({ ...prev, soLuong: total }));
    };

    // Khi chọn Quy cách, tự điền các thông số kỹ thuật
    const handleSelectQuyCach = (val) => {
        const q = quyCachList.find(x => x.MaquycachLop === val);
        setHeader(prev => ({
            ...prev,
            maQuyCachSelected: val,
            tenQuyCachSelected: q?.Ten_QuyCach || '',
            quyCachDetail: q?.Ten_QuyCach || '',
            htd: q?.HTD || '',
            hoaLop: q?.HoaLop || '',
            soPr: q?.SoPR || '',
            capTocDo: q?.CapTocDo || '',
            taiTrong: q?.CapTaiTrong || ''
        }));
    };

    const addRowToGrid = () => {
        if (!header.maQuyCachSelected) return toast.warning("Chưa chọn Quy cách!");
        const newRow = {
            stt: rows.length + 1,
            maQuyCach: header.maQuyCachSelected,
            tenQuyCach: header.tenQuyCachSelected,
            maMay: header.maMayTh,
            giaTriNgay: [...quickInputDays],
            tongKh: header.soLuong,
            htd: header.htd, hoaLop: header.hoaLop, soPr: header.soPr,
            stk: header.stk, lac: header.lac, sksx: header.sksx,
            ghiChu: header.ghiChuChung
        };
        setRows([...rows, newRow]);
        toast.success("Đã thêm vào Grid");
    };

    return (
        <div className="mes-container">
            <style>{mesStyle}</style>

            {/* TOOLBAR */}
            <div className="mes-toolbar">
                <div className="mes-tb-btn" onClick={() => toast.info("Đang xử lý lưu...")}><span>Lưu</span></div>
                <div className="mes-tb-btn" onClick={() => window.location.reload()}><span>Làm tươi</span></div>
            </div>

            <div className="mes-content">
                <div className="mes-section">
                    {/* HÀNG TRÊN CÙNG: THÔNG TIN CHUNG & KỸ THUẬT */}
                    <div className="header-form-container">
                        {/* Cột trái */}
                        <div className="col-1">
                            <div className="mes-field"><span className="lbl">KHSX Tháng:</span><input className="mes-in" value={header.khsxThang} readOnly /></div>
                            <div className="mes-field"><span className="lbl">Mã người lập:</span><input className="mes-in" value={header.maNguoiLap} readOnly /></div>
                            <div className="mes-field"><span className="lbl">Mã Kho:</span><input className="mes-in" value={header.maKho} readOnly /></div>
                        </div>

                        {/* Cột giữa */}
                        <div className="col-2">
                            <div className="mes-field">
                                <span className="lbl">Máy TH:</span>
                                <input className="mes-in" style={{width: 50}} value={header.maMayTh} onChange={e => setHeader({...header, maMayTh: e.target.value})} />
                                <input className="mes-in readonly" style={{flex: 1}} value={header.tenMayTh} readOnly />
                            </div>
                            <div className="mes-field">
                                <span className="lbl">Quy cách:</span>
                                <input className="mes-in" style={{width: 50}} list="qc-list" onChange={e => handleSelectQuyCach(e.target.value)} />
                                <input className="mes-in readonly" style={{flex: 1}} value={header.tenQuyCachSelected} readOnly />
                            </div>
                            <div className="mes-field">
                                <span className="lbl">Ngày lập:</span>
                                <input className="mes-in" style={{width: 100}} value={header.ngayLap} />
                                <button className="mes-btn-blue" onClick={addRowToGrid}>Lưu mới KH</button>
                            </div>
                        </div>

                        {/* CỘT PHẢI: CHI TIẾT KỸ THUẬT (ĐÚNG NHƯ ẢNH) */}
                        <div className="col-3">
                            <div className="f-row">
                                <div className="f-item"><span className="ls">Số Lượng:</span><input className="mes-in b-blue" value={header.soLuong} readOnly /></div>
                                <div className="f-item"><span className="ls">STT:</span><input className="mes-in" value={header.stt} onChange={e => setHeader({...header, stt: e.target.value})} /></div>
                                <div className="f-item"><span className="ls">SKSX:</span><input className="mes-in" value={header.sksx} onChange={e => setHeader({...header, sksx: e.target.value})} /></div>
                            </div>
                            <div className="f-row">
                                <div className="f-item"><span className="ls">Quy Cách:</span><input className="mes-in" value={header.quyCachDetail} onChange={e => setHeader({...header, quyCachDetail: e.target.value})} /></div>
                                <div className="f-item"><span className="ls">HTD:</span><input className="mes-in" value={header.htd} onChange={e => setHeader({...header, htd: e.target.value})} /></div>
                                <div className="f-item"><span className="ls">Cấp tốc độ:</span><input className="mes-in" value={header.capTocDo} onChange={e => setHeader({...header, capTocDo: e.target.value})} /></div>
                            </div>
                            <div className="f-row">
                                <div className="f-item"><span className="ls">Hoa Lốp:</span><input className="mes-in" value={header.hoaLop} onChange={e => setHeader({...header, hoaLop: e.target.value})} /></div>
                                <div className="f-item"><span className="ls">Số PR:</span><input className="mes-in" value={header.soPr} onChange={e => setHeader({...header, soPr: e.target.value})} /></div>
                                <div className="f-item"><span className="ls">Tải trọng:</span><input className="mes-in" value={header.taiTrong} onChange={e => setHeader({...header, taiTrong: e.target.value})} /></div>
                            </div>
                        </div>
                    </div>

                    {/* PANEL NHẬP 31 NGÀY (DÃY Ô ĐỎ) */}
                    <div className="quick-input-panel">
                        <div className="day-labels">
                            <span className="title-label">Ngày SX:</span>
                            {quickInputDays.map((_, i) => <span key={i} className="d-num">({i+1})</span>)}
                        </div>
                        <div className="day-inputs">
                            <span className="title-label" style={{fontWeight: 'bold'}}>KH:</span>
                            {quickInputDays.map((val, i) => (
                                <input key={i} className="in-red" value={val} onChange={e => handleQuickDayChange(i, e.target.value)} />
                            ))}
                            <span className="ls" style={{marginLeft: 10}}>STK:</span>
                            <input className="mes-in" style={{width: 60}} value={header.stk} onChange={e => setHeader({...header, stk: e.target.value})} />
                        </div>
                        <div className="ghi-chu-row">
                            <span className="title-label">Ghi chú:</span>
                            <input className="mes-in" style={{flex: 1}} value={header.ghiChuChung} onChange={e => setHeader({...header, ghiChuChung: e.target.value})} />
                            <span className="ls" style={{marginLeft: 10}}>Lắc:</span>
                            <input className="mes-in" style={{width: 60}} value={header.lac} onChange={e => setHeader({...header, lac: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* BẢNG GRID KẾT QUẢ */}
                <div className="grid-result">
                    <table className="mes-table">
                        <thead>
                            <tr>
                                <th width="30">STT</th><th>Tên Quy Cách Lốp</th><th width="50">Máy</th>
                                {[...Array(31)].map((_, i) => <th key={i} width="28">{i + 1}</th>)}
                                <th width="50">KH</th><th>HTD</th><th>Hoa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i}>
                                    <td align="center">{r.stt}</td>
                                    <td>{r.tenQuyCach}</td>
                                    <td align="center">{r.maMay}</td>
                                    {r.giaTriNgay.map((v, idx) => <td key={idx} align="center">{v}</td>)}
                                    <td align="right" style={{fontWeight: 'bold', color: 'blue'}}>{r.tongKh}</td>
                                    <td>{r.htd}</td><td>{r.hoaLop}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <datalist id="qc-list">
                {quyCachList.map(q => <option key={q.MaquycachLop} value={q.MaquycachLop}>{q.Ten_QuyCach}</option>)}
            </datalist>
        </div>
    );
};

const mesStyle = `
    .mes-container { display: flex; flex-direction: column; height: 100vh; background: #cce0ff; font-family: 'Segoe UI', Arial; }
    .mes-toolbar { background: #f0f4f8; border-bottom: 1px solid #999; padding: 4px 10px; display: flex; gap: 10px; }
    .mes-tb-btn { border: 1px solid #999; padding: 2px 12px; font-size: 11px; cursor: pointer; background: #eee; font-weight: bold; }
    
    .mes-content { padding: 5px; flex: 1; overflow: auto; }
    .mes-section { border: 1px solid #6699cc; background: #f2f7ff; padding: 8px; margin-bottom: 5px; }
    
    .header-form-container { display: flex; gap: 15px; margin-bottom: 10px; }
    .col-1 { width: 200px; display: flex; flex-direction: column; gap: 4px; }
    .col-2 { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .col-3 { width: 400px; display: flex; flex-direction: column; gap: 4px; border-left: 1px solid #ccc; padding-left: 15px; }
    
    .f-row { display: flex; gap: 8px; }
    .f-item { display: flex; align-items: center; gap: 4px; flex: 1; }
    .mes-field { display: flex; align-items: center; gap: 5px; }
    .lbl { font-size: 11px; width: 75px; color: #003366; font-weight: 600; }
    .ls { font-size: 11px; width: 60px; color: #003366; }
    .mes-in { border: 1px solid #999; height: 20px; font-size: 11px; padding: 0 4px; width: 100%; }
    .readonly { background: #e9e9e9; }
    .b-blue { color: blue; font-weight: bold; }
    .mes-btn-blue { height: 22px; font-size: 11px; background: #ddd; border: 1px solid #999; padding: 0 10px; font-weight: bold; cursor: pointer; }

    .quick-input-panel { background: #d9e6ff; padding: 6px; border: 1px solid #99ccff; }
    .day-labels, .day-inputs { display: flex; align-items: center; }
    .title-label { width: 60px; font-size: 11px; }
    .d-num { width: 28px; text-align: center; font-size: 10px; color: blue; }
    .in-red { width: 28px; height: 20px; text-align: center; color: red; font-weight: bold; border: 1px solid #999; margin: 0; }
    .ghi-chu-row { display: flex; align-items: center; margin-top: 5px; }

    .grid-result { background: #fff; border: 1px solid #999; }
    .mes-table { width: 100%; border-collapse: collapse; }
    .mes-table th { background: #eee; border: 1px solid #ccc; font-size: 10px; padding: 2px; }
    .mes-table td { border: 1px solid #eee; font-size: 11px; padding: 1px 4px; }
`;

export default LapKeHoachThang;