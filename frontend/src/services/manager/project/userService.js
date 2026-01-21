import axios from "../../axios.customize";

export const userService = {
  getUsers: () => axios.get("/api/User"),
};
