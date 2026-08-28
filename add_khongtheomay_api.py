import os

filepath = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\api\kcsWebApi.js"
code_to_add = """
// 20. /api/kcs-web/bao-cao-ke-hoach-thang-khong-theo-may
export const getBaoCaoKeHoachThangKhongTheoMay = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-ke-hoach-thang-khong-theo-may', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoKeHoachThangKhongTheoMay:', err);
    throw err;
  }
};

// 21. /api/kcs-web/bao-cao-ke-hoach-thang-theo-ngay
export const getBaoCaoKeHoachThangTheoNgay = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-ke-hoach-thang-theo-ngay', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoKeHoachThangTheoNgay:', err);
    throw err;
  }
};
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(code_to_add)

print("Appended APIs successfully.")
