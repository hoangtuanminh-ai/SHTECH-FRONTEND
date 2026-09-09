// src/utils/exportPdfHelper.js
/**
 * Tiện ích xuất Báo Cáo PDF chất lượng cao cho các màn hình Dashboard của hệ thống MES DRC
 * - Khắc phục triệt để lỗi hiển thị font tiếng Việt (Unicode) của jsPDF bằng cách render Header & Footer qua HTML DOM Canvas
 * - Sử dụng html2canvas (độ phân giải scale: 2) và jsPDF khổ giấy A4 tiêu chuẩn (Landscape hoặc Portrait)
 * - Header trang trọng chuẩn doanh nghiệp: Tên đơn vị, tiêu đề báo cáo to rõ, thông tin bộ lọc & thời gian
 * - Giữ nguyên toàn bộ biểu đồ Recharts (Bar, Donut, Area), thẻ KPI và bảng số liệu
 * - Tự động ẩn các nút bấm thao tác / dropdown tương tác khi in
 * - Tự động tính toán chia trang và thêm Footer đánh số trang chuẩn tiếng Việt (Trang X / Y)
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

/**
 * Tạo Canvas Header chuẩn doanh nghiệp hỗ trợ 100% Unicode tiếng Việt
 */
const createHeaderCanvas = async ({ title, subTitle = '', metadata = {}, filterInfo = '', targetWidthPx = 1200 }) => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '-9999px';
  wrapper.style.width = `${targetWidthPx}px`;
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.fontFamily = "'Segoe UI', Arial, Helvetica, sans-serif";
  wrapper.style.padding = '12px 18px 10px 18px';
  wrapper.style.boxSizing = 'border-box';
  wrapper.style.borderBottom = '2.5px solid #1e3a8a';

  let metaStr = `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`;
  if (filterInfo) {
    metaStr = `${filterInfo}  •  ${metaStr}`;
  } else {
    if (subTitle) metaStr = `${subTitle}  |  ${metaStr}`;
    const metaEntries = Object.entries(metadata || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '');
    if (metaEntries.length > 0) {
      const extraMeta = metaEntries.map(([k, v]) => `${k}: ${v}`).join('  |  ');
      metaStr = `${metaStr}  |  ${extraMeta}`;
    }
  }

  wrapper.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 8px;">
      <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; letter-spacing: 0.3px; text-transform: uppercase;">
        CÔNG TY CỔ PHẦN CAO SU ĐÀ NẴNG (DRC) — HỆ THỐNG GIÁM SÁT SẢN XUẤT SCADA & MES
      </div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b;">
        DRC-MES-REPORT • ${new Date().toLocaleDateString('vi-VN')}
      </div>
    </div>
    <div style="text-align: center; margin: 6px 0 4px 0;">
      <div style="font-size: 19px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.4px;">
        ${title}
      </div>
    </div>
    <div style="text-align: center; font-size: 11.5px; font-weight: 600; color: #475569; font-style: italic;">
      ${metaStr}
    </div>
  `;

  document.body.appendChild(wrapper);
  const headerCanvas = await html2canvas(wrapper, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false
  });
  document.body.removeChild(wrapper);
  return headerCanvas;
};

/**
 * Tạo Canvas Footer chuẩn hóa hỗ trợ 100% Unicode tiếng Việt
 */
const createFooterCanvas = async ({ pageNum, totalPages, targetWidthPx = 1200 }) => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '-9999px';
  wrapper.style.width = `${targetWidthPx}px`;
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.fontFamily = "'Segoe UI', Arial, Helvetica, sans-serif";
  wrapper.style.padding = '6px 18px';
  wrapper.style.boxSizing = 'border-box';
  wrapper.style.borderTop = '1px solid #cbd5e1';

  wrapper.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
      <div>
        Hệ thống Quản lý Sản xuất MES DRC — Bản quyền thuộc Công ty Cổ phần Cao su Đà Nẵng (DRC)
      </div>
      <div style="font-weight: 800; color: #0f172a;">
        Trang ${pageNum} / ${totalPages}
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);
  const footerCanvas = await html2canvas(wrapper, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false
  });
  document.body.removeChild(wrapper);
  return footerCanvas;
};

/**
 * Xuất vùng Dashboard ra file PDF chuyên nghiệp
 * @param {Object} options
 * @param {HTMLElement} options.element - Phần tử DOM vùng nội dung Dashboard (gắn ref)
 * @param {string} options.fileName - Tên file PDF xuất ra (không cần đuôi .pdf)
 * @param {string} options.title - Tiêu đề báo cáo chính thức
 * @param {string} [options.subTitle=''] - Tiêu đề phụ hoặc mô tả báo cáo
 * @param {string} [options.filterInfo=''] - Chuỗi thông tin bộ lọc hiển thị trên Header
 * @param {Object} [options.metadata={}] - Đối tượng chứa thông tin bộ lọc (Mã máy, Ngày, Tháng, Năm, Ca...)
 * @param {'landscape'|'portrait'} [options.orientation='landscape'] - Hướng trang in A4 (ngang hoặc dọc)
 * @returns {Promise<boolean>}
 */
export const exportDashboardToPDF = async ({
  element,
  fileName = 'BaoCao_Dashboard',
  title = 'BÁO CÁO GIÁM SÁT SẢN XUẤT MES DRC',
  subTitle = '',
  filterInfo = '',
  metadata = {},
  orientation = 'landscape'
}) => {
  console.log(`>>> [exportPdfHelper] Bắt đầu tạo PDF: "${fileName}", orientation: ${orientation}, title: "${title}"`);

  if (!element) {
    console.warn(`>>> [exportPdfHelper] Cảnh báo: Phần tử DOM (element) không tồn tại!`);
    toast.warn('Chưa tải xong nội dung giao diện để xuất PDF');
    return false;
  }

  const toastId = toast.loading('Đang khởi tạo bản in PDF chất lượng cao, vui lòng chờ trong giây lát...');

  try {
    // 1. Tạm thời ẩn các nút bấm, icon thao tác và selector không cần in trong PDF
    const noPrintElements = element.querySelectorAll('.pdf-no-print, button, select, input[type="file"]');
    const originalStyles = [];
    noPrintElements.forEach((el, index) => {
      originalStyles[index] = {
        display: el.style.display,
        visibility: el.style.visibility
      };
      // Ẩn nhẹ bằng visibility để không làm thay đổi layout co dãn của các thẻ cha
      el.style.visibility = 'hidden';
    });

    console.log(`>>> [exportPdfHelper] Đã tạm ẩn ${noPrintElements.length} phần tử giao diện tương tác để in.`);

    // Đợi 100ms để DOM ổn định trạng thái
    await new Promise(resolve => setTimeout(resolve, 100));

    // 2. Chụp toàn bộ vùng Dashboard bằng html2canvas với độ nét cao (scale 2)
    const canvas = await html2canvas(element, {
      scale: 2, // Tăng gấp đôi độ phân giải để chữ và biểu đồ cực kỳ sắc nét
      useCORS: true, // Hỗ trợ tải hình ảnh máy từ domain backend
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth || 1400
    });

    // 3. Khôi phục lại hiển thị cho các nút bấm trên màn hình
    noPrintElements.forEach((el, index) => {
      if (originalStyles[index]) {
        el.style.display = originalStyles[index].display;
        el.style.visibility = originalStyles[index].visibility;
      }
    });

    // 4. Khởi tạo tài liệu jsPDF khổ A4
    const isLandscape = orientation === 'landscape';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();   // 297mm (Landscape) hoặc 210mm (Portrait)
    const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm (Landscape) hoặc 297mm (Portrait)

    const marginX = 8; // Lề trái/phải 8mm
    const marginTop = 6; // Lề trên 6mm
    const marginBottom = 6; // Lề dưới 6mm
    const usableWidth = pageWidth - marginX * 2;

    // Chiều rộng pixel cơ sở để tạo Header và Footer tương xứng với canvas
    const targetHeaderWidthPx = Math.max(canvas.width / 2, 1200);

    // 5. Tạo Canvas Header chuẩn Unicode tiếng Việt
    console.log(`>>> [exportPdfHelper] Tạo Canvas Header tiếng Việt cho báo cáo: "${title}"`);
    const headerCanvas = await createHeaderCanvas({
      title,
      subTitle,
      metadata,
      filterInfo,
      targetWidthPx: targetHeaderWidthPx
    });
    const headerPdfHeight = (headerCanvas.height * usableWidth) / headerCanvas.width;
    const headerImgData = headerCanvas.toDataURL('image/png');

    // Chiều cao và vị trí các vùng trên trang PDF
    const contentStartY = marginTop + headerPdfHeight + 2;
    const approxFooterPdfHeight = 8; // mm
    const footerY = pageHeight - marginBottom - approxFooterPdfHeight;
    const contentMaxHeight = footerY - contentStartY - 1;

    // 6. Tính toán kích thước nội dung Canvas đưa vào PDF
    const canvasImgWidth = canvas.width;
    const canvasImgHeight = canvas.height;
    const totalPdfImgHeight = (canvasImgHeight * usableWidth) / canvasImgWidth;

    console.log(`>>> [exportPdfHelper] Kích thước canvas: ${canvasImgWidth}x${canvasImgHeight}, chiều cao nội dung PDF: ${totalPdfImgHeight.toFixed(1)}mm (Khả dụng mỗi trang: ${contentMaxHeight.toFixed(1)}mm)`);

    // Kiểm tra nếu nội dung vừa vặn trong 1 trang duy nhất
    if (totalPdfImgHeight <= contentMaxHeight) {
      // ── TRƯỜNG HỢP 1: VỪA VẶN 1 TRANG (Đẹp nhất cho Dashboard tổng quan) ──
      // Vẽ Header tiếng Việt
      pdf.addImage(headerImgData, 'PNG', marginX, marginTop, usableWidth, headerPdfHeight);

      // Vẽ Nội dung Dashboard
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', marginX, contentStartY, usableWidth, totalPdfImgHeight);

      // Vẽ Footer tiếng Việt
      const footerCanvas = await createFooterCanvas({ pageNum: 1, totalPages: 1, targetWidthPx: targetHeaderWidthPx });
      const footerPdfHeight = (footerCanvas.height * usableWidth) / footerCanvas.width;
      pdf.addImage(footerCanvas.toDataURL('image/png'), 'PNG', marginX, pageHeight - marginBottom - footerPdfHeight, usableWidth, footerPdfHeight);
    } else {
      // ── TRƯỜNG HỢP 2: NỘI DUNG DÀI (Tự động chia thành nhiều trang mượt mà) ──
      const pageCanvasHeight = (contentMaxHeight * canvasImgWidth) / usableWidth;
      const totalPages = Math.ceil(canvasImgHeight / pageCanvasHeight);

      console.log(`>>> [exportPdfHelper] Nội dung dài, tự động chia thành ${totalPages} trang A4.`);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) {
          pdf.addPage();
        }

        // Vẽ Header tiếng Việt cho trang này
        pdf.addImage(headerImgData, 'PNG', marginX, marginTop, usableWidth, headerPdfHeight);

        // Cắt lát canvas phụ cho từng trang
        const sourceY = p * pageCanvasHeight;
        const sliceCanvasHeight = Math.min(pageCanvasHeight, canvasImgHeight - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasImgWidth;
        pageCanvas.height = sliceCanvasHeight;
        const pageCtx = pageCanvas.getContext('2d');

        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvasImgWidth, sliceCanvasHeight,
          0, 0, canvasImgWidth, sliceCanvasHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pagePdfImgHeight = (sliceCanvasHeight * usableWidth) / canvasImgWidth;

        pdf.addImage(pageImgData, 'JPEG', marginX, contentStartY, usableWidth, pagePdfImgHeight);

        // Vẽ Footer tiếng Việt đánh số Trang (p + 1) / totalPages
        const footerCanvas = await createFooterCanvas({
          pageNum: p + 1,
          totalPages,
          targetWidthPx: targetHeaderWidthPx
        });
        const footerPdfHeight = (footerCanvas.height * usableWidth) / footerCanvas.width;
        pdf.addImage(footerCanvas.toDataURL('image/png'), 'PNG', marginX, pageHeight - marginBottom - footerPdfHeight, usableWidth, footerPdfHeight);
      }
    }

    // 7. Lưu file PDF về máy tính người dùng
    const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const cleanFileName = `${fileName.replace(/[:\\/?*\[\]]/g, '_')}_${timeStamp}.pdf`;

    pdf.save(cleanFileName);

    console.log(`>>> [exportPdfHelper] Đã tạo và tải file PDF thành công: "${cleanFileName}"`);
    toast.update(toastId, {
      render: `Xuất file PDF thành công: "${cleanFileName}"`,
      type: 'success',
      isLoading: false,
      autoClose: 3500
    });
    return true;
  } catch (error) {
    console.error(`>>> [exportPdfHelper] Lỗi nghiêm trọng khi xuất PDF:`, error);
    toast.update(toastId, {
      render: 'Có lỗi xảy ra trong quá trình kết xuất PDF. Vui lòng thử lại!',
      type: 'error',
      isLoading: false,
      autoClose: 4000
    });
    return false;
  }
};
