import api from "./axios";

export const getViewOrcThanhHinhNhap = async (params) => {
  try {
    const res = await api.get('/api/view-orc-thanh-hinh/filter', { params });
    // Assuming the API returns the list directly, or inside a data wrapper
    // We log it so the user can inspect it
    console.log(">>> data returned:", res.data);
    return res.data;
  } catch (err) {
    console.error('Error fetching ViewOrcThanhHinhNhap:', err);
    throw err;
  }
};
