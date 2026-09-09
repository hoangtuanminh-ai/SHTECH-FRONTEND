import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getChartSettingORCVHistory } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';
import { exportTableToExcel } from '../../utils/exportExcelHelper';

// Số dòng mỗi trang của popup lịch sử.
const PAGE_SIZE = 100;

const localizedLabels = {
  globalDisableBarcode: "Tắt quét mã vạch",
  globalEnableBarcode: "Bật quét mã vạch",
  globalIn133805: "Cảm biến vào 1338-05",
  globalIn133806: "Cảm biến vào 1338-06",
  globalIn133807: "Cảm biến vào 1338-07",
  globalIn134408: "Cảm biến vào 1344-08",
  globalLowerLimit: "Giới hạn dưới",
  globalNormal: "Trạng thái bình thường",
  duongKinhBungTrongThan: "Đường kính bụng trong thân",
  viTriCaSauHuongTam: "Vị trí cả sấu hướng tâm",
  viTriCaSauHuongTruc: "Vị trí cả sấu hướng trục",
  rongVaiLop: "Rộng vai lớp",
  noiAp: "Nối áp",
  apLucCaSau: "Áp lực cả sấu",
  apLucCaTanh: "Áp lực cả tanh",
  apLucCaVai: "Áp lực cả vai",
  barcode: "Mã vạch",
  maQuyCach: "Mã quy cách",
  recipeNumber: "Số công thức",
  widthOfInputMaterial: "Chiều rộng dải mảnh / Vật liệu đầu vào",
  widthOfStrip: "Chiều rộng vật liệu đầu vào / Dải mảnh",
  angle: "Độ dày vật liệu / Góc cắt",
  autoSpeedFeedingConveyer: "Tốc độ tự động băng tải cấp liệu",
  autoSpeedSplicingDevice: "Tốc độ tự động cơ cấu nối",
  feedingConveyerDistanceFromSensorToSplicingPlace: "Khoảng cách cảm biến đến vị trí nối",
  feedingConveyerOffsetDistanceForSlowSpeed: "Khoảng bù giảm tốc băng tải cấp liệu",
  takeoffConveyerDistanceFromSensorToSplicingPlace: "Khoảng cách cảm biến ra liệu đến vị trí nối",
  takeoffConveyerOffsetDistanceForSlowSpeed: "Khoảng bù giảm tốc ra liệu",
  serviceModeJogTime: "Thời gian chạy nhích chế độ bảo trì",
  delayConveyerDownAfterCut: "Thời gian hạ băng tải sau khi cắt",
  timeForLightingOfSplicingWorkplace: "Thời gian bật đèn vị trí nối",
  delayStartConveyerAfterBrushes: "Thời gian khởi động băng tải sau chổi làm sạch",
  heatingOnIfPt100IsNotUse: "Bật gia nhiệt khi không sử dụng cảm biến PT100",
  trimmingHeatingTimeForPwm: "Thời gian nhiệt khi dùng cảm biến PWM",
  accelerationSplicingDevice: "Thời gian tăng tốc cơ cấu nối",
  decelerationSplicingDevice: "Thời gian giảm tốc cơ cấu nối",
  manualSpeedSplicingDevice: "Tốc độ bằng tay cơ cấu nối",
  accelerationPositioningConveyers: "Thời gian tăng tốc băng tải định vị",
  decelerationPositioningConveyers: "Thời gian giảm tốc băng tải định vị",
  manualSpeedPositioningConveyers: "Tốc độ bằng tay băng tải định vị",
  slowAutoSpeedPositioningConveyers: "Tốc độ tự động chậm băng tải định vị",
  accelerationFeedingDevice: "Thời gian tăng tốc cơ cấu cấp liệu",
  decelerationFeedingDevice: "Thời gian giảm tốc cơ cấu cấp liệu",
  manualSpeedFeedingDevice: "Tốc độ bằng tay cơ cấu cấp liệu",
  testConveyersSpeed: "Tốc độ kiểm tra băng tải",
  cuttingAngleSettingAutoFastSpeed: "Cài đặt góc cắt - tốc độ tự động nhanh",
  cuttingAngleSettingAutoSlowSpeed: "Cài đặt góc cắt - tốc độ tự động chậm",
  cuttingAngleSettingManualSpeed: "Cài đặt góc cắt - tốc độ bằng tay",
  cuttingAngleSettingRetardation: "Cài đặt góc cắt - giảm tốc",
  cuttingAngleSettingHysteresis: "Cài đặt góc cắt - độ trễ",
  splicingAngleSettingAutoFastSpeed: "Cài đặt góc nối - tốc độ tự động nhanh",
  splicingAngleSettingAutoSlowSpeed: "Cài đặt góc nối - tốc độ tự động chậm",
  splicingAngleSettingManualSpeed: "Cài đặt góc nối - tốc độ bằng tay",
  splicingAngleSettingRetardation: "Cài đặt góc nối - giảm tốc",
  splicingAngleSettingHysteresis: "Cài đặt góc nối - độ trễ",
  tensionOfLetOffMaterial: "Lực căng vật liệu xả",
  tensionOfLetOffWrap: "Lực căng dây quấn xả",
  letOffMaterialMinCoil: "Đường kính nhỏ nhất cuộn xả vật liệu",
  letOffWrapMinCoil: "Đường kính nhỏ nhất cuộn quấn",
  letOffMaterialFullCoil: "Đường kính đầy cuộn vật liệu",
  letOffWrapEmptyCoil: "Đường kính rỗng cuộn quấn",
  letOffWrapThickness: "Độ dày cuộn quấn",
  letOffBeginOfMaterialSpeed: "Tốc độ bắt đầu của cuộn vật liệu",
  letOffBeginOfWrapSpeed: "Lực bắt đầu của cuộn quấn",
  letOffEndOfMaterialSpeed: "Tốc độ kết thúc của cuộn vật liệu",
  letOffEndOfWrapSpeed: "Lực kết thúc của cuộn quấn",
  angleCalculatorEdge: "Giá trị tính toán góc",
  angleCalculatorWidth: "Bộ tính góc - chiều rộng",
  edgeCalculatorWidth: "Bộ tính mép - chiều rộng",
  edgeCalculatorAngle: "Giá trị tính toán mép cắt",
  pullRollManualSpeed: "Tốc độ tự động tay kéo",
  pullRollAutoSpeed: "Tốc độ tự động tự kéo",
  trimmingManualSpeed: "Tốc độ bằng tay dao xén biên",
  trimmingAutoSpeed: "Tốc độ tự động dao xén biên",
  trimmingDistanceFromSensor: "Khoảng cách từ cảm biến đến dao xén biên",
  smoothingRollManualSpeed: "Tốc độ bằng tay lô làm phẳng",
  edgingConveyerManualSpeed: "Tốc độ bằng tay băng tải ép biên",
  edgingConveyerAutoSpeed: "Tốc độ tự động băng tải ép biên",
  edgingBrushesSpeed: "Tốc độ chổi ép biên",
  stripMagazineManualSpeed: "Tốc độ bằng tay băng chứa dải mảnh",
  cuttingRollManualSpeed: "Tốc độ bằng tay lô cắt",
  stripMagazineSpeedFactorNegativeEdge: "Hệ số tốc độ băng chứa - mép âm",
  stripMagazineSpeedFactorPositiveEdge: "Hệ số tốc độ băng chứa - mép dương",
  cuttingRollSpeedFactorNegativeEdge: "Hệ số tốc độ lô cắt - mép âm",
  cuttingRollSpeedFactorPositiveEdge: "Hệ số tốc độ lô cắt - mép dương",
  pulleysCalculationsStripOverlap: "Tính toán puly - độ chồng dải mảnh",
  pulleysCalculationsMiddleOffset: "Tính toán puly - độ lệch tâm",
  pulleysCalculationsDistance: "Tính toán puly - khoảng cách",
  safetyDistanceBetweenPulleys: "Khoảng cách an toàn giữa các puly",
  speedOfBeltVibration: "Tốc độ rung băng tải",
  switchOffBeltVibration: "Ngừng rung băng tải",
  autoSpeedFeedingDeviceBw: "Tốc độ tự động cơ cấu cấp liệu (lùi)",
  feedingDeviceEndPosition: "Vị trí cuối cơ cấu cấp liệu",
  feedingDeviceBasicPosition: "Vị trí gốc cơ cấu cấp liệu",
  shearConveyerPrepositioningSpeed: "Tốc độ định vị trước của băng tải dao cắt",
  offsetDistanceForPrepositioning: "Khoảng bù định vị trước",
  speedRatioFeedingShearConveyer: "Tỷ lệ tốc độ băng tải cấp liệu/băng tải dao cắt",
  speedRatioSplicingFeedingConveyer: "Tỷ lệ tốc độ cơ cấu nối/băng tải cấp liệu",
  speedRatioTakeoffSplicingConveyer: "Tỷ lệ tốc độ băng tải ra liệu/cơ cấu nối",
  speedForSwitchOnFastWrapWindUp: "Tốc độ chuyển sang quấn cuộn thu nhanh",
  windUpTravelFastSpeed: "Tốc độ di chuyển nhanh của cuộn thu",
  windUpTravelSlowSpeed: "Tốc độ di chuyển chậm của cuộn thu",
  cuttingAngleForCalibration: "Góc cắt hiệu chuẩn",
  splicingAngleForCalibration: "Góc nối hiệu chuẩn",
  wrapWindUpMinSpeed: "Tốc độ nhỏ nhất cuộn thu dây quấn",
  wrapWindUpMaxSpeed: "Tốc độ lớn nhất cuộn thu dây quấn"
};

