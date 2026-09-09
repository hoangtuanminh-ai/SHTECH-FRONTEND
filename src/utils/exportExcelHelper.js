// src/utils/exportExcelHelper.js
/**
 * Tiện ích xuất file Excel chuyên dụng cho hệ thống máy Thành Hình và Cắt Vải
 * Sử dụng ExcelJS và file-saver để tạo các bảng tính chuẩn công nghiệp MES:
 * - Header màu sắc rõ ràng, phân biệt theo loại thông số (Realtime, Setting, Recipe, Thay đổi)
 * - Chữ trắng trên nền đậm, in đậm (bold), căn giữa, chiều cao tối ưu
 * - Dòng kẻ ô (Borders) sắc nét, rõ ràng từng ô
 * - Dòng xen kẽ (Zebra striping) giúp người vận hành dễ quan sát dữ liệu
 * - Tự động cố định dòng tiêu đề (Freeze Panes) khi cuộn
 * - Báo cáo tổng hợp đa sheet có trang tổng hợp cực kỳ trực quan và bắt mắt
 */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

// ============================================================================
// HỆ THỐNG MÃ MÀU CHUẨN MES (ARGB 8 KÝ TỰ: FF + RRGGBB)
// ============================================================================
export const EXCEL_THEMES = {
  // Xanh dương công nghiệp (Thông số hoạt động - Realtime)
  blue: {
    headerBg: 'FF1565C0',     // Nền Header chính
    headerSubBg: 'FF2563EB',  // Nền Sub-header
    headerText: 'FFFFFFFF',   // Chữ trắng
    titleBg: 'FFE0E7FF',      // Nền banner tiêu đề
    titleText: 'FF1E3A8A',    // Chữ tiêu đề
    borderHeader: 'FF93C5FD', // Viền header
    zebraBg: 'FFF0F7FF'       // Nền xen kẽ
  },
  // Cam gạch công nghiệp (Thông số cài đặt - Setting)
  orange: {
    headerBg: 'FFC2410C',     // Nền Header chính
    headerSubBg: 'FFEA580C',  // Nền Sub-header
    headerText: 'FFFFFFFF',   // Chữ trắng
    titleBg: 'FFFFEDD5',      // Nền banner tiêu đề
    titleText: 'FF9A3412',    // Chữ tiêu đề
    borderHeader: 'FFFDBA74', // Viền header
    zebraBg: 'FFFFF7ED'       // Nền xen kẽ
  },
  // Xanh ngọc lục bảo (Thông số công thức - Recipe)
  green: {
    headerBg: 'FF047857',     // Nền Header chính
    headerSubBg: 'FF059669',  // Nền Sub-header
    headerText: 'FFFFFFFF',   // Chữ trắng
    titleBg: 'FFD1FAE5',      // Nền banner tiêu đề
    titleText: 'FF065F46',    // Chữ tiêu đề
    borderHeader: 'FF6EE7B7', // Viền header
    zebraBg: 'FFF0FDF4'       // Nền xen kẽ
  },
  // Tím Indigo (Lịch sử thay đổi - Change History)
  purple: {
    headerBg: 'FF4338CA',     // Nền Header chính
    headerSubBg: 'FF6366F1',  // Nền Sub-header
    headerText: 'FFFFFFFF',   // Chữ trắng
    titleBg: 'FFEEF2FF',      // Nền banner tiêu đề
    titleText: 'FF312E81',    // Chữ tiêu đề
    borderHeader: 'FFA5B4FC', // Viền header
    zebraBg: 'FFF5F3FF'       // Nền xen kẽ
  },
  // Xám trung tính (Dùng chung cho viền ô & dòng xen kẽ)
  common: {
    borderGrid: 'FFCBD5E1',   // Viền bảng mỏng xám xanh
    borderDark: 'FF64748B',   // Viền đậm ngăn cách
    zebraDefault: 'FFF8FAFC', // Nền dòng chẵn mặc định
    white: 'FFFFFFFF',        // Trắng
    textDark: 'FF0F172A',     // Chữ đen đậm
    textMuted: 'FF475569',    // Chữ xám phụ
    bannerDarkBg: 'FF0F172A'  // Nền banner tổng hợp tối sang trọng
  }
};

/**
 * Viền ô mỏng chuẩn cho dữ liệu bảng
 */
