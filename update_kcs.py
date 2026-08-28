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
    
    # 1. Add kcsWebApi imports
    if "getViewStoreListOrks" not in content:
        content = re.sub(r"import \{([^}]+)\} from '\.\./\.\./api/kcsWebApi';", r"import {\1, getViewStoreListOrks, getDmMayXRay } from '../../api/kcsWebApi';", content)
    
    # 2. Update thanhhinhApi imports
    content = content.replace("getStoreListOrth, getThanhHinhToSXList, getThanhHinhMaMayList", "getThanhHinhToSXList")
    content = content.replace("getStoreListOrth, getThanhHinhToSXList", "getThanhHinhToSXList")
    content = content.replace("import { getStoreListOrth } from '../../api/thanhhinhApi';", "")
    
    # 3. Replace getViewStoreListOrks usage
    content = content.replace("getStoreListOrth()", "getViewStoreListOrks()")
    
    content = re.sub(r"value:\s*item\.StoreID,\s*label:\s*`\$\{item\.StoreID\}\s*—\s*\$\{item\.StoreName\}`", 
                     r"value: item.storeID || item.StoreID || item.storeId, label: `${item.storeID || item.StoreID || item.storeId} — ${item.storeName || item.StoreName || item.storename || ''}`", content)
    
    content = re.sub(r"value:\s*item\.storeId,\s*label:\s*`\$\{item\.storeId\}\s*—\s*\$\{item\.storeName\s*\|\|\s*''\}`", 
                     r"value: item.storeID || item.StoreID || item.storeId, label: `${item.storeID || item.StoreID || item.storeId} — ${item.storeName || item.StoreName || item.storename || ''}`", content)

    # 4. Replace getDmMayXRay usage
    content = content.replace("getThanhHinhMaMayList()", "getDmMayXRay()")
    
    content = re.sub(r"value:\s*item\.Mamay,\s*label:\s*`\$\{item\.EquipmentID\}\s*—\s*\$\{item\.EquipmentName\}`", 
                     r"value: item.maMay || item.MaMay || item.Mamay || item.EquipmentID || item.equipmentID, label: `${item.maMay || item.MaMay || item.Mamay || item.EquipmentID || item.equipmentID} — ${item.tenMay || item.TenMay || item.EquipmentName || item.equipmentName || ''}`", content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Updated {os.path.basename(f)}")
