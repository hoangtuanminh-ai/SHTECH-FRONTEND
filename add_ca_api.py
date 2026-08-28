import os

filepath = r"D:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\src\api\kcsWebApi.js"
code_to_add = """
// 18. /api/kcs-web/bao-cao-ke-hoach-thang-ca
export const getBaoCaoKeHoachThangCa = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-ke-hoach-thang-ca', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoKeHoachThangCa:', err);
    throw err;
  }
};

// 19. /api/kcs-web/bao-cao-ke-hoach-thang-ca-com
export const getBaoCaoKeHoachThangCaCom = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-ke-hoach-thang-ca-com', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoKeHoachThangCaCom:', err);
    throw err;
  }
};
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(code_to_add)

print("Appended APIs successfully.")