const THIN_BORDER = {
  top: { style: 'thin', color: { argb: EXCEL_THEMES.common.borderGrid } },
  left: { style: 'thin', color: { argb: EXCEL_THEMES.common.borderGrid } },
  bottom: { style: 'thin', color: { argb: EXCEL_THEMES.common.borderGrid } },
  right: { style: 'thin', color: { argb: EXCEL_THEMES.common.borderGrid } }
};

/**
 * Viền ô cho dòng Header
 */
const HEADER_BORDER = {
  top: { style: 'medium', color: { argb: 'FF0F172A' } },
  left: { style: 'thin', color: { argb: 'FF94A3B8' } },
  bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
  right: { style: 'thin', color: { argb: 'FF94A3B8' } }
};

/**
 * Tự động chọn Theme màu sắc phù hợp dựa trên tên file, sheetName hoặc tiêu đề
 */
const detectTheme = (name = '', title = '') => {
  const combined = `${name} ${title}`.toLowerCase();
  if (combined.includes('setting') || combined.includes('caidat') || combined.includes('cài đặt')) {
    return EXCEL_THEMES.orange;
  }
  if (combined.includes('recipe') || combined.includes('congthuc') || combined.includes('công thức')) {
    return EXCEL_THEMES.green;
  }
  if (combined.includes('change') || combined.includes('thaydoi') || combined.includes('thay đổi')) {
    return EXCEL_THEMES.purple;
  }
  return EXCEL_THEMES.blue;
};

/**
 * Hàm định dạng giá trị của từng ô dữ liệu để hiển thị chuẩn và đẹp trong Excel
 * @param {any} val - Giá trị thô
 * @param {string} key - Tên trường
 * @returns {any} Giá trị đã format
 */
export const formatCellValueForExcel = (val, key = '') => {
  if (val === null || val === undefined) return '';

  // Xử lý các trường trạng thái tích mã vạch
  if (key === 'globalDisableBarcode') {
    return (val === true || val === 1 || val === '1') ? 'Yêu cầu tích mã vạch' : 'Bỏ qua tích mã vạch';
  }
  if (key === 'globalEnableBarcode') {
    return (val === true || val === 1 || val === '1') ? 'Mã vạch OK' : 'Mã vạch không đúng';
  }

  // Xử lý boolean chung
  if (typeof val === 'boolean') {
    return val ? '1' : '0';
  }

  // Xử lý chuỗi ngày giờ có chứa ký tự 'T'
  if (typeof val === 'string' && val.includes('T') && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    return val.replace('T', ' ');
  }

  // Xử lý số thực: giữ nguyên kiểu số để Excel nhận diện, làm tròn tối đa 3 chữ số
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val : Number(val.toFixed(3));
  }

  return val;
};

/**
 * Tự động căn chỉnh độ rộng cột dựa trên nội dung
 */
const autoFitColumns = (worksheet, minWidth = 12, maxWidth = 55) => {
  worksheet.columns.forEach(column => {
    let maxLen = 0;
    column.eachCell({ includeEmpty: false }, cell => {
      const valStr = cell.value !== undefined && cell.value !== null ? String(cell.value) : '';
      if (valStr.length > maxLen) {
        maxLen = valStr.length;
      }
    });
    // Cộng thêm khoảng đệm để không bị sát mép ô
    column.width = Math.min(Math.max(maxLen + 4, minWidth), maxWidth);
  });
};

/**
 * ============================================================================
 * 1. XUẤT BẢNG DỮ LIỆU LỊCH SỬ NHIỀU DÒNG (TABLE EXPORT)
 * Dành cho: RealTime History, Setting History, Recipe History, Change History, Synthesis
 * ============================================================================
 */
