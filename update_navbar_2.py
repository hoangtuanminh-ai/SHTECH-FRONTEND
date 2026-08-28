import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\components\Navbar\Navbar.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add link under bao-cao-ke-hoach-thang-ca
path_pattern = r"(<NavLink to=\"/dashboard/bao-cao-ke-hoach-thang-ca\"[^>]*/>)"
replacement_path = r"\1\n            <NavLink to=\"/dashboard/bao-cao-ke-hoach-thang-khong-theo-may\" label=\"Báo cáo KH tháng không theo máy\" icon={FaDatabase} isActive={active('/dashboard/bao-cao-ke-hoach-thang-khong-theo-may')} />"

content = re.sub(path_pattern, replacement_path, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Navbar.jsx successfully.")
