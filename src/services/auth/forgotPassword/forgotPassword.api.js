import axios from "../../axios.customize";

const forgotPasswordApi = (email) => {
  const URL_BACKEND = "/api/auth/forgot-password";
  const data = {
    email: email,
  };
  return axios.post(URL_BACKEND, data);
};

export default forgotPasswordApi;
