import axios from "../../axios.customize";

export const userService = {
  // Backend returns PagedResponse: { totalCount, page, pageSize, stats, items[] }
  getUsers: (page = 1, pageSize = 100) =>
    axios.get(`/api/users?page=${page}&pageSize=${pageSize}`),
};
