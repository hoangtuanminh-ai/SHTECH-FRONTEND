import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\components\Navbar\Navbar.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update .mes-aside for resize
aside_pattern = r"(\.mes-aside \{\n\s*position: fixed; top: 0; left: 0;\n\s*height: 100%; width: 256px;)"
aside_replacement = r"\1\n    min-width: 200px; max-width: 500px;\n    resize: horizontal;\n    overflow-x: hidden;"
content = re.sub(aside_pattern, aside_replacement, content)

# 2. Update .mes-link for wrapping text instead of ellipsis
link_pattern = r"white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
link_replacement = r"white-space: normal; line-height: 1.3;"
content = content.replace(link_pattern, link_replacement)

# To ensure the content in main view adjusts if Navbar width changes, standard flex/grid layouts on App.jsx usually handle aside width variations well, 
# but if the main view has a left margin hardcoded to 256px, it might not adapt dynamically without a resize observer. 
# Let's check App.jsx or just stick to the request. The user asked "hoặc có thể kéo rộng hoặc thu hẹp nav", resize handles this on the nav itself.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Navbar.jsx for resize and text wrapping.")
