import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getChartRecipeORCVHistory } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';

// Số dòng mỗi trang của popup lịch sử.
const PAGE_SIZE = 100;

const localizedLabels = {
  widthOfInputMaterial: "Chiều rộng dải mảnh / Vật liệu đầu vào",
  widthOfStrip: "Chiều rộng vật liệu đầu vào / Dải mảnh",
  angle: "Độ dày vật liệu / Góc cắt",
  fullMaterialCoilDiameterInLetOff: "Đường kính đầy của cuộn xả liệu",
  autoSpeedFeedingDevice: "Tốc độ tự động cơ cấu cấp liệu",
  autoSpeedFeedingConveyer: "Tốc độ tự động băng tải cấp liệu",
  autoSpeedTakeoffConveyer: "Tốc độ tự động băng tải ra liệu",
  autoSpeedSplicingDevice: "Tốc độ tự động cơ cấu nối",
  feedingConveyerDistanceFromSensorToSplicingPlace: "Khoảng bù cấp liệu / khoảng cách cảm biến",
  feedingConveyerOffsetDistanceForSlowSpeed: "Khoảng bù ra liệu / giảm tốc cấp liệu",
  takeoffConveyerDistanceFromSensorToSplicingPlace: "Chiều dài cuộn thu / khoảng cách cảm biến ra liệu",
  takeoffConveyerOffsetDistanceForSlowSpeed: "Khoảng bù giảm tốc ra liệu",
  pulley1BasicPositionSetting: "Vị trí gốc puly 1",
  pulley1EndPositionSetting: "Vị trí cuối puly 1",
  pulley2BasicPositionSetting: "Vị trí gốc puly 2",
  pulley2EndPositionSetting: "Vị trí cuối puly 2",
  materialLenghtInWindUp: "Chiều dài vật liệu trên cuộn thu",
  thicknessOfInputMaterial: "Độ dày vật liệu đầu vào"
};

