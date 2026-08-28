import os
import re

files = [
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeLopKscl.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKePhanLoaiChatLuong.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeKhongTinhLopTraXuLy.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeTheoNgayCom.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoKeHoachThang.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoTongHopChiTiet.jsx"
]

for f in files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    if "import { getThanhHinhToSXList } from '../../api/thanhhinhApi';" not in content:
        content = re.sub(r"(import \{[^}]+\}\s*from\s*['\"]../../api/kcsWebApi['\"];\n)", r"\1import { getThanhHinhToSXList } from '../../api/thanhhinhApi';\n", content)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Fixed getThanhHinhToSXList for {os.path.basename(f)}")
