import os
import re

files_to_update = [
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\LopThanhPhamLoiMaVach.jsx",
    r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\LopXuLyChuaNhapKho.jsx"
]

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add new pagination inside table area if the HTML isn't there
    if '<div className="mes-pagination">' not in content:
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

print("Fixed pagination HTML in both files.")