const RecipeORCVHistory = ({ equipmentId, onClose }) => {
  const [historyList, setHistoryList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTimeTo14Char = (dateTimeStr, isEnd = false) => {
    if (!dateTimeStr) return '';
    const parts = dateTimeStr.split('T');
    if (parts.length !== 2) return '';
    const datePart = parts[0].replace(/-/g, '');
    const timeParts = parts[1].split(':');
    const hourPart = (timeParts[0] || '00').padStart(2, '0').slice(0, 2);
    const minutePart = (timeParts[1] || '00').padStart(2, '0').slice(0, 2);
    return isEnd ? `${datePart}${hourPart}${minutePart}59` : `${datePart}${hourPart}${minutePart}00`;
  };

  const fetchHistory = async (pageIndex = 0) => {
    setLoading(true);
    try {
      const params = { maMay: equipmentId, page: pageIndex, size: PAGE_SIZE };
      if (fromDate) params.fromDate = formatDateTimeTo14Char(fromDate, false);
      if (toDate) params.toDate = formatDateTimeTo14Char(toDate, true);

      console.log(">>> [RecipeORCVHistory] Gọi API history recipe với params:", params);
      const res = await getChartRecipeORCVHistory(params);
      // Backend trả về Page của Spring: { content, totalPages, totalElements }.
      // Vẫn chấp nhận mảng thuần để không vỡ nếu endpoint chưa bật phân trang.
      if (res && Array.isArray(res.content)) {
        setHistoryList(res.content);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
        setPage(pageIndex);
      } else {
        const list = Array.isArray(res) ? res : [];
        setHistoryList(list);
        setTotalPages(1);
        setTotalElements(list.length);
        setPage(0);
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải lịch sử Recipe ORCV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [equipmentId]);

  const renderValue = (val) => {
    if (val === null || val === undefined) return '-';
    if (val === true || val === 1 || val === '1') return '1';
    if (val === false || val === 0 || val === '0') return '0';
    if (typeof val === 'string' && val.includes('T') && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      return val.replace('T', ' ');
    }
    return String(val);
  };

  const getColumns = () => {
    if (historyList.length === 0) return [];
    const record = historyList[0];

    const isCV01 = equipmentId && (equipmentId.endsWith('01') || equipmentId.includes('01') || equipmentId.includes('-1'));

    const baseCols = [];
    if ('creatDate' in record) baseCols.push({ key: 'creatDate', label: 'Ngày giờ' });
    else if ('ngayGio' in record) baseCols.push({ key: 'ngayGio', label: 'Ngày giờ' });

    if ('ca' in record) baseCols.push({ key: 'ca', label: 'Ca' });

    if ('historyDate' in record) baseCols.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) baseCols.push({ key: 'history_date', label: 'History Date' });

    const fieldsCV01 = [
      { key: "widthOfInputMaterial", label: "Chiều rộng dải mảnh" },
      { key: "widthOfStrip", label: "Chiều rộng vật liệu đầu vào" },
      { key: "thicknessOfInputMaterial", label: "Độ dày vật liệu" },
      { key: "angle", label: "Góc yêu cầu" },
      { key: "fullMaterialCoilDiameterInLetOff", label: "Đường kính đầy cuộn xả vật liệu" },
      { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
      { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
      { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
      { key: "autoSpeedSplicingDevice", label: "Tốc độ tự động cơ cấu nối" },
      { key: "feedingConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách cảm biến đến vị trí nối" },
      { key: "feedingConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc băng tải cấp liệu" },
      { key: "takeoffConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách cảm biến ra liệu đến vị trí nối" },
      { key: "takeoffConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc ra liệu" }
    ];

    const fieldsCV02_03 = [
      { key: "widthOfInputMaterial", label: "Chiều rộng vật liệu đầu vào" },
      { key: "widthOfStrip", label: "Chiều rộng dải mảnh" },
      { key: "thicknessOfInputMaterial", label: "Độ dày vật liệu đầu vào" },
      { key: "angle", label: "Góc cắt" },
      { key: "fullMaterialCoilDiameterInLetOff", label: "Đường kính đầy cuộn vật liệu" },
      { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
      { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
      { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
      { key: "autoSpeedSplicingDevice", label: "Tốc độ tự động cơ cấu nối" },
      { key: "feedingConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách cảm biến đến vị trí nối" },
      { key: "feedingConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc băng tải cấp liệu" },
      { key: "takeoffConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách cảm biến ra liệu đến vị trí nối" },
      { key: "takeoffConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc ra liệu" },
      { key: "pulley1BasicPositionSetting", label: "Cài đặt vị trí gốc puly 1" },
      { key: "pulley1EndPositionSetting", label: "Cài đặt vị trí cuối puly 1" },
      { key: "pulley2BasicPositionSetting", label: "Cài đặt vị trí gốc puly 2" },
      { key: "pulley2EndPositionSetting", label: "Cài đặt vị trí cuối puly 2" },
      { key: "materialLenghtInWindUp", label: "Chiều dài vật liệu trên cuộn thu" }
    ];

    const displayFields = isCV01 ? fieldsCV01 : fieldsCV02_03;
    const matched = displayFields.filter(f => f.key in record);
    return [...baseCols, ...matched];
  };

  const columns = getColumns();

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: '1400px', height: '90vh',
        borderRadius: '6px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px', background: '#16a34a', color: '#ffffff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 'bold' }}>
            LỊCH SỬ THÔNG SỐ CÔNG THỨC (RECIPE HISTORY) — {equipmentId}
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#ffffff',
            fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
          }}>×</button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Từ ngày:</span>
            <input 
              type="date" 
              value={fromDate ? fromDate.split('T')[0] : ''} 
              onChange={(e) => {
                const date = e.target.value;
                if (!date) setFromDate('');
                else {
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
                setFromDate(`${date}T${e.target.value}:${min}`);
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
                setFromDate(`${date}T${hour}:${e.target.value}`);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m} phút</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Đến ngày:</span>
            <input 
              type="date" 
              value={toDate ? toDate.split('T')[0] : ''} 
              onChange={(e) => {
                const date = e.target.value;
                if (!date) setToDate('');
                else {
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
                setToDate(`${date}T${e.target.value}:${min}`);
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
                setToDate(`${date}T${hour}:${e.target.value}`);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m} phút</option>
              ))}
            </select>
          </div>

          <button onClick={() => fetchHistory(0)} style={{
            height: '26px', padding: '0 16px', fontSize: '11px', background: '#16a34a',
            color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer'
          }}>TÌM KIẾM</button>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
              Đang tải dữ liệu lịch sử...
            </div>
          ) : historyList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
              Không có dữ liệu lịch sử trong khoảng thời gian đã chọn.
            </div>
          ) : (
            <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  {columns.map(col => (
                    <th key={col.key} style={{
                      padding: '6px 8px', fontSize: '10px', background: '#16a34a',
                      color: '#ffffff', borderBottom: '1px solid #cbd5e1', whiteSpace: 'nowrap'
                    }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historyList.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8fafc' : 'transparent' }}>
                    {columns.map(col => (
                      <td key={col.key} style={{
                        padding: '6px 8px', fontSize: '10px', fontWeight: '600',
                        textAlign: 'center', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'
                      }}>{renderValue(row[col.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Thanh phân trang: dữ liệu được backend cắt theo trang PAGE_SIZE dòng */}
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
                  padding: '4px 12px', fontSize: '11px', background: '#ffffff',
                  border: '1px solid #cbd5e1', borderRadius: '4px',
                  cursor: page === 0 || loading ? 'not-allowed' : 'pointer',
                  color: page === 0 || loading ? '#94a3b8' : '#0f172a',
                  fontWeight: 'bold', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                &lt; Trang trước
              </button>
              <span style={{ fontSize: '11px', color: '#475569', alignSelf: 'center', fontWeight: 'bold' }}>
                Trang {page + 1} / {totalPages || 1}
              </span>
              <button
                disabled={page >= totalPages - 1 || loading}
                onClick={() => fetchHistory(page + 1)}
                style={{
                  padding: '4px 12px', fontSize: '11px', background: '#ffffff',
                  border: '1px solid #cbd5e1', borderRadius: '4px',
                  cursor: page >= totalPages - 1 || loading ? 'not-allowed' : 'pointer',
                  color: page >= totalPages - 1 || loading ? '#94a3b8' : '#0f172a',
                  fontWeight: 'bold', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                Trang sau &gt;
              </button>
            </div>
            <button onClick={onClose} style={{
              padding: '4px 16px', fontSize: '11px', background: '#ef4444', color: '#ffffff',
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RecipeORCVHistory;