export const exportTableToExcel = async ({
  data = [],
  columns = [],
  fileName = 'BaoCao_Export',
  sheetName = 'DuLieu',
  title = '',
  metadata = {}
}) => {
  console.log(`>>> [exportExcelHelper] Bắt đầu xuất bảng dữ liệu đẹp (ExcelJS): fileName="${fileName}", totalRows=${data.length}, cols=${columns.length}`);

  if (!data || data.length === 0) {
    console.warn(`>>> [exportExcelHelper] Cảnh báo: Không có bản ghi nào để xuất Excel!`);
    toast.warn('Không có dữ liệu trong bảng để xuất Excel');
    return false;
  }

  try {
    const theme = detectTheme(fileName, title || sheetName);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MES DRC Production System';
    workbook.created = new Date();

    const cleanSheetName = sheetName.replace(/[:\\/?*\[\]]/g, '_').slice(0, 31);
    const worksheet = workbook.addWorksheet(cleanSheetName, {
      views: [{ showGridLines: true }]
    });

    const totalCols = columns.length + 1; // +1 cho cột STT
    let currentRow = 1;

    // --- DÒNG 1: TIÊU ĐỀ LỚN BÁO CÁO (NẾU CÓ) ---
    if (title) {
      worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
      const titleCell = worksheet.getCell(currentRow, 1);
      titleCell.value = title.toUpperCase();
      titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: theme.titleText } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.titleBg } };
      worksheet.getRow(currentRow).height = 36;
      currentRow++;
    }

    // --- DÒNG METADATA (MÃ MÁY, THỜI GIAN, CA, BỘ LỌC) ---
    const metaEntries = Object.entries(metadata || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '');
    if (metaEntries.length > 0) {
      metaEntries.forEach(([k, v]) => {
        worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
        const metaCell = worksheet.getCell(currentRow, 1);
        metaCell.value = `${k}: ${v}`;
        metaCell.font = { name: 'Segoe UI', size: 9.5, italic: true, bold: true, color: { argb: EXCEL_THEMES.common.textMuted } };
        metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        worksheet.getRow(currentRow).height = 20;
        currentRow++;
      });
    }

    // Dòng thời gian xuất báo cáo mặc định
    worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
    const exportTimeCell = worksheet.getCell(currentRow, 1);
    exportTimeCell.value = `Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`;
    exportTimeCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: EXCEL_THEMES.common.textMuted } };
    exportTimeCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    worksheet.getRow(currentRow).height = 18;
    currentRow++;

    // Thêm 1 dòng trống tạo khoảng đệm thẩm mỹ
    currentRow++;

    // --- DÒNG HEADER BẢNG DỮ LIỆU ---
    const headerRowIndex = currentRow;
    const headers = ['STT', ...columns.map(c => c.label || c.key)];
    const headerRow = worksheet.getRow(headerRowIndex);
    headerRow.values = headers;
    headerRow.height = 30; // Chiều cao hàng header to, rõ ràng

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: theme.headerText } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.headerBg } };
      cell.border = HEADER_BORDER;
    });

    // Cố định dòng Header để khi cuộn trang vẫn nhìn thấy tiêu đề
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: headerRowIndex, showGridLines: true }];

    // --- CÁC DÒNG DỮ LIỆU ---
    data.forEach((item, idx) => {
      const dataRowIndex = headerRowIndex + 1 + idx;
      const dataRowValues = [
        idx + 1,
        ...columns.map(c => formatCellValueForExcel(item[c.key], c.key))
      ];

      const dataRow = worksheet.getRow(dataRowIndex);
      dataRow.values = dataRowValues;
      dataRow.height = 22; // Chiều cao dòng chuẩn, thoáng mắt

      // Hiệu ứng dòng xen kẽ (Zebra Striping)
      const isEvenRow = idx % 2 === 1;
      const rowBgColor = isEvenRow ? theme.zebraBg : EXCEL_THEMES.common.white;

      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: EXCEL_THEMES.common.textDark } };
        cell.border = THIN_BORDER;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };

        // Căn lề thông minh theo loại dữ liệu
        if (colNumber === 1) {
          // Cột STT: Căn giữa, in đậm nhẹ
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: EXCEL_THEMES.common.textMuted } };
        } else {
          const val = cell.value;
          if (typeof val === 'number') {
            // Dữ liệu số: Căn phải
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if (typeof val === 'string' && (val.includes('/') || val.includes(':') || val.length <= 8)) {
            // Ngày giờ hoặc mã ngắn: Căn giữa
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            // Văn bản: Căn trái có thụt lề nhẹ
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          }
        }
      });
    });

    // Tự động căn chỉnh độ rộng cột
    autoFitColumns(worksheet, 12, 50);
    // Riêng cột STT để nhỏ gọn 8 ký tự
    worksheet.getColumn(1).width = 8;

    // Xuất file và tải về máy
    const buffer = await workbook.xlsx.writeBuffer();
    const cleanFileName = `${fileName.replace(/[:\\/?*\[\]]/g, '_')}.xlsx`;
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), cleanFileName);

    console.log(`>>> [exportExcelHelper] Xuất bảng dữ liệu thành công: "${cleanFileName}" (${data.length} bản ghi)`);
    toast.success(`Xuất file Excel thành công (${data.length} bản ghi)`);
    return true;
  } catch (error) {
    console.error(`>>> [exportExcelHelper] Lỗi xuất Excel:`, error);
    toast.error('Lỗi khi xuất file Excel. Vui lòng thử lại!');
    return false;
  }
};

