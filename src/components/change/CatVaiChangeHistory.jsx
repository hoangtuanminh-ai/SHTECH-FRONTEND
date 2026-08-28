import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  getChartRecipeORCVChange, 
  getChartSettingORCVChange 
} from '../../api/thanhhinhApi';
import { toast } from 'react-toastify';

// Số dòng mỗi trang của popup lịch sử thay đổi (trước đây là 1000).
const PAGE_SIZE = 100;

// ==========================================
// CẤU HÌNH RECIPE CHO MÁY 1 (CV-01)
// ==========================================
const recipeCV01 = [
  { key: "widthOfInputMaterial", label: "Chiều rộng dải mảnh" },
  { key: "widthOfStrip", label: "Chiều rộng vật liệu đầu vào" },
  { key: "angle", label: "Độ dày vật liệu" },
  { key: "fullMaterialCoilDiameterInLetOff", label: "Đường kính đầy của cuộn xả liệu" },
  { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
  { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu và ra liệu" },
  { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
  { key: "autoSpeedSplicingDevice", label: "Tốc độ tự động cơ cấu nối" },
  { key: "feedingConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng bù chức năng cấp liệu" },
  { key: "feedingConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù chức năng ra liệu" },
  { key: "takeoffConveyerDistanceFromSensorToSplicingPlace", label: "Chiều dài cuộn thu" },
  { key: "takeoffConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc của băng tải ra liệu" }
];

// ==========================================
// CẤU HÌNH RECIPE CHO MÁY 2 & 3 (CV-02/03)
// ==========================================
const recipeCV02_03 = [
  { key: "widthOfInputMaterial", label: "Chiều rộng vật liệu đầu vào" },
  { key: "widthOfStrip", label: "Chiều rộng dải mảnh" },
  { key: "angle", label: "Góc cắt (hoặc Góc)" },
  { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
  { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
  { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
  { key: "autoSpeedSplicingDevice", label: "Tốc độ tự động cơ cấu nối" },
  { key: "feedingConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách từ cảm biến đến vị trí nối của băng tải cấp liệu" },
  { key: "feedingConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc của băng tải cấp liệu" },
  { key: "takeoffConveyerDistanceFromSensorToSplicingPlace", label: "Khoảng cách từ cảm biến đến vị trí nối của băng tải ra liệu" },
  { key: "takeoffConveyerOffsetDistanceForSlowSpeed", label: "Khoảng bù giảm tốc của băng tải ra liệu" },
  { key: "pulley1BasicPosition", label: "Vị trí gốc puly 1" },
  { key: "pulley1EndPosition", label: "Vị trí cuối puly 1" },
  { key: "pulley2BasicPosition", label: "Vị trí gốc puly 2" },
  { key: "pulley2EndPosition", label: "Vị trí cuối puly 2" },
  { key: "materialLenghtInWindUp", label: "Chiều dài vật liệu trên cuộn thu" },
  { key: "fullMaterialCoilDiameterInLetOff", label: "Đường kính đầy của cuộn xả liệu" },
  { key: "thicknessOfInputMaterial", label: "Độ dày vật liệu đầu vào" }
];

// ==========================================
// CẤU HÌNH SETTING (CÀI ĐẶT) CHO MÁY 1 (CV-01)
// ==========================================
const settingGroupsCV01 = [
  {
    title: "1. Kích thước & Góc",
    fields: [
      { key: "widthOfInputMaterial", label: "Chiều rộng dải mảnh" },
      { key: "widthOfStrip", label: "Chiều rộng vật liệu đầu vào" },
      { key: "thicknessOfMaterial", label: "Độ dày vật liệu" },
      { key: "requiredAngle", label: "Góc yêu cầu" }
    ]
  },
  {
    title: "2. Cấp liệu & Dao xén",
    fields: [
      { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
      { key: "distanceSensorSplicingFeeding", label: "Khoảng cách cảm biến đến vị trí nối (Cấp liệu)" },
      { key: "offsetForSlowdownFeeding", label: "Khoảng bù giảm tốc cấp liệu" },
      { key: "trimmingKnivesTemperature", label: "Nhiệt độ dao xén biên" }
    ]
  },
  {
    title: "3. Ra liệu & Cuộn thu",
    fields: [
      { key: "windUpLenght", label: "Chiều dài cuộn thu" },
      { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
      { key: "distanceSensorSplicingTakeoff", label: "Khoảng cách cảm biến đến vị trí nối (Ra liệu)" },
      { key: "offsetForSlowdownTakeOff", label: "Khoảng bù giảm tốc ra liệu" },
      { key: "windUpEmptyDiameterNarrowCoil", label: "Đường kính lõi cuộn thu hẹp" }
    ]
  },
  {
    title: "4. Cơ cấu cấp & Tốc độ nối",
    fields: [
      { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
      { key: "autoSpeedSplicingDeviceFw", label: "Tốc độ tự động cơ cấu nối (tiến)" },
      { key: "autoSpeedSplicingDeviceBw", label: "Tốc độ tự động cơ cấu nối (lùi)" }
    ]
  },
  {
    title: "5. Thời gian trễ & Chu kỳ máy",
    fields: [
      { key: "serviceModeJogTime", label: "Thời gian chạy nhích chế độ bảo trì" },
      { key: "delayConveyerDownAfterCut", label: "Thời gian hạ băng tải sau khi cắt" },
      { key: "timeForLightingOfSplicingWorkplace", label: "Thời gian bật đèn vị trí nối" },
      { key: "delayStartConveyerAfterBrushes", label: "Thời gian khởi động băng tải sau chổi làm sạch" },
      { key: "heatingOnIfPt100IsNotUse", label: "Bật gia nhiệt khi không dùng PT100" },
      { key: "trimmingHeatingTimeForPwm", label: "Thời gian nhiệt khi dùng PWM" }
    ]
  },
  {
    title: "6. Động cơ & Tăng/Giảm tốc",
    fields: [
      { key: "accelerationSplicingDevice", label: "Thời gian tăng tốc cơ cấu nối" },
      { key: "decelerationSplicingDevice", label: "Thời gian giảm tốc cơ cấu nối" },
      { key: "manualSpeedSplicingDevice", label: "Tốc độ bằng tay cơ cấu nối" },
      { key: "accelerationPositioningConveyers", label: "Thời gian tăng tốc băng tải định vị" },
      { key: "decelerationPositioningConveyers", label: "Thời gian giảm tốc băng tải định vị" },
      { key: "manualSpeedPositioningConveyers", label: "Tốc độ bằng tay băng tải định vị" },
      { key: "slowAutoSpeedPositioningConveyers", label: "Tốc độ tự động chậm băng tải định vị" },
      { key: "accelerationFeedingDevice", label: "Thời gian tăng tốc cơ cấu cấp liệu" },
      { key: "decelerationFeedingDevice", label: "Thời gian giảm tốc cơ cấu cấp liệu" },
      { key: "manualSpeedFeedingDevice", label: "Tốc độ bằng tay cơ cấu cấp liệu" },
      { key: "testConveyersSpeed", label: "Tốc độ kiểm tra băng tải" }
    ]
  },
  {
    title: "7. Cài đặt góc cắt & nối",
    fields: [
      { key: "cuttingAngleSettingAutoFastSpeed", label: "Góc cắt - Tốc độ tự động nhanh" },
      { key: "cuttingAngleSettingAutoSlowSpeed", label: "Góc cắt - Tốc độ tự động chậm" },
      { key: "cuttingAngleSettingManualSpeed", label: "Góc cắt - Tốc độ bằng tay" },
      { key: "cuttingAngleSettingRetardation", label: "Góc cắt - Giảm tốc" },
      { key: "cuttingAngleSettingHysteresis", label: "Góc cắt - Độ trễ" },
      { key: "splicingAngleSettingAutoFastSpeed", label: "Góc nối - Tốc độ tự động nhanh" },
      { key: "splicingAngleSettingAutoSlowSpeed", label: "Góc nối - Tốc độ tự động chậm" },
      { key: "splicingAngleSettingManualSpeed", label: "Góc nối - Tốc độ bằng tay" },
      { key: "splicingAngleSettingRetardation", label: "Góc nối - Giảm tốc" },
      { key: "splicingAngleSettingHysteresis", label: "Góc nối - Độ trễ" }
    ]
  },
  {
    title: "8. Hệ thống Cuộn Xả & Cuộn Quấn",
    fields: [
      { key: "windUpManualSpeed", label: "Tốc độ bằng tay cuộn thu" },
      { key: "windUpLenghtOfPulse", label: "Chiều dài một xung cuộn thu" },
      { key: "windUpEmptyDiameter", label: "Đường kính cuộn thu rỗng" },
      { key: "windupAutomaticSpeed", label: "Tốc độ tự động cuộn thu" },
      { key: "letOffMaterialTension", label: "Lực căng vật liệu xả" },
      { key: "letOffMaterialMinTorque", label: "Momen xoắn nhỏ nhất cuộn xả vật liệu" },
      { key: "letOffMaterialMaxTorque", label: "Momen xoắn lớn nhất cuộn xả vật liệu" },
      { key: "letOffWrapTension", label: "Lực căng cuộn quấn" },
      { key: "letOffWrapMinTorque", label: "Momen xoắn nhỏ nhất cuộn quấn" },
      { key: "letOffWrapMaxTorque", label: "Momen xoắn lớn nhất cuộn quấn" },
      { key: "letOffMaterialFullCoil", label: "Đường kính đầy cuộn vật liệu" },
      { key: "letOffWrapEmptyCoil", label: "Đường kính rỗng cuộn quấn" },
      { key: "letOffWrapThickness", label: "Độ dày cuộn quấn" },
      { key: "letOffBeginOfMaterialSpeed", label: "Tốc độ bắt đầu của cuộn vật liệu" },
      { key: "letOffBeginOfWrapSpeed", label: "Lực bắt đầu của cuộn quấn" },
      { key: "letOffEndOfMaterialSpeed", label: "Tốc độ kết thúc của cuộn vật liệu" },
      { key: "letOffEndOfWrapSpeed", label: "Lực kết thúc của cuộn quấn" }
    ]
  },
  {
    title: "9. Bộ tính toán & Dao cắt phụ",
    fields: [
      { key: "angleCalculatorEdge", label: "Bộ tính góc - mép" },
      { key: "angleCalculatorWidth", label: "Bộ tính góc - chiều rộng" },
      { key: "edgeCalculatorWidth", label: "Bộ tính mép - chiều rộng" },
      { key: "edgeCalculatorAngle", label: "Bộ tính mép - góc" },
      { key: "pullRollManualSpeed", label: "Tốc độ tự động tay kéo" },
      { key: "pullRollAutoSpeed", label: "Tốc độ tự động tự kéo" },
      { key: "trimmingManualSpeed", label: "Tốc độ bằng tay dao xén biên" },
      { key: "trimmingAutoSpeed", label: "Tốc độ tự động dao xén biên" },
      { key: "trimmingDistanceFromSensor", label: "Khoảng cách cảm biến đến dao xén" },
      { key: "smoothingRollManualSpeed", label: "Tốc độ bằng tay lô làm phẳng" },
      { key: "edgingConveyerManualSpeed", label: "Tốc độ bằng tay băng tải ép biên" },
      { key: "edgingConveyerAutoSpeed", label: "Tốc độ tự động băng tải ép biên" },
      { key: "edgingBrushesSpeed", label: "Tốc độ chổi ép biên" }
    ]
  },
  {
    title: "10. Lô cắt & Băng chứa dải mảnh",
    fields: [
      { key: "stripMagazineManualSpeed", label: "Tốc độ bằng tay băng chứa dải mảnh" },
      { key: "cuttingRollManualSpeed", label: "Tốc độ bằng tay lô cắt" },
      { key: "stripMagazineSpeedFactorNegativeEdge", label: "Hệ số tốc độ băng chứa - mép âm" },
      { key: "stripMagazineSpeedFactorPositiveEdge", label: "Hệ số tốc độ băng chứa - mép dương" },
      { key: "cuttingRollSpeedFactorNegativeEdge", label: "Hệ số tốc độ lô cắt - mép âm" },
      { key: "cuttingRollSpeedFactorPositiveEdge", label: "Hệ số tốc độ lô cắt - mép dương" }
    ]
  },
  {
    title: "11. Điều khiển Puly",
    fields: [
      { key: "pulleysCalculationsStripOverlap", label: "Tính toán puly - độ chồng dải mảnh" },
      { key: "pulleysCalculationsMiddleOffset", label: "Tính toán puly - độ lệch tâm" },
      { key: "pulleysCalculationsDistance", label: "Tính toán puly - khoảng cách" },
      { key: "safetyDistanceBetweenPulleys", label: "Khoảng cách an toàn giữa các puly" }
    ]
  },
  {
    title: "12. Tốc độ rung & Tỷ lệ động cơ",
    fields: [
      { key: "speedOfBeltVibration", label: "Tốc độ rung băng tải" },
      { key: "switchOffBeltVibration", label: "Ngừng rung băng tải" },
      { key: "autoSpeedFeedingDeviceBw", label: "Tốc độ tự động cơ cấu cấp liệu (lùi)" },
      { key: "feedingDeviceEndPosition", label: "Vị trí cuối cơ cấu cấp liệu" },
      { key: "feedingDeviceBasicPosition", label: "Vị trí gốc cơ cấu cấp liệu" },
      { key: "shearConveyerPrepositioningSpeed", label: "Tốc độ định vị trước băng tải cắt" },
      { key: "offsetDistanceForPrepositioning", label: "Khoảng bù định vị trước" },
      { key: "speedRatioFeedingShearConveyer", label: "Tỷ lệ tốc độ cấp liệu/băng tải dao" },
      { key: "speedRatioSplicingFeedingConveyer", label: "Tỷ lệ tốc độ nối/băng tải cấp liệu" },
      { key: "speedRatioTakeoffSplicingConveyer", label: "Tỷ lệ tốc độ ra liệu/cơ cấu nối" },
      { key: "speedForSwitchOnFastWrapWindUp", label: "Tốc độ chuyển sang quấn cuộn thu nhanh" },
      { key: "windUpTravelFastSpeed", label: "Tốc độ di chuyển nhanh cuộn thu" },
      { key: "windUpTravelSlowSpeed", label: "Tốc độ di chuyển chậm cuộn thu" },
      { key: "cuttingAngleForCalibration", label: "Góc cắt hiệu chuẩn" },
      { key: "splicingAngleForCalibration", label: "Góc nối hiệu chuẩn" },
      { key: "wrapWindUpMinSpeed", label: "Tốc độ nhỏ nhất cuộn thu dây quấn" },
      { key: "wrapWindUpMaxSpeed", label: "Tốc độ lớn nhất cuộn thu dây quấn" }
    ]
  }
];

// ==========================================
// CẤU HÌNH SETTING (CÀI ĐẶT) CHO MÁY 2 & 3 (CV-02/03)
// ==========================================
const settingGroupsCV02_03 = [
  {
    title: "1. Kích thước & Góc cài đặt",
    fields: [
      { key: "widthOfStrip", label: "Chiều rộng dải mảnh" },
      { key: "widthOfInputMaterial", label: "Chiều rộng vật liệu đầu vào" },
      { key: "thicknessOfMaterial", label: "Độ dày vật liệu" },
      { key: "requiredAngle", label: "Góc yêu cầu" },
      { key: "cutAngle", label: "Góc cắt" },
      { key: "splicingAngle", label: "Góc nối" }
    ]
  },
  {
    title: "2. Cấp liệu & Cảm biến",
    fields: [
      { key: "autoSpeedFeedingConveyer", label: "Tốc độ tự động băng tải cấp liệu" },
      { key: "distanceSensorSplicingFeeding", label: "Khoảng cách từ cảm biến đến vị trí nối phía cấp liệu" },
      { key: "offsetForSlowdownFeeding", label: "Khoảng bù giảm tốc cấp liệu" }
    ]
  },
  {
    title: "3. Ra liệu & Cuộn thu",
    fields: [
      { key: "windUpLenght", label: "Chiều dài cuộn thu" },
      { key: "actualLength", label: "Chiều dài thực tế" }
    ]
  },
  {
    title: "4. Nhiệt độ Dao xén",
    fields: [
      { key: "trimmingKnivesTemperature", label: "Nhiệt độ dao xén biên" }
    ]
  },
  {
    title: "5. Băng tải ra liệu & Tốc độ chậm",
    fields: [
      { key: "autoSpeedTakeoffConveyer", label: "Tốc độ tự động băng tải ra liệu" },
      { key: "distanceSensorSplicingTakeoff", label: "Khoảng cách từ cảm biến đến vị trí nối phía ra liệu" },
      { key: "offsetForSlowdownTakeOff", label: "Khoảng bù giảm tốc ra liệu" }
    ]
  },
  {
    title: "6. Tốc độ cấp liệu & Cơ cấu nối",
    fields: [
      { key: "autoSpeedFeedingDevice", label: "Tốc độ tự động cơ cấu cấp liệu" },
      { key: "autoSpeedSplicingDeviceFw", label: "Tốc độ tự động cơ cấu nối (tiến)" },
      { key: "autoSpeedSplicingDeviceBw", label: "Tốc độ tự động cơ cấu nối (lùi)" }
    ]
  },
  {
    title: "7. Thời gian trễ & Chu kỳ máy",
    fields: [
      { key: "serviceModeJogTime", label: "Thời gian chạy nhích chế độ bảo trì" },
      { key: "delayConveyerDownAfterCut", label: "Thời gian hạ băng tải sau khi cắt" },
      { key: "timeForLightingOfSplicingWorkplace", label: "Thời gian bật đèn vị trí nối" },
      { key: "delayStartConveyerAfterBrushes", label: "Thời gian khởi động băng tải sau chổi làm sạch" },
      { key: "heatingOnIfPt100IsNotUse", label: "Bật gia nhiệt khi không sử dụng cảm biến PT100" },
      { key: "trimmingHeatingTimeForPwm", label: "Thời gian nhiệt khi dùng cảm biến PWM" }
    ]
  },
  {
    title: "8. Động cơ & Tăng/Giảm tốc",
    fields: [
      { key: "accelerationSplicingDevice", label: "Thời gian tăng tốc cơ cấu nối" },
      { key: "decelerationSplicingDevice", label: "Thời gian giảm tốc cơ cấu nối" },
      { key: "manualSpeedSplicingDevice", label: "Tốc độ bằng tay cơ cấu nối" },
      { key: "accelerationPositioningConveyers", label: "Thời gian tăng tốc băng tải định vị" },
      { key: "decelerationPositioningConveyers", label: "Thời gian giảm tốc băng tải định vị" },
      { key: "manualSpeedPositioningConveyers", label: "Tốc độ bằng tay băng tải định vị" },
      { key: "slowAutoSpeedPositioningConveyers", label: "Tốc độ tự động chậm băng tải định vị" },
      { key: "accelerationFeedingDevice", label: "Thời gian tăng tốc cơ cấu cấp liệu" },
      { key: "decelerationFeedingDevice", label: "Thời gian giảm tốc cơ cấu cấp liệu" },
      { key: "manualSpeedFeedingDevice", label: "Tốc độ bằng tay cơ cấu cấp liệu" },
      { key: "testConveyersSpeed", label: "Tốc độ kiểm tra băng tải" }
    ]
  },
  {
    title: "9. Cài đặt góc cắt & nối",
    fields: [
      { key: "cuttingAngleSettingAutoFastSpeed", label: "Cài đặt góc cắt - tốc độ tự động nhanh" },
      { key: "cuttingAngleSettingAutoSlowSpeed", label: "Cài đặt góc cắt - tốc độ tự động chậm" },
      { key: "cuttingAngleSettingManualSpeed", label: "Cài đặt góc cắt - tốc độ bằng tay" },
      { key: "cuttingAngleSettingRetardation", label: "Cài đặt góc cắt - giảm tốc" },
      { key: "cuttingAngleSettingHysteresis", label: "Cài đặt góc cắt - độ trễ" },
      { key: "splicingAngleSettingAutoFastSpeed", label: "Cài đặt góc nối - tốc độ tự động nhanh" },
      { key: "splicingAngleSettingAutoSlowSpeed", label: "Cài đặt góc nối - tốc độ tự động chậm" },
      { key: "splicingAngleSettingManualSpeed", label: "Cài đặt góc nối - tốc độ bằng tay" },
      { key: "splicingAngleSettingRetardation", label: "Cài đặt góc nối - giảm tốc" },
      { key: "splicingAngleSettingHysteresis", label: "Cài đặt góc nối - độ trễ" },
      { key: "windUpManualSpeed", label: "Tốc độ bằng tay cuộn thu" },
      { key: "windUpLenghtOfPulse", label: "Chiều dài một xung cuộn thu" },
      { key: "windUpEmptyDiameter", label: "Đường kính cuộn thu rỗng" }
    ]
  },
  {
    title: "10. Hệ thống Cuộn Xả & Cuộn Quấn",
    fields: [
      { key: "windupAutomaticSpeed", label: "Tốc độ tự động cuộn thu" },
      { key: "letOffMaterialTension", label: "Lực căng vật liệu xả" },
      { key: "letOffMaterialMinTorque", label: "Momen xoắn nhỏ nhất cuộn xả vật liệu" },
      { key: "letOffMaterialMaxTorque", label: "Momen xoắn lớn nhất cuộn xả vật liệu" },
      { key: "letOffWrapTension", label: "Lực căng cuộn quấn" },
      { key: "letOffWrapMinTorque", label: "Momen xoắn nhỏ nhất cuộn quấn" },
      { key: "letOffWrapMaxTorque", label: "Momen xoắn lớn nhất cuộn quấn" },
      { key: "letOffMaterialFullCoil", label: "Đường kính đầy cuộn vật liệu" },
      { key: "letOffWrapEmptyCoil", label: "Đường kính rỗng cuộn quấn" },
      { key: "letOffWrapThickness", label: "Độ dày cuộn quấn" },
      { key: "letOffBeginOfMaterialSpeed", label: "Tốc độ bắt đầu của cuộn vật liệu" },
      { key: "letOffBeginOfWrapSpeed", label: "Lực bắt đầu của cuộn quấn" },
      { key: "letOffEndOfMaterialSpeed", label: "Tốc độ kết thúc của cuộn vật liệu" },
      { key: "letOffEndOfWrapSpeed", label: "Lực kết thúc của cuộn quấn" }
    ]
  },
  {
    title: "11. Bộ tính toán & Kéo xén",
    fields: [
      { key: "angleCalculatorEdge", label: "Giá trị tính toán góc" },
      { key: "angleCalculatorWidth", label: "Bộ tính góc - chiều rộng" },
      { key: "edgeCalculatorWidth", label: "Bộ tính mép - chiều rộng" },
      { key: "edgeCalculatorAngle", label: "Giá trị tính toán mép cắt" },
      { key: "pullRollManualSpeed", label: "Tốc độ tự động tay kéo" },
      { key: "pullRollAutoSpeed", label: "Tốc độ tự động tự kéo" },
      { key: "trimmingManualSpeed", label: "Tốc độ bằng tay dao xén biên" },
      { key: "trimmingAutoSpeed", label: "Tốc độ tự động dao xén biên" },
      { key: "trimmingDistanceFromSensor", label: "Khoảng cách từ cảm biến đến dao xén biên" },
      { key: "smoothingRollManualSpeed", label: "Tốc độ bằng tay lô làm phẳng" },
      { key: "edgingConveyerManualSpeed", label: "Tốc độ bằng tay băng tải ép biên" },
      { key: "edgingConveyerAutoSpeed", label: "Tốc độ tự động băng tải ép biên" },
      { key: "edgingBrushesSpeed", label: "Tốc độ chổi ép biên" }
    ]
  },
  {
    title: "12. Băng chứa dải mảnh & Lô cắt",
    fields: [
      { key: "stripMagazineManualSpeed", label: "Tốc độ bằng tay băng chứa dải mảnh" },
      { key: "cuttingRollManualSpeed", label: "Tốc độ bằng tay lô cắt" },
      { key: "stripMagazineSpeedFactorNegativeEdge", label: "Hệ số tốc độ băng chứa - mép âm" },
      { key: "stripMagazineSpeedFactorPositiveEdge", label: "Hệ số tốc độ băng chứa - mép dương" },
      { key: "cuttingRollSpeedFactorNegativeEdge", label: "Hệ số tốc độ lô cắt - mép âm" },
      { key: "cuttingRollSpeedFactorPositiveEdge", label: "Hệ số tốc độ lô cắt - mép dương" }
    ]
  },
  {
    title: "13. Điều khiển Puly",
    fields: [
      { key: "pulleysCalculationsStripOverlap", label: "Tính toán puly - độ chồng dải mảnh" },
      { key: "pulleysCalculationsMiddleOffset", label: "Tính toán puly - độ lệch tâm" },
      { key: "pulleysCalculationsDistance", label: "Tính toán puly - khoảng cách" },
      { key: "safetyDistanceBetweenPulleys", label: "Khoảng cách an toàn giữa các puly" }
    ]
  },
  {
    title: "14. Rung băng & Tỷ lệ động cơ",
    fields: [
      { key: "speedOfBeltVibration", label: "Tốc độ rung băng tải" },
      { key: "switchOffBeltVibration", label: "Ngừng rung băng tải" },
      { key: "autoSpeedFeedingDeviceBw", label: "Tốc độ tự động cơ cấu cấp liệu (lùi)" },
      { key: "feedingDeviceEndPosition", label: "Vị trí cuối cơ cấu cấp liệu" },
      { key: "feedingDeviceBasicPosition", label: "Vị trí gốc cơ cấu cấp liệu" },
      { key: "shearConveyerPrepositioningSpeed", label: "Tốc độ định vị trước của băng tải dao cắt" },
      { key: "offsetDistanceForPrepositioning", label: "Khoảng bù định vị trước" },
      { key: "speedRatioFeedingShearConveyer", label: "Tỷ lệ tốc độ băng tải cấp liệu/băng tải dao cắt" },
      { key: "speedRatioSplicingFeedingConveyer", label: "Tỷ lệ tốc độ cơ cấu nối/băng tải cấp liệu" },
      { key: "speedRatioTakeoffSplicingConveyer", label: "Tỷ lệ tốc độ băng tải ra liệu/cơ cấu nối" },
      { key: "speedForSwitchOnFastWrapWindUp", label: "Tốc độ chuyển sang quấn cuộn thu nhanh" },
      { key: "windUpTravelFastSpeed", label: "Tốc độ di chuyển nhanh của cuộn thu" },
      { key: "windUpTravelSlowSpeed", label: "Tốc độ di chuyển chậm của cuộn thu" },
      { key: "cuttingAngleForCalibration", label: "Góc cắt hiệu chuẩn" },
      { key: "splicingAngleForCalibration", label: "Góc nối hiệu chuẩn" },
      { key: "wrapWindUpMinSpeed", label: "Tốc độ nhỏ nhất cuộn thu dây quấn" },
      { key: "wrapWindUpMaxSpeed", label: "Tốc độ lớn nhất cuộn thu dây quấn" }
    ]
  }
];

// Flat Setting Fields
const settingCV01 = settingGroupsCV01.reduce((acc, g) => [...acc, ...g.fields], []);
const settingCV02_03 = settingGroupsCV02_03.reduce((acc, g) => [...acc, ...g.fields], []);

const CatVaiChangeHistory = ({ equipmentId, onClose, initialType = 'recipe', isEmbedded = false }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([]);
  
  // Loại thay đổi: 'recipe' hoặc 'setting'
  const [changeType, setChangeType] = useState(initialType || 'recipe'); 

  // Xác định máy CV-01
  const isCV01 = equipmentId && (equipmentId.endsWith('01') || equipmentId.includes('01') || equipmentId.includes('-1'));

  // Lấy danh sách trường hiển thị động
  const getDynamicFields = (record) => {
    if (!record) return [];

    const baseCols = [];
    if ('creatDate' in record) baseCols.push({ key: 'creatDate', label: 'Ngày giờ' });
    else if ('ngayGio' in record) baseCols.push({ key: 'ngayGio', label: 'Ngày giờ' });

    if ('ca' in record) baseCols.push({ key: 'ca', label: 'Ca' });

    if ('historyDate' in record) baseCols.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) baseCols.push({ key: 'history_date', label: 'History Date' });
    else if ('creatDate' in record) baseCols.push({ key: 'creatDate_change', label: 'Change Date' });

    let definedFields = [];
    if (changeType === 'recipe') {
      definedFields = isCV01 ? recipeCV01 : recipeCV02_03;
    } else {
      definedFields = isCV01 ? settingCV01 : settingCV02_03;
    }

    const matched = definedFields.filter(f => f.key in record);
    return [...baseCols, ...matched];
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

  const fetchHistory = async (pageIndex = 0, currentSize = pageSize, customFrom = fromDate, customTo = toDate) => {
    if (!equipmentId) return;
    setLoading(true);
    try {
      const params = {
        maMay: equipmentId,
        page: pageIndex,
        size: currentSize
      };

      const formattedFrom = formatDateTimeTo14Char(customFrom, false);
      const formattedTo = formatDateTimeTo14Char(customTo, true);

      if (formattedFrom) params.fromDate = formattedFrom;
      if (formattedTo) params.toDate = formattedTo;

      console.log(`>>> [CatVaiChangeHistory] FETCH CAT VAI CHANGE HISTORY - MACHINE: ${equipmentId} - TYPE: ${changeType} - PAGE: ${pageIndex} - SIZE: ${currentSize}:`, params);
      
      let res;
      if (changeType === 'recipe') {
        res = await getChartRecipeORCVChange(params);
      } else {
        res = await getChartSettingORCVChange(params);
      }

      console.log(`>>> [CatVaiChangeHistory] FETCH CAT VAI CHANGE RESPONSE - MACHINE: ${equipmentId}:`, res);

      if (res && res.content) {
        setHistoryList(res.content);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
        setPage(pageIndex);
        if (res.content.length > 0) {
          setDynamicFields(getDynamicFields(res.content[0]));
        } else {
          setDynamicFields([]);
        }
      } else {
        setHistoryList([]);
        setDynamicFields([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("[CatVaiChangeHistory] Lỗi fetchHistory:", error);
      toast.error(`Lỗi khi tải lịch sử thay đổi ${changeType === 'recipe' ? 'công thức' : 'cài đặt'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newSize) => {
    const s = Number(newSize);
    console.log(`>>> [CatVaiChangeHistory] Đổi kích thước trang (Page Size): ${s}`);
    setPageSize(s);
    fetchHistory(0, s);
  };

  // Tự động tải 100 kết quả mới nhất khi component mount hoặc khi đổi máy / đổi loại thay đổi
  useEffect(() => {
    if (equipmentId) {
      fetchHistory(0, pageSize);
    }
  }, [equipmentId, changeType]);

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
      return { 
        padding: '6px 8px', 
        fontSize: '10px', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffedd5', // màu cam nhạt
        color: '#ea580c', // màu cam đậm
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
      
      {/* Title & Type Select */}
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
        <span>LỊCH SỬ THAY ĐỔI MÁY CẮT VẢI (CHANGE) — MÁY {equipmentId}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#475569', fontSize: '10px' }}>Loại lịch sử:</span>
          <select
            value={changeType}
            onChange={(e) => {
              setChangeType(e.target.value);
              setHistoryList([]);
            }}
            style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '3px', fontWeight: 'bold', color: '#ea580c', cursor: 'pointer' }}
          >
            <option value="recipe">Thay đổi Công thức (Recipe)</option>
            <option value="setting">Thay đổi Cài đặt (Setting)</option>
          </select>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                lineHeight: 1,
                marginLeft: '6px'
              }}
              title="Đóng"
            >
              ✕
            </button>
          )}
        </div>
      </div>

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
              console.log(">>> [CatVaiChangeHistory] Bấm Xóa lọc: tải 100 kết quả mới nhất");
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

export default CatVaiChangeHistory;
