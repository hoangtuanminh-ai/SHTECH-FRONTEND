const fs = require('fs');
const b64 = fs.readFileSync('times_base64.txt', 'utf8').replace(/\r?\n|\r/g, '');
const content = `export const timesNewRomanBase64 = '${b64}';`;
fs.writeFileSync('src/font/TimesNewRoman-Regular-base64.js', content, 'utf8');
