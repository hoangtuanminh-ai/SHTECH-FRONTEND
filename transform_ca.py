import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoKeHoachThangCa.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Component name
content = content.replace("const BaoCaoKeHoachThang =", "const BaoCaoKeHoachThangCa =")
content = content.replace("export default BaoCaoKeHoachThang;", "export default BaoCaoKeHoachThangCa;")

# 2. Imports
content = content.replace("getBaoCaoKeHoachThang,", "getBaoCaoKeHoachThangCa,")
content = content.replace("getBaoCaoKeHoachThangCom", "getBaoCaoKeHoachThangCaCom")

# 3. Add caNhap state
if "const [caNhap" not in content:
    content = content.replace("const [denKHThang, setDenKHThang] = useState('');", "const [denKHThang, setDenKHThang] = useState('');\n  const [caNhap, setCaNhap] = useState('');")

# 4. Add caNhap to clearAll
if "setCaNhap('');" not in content:
    content = content.replace("setTuKHThang(''); setDenKHThang('');", "setTuKHThang(''); setDenKHThang('');\n    setCaNhap('');")

# 5. Add caNhap to payload
payload_pattern = r"(maMay: maMay \|\| undefined)\n\s*};"
replacement_payload = r"\1,\n        caNhap: caNhap || undefined\n      };"
content = re.sub(payload_pattern, replacement_payload, content)

# 6. Change API calls
content = content.replace("getBaoCaoKeHoachThangCom(payload)", "getBaoCaoKeHoachThangCaCom(payload)")
content = content.replace("getBaoCaoKeHoachThang(payload)", "getBaoCaoKeHoachThangCa(payload)")

# 7. Add caNhap UI dropdown
ui_pattern = r"(<div className=\"mes-fb-group\">\n\s*<span className=\"mes-fb-label\">Mã Máy:</span>[\s\S]*?</div>\n\s*</div>)"
dropdown_html = r"""\1

        <div className="mes-fb-group">
          <span className="mes-fb-label">Ca Nhập:</span>
          <select className="mes-select" style={{ width: 66, height: 24, fontSize: 12, border: '1px solid #6890b0', borderRadius: 2 }} value={caNhap} onChange={e => setCaNhap(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>"""
content = re.sub(ui_pattern, dropdown_html, content)

# 8. Titles
content = content.replace("BÁO CÁO KẾ HOẠCH THÁNG", "BÁO CÁO KẾ HOẠCH THÁNG CA")
content = content.replace("Bao_Cao_Ke_Hoach_Thang_", "Bao_Cao_Ke_Hoach_Thang_Ca_")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BaoCaoKeHoachThangCa.jsx successfully.")
