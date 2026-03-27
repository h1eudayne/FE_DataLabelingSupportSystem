import axios from "../axios.customize";

const refreshTokenAPI = (refreshToken) => {
  const URL_BACKEND = "/api/auth/refresh-token";
  const data = {
    refreshToken,
  };
  return axios.post(URL_BACKEND, data);
};

export default refreshTokenAPI;
