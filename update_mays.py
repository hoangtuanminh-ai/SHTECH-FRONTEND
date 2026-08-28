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
    
    changed = False

    # Check if there is getDropdownEquipment
    if "getDropdownEquipment" in content:
        # Remove import from kiemkeApi
        content = re.sub(r"import\s*\{\s*getDropdownEquipment\s*\}\s*from\s*['\"]../../api/kiemkeApi['\"];\s*", "", content)
        
        # Make sure getDmMayXRay is imported
        if "getDmMayXRay" not in content:
            content = re.sub(r"import \{([^}]+)\} from '\.\./\.\./api/kcsWebApi';", r"import {\1, getDmMayXRay } from '../../api/kcsWebApi';", content)
        
        # Replace the function call
        content = content.replace("getDropdownEquipment()", "getDmMayXRay()")
        
        # Replace the value/label assignment logic for maMay
        content = re.sub(r"value:\s*item\.Mamay\s*\|\|\s*item\.EquipmentID,\s*label:\s*`\$\{item\.Mamay\s*\|\|\s*''\}\s*—\s*\$\{item\.EquipmentName\s*\|\|\s*item\.EquipmentID\s*\|\|\s*''\}`", 
                         r"value: item.maMay || item.MaMay || item.Mamay || item.EquipmentID || item.equipmentID || item.equipmentId, label: `${item.maMay || item.MaMay || item.Mamay || item.EquipmentID || item.equipmentID || item.equipmentId} — ${item.tenMay || item.TenMay || item.EquipmentName || item.equipmentName || ''}`", content)
        changed = True

    if changed:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {os.path.basename(f)}")
