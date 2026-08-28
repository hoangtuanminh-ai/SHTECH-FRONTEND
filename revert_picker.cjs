const fs = require('fs');
const file = 'd:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/ThanhHinh/MayThanhHinhDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const t2 = `<span>SẢN XUẤT THÁNG {String(selectedMonth).padStart(2,'0')}-{selectedYear}</span>
                    <input 
                      type="month" 
                      value={\`\${selectedYear}-\${String(selectedMonth).padStart(2,'0')}\`}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const [y, m] = val.split('-');
                          setSelectedYear(Number(y));
                          setSelectedMonth(Number(m));
                        }
                      }}
                      style={{ fontSize: '13px', padding: '2px 5px', borderRadius: '3px', border: '1px solid #10b981', outline: 'none', background: '#fff' }}
                    />`;
const r2 = `SẢN XUẤT THÁNG {String(selectedMonth).padStart(2,'0')}-{selectedYear}`;

const t1 = `<div style={{ background: '#d1fae5', padding: '8px 10px', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px', border: '1px solid #10b981', color: '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>`;
const r1 = `<div style={{ background: '#d1fae5', padding: '8px 10px', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px', border: '1px solid #10b981', color: '#065f46' }}>`;

let newContent = content.replace(t2, r2);
newContent = newContent.replace(t1, r1);

if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log("Replaced successfully");
} else {
    console.log("No changes made");
}
