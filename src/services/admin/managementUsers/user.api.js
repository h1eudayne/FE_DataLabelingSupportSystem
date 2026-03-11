import axios from "../../axios.customize";

export const getUsers = (page = 1, pageSize = 10) => {
  return axios.get(`/api/users`, {
    params: { page, pageSize },
  });
};

// POST /api/users
export const createUser = (data) => {
  return axios.post("/api/users", data);
};

// PUT /api/users/me/password
export const changePassword = (oldPassword, newPassword) => {
  return axios.put("/api/users/me/password", { oldPassword, newPassword });
};

// PUT /api/users/:id
export const updateUser = (id, data) => {
  return axios.put(`/api/users/${id}`, data);
};

// GET /api/users/me
export const getUserProfile = () => {
  return axios.get("/api/users/me");
};

// PUT /api/users/me
export const updateUserProfile = (fullName, avatarUrl) => {
  return axios.put(`/api/users/me`, {
    fullName: fullName,
    avatarUrl: avatarUrl,
  });
};

// POST /api/users/me/avatar
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("/api/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// PATCH /api/users/:id/status?isActive=true
export const updateStatus = (id, isActive) => {
  return axios.patch(`/api/users/${id}/status?isActive=${isActive}`);
};

// POST /api/users/import
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
