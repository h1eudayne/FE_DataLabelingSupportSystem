import axios from "../axios.customize";

const logoutApi = () => {
  const URL_BACKEND = "/api/auth/logout";
  return axios.post(URL_BACKEND);
};

export default logoutApi;
