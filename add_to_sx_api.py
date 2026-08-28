import os

filepath = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\api\kcsWebApi.js"
code_to_add = """
// 27. /danh-sach-to-sx
export const getListToSx = async () => {
  try {
    const res = await api.get('/danh-sach-to-sx');
    return res.data;
  } catch (err) {
    console.error('Error in getListToSx:', err);
    throw err;
  }
};
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(code_to_add)

print("Appended getListToSx API successfully.")
