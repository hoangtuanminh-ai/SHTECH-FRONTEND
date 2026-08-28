import os

filepath = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\api\kcsWebApi.js"
code_to_add = """
// 24. /api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho-ke-hoach-thang
export const getBaoCaoLopTraXuLyNhapKhoKeHoachThang = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho-ke-hoach-thang', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoLopTraXuLyNhapKhoKeHoachThang:', err);
    throw err;
  }
};

// 25. /api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho-ke-hoach-thang-com
export const getBaoCaoLopTraXuLyNhapKhoKeHoachThangCom = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-lop-tra-xu-ly-nhap-kho-ke-hoach-thang-com', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoLopTraXuLyNhapKhoKeHoachThangCom:', err);
    throw err;
  }
};
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(code_to_add)

print("Appended APIs successfully.")
