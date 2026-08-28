import api from "./axios";

// 🚀 Dán token Postman trực tiếp ở đây


// Lấy danh sách user (có phân trang + sort)
export const getAllUsers = async (page = 0, size = 20, sort = null) => {
  const params = { page, size };
  if (sort) params.sort = sort;
  const res = await api.get("/user/", { params });
  return res.data;
};

// Lấy user theo id
export const getUserById = async (id) => {
  const res = await api.get(`/user/${id}`);
  return res.data;
};

// Tìm user theo fullName (có phân trang + sort)
export const getUserByFullName = async (
  fullName,
  page = 0,
  size = 20,
  sort = null
) => {
  const params = { fullName, page, size };
  if (sort) params.sort = sort;
  const res = await api.get("/user/by-full-name", { params });
  return res.data;
};

// Cập nhật user theo id
export const updateUser = async (id, updateData) => {
  const res = await api.put(`/user/${id}`, updateData);
  return res.data;
};
export const createUser = async (userData) => {
  const res = await api.post(`/user/`, userData);
  return res.data;
};
// Xóa user theo id
export const deleteUser = async (id) => {
  const res = await api.delete(`/user/${id}`);
  return res.data;
};
