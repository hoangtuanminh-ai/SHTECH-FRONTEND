import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoLopTraXuLyNhapKho.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Component name
content = content.replace("const BaoCaoKeHoachThang =", "const BaoCaoLopTraXuLyNhapKho =")
content = content.replace("export default BaoCaoKeHoachThang;", "export default BaoCaoLopTraXuLyNhapKho;")

# 2. Imports
content = content.replace("getBaoCaoKeHoachThang,", "getBaoCaoLopTraXuLyNhapKho,")
content = content.replace("getBaoCaoKeHoachThangCom", "getBaoCaoLopTraXuLyNhapKhoCom")

# 3. Add loaiCaNhap state
if "const [loaiCaNhap" not in content:
    content = content.replace("const [denKHThang, setDenKHThang] = useState('');", "const [denKHThang, setDenKHThang] = useState('');\n  const [loaiCaNhap, setLoaiCaNhap] = useState('');")

# 4. Add loaiCaNhap to clearAll
if "setLoaiCaNhap('');" not in content:
    content = content.replace("setTuKHThang(''); setDenKHThang('');", "setTuKHThang(''); setDenKHThang('');\n    setLoaiCaNhap('');")

# 5. Add loaiCaNhap to payload
payload_pattern = r"(maMay: maMay \|\| undefined)\n\s*};"
replacement_payload = r"\1,\n        loaiCaNhap: loaiCaNhap || undefined\n      };"
content = re.sub(payload_pattern, replacement_payload, content)

# 6. Change API calls
content = content.replace("getBaoCaoKeHoachThangCom(payload)", "getBaoCaoLopTraXuLyNhapKhoCom(payload)")
content = content.replace("getBaoCaoKeHoachThang(payload)", "getBaoCaoLopTraXuLyNhapKho(payload)")

# 7. Add loaiCaNhap UI
ui_pattern = r"(<div className=\"mes-fb-group\">\n\s*<span className=\"mes-fb-label\">Mã Máy:</span>[\s\S]*?</div>\n\s*</div>)"
input_html = r"""\1

        <div className="mes-fb-group">
          <span className="mes-fb-label">Loại Ca Nhập:</span>
          <input
            type="text" className="mes-input" style={{ width: 80 }}
            value={loaiCaNhap} onChange={e => setLoaiCaNhap(e.target.value)}
          />
        </div>"""
content = re.sub(ui_pattern, input_html, content)

# 8. Titles
content = content.replace("BÁO CÁO KẾ HOẠCH THÁNG", "BÁO CÁO LỐP TRẢ XỬ LÝ NHẬP KHO")
content = content.replace("Bao_Cao_Ke_Hoach_Thang_", "Bao_Cao_Lop_Tra_Xu_Ly_Nhap_Kho_")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BaoCaoLopTraXuLyNhapKho.jsx successfully.")
