import React, { useState, useEffect } from 'react';
import { 
  getChartRealTimeTH02History, 
  getChartRealTimeTH09History, 
  getChartSettingTH02History, 
  getChartSettingTH09History,
  getChartRealTimeTH05History,
  getChartSettingTH05History,
  getChartRealTimeORCVHistory,
  getChartSettingORCVHistory
} from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';

// Danh sách trường dữ liệu Setting của máy cắt vải (ORCV / CV)
const settingORCVFields = [
  { key: 'barcode', label: 'Mã vạch' },
  { key: 'maQuyCach', label: 'Mã quy cách' },
  { key: 'recipeNumber', label: 'Số công thức' },
  { key: 'widthOfInputMaterial', label: 'Chiều rộng dải mảnh / Vật liệu đầu vào' },
  { key: 'widthOfStrip', label: 'Chiều rộng vật liệu đầu vào / Dải mảnh' },
  { key: 'angle', label: 'Độ dày vật liệu / Góc cắt' },
  { key: 'autoSpeedFeedingConveyer', label: 'Tốc độ tự động băng tải cấp liệu' },
  { key: 'autoSpeedSplicingDevice', label: 'Tốc độ tự động cơ cấu nối' },
  { key: 'feedingConveyerDistanceFromSensorToSplicingPlace', label: 'Khoảng cách cảm biến đến vị trí nối' },
  { key: 'feedingConveyerOffsetDistanceForSlowSpeed', label: 'Khoảng bù giảm tốc băng tải cấp liệu' },
  { key: 'takeoffConveyerDistanceFromSensorToSplicingPlace', label: 'Khoảng cách cảm biến ra liệu đến vị trí nối' },
  { key: 'takeoffConveyerOffsetDistanceForSlowSpeed', label: 'Khoảng bù giảm tốc ra liệu' },
  { key: 'serviceModeJogTime', label: 'Thời gian chạy nhích chế độ bảo trì' },
  { key: 'delayConveyerDownAfterCut', label: 'Thời gian hạ băng tải sau khi cắt' },
  { key: 'timeForLightingOfSplicingWorkplace', label: 'Thời gian bật đèn vị trí nối' },
  { key: 'delayStartConveyerAfterBrushes', label: 'Thời gian khởi động băng tải sau chổi làm sạch' },
  { key: 'heatingOnIfPt100IsNotUse', label: 'Bật gia nhiệt khi không sử dụng cảm biến PT100' },
  { key: 'trimmingHeatingTimeForPwm', label: 'Thời gian nhiệt khi dùng cảm biến PWM' },
  { key: 'accelerationSplicingDevice', label: 'Thời gian tăng tốc cơ cấu nối' },
  { key: 'decelerationSplicingDevice', label: 'Thời gian giảm tốc cơ cấu nối' },
  { key: 'manualSpeedSplicingDevice', label: 'Tốc độ bằng tay cơ cấu nối' },
  { key: 'accelerationPositioningConveyers', label: 'Thời gian tăng tốc băng tải định vị' },
  { key: 'decelerationPositioningConveyers', label: 'Thời gian giảm tốc băng tải định vị' },
  { key: 'manualSpeedPositioningConveyers', label: 'Tốc độ bằng tay băng tải định vị' },
  { key: 'slowAutoSpeedPositioningConveyers', label: 'Tốc độ tự động chậm băng tải định vị' },
  { key: 'accelerationFeedingDevice', label: 'Thời gian tăng tốc cơ cấu cấp liệu' },
  { key: 'decelerationFeedingDevice', label: 'Thời gian giảm tốc cơ cấu cấp liệu' },
  { key: 'manualSpeedFeedingDevice', label: 'Tốc độ bằng tay cơ cấu cấp liệu' },
  { key: 'testConveyersSpeed', label: 'Tốc độ kiểm tra băng tải' },
  { key: 'cuttingAngleSettingAutoFastSpeed', label: 'Cài đặt góc cắt - tốc độ tự động nhanh' },
  { key: 'cuttingAngleSettingAutoSlowSpeed', label: 'Cài đặt góc cắt - tốc độ tự động chậm' },
  { key: 'cuttingAngleSettingManualSpeed', label: 'Cài đặt góc cắt - tốc độ bằng tay' },
  { key: 'cuttingAngleSettingRetardation', label: 'Cài đặt góc cắt - giảm tốc' },
  { key: 'cuttingAngleSettingHysteresis', label: 'Cài đặt góc cắt - độ trễ' },
  { key: 'splicingAngleSettingAutoFastSpeed', label: 'Cài đặt góc nối - tốc độ tự động nhanh' },
  { key: 'splicingAngleSettingAutoSlowSpeed', label: 'Cài đặt góc nối - tốc độ tự động chậm' },
  { key: 'splicingAngleSettingManualSpeed', label: 'Cài đặt góc nối - tốc độ bằng tay' },
  { key: 'splicingAngleSettingRetardation', label: 'Cài đặt góc nối - giảm tốc' },
  { key: 'splicingAngleSettingHysteresis', label: 'Cài đặt góc nối - độ trễ' },
  { key: 'tensionOfLetOffMaterial', label: 'Lực căng vật liệu xả' },
  { key: 'tensionOfLetOffWrap', label: 'Lực căng dây quấn xả' },
  { key: 'letOffMaterialMinCoil', label: 'Đường kính nhỏ nhất cuộn xả vật liệu' },
  { key: 'letOffWrapMinCoil', label: 'Đường kính nhỏ nhất cuộn quấn' },
  { key: 'letOffMaterialFullCoil', label: 'Đường kính đầy cuộn vật liệu' },
  { key: 'letOffWrapEmptyCoil', label: 'Đường kính rỗng cuộn quấn' },
  { key: 'letOffWrapThickness', label: 'Độ dày cuộn quấn' },
  { key: 'letOffBeginOfMaterialSpeed', label: 'Tốc độ bắt đầu của cuộn vật liệu' },
  { key: 'letOffBeginOfWrapSpeed', label: 'Lực bắt đầu của cuộn quấn' },
  { key: 'letOffEndOfMaterialSpeed', label: 'Tốc độ kết thúc của cuộn vật liệu' },
  { key: 'letOffEndOfWrapSpeed', label: 'Lực kết thúc của cuộn quấn' },
  { key: 'angleCalculatorEdge', label: 'Giá trị tính toán góc' },
  { key: 'angleCalculatorWidth', label: 'Bộ tính góc - chiều rộng' },
  { key: 'edgeCalculatorWidth', label: 'Bộ tính mép - chiều rộng' },
  { key: 'edgeCalculatorAngle', label: 'Giá trị tính toán mép cắt' },
  { key: 'pullRollManualSpeed', label: 'Tốc độ tự động tay kéo' },
  { key: 'pullRollAutoSpeed', label: 'Tốc độ tự động tự kéo' },
  { key: 'trimmingManualSpeed', label: 'Tốc độ bằng tay dao xén biên' },
  { key: 'trimmingAutoSpeed', label: 'Tốc độ tự động dao xén biên' },
  { key: 'trimmingDistanceFromSensor', label: 'Khoảng cách từ cảm biến đến dao xén biên' },
  { key: 'smoothingRollManualSpeed', label: 'Tốc độ bằng tay lô làm phẳng' },
  { key: 'edgingConveyerManualSpeed', label: 'Tốc độ bằng tay băng tải ép biên' },
  { key: 'edgingConveyerAutoSpeed', label: 'Tốc độ tự động băng tải ép biên' },
  { key: 'edgingBrushesSpeed', label: 'Tốc độ chổi ép biên' },
  { key: 'stripMagazineManualSpeed', label: 'Tốc độ bằng tay băng chứa dải mảnh' },
  { key: 'cuttingRollManualSpeed', label: 'Tốc độ bằng tay lô cắt' },
  { key: 'stripMagazineSpeedFactorNegativeEdge', label: 'Hệ số tốc độ băng chứa - mép âm' },
  { key: 'stripMagazineSpeedFactorPositiveEdge', label: 'Hệ số tốc độ băng chứa - mép dương' },
  { key: 'cuttingRollSpeedFactorNegativeEdge', label: 'Hệ số tốc độ lô cắt - mép âm' },
  { key: 'cuttingRollSpeedFactorPositiveEdge', label: 'Hệ số tốc độ lô cắt - mép dương' },
  { key: 'pulleysCalculationsStripOverlap', label: 'Tính toán puly - độ chồng dải mảnh' },
  { key: 'pulleysCalculationsMiddleOffset', label: 'Tính toán puly - độ lệch tâm' },
  { key: 'pulleysCalculationsDistance', label: 'Tính toán puly - khoảng cách' },
  { key: 'safetyDistanceBetweenPulleys', label: 'Khoảng cách an toàn giữa các puly' },
  { key: 'speedOfBeltVibration', label: 'Tốc độ rung băng tải' },
  { key: 'switchOffBeltVibration', label: 'Ngừng rung băng tải' },
  { key: 'autoSpeedFeedingDeviceBw', label: 'Tốc độ tự động cơ cấu cấp liệu (lùi)' },
  { key: 'feedingDeviceEndPosition', label: 'Vị trí cuối cơ cấu cấp liệu' },
  { key: 'feedingDeviceBasicPosition', label: 'Vị trí gốc cơ cấu cấp liệu' },
  { key: 'shearConveyerPrepositioningSpeed', label: 'Tốc độ định vị trước của băng tải dao cắt' },
  { key: 'offsetDistanceForPrepositioning', label: 'Khoảng bù định vị trước' },
  { key: 'speedRatioFeedingShearConveyer', label: 'Tỷ lệ tốc độ băng tải cấp liệu/băng tải dao cắt' },
  { key: 'speedRatioSplicingFeedingConveyer', label: 'Tỷ lệ tốc độ cơ cấu nối/băng tải cấp liệu' },
  { key: 'speedRatioTakeoffSplicingConveyer', label: 'Tỷ lệ tốc độ băng tải ra liệu/cơ cấu nối' },
  { key: 'speedForSwitchOnFastWrapWindUp', label: 'Tốc độ chuyển sang quấn cuộn thu nhanh' },
  { key: 'windUpTravelFastSpeed', label: 'Tốc độ di chuyển nhanh của cuộn thu' },
  { key: 'windUpTravelSlowSpeed', label: 'Tốc độ di chuyển chậm của cuộn thu' },
  { key: 'cuttingAngleForCalibration', label: 'Góc cắt hiệu chuẩn' },
  { key: 'splicingAngleForCalibration', label: 'Góc nối hiệu chuẩn' },
  { key: 'wrapWindUpMinSpeed', label: 'Tốc độ nhỏ nhất cuộn thu dây quấn' },
  { key: 'wrapWindUpMaxSpeed', label: 'Tốc độ lớn nhất cuộn thu dây quấn' },
  { key: 'globalDisableBarcode', label: 'Tắt quét mã vạch' },
  { key: 'globalEnableBarcode', label: 'Bật quét mã vạch' },
  { key: 'duongKinhBungTrongThan', label: 'Đường kính bụng trong thân' },
  { key: 'viTriCaSauHuongTam', label: 'Vị trí cả sấu hướng tâm' },
  { key: 'viTriCaSauHuongTruc', label: 'Vị trí cả sấu hướng trục' },
  { key: 'rongVaiLop', label: 'Rộng vai lớp' },
  { key: 'noiAp', label: 'Nối áp' },
  { key: 'apLucCaSau', label: 'Áp lực cả sấu' },
  { key: 'apLucCaTanh', label: 'Áp lực cả tanh' },
  { key: 'apLucCaVai', label: 'Áp lực cả vai' }
];

