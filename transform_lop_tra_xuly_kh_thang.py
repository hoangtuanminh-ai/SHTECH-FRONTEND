import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoLopTraXuLyNhapKhoKeHoachThang.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Component name
content = content.replace("const BaoCaoLopTraXuLyNhapKho =", "const BaoCaoLopTraXuLyNhapKhoKeHoachThang =")
content = content.replace("export default BaoCaoLopTraXuLyNhapKho;", "export default BaoCaoLopTraXuLyNhapKhoKeHoachThang;")

# 2. Imports
content = content.replace("getBaoCaoLopTraXuLyNhapKho,", "getBaoCaoLopTraXuLyNhapKhoKeHoachThang,")
content = content.replace("getBaoCaoLopTraXuLyNhapKhoCom", "getBaoCaoLopTraXuLyNhapKhoKeHoachThangCom")

# 3. API calls
content = content.replace("getBaoCaoLopTraXuLyNhapKhoCom(payload)", "getBaoCaoLopTraXuLyNhapKhoKeHoachThangCom(payload)")
content = content.replace("getBaoCaoLopTraXuLyNhapKho(payload)", "getBaoCaoLopTraXuLyNhapKhoKeHoachThang(payload)")

# 4. Titles
content = content.replace("BÁO CÁO LỐP TRẢ XỬ LÝ NHẬP KHO", "BÁO CÁO LỐP TRẢ XỬ LÝ NHẬP KHO (KẾ HOẠCH THÁNG)")
content = content.replace("Bao_Cao_Lop_Tra_Xu_Ly_Nhap_Kho_", "Bao_Cao_Lop_Tra_Xu_Ly_Nhap_Kho_Ke_Hoach_Thang_")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BaoCaoLopTraXuLyNhapKhoKeHoachThang.jsx successfully.")
