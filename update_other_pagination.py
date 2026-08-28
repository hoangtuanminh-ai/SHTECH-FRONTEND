import os
import re

files_to_update = [
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\LopThanhPhamLoiMaVach.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\LopXuLyChuaNhapKho.jsx"
]

pagination_css = r"""
  .mes-pagination {
    display: flex; align-items: center; justify-content: center; gap: 15px;
    padding: 8px; background: #f0f6fc; border-bottom: 1px solid #b8cce0;
    font-size: 12px; color: #1a3a5c; flex-shrink: 0;
  }
  .mes-page-btn {
    padding: 4px 10px; background: #fff; border: 1px solid #96afc8;
    border-radius: 3px; cursor: pointer; color: #1565C0; font-weight: 600;
    transition: all 0.1s;
  }
  .mes-page-btn:hover:not(:disabled) { background: #eef5fc; border-color: #1565C0; }
  .mes-page-btn:disabled { opacity: 0.5; cursor: not-allowed; color: #5a7a9a; border-color: #b8cce0; }
  .mes-page-info { font-weight: 600; }
"""

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS
    if ".mes-pagination" not in content:
        content = content.replace(".mes-statusbar {", pagination_css + "\n  .mes-statusbar {")

    # 2. Add totalElements state
    if "const [totalElements, setTotalElements] = useState(0);" not in content:
        state_pattern = r"(const \[totalPages, setTotalPages\] = useState\(0\);)"
        content = re.sub(state_pattern, r"\1\n  const [totalElements, setTotalElements] = useState(0);", content)

    # 3. Update fetchData
    if "setTotalElements(res.totalElements || 0);" not in content:
        fetch_pattern = r"(setTotalPages\(res\.totalPages \|\| 0\);\n\s*setPage\(res\.number \|\| 0\);)"
        content = re.sub(fetch_pattern, r"\1\n        setTotalElements(res.totalElements || 0);", content)

    # 4. Update clearAll
    if "setTotalElements(0);" not in content:
        clear_pattern = r"(setTotalPages\(0\);)"
        content = re.sub(clear_pattern, r"\1\n    setTotalElements(0);", content)

    # 5. Remove old pagination toolbar
    old_pagination = r"<div className=\"mes-toolbar\" style=\{\{ marginTop: 6, justifyContent: 'flex-start' \}\}>\s*<button\s*className=\"mes-btn\"\s*disabled=\{page <= 0 \|\| loading\}\s*onClick=\{\(\) => fetchData\(page - 1\)\}\s*>\s*Trang trước\s*</button>\s*<span style=\{\{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', margin: '0 10px' \}\}>\s*Trang \{page \+ 1\} / \{totalPages === 0 \? 1 : totalPages\}\s*</span>\s*<button\s*className=\"mes-btn\"\s*disabled=\{page >= totalPages - 1 \|\| loading\}\s*onClick=\{\(\) => fetchData\(page \+ 1\)\}\s*>\s*Trang sau\s*</button>\s*</div>"
    content = re.sub(old_pagination, "", content)

    # 6. Add new pagination inside table area
    if ".mes-page-btn" not in content:
        header_pattern = r"(<div className=\"mes-table-header\">\n\s*<span>Hiển thị <strong style=\{\{ color: '#1565C0' \}\}>\{data\.length\}</strong> bản ghi</span>\n\s*<span>Cập nhật: \{timeStr\}</span>\n\s*</div>)"
        new_pagination = r"""<div className="mes-table-header" style={{ borderBottom: 'none' }}>
              <span>Hiển thị <strong style={{ color: '#1565C0' }}>{data.length}</strong> / Tổng <strong style={{ color: '#1565C0' }}>{totalElements}</strong> bản ghi</span>
              <span>Cập nhật: {timeStr}</span>
            </div>
            {totalPages > 1 && (
              <div className="mes-pagination">
                <button className="mes-page-btn" disabled={page === 0 || loading} onClick={() => fetchData(0)}>Đầu</button>
                <button className="mes-page-btn" disabled={page === 0 || loading} onClick={() => fetchData(page - 1)}>Trước</button>
                <span className="mes-page-info">Trang {page + 1} / {totalPages}</span>
                <button className="mes-page-btn" disabled={page >= totalPages - 1 || loading} onClick={() => fetchData(page + 1)}>Sau</button>
                <button className="mes-page-btn" disabled={page >= totalPages - 1 || loading} onClick={() => fetchData(totalPages - 1)}>Cuối</button>
              </div>
            )}"""
        content = re.sub(header_pattern, new_pagination, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated pagination in LopThanhPhamLoiMaVach and LopXuLyChuaNhapKho.")
