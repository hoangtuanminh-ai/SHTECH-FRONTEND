import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getChartRealTimeORCVHistory } from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';

// Khoảng thời gian mặc định của popup lịch sử thông số hoạt động: 24 GIỜ GẦN NHẤT
// tính từ thời điểm mở popup. Trước đây để trống nên API trả về toàn bộ lịch sử,
// vừa nặng vừa khó tìm đúng bản ghi cần xem.
// Số dòng mỗi trang của popup lịch sử.
// Bộ lọc đã mặc định 24 giờ gần nhất nên số bản ghi vốn đã bị giới hạn.
// Vì vậy lấy trọn khoảng đó trong MỘT trang thay vì cắt nhỏ, người dùng
// không phải bấm chuyển trang. Giá trị đủ lớn để chứa hết 24h dữ liệu.
const PAGE_SIZE = 5000;

// Khoảng thời gian mặc định của popup lịch sử thông số hoạt động: 12 GIỜ GẦN NHẤT
// tính từ thời điểm mở popup (thay vì 24 giờ như trước đây).
const HOURS_BACK = 12;

const toLocalDateTimeInput = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// Trả về { from, to } dạng 'YYYY-MM-DDTHH:mm' cho 12 giờ gần nhất
const getDefaultRange = () => {
  const now = new Date();
  const from = new Date(now.getTime() - HOURS_BACK * 60 * 60 * 1000);
  return { from: toLocalDateTimeInput(from), to: toLocalDateTimeInput(now) };
};

// Các trường việt hóa để hiển thị tiêu đề cột
const localizedLabels = {
  cutAngle: "Góc cắt",
  splicingAngle: "Góc nối",
  actualLength: "Chiều dài cuộn thu / thực tế",
  stripLength: "Chiều dài dải mảnh",
  requiredPosition: "Vị trí yêu cầu",
  trimmingKnivesLeftTemperature: "Nhiệt độ dao xén biên trái",
  trimmingKnivesRightTemperature: "Nhiệt độ dao xén biên phải",
  actualDiameterWindUp: "Đường kính thực tế cuộn thu",
  actualDiameterOfMaterialCoil: "Đường kính cuộn vật liệu xả",
  actualDiameterOfWrapCoil: "Đường kính cuộn quấn xả",
  actualLengthOfLetOffMaterial: "Chiều dài vật liệu xả",
  numberOfCutMin: "Số lần cắt/phút",
  pulleys1ActualPosition: "Vị trí puly phải / puly 1",
  pulleys2ActualPosition: "Vị trí puly trái / puly 2",
  recipeNumber: "Số công thức",
  pulley1BasicPosition: "Vị trí nhỏ nhất puly phải / puly 1 gốc",
  pulley1EndPosition: "Vị trí lớn nhất puly phải / puly 1 cuối",
  pulley2BasicPosition: "Vị trí lớn nhất puly trái / puly 2 gốc",
  pulley2EndPosition: "Vị trí mép vật liệu / puly 2 cuối",
  feedingDevicePosition: "Vị trí cơ cấu cấp liệu",
  feedingConveyerOutOfShearPosition: "Vị trí băng tải cấp liệu sau dao cắt",
  windupMaterialDiameter: "Đường kính cuộn vật liệu của cuộn thu",
  windupWrapDiameter: "Đường kính cuộn quấn của cuộn thu",
  windupMaterialCalculatedRequiredRevolutions: "Số vòng quay yêu cầu tính toán của cuộn thu vật liệu (%)",
  takeoffLenght: "Chiều dài ra liệu",
  lengthOfLetOffMaterialShiftA: "Chiều dài vật liệu xả ca A",
  lengthOfLetOffMaterialShiftB: "Chiều dài vật liệu xả ca B",
  lengthOfLetOffMaterialShiftC: "Chiều dài vật liệu xả ca C",
  numberOfCoilsShiftA: "Số cuộn ca A",
  numberOfCoilsShiftB: "Số cuộn ca B",
  numberOfCoilsShiftC: "Số cuộn ca C",
  numberOfCutsShiftA: "Số lần cắt ca A",
  numberOfCutsShiftB: "Số lần cắt ca B",
  numberOfCutsShiftC: "Số lần cắt ca C",
  maintenanceLengthOfLetOffMaterial: "Chiều dài vật liệu xả bảo dưỡng",
  maintenanceNumberOfCuts: "Số lần cắt bảo dưỡng",
  totalNumberOfCuts: "Tổng số lần cắt",
  timeOfShearDriveRunning: "Thời gian chạy truyền động dao cắt",
  windupAMaterialDiameter: "Đường kính cuộn vật liệu cuộn thu A",
  windupAWrapDiameter: "Đường kính cuộn quấn cuộn thu A",
  windupBMaterialDiameter: "Đường kính cuộn vật liệu cuộn thu B",
  windupBWrapDiameter: "Đường kính cuộn quấn cuộn thu B",
  windupALenght: "Chiều dài cuộn thu A",
  windupBLenght: "Chiều dài cuộn thu B",
  angleCalculatorAngle: "Bộ tính góc - Góc",
  edgeCalculatorEdge: "Bộ tính mép - Mép",
  sensorSignalCutting: "Cảm biến cắt",
  sensorSignalSplicing: "Cảm biến nối"
};

