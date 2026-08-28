const fs = require('fs');
const file = 'd:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/ThanhHinh/MayThanhHinhDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The string to replace in the table headers: color: '#334155' -> color: '#7e22ce'
content = content.replace(/color: '#334155'/g, "color: '#7e22ce'");
// Also update the border color around SẢN XUẤT TRONG THEO CA if we want it to be red.
// The div at line 1786 has border: '1px solid #cbd5e1'
// Let's replace border: '1px solid #cbd5e1' with border: '2px solid red' for the table container.
content = content.replace(`<div style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '15px', marginBottom: '20px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
             <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '16px', background: '#1565C0', borderRadius: '2px' }}></div>
                SẢN XUẤT TRONG THEO CA
             </div>`, `<div style={{ border: '2px solid red', background: '#fff', padding: '15px', marginBottom: '20px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
             <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '16px', background: '#1565C0', borderRadius: '2px' }}></div>
                SẢN XUẤT TRONG THEO CA
             </div>`);

fs.writeFileSync(file, content, 'utf8');
console.log("Colors updated");
