const fs = require('fs');
const file = 'd:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/ThanhHinh/MayThanhHinhDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The closing tags are right before {/* ── SẢN XUẤT TRONG THEO CA ── */}
const target1 = `            </div>
          </div>

          {/* ── SẢN XUẤT TRONG THEO CA ── */}`;

const replacement1 = `          {/* ── SẢN XUẤT TRONG THEO CA ── */}`;

// The end of SẢN XUẤT TRONG THEO CA is before {/* ── ROW 3: SẢN XUẤT THÁNG & SCADA ── */}
const target2 = `           </div>

          {/* ── ROW 3: SẢN XUẤT THÁNG & SCADA ── */}`;

const replacement2 = `           </div>
            </div>
          </div>

          {/* ── ROW 3: SẢN XUẤT THÁNG & SCADA ── */}`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync(file, content, 'utf8');
console.log("Layout fixed");
