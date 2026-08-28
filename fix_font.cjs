const fs = require('fs');

try {
  // Read the actual times.ttf file directly using Node.js to avoid encoding issues
  const ttfBuffer = fs.readFileSync('C:\\Windows\\Fonts\\times.ttf');
  const base64String = ttfBuffer.toString('base64');
  
  const content = `export const timesNewRomanBase64 = '${base64String}';`;
  fs.writeFileSync('src/font/TimesNewRoman-Regular-base64.js', content, 'utf8');
  console.log('Successfully created TimesNewRoman-Regular-base64.js');
} catch (err) {
  console.error('Error:', err);
}
