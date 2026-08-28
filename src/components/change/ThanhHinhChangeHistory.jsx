import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  getChartSettingTH02Change, 
  getChartSettingTH05Change, 
  getChartSettingTH09Change,
  getChartSettingORCVChange
} from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';

// Số dòng mỗi trang của popup lịch sử thay đổi (trước đây là 1000).
const PAGE_SIZE = 100;

// Danh sách trường Setting của máy cắt vải (ORCV / CV)
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

// Định nghĩa danh sách trường Setting của TH02
const settingTH02Fields = [
  { key: 'apLucCaBocGot', label: 'AL cà bóc gót' },
  { key: 'tocDoCaBocGot', label: 'Tốc độ cà bóc gót' },
  { key: 'thoiGianCaBocGot', label: 'Thời gian cà bóc gót' },
  { key: 'apLucCaoCaVaiThan', label: 'AL cao cà vải thân' },
  { key: 'apLucThapCaVaiThan', label: 'AL thấp cà vải thân' },
  { key: 'doRongSieuDinhHinhTrongChinh', label: 'Độ rộng siêu định hình trống chính' },
  { key: 'khoangCachDatTanhTrongChinh', label: 'KC đặt tanh trống chính' },
  { key: 'doRongDuDinhHinh', label: 'Độ rộng dư định hình' },
  { key: 'doRongDinhHinhTrongChinh', label: 'Độ rộng định hình trống chính' },
  { key: 'chieuDaiCatVaiThan', label: 'CD cắt vải thân' },
  { key: 'chieuDaiHieuChuanVaiThan', label: 'CD hiệu chuẩn vải thân' },
  { key: 'duongKinhDanHopTrongThan', label: 'ĐK dán hợp trống thân' },
  { key: 'duongKinhTrongThanLonNhat', label: 'ĐK trống thân lớn nhất' },
  { key: 'duongKinhTrongThanNhoNhat', label: 'ĐK trống thân nhỏ nhất' },
  { key: 'chieuDaiCatToHopTLTPA', label: 'CD cắt tổ hợp TLT(PA)' },
  { key: 'chieuDaiCatToHopHieuChuanTLTPA', label: 'CD cắt tổ hợp hiệu chuẩn TLT(PA)' },
  { key: 'caHongCaoAp', label: 'Cà hông cao áp' },
  { key: 'caHongThapAp', label: 'Cà hông thấp áp' },
  { key: 'apLucCaHongDuoi', label: 'AL cà hông dưới' },
  { key: 'apLucCaHongSuTamGiac', label: 'AL cà hông su tam giác' },
  { key: 'apLucCaHongTren', label: 'AL cà hông trên' },
  { key: 'apLucCaKhuVucGiua', label: 'AL cà khu vực giữa' },
  { key: 'apLucCaPhanVai', label: 'AL cà phân vai' },
  { key: 'apLucCaMepBien', label: 'AL cà mép biên' },
  { key: 'viTriDauCaMatChayViTriHuongTam', label: 'VT đầu cà mặt chạy VT H.Tâm' },
  { key: 'viTriDauCaMatChayViTriHuongTruc', label: 'VT đầu cà mặt chạy VT H.Trục' },
  { key: 'viTriDauCaMatChayViTriHuongXoay', label: 'VT đầu cà mặt chạy VT H.Xoay' },
  { key: 'viTriCuoiVungCaThapApViTriTam', label: 'VT cuối vùng cà thấp áp VT H.Tâm' },
  { key: 'viTriCuoiVungCaThapApViTriHuongTruc', label: 'VT cuối vùng cà thấp áp VT H.Trục' },
  { key: 'viTriCuoiVungCaThapApViTriHuongXoay', label: 'VT cuối vùng cà thấp áp VT H.Xoay' },
  { key: 'viTriDauCaCaoApViTriXoay', label: 'VT đầu cao áp VT H.Xoay' },
  { key: 'viTriDauCaCaoApViTriHuongTam', label: 'VT đầu cao áp VT H.Tâm' },
  { key: 'viTriDauCaCaoApViTriHuongTruc', label: 'VT đầu cao áp VT H.Trục' },
  { key: 'viTriMepBienMatLopViTriXoay', label: 'VT mép biên mặt lốp VT H.Xoay' },
  { key: 'viTriMepBienMatLopViTriHuongTruc', label: 'VT mép biên mặt lốp VT H.Trục' },
  { key: 'viTriMepBienMatLopViTriXoay1', label: 'VT mép biên mặt lốp VT H.Xoay_1' },
  { key: 'gocCa1HoanThanhViTriHuongTam', label: 'Góc cà 1 HT vị trí  H.Tâm' },
  { key: 'gocCa1HoanThanhViTriHuongTruc', label: 'Góc cà 1 HT vị trí H.Trục' },
  { key: 'gocCa1HoanThanhViTriXoay', label: 'Góc cà 1 HT vị trí H.Xoay' },
  { key: 'gocCa2HoanThanhViTriHuongTam', label: 'Góc cà 2 HT vị trí H.Tâm' },
  { key: 'gocCa2HoanThanhViTriHuongTruc', label: 'Góc cà 2 HT vị trí H.Trục' },
  { key: 'gocCa2HoanThanhViTriXoay', label: 'Góc cà 2 HT vị trí H.Xoay' },
  { key: 'viTriChoCaHuongTamViTriHuongTam', label: 'VT Chờ cà H.Tâm VT H.Tâm' },
  { key: 'viTriChoCaHuongTamViTriHuongTruc', label: 'VT Chờ cà H.Tâm VT H.Trục' },
  { key: 'viTriChoCaHuongTamViTriXoay', label: 'VT Chờ cà H.Tâm VT H.Xoay' },
  { key: 'viTriDauCaHongViTriHuongTam', label: 'VT Đầu cà hông VT H.Tâm' },
  { key: 'viTriDauCaHongViTriHuongTruc', label: 'VT Đầu cà hông VT H.Trục' },
  { key: 'viTriDauCaHongViTriXoay', label: 'VT Đầu cà hông VT H.Xoay' },
  { key: 'viTriDauCaThapApVungGiuaHoanThanhViTriHuongTam', label: 'VT Đầu cà thấp áp vùng giữa HT VT H.Tâm' },
  { key: 'viTriDauCaThapApVungGiuaViTriHuongTruc', label: 'VT Đầu cà thấp áp vùng giữa VT H.Trục' },
  { key: 'viTriDauCaThapApVungGiuaViTriXoay', label: 'VT Đầu cà thấp áp vùng giữa VT Xoay' },
  { key: 'viTriDauCaThapApVungTrenHoanThanhViTriHuongTam', label: 'VT Đầu cà thấp áp vùng trên HT VT H.Tâm' },
  { key: 'viTriDauCaThapApVungTrenViTriHuongTruc', label: 'VT Đầu cà thấp áp vùng trên VT H.Trục' },
  { key: 'viTriDauCaThapApVungTrenViTriXoay', label: 'VT Đầu cà thấp áp vùng trên VT Xoay' },
  { key: 'viTriCuoiCaHongHoanThanhViTriHuongTam', label: 'VT Cuối cà hông VT H.Tâm' },
  { key: 'viTriCuoiCaHongHoanThanhViTriHuongTruc', label: 'VT Cuối cà hông VT H.Trục' },
  { key: 'viTriCuoiCaHongHoanThanhViTriXoay', label: 'VT Cuối cà hông VT H.Xoay' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTam', label: 'VT Đầu cà su tam giác VT H.Tâm' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTruc', label: 'VT Đầu cà su tam giác VT H.Trục' },
  { key: 'viTriDauCaSuTamGiacViTriXoay', label: 'VT Đầu cà su tam giác VT H.Xoay' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTam1', label: 'VT Đầu cà su tam giác 1 VT H.Tâm' },
  { key: 'viTriDauCaSuTamGiacViTriHuongTruc1', label: 'VT Đầu cà su tam giác 1 VT H.Trục' },
  { key: 'viTriDauCaSuTamGiacViTriXoay1', label: 'VT Đầu cà su tam giác 1 VT H.Xoay' },
  { key: 'viTriCuoiHoanThanhViTriHuongTam', label: 'VT Cuối HT VT H.Tâm' },
  { key: 'viTriCuoiHoanThanhViTriHuongTruc', label: 'VT Cuối HT VT H.Trục' },
  { key: 'viTriCuoiHoanThanhViTriXoay', label: 'VT Cuối HT VT H.Xoay' },
  { key: 'viTriChuyenThapApViTriHuongTam', label: 'VT Chuyển thấp áp VT H.Tâm' },
  { key: 'viTriChuyenThapApViTriHuongTruc', label: 'VT Chuyển thấp áp VT H.Trục' },
  { key: 'viTriChuyenThapApViTriXoay', label: 'VT Chuyển thấp áp VT H.Xoay' },
  { key: 'duongKinhBungTrongThan', label: 'ĐK bung trống thân' },
  { key: 'duongKinhTrongThanDuBi', label: 'ĐK trống thân dự bị' }
];

// Định nghĩa danh sách trường Setting của TH09
const settingTH09Fields = [
  { key: 'duongKinhBungTrongThan', label: 'ĐK bụng trống thân' },
  { key: 'duongKinhDanHopTrongThan', label: 'ĐK dán hợp trống thân' },
  { key: 'duongKinhTrongThanThuLai', label: 'ĐK trống thân thu lại' },
  { key: 'duongKinhTrongBungKhiCaVaiThan', label: 'ĐK trống bung khi cà vai thân' },
  { key: 'duongKinhBungTrongThanLonNhat', label: 'ĐK bung trống thân lớn nhất' },
  { key: 'duongKinhBungTrongThanNhoNhat', label: 'ĐK bung trống thân nhỏ nhất' },
  { key: 'trongSHGiaTriThamChieu', label: 'Trống SH giá trị tham chiếu' },
  { key: 'trongSHGioiHanMoLonNhat', label: 'Trống SH giới hạn mở lớn nhất' },
  { key: 'gioiHanDongNhoNhat', label: 'Giới hạn đóng nhỏ nhất' },
  { key: 'rongCongNghe', label: 'Rộng công nghệ' },
  { key: 'viTriDuDinhHinh', label: 'Vị trí dư định hình' },
  { key: 'viTriDinhHinh', label: 'Vị trí định hình' },
  { key: 'viTriSieuDinhHinh', label: 'Vị trí siêu định hình' },
  { key: 'dieuChinhViTriVen', label: 'Điều chỉnh vị trí vén' },
  { key: 'chieuDaiVaiThan', label: 'Chiều dài vai thân' },
  { key: 'chieuDaiHieuChuanVaiThan', label: 'CD hiệu chuẩn vai thân' },
  { key: 'chieuDaiToHopTangLotTrongPA', label: 'CD tổ hợp tầng lót trong PA' },
  { key: 'chieuDaiHieuChuanToHopTangLotTrongPA', label: 'CD hiệu chuẩn TH tầng lót trong PA' },
  { key: 'viTriChoCaToHopTangLotTrongPA', label: 'Vị trí chờ cà TH tầng lót trong PA' },
  { key: 'viTriCuoiCaToHopTangLotTrongPA', label: 'Vị trí cuối cà TH tầng lót trong PA' },
  { key: 'tocDoCaVaiThanGiaiDoan1', label: 'Tốc độ cà vải thân GĐ1' },
  { key: 'viTriCuoiCaVaiThanGiaiDoan1', label: 'Vị trí cuối cà vải thân GĐ1' },
  { key: 'apLucConCaTraiVaiThanGiaiDoan1', label: 'Áp lực con cà trái vải thân GĐ1' },
  { key: 'apLucConCaPhaiVaiThanGiaiDoan1', label: 'Áp lực con cà phải vải thân GĐ1' },
  { key: 'tocDoCaVaiThanGiaiDoan2', label: 'Tốc độ cà vải thân GĐ2' },
  { key: 'viTriCuoiCaVaiThanGiaiDoan2', label: 'Vị trí cuối cà vải thân GĐ2' },
  { key: 'apLucConCaTraiVaiThanGiaiDoan2', label: 'Áp lực con cà trái vải thân GĐ2' },
  { key: 'apLucConCaPhaiVaiThanGiaiDoan2', label: 'Áp lực con cà phải vải thân GĐ2' },
  { key: 'tocDoCaVaiThanGiaiDoan3', label: 'Tốc độ cà vải thân GĐ3' },
  { key: 'viTriCuoiCaVaiThanGiaiDoan3', label: 'Vị trí cuối cà vải thân GĐ3' },
  { key: 'apLucConCaTraiVaiThanGiaiDoan3', label: 'Áp lực con cà trái vải thân GĐ3' },
  { key: 'apLucConCaPhaiVaiThanGiaiDoan3', label: 'Áp lực con cà phải vải thân GĐ3' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan1', label: 'Tốc độ H.Tâm cà mặt chạy GĐ1' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan1', label: 'Vị trí H.Tâm cà mặt chạy GĐ1' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan1', label: 'Tốc độ H.Trục cà mặt chạy GĐ1' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan1', label: 'Vị trí H.Trục cà mặt chạy GĐ1' },
  { key: 'apLucCaMatChayGiaiDoan1', label: 'Áp lực cà mặt chạy GĐ1' },
  { key: 'gocXoayCaMatChayGiaiDoan1', label: 'Góc xoay cà mặt chạy GĐ1' },
  { key: 'tocDoXoayCaMatChayGiaiDoan1', label: 'Tốc độ xoay cà mặt chạy GĐ1' },
  { key: 'thoiGianCaMatChayGiaiDoan1', label: 'Thời gian cà mặt chạy GĐ1' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan2', label: 'Tốc độ H.Tâm cà mặt chạy GĐ2' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan2', label: 'Vị trí H.Tâm cà mặt chạy GĐ2' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan2', label: 'Tốc độ H.Trục cà mặt chạy GĐ2' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan2', label: 'Vị trí H.Trục cà mặt chạy GĐ2' },
  { key: 'apLucCaMatChayGiaiDoan2', label: 'Áp lực cà mặt chạy GĐ2' },
  { key: 'gocXoayCaMatChayGiaiDoan2', label: 'Góc xoay cà mặt chạy GĐ2' },
  { key: 'tocDoXoayCaMatChayGiaiDoan2', label: 'Tốc độ xoay cà mặt chạy GĐ2' },
  { key: 'thoiGianCaMatChayGiaiDoan2', label: 'Thời gian cà mặt chạy GĐ2' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan3', label: 'Tốc độ H.Tâm cà mặt chạy GĐ3' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan3', label: 'Vị trí H.Tâm cà mặt chạy GĐ3' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan3', label: 'Tốc độ H.Trục cà mặt chạy GĐ3' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan3', label: 'Vị trí H.Trục cà mặt chạy GĐ3' },
  { key: 'apLucCaMatChayGiaiDoan3', label: 'Áp lực cà mặt chạy GĐ3' },
  { key: 'gocXoayCaMatChayGiaiDoan3', label: 'Góc xoay cà mặt chạy GĐ3' },
  { key: 'tocDoXoayCaMatChayGiaiDoan3', label: 'Tốc độ xoay cà mặt chạy GĐ3' },
  { key: 'thoiGianCaMatChayGiaiDoan3', label: 'Thời gian cà mặt chạy GĐ3' },
  { key: 'tocDoHuongTamCaMatChayGiaiDoan4', label: 'Tốc độ H.Tâm cà mặt chạy GĐ4' },
  { key: 'viTriHuongTamCaMatChayGiaiDoan4', label: 'Vị trí H.Tâm cà mặt chạy GĐ4' },
  { key: 'tocDoHuongTrucCaMatChayGiaiDoan4', label: 'Tốc độ H.Trục cà mặt chạy GĐ4' },
  { key: 'viTriHuongTrucCaMatChayGiaiDoan4', label: 'Vị trí H.Trục cà mặt chạy GĐ4' },
  { key: 'apLucCaMatChayGiaiDoan4', label: 'Áp lực cà mặt chạy GĐ4' },
  { key: 'gocXoayCaMatChayGiaiDoan4', label: 'Góc xoay cà mặt chạy GĐ4' },
  { key: 'tocDoXoayCaMatChayGiaiDoan4', label: 'Tốc độ xoay cà mặt chạy GĐ4' },
  { key: 'thoiGianCaMatChayGiaiDoan4', label: 'Thời gian cà mặt chạy GĐ4' },
  { key: 'caVongTanhViTriCho', label: 'Cà vòng tanh vị trí chờ' },
  { key: 'apLucCaVongTanh', label: 'Áp lực cà vòng tanh' },
  { key: 'caVongTanhViTriCuoi', label: 'Cà vòng tanh vị trí cuối' },
  { key: 'tocDoCaVongTanh', label: 'Tốc độ cà vòng tanh' },
  { key: 'viTriCuoiCaBocGot', label: 'Vị trí cuối cà bóc gót' },
  { key: 'apLucCaBocGotTrai', label: 'Áp lực cà bóc gót trái' },
  { key: 'apLucCaBocGotPhai', label: 'Áp lực cà bóc gót phải' },
  { key: 'viTriChoCaBocGot', label: 'Vị trí chờ cà bóc gót' },
  { key: 'caHongViTriGiaiDoan1', label: 'Cà hông vị trí GĐ1' },
  { key: 'caHongTocDoGiaiDoan1', label: 'Cà hông tốc độ GĐ1' },
  { key: 'thoiGianCaHongGiaiDoan1', label: 'Thời gian cà hông GĐ1' },
  { key: 'apLucCaHongGiaiDoan1', label: 'Áp lực cà hông GĐ1' },
  { key: 'caHongViTriGiaiDoan2', label: 'Cà hông vị trí GĐ2' },
  { key: 'caHongTocDoGiaiDoan2', label: 'Cà hông tốc độ GĐ2' },
  { key: 'thoiGianCaHongGiaiDoan2', label: 'Thời gian cà hông GĐ2' },
  { key: 'apLucCaHongGiaiDoan2', label: 'Áp lực cà hông GĐ2' },
  { key: 'caHongViTriGiaiDoan3', label: 'Cà hông vị trí GĐ3' },
  { key: 'caHongTocDoGiaiDoan3', label: 'Cà hông tốc độ GĐ3' },
  { key: 'thoiGianCaHongGiaiDoan3', label: 'Thời gian cà hông GĐ3' },
  { key: 'apLucCaHongGiaiDoan3', label: 'Áp lực cà hông GĐ3' },
  { key: 'caTamGiac2GiaiDoanViTriCuoi', label: 'Cà tam giác 2 GĐ VT cuối' },
  { key: 'caTamGiac2GiaiDoanTocDoConLan', label: 'Cà tam giác 2 GĐ tốc độ con lăn' },
  { key: 'caTamGiac2GiaiDoanApLuc', label: 'Cà tam giác 2 GĐ áp lực' }
];

// Định nghĩa danh sách trường Setting của TH05
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

const ThanhHinhChangeHistory = ({ equipmentId, onClose }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100); // Mặc định 100 bản ghi thay vì 1.000
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([]);

  // Logic nhận diện nhóm máy
  const th05Machines = ['05', '14', '15', '16', '17', '5', 'TH05', 'TH14', 'TH15', 'TH16', 'TH17'];
  const getMachineNumberStr = (id) => {
    if (!id) return '';
    const match = id.match(/\d+/);
    return match ? match[0] : '';
  };
  const isCatVaiMachine = (id) => {
    if (!id) return false;
    const upper = String(id).toUpperCase();
    return upper.includes('CV') || upper.includes('ORCV') || upper.includes('CATVAI') || upper.includes('CẮT VẢI') || upper.includes('MCV');
  };

  const isCatVaiGroup = isCatVaiMachine(equipmentId);
  const isTH05Group = th05Machines.includes(equipmentId) || th05Machines.includes(getMachineNumberStr(equipmentId));

  const getMachineNumber = (id) => {
    if (!id) return 0;
    const match = id.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };
  const isTH09Plus = getMachineNumber(equipmentId) >= 9;

  // Lấy danh sách trường hiển thị động
  const getDynamicFields = (record) => {
    if (!record) return [];

    const baseCols = [];
    if ('creatDate' in record) baseCols.push({ key: 'creatDate', label: 'Ngày giờ' });
    else if ('ngayGio' in record) baseCols.push({ key: 'ngayGio', label: 'Ngày giờ' });

    if ('ca' in record) baseCols.push({ key: 'ca', label: 'Ca' });

    if ('historyDate' in record) baseCols.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) baseCols.push({ key: 'history_date', label: 'History Date' });
    else if ('creatDate' in record) baseCols.push({ key: 'creatDate_change', label: 'Change Date' }); // Sử dụng làm Change Date

    let definedFields = [];
    if (isCatVaiGroup) {
      definedFields = settingORCVFields;
    } else if (isTH05Group) {
      definedFields = settingTH05Fields;
    } else if (isTH09Plus) {
      definedFields = settingTH09Fields;
    } else {
      definedFields = settingTH02Fields;
    }

    const matched = definedFields.filter(f => f.key in record);
    return [...baseCols, ...matched];
  };
  const isTH09Group = getMachineNumber(equipmentId) >= 9;

  // Lấy danh sách trường phù hợp
  const getFieldsList = () => {
    if (isCatVaiGroup) return settingORCVFields;
    if (isTH05Group) return settingTH05Fields;
    if (isTH09Group) return settingTH09Fields;
    return settingTH02Fields;
  };

  // Khởi tạo ngày giờ mặc định: Để trống để tự động lấy 100 kết quả mới nhất nếu không chọn lọc
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTimeTo14Char = (dateTimeStr, isEnd = false) => {
    if (!dateTimeStr || !dateTimeStr.trim()) return '';
    const parts = dateTimeStr.split('T');
    if (parts.length < 1 || !parts[0]) return '';
    const datePart = parts[0].replace(/-/g, '');
    if (!datePart) return '';
    const timeParts = parts[1] ? parts[1].split(':') : [];
    const hourPart = (timeParts[0] || (isEnd ? '23' : '00')).padStart(2, '0').slice(0, 2);
    const minutePart = (timeParts[1] || (isEnd ? '59' : '00')).padStart(2, '0').slice(0, 2);
    const secondPart = (timeParts[2] || (isEnd ? '59' : '00')).padStart(2, '0').slice(0, 2);
    return `${datePart}${hourPart}${minutePart}${secondPart}`;
  };

  const fetchHistory = async (p = 0, s = pageSize, customFrom = fromDate, customTo = toDate) => {
    if (!equipmentId) return;
    setLoading(true);
    try {
      const params = {
        maMay: equipmentId,
        page: p,
        size: s
      };

      const formattedFrom = formatDateTimeTo14Char(customFrom, false);
      const formattedTo = formatDateTimeTo14Char(customTo, true);

      if (formattedFrom) params.fromDate = formattedFrom;
      if (formattedTo) params.toDate = formattedTo;

      console.log(`>>> [ThanhHinhChangeHistory] Fetch Change History cho máy ${equipmentId}:`, params);

      let res;
      if (isCatVaiGroup) {
        res = await getChartSettingORCVChange(params);
      } else if (isTH05Group) {
        res = await getChartSettingTH05Change(params);
      } else if (isTH09Group) {
        res = await getChartSettingTH09Change(params);
      } else {
        res = await getChartSettingTH02Change(params);
      }

      console.log(">>> [ThanhHinhChangeHistory] API Response:", res);

      const items = res?.content || res?.data || (Array.isArray(res) ? res : []);
      const totalP = res?.totalPages || 1;
      const totalE = res?.totalElements || items.length;

      setHistoryList(items);
      setTotalPages(totalP);
      setTotalElements(totalE);
      setPage(p);

      // Cấu hình các cột hiển thị: Thời gian & Trường thay đổi
      const allFields = getFieldsList();
      const baseFields = [
        { key: 'creatDate_change', label: 'Thời gian thay đổi' },
        { key: 'tenThongSo', label: 'Tên thông số' },
        { key: 'giaTriCu', label: 'Giá trị cũ' },
        { key: 'giaTriMoi', label: 'Giá trị mới' }
      ];

      // Nếu API trả về dữ liệu phẳng dạng từng record thay đổi, ta hiển thị baseFields
      // Hoặc nếu API trả về full object các trường, ta kết hợp baseFields + allFields
      if (items.length > 0 && (items[0].tenThongSo !== undefined || items[0].giaTriMoi !== undefined)) {
        setDynamicFields(baseFields);
      } else {
        setDynamicFields([
          { key: 'creatDate', label: 'Thời gian' },
          ...allFields
        ]);
      }

    } catch (error) {
      console.error("[ThanhHinhChangeHistory] Lỗi fetchHistory:", error);
      toast.error("Không thể lấy dữ liệu lịch sử thay đổi cấu hình!");
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newSize) => {
    const s = Number(newSize);
    console.log(`>>> [ThanhHinhChangeHistory] Đổi kích thước trang (Page Size): ${s}`);
    setPageSize(s);
    fetchHistory(0, s);
  };

  // Tự động tải 100 kết quả mới nhất khi component mount hoặc khi đổi máy
  useEffect(() => {
    if (equipmentId) {
      fetchHistory(0, pageSize);
    }
  }, [equipmentId]);

  const renderValue = (val, key) => {
    if (val === null || val === undefined || val === '') return '-';
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
      const s = String(val).trim();
      let d;
      if (/^\d{14}$/.test(s)) {
        const y = s.slice(0, 4), mo = s.slice(4, 6), dy = s.slice(6, 8);
        const h = s.slice(8, 10), mi = s.slice(10, 12), sc = s.slice(12, 14);
        d = new Date(`${y}-${mo}-${dy}T${h}:${mi}:${sc}`);
      } else {
        d = new Date(s);
      }
      if (!isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        const padMs = (n) => String(n).padStart(3, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${padMs(d.getMilliseconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      }
    }
    return String(val);
  };

  // Logic kiểm tra tô màu cam nhạt cho các ô có giá trị khác 0
  const getCellStyle = (val, key) => {
    const isMeta = ['id', 'maMay', 'barcode', 'creatDate', 'ngayGio', 'ca', 'historyDate', 'nguoiDo', 'changeDate', 'creat_date', 'history_date', 'creatDate_change', 'tenThongSo'].includes(key);
    if (!isMeta && val !== null && val !== undefined && val !== 0 && val !== '0' && val !== '' && val !== '-') {
      // Giá trị khác 0: tô màu cam nhạt
      return { 
        padding: '6px 8px', 
        fontSize: '10px', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffedd5', // màu cam nhạt
        color: '#ea580c', // màu cam đậm hơn cho text nổi bật
        whiteSpace: 'nowrap'
      };
    }
    return { 
      padding: '6px 8px', 
      fontSize: '10px', 
      fontWeight: '600', 
      textAlign: 'center', 
      borderBottom: '1px solid #e2e8f0',
      whiteSpace: 'nowrap'
    };
  };

  const content = (
    <div style={{
      background: '#ffffff',
      borderRadius: onClose ? '6px' : '4px',
      border: onClose ? '1px solid #cbd5e1' : 'none',
      padding: onClose ? '12px' : '0px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      height: onClose ? '90vh' : '100%',
      width: '100%',
      maxWidth: onClose ? '1400px' : 'none',
      boxShadow: onClose ? '0 20px 25px -5px rgba(0,0,0,0.1)' : 'none',
      overflow: 'hidden',
      flex: 1,
      minHeight: 0,
      boxSizing: 'border-box'
    }}>
      
      {/* Title bar (Chỉ hiện khi dạng popup hoặc khi có onClose) */}
      {onClose && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#ea580c',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '4px',
          flexShrink: 0
        }}>
          <span>LỊCH SỬ THAY ĐỔI CẤU HÌNH CÀI ĐẶT (CHANGE) — MÁY {equipmentId}</span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              lineHeight: 1
            }}
            title="Đóng"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters bar */}
      <div style={{
        background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px',
        padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flexShrink: 0
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
        <button onClick={() => fetchHistory(0, pageSize)} style={{ height: '26px', padding: '0 14px', fontSize: '11px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>TÌM KIẾM</button>
        {(fromDate || toDate) && (
          <button 
            onClick={() => {
              console.log(">>> [ThanhHinhChangeHistory] Bấm Xóa lọc: tải 100 kết quả mới nhất");
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

      {/* Body Table (Khu vực bảng có thanh cuộn dọc & ngang riêng) */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '2px 0' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto', border: '1px solid #cbd5e1', width: '100%', background: '#ffffff' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Đang tải lịch sử thay đổi...</div>
          ) : historyList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Không có bản ghi lịch sử thay đổi nào.</div>
          ) : (
            <table className="mes-table" style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  {dynamicFields.map(field => (
                    <th key={field.key} style={{ padding: '6px 8px', fontSize: '10px', background: '#ea580c', color: '#ffffff', borderBottom: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>{field.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historyList.map((row) => (
                  <tr key={row.id || Math.random()} style={{ background: selectedId === row.id ? '#ffedd5' : 'transparent', cursor: 'pointer' }} onClick={() => setSelectedId(row.id)}>
                    {dynamicFields.map(field => {
                      const displayKey = field.key === 'creatDate_change' ? 'creatDate' : field.key;
                      return (
                        <td key={field.key} style={getCellStyle(row[displayKey], displayKey)}>
                          {renderValue(row[displayKey], displayKey)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer Phân Trang (Cố định ở đáy màn hình) */}
      <div style={{
        background: '#f8fafc', borderTop: '1px solid #cbd5e1', borderRadius: '0 0 4px 4px',
        padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginTop: '2px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Tổng số bản ghi: {totalElements}</span>
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
            onClick={() => fetchHistory(page + 1, pageSize)} 
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
      </div>
    </div>
  );

  if (onClose) {
    return ReactDOM.createPortal(
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', backdropFilter: 'blur(4px)'
      }}>
        {content}
      </div>,
      document.body
    );
  }

  return content;
};

export default ThanhHinhChangeHistory;