// Danh sách trường dữ liệu RealTime của máy cắt vải (ORCV / CV)
const realTimeORCVFields = [
  { key: 'barcode', label: 'Mã vạch' },
  { key: 'maQuyCach', label: 'Mã quy cách' },
  { key: 'recipeNumber', label: 'Số công thức' },
  { key: 'cutAngle', label: 'Góc cắt' },
  { key: 'splicingAngle', label: 'Góc nối' },
  { key: 'actualLength', label: 'Chiều dài cuộn thu / thực tế' },
  { key: 'stripLength', label: 'Chiều dài dải mảnh' },
  { key: 'requiredPosition', label: 'Vị trí yêu cầu' },
  { key: 'trimmingKnivesLeftTemperature', label: 'Nhiệt độ dao xén biên trái' },
  { key: 'trimmingKnivesRightTemperature', label: 'Nhiệt độ dao xén biên phải' },
  { key: 'actualDiameterWindUp', label: 'Đường kính thực tế cuộn thu' },
  { key: 'actualDiameterOfMaterialCoil', label: 'Đường kính cuộn vật liệu xả' },
  { key: 'actualDiameterOfWrapCoil', label: 'Đường kính cuộn quấn xả' },
  { key: 'actualLengthOfLetOffMaterial', label: 'Chiều dài vật liệu xả' },
  { key: 'numberOfCutMin', label: 'Số lần cắt/phút' },
  { key: 'pulleys1ActualPosition', label: 'Vị trí puly phải / puly 1' },
  { key: 'pulleys2ActualPosition', label: 'Vị trí puly trái / puly 2' },
  { key: 'pulley1BasicPosition', label: 'Vị trí nhỏ nhất puly phải / puly 1 gốc' },
  { key: 'pulley1EndPosition', label: 'Vị trí lớn nhất puly phải / puly 1 cuối' },
  { key: 'pulley2BasicPosition', label: 'Vị trí lớn nhất puly trái / puly 2 gốc' },
  { key: 'pulley2EndPosition', label: 'Vị trí mép vật liệu / puly 2 cuối' },
  { key: 'feedingDevicePosition', label: 'Vị trí cơ cấu cấp liệu' },
  { key: 'feedingConveyerOutOfShearPosition', label: 'Vị trí băng tải cấp liệu sau dao cắt' },
  { key: 'windupMaterialDiameter', label: 'Đường kính cuộn vật liệu của cuộn thu' },
  { key: 'windupWrapDiameter', label: 'Đường kính cuộn quấn của cuộn thu' },
  { key: 'windupMaterialCalculatedRequiredRevolutions', label: 'Số vòng quay yêu cầu tính toán của cuộn thu vật liệu (%)' },
  { key: 'takeoffLenght', label: 'Chiều dài ra liệu' },
  { key: 'lengthOfLetOffMaterialShiftA', label: 'Chiều dài vật liệu xả ca A' },
  { key: 'lengthOfLetOffMaterialShiftB', label: 'Chiều dài vật liệu xả ca B' },
  { key: 'lengthOfLetOffMaterialShiftC', label: 'Chiều dài vật liệu xả ca C' },
  { key: 'numberOfCoilsShiftA', label: 'Số cuộn ca A' },
  { key: 'numberOfCoilsShiftB', label: 'Số cuộn ca B' },
  { key: 'numberOfCoilsShiftC', label: 'Số cuộn ca C' },
  { key: 'numberOfCutsShiftA', label: 'Số lần cắt ca A' },
  { key: 'numberOfCutsShiftB', label: 'Số lần cắt ca B' },
  { key: 'numberOfCutsShiftC', label: 'Số lần cắt ca C' },
  { key: 'maintenanceLengthOfLetOffMaterial', label: 'Chiều dài vật liệu xả bảo dưỡng' },
  { key: 'maintenanceNumberOfCuts', label: 'Số lần cắt bảo dưỡng' },
  { key: 'totalNumberOfCuts', label: 'Tổng số lần cắt' },
  { key: 'timeOfShearDriveRunning', label: 'Thời gian chạy truyền động dao cắt' },
  { key: 'windupAMaterialDiameter', label: 'Đường kính cuộn vật liệu cuộn thu A' },
  { key: 'windupAWrapDiameter', label: 'Đường kính cuộn quấn cuộn thu A' },
  { key: 'windupBMaterialDiameter', label: 'Đường kính cuộn vật liệu cuộn thu B' },
  { key: 'windupBWrapDiameter', label: 'Đường kính cuộn quấn cuộn thu B' },
  { key: 'windupALenght', label: 'Chiều dài cuộn thu A' },
  { key: 'windupBLenght', label: 'Chiều dài cuộn thu B' },
  { key: 'angleCalculatorAngle', label: 'Bộ tính góc - Góc' },
  { key: 'edgeCalculatorEdge', label: 'Bộ tính mép - Mép' },
  { key: 'sensorSignalCutting', label: 'Cảm biến cắt' },
  { key: 'sensorSignalSplicing', label: 'Cảm biến nối' }
];

