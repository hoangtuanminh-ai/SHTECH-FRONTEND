import api from "./axios";

export const getViewOrcThanhHinhNhap = async ({
  storeId = '',
  fromDate = '',
  toDate = '',
  maMay = '',
  maQuyCachLop = '',
  barcodeTh = '',
  barcode = '',
  page = 0,
  size = 20,
  sortBy = 'namThangNgayCaNhapKho',
  sortDir = 'desc',
} = {}) => {
  try {
    const params = {
      storeId,
      fromDate,
      toDate,
      maMay,
      maQuyCachLop,
      barcodeTh,
      barcode,
      page,
      size,
      sortBy,
      sortDir,
    };
    const res = await api.get('/api/view-orc-thanh-hinh/filter', { params });
    console.log('>>> ViewOrcThanhHinhNhap page returned:', res.data);
    return res.data;
  } catch (err) {
    console.error('Error fetching ViewOrcThanhHinhNhap:', err);
    throw err;
  }
};
