import api from "./axios";

// 1. /api/kcs-web/thong-ke-lop-kscl
export const getThongKeLopKscl = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKscl:', err);
    throw err;
  }
};

// 2. /api/kcs-web/thong-ke-lop-kscl-ke-hoach-thang
export const getThongKeLopKsclKeHoachThang = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl-ke-hoach-thang', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKsclKeHoachThang:', err);
    throw err;
  }
};

// 3. /api/kcs-web/thong-ke-lop-kscl-com
export const getThongKeLopKsclCom = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl-com', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKsclCom:', err);
    throw err;
  }
};

// 4. /api/kcs-web/thong-ke-lop-kscl-phan-loai-chat-luong
export const getThongKeLopKsclPhanLoaiChatLuong = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl-phan-loai-chat-luong', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKsclPhanLoaiChatLuong:', err);
    throw err;
  }
};

// 5. /api/kcs-web/thong-ke-lop-kscl-phan-loai-chat-luong-ke-hoach-thang
export const getThongKeLopKsclPhanLoaiChatLuongKeHoachThang = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl-phan-loai-chat-luong-ke-hoach-thang', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKsclPhanLoaiChatLuongKeHoachThang:', err);
    throw err;
  }
};

// 6. /api/kcs-web/thong-ke-lop-kscl-theo-ngay-khong-tinh-lop-tra-xu-ly-com
export const getThongKeLopKsclTheoNgayKhongTinhLopTraXulyCom = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl-theo-ngay-khong-tinh-lop-tra-xu-ly-com', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKsclTheoNgayKhongTinhLopTraXulyCom:', err);
    throw err;
  }
};

// 7. /api/kcs-web/thong-ke-lop-kscl-theo-ngay-khong-tinh-lop-tra-xu-ly
export const getThongKeLopKsclTheoNgayKhongTinhLopTraXuly = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl-theo-ngay-khong-tinh-lop-tra-xu-ly', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKsclTheoNgayKhongTinhLopTraXuly:', err);
    throw err;
  }
};

// 8. /api/kcs-web/thong-ke-lop-kscl-theo-ngay-com
export const getThongKeLopKsclTheoNgayCom = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/thong-ke-lop-kscl-theo-ngay-com', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getThongKeLopKsclTheoNgayCom:', err);
    throw err;
  }
};

// 9. /api/kcs-web/nhap-kho-chi-tiet-lop
export const getNhapkhoctLopThanhPhamVaXuLy = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/nhap-kho-chi-tiet-lop', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getNhapkhoctLopThanhPhamVaXuLy:', err);
    throw err;
  }
};

// 10. /api/kcs-web/nhap-kho-chi-tiet-lop-temporary
export const getLopThanhPhamTemporaryList = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/nhap-kho-chi-tiet-lop-temporary', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getLopThanhPhamTemporaryList:', err);
    throw err;
  }
};

// 11. /api/kcs-web/nhap-kho-chi-tiet-lop-loi-ma-vach
export const getLopThanhPhamLoiMaVachList = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/nhap-kho-chi-tiet-lop-loi-ma-vach', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getLopThanhPhamLoiMaVachList:', err);
    throw err;
  }
};

// 12. /api/kcs-web/nhap-kho-chi-tiet-lop-xu-ly-chua-nhap-kho
export const getLopXuLyChuaNhapKhoList = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/nhap-kho-chi-tiet-lop-xu-ly-chua-nhap-kho', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getLopXuLyChuaNhapKhoList:', err);
    throw err;
  }
};

// 13. /api/kcs-web/bao-cao-tong-hop-chi-tiet
export const getBaoCaoTongHopChiTiet = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-tong-hop-chi-tiet', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoTongHopChiTiet:', err);
    throw err;
  }
};

// 14. /api/kcs-web/bao-cao-ke-hoach-thang
export const getBaoCaoKeHoachThang = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-ke-hoach-thang', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoKeHoachThang:', err);
    throw err;
  }
};

// 15. /api/kcs-web/bao-cao-ke-hoach-thang-com
export const getBaoCaoKeHoachThangCom = async (params) => {
  try {
    const res = await api.get('/api/kcs-web/bao-cao-ke-hoach-thang-com', { params });
    return res.data;
  } catch (err) {
    console.error('Error in getBaoCaoKeHoachThangCom:', err);
    throw err;
  }
};

// 16. /api/kcs-web/dm-may-xray
export const getDmMayXRay = async () => {
  try {
    const res = await api.get('/api/kcs-web/dm-may-xray');
    return res.data;
  } catch (err) {
    console.error('Error in getDmMayXRay:', err);
    throw err;
  }
};

// 17. /api/kcs-web/view-store-list-orks
export const getViewStoreListOrks = async () => {
  try {
    const res = await api.get('/api/kcs-web/view-store-list-orks');
    return res.data;
  } catch (err) {
    console.error('Error in getViewStoreListOrks:', err);
    throw err;
  }
};

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

// 27. /danh-sach-to-sx
export const getListToSx = async () => {
  try {
    const res = await api.get('/api/kcs-web/danh-sach-to-sx');
    return res.data;
  } catch (err) {
    console.error('Error in getListToSx:', err);
    throw err;
  }
};
