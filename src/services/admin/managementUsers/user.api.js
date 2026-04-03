import axios from "../../axios.customize";
import {
  buildCachedUserResponse,
  getCachedCurrentUser,
} from "../../auth/currentUser";

export const getUsers = (page = 1, pageSize = 30) => {
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

export const getUserProfile = async (options = {}) => {
  const { forceRefresh = false } = options;

  if (!forceRefresh) {
    const cachedUser = getCachedCurrentUser();
    if (cachedUser) {
      return buildCachedUserResponse(cachedUser);
    }
  }

  try {
    return await axios.get("/api/users/me");
  } catch (error) {
    if (error?.response?.status === 404) {
      const cachedUser = getCachedCurrentUser();
      if (cachedUser) {
        return buildCachedUserResponse(cachedUser);
      }
    }

    throw error;
  }
};

export const updateUserProfile = (fullName, avatarUrl) => {
  return axios.put(`/api/users/me`, {
    fullName: fullName,
    avatarUrl: avatarUrl,
  });
};

export const updateStatus = (id, isActive) => {
  return axios.patch(`/api/users/${id}/status?isActive=${isActive}`);
};

export const resolveGlobalBanRequest = (requestId, approve, decisionNote = "") => {
  return axios.post(`/api/users/global-ban-requests/${requestId}/resolve`, {
    approve,
    decisionNote,
  });
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

export const adminResetPassword = (userId) => {
  return axios.put(`/api/users/${userId}/change-password`, {});
};
