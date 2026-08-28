import os
import re

files = [
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeLopKscl.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKePhanLoaiChatLuong.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeKhongTinhLopTraXuLy.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeTheoNgayCom.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoKeHoachThang.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoTongHopChiTiet.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\NhapKhoChiTietLop.jsx"
]

for f in files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # Find all imported functions from kcsWebApi
    kcs_imports = set()
    for m in re.finditer(r"import\s*\{([^}]+)\}\s*from\s*['\"]../../api/kcsWebApi['\"];", content):
        funcs = [x.strip() for x in m.group(1).split(',')]
        kcs_imports.update(funcs)
    
    # Remove all existing kcsWebApi, thanhhinhApi, and kiemkeApi imports
    content = re.sub(r"import\s*\{[^}]+\}\s*from\s*['\"]../../api/kcsWebApi['\"];\n?", "", content)
    content = re.sub(r"import\s*\{[^}]+\}\s*from\s*['\"]../../api/thanhhinhApi['\"];\n?", "", content)
    content = re.sub(r"import\s*\{[^}]+\}\s*from\s*['\"]../../api/kiemkeApi['\"];\n?", "", content)

    # Reconstruct imports
    kcs_imports.discard('getViewStoreListOrks')
    kcs_imports.discard('getDmMayXRay')
    kcs_imports.discard('')
    
    new_imports = f"import {{ {', '.join(sorted(list(kcs_imports)))}, getViewStoreListOrks, getDmMayXRay }} from '../../api/kcsWebApi';\n"
    
    # Check what else is needed
    if "getThanhHinhToSXList" in content:
        new_imports += "import { getThanhHinhToSXList } from '../../api/thanhhinhApi';\n"
    
    # Put new_imports right after "import { saveAs } from 'file-saver';"
    content = re.sub(r"(import \{ saveAs \} from 'file-saver';\n)", r"\1" + new_imports, content)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Fixed imports for {os.path.basename(f)}")
