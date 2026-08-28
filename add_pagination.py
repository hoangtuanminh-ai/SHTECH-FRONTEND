import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\NhapKhoChiTietLop.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add CSS for pagination
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
content = content.replace(".mes-statusbar {", pagination_css + "\n  .mes-statusbar {")

# Add pagination states
state_pattern = r"(const \[data, setData\] = useState\(\[\]\);\n  const \[loading, setLoading\] = useState\(false\);)"
replacement_state = r"\1\n  const [page, setPage] = useState(0);\n  const [totalPages, setTotalPages] = useState(0);\n  const [totalElements, setTotalElements] = useState(0);"
content = re.sub(state_pattern, replacement_state, content)

# Modify handleSearch -> fetchPage
search_pattern = r"(const handleSearch = async \(\) => {)([\s\S]*?)(const exportToExcel = async)"
replacement_search = r"""const fetchPage = async (pageIndex = 0) => {
    const namThangNgayCaStart = tuNgay ? tuNgay.replace(/-/g, '') + tuCa : '';
    const namThangNgayCaEnd = denNgay ? denNgay.replace(/-/g, '') + denCa : '';

    if (!namThangNgayCaStart || !namThangNgayCaEnd) {
      toast.warn('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        namThangNgayCaStart: Number(namThangNgayCaStart),
        namThangNgayCaEnd: Number(namThangNgayCaEnd),
        storeID: storeID || undefined,
        page: pageIndex
      };

      const res = await getNhapkhoctLopThanhPhamVaXuLy(payload);

      if (res && Array.isArray(res.content)) {
        setData(res.content);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
        setPage(pageIndex);
        if (pageIndex === 0) toast.success(`Tìm thấy ${res.totalElements || res.content.length} bản ghi`);
      } else if (Array.isArray(res)) {
        // Fallback in case backend hasn't updated yet
        setData(res);
        setTotalPages(1);
        setTotalElements(res.length);
        setPage(0);
        if (pageIndex === 0) toast.success(`Tìm thấy ${res.length} bản ghi`);
      } else {
        setData([]);
        setTotalPages(0);
        setTotalElements(0);
        toast.error('Dữ liệu không hợp lệ');
      }
    } catch (err) {
      setData([]);
      setTotalPages(0);
      setTotalElements(0);
      toast.error('Lỗi khi lấy dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchPage(0);

  \3"""
content = re.sub(search_pattern, replacement_search, content)

# Clear states on clearAll
clear_pattern = r"(const clearAll = \(\) => {\n    setData\(\[\]\);)"
replacement_clear = r"\1\n    setPage(0); setTotalPages(0); setTotalElements(0);"
content = re.sub(clear_pattern, replacement_clear, content)

# Modify Table Header to include pagination controls
header_pattern = r"(<div className=\"mes-table-header\">\n\s*<span>Hiển thị <strong style={{ color: '#1565C0' }}>\{data\.length\}</strong> bản ghi</span>\n\s*<span>Cập nhật: \{timeStr\}</span>\n\s*</div>)"

pagination_ui = r"""<div className="mes-table-header" style={{ borderBottom: 'none' }}>
              <span>Hiển thị <strong style={{ color: '#1565C0' }}>{data.length}</strong> / Tổng <strong style={{ color: '#1565C0' }}>{totalElements}</strong> bản ghi</span>
              <span>Cập nhật: {timeStr}</span>
            </div>
            {totalPages > 1 && (
              <div className="mes-pagination">
                <button className="mes-page-btn" disabled={page === 0 || loading} onClick={() => fetchPage(0)}>Đầu</button>
                <button className="mes-page-btn" disabled={page === 0 || loading} onClick={() => fetchPage(page - 1)}>Trước</button>
                <span className="mes-page-info">Trang {page + 1} / {totalPages}</span>
                <button className="mes-page-btn" disabled={page >= totalPages - 1 || loading} onClick={() => fetchPage(page + 1)}>Sau</button>
                <button className="mes-page-btn" disabled={page >= totalPages - 1 || loading} onClick={() => fetchPage(totalPages - 1)}>Cuối</button>
              </div>
            )}"""
content = re.sub(header_pattern, pagination_ui, content)

# Modify Status bar
status_pattern = r"(`\$\{data\.length\} bản ghi · \$\{dateStr\}`)"
status_replacement = r"`Tổng ${totalElements} bản ghi · ${dateStr}`"
content = re.sub(status_pattern, status_replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated NhapKhoChiTietLop.jsx with pagination.")
