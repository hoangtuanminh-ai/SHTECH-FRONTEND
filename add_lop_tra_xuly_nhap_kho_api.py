import os

filepath = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\api\kcsWebApi.js"
code_to_add = """
// 22. /api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho
export const getBaoCaoLopTraXuLyNhapKho = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoLopTraXuLyNhapKho:', err);
    throw err;
  }
};

// 23. /api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho-com
export const getBaoCaoLopTraXuLyNhapKhoCom = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho-com', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoLopTraXuLyNhapKhoCom:', err);
    throw err;
  }
};
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(code_to_add)

print("Appended APIs successfully.")
