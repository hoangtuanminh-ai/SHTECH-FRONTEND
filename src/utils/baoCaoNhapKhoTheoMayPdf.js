import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { timesNewRomanBase64 } from '../font/TimesNewRoman-Regular-base64';

export const exportBaoCaoNhapKhoTheoMayPdf = ({
  data,
  tuNgay = '',
  tuCa = '0',
  denNgay = '',
  denCa = '0',
  dateStr = new Date().toLocaleDateString('vi-VN'),
}) => {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  doc.addFileToVFS('TimesNewRoman-Regular.ttf', timesNewRomanBase64);
  doc.addFont('TimesNewRoman-Regular.ttf', 'TimesNewRoman', 'normal');
  doc.setFont('TimesNewRoman', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(9);
  doc.text('CÔNG TY CP CAO SU ĐÀ NẴNG', 30, 40);
  doc.text('XN RADIAL - BP. CVTH', 30, 55);

  doc.setFontSize(12);
  doc.text('TỔNG HỢP LỐP THÀNH HÌNH SẢN XUẤT', pageWidth / 2 + 30, 40, { align: 'center' });
  doc.setFontSize(10);

  let timeText = '';
  if (tuNgay && denNgay && tuNgay === denNgay) {
    timeText = `Ca ${tuCa === '0' ? 'Tất cả' : tuCa}, Ngày ${tuNgay.split('-')[2]} tháng ${tuNgay.split('-')[1]} năm ${tuNgay.split('-')[0]}`;
  } else {
    const tuText = tuNgay
      ? `Từ Ca ${tuCa === '0' ? 'Tất cả' : tuCa}, Ngày ${tuNgay.split('-')[2]}/${tuNgay.split('-')[1]}/${tuNgay.split('-')[0]}`
      : '';
    const denText = denNgay
      ? `Đến Ca ${denCa === '0' ? 'Tất cả' : denCa}, Ngày ${denNgay.split('-')[2]}/${denNgay.split('-')[1]}/${denNgay.split('-')[0]}`
      : '';
    timeText = [tuText, denText].filter(Boolean).join(' - ');

    if (!timeText) {
      const dateParts = dateStr.split('/');
      timeText = `Ca ${tuCa === '0' ? 'Tất cả' : tuCa}, Ngày ${dateParts[0]} tháng ${dateParts[1]} năm ${dateParts[2]}`;
    }
  }

  doc.text(timeText, pageWidth / 2 + 30, 55, { align: 'center' });

  const tableBody = data.map((row, index) => [
    row[0] || index + 1,
    row[2] || '—',
    row[1] || '—',
    row[4] || '—',
    row[6] || 'Chiếc',
    (Number(row[3]) || 0).toLocaleString('vi-VN'),
    row[5] || '',
  ]);

  const totalQuantity = data.reduce((sum, row) => sum + (Number(row[3]) || 0), 0);
  tableBody.push([
    { content: 'TỔNG CỘNG', colSpan: 5, styles: { halign: 'center', fontStyle: 'normal' } },
    { content: totalQuantity.toLocaleString('vi-VN'), styles: { halign: 'right', fontStyle: 'normal' } },
    '',
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['STT', 'Quy Cách', 'Ký hiệu\nmã QC', 'Máy TH', 'ĐVT', 'Số Lượng', 'GHI CHÚ']],
    body: tableBody,
    theme: 'grid',
    styles: { font: 'TimesNewRoman', fontSize: 10, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
    headStyles: { font: 'TimesNewRoman', fontStyle: 'normal', fillColor: [255, 255, 255], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 60, halign: 'center' },
      3: { cellWidth: 40, halign: 'center' },
      4: { cellWidth: 40, halign: 'center' },
      5: { cellWidth: 60, halign: 'right' },
      6: { cellWidth: 60 },
    },
    margin: { left: 30, right: 30 },
    didParseCell: hookData => { hookData.cell.styles.font = 'TimesNewRoman'; },
  });

  const finalY = doc.lastAutoTable.finalY + 30;
  doc.setFontSize(11);
  doc.text('....................', 80, finalY);
  doc.text('....................', pageWidth / 2 - 40, finalY);
  doc.text('NGƯỜI LẬP', pageWidth - 80, finalY, { align: 'center' });

  doc.save(`BaoCao_NhapKho_TheoMay_${new Date().toISOString().slice(0, 10)}.pdf`);
};
