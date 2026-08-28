import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\App.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_pattern = r"(import BaoCaoKeHoachThang from \"\./pages/BaoCaoKHSX/BaoCaoKeHoachThang\.jsx\";)"
replacement_import = r"\1\nimport BaoCaoKeHoachThangKhongTheoMay from \"./pages/BaoCaoKHSX/BaoCaoKeHoachThangKhongTheoMay.jsx\";"
content = re.sub(import_pattern, replacement_import, content)

# Add route
route_pattern = r"(<Route path=\"bao-cao-ke-hoach-thang\" element=\{<ProtectedRoute><BaoCaoKeHoachThang /></ProtectedRoute>\} />)"
replacement_route = r"\1\n            <Route path=\"bao-cao-ke-hoach-thang-khong-theo-may\" element={<ProtectedRoute><BaoCaoKeHoachThangKhongTheoMay /></ProtectedRoute>} />"
content = re.sub(route_pattern, replacement_route, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.jsx successfully.")
