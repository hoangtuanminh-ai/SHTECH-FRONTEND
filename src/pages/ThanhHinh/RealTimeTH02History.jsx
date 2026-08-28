import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getChartRealTimeTH02History } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';

// Số dòng mỗi trang của popup lịch sử. Trước đây để 1000 nên bảng rất nặng và
// người dùng phải cuộn rất dài; 100 dòng vừa đủ để xem và thao tác phân trang.
// Bộ lọc đã mặc định 24 giờ gần nhất nên số bản ghi vốn đã bị giới hạn.
// Vì vậy lấy trọn khoảng đó trong MỘT trang thay vì cắt nhỏ, người dùng
// không phải bấm chuyển trang. Giá trị đủ lớn để chứa hết 24h dữ liệu.
const PAGE_SIZE = 5000;

// Khoảng thời gian mặc định của popup lịch sử thông số hoạt động: 24 GIỜ GẦN NHẤT
// tính từ thời điểm mở popup. Trước đây để trống nên API trả về toàn bộ lịch sử,
// vừa nặng vừa khó tìm đúng bản ghi cần xem.
const HOURS_BACK = 24;

const toLocalDateTimeInput = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// Trả về { from, to } dạng 'YYYY-MM-DDTHH:mm' cho 24 giờ gần nhất
const getDefaultRange = () => {
  const now = new Date();
  const from = new Date(now.getTime() - HOURS_BACK * 60 * 60 * 1000);
  return { from: toLocalDateTimeInput(from), to: toLocalDateTimeInput(now) };
};

const RealTimeTH02History = ({ equipmentId, onClose }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  // Mặc định lọc 24 giờ gần nhất kể từ thời điểm mở popup
  const [defaultRange] = useState(() => getDefaultRange());
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
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
      { key: 'prgmServoBDSVActualVelocity', label: 'Tốc độ trống hoán xung' },
      { key: 'prgmServoBDSVCActPos', label: 'Góc định vị BD' },
      { key: 'prgmServoCDSVActualVelocity', label: 'Tốc độ trống thân' },
      { key: 'prgmServoSDSVActualVelocity', label: 'Tốc độ trống chính' },
      { key: 'prgmServoSDSVCActPos', label: 'Góc định vị SD' },
      { key: 'prgmServoSDSDWid', label: 'Khoảng cách đặt tanh' },
      { key: 'prgmServoStRdSVCActPos', label: 'Vị trí cả hướng tâm mm' },
      { key: 'prgmServoStRtSVCActPos', label: 'Vị trí cả xoay' },
      { key: 'globalAISDLkPres', label: 'Áp lực nan quạt' },
      { key: 'globalAISDPres', label: 'Nội áp' },
      { key: 'globalDisableBarcode', label: 'Yêu cầu tích mã vạch' },
      { key: 'globalEnableBarcode', label: 'Trạng thái tích mã vạch' }
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
    console.log(`>>> [RealTimeTH02History] formatDateTimeTo14Char: Input: ${dateTimeStr}, isEnd: ${isEnd} => Output: ${result}`);
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

      console.log(">>> [FETCH REALTIME TH02 HISTORY POPUP] gửi params:", params);
      const res = await getChartRealTimeTH02History(params);
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
      toast.error('Lỗi khi tải lịch sử RealTime TH02');
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

  // Hiển thị 1 cho true/1 và 0 cho false/0 (true/false cho các cột mã vạch)
  const renderValue = (val, key) => {
    if (val === null || val === undefined) return '-';
    if (key === 'globalDisableBarcode' || key === 'globalEnableBarcode') {
      return (val === true || val === 1 || val === '1') ? 'true' : 'false';
    }
    if (val === true || val === 1 || val === '1') return '1';
    if (val === false || val === 0 || val === '0') return '0';
    
    // Loại bỏ chữ T trong chuỗi ngày giờ trả về từ backend (giữ lại mili giây)
    if (typeof val === 'string' && val.includes('T') && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      const result = val.replace('T', ' ');
      console.log(`>>> [RealTimeTH02History] renderValue (date format with ms): ${val} -> ${result}`);
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
          background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
          padding: '10px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', color: '#ffffff', flexShrink: 0
        }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>LỊCH SỬ THAY ĐỔI PARAMETER REALTIME — MÁY {equipmentId}</span>
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
                console.log(">>> [RealTimeTH02History] fromDate hour change:", newDateTime);
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
                console.log(">>> [RealTimeTH02History] fromDate minute change:", newDateTime);
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
                console.log(">>> [RealTimeTH02History] toDate hour change:", newDateTime);
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
                console.log(">>> [RealTimeTH02History] toDate minute change:", newDateTime);
                setToDate(newDateTime);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m} phút</option>
              ))}
            </select>
          </div>
          <button onClick={() => fetchHistory(0)} style={{ height: '26px', padding: '0 14px', fontSize: '11px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>TÌM KIẾM</button>
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
                      <th key={field.key} style={{ padding: '6px 8px', fontSize: '10px', background: '#1e40af', color: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((row) => (
                    <tr key={row.id} style={{ background: selectedId === row.id ? '#bae6fd' : 'transparent', cursor: 'pointer' }} onClick={() => setSelectedId(row.id)}>
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
            {/* Bộ lọc mặc định 24 giờ nên dữ liệu thường nằm gọn trong một trang.
                Chỉ hiện nút chuyển trang khi thực sự có nhiều hơn một trang. */}
            {totalPages > 1 && (
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
            )}
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

export default RealTimeTH02History;