/**
 * ============================================================================
 * 2. XUẤT BẢNG THÔNG SỐ TỨC THỜI DẠNG KEY-VALUE (SNAPSHOT)
 * ============================================================================
 */
export const exportKeyValueListToExcel = async ({
  dataRecord = {},
  fields = [],
  fileName = 'ThongSoHienTai',
  sheetName = 'ThongSo',
  title = 'BẢNG THÔNG SỐ HIỆN TẠI',
  equipmentId = ''
}) => {
  console.log(`>>> [exportExcelHelper] Xuất thông số tức thời Key-Value (ExcelJS): fileName="${fileName}", equipmentId="${equipmentId}"`);

  if (!dataRecord || Object.keys(dataRecord).length === 0) {
    console.warn(`>>> [exportExcelHelper] Cảnh báo: Bản ghi thông số tức thời rỗng!`);
    toast.warn('Không có dữ liệu thông số hiện tại để xuất Excel');
    return false;
  }

  try {
    const theme = detectTheme(fileName, title || sheetName);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MES DRC Production System';

    const cleanSheetName = sheetName.replace(/[:\\/?*\[\]]/g, '_').slice(0, 31);
    const worksheet = workbook.addWorksheet(cleanSheetName, {
      views: [{ showGridLines: true }]
    });

    // Cột: STT (1), Tên thông số (2), Giá trị hiện tại (3), Key (4)
    const totalCols = 4;
    let currentRow = 1;

    // --- DÒNG 1: BANNER TIÊU ĐỀ ---
    worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = title.toUpperCase();
    titleCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: theme.headerText } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.headerBg } };
    worksheet.getRow(currentRow).height = 36;
    currentRow++;

    // --- DÒNG 2: THÔNG TIN THIẾT BỊ & THỜI GIAN ---
    worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
    const subCell = worksheet.getCell(currentRow, 1);
    subCell.value = `Mã máy: ${equipmentId || 'Chưa xác định'}   |   Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`;
    subCell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: EXCEL_THEMES.common.textMuted } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    worksheet.getRow(currentRow).height = 22;
    currentRow++;

    // Dòng đệm
    currentRow++;

    // --- DÒNG HEADER BẢNG ---
    const headerRowIndex = currentRow;
    const headers = ['STT', 'Tên Thông Số', 'Giá Trị Hiện Tại', 'Mã Thuộc Tính (Key)'];
    const headerRow = worksheet.getRow(headerRowIndex);
    headerRow.values = headers;
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: theme.headerText } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.headerSubBg } };
      cell.border = HEADER_BORDER;
    });

    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: headerRowIndex, showGridLines: true }];

    // --- CÁC DÒNG DỮ LIỆU ---
    fields.forEach((field, idx) => {
      const dataRowIndex = headerRowIndex + 1 + idx;
      const rawVal = dataRecord[field.key];
      const formattedVal = formatCellValueForExcel(rawVal, field.key);

      const dataRow = worksheet.getRow(dataRowIndex);
      dataRow.values = [
        idx + 1,
        field.label || field.key,
        formattedVal !== '' ? formattedVal : '-',
        field.key
      ];
      dataRow.height = 22;

      const isEven = idx % 2 === 1;
      const rowBg = isEven ? theme.zebraBg : EXCEL_THEMES.common.white;

      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: EXCEL_THEMES.common.textDark } };
        cell.border = THIN_BORDER;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };

        if (colNumber === 1) {
          // STT
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: EXCEL_THEMES.common.textMuted } };
        } else if (colNumber === 2) {
          // Tên thông số
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (colNumber === 3) {
          // Giá trị hiện tại: in đậm nổi bật
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: theme.headerBg } };
        } else {
          // Mã key
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          cell.font = { name: 'Consolas', size: 9, color: { argb: EXCEL_THEMES.common.textMuted } };
        }
      });
    });

    worksheet.getColumn(1).width = 8;
    worksheet.getColumn(2).width = 40;
    worksheet.getColumn(3).width = 24;
    worksheet.getColumn(4).width = 28;

    const buffer = await workbook.xlsx.writeBuffer();
    const cleanFileName = `${fileName.replace(/[:\\/?*\[\]]/g, '_')}.xlsx`;
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), cleanFileName);

    console.log(`>>> [exportExcelHelper] Xuất bảng thông số tức thời thành công: "${cleanFileName}"`);
    toast.success('Xuất file Excel thông số thành công');
    return true;
  } catch (error) {
    console.error(`>>> [exportExcelHelper] Lỗi xuất key-value Excel:`, error);
    toast.error('Lỗi khi xuất file Excel thông số. Vui lòng thử lại!');
    return false;
  }
};

