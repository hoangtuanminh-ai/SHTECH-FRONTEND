import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getChartSettingTH05History } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';

// Số dòng mỗi trang của popup lịch sử. Trước đây để 1000 nên bảng rất nặng và
// người dùng phải cuộn rất dài; 100 dòng vừa đủ để xem và thao tác phân trang.
const PAGE_SIZE = 100;

const SettingTH05History = ({ equipmentId, onClose }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([]);

  // Hàm tạo danh sách cột động hiển thị
  const getDynamicFields = (record) => {
    if (!record) return [];

    const baseCols = [];
    // Cột Ngày giờ luôn ở đầu
    if ('creatDate' in record) baseCols.push({ key: 'creatDate', label: 'Ngày giờ' });
    else if ('ngayGio' in record) baseCols.push({ key: 'ngayGio', label: 'Ngày giờ' });

    // Cột Ca ở cột thứ 2
    if ('ca' in record) baseCols.push({ key: 'ca', label: 'Ca' });

    // Cột History Date ở cột thứ 3
    if ('historyDate' in record) baseCols.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) baseCols.push({ key: 'history_date', label: 'History Date' });

    // Danh sách các cột cài đặt TH05 Việt hóa theo đúng yêu cầu từ ảnh 2
    const displayFields = [
      { key: 'apLucCaBocGot', label: 'Áp lực cà bóc gót' },
      { key: 'apLucCaThanLopGiaiDoan1', label: 'Áp lực cà thân lốp giai đoạn 1' },
      { key: 'apLucCaThanLopGiaiDoan2', label: 'Áp lực cà thân lốp giai đoạn 2' },
      { key: 'sieuDinhHinh', label: 'Siêu định hình' },
      { key: 'thoiGianBomCaoAp', label: 'Thời gian bơm cao áp' },
      { key: 'dinhHinhCaoAp', label: 'Định hình cao áp' },
      { key: 'dinhHinhThapAp', label: 'Định hình thấp áp' },
      { key: 'rongCongNghe', label: 'Rộng công nghệ' },
      { key: 'doRongDuDinhHinh', label: 'Độ rộng dư định hình' },
      { key: 'doRongDinhHinhTrongChinh', label: 'Độ rộng định hình trống chính' },

      { key: 'chieuDaiCatVaiThan', label: 'Chiều dài cắt vải thân' },
      { key: 'chieuDaiHieuChuanCatVaiThan', label: 'Chiều dài hiệu chuẩn cắt vải thân' },
      { key: 'duongKinhDanHopTrongThan', label: 'Đường kính dán hợp trống thân' },
      { key: 'tocDoTrongThan', label: 'Tốc độ trống thân' },
      { key: 'duongKinhLonNhatTrongThan', label: 'Đường kính lớn nhất trống thân' },
      { key: 'duongKinhNhoNhatTrongThan', label: 'Đường kính nhỏ nhất trống thân' },
      { key: 'tocDoQuayTrongThanKhiCaThanLop', label: 'Tốc độ quay trống thân khi cà thân lốp' },
      { key: 'chieuDaiCatToHopTLTPA', label: 'Chiều dài cắt tổ hợp TLT PA' },
      { key: 'chieuDaiHieuChuanCatToHopTLTPA', label: 'Chiều dài hiệu chuẩn cắt tổ hợp TLT PA' },

      { key: 'gocTrongQuayCaBocGot', label: 'Góc trống quay cà bóc gót' },
      { key: 'duongKinhCaVaiThan', label: 'Đường kính cà vải thân' },
      { key: 'viTriCuoiCaTamGiac', label: 'Vị trí cuối cà tam giác' },
      { key: 'tocDoCaTamGiacOViTriCuoi', label: 'Tốc độ cà tam giác ở vị trí cuối' },
      { key: 'apLucCaTamGiacViTriCuoi', label: 'Áp lực cà tam giác vị trí cuối' },
      { key: 'viTriBatDauCaTamGiac', label: 'Vị trí bắt đầu cà tam giác' },
      { key: 'tocDoCaTamGiacOViTriBatDau', label: 'Tốc độ cà tam giác ở vị trí bắt đầu' },
      { key: 'apLucCaTamGiacOViTriDau', label: 'Áp lực cà tam giác ở vị trí đầu' },
      { key: 'viTriChoCaTamGiac', label: 'Vị trí chờ cà tam giác' },
      { key: 'tocDoCaTamGiacOViTriCho', label: 'Tốc độ cà tam giác ở vị trí chờ' },
      { key: 'tocDoCaHongLopOViTriTamGiac', label: 'Tốc độ cà hông lốp ở vị trí tam giác' },
      { key: 'apLucCaTamGiacOViTriVaiThan', label: 'Áp lực cà tam giác ở vị trí vải thân' },
      { key: 'viTriBatDauCaHongLop', label: 'Vị trí bắt đầu cà hông lốp' },
      { key: 'tocDoCaHongLopOViTriBatDau', label: 'Tốc độ cà hông lốp ở vị trí bắt đầu' },
      { key: 'apLucCaHongLopViTriBatDau', label: 'Áp lực cà hông lốp ở vị trí bắt đầu' },
      { key: 'viTriCuoiVaiThanCaHongLop', label: 'Vị trí cuối vải thân cà hông lốp' },
      { key: 'tocDoCaHongLopOViTriVaiThan', label: 'Tốc độ cà hông lốp ở vị trí vải thân' },
      { key: 'apLucCaHongLopOViTriVaiThan', label: 'Áp lực cà hông lốp ở vị trí vải thân' },
      { key: 'viTriCuoiBocGotCaHongLop', label: 'Vị trí cuối bóc gót cà hông lốp' },
      { key: 'tocDoCaHongLopOViTriBocGot', label: 'Tốc độ cà hông lốp ở vị trí bóc gót' },
      { key: 'apLucCaHongLopViTriBocGot', label: 'Áp lực cà hông lốp vị trí bóc gót' },
      { key: 'viTriCuoiMatLopCaHongLop', label: 'Vị trí cuối mặt lốp cà hông lốp' },
      { key: 'tocDoCaHongLopOViTriMatChay', label: 'Tốc độ cà hông lốp ở vị trí mặt chạy' },
      { key: 'apLucCaHongLopOViTriMatLop', label: 'Áp lực cà hông lốp ở vị trí mặt lốp' },
      { key: 'tocDoCaHongLopOViTriCho', label: 'Tốc độ cà hông lốp ở vị trí chờ' },

      { key: 'gocQuayTrongChinhTrucCa1', label: 'Góc quay trống chính trục cà 1' },
      { key: 'tocDoTrucCa2', label: 'Tốc độ trục cà 2' },
      { key: 'apLucKetThucCa2Quay', label: 'Áp lực kết thúc cà 2 quay' },
      { key: 'apLucCa2OViTriChuyenGoc', label: 'Áp lực cà 2 ở vị trí chuyển góc' },
      { key: 'apLucCa2OViTriDungQuayGoc1', label: 'Áp lực cà 2 ở vị trí dừng quay góc 1' },
      { key: 'apLucCa2OViTriDungQuayGoc2', label: 'Áp lực cà 2 ở vị trí dừng quay góc 2' },
      { key: 'viTriBatDauCaTruc4', label: 'Vị trí bắt đầu cà trục 4' },
      { key: 'tocDoTaiViTriBatDauCaTruc4', label: 'Tốc độ tại vị trí bắt đầu cà trục 4' },
      { key: 'apLucTaiViTriBatDauCaTruc4', label: 'Áp lực tại vị trí bắt đầu cà trục 4' },
      { key: 'tocDoCaTruc4TaiViTriBatDauCaoAp', label: 'Tốc độ cà trục 4 tại vị trí bắt đầu cao áp' },
      { key: 'viTriBatDauCaoApCaTruc4', label: 'Vị trí bắt đầu cao áp cà trục 4' },
      { key: 'apLucTaiViTriBatDauCaoApCaTruc4', label: 'Áp lực tại vị trí bắt đầu cao áp cà trục 4' },
      { key: 'viTriKetThucThapApCaTruc4', label: 'Vị trí kết thúc thấp áp cà trục 4' },
      { key: 'tocDoCaTruc4TaiViTriKetThucThapAp', label: 'Tốc độ cà trục 4 tại vị trí kết thúc thấp áp' },
      { key: 'apLucTaiViTriKetThucThapApCaTruc4', label: 'Áp lực tại vị trí kết thúc thấp áp cà trục 4' },
      { key: 'viTriDungQuayGoc1CaTruc4', label: 'Vị trí dừng quay góc 1 cà trục 4' },
      { key: 'tocDoTaiViTriDungQuayGoc1CaTruc4', label: 'Tốc độ tại vị trí dừng quay góc 1 cà trục 4' },
      { key: 'viTriDungQuayGoc2CaTruc4', label: 'Vị trí dừng quay góc 2 cà trục 4' },
      { key: 'tocDoTaiViTriDungQuayGoc2CaTruc4', label: 'Tốc độ tại vị trí dừng quay góc 2 cà trục 4' },
      { key: 'viTriChuyenGocQuayCaTruc4', label: 'Vị trí chuyển góc quay cà trục 4' },
      { key: 'tocDoChuyenGocQuayCaTruc4', label: 'Tốc độ chuyển góc quay cà trục 4' },
      { key: 'viTriKetThucQuayCaTruc4', label: 'Vị trí kết thúc quay cà trục 4' },
      { key: 'tocDoTaiViTriKetThucQuayCaTruc4', label: 'Tốc độ tại vị trí kết thúc quay cà trục 4' },
      { key: 'apLucTaiViTriKetThucQuayCaTruc4', label: 'Áp lực tại vị trí kết thúc quay cà trục 4' },
      { key: 'apLucCaTruc4OViTriDungQuayGoc1', label: 'Áp lực cà trục 4 ở vị trí dừng quay góc 1' },
      { key: 'apLucCaTruc4OViTriDungQuayGoc2', label: 'Áp lực cà trục 4 ở vị trí dừng quay góc 2' },
      { key: 'apLucCaTruc4OViTriChuyenGocQuay', label: 'Áp lực cà trục 4 ở vị trí chuyển góc quay' },
      { key: 'viTriKetThucMatChayCaTruc4', label: 'Vị trí kết thúc mặt chạy cà trục 4' },
      { key: 'tocDoTaiViTriKetThucMatChayCaTruc4', label: 'Tốc độ tại vị trí kết thúc mặt chạy cà trục 4' },
      { key: 'apLucTaiViTriKetThucMatChayCaTruc4', label: 'Áp lực tại vị trí kết thúc mặt chạy cà trục 4' },

      { key: 'apLucCaVaiThanGiaiDoan3', label: 'Áp lực cà vải thân giai đoạn 3' },
      { key: 'apLucCaVaiThanGiaiDoan4', label: 'Áp lực cà vải thân giai đoạn 4' },
      { key: 'viTriCaVaiThanGiaiDoan1', label: 'Vị trí cà vải thân giai đoạn 1' },
      { key: 'viTriCaVaiThanGiaiDoan2', label: 'Vị trí cà vải thân giai đoạn 2' },
      { key: 'viTriCaVaiThanGiaiDoan3', label: 'Vị trí cà vải thân giai đoạn 3' },
      { key: 'viTriCaVaiThanGiaiDoan4', label: 'Vị trí cà vải thân giai đoạn 4' },
      { key: 'viTriBatDauCaBocGot', label: 'Vị trí bắt đầu cà bóc gót' },
      { key: 'viTriKetThucCaBocGot', label: 'Vị trí kết thúc cà bóc gót' }
    ];

    const matched = displayFields.filter(f => f.key in record);
    return [...baseCols, ...matched];
  };

  const formatDateTimeTo14Char = (dateTimeStr, isEnd = false) => {
    if (!dateTimeStr) return '';
    const parts = dateTimeStr.split('T');
    if (parts.length !== 2) return '';
    const datePart = parts[0].replace(/-/g, ''); // yyyyMMdd
    const timeParts = parts[1].split(':');
    const hourPart = (timeParts[0] || '00').padStart(2, '0').slice(0, 2);
    const minutePart = (timeParts[1] || '00').padStart(2, '0').slice(0, 2);
    const result = isEnd ? `${datePart}${hourPart}${minutePart}59` : `${datePart}${hourPart}${minutePart}00`;
    console.log(`>>> [SettingTH05History] formatDateTimeTo14Char: Input: ${dateTimeStr}, isEnd: ${isEnd} => Output: ${result}`);
    return result;
  };

  const fetchHistory = async (pageIndex = 0) => {
    setLoading(true);
    try {
      const params = {
        maMay: equipmentId,
        page: pageIndex,
        size: PAGE_SIZE
      };
      if (fromDate) params.fromDate = formatDateTimeTo14Char(fromDate, false);
      if (toDate) params.toDate = formatDateTimeTo14Char(toDate, true);

      console.log(">>> [FETCH SETTING TH05 HISTORY POPUP] gửi params:", params);
      const res = await getChartSettingTH05History(params);
      if (res && res.content) {
        setHistoryList(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setPage(pageIndex);
        if (res.content.length > 0) {
          setDynamicFields(getDynamicFields(res.content[0]));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải lịch sử Setting TH05');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(0);
  }, [equipmentId]);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderValue = (val, key) => {
    if (val === null || val === undefined) return '-';
    
    // Loại bỏ chữ T trong chuỗi ngày giờ
    if (typeof val === 'string' && val.includes('T') && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      const result = val.replace('T', ' ');
      return result;
    }
    return String(val);
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '12px', backdropFilter: 'blur(3px)'
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff', borderRadius: '4px', width: '96vw', maxWidth: '1600px',
        height: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)',
        border: '1px solid #cbd5e1', overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Popup */}
        <div style={{
          background: 'linear-gradient(180deg, #c2410c 0%, #ea580c 100%)',
          padding: '10px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', color: '#ffffff', flexShrink: 0
        }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>LỊCH SỬ THAY ĐỔI PARAMETER SETTING — MÁY {equipmentId}</span>
          <button onClick={onClose} style={{
            background: '#ef4444', border: 'none', color: '#ffffff',
            fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
            width: '24px', height: '24px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>X</button>
        </div>

        {/* Filters bar */}
        <div style={{
          background: '#f1f5f9', borderBottom: '1px solid #cbd5e1',
          padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>Từ:</span>
            <input 
              type="date" 
              value={fromDate ? fromDate.split('T')[0] : ''} 
              onChange={(e) => {
                const date = e.target.value;
                if (!date) {
                  setFromDate('');
                } else {
                  const time = fromDate && fromDate.includes('T') ? fromDate.split('T')[1] : '00:00';
                  setFromDate(`${date}T${time}`);
                }
              }} 
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }} 
            />
            <select
              value={fromDate && fromDate.includes('T') ? fromDate.split('T')[1].split(':')[0] : '00'}
              onChange={(e) => {
                const date = fromDate ? fromDate.split('T')[0] : getLocalDateString();
                const min = fromDate && fromDate.includes('T') ? (fromDate.split('T')[1].split(':')[1] || '00') : '00';
                const newDateTime = `${date}T${e.target.value}:${min}`;
                setFromDate(newDateTime);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                <option key={h} value={h}>{h} giờ</option>
              ))}
            </select>
            <select
              value={fromDate && fromDate.includes('T') ? (fromDate.split('T')[1].split(':')[1] || '00') : '00'}
              onChange={(e) => {
                const date = fromDate ? fromDate.split('T')[0] : getLocalDateString();
                const hour = fromDate && fromDate.includes('T') ? (fromDate.split('T')[1].split(':')[0] || '00') : '00';
                const newDateTime = `${date}T${hour}:${e.target.value}`;
                setFromDate(newDateTime);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m} phút</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>Đến:</span>
            <input 
              type="date" 
              value={toDate ? toDate.split('T')[0] : ''} 
              onChange={(e) => {
                const date = e.target.value;
                if (!date) {
                  setToDate('');
                } else {
                  const time = toDate && toDate.includes('T') ? toDate.split('T')[1] : '23:59';
                  setToDate(`${date}T${time}`);
                }
              }} 
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }} 
            />
            <select
              value={toDate && toDate.includes('T') ? toDate.split('T')[1].split(':')[0] : '23'}
              onChange={(e) => {
                const date = toDate ? toDate.split('T')[0] : getLocalDateString();
                const min = toDate && toDate.includes('T') ? (toDate.split('T')[1].split(':')[1] || '59') : '59';
                const newDateTime = `${date}T${e.target.value}:${min}`;
                setToDate(newDateTime);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                <option key={h} value={h}>{h} giờ</option>
              ))}
            </select>
            <select
              value={toDate && toDate.includes('T') ? (toDate.split('T')[1].split(':')[1] || '59') : '59'}
              onChange={(e) => {
                const date = toDate ? toDate.split('T')[0] : getLocalDateString();
                const hour = toDate && toDate.includes('T') ? (toDate.split('T')[1].split(':')[0] || '23') : '23';
                const newDateTime = `${date}T${hour}:${e.target.value}`;
                setToDate(newDateTime);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m} phút</option>
              ))}
            </select>
          </div>
          <button onClick={() => fetchHistory(0)} style={{ height: '26px', padding: '0 14px', fontSize: '11px', background: '#c2410c', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>TÌM KIẾM</button>
        </div>

        {/* Body hiển thị Table cuộn ngang & dọc */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '8px', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', border: '1px solid #cbd5e1', width: '100%', minHeight: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Đang tải danh sách lịch sử...</div>
            ) : historyList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Không có bản ghi dữ liệu lịch sử nào trong khoảng thời gian này.</div>
            ) : (
              <table className="mes-table" style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    {dynamicFields.map(field => (
                      <th key={field.key} style={{ padding: '6px 8px', fontSize: '10px', background: '#c2410c', color: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((row) => (
                    <tr key={row.id} style={{ background: selectedId === row.id ? '#ffedd5' : 'transparent', cursor: 'pointer' }} onClick={() => setSelectedId(row.id)}>
                      {dynamicFields.map(field => (
                        <td key={field.key} style={{ padding: '6px 8px', fontSize: '10px', fontWeight: '600', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          {renderValue(row[field.key], field.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer phân trang */}
        <div style={{
          background: '#f8fafc', borderTop: '1px solid #cbd5e1',
          padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Tổng số bản ghi: {totalElements}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                disabled={page === 0 || loading} 
                onClick={() => fetchHistory(page - 1)} 
                style={{ 
                  padding: '4px 12px', 
                  fontSize: '11px', 
                  background: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '4px', 
                  cursor: page === 0 || loading ? 'not-allowed' : 'pointer', 
                  color: page === 0 || loading ? '#94a3b8' : '#0f172a',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                &lt; Trang trước
              </button>
              <span style={{ fontSize: '11px', color: '#475569', alignSelf: 'center', fontWeight: 'bold' }}>Trang {page + 1} / {totalPages || 1}</span>
              <button 
                disabled={page >= totalPages - 1 || loading} 
                onClick={() => fetchHistory(page + 1)} 
                style={{ 
                  padding: '4px 12px', 
                  fontSize: '11px', 
                  background: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '4px', 
                  cursor: page >= totalPages - 1 || loading ? 'not-allowed' : 'pointer', 
                  color: page >= totalPages - 1 || loading ? '#94a3b8' : '#0f172a',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                Trang sau &gt;
              </button>
            </div>
            <button onClick={onClose} style={{
              padding: '4px 16px', fontSize: '11px', background: '#ef4444', color: '#ffffff',
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>ĐÓNG POPUP</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default SettingTH05History;
