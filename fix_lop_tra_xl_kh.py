import os
import re

file_path = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX\BaoCaoLopTraXuLyNhapKhoKeHoachThang.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove tuCa, denCa states
content = re.sub(r"const \[tuCa, setTuCa\] = useState\('0'\);\n\s*", "", content)
content = re.sub(r"const \[denCa, setDenCa\] = useState\('0'\);\n\s*", "", content)

# 2. Remove maMay state
content = re.sub(r"const \[maMay, setMaMay\] = useState\(''\);\n\s*", "", content)

# 3. Update handleSearch
handle_search_start = r"const handleSearch = async \(\) => {\n\s*const namThangNgayCaStart = tuNgay \? tuNgay\.replace\(/-/g, ''\) \+ tuCa : '';\n\s*const namThangNgayCaEnd = denNgay \? denNgay\.replace\(/-/g, ''\) \+ denCa : '';"
handle_search_replacement = r"""const handleSearch = async () => {
    const namThangNgayCaStart = tuNgay ? tuNgay.replace(/-/g, '') : '';
    const namThangNgayCaEnd = denNgay ? denNgay.replace(/-/g, '') : '';"""
content = re.sub(handle_search_start, handle_search_replacement, content)

# 4. Remove maMay from payload and switch condition
payload_pattern = r"maMay: maMay \|\| undefined,\n\s*loaiCaNhap: loaiCaNhap \|\| undefined\n\s*};\n\n\s*let res;\n\s*if \(maMay\) {"
payload_replacement = r"""loaiCaNhap: loaiCaNhap || undefined
      };

      let res;
      if (loaiCaNhap) {"""
content = re.sub(payload_pattern, payload_replacement, content)

# 5. ClearAll
clear_all_pattern = r"setTuNgay\(''\); setTuCa\('0'\);\n\s*setDenNgay\(''\); setDenCa\('0'\);\n\s*setTuKHThang\(''\); setDenKHThang\(''\);\n\s*setLoaiCaNhap\(''\);\n\s*setToSX\(''\);\n\s*setStoreID\(''\);\n\s*setMaMay\(''\);"
clear_all_replacement = r"""setTuNgay('');
    setDenNgay('');
    setTuKHThang(''); setDenKHThang('');
    setLoaiCaNhap('');
    setToSX('');
    setStoreID('');"""
content = re.sub(clear_all_pattern, clear_all_replacement, content)

# 6. UI: Remove tuCa, denCa select elements
tuca_pattern = r"<span className=\"mes-fb-label\" style=\{\{ marginLeft: 6 \}\}>Ca:</span>\n\s*<select className=\"mes-select\"[\s\S]*?</select>"
content = re.sub(tuca_pattern, "", content)

# 7. UI: Remove maMay and change loaiCaNhap UI
ui_pattern = r"<div className=\"mes-fb-group\">\n\s*<span className=\"mes-fb-label\">Mã Máy:</span>\n\s*<div style=\{\{ minWidth: 150 \}\}>\n\s*<Select\n\s*placeholder=\{machinesLoading \? 'Đang tải\.\.\.' : 'Tất cả máy'\}\n\s*options=\{machines\}\n\s*value=\{machines\.find\(o => o\.value === maMay\) \|\| null\}\n\s*onChange=\{opt => setMaMay\(opt\?\.value \|\| ''\)\}\n\s*isClearable isLoading=\{machinesLoading\} isDisabled=\{machinesLoading\}\n\s*menuPortalTarget=\{document\.body\} styles=\{mesSelectStyles\}\n\s*/>\n\s*</div>\n\s*</div>\n\n\s*<div className=\"mes-fb-group\">\n\s*<span className=\"mes-fb-label\">Loại Ca Nhập:</span>\n\s*<input\n\s*type=\"text\" className=\"mes-input\" style=\{\{ width: 80 \}\}\n\s*value=\{loaiCaNhap\} onChange=\{e => setLoaiCaNhap\(e\.target\.value\)\}\n\s*/>\n\s*</div>"

ui_replacement = r"""<div className="mes-fb-group">
          <span className="mes-fb-label">Loại Ca Nhập:</span>
          <div style={{ minWidth: 150 }}>
            <Select
              placeholder={machinesLoading ? 'Đang tải...' : 'Tất cả loại ca nhập'}
              options={machines}
              value={machines.find(o => o.value === loaiCaNhap) || null}
              onChange={opt => setLoaiCaNhap(opt?.value || '')}
              isClearable isLoading={machinesLoading} isDisabled={machinesLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>"""
content = re.sub(ui_pattern, ui_replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BaoCaoLopTraXuLyNhapKhoKeHoachThang.jsx successfully.")
