import os
import re

files = [
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeLopKscl.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKePhanLoaiChatLuong.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeKhongTinhLopTraXuLy.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\ThongKeTheoNgayCom.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoTongHopChiTiet.jsx"
]

for f in files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # Remove the states if they still exist
    content = re.sub(r"\s*const\s*\[toSXs,\s*setToSXs\]\s*=\s*useState\(\[\]\);\s*\n\s*const\s*\[toSXsLoading,\s*setToSXsLoading\]\s*=\s*useState\(true\);\s*\n", "\n", content)
    content = re.sub(r"const\s*\[toSXs,\s*setToSXs\]\s*=\s*useState\(\[\]\);\s*", "", content)
    content = re.sub(r"const\s*\[toSXsLoading,\s*setToSXsLoading\]\s*=\s*useState\(true\);\s*", "", content)

    # Replace the JSX block completely
    # We will look for <div style={{ minWidth: 140 }}> up to </div> and replace it with input
    jsx_pattern = r"<div\s*style=\{\{\s*minWidth:\s*140\s*\}\}>\s*<Select[\s\S]*?/>\s*</div>"
    input_text = r'<input type="text" className="mes-input" style={{ width: 80 }} value={toSX} onChange={e => setToSX(e.target.value)} />'
    
    content = re.sub(jsx_pattern, input_text, content)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Cleaned JSX for {os.path.basename(f)}")