const RealTimeORCVHistory = ({ equipmentId, onClose }) => {
  const [historyList, setHistoryList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Bộ lọc ngày giờ - mặc định 12 giờ gần nhất kể từ thời điểm mở popup
  const [defaultRange] = useState(() => getDefaultRange());
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);

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
    const datePart = parts[0].replace(/-/g, ''); // yyyyMMdd
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

      console.log(">>> [RealTimeORCVHistory] Gọi API history realtime với params:", params);
      const res = await getChartRealTimeORCVHistory(params);
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
      toast.error('Lỗi khi tải lịch sử RealTime ORCV');
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

  // Xác định danh sách cột động dựa trên bản ghi đầu tiên
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
      { key: "cutAngle", label: "Góc cắt" },
      { key: "splicingAngle", label: "Góc nối" },
      { key: "actualLength", label: "Chiều dài cuộn thu" },
      { key: "stripLength", label: "Chiều dài dải mảnh tính toán" },
      { key: "requiredPosition", label: "Vị trí yêu cầu của cơ cấu cấp liệu" },
      { key: "trimmingKnivesLeftTemperature", label: "Nhiệt độ dao xén biên trái" },
      { key: "trimmingKnivesRightTemperature", label: "Nhiệt độ dao xén biên phải" },
      { key: "actualDiameterWindUp", label: "Đường kính thực tế cuộn thu" },
      { key: "actualDiameterOfMaterialCoil", label: "Đường kính cuộn vật liệu xả" },
      { key: "actualDiameterOfWrapCoil", label: "Đường kính cuộn quấn xả" },
      { key: "actualLengthOfLetOffMaterial", label: "Chiều dài vật liệu xả" },
      { key: "numberOfCutMin", label: "Số lần cắt/phút" },
      { key: "pulleys1ActualPosition", label: "Vị trí puly phải" },
      { key: "pulleys2ActualPosition", label: "Vị trí puly trái" },
      { key: "recipeNumber", label: "Số công thức" },
      { key: "pulley1BasicPosition", label: "Vị trí nhỏ nhất puly phải" },
      { key: "pulley1EndPosition", label: "Vị trí lớn nhất puly phải" },
      { key: "pulley2BasicPosition", label: "Vị trí lớn nhất puly trái" },
      { key: "pulley2EndPosition", label: "Vị trí mép vật liệu" },
      { key: "feedingDevicePosition", label: "Vị trí cơ cấu cấp liệu" },
      { key: "feedingConveyerOutOfShearPosition", label: "Vị trí băng tải cấp liệu sau dao cắt" },
      { key: "windupMaterialDiameter", label: "Đường kính cuộn vật liệu của cuộn thu" },
      { key: "windupWrapDiameter", label: "Đường kính cuộn quấn của cuộn thu" },
      { key: "windupMaterialCalculatedRequiredRevolutions", label: "Số vòng quay yêu cầu tính toán của cuộn thu vật liệu (%)" },
      { key: "takeoffLenght", label: "Chiều dài ra liệu" },
      { key: "lengthOfLetOffMaterialShiftA", label: "Chiều dài vật liệu xả ca A" },
      { key: "lengthOfLetOffMaterialShiftB", label: "Chiều dài vật liệu xả ca B" },
      { key: "lengthOfLetOffMaterialShiftC", label: "Chiều dài vật liệu xả ca C" },
      { key: "numberOfCoilsShiftA", label: "Số cuộn ca A" },
      { key: "numberOfCoilsShiftB", label: "Số cuộn ca B" },
      { key: "numberOfCoilsShiftC", label: "Số cuộn ca C" },
      { key: "numberOfCutsShiftA", label: "Số lần cắt ca A" },
      { key: "numberOfCutsShiftB", label: "Số lần cắt ca B" },
      { key: "numberOfCutsShiftC", label: "Số lần cắt ca C" },
      { key: "maintenanceLengthOfLetOffMaterial", label: "Chiều dài vật liệu xả bảo dưỡng" },
      { key: "maintenanceNumberOfCuts", label: "Số lần cắt bảo dưỡng" },
      { key: "totalNumberOfCuts", label: "Tổng số lần cắt" },
      { key: "timeOfShearDriveRunning", label: "Thời gian chạy truyền động dao cắt" }
    ];

    const fieldsCV02_03 = [
      { key: "cutAngle", label: "Góc cắt" },
      { key: "splicingAngle", label: "Góc nối" },
      { key: "actualLength", label: "Chiều dài thực tế" },
      { key: "stripLength", label: "Chiều dài dải mảnh" },
      { key: "requiredPosition", label: "Vị trí yêu cầu" },
      { key: "trimmingKnivesLeftTemperature", label: "Nhiệt độ dao xén biên trái" },
      { key: "trimmingKnivesRightTemperature", label: "Nhiệt độ dao xén biên phải" },
      { key: "actualDiameterWindUp", label: "Đường kính thực tế cuộn thu" },
      { key: "actualDiameterOfMaterialCoil", label: "Đường kính cuộn vật liệu xả" },
      { key: "actualDiameterOfWrapCoil", label: "Đường kính cuộn quấn xả" },
      { key: "actualLengthOfLetOffMaterial", label: "Chiều dài vật liệu xả" },
      { key: "numberOfCutMin", label: "Số lần cắt/phút" },
      { key: "pulleys1ActualPosition", label: "Vị trí puly 1" },
      { key: "pulleys2ActualPosition", label: "Vị trí puly 2" },
      { key: "recipeNumber", label: "Số công thức" },
      { key: "pulley1BasicPosition", label: "Vị trí nhỏ nhất puly 1" },
      { key: "pulley1EndPosition", label: "Vị trí lớn nhất puly 1" },
      { key: "pulley2BasicPosition", label: "Vị trí lớn nhất puly 2" },
      { key: "pulley2EndPosition", label: "Vị trí mép vật liệu" },
      { key: "feedingDevicePosition", label: "Vị trí cơ cấu cấp liệu" },
      { key: "feedingConveyerOutOfShearPosition", label: "Vị trí băng tải cấp liệu sau dao cắt" },
      { key: "windupAMaterialDiameter", label: "Đường kính cuộn vật liệu cuộn thu A" },
      { key: "windupAWrapDiameter", label: "Đường kính cuộn quấn cuộn thu A" },
      { key: "windupBMaterialDiameter", label: "Đường kính cuộn vật liệu cuộn thu B" },
      { key: "windupBWrapDiameter", label: "Đường kính cuộn quấn cuộn thu B" },
      { key: "windupALenght", label: "Chiều dài cuộn thu A" },
      { key: "windupBLenght", label: "Chiều dài cuộn thu B" },
      { key: "takeoffLenght", label: "Chiều dài ra liệu" },
      { key: "lengthOfLetOffMaterialShiftA", label: "Chiều dài vật liệu ca A" },
      { key: "lengthOfLetOffMaterialShiftB", label: "Chiều dài vật liệu ca B" },
      { key: "lengthOfLetOffMaterialShiftC", label: "Chiều dài vật liệu ca C" },
      { key: "numberOfCoilsShiftA", label: "Số cuộn ca A" },
      { key: "numberOfCoilsShiftB", label: "Số cuộn ca B" },
      { key: "numberOfCoilsShiftC", label: "Số cuộn ca C" },
      { key: "numberOfCutsShiftA", label: "Số lần cắt ca A" },
      { key: "numberOfCutsShiftB", label: "Số lần cắt ca B" },
      { key: "numberOfCutsShiftC", label: "Số lần cắt ca C" },
      { key: "maintenanceLengthOfLetOffMaterial", label: "Chiều dài vật liệu xả bảo dưỡng" },
      { key: "maintenanceNumberOfCuts", label: "Số lần cắt bảo dưỡng" },
      { key: "totalNumberOfCuts", label: "Tổng số lần cắt" },
      { key: "timeOfShearDriveRunning", label: "Thời gian chạy truyền động dao cắt" }
    ];

    const displayFields = isCV01 ? fieldsCV01 : fieldsCV02_03;
    const matched = displayFields.filter(f => f.key in record);
    return [...baseCols, ...matched];
  };

  const columns = getColumns();

  // Render popup bằng React Portal
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
          padding: '12px 16px', background: '#1e40af', color: '#ffffff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 'bold' }}>
            LỊCH SỬ THÔNG SỐ THỜI GIAN THỰC (REALTIME HISTORY) — {equipmentId}
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
            height: '26px', padding: '0 16px', fontSize: '11px', background: '#1e40af',
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
                      padding: '6px 8px', fontSize: '10px', background: '#1e40af',
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
            {/* Bộ lọc mặc định 24 giờ nên dữ liệu thường nằm gọn trong một trang.
                Chỉ hiện nút chuyển trang khi thực sự có nhiều hơn một trang. */}
            {totalPages > 1 && (
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
            )}
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

export default RealTimeORCVHistory;
