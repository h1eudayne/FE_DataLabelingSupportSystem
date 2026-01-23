import axios from "../../axios.customize";

export const getUsers = () => {
  return axios.get("/api/User");
};

export const createUser = (data) => {
  return axios.post("/api/User", data);
};

export const updateUser = (id, data) => {
  return axios.put(`/api/User/${id}`, data);
};

export const deleteUser = (id) => {
  return axios.delete(`/api/User/${id}`);
};

export const getUserProfile = () => {
  return axios.get('/api/User/profile');
}
