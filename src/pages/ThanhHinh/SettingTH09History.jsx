import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getChartSettingTH09History } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';
import { exportTableToExcel } from '../../utils/exportExcelHelper';

// Số dòng mỗi trang của popup lịch sử. Trước đây để 1000 nên bảng rất nặng và
// người dùng phải cuộn rất dài; 100 dòng vừa đủ để xem và thao tác phân trang.
const PAGE_SIZE = 100;

const SettingTH09History = ({ equipmentId, onClose }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([]);

  const getDynamicFields = (record) => {
    if (!record) return [];

    const baseCols = [];
    if ('creatDate' in record) baseCols.push({ key: 'creatDate', label: 'Ngày giờ' });
    else if ('ngayGio' in record) baseCols.push({ key: 'ngayGio', label: 'Ngày giờ' });

    if ('ca' in record) baseCols.push({ key: 'ca', label: 'Ca' });

    if ('historyDate' in record) baseCols.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) baseCols.push({ key: 'history_date', label: 'History Date' });

    const displayFields = [
      { key: 'duongKinhBungTrongThan', label: 'ĐK bụng trống thân' },
      { key: 'duongKinhDanHopTrongThan', label: 'ĐK dán hộp trống thân' },
      { key: 'duongKinhTrongThanThuLai', label: 'ĐK trống thân thu lại' },
      { key: 'duongKinhTrongBungKhiCaVaiThan', label: 'ĐK trong bụng khi cá vai' },
      { key: 'duongKinhBungTrongThanLonNhat', label: 'ĐK bụng trống thân max' },
      { key: 'duongKinhBungTrongThanNhoNhat', label: 'ĐK bụng trống thân min' },
      { key: 'trongSHGiaTriThamChieu', label: 'Trống SH GT tham chiếu' },
      { key: 'trongSHGioiHanMoLonNhat', label: 'Trống SH GH mở max' },
      { key: 'gioiHanDongNhoNhat', label: 'Giới hạn đóng min' },
      { key: 'rongCongNghe', label: 'Rộng công nghệ' },
      { key: 'viTriDuDinhHinh', label: 'Vị trí dư định hình' },
      { key: 'viTriDinhHinh', label: 'Vị trí định hình' },
      { key: 'viTriSieuDinhHinh', label: 'Vị trí siêu định hình' },
      { key: 'dieuChinhViTriVen', label: 'Điều chỉnh vị trí vén' },
      { key: 'chieuDaiVaiThan', label: 'Chiều dài vai thân' },
      { key: 'chieuDaiHieuChuanVaiThan', label: 'CD hiệu chuẩn vai thân' },
      { key: 'chieuDaiToHopTangLotTrongPA', label: 'CD tổ hợp tăng lót PA' },
      { key: 'chieuDaiHieuChuanToHopTangLotTrongPA', label: 'CD HC tổ hợp tăng lót PA' },
      { key: 'viTriChoCaToHopTangLotTrongPA', label: 'Vị trí chờ cà TH tăng lót PA' },
      { key: 'viTriCuoiCaToHopTangLotTrongPA', label: 'Vị trí cuối cà TH tăng lót PA' },
      { key: 'tocDoCaVaiThanGiaiDoan1', label: 'Tốc độ cà vai thân GĐ1' },
      { key: 'viTriCuoiCaVaiThanGiaiDoan1', label: 'Vị trí cuối cà vai thân GĐ1' },
      { key: 'apLucConCaTraiVaiThanGiaiDoan1', label: 'Áp lực con cà trái vai GĐ1' },
      { key: 'apLucConCaPhaiVaiThanGiaiDoan1', label: 'Áp lực con cà phải vai GĐ1' },
      { key: 'tocDoCaVaiThanGiaiDoan2', label: 'Tốc độ cà vai thân GĐ2' },
      { key: 'viTriCuoiCaVaiThanGiaiDoan2', label: 'Vị trí cuối cà vai thân GĐ2' },
      { key: 'apLucConCaTraiVaiThanGiaiDoan2', label: 'Áp lực con cà trái vai GĐ2' },
      { key: 'apLucConCaPhaiVaiThanGiaiDoan2', label: 'Áp lực con cà phải vai GĐ2' },
      { key: 'tocDoCaVaiThanGiaiDoan3', label: 'Tốc độ cà vai thân GĐ3' },
      { key: 'viTriCuoiCaVaiThanGiaiDoan3', label: 'Vị trí cuối cà vai thân GĐ3' },
      { key: 'apLucConCaTraiVaiThanGiaiDoan3', label: 'Áp lực con cà trái vai GĐ3' },
      { key: 'apLucConCaPhaiVaiThanGiaiDoan3', label: 'Áp lực con cà phải vai GĐ3' },
      { key: 'tocDoHuongTamCaMatChayGiaiDoan1', label: 'Tốc độ H.Tâm cà MC GĐ1' },
      { key: 'viTriHuongTamCaMatChayGiaiDoan1', label: 'Vị trí H.Tâm cà MC GĐ1' },
      { key: 'tocDoHuongTrucCaMatChayGiaiDoan1', label: 'Tốc độ H.Trục cà MC GĐ1' },
      { key: 'viTriHuongTrucCaMatChayGiaiDoan1', label: 'Vị trí H.Trục cà MC GĐ1' },
      { key: 'apLucCaMatChayGiaiDoan1', label: 'Áp lực cà MC GĐ1' },
      { key: 'gocXoayCaMatChayGiaiDoan1', label: 'Góc xoay cà MC GĐ1' },
      { key: 'tocDoXoayCaMatChayGiaiDoan1', label: 'Tốc độ xoay cà MC GĐ1' },
      { key: 'thoiGianCaMatChayGiaiDoan1', label: 'Thời gian cà MC GĐ1' },
      { key: 'tocDoHuongTamCaMatChayGiaiDoan2', label: 'Tốc độ H.Tâm cà MC GĐ2' },
      { key: 'viTriHuongTamCaMatChayGiaiDoan2', label: 'Vị trí H.Tâm cà MC GĐ2' },
      { key: 'tocDoHuongTrucCaMatChayGiaiDoan2', label: 'Tốc độ H.Trục cà MC GĐ2' },
      { key: 'viTriHuongTrucCaMatChayGiaiDoan2', label: 'Vị trí H.Trục cà MC GĐ2' },
      { key: 'apLucCaMatChayGiaiDoan2', label: 'Áp lực cà MC GĐ2' },
      { key: 'gocXoayCaMatChayGiaiDoan2', label: 'Góc xoay cà MC GĐ2' },
      { key: 'tocDoXoayCaMatChayGiaiDoan2', label: 'Tốc độ xoay cà MC GĐ2' },
      { key: 'thoiGianCaMatChayGiaiDoan2', label: 'Thời gian cà MC GĐ2' },
      { key: 'tocDoHuongTamCaMatChayGiaiDoan3', label: 'Tốc độ H.Tâm cà MC GĐ3' },
      { key: 'viTriHuongTamCaMatChayGiaiDoan3', label: 'Vị trí H.Tâm cà MC GĐ3' },
      { key: 'tocDoHuongTrucCaMatChayGiaiDoan3', label: 'Tốc độ H.Trục cà MC GĐ3' },
      { key: 'viTriHuongTrucCaMatChayGiaiDoan3', label: 'Vị trí H.Trục cà MC GĐ3' },
      { key: 'apLucCaMatChayGiaiDoan3', label: 'Áp lực cà MC GĐ3' },
      { key: 'gocXoayCaMatChayGiaiDoan3', label: 'Góc xoay cà MC GĐ3' },
      { key: 'tocDoXoayCaMatChayGiaiDoan3', label: 'Tốc độ xoay cà MC GĐ3' },
      { key: 'thoiGianCaMatChayGiaiDoan3', label: 'Thời gian cà MC GĐ3' },
      { key: 'tocDoHuongTamCaMatChayGiaiDoan4', label: 'Tốc độ H.Tâm cà MC GĐ4' },
      { key: 'viTriHuongTamCaMatChayGiaiDoan4', label: 'Vị trí H.Tâm cà MC GĐ4' },
      { key: 'tocDoHuongTrucCaMatChayGiaiDoan4', label: 'Tốc độ H.Trục cà MC GĐ4' },
      { key: 'viTriHuongTrucCaMatChayGiaiDoan4', label: 'Vị trí H.Trục cà MC GĐ4' },
      { key: 'apLucCaMatChayGiaiDoan4', label: 'Áp lực cà MC GĐ4' },
      { key: 'gocXoayCaMatChayGiaiDoan4', label: 'Góc xoay cà MC GĐ4' },
      { key: 'tocDoXoayCaMatChayGiaiDoan4', label: 'Tốc độ xoay cà MC GĐ4' },
      { key: 'thoiGianCaMatChayGiaiDoan4', label: 'Thời gian cà MC GĐ4' },
      { key: 'caVongTanhViTriCho', label: 'Cà vòng tanh vị trí chờ' },
      { key: 'apLucCaVongTanh', label: 'Áp lực cà vòng tanh' },
      { key: 'caVongTanhViTriCuoi', label: 'Cà vòng tanh vị trí cuối' },
      { key: 'tocDoCaVongTanh', label: 'Tốc độ cà vòng tanh' },
      { key: 'viTriCuoiCaBocGot', label: 'Vị trí cuối cà bóc gót' },
      { key: 'apLucCaBocGotTrai', label: 'Áp lực cà bóc gót trái' },
      { key: 'apLucCaBocGotPhai', label: 'Áp lực cà bóc gót phải' },
      { key: 'viTriChoCaBocGot', label: 'Vị trí chờ cà bóc gót' },
      { key: 'caHongViTriGiaiDoan1', label: 'Cà hồng vị trí GĐ1' },
      { key: 'caHongTocDoGiaiDoan1', label: 'Cà hồng tốc độ GĐ1' },
      { key: 'thoiGianCaHongGiaiDoan1', label: 'Thời gian cà hồng GĐ1' },
      { key: 'apLucCaHongGiaiDoan1', label: 'Áp lực cà hồng GĐ1' },
      { key: 'caHongViTriGiaiDoan2', label: 'Cà hồng vị trí GĐ2' },
      { key: 'caHongTocDoGiaiDoan2', label: 'Cà hồng tốc độ GĐ2' },
      { key: 'thoiGianCaHongGiaiDoan2', label: 'Thời gian cà hồng GĐ2' },
      { key: 'apLucCaHongGiaiDoan2', label: 'Áp lực cà hồng GĐ2' },
      { key: 'caHongViTriGiaiDoan3', label: 'Cà hồng vị trí GĐ3' },
      { key: 'caHongTocDoGiaiDoan3', label: 'Cà hồng tốc độ GĐ3' },
      { key: 'thoiGianCaHongGiaiDoan3', label: 'Thời gian cà hồng GĐ3' },
      { key: 'apLucCaHongGiaiDoan3', label: 'Áp lực cà hồng GĐ3' },
      { key: 'caTamGiac2GiaiDoanViTriCuoi', label: 'Cà tam giác 2 GĐ VT cuối' },
      { key: 'caTamGiac2GiaiDoanTocDoConLan', label: 'Cà tam giác 2 GĐ tốc độ con lăn' },
      { key: 'caTamGiac2GiaiDoanApLuc', label: 'Cà tam giác 2 GĐ áp lực' }
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
    console.log(`>>> [SettingTH09History] formatDateTimeTo14Char: Input: ${dateTimeStr}, isEnd: ${isEnd} => Output: ${result}`);
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

      console.log(">>> [FETCH SETTING TH09 HISTORY POPUP] gửi params:", params);
      const res = await getChartSettingTH09History(params);
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
      toast.error('Lỗi khi tải lịch sử Setting TH09');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xuất dữ liệu bảng lịch sử thông số cài đặt máy TH09+ ra file Excel
  const handleExportExcel = () => {
    console.log(`>>> [SettingTH09History] Người dùng bấm Xuất Excel - Máy: ${equipmentId}, Số bản ghi: ${historyList.length}`);
    const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    exportTableToExcel({
      data: historyList,
      columns: dynamicFields,
      fileName: `LichSu_ThongSo_CaiDat_${equipmentId || 'TH09'}_${timeStamp}`,
      sheetName: 'ThongSoCaiDat',
      title: `LỊCH SỬ THAY ĐỔI PARAMETER SETTING (THÔNG SỐ CÀI ĐẶT) — MÁY ${equipmentId}`,
      metadata: {
        'Mã máy': equipmentId,
        'Từ ngày': fromDate ? fromDate.replace('T', ' ') : 'Mặc định',
        'Đến ngày': toDate ? toDate.replace('T', ' ') : 'Hiện tại',
        'Tổng số bản ghi': historyList.length,
        'Thời gian xuất': new Date().toLocaleString('vi-VN')
      }
    });
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

  // Hiển thị 1 cho true/1 và 0 cho false/0
  const renderValue = (val) => {
    if (val === null || val === undefined) return '-';
    if (val === true || val === 1 || val === '1') return '1';
    if (val === false || val === 0 || val === '0') return '0';
    
    // Loại bỏ chữ T trong chuỗi ngày giờ trả về từ backend (giữ lại mili giây)
    if (typeof val === 'string' && val.includes('T') && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      const result = val.replace('T', ' ');
      console.log(`>>> [SettingTH09History] renderValue (date format with ms): ${val} -> ${result}`);
      return result;
    }
    return String(val);
  };

  // Sử dụng React Portal để đưa popup ra ngoài cùng body, tránh bị che khuất bởi sidebar/navbar
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
          background: 'linear-gradient(180deg, #0f766e 0%, #115e59 100%)',
          padding: '10px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', color: '#ffffff', flexShrink: 0
        }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>LỊCH SỬ THAY ĐỔI PARAMETER SETTING (THÔNG SỐ CÀI ĐẶT) — MÁY {equipmentId}</span>
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
                console.log(">>> [SettingTH09History] fromDate hour change:", newDateTime);
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
                console.log(">>> [SettingTH09History] fromDate minute change:", newDateTime);
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
                console.log(">>> [SettingTH09History] toDate hour change:", newDateTime);
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
                console.log(">>> [SettingTH09History] toDate minute change:", newDateTime);
                setToDate(newDateTime);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m} phút</option>
              ))}
            </select>
          </div>
          <button onClick={() => fetchHistory(0)} style={{ height: '26px', padding: '0 14px', fontSize: '11px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>TÌM KIẾM</button>
          <button 
            onClick={handleExportExcel} 
            disabled={loading || historyList.length === 0}
            style={{ 
              height: '26px', 
              padding: '0 12px', 
              fontSize: '11px', 
              background: '#15803d', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '3px', 
              fontWeight: 'bold', 
              cursor: (loading || historyList.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (loading || historyList.length === 0) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Xuất bảng lịch sử thông số cài đặt ra file Excel"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            XUẤT EXCEL
          </button>
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
                      <th key={field.key} style={{ padding: '6px 8px', fontSize: '10px', background: '#0f766e', color: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((row) => (
                    <tr key={row.id} style={{ background: selectedId === row.id ? '#e2f5f5' : 'transparent', cursor: 'pointer' }} onClick={() => setSelectedId(row.id)}>
                      {dynamicFields.map(field => (
                        <td key={field.key} style={{ padding: '6px 8px', fontSize: '10px', fontWeight: '600', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          {renderValue(row[field.key])}
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

export default SettingTH09History;
