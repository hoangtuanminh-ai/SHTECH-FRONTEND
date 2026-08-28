import os
import re

# --- Update App.jsx ---
app_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\App.jsx"
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

import_pattern = r"(import BaoCaoKeHoachThang from \"\./pages/BaoCaoKHSX/BaoCaoKeHoachThang\.jsx\";)"
app_content = re.sub(import_pattern, r"\1\nimport BaoCaoLopTraXuLyNhapKho from \"./pages/BaoCaoKHSX/BaoCaoLopTraXuLyNhapKho.jsx\";", app_content)

route_pattern = r"(<Route path=\"bao-cao-ke-hoach-thang\" element=\{<ProtectedRoute><BaoCaoKeHoachThang /></ProtectedRoute>\} />)"
app_content = re.sub(route_pattern, r"\1\n            <Route path=\"bao-cao-lop-tra-xu-ly-nhap-kho\" element={<ProtectedRoute><BaoCaoLopTraXuLyNhapKho /></ProtectedRoute>} />", app_content)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)
print("Updated App.jsx")

# --- Update Navbar.jsx ---
nav_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\components\Navbar\Navbar.jsx"
with open(nav_path, 'r', encoding='utf-8') as f:
    nav_content = f.read()

navlink_pattern = r"(<NavLink to=\"/dashboard/bao-cao-ke-hoach-thang\"[^>]*/>)"
nav_content = re.sub(navlink_pattern, r"\1\n            <NavLink to=\"/dashboard/bao-cao-lop-tra-xu-ly-nhap-kho\" label=\"Báo cáo lốp trả xử lý nhập kho\" icon={FaDatabase} isActive={active('/dashboard/bao-cao-lop-tra-xu-ly-nhap-kho')} />", nav_content)

with open(nav_path, 'w', encoding='utf-8') as f:
    f.write(nav_content)
print("Updated Navbar.jsx")
