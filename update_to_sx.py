import os
import re
import glob

base_dir = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\pages\BaoCaoKHSX"
jsx_files = glob.glob(os.path.join(base_dir, "*.jsx"))

for file_path in jsx_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has toSX input
    if "value={toSX} onChange={e => setToSX(e.target.value)}" not in content:
        continue

    print(f"Updating {os.path.basename(file_path)}...")

    # 1. Update imports
    if "getListToSx" not in content:
        content = re.sub(r"(from '../../api/kcsWebApi';)", r", getListToSx \1", content)
        # clean up any duplicate commas
        content = content.replace(", ,", ",")
        content = content.replace("{ ,", "{ ")
        # if it was `import { getBaoCao... } from '../../api/kcsWebApi';` we want to safely add it.
        # Let's just use a simpler approach: add it inside the braces
        # wait, the regex might produce `{ getBaoCao..., getListToSx from ...}` which is wrong.
        # Better regex: `} from '../../api/kcsWebApi';` -> `, getListToSx } from '../../api/kcsWebApi';`
        # Let's read content again and do it right
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(r"(\s*)\}\s*from\s*'../../api/kcsWebApi';", r", getListToSx } from '../../api/kcsWebApi';", content)

    # 2. Add states
    if "const [tosxList, setTosxList] = useState([]);" not in content:
        state_pattern = r"(const \[stores, setStores\] = useState\(\[\]\);\n\s*const \[storesLoading, setStoresLoading\] = useState\(true\);)"
        replacement_state = r"\1\n  const [tosxList, setTosxList] = useState([]);\n  const [tosxLoading, setTosxLoading] = useState(true);"
        content = re.sub(state_pattern, replacement_state, content)

    # 3. Update fetchDropdowns
    if "const resTosx = await getListToSx();" not in content:
        fetch_pattern = r"(const fetchDropdowns = async \(\) => {\n\s*try \{)"
        fetch_replacement = r"""const fetchDropdowns = async () => {
      try {
        setTosxLoading(true);
        const resTosx = await getListToSx();
        setTosxList([{ value: '', label: '— Tất cả tổ SX' }, ...resTosx.map(item => ({
          value: item.to_noiLamViec || item.To_noiLamViec, label: `${item.to_noiLamViec || item.To_noiLamViec} — ${item.nhom_Noilamviec || item.Nhom_Noilamviec || ''}`
        }))]);
      } catch (e) {
        console.error('Error loading tosx:', e);
        setTosxList([{ value: '', label: '— Tất cả tổ SX' }]);
      } finally {
        setTosxLoading(false);
      }

      try {"""
        content = re.sub(fetch_pattern, fetch_replacement, content)

    # 4. Replace UI
    ui_pattern = r"<div className=\"mes-fb-group\">\n\s*<span className=\"mes-fb-label\">Tổ SX:</span>\n\s*<input\n\s*type=\"text\" className=\"mes-input\" style=\{\{ width: 80 \}\}\n\s*value=\{toSX\} onChange=\{e => setToSX\(e\.target\.value\)\}\n\s*/>\n\s*</div>"
    
    ui_replacement = r"""<div className="mes-fb-group">
          <span className="mes-fb-label">Tổ SX:</span>
          <div style={{ minWidth: 150 }}>
            <Select
              placeholder={tosxLoading ? 'Đang tải...' : 'Tất cả tổ SX'}
              options={tosxList}
              value={tosxList.find(o => o.value === toSX) || null}
              onChange={opt => setToSX(opt?.value || '')}
              isClearable isLoading={tosxLoading} isDisabled={tosxLoading}
              menuPortalTarget={document.body} styles={mesSelectStyles}
            />
          </div>
        </div>"""
    
    content = re.sub(ui_pattern, ui_replacement, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Finished updating all files for Tổ SX dropdown.")
