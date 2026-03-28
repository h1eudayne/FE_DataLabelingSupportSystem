import axios from "../../axios.customize";

export const getUsers = (page = 1, pageSize = 10) => {
  return axios.get(`/api/users`, {
    params: { page, pageSize },
  });
};

export const getAdmins = () => {
  return axios.get(`/api/users/management-board`);
};

export const createUser = (data) => {
  return axios.post("/api/users", data);
};

export const changePassword = (oldPassword, newPassword) => {
  return axios.put("/api/users/me/password", { oldPassword, newPassword });
};

export const updateUser = (id, data) => {
  return axios.put(`/api/users/${id}`, data);
};

export const getUserProfile = () => {
  return axios.get("/api/users/me");
};

export const updateUserProfile = (fullName, avatarUrl) => {
  return axios.put(`/api/users/me`, {
    fullName: fullName,
    avatarUrl: avatarUrl,
  });
};

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("/api/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateStatus = (id, isActive) => {
  return axios.patch(`/api/users/${id}/status?isActive=${isActive}`);
};

export const importUser = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`/api/users/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteUser = (id) => {
  return axios.delete(`/api/users/${id}`);
};

export const adminResetPassword = (userId, newPassword) => {
  return axios.put(`/api/users/${userId}/change-password`, { newPassword });
};