const SettingORCVHistory = ({ equipmentId, onClose }) => {
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

      console.log(">>> [SettingORCVHistory] Gọi API history setting với params:", params);
      const res = await getChartSettingORCVHistory(params);
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
      toast.error('Lỗi khi tải lịch sử Setting ORCV');
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

    const baseCols = [];
    if ('creatDate' in record) baseCols.push({ key: 'creatDate', label: 'Ngày giờ' });
    else if ('ngayGio' in record) baseCols.push({ key: 'ngayGio', label: 'Ngày giờ' });

    if ('ca' in record) baseCols.push({ key: 'ca', label: 'Ca' });

    if ('historyDate' in record) baseCols.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) baseCols.push({ key: 'history_date', label: 'History Date' });

    const displayFields = Object.keys(localizedLabels).map(key => ({
      key,
      label: localizedLabels[key]
    }));

    const matched = displayFields.filter(f => f.key in record);
    return [...baseCols, ...matched];
  };

  const columns = getColumns();

  // Hàm xử lý xuất dữ liệu bảng lịch sử thông số cài đặt máy Cắt Vải ra file Excel
  const handleExportExcel = () => {
    console.log(`>>> [SettingORCVHistory] Người dùng bấm Xuất Excel - Máy: ${equipmentId}, Số bản ghi: ${historyList.length}`);
    const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    exportTableToExcel({
      data: historyList,
      columns: columns,
      fileName: `LichSu_ThongSo_CaiDat_${equipmentId || 'ORCV'}_${timeStamp}`,
      sheetName: 'ThongSoSettingCV',
      title: `LỊCH SỬ THÔNG SỐ CÀI ĐẶT (SETTING HISTORY) — MÁY ${equipmentId}`,
      metadata: {
        'Mã máy': equipmentId,
        'Từ ngày': fromDate ? fromDate.replace('T', ' ') : 'Mặc định',
        'Đến ngày': toDate ? toDate.replace('T', ' ') : 'Hiện tại',
        'Tổng số bản ghi': historyList.length,
        'Thời gian xuất': new Date().toLocaleString('vi-VN')
      }
    });
  };

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
          padding: '12px 16px', background: '#ea580c', color: '#ffffff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 'bold' }}>
            LỊCH SỬ THÔNG SỐ CÀI ĐẶT (SETTING HISTORY) — {equipmentId}
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
            height: '26px', padding: '0 16px', fontSize: '11px', background: '#ea580c',
            color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer'
          }}>TÌM KIẾM</button>
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
                      padding: '6px 8px', fontSize: '10px', background: '#ea580c',
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

export default SettingORCVHistory;
