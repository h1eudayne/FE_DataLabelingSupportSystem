import axios from "../../axios.customize";

export const getUsers = () => {
  return axios.get("/api/User");
};

export const createUser = (data) => {
  return axios.post("/api/User", data);
};

export const changePassword = (oldPassword, newPassword) => {
  return axios.post("/api/User/change-password", { oldPassword, newPassword });
};

export const updateUser = (id, data) => {
  return axios.put(`/api/User/${id}`, data);
};

export const getUserProfile = () => {
  return axios.get("/api/User/profile");
};

export const updateUserProfile = (fullName, avatarUrl) => {
  return axios.put(`/api/User/profile`, {
    fullName: fullName,
    avatarUrl: avatarUrl,
  });
};

export const updateStatus = (id, isActive) => {
  return axios.patch(`/api/User/${id}/status?isActive=${isActive}`);
};
