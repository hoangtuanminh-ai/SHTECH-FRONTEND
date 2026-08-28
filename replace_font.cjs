const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/BaoCaoKHSX/BaoCaoKHSX.jsx',
  'src/pages/BaoCaoKHSX/BaoCaoKHSXThang.jsx',
  'src/pages/BaoCaoKHSX/BaoCaoKHSXThangTongHop.jsx',
  'src/pages/BaoCaoKHSX/BaoCaoNhapKhoKhongTheoMay.jsx',
  'src/pages/BaoCaoKHSX/BaoCaoNhapKhoTheoMay.jsx'
];

files.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/import \{ robotoBase64 \} from '\.\.\/\.\.\/font\/Roboto-Regular-base64';/g, "import { timesNewRomanBase64 } from '../../font/TimesNewRoman-Regular-base64';");
  
  content = content.replace(/doc\.addFileToVFS\('Roboto-Regular\.ttf', robotoBase64\);/g, "doc.addFileToVFS('TimesNewRoman-Regular.ttf', timesNewRomanBase64);");
  content = content.replace(/doc\.addFont\('Roboto-Regular\.ttf', 'Roboto', 'normal'\);/g, "doc.addFont('TimesNewRoman-Regular.ttf', 'TimesNewRoman', 'normal');");
  
  content = content.replace(/doc\.setFont\('Roboto', 'normal'\);/g, "doc.setFont('TimesNewRoman', 'normal');");
  content = content.replace(/font:\s*'Roboto'/g, "font: 'TimesNewRoman'");
  content = content.replace(/d\.cell\.styles\.font = 'Roboto';/g, "d.cell.styles.font = 'TimesNewRoman';");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
});
