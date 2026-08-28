$files = @(
    "D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeLopKscl.jsx",
    "D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKePhanLoaiChatLuong.jsx",
    "D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeKhongTinhLopTraXuLy.jsx",
    "D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeTheoNgayCom.jsx",
    "D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoKeHoachThang.jsx",
    "D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoTongHopChiTiet.jsx",
    "D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\NhapKhoChiTietLop.jsx"
)

foreach ($f in $files) {
    if (-not (Test-Path $f)) { continue }
    $content = Get-Content -Raw -Encoding UTF8 $f
    
    # 1. Add kcsWebApi imports
    if ($content -notmatch "getViewStoreListOrks") {
        $content = $content -replace "import \{([^}]+)\} from '\.\./\.\./api/kcsWebApi';", "import {`$1, getViewStoreListOrks, getDmMayXRay } from '../../api/kcsWebApi';"
    }
    
    # 2. Update thanhhinhApi imports
    $content = $content -replace "getStoreListOrth, getThanhHinhToSXList, getThanhHinhMaMayList", "getThanhHinhToSXList"
    $content = $content -replace "getStoreListOrth, getThanhHinhToSXList", "getThanhHinhToSXList"
    $content = $content -replace "import \{ getStoreListOrth \} from '\.\./\.\./api/thanhhinhApi';", ""
    
    # 3. Replace getViewStoreListOrks usage
    $content = $content -replace "getStoreListOrth\(\)", "getViewStoreListOrks()"
    $content = $content -replace "item\.StoreID, label: ``\$\{item\.StoreID\} — \$\{item\.StoreName\}``", "item.storeID || item.StoreID || item.storeId, label: ``${item.storeID || item.StoreID || item.storeId} — ${item.storeName || item.StoreName || item.storename || ''}``"
    
    # 4. Replace getDmMayXRay usage
    $content = $content -replace "getThanhHinhMaMayList\(\)", "getDmMayXRay()"
    $content = $content -replace "item\.Mamay, label: ``\$\{item\.EquipmentID\} — \$\{item\.EquipmentName\}``", "item.maMay || item.MaMay || item.mamay || item.EquipmentID || item.equipmentID, label: ``${item.maMay || item.MaMay || item.mamay || item.EquipmentID || item.equipmentID} — ${item.tenMay || item.TenMay || item.EquipmentName || item.equipmentName || ''}``"
    
    # 5. Sometimes `value` in stores might be `item.storeId` if it was from different source, ensure we cover it
    $content = $content -replace "item\.storeId, label: ``\$\{item\.storeId\} — \$\{item\.storeName \|\| ''\}``", "item.storeID || item.StoreID || item.storeId, label: ``${item.storeID || item.StoreID || item.storeId} — ${item.storeName || item.StoreName || item.storename || ''}``"

    [System.IO.File]::WriteAllText($f, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated $f"
}
