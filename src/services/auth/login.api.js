import axios from "../axios.customize";

const loginApi = (email, password) => {
  const URL_BACKEND = "/api/auth/login";
  const data = {
    email: email,
    password,
  };
  return axios.post(URL_BACKEND, data);
};

export default loginApi;
