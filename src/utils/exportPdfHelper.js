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
  pages = null,
  fileName = 'BaoCao_Dashboard',
  title = 'BÁO CÁO GIÁM SÁT SẢN XUẤT MES DRC',
  subTitle = '',
  filterInfo = '',
  metadata = {},
  orientation = 'landscape'
}) => {
  console.log(`>>> [exportPdfHelper] Bắt đầu tạo PDF: "${fileName}", orientation: ${orientation}, title: "${title}"`);

  if (!element && (!pages || pages.length === 0)) {
    console.warn(`>>> [exportPdfHelper] Cảnh báo: Phần tử DOM (element hoặc pages) không tồn tại!`);
    toast.warn('Chưa tải xong nội dung giao diện để xuất PDF');
    return false;
  }

  const toastId = toast.loading('Đang khởi tạo bản in PDF chất lượng cao, vui lòng chờ trong giây lát...');

  try {
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
    const usableWidth = pageWidth - marginX * 2; // 281mm (Landscape)

    // ── KIỂM TRA CHẾ ĐỘ 1: XUẤT ĐA TRANG PHÂN ĐOẠN ĐỊNH SẴN (.drc-pdf-page HOẶC pages ARRAY) ──
    // Giúp các biểu đồ 31 ngày / 3 ca được chia thành các Kỳ (1-10, 11-20, 21-31) to rõ ràng,
    // mỗi trang có trục Y-Axis riêng và cột hiển thị cực lớn, dễ đọc 100%.
    const multiPages = pages && pages.length > 0
      ? pages
      : (element && element.querySelectorAll ? Array.from(element.querySelectorAll('.drc-pdf-page')) : []);

    if (multiPages.length > 0) {
      const totalPages = multiPages.length;
      console.log(`>>> [exportPdfHelper] 📑 Kích hoạt Chế độ Đa Trang Chuyên Dụng (${totalPages} trang). Bắt đầu kết xuất từng phân đoạn...`);

      for (let p = 0; p < totalPages; p++) {
        const pageEl = multiPages[p];
        if (p > 0) {
          pdf.addPage();
        }

        // Lấy tiêu đề phân đoạn riêng của trang (nếu có thuộc tính data-page-title)
        const pageSegmentTitle = pageEl.getAttribute('data-page-title') || '';
        let pageHeaderTitle = title;
        let pageFilterInfo = filterInfo;

        if (pageSegmentTitle) {
          pageFilterInfo = pageFilterInfo
            ? `【 ${pageSegmentTitle} 】  •  ${pageFilterInfo}`
            : `【 ${pageSegmentTitle} 】`;
        }

        console.log(`>>> [exportPdfHelper] Đang chụp Trang ${p + 1}/${totalPages}: "${pageSegmentTitle || title}"`);

        // Tạm ẩn các nút tương tác nếu có trong trang
        const innerNoPrint = pageEl.querySelectorAll('.pdf-no-print, button, select');
        innerNoPrint.forEach(el => { el.style.visibility = 'hidden'; });

        // Tạo Canvas Header riêng cho từng trang
        const targetHeaderWidthPx = Math.max(pageEl.scrollWidth || 1350, 1200);
        const headerCanvas = await createHeaderCanvas({
          title: pageHeaderTitle,
          subTitle,
          metadata,
          filterInfo: pageFilterInfo,
          targetWidthPx: targetHeaderWidthPx
        });
        const headerPdfHeight = (headerCanvas.height * usableWidth) / headerCanvas.width;
        const headerImgData = headerCanvas.toDataURL('image/png');

        // Chiều cao nội dung khả dụng cho trang này
        const contentStartY = marginTop + headerPdfHeight + 2;
        const approxFooterPdfHeight = 8; // mm
        const footerY = pageHeight - marginBottom - approxFooterPdfHeight;
        const contentMaxHeight = footerY - contentStartY - 1;

        // Chụp nội dung của trang này với html2canvas độ nét cao (scale 2)
        const pageCanvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: pageEl.scrollWidth || 1350,
          windowWidth: 1400,
          scrollX: 0,
          scrollY: 0
        });

        // Phục hồi lại hiển thị cho các nút
        innerNoPrint.forEach(el => { el.style.visibility = 'visible'; });

        // Tính toán tỷ lệ đưa nội dung vào vừa vặn trang A4 Landscape
        let pagePdfImgHeight = (pageCanvas.height * usableWidth) / pageCanvas.width;
        let drawWidth = usableWidth;
        let drawX = marginX;
        let drawY = contentStartY;

        // Nếu nội dung cao hơn khung khả dụng, co tỷ lệ theo chiều cao để không đè vào Footer
        if (pagePdfImgHeight > contentMaxHeight) {
          const fitRatio = contentMaxHeight / pagePdfImgHeight;
          drawWidth = usableWidth * fitRatio;
          pagePdfImgHeight = contentMaxHeight;
          drawX = marginX + (usableWidth - drawWidth) / 2; // Căn giữa nội dung
        }

        // 1. Vẽ Header tiếng Việt
        pdf.addImage(headerImgData, 'PNG', marginX, marginTop, usableWidth, headerPdfHeight);

        // 2. Vẽ Nội dung biểu đồ phân đoạn
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);
        pdf.addImage(pageImgData, 'JPEG', drawX, drawY, drawWidth, pagePdfImgHeight);

        // 3. Vẽ Footer tiếng Việt đánh số Trang X / Y
        const footerCanvas = await createFooterCanvas({
          pageNum: p + 1,
          totalPages,
          targetWidthPx: targetHeaderWidthPx
        });
        const footerPdfHeight = (footerCanvas.height * usableWidth) / footerCanvas.width;
        pdf.addImage(footerCanvas.toDataURL('image/png'), 'PNG', marginX, pageHeight - marginBottom - footerPdfHeight, usableWidth, footerPdfHeight);
      }

      // Lưu file PDF đa trang
      const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const cleanFileName = `${fileName.replace(/[:\\/?*\[\]]/g, '_')}_${timeStamp}.pdf`;
      pdf.save(cleanFileName);

      console.log(`>>> [exportPdfHelper] 🎉 Đã xuất thành công file PDF Đa Trang: "${cleanFileName}" (${totalPages} trang)`);
      toast.update(toastId, {
        render: `Xuất file PDF thành công: "${cleanFileName}" (${totalPages} trang)`,
        type: 'success',
        isLoading: false,
        autoClose: 3500
      });
      return true;
    }

    // ── KIỂM TRA CHẾ ĐỘ 2: CHỤP VÙNG ELEMENT ĐƠN LẺ (FALLBACK NÂNG CẤP VỚI HORIZONTAL CHUNKING) ──
    // 1. Tạm thời ẩn các nút bấm, icon thao tác và selector không cần in trong PDF
    const noPrintElements = element.querySelectorAll('.pdf-no-print, button, select, input[type="file"]');
    const originalStyles = [];
    noPrintElements.forEach((el, index) => {
      originalStyles[index] = {
        display: el.style.display,
        visibility: el.style.visibility
      };
      el.style.visibility = 'hidden';
    });

    console.log(`>>> [exportPdfHelper] Đã tạm ẩn ${noPrintElements.length} phần tử giao diện tương tác để in.`);

    // 1.1 Tìm các container cuộn ngang và kiểm tra xem có container nào THỰC SỰ có thanh trượt ngang không
    const scrollNodes = element.querySelectorAll('.drc-daychart-scroll, .drc-year-chart-scroll, .drc-data-table-wrap, [class*="-scroll"]');
    const savedScrollStates = [];
    let maxChildScrollWidth = element.clientWidth;
    let hasActiveScrollbar = false;

    scrollNodes.forEach(sc => {
      let innerWidth = sc.scrollWidth;
      Array.from(sc.children).forEach(child => {
        if (child.scrollWidth > innerWidth) innerWidth = child.scrollWidth;
        if (child.offsetWidth > innerWidth) innerWidth = child.offsetWidth;
      });

      // Chỉ coi là có thanh trượt ngang khi nội dung cuộn bên trong lớn hơn chiều rộng hiển thị của container ít nhất 80px
      if (innerWidth > sc.clientWidth + 80) {
        hasActiveScrollbar = true;
        if (innerWidth > maxChildScrollWidth) {
          maxChildScrollWidth = innerWidth;
        }

        savedScrollStates.push({
          el: sc,
          overflowX: sc.style.overflowX,
          overflow: sc.style.overflow,
          width: sc.style.width,
          maxWidth: sc.style.maxWidth,
          scrollLeft: sc.scrollLeft
        });

        // Tạm mở rộng container để html2canvas chụp được toàn bộ nội dung ẩn sau thanh trượt
        sc.scrollLeft = 0;
        sc.style.overflowX = 'visible';
        sc.style.overflow = 'visible';
        sc.style.width = '100%';
        sc.style.maxWidth = 'none';
      }
    });

    const isWideChart = hasActiveScrollbar && (maxChildScrollWidth > element.clientWidth + 80);
    const origElementWidth = element.style.width;
    const origElementMaxWidth = element.style.maxWidth;

    if (isWideChart) {
      console.log(`>>> [exportPdfHelper] 🚀 Phát hiện biểu đồ CÓ THANH TRƯỢT NGANG (${maxChildScrollWidth}px > ${element.clientWidth}px). Đang mở rộng DOM để chụp...`);
      element.style.width = `${maxChildScrollWidth + 40}px`;
      element.style.maxWidth = 'none';
    } else {
      console.log(`>>> [exportPdfHelper] ℹ️ Giao diện KHÔNG CÓ THANH TRƯỢT NGANG (vừa vặn màn hình). Giữ nguyên 1 trang để tránh ngắt quãng thị giác.`);
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    // 2. Chụp toàn bộ vùng Dashboard bằng html2canvas
    const renderWidth = isWideChart ? maxChildScrollWidth + 40 : (element.scrollWidth || 1400);
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: renderWidth,
      windowWidth: Math.max(renderWidth, 1400),
      scrollX: 0,
      scrollY: 0
    });

    // 3. Khôi phục lại trạng thái ban đầu của DOM
    noPrintElements.forEach((el, index) => {
      if (originalStyles[index]) {
        el.style.display = originalStyles[index].display;
        el.style.visibility = originalStyles[index].visibility;
      }
    });

    if (isWideChart) {
      element.style.width = origElementWidth;
      element.style.maxWidth = origElementMaxWidth;
    }
    savedScrollStates.forEach(s => {
      s.el.style.overflowX = s.overflowX;
      s.el.style.overflow = s.overflow;
      s.el.style.width = s.width;
      s.el.style.maxWidth = s.maxWidth;
      s.el.scrollLeft = s.scrollLeft;
    });

    // 4. Chuẩn bị thông số in ấn
    const targetHeaderWidthPx = Math.max(canvas.width / 2, 1200);
    const headerCanvas = await createHeaderCanvas({
      title,
      subTitle,
      metadata,
      filterInfo,
      targetWidthPx: targetHeaderWidthPx
    });
    const headerPdfHeight = (headerCanvas.height * usableWidth) / headerCanvas.width;
    const headerImgData = headerCanvas.toDataURL('image/png');

    const contentStartY = marginTop + headerPdfHeight + 2;
    const approxFooterPdfHeight = 8;
    const footerY = pageHeight - marginBottom - approxFooterPdfHeight;
    const contentMaxHeight = footerY - contentStartY - 1;

    const canvasImgWidth = canvas.width;
    const canvasImgHeight = canvas.height;

    // CHỈ CẮT LÁT THEO CHIỀU NGANG KHI VÀ CHỈ KHI: CÓ THANH TRƯỢT NGANG THỰC SỰ (isWideChart === true)!
    // Nếu KHÔNG CÓ thanh trượt ngang: Tuyệt đối KHÔNG CẮT NGANG, in trọn vẹn 1 trang (hoặc chia dọc nếu cao) để TRÁNH NGẮT QUÃNG THỊ GIÁC!
    const maxSegmentWidthPx = 2600; // Tương đương ~1300px CSS
    if (isWideChart && canvasImgWidth > maxSegmentWidthPx) {
      const numSegments = Math.ceil(canvasImgWidth / maxSegmentWidthPx);
      console.log(`>>> [exportPdfHelper] ✂️ Biểu đồ có thanh trượt ngang quá dài (${canvasImgWidth}px > ${maxSegmentWidthPx}px). Cắt thành ${numSegments} trang A4 Landscape theo chiều ngang...`);

      const segmentCanvasWidth = Math.ceil(canvasImgWidth / numSegments);

      for (let s = 0; s < numSegments; s++) {
        if (s > 0) {
          pdf.addPage();
        }

        const sourceX = s * segmentCanvasWidth;
        const currentSliceWidth = Math.min(segmentCanvasWidth, canvasImgWidth - sourceX);

        // Tạo canvas phụ cho phân đoạn ngang này
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = currentSliceWidth;
        sliceCanvas.height = canvasImgHeight;
        const sliceCtx = sliceCanvas.getContext('2d');

        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, currentSliceWidth, canvasImgHeight);
        sliceCtx.drawImage(
          canvas,
          sourceX, 0, currentSliceWidth, canvasImgHeight,
          0, 0, currentSliceWidth, canvasImgHeight
        );

        // Đưa phân đoạn vào trang PDF
        let slicePdfHeight = (canvasImgHeight * usableWidth) / currentSliceWidth;
        let drawWidth = usableWidth;
        let drawHeight = slicePdfHeight;
        let drawX = marginX;
        let drawY = contentStartY;

        if (slicePdfHeight > contentMaxHeight) {
          const ratio = contentMaxHeight / slicePdfHeight;
          drawWidth = usableWidth * ratio;
          drawHeight = contentMaxHeight;
          drawX = marginX + (usableWidth - drawWidth) / 2;
        }

        // Tiêu đề Header cho phân đoạn này
        const segFilterInfo = filterInfo
          ? `【 Phân đoạn ${s + 1}/${numSegments} 】  •  ${filterInfo}`
          : `【 Phân đoạn ${s + 1}/${numSegments} 】`;

        const segHeaderCanvas = await createHeaderCanvas({
          title,
          subTitle,
          metadata,
          filterInfo: segFilterInfo,
          targetWidthPx: targetHeaderWidthPx
        });
        const segHeaderPdfHeight = (segHeaderCanvas.height * usableWidth) / segHeaderCanvas.width;
        pdf.addImage(segHeaderCanvas.toDataURL('image/png'), 'PNG', marginX, marginTop, usableWidth, segHeaderPdfHeight);

        // Vẽ nội dung phân đoạn
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', drawX, drawY, drawWidth, drawHeight);

        // Vẽ Footer
        const footerCanvas = await createFooterCanvas({
          pageNum: s + 1,
          totalPages: numSegments,
          targetWidthPx: targetHeaderWidthPx
        });
        const footerPdfHeight = (footerCanvas.height * usableWidth) / footerCanvas.width;
        pdf.addImage(footerCanvas.toDataURL('image/png'), 'PNG', marginX, pageHeight - marginBottom - footerPdfHeight, usableWidth, footerPdfHeight);
      }
    } else {
      // Trường hợp thông thường: Chiều rộng vừa vặn, kiểm tra chia trang theo chiều dọc (Vertical Chunking)
      const totalPdfImgHeight = (canvasImgHeight * usableWidth) / canvasImgWidth;

      if (totalPdfImgHeight <= contentMaxHeight) {
        // Vừa vặn 1 trang duy nhất
        pdf.addImage(headerImgData, 'PNG', marginX, marginTop, usableWidth, headerPdfHeight);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', marginX, contentStartY, usableWidth, totalPdfImgHeight);

        const footerCanvas = await createFooterCanvas({ pageNum: 1, totalPages: 1, targetWidthPx: targetHeaderWidthPx });
        const footerPdfHeight = (footerCanvas.height * usableWidth) / footerCanvas.width;
        pdf.addImage(footerCanvas.toDataURL('image/png'), 'PNG', marginX, pageHeight - marginBottom - footerPdfHeight, usableWidth, footerPdfHeight);
      } else {
        // Nội dung dài theo chiều dọc, chia thành nhiều trang
        const pageCanvasHeight = (contentMaxHeight * canvasImgWidth) / usableWidth;
        const totalPages = Math.ceil(canvasImgHeight / pageCanvasHeight);

        console.log(`>>> [exportPdfHelper] Nội dung dài theo chiều dọc, tự động chia thành ${totalPages} trang A4.`);

        for (let p = 0; p < totalPages; p++) {
          if (p > 0) {
            pdf.addPage();
          }

          pdf.addImage(headerImgData, 'PNG', marginX, marginTop, usableWidth, headerPdfHeight);

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

          const footerCanvas = await createFooterCanvas({
            pageNum: p + 1,
            totalPages,
            targetWidthPx: targetHeaderWidthPx
          });
          const footerPdfHeight = (footerCanvas.height * usableWidth) / footerCanvas.width;
          pdf.addImage(footerCanvas.toDataURL('image/png'), 'PNG', marginX, pageHeight - marginBottom - footerPdfHeight, usableWidth, footerPdfHeight);
        }
      }
    }

    // 5. Lưu file PDF về máy tính người dùng
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