/* ─── Hằng số thuộc tính TH09+ ────────────────────────────────────────────── */
const realTimeTH09Fields = [
  { key: 'viTriCaSauHuongTam', label: 'Vị trí cà sau hướng tâm' },
  { key: 'viTriCaSauHuongTruc', label: 'Vị trí cà sau hướng trục' },
  { key: 'rongVaiLop', label: 'Rộng vai lốp(mm)' },
  { key: 'noiAp', label: 'Nội áp(bar)' },
  { key: 'apLucCaSau', label: 'Áp lực cà sau(bar)' },
  { key: 'apLucCaTanh', label: 'Áp lực cà tanh(bar)' },
  { key: 'apLucCaVai', label: 'Áp lực cà vai(bar)' },
  { key: 'globalDisableBarcode', label: 'Yêu cầu tích mã vạch' },
  { key: 'globalEnableBarcode', label: 'Trạng thái tích mã vạch' }
];

const realTimeTH02Fields = [
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

const settingTH09Fields = [
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

const settingTH02Fields = [
  { key: 'apLucCaBocGot', label: 'Áp lực cà bóc gót' },
  { key: 'tocDoCaBocGot', label: 'Tốc độ cà bóc gót' },
  { key: 'thoiGianCaBocGot', label: 'Thời gian cà bóc gót' },
  { key: 'apLucCaoCaVaiThan', label: 'Áp lực cao cà vải thân' },
  { key: 'apLucThapCaVaiThan', label: 'Áp lực thấp cà vải thân' },
  { key: 'doRongSieuDinhHinhTrongChinh', label: 'Độ rộng siêu đ.hình trong' },
  { key: 'khoangCachDatTanhTrongChinh', label: 'KC đặt tanh trong' },
  { key: 'doRongDuDinhHinh', label: 'Độ rộng dư định hình' },
  { key: 'doRongDinhHinhTrongChinh', label: 'Độ rộng đ.hình trong' },
  { key: 'chieuDaiCatVaiThan', label: 'Chiều dài vai thân' },
  { key: 'chieuDaiHieuChuanVaiThan', label: 'CD hiệu chuẩn vai thân' },
  { key: 'duongKinhDanHopTrongThan', label: 'ĐK dán hộp trống' },
  { key: 'duongKinhTrongThanLonNhat', label: 'ĐK trống lớn nhất' },
  { key: 'duongKinhTrongThanNhoNhat', label: 'ĐK trống nhỏ nhất' },
  { key: 'chieuDaiCatToHopTLTPA', label: 'CD cắt tổ hợp tang lót' },
  { key: 'chieuDaiCatToHopHieuChuanTLTPA', label: 'CD HC tổ hợp tang lót' },
  { key: 'caHongCaoAp', label: 'Cà hông cao áp' },
  { key: 'caHongThapAp', label: 'Cà hông thấp áp' },
  { key: 'apLucCaHongDuoi', label: 'Áp lực cà hông dưới' },
  { key: 'apLucCaHongSuTamGiac', label: 'Áp lực cà hông sự TG' },
  { key: 'apLucCaHongTren', label: 'Áp lực cà hông trên' },
  { key: 'apLucCaKhuVucGiua', label: 'Áp lực cà khu vực giữa' },
  { key: 'apLucCaPhanVai', label: 'Áp lực cà phần vai' },
  { key: 'apLucCaMepBien', label: 'Áp lực cà mép biên' },
  { key: 'viTriDauCaMatChayViTriHuongTam', label: 'Đầu cà MC H.Tâm' },
  { key: 'viTriDauCaMatChayViTriHuongTruc', label: 'Đầu cà MC H.Trục' },
  { key: 'viTriDauCaMatChayViTriHuongXoay', label: 'Đầu cà MC H.Xoay' },
  { key: 'viTriCuoiVungCaThapApViTriTam', label: 'Cuối thấp áp H.Tâm' },
  { key: 'viTriCuoiVungCaThapApViTriHuongTruc', label: 'Cuối thấp áp H.Trục' },
  { key: 'viTriCuoiVungCaThapApViTriHuongXoay', label: 'Cuối thấp áp H.Xoay' },
  { key: 'viTriDauCaCaoApViTriXoay', label: 'Đầu cao áp H.Xoay' },
  { key: 'viTriDauCaCaoApViTriHuongTam', label: 'Đầu cao áp H.Tâm' },
  { key: 'viTriDauCaCaoApViTriHuongTruc', label: 'Đầu cao áp H.Trục' },
  { key: 'viTriMepBienMatLopViTriXoay', label: 'Mép biên mặt lớp H.Xoay' },
  { key: 'viTriMepBienMatLopViTriHuongTruc', label: 'Mép biên mặt lớp H.Trục' },
  { key: 'viTriMepBienMatLopViTriXoay1', label: 'Mép biên mặt lớp H.Xoay 1' },
  { key: 'gocCa1HoanThanhViTriHuongTam', label: 'Góc cà 1 HT H.Tâm' },
  { key: 'gocCa1HoanThanhViTriHuongTruc', label: 'Góc cà 1 HT H.Trục' },
  { key: 'gocCa1HoanThanhViTriXoay', label: 'Góc cà 1 HT H.Xoay' },
  { key: 'gocCa2HoanThanhViTriHuongTam', label: 'Góc cà 2 HT H.Tâm' },
  { key: 'gocCa2HoanThanhViTriHuongTruc', label: 'Góc cà 2 HT H.Trục' },
  { key: 'gocCa2HoanThanhViTriXoay', label: 'Góc cà 2 HT H.Xoay' },
  { key: 'viTriChoCaHuongTamViTriHuongTam', label: 'Chờ cà H.Tâm H.Tâm' },
  { key: 'viTriChoCaHuongTamViTriHuongTruc', label: 'Chờ cà H.Tâm H.Trục' },
  { key: 'viTriChoCaHuongTamViTriXoay', label: 'Chờ cà H.Tâm H.Xoay' },
  { key: 'viTriDauCaHongViTriHuongTam', label: 'Đầu cà hồng H.Tâm' },
  { key: 'viTriDauCaHongViTriHuongTruc', label: 'Đầu cà hồng H.Trục' },
  { key: 'viTriDauCaHongViTriXoay', label: 'Đầu cà hồng H.Xoay' },
  { key: 'viTriDauCaThapApVungGiuaHoanThanhViTriHuongTam', label: 'Đầu thấp áp giữa H.Tâm' },
  { key: 'viTriDauCaThapApVungGiuaViTriHuongTruc', label: 'Đầu thấp áp giữa H.Trục' },
  { key: 'viTriDauCaThapApVungGiuaViTriXoay', label: 'Đầu thấp áp giữa H.Xoay' },
  { key: 'viTriDauCaThapApVungTrenHoanThanhViTriHuongTam', label: 'Đầu thấp áp trên H.Tâm' },
  { key: 'viTriDauCaThapApVungTrenViTriHuongTruc', label: 'Đầu thấp áp trên H.Trục' },
  { key: 'viTriDauCaThapApVungTrenViTriXoay', label: 'Đầu thấp áp trên H.Xoay' },
  { key: 'viTriCuoiCaHongHoanThanhViTriHuongTam', label: 'Cuối cà hồng H.Tâm' },
  { key: 'viTriCuoiCaHongHoanThanhViTriHuongTruc', label: 'Cuối cà hồng H.Trục' },
  { key: 'viTriCuoiCaHongHoanThanhViTriXoay', label: 'Cuối cà hồng H.Xoay' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTam', label: 'Đầu tam giác H.Tâm' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTruc', label: 'Đầu tam giác H.Trục' },
  { key: 'viTriDauCaSuTamGiacViTriXoay', label: 'Đầu tam giác H.Xoay' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTam1', label: 'Đầu tam giác H.Tâm 1' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTruc1', label: 'Đầu tam giác H.Trục 1' },
  { key: 'viTriDauCaSuTamGiacViTriXoay1', label: 'Đầu tam giác H.Xoay 1' },
  { key: 'viTriCuoiHoanThanhViTriHuongTam', label: 'Cuối hoàn thành H.Tâm' },
  { key: 'viTriCuoiHoanThanhViTriHuongTruc', label: 'Cuối hoàn thành H.Trục' },
  { key: 'viTriCuoiHoanThanhViTriXoay', label: 'Cuối hoàn thành H.Xoay' },
  { key: 'viTriChuyenThapApViTriHuongTam', label: 'Chuyển thấp áp H.Tâm' },
  { key: 'viTriChuyenThapApViTriHuongTruc', label: 'Chuyển thấp áp H.Trục' },
  { key: 'viTriChuyenThapApViTriXoay', label: 'Chuyển thấp áp H.Xoay' }
];

const realTimeTH05Fields = [
  { key: 'prgmServoBDSVActualVelocity', label: 'Tốc độ trống hoãn xung (°/s)' },
  { key: 'prgmServoBDSVCActPos', label: 'Góc Servo trống hoãn xung (°)' },
  { key: 'prgmServoBtrSVActualVelocity', label: 'Tốc độ vòng BTR (mm/s)' },
  { key: 'prgmServoBtrSVCActPos', label: 'Vị trí servo vòng BTR (mm)' },
  { key: 'prgmServoSDSVActualVelocity', label: 'Tốc độ trống chính' },
  { key: 'prgmServoSDSDEncodWid', label: 'Vị trí hiện tại trống thành hình (°)' },
  { key: 'prgmServoSDSVCActPos', label: 'Góc Servo trống thành hình' },
  { key: 'prgmServoSt3SVCActPos', label: 'Vị trí trục 3 cà sau (mm)' },
  { key: 'prgmServoSt4SVCActPos', label: 'Vị trí trục 4 cà sau (mm)' },
  { key: 'globalAISDLkPres', label: 'Áp lực nan quạt' },
  { key: 'globalAISDPres', label: 'Nội áp' }
];

const settingTH05Fields = [
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

const HistorySynthesis = ({ mayList = [], type = 'realtime' }) => {
  const [maMay, setMaMay] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100); // Kích thước trang mặc định là 100 dòng thay vì 1.000
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [historyList, setHistoryList] = useState([]);
  const [cols, setCols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Thiết lập mã máy mặc định khi mayList được tải xong
  useEffect(() => {
    if (mayList.length > 0 && !maMay) {
      setMaMay(mayList[0]?.EquipmentID || mayList[0]?.MaMay || '');
    }
  }, [mayList]);

  // Hàm phát hiện số máy để kiểm tra xem có >= 9 hay không
  const getMachineNumber = (id) => {
    if (!id) return 0;
    const match = id.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const th05Machines = ['05', '14', '15', '16', '17', '5', 'TH05', 'TH14', 'TH15', 'TH16', 'TH17'];
  const getMachineNumberStr = (id) => {
    if (!id) return '';
    const match = id.match(/\d+/);
    return match ? match[0] : '';
  };

  // Hàm phát hiện máy cắt vải (ORCV / CV / CATVAI / MCV)
  const isCatVaiMachine = (id) => {
    if (!id) return false;
    const upper = String(id).toUpperCase();
    return upper.includes('CV') || upper.includes('ORCV') || upper.includes('CATVAI') || upper.includes('CẮT VẢI') || upper.includes('MCV');
  };

  // Loại bỏ hoàn toàn các trường hệ thống và thời gian, đồng thời Việt hóa nhãn cột
  const getDynamicFields = (record) => {
    if (!record) return [];

    const isCatVaiGroup = isCatVaiMachine(maMay);
    const isTH05Group = th05Machines.includes(maMay) || th05Machines.includes(getMachineNumberStr(maMay));
    let definedFields = [];
    if (isCatVaiGroup) {
      definedFields = type === 'realtime' ? realTimeORCVFields : settingORCVFields;
    } else if (isTH05Group) {
      definedFields = type === 'realtime' ? realTimeTH05Fields : settingTH05Fields;
    } else {
      const isTH09Plus = getMachineNumber(maMay) >= 9;
      if (type === 'realtime') {
        definedFields = isTH09Plus ? realTimeTH09Fields : realTimeTH02Fields;
      } else {
        definedFields = isTH09Plus ? settingTH09Fields : settingTH02Fields;
      }
    }

    const baseCols = [];
    if ('creatDate' in record) baseCols.push({ key: 'creatDate', label: 'Ngày giờ' });
    else if ('ngayGio' in record) baseCols.push({ key: 'ngayGio', label: 'Ngày giờ' });

    if ('ca' in record) baseCols.push({ key: 'ca', label: 'Ca' });

    if ('historyDate' in record) baseCols.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) baseCols.push({ key: 'history_date', label: 'History Date' });

    // Lấy các cột khớp trong definedFields
    const matchedKeys = new Set(baseCols.map(c => c.key));
    const matched = definedFields.filter(f => {
      if (f.key in record) {
        matchedKeys.add(f.key);
        return true;
      }
      return false;
    });

    // Nếu record có các trường khác ngoài baseCols và definedFields (trừ các trường hệ thống), tự động tạo cột với nhãn bằng tên key
    const excludedMetaKeys = new Set(['id', 'maMay', 'creatDate', 'ngayGio', 'ca', 'historyDate', 'history_date', 'creat_date', 'creatDate_change', 'changeDate']);
    const extraCols = [];
    Object.keys(record).forEach(k => {
      if (!matchedKeys.has(k) && !excludedMetaKeys.has(k)) {
        extraCols.push({ key: k, label: k });
      }
    });

    return [...baseCols, ...matched, ...extraCols];
  };

  const formatDateTimeTo14Char = (dateTimeStr, isEnd = false) => {
    if (!dateTimeStr) return '';
    const parts = dateTimeStr.split('T');
    if (parts.length !== 2) return '';
    const datePart = parts[0].replace(/-/g, '');
    const timeParts = parts[1].split(':');
    const hourPart = (timeParts[0] || '00').padStart(2, '0').slice(0, 2);
    const minutePart = (timeParts[1] || '00').padStart(2, '0').slice(0, 2);
    const result = isEnd ? `${datePart}${hourPart}${minutePart}59` : `${datePart}${hourPart}${minutePart}00`;
    console.log(`>>> [HistorySynthesis] formatDateTimeTo14Char: Input: ${dateTimeStr}, isEnd: ${isEnd} => Output: ${result}`);
    return result;
  };

  const fetchHistory = async (pageIndex = 0, currentSize = pageSize, customFrom = fromDate, customTo = toDate) => {
    if (!maMay) return;
    setLoading(true);
    
    const params = {
      maMay,
      page: pageIndex,
      size: currentSize
    };
    const formattedFrom = formatDateTimeTo14Char(customFrom, false);
    const formattedTo = formatDateTimeTo14Char(customTo, true);
    if (formattedFrom) params.fromDate = formattedFrom;
    if (formattedTo) params.toDate = formattedTo;

    const isCatVaiGroup = isCatVaiMachine(maMay);
    const isTH05Group = th05Machines.includes(maMay) || th05Machines.includes(getMachineNumberStr(maMay));
    const isTH09Plus = getMachineNumber(maMay) >= 9;
    console.log(`>>> [HistorySynthesis] FETCH SYNTHESIS HISTORY - TYPE: ${type.toUpperCase()} - MACHINE: ${maMay} - PAGE: ${pageIndex} - SIZE: ${currentSize} - isCatVaiGroup: ${isCatVaiGroup} - isTH05Group: ${isTH05Group} - isTH09Plus: ${isTH09Plus}] params:`, params);

    try {
      let apiCall;
      if (isCatVaiGroup) {
        apiCall = type === 'realtime' ? getChartRealTimeORCVHistory : getChartSettingORCVHistory;
      } else if (isTH05Group) {
        apiCall = type === 'realtime' ? getChartRealTimeTH05History : getChartSettingTH05History;
      } else {
        if (type === 'realtime') {
          apiCall = isTH09Plus ? getChartRealTimeTH09History : getChartRealTimeTH02History;
        } else {
          apiCall = isTH09Plus ? getChartSettingTH09History : getChartSettingTH02History;
        }
      }

      const res = await apiCall(params);
      console.log(`>>> [FETCH SYNTHESIS HISTORY RESPONSE - MACHINE: ${maMay} - PAGE: ${pageIndex} - SIZE: ${currentSize}] Trả về:`, res);

      let list = [];
      let totalP = 1;
      let totalE = 0;

      if (res && Array.isArray(res)) {
        list = res;
        totalP = 1;
        totalE = res.length;
      } else if (res && res.content) {
        list = res.content;
        totalP = res.totalPages || 1;
        totalE = res.totalElements || 0;
      }

      let detectedCols = [];
      if (list.length > 0) {
        // Ánh xạ danh sách cột hiển thị
        detectedCols = getDynamicFields(list[0]);
      }
      setHistoryList(list);
      setTotalPages(totalP);
      setTotalElements(totalE);
      setPage(pageIndex);
      setCols(detectedCols);
    } catch (error) {
      console.error("[HistorySynthesis] Lỗi fetchHistory:", error);
      toast.error(`Lỗi khi tải lịch sử thông số ${type === 'realtime' ? 'hoạt động' : 'cài đặt'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newSize) => {
    const s = Number(newSize);
    console.log(`>>> [HistorySynthesis] Người dùng đổi kích thước trang (Page Size): ${s}`);
    setPageSize(s);
    fetchHistory(0, s);
  };

  // Tự động load khi thay đổi mã máy hoặc kiểu lịch sử
  useEffect(() => {
    if (maMay) {
      fetchHistory(0, pageSize);
    }
  }, [maMay, type]);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Hiển thị 1 cho true/1 và 0 cho false/0 (true/false cho cột mã vạch)
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
      console.log(`>>> [HistorySynthesis] renderValue (date format with ms): ${val} -> ${result}`);
      return result;
    }
    return String(val);
  };

  const isRt = type === 'realtime';
  const themeBtnColor = isRt ? '#1e40af' : '#0f766e';

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #b8cce0', borderRadius: '4px',
      height: 'calc(100vh - 58px)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', minHeight: 0, background: '#f8fafc', overflow: 'hidden' }}>
        
        {/* ── FILTER BAR (Cố định phía trên) ────────────────────────────────── */}
        <div style={{
          background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px',
          padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '6px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Mã máy:</span>
            <select 
              className="mes-select"
              value={maMay} 
              onChange={(e) => setMaMay(e.target.value)}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', fontWeight: 'bold', width: '130px' }}
            >
              {mayList.map(m => (
                <option key={m.EquipmentID || m.MaMay} value={m.EquipmentID || m.MaMay}>
                  {m.EquipmentID || m.MaMay} ({m.TenMay || ''})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Từ:</span>
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
                console.log(">>> [HistorySynthesis] fromDate hour change:", newDateTime);
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
                console.log(">>> [HistorySynthesis] fromDate minute change:", newDateTime);
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
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Đến:</span>
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
                console.log(">>> [HistorySynthesis] toDate hour change:", newDateTime);
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
                console.log(">>> [HistorySynthesis] toDate minute change:", newDateTime);
                setToDate(newDateTime);
              }}
              style={{ height: '26px', padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
            >
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m} phút</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => fetchHistory(0, pageSize)} 
            style={{ 
              height: '26px', padding: '0 16px', fontSize: '11px', 
              background: themeBtnColor, color: '#fff', 
              border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' 
            }}
          >
            TÌM KIẾM
          </button>
          {(fromDate || toDate) && (
            <button 
              onClick={() => {
                console.log(">>> [HistorySynthesis] Bấm Xóa lọc: tải 100 kết quả mới nhất");
                setFromDate('');
                setToDate('');
                fetchHistory(0, pageSize, '', '');
              }} 
              style={{ 
                height: '26px', padding: '0 10px', fontSize: '11px', 
                background: '#f1f5f9', color: '#64748b', 
                border: '1px solid #cbd5e1', borderRadius: '3px', 
                fontWeight: 'bold', cursor: 'pointer' 
              }}
            >
              ✕ XÓA LỌC
            </button>
          )}
        </div>

        {/* ── DATA TABLE (Vùng bảng có thanh cuộn dọc & ngang riêng) ────────── */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto', border: '1px solid #cbd5e1', width: '100%', background: '#ffffff' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Đang truy xuất dữ liệu lịch sử...</div>
            ) : historyList.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Không tìm thấy bản ghi lịch sử nào thỏa mãn bộ lọc.</div>
            ) : (
              <table className="mes-table" style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    {cols.map(field => (
                      <th 
                        key={field.key} 
                        style={{ 
                          padding: '7px 9px', fontSize: '10px', 
                          background: themeBtnColor, 
                          color: '#ffffff', borderBottom: '1px solid #cbd5e1',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((row) => (
                    <tr 
                      key={row.id} 
                      style={{ background: selectedId === row.id ? (isRt ? '#bae6fd' : '#e2f5f5') : 'transparent', cursor: 'pointer' }} 
                      onClick={() => setSelectedId(row.id)}
                    >
                      {cols.map(field => (
                        <td key={field.key} style={{ padding: '6px 8px', fontSize: '10px', fontWeight: '600', textAlign: 'center', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
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

        {/* ── FOOTER PAGINATION (Cố định ở đáy màn hình) ────────────────────── */}
        <div style={{
          background: '#f8fafc', borderTop: '1px solid #cbd5e1', borderRadius: '0 0 4px 4px',
          padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginTop: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>Tổng bản ghi: {totalElements}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                style={{
                  padding: '2px 6px', fontSize: '11px', fontWeight: 'bold',
                  border: '1px solid #cbd5e1', borderRadius: '3px',
                  background: '#ffffff', color: '#0f172a', outline: 'none'
                }}
              >
                <option value={50}>50 / trang</option>
                <option value={100}>100 / trang (Mặc định)</option>
                <option value={200}>200 / trang</option>
                <option value={500}>500 / trang</option>
                <option value={1000}>1.000 / trang</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              disabled={page === 0 || loading} 
              onClick={() => fetchHistory(page - 1, pageSize)} 
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
            <span style={{ fontSize: '11px', color: '#475569', alignSelf: 'center', fontWeight: 'bold' }}>Trang {page + 1} / {totalPages || 1}</span>
            <button 
              disabled={page >= totalPages - 1 || loading} 
              onClick={() => fetchHistory(page + 1, pageSize)} 
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
        </div>

      </div>
    </div>
  );
};

export default HistorySynthesis;