/**
 * ============================================================================
 * 3. XUẤT BÁO CÁO TỔNG HỢP CẢ 2 HOẶC CẢ 3 THÔNG SỐ MÁY (COMBINED EXPORT)
 * ĐÂY LÀ TÍNH NĂNG ĐƯỢC THIẾT KẾ ĐẶC BIỆT THEO YÊU CẦU:
 * - Sheet 1: "TongHop_ThongSo" - Chứa cả Hoạt động (Realtime) & Cài đặt (Setting) (và Recipe nếu có)
 * - Sheet 2: "ThongSo_HoatDong" - Sheet riêng với màu xanh dương MES
 * - Sheet 3: "ThongSo_CaiDat" - Sheet riêng với màu cam gạch MES
 * - Sheet 4: "ThongSo_CongThuc" - Sheet riêng với màu xanh ngọc MES
 * ============================================================================
 */
export const exportCombinedMachineParametersToExcel = async ({
  equipmentId = '',
  realTimeRecord = null,
  realTimeFields = [],
  settingRecord = null,
  settingFields = [],
  recipeRecord = null,
  recipeFields = [],
  fileName = '',
  title = ''
}) => {
  console.log(`>>> [exportExcelHelper] Bắt đầu xuất Báo Cáo Tổng Hợp ExcelJS: equipmentId="${equipmentId}", hasRealtime=${!!realTimeRecord}, hasSetting=${!!settingRecord}, hasRecipe=${!!recipeRecord}`);

  if (!realTimeRecord && !settingRecord && !recipeRecord) {
    console.warn(`>>> [exportExcelHelper] Cảnh báo: Không có dữ liệu thông số nào của máy để xuất!`);
    toast.warn('Không có dữ liệu thông số máy để xuất báo cáo');
    return false;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MES DRC Production System';
    workbook.created = new Date();

    const reportTitle = title || `BÁO CÁO TỔNG HỢP THÔNG SỐ MÁY — ${equipmentId}`;

    // ========================================================================
    // SHEET 1: TỔNG HỢP CẢ 2 TRÊN CÙNG 1 TRANG TÍNH (TongHop_ThongSo)
    // ========================================================================
    const wsCombined = workbook.addWorksheet('TongHop_ThongSo', {
      views: [{ showGridLines: true }]
    });

    let rowCursor = 1;

    // --- BANNER CHÍNH BÁO CÁO TỔNG HỢP (Hàng 1) ---
    wsCombined.mergeCells(rowCursor, 1, rowCursor, 4);
    const mainBannerCell = wsCombined.getCell(rowCursor, 1);
    mainBannerCell.value = reportTitle.toUpperCase();
    mainBannerCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: EXCEL_THEMES.common.white } };
    mainBannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    mainBannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_THEMES.common.bannerDarkBg } };
    wsCombined.getRow(rowCursor).height = 38;
    rowCursor++;

    // --- METADATA (Hàng 2) ---
    wsCombined.mergeCells(rowCursor, 1, rowCursor, 4);
    const metaCell = wsCombined.getCell(rowCursor, 1);
    metaCell.value = `Mã thiết bị: ${equipmentId || 'Chưa xác định'}   |   Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}   |   Hệ thống: SCADA MES DRC`;
    metaCell.font = { name: 'Segoe UI', size: 9.5, italic: true, bold: true, color: { argb: EXCEL_THEMES.common.textMuted } };
    metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
    metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    wsCombined.getRow(rowCursor).height = 22;
    rowCursor++;

    // Dòng trống đệm
    rowCursor++;

    /**
     * Hàm phụ vẽ một khối thông số (Section) vào sheet tổng hợp
     */
    const renderSectionInCombinedSheet = (sectionTitle, fields, record, sectionTheme) => {
      // 1. Dòng Header mục lớn (Merge A:D)
      wsCombined.mergeCells(rowCursor, 1, rowCursor, 4);
      const secTitleCell = wsCombined.getCell(rowCursor, 1);
      secTitleCell.value = sectionTitle.toUpperCase();
      secTitleCell.font = { name: 'Segoe UI', size: 11.5, bold: true, color: { argb: sectionTheme.headerText } };
      secTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      secTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionTheme.headerBg } };
      wsCombined.getRow(rowCursor).height = 28;
      rowCursor++;

      // 2. Dòng Header cột
      const headers = ['STT', 'Tên Thông Số', 'Giá Trị Hiện Tại', 'Mã Thuộc Tính (Key)'];
      const colHeaderRow = wsCombined.getRow(rowCursor);
      colHeaderRow.values = headers;
      colHeaderRow.height = 26;

      colHeaderRow.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: sectionTheme.headerText } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionTheme.headerSubBg } };
        cell.border = HEADER_BORDER;
      });
      rowCursor++;

      // 3. Dữ liệu
      if (record && fields && fields.length > 0) {
        fields.forEach((field, idx) => {
          const rawVal = record[field.key];
          const formattedVal = formatCellValueForExcel(rawVal, field.key);
          const dRow = wsCombined.getRow(rowCursor);
          dRow.values = [
            idx + 1,
            field.label || field.key,
            formattedVal !== '' ? formattedVal : '-',
            field.key
          ];
          dRow.height = 22;

          const isEven = idx % 2 === 1;
          const rowBg = isEven ? sectionTheme.zebraBg : EXCEL_THEMES.common.white;

          dRow.eachCell((cell, colNum) => {
            cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: EXCEL_THEMES.common.textDark } };
            cell.border = THIN_BORDER;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };

            if (colNum === 1) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
              cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: EXCEL_THEMES.common.textMuted } };
            } else if (colNum === 2) {
              cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            } else if (colNum === 3) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
              cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: sectionTheme.headerBg } };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
              cell.font = { name: 'Consolas', size: 8.5, color: { argb: EXCEL_THEMES.common.textMuted } };
            }
          });
          rowCursor++;
        });
      } else {
        // Dòng thông báo không có dữ liệu
        wsCombined.mergeCells(rowCursor, 1, rowCursor, 4);
        const emptyCell = wsCombined.getCell(rowCursor, 1);
        emptyCell.value = 'Chưa có bản ghi dữ liệu cho mục này';
        emptyCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: EXCEL_THEMES.common.textMuted } };
        emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
        emptyCell.border = THIN_BORDER;
        wsCombined.getRow(rowCursor).height = 24;
        rowCursor++;
      }

      // Khoảng cách giữa các khối
      rowCursor += 2;
    };

    // VẼ KHỐI I: THÔNG SỐ HOẠT ĐỘNG (Xanh dương)
    renderSectionInCombinedSheet('I. BẢNG THÔNG SỐ HOẠT ĐỘNG HIỆN TẠI (REALTIME)', realTimeFields, realTimeRecord, EXCEL_THEMES.blue);

    // VẼ KHỐI II: THÔNG SỐ CÀI ĐẶT (Cam gạch)
    renderSectionInCombinedSheet('II. BẢNG THÔNG SỐ CÀI ĐẶT HIỆN TẠI (SETTING)', settingFields, settingRecord, EXCEL_THEMES.orange);

    // VẼ KHỐI III: THÔNG SỐ CÔNG THỨC (Xanh ngọc - nếu có)
    if (recipeRecord || (recipeFields && recipeFields.length > 0)) {
      renderSectionInCombinedSheet('III. BẢNG THÔNG SỐ CÔNG THỨC HIỆN TẠI (RECIPE)', recipeFields, recipeRecord, EXCEL_THEMES.green);
    }

    // Thiết lập độ rộng cột cố định tối ưu cho trang tổng hợp
    wsCombined.getColumn(1).width = 8;
    wsCombined.getColumn(2).width = 42;
    wsCombined.getColumn(3).width = 26;
    wsCombined.getColumn(4).width = 28;

    /**
     * Hàm phụ tạo một Sheet chi tiết riêng biệt cho từng nhóm thông số
     */
    const addDedicatedSheet = (sheetNameKey, sheetDisplayTitle, fields, record, sectionTheme) => {
      if (!record && (!fields || fields.length === 0)) return;

      const ws = workbook.addWorksheet(sheetNameKey, {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 3, showGridLines: true }]
      });

      // Hàng 1: Banner tiêu đề
      ws.mergeCells(1, 1, 1, 4);
      const bCell = ws.getCell(1, 1);
      bCell.value = `${sheetDisplayTitle} — MÁY ${equipmentId}`.toUpperCase();
      bCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: sectionTheme.headerText } };
      bCell.alignment = { vertical: 'middle', horizontal: 'center' };
      bCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionTheme.headerBg } };
      ws.getRow(1).height = 32;

      // Hàng 2: Thời gian xuất
      ws.mergeCells(2, 1, 2, 4);
      const tCell = ws.getCell(2, 1);
      tCell.value = `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`;
      tCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: EXCEL_THEMES.common.textMuted } };
      tCell.alignment = { vertical: 'middle', horizontal: 'center' };
      tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      ws.getRow(2).height = 18;

      // Hàng 3: Header cột
      const hRow = ws.getRow(3);
      hRow.values = ['STT', 'Tên Thông Số', 'Giá Trị Hiện Tại', 'Mã Thuộc Tính (Key)'];
      hRow.height = 28;
      hRow.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: sectionTheme.headerText } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionTheme.headerBg } };
        cell.border = HEADER_BORDER;
      });

      // Dữ liệu
      (fields || []).forEach((field, idx) => {
        const rawVal = record ? record[field.key] : null;
        const formattedVal = formatCellValueForExcel(rawVal, field.key);
        const rIndex = 4 + idx;
        const dRow = ws.getRow(rIndex);
        dRow.values = [
          idx + 1,
          field.label || field.key,
          formattedVal !== '' ? formattedVal : '-',
          field.key
        ];
        dRow.height = 22;

        const isEven = idx % 2 === 1;
        const rowBg = isEven ? sectionTheme.zebraBg : EXCEL_THEMES.common.white;

        dRow.eachCell((cell, colNum) => {
          cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: EXCEL_THEMES.common.textDark } };
          cell.border = THIN_BORDER;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };

          if (colNum === 1) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: EXCEL_THEMES.common.textMuted } };
          } else if (colNum === 2) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          } else if (colNum === 3) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: sectionTheme.headerBg } };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            cell.font = { name: 'Consolas', size: 8.5, color: { argb: EXCEL_THEMES.common.textMuted } };
          }
        });
      });

      ws.getColumn(1).width = 8;
      ws.getColumn(2).width = 42;
      ws.getColumn(3).width = 26;
      ws.getColumn(4).width = 28;
    };

    // TẠO SHEET 2: THÔNG SỐ HOẠT ĐỘNG RIÊNG
    addDedicatedSheet('ThongSo_HoatDong', 'BẢNG THÔNG SỐ HOẠT ĐỘNG (REALTIME)', realTimeFields, realTimeRecord, EXCEL_THEMES.blue);

    // TẠO SHEET 3: THÔNG SỐ CÀI ĐẶT RIÊNG
    addDedicatedSheet('ThongSo_CaiDat', 'BẢNG THÔNG SỐ CÀI ĐẶT (SETTING)', settingFields, settingRecord, EXCEL_THEMES.orange);

    // TẠO SHEET 4: THÔNG SỐ CÔNG THỨC RIÊNG (NẾU CÓ)
    if (recipeRecord || (recipeFields && recipeFields.length > 0)) {
      addDedicatedSheet('ThongSo_CongThuc', 'BẢNG THÔNG SỐ CÔNG THỨC (RECIPE)', recipeFields, recipeRecord, EXCEL_THEMES.green);
    }

    // TẢI FILE EXCEL VỀ MÁY
    const buffer = await workbook.xlsx.writeBuffer();
    const defaultFileName = fileName || `BaoCao_TongHop_ThongSo_${equipmentId}_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;
    const cleanFileName = `${defaultFileName.replace(/[:\\/?*\[\]]/g, '_')}.xlsx`;

    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), cleanFileName);

    console.log(`>>> [exportExcelHelper] Xuất Báo Cáo Tổng Hợp thành công: "${cleanFileName}"`);
    toast.success('Xuất Báo Cáo Excel Tổng Hợp thành công');
    return true;
  } catch (error) {
    console.error(`>>> [exportExcelHelper] Lỗi xuất Báo Cáo Tổng Hợp:`, error);
    toast.error('Lỗi khi xuất Báo Cáo Excel Tổng Hợp. Vui lòng thử lại!');
    return false;
  }
};

