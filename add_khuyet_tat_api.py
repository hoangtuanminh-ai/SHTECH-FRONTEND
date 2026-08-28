import os

filepath = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\api\kcsWebApi.js"
code_to_add = """
// 26. /api/view-drc-loai-khuyet-tat/all
export const getAllLoaiKhuyetTat = async () => {
  try {
    const res = await api.get('/api/view-drc-loai-khuyet-tat/all');
    return res.data;
  } catch (err) {
    console.error('Error in getAllLoaiKhuyetTat:', err);
    throw err;
  }
};
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(code_to_add)

print("Appended getAllLoaiKhuyetTat API successfully.")
