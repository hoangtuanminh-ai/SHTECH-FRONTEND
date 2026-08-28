import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoKeHoachThangKhongTheoMay.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Component name
content = content.replace("const BaoCaoKeHoachThang =", "const BaoCaoKeHoachThangKhongTheoMay =")
content = content.replace("export default BaoCaoKeHoachThang;", "export default BaoCaoKeHoachThangKhongTheoMay;")

# 2. Imports
content = content.replace("getBaoCaoKeHoachThang,", "getBaoCaoKeHoachThangKhongTheoMay,")
content = content.replace("getBaoCaoKeHoachThangCom", "getBaoCaoKeHoachThangTheoNgay")

# 3. API calls
content = content.replace("getBaoCaoKeHoachThangCom(payload)", "getBaoCaoKeHoachThangTheoNgay(payload)")
content = content.replace("getBaoCaoKeHoachThang(payload)", "getBaoCaoKeHoachThangKhongTheoMay(payload)")

# 4. Titles
content = content.replace("BÁO CÁO KẾ HOẠCH THÁNG", "BÁO CÁO KẾ HOẠCH THÁNG KHÔNG THEO MÁY")
content = content.replace("Bao_Cao_Ke_Hoach_Thang_", "Bao_Cao_Ke_Hoach_Thang_Khong_Theo_May_")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BaoCaoKeHoachThangKhongTheoMay.jsx successfully.")
