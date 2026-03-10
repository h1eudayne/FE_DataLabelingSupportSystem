import axios from "../../axios.customize";

export const userService = {
  getUsers: (page = 1, pageSize = 100) =>
    axios.get(`/api/users?page=${page}&pageSize=${pageSize}`),
};
