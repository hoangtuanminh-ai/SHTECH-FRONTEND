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

    # 1. Remove import
    if "getThanhHinhToSXList" in content:
        content = re.sub(r"import\s*\{\s*getThanhHinhToSXList\s*\}\s*from\s*['\"]../../api/thanhhinhApi['\"];\n?", "", content)
        changed = True

    # 2. Remove states
    if "const [toSXs" in content:
        content = re.sub(r"\s*const\s*\[toSXs,\s*setToSXs\]\s*=\s*useState\(\[\]\);\s*\n\s*const\s*\[toSXsLoading,\s*setToSXsLoading\]\s*=\s*useState\(true\);\s*\n", "\n", content)
        changed = True

    # 3. Remove fetch dropdown logic
    fetch_pattern = r"\s*try\s*\{\s*setToSXsLoading\(true\);\s*const\s*resTo\s*=\s*await\s*getThanhHinhToSXList\(\);\s*setToSXs\(\[\{\s*value:\s*'([^']*)',\s*label:\s*'([^']*)'\s*\},[^]]+\]\);\s*\}\s*catch\s*\([^)]+\)\s*\{\s*setToSXs\(\[\{\s*value:\s*'([^']*)',\s*label:\s*'([^']*)'\s*\}\]\);\s*\}\s*finally\s*\{\s*setToSXsLoading\(false\);\s*\}"
    content = re.sub(fetch_pattern, "", content)

    # Alternate fetch logic just in case
    fetch_pattern_2 = r"\s*try\s*\{\s*setToSXsLoading\(true\);\s*const\s*resTo\s*=\s*await\s*getThanhHinhToSXList\(\);\s*setToSXs\(\[\{\s*value:\s*'',\s*label:\s*'— Tất cả tổ'\s*\}, \.\.\.resTo\.map\(item => \(\{\s*value:\s*item\.ToSX,\s*label:\s*item\.ToSX\s*\}\)\)\]\);\s*\}\s*catch\s*\(e\)\s*\{\s*setToSXs\(\[\{\s*value:\s*'',\s*label:\s*'— Tất cả tổ'\s*\}\]\);\s*\}\s*finally\s*\{\s*setToSXsLoading\(false\);\s*\}"
    content = re.sub(fetch_pattern_2, "", content)
    
    # Another variant
    fetch_pattern_3 = r"\s*try\s*\{\s*setToSXsLoading\(true\);\s*[^\}]*getThanhHinhToSXList\(\)[^\}]*\}\s*catch\s*\([^)]+\)\s*\{[^\}]*\}\s*finally\s*\{[^\}]*\}\s*"
    content = re.sub(fetch_pattern_3, "", content)

    # 4. Replace Select dropdown with input text
    select_pattern = r"<div\s*style=\{\{\s*minWidth:\s*140\s*\}\}>\s*<Select\s*placeholder=\{toSXsLoading[^>]+>\s*</div>"
    input_text = r'<input type="text" className="mes-input" style={{ width: 80 }} value={toSX} onChange={e => setToSX(e.target.value)} />'
    if re.search(select_pattern, content):
        content = re.sub(select_pattern, input_text, content)
        changed = True

    if changed:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Removed toSX logic from {os.path.basename(f)}")
