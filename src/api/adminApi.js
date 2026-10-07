import api from "./axios";

const encode = (value) => encodeURIComponent(String(value));

export const listAdminResource = async (resource, keyword = "") => {
  const response = await api.get(`/api/admin/${resource}`, {
    params: keyword ? { keyword } : {},
  });
  return response.data;
};

export const createAdminResource = async (resource, payload) => {
  const response = await api.post(`/api/admin/${resource}`, payload);
  return response.data;
};

export const updateAdminResource = async (resource, key, payload) => {
  const response = await api.put(`/api/admin/${resource}/${encode(key)}`, payload);
  return response.data;
};

export const deleteAdminResource = async (resource, key) => {
  await api.delete(`/api/admin/${resource}/${encode(key)}`);
};

export const getPermissionForms = async (keyword = "", projectId = "") => {
  const response = await api.get("/api/admin/permission-forms", {
    params: {
      ...(keyword ? { keyword } : {}),
      ...(projectId ? { projectId } : {}),
    },
  });
  return response.data;
};

export const getUserPermissions = async (userId, keyword = "") => {
  const response = await api.get("/api/admin/user-permissions", {
    params: { userId, ...(keyword ? { keyword } : {}) },
  });
  return response.data;
};

export const saveUserPermissions = async (payloads) => {
  const response = await api.post("/api/admin/user-permissions/bulk", payloads);
  return response.data;
};

export const deleteUserPermission = async (primaryKey) => {
  await api.delete(`/api/admin/user-permissions/${encode(primaryKey)}`);
};

export const getGroupPermissions = async (userGroupId, keyword = "") => {
  const response = await api.get("/api/admin/group-permissions", {
    params: { userGroupId, ...(keyword ? { keyword } : {}) },
  });
  return response.data;
};

export const saveGroupPermissions = async (payloads) => {
  const response = await api.post("/api/admin/group-permissions/bulk", payloads);
  return response.data;
};

export const deleteGroupPermission = async (primaryKey) => {
  await api.delete(`/api/admin/group-permissions/${encode(primaryKey)}`);
};

export const listEquipmentPermissions = async (userId = "", keyword = "") => {
  const response = await api.get("/api/admin/equipment-permissions", {
    params: {
      ...(userId ? { userId } : {}),
      ...(keyword ? { keyword } : {}),
    },
  });
  return response.data;
};

export const saveEquipmentPermission = async (payload, primaryKey = "") => {
  const response = primaryKey
    ? await api.put(`/api/admin/equipment-permissions/${encode(primaryKey)}`, payload)
    : await api.post("/api/admin/equipment-permissions", payload);
  return response.data;
};

export const deleteEquipmentPermission = async (primaryKey) => {
  await api.delete(`/api/admin/equipment-permissions/${encode(primaryKey)}`);
};

export const listActiveEquipment = async () => {
  const response = await api.get("/api/equipment/names");
  return response.data;
};
