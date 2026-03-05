import axios from "../../axios.customize";

export const getSysLogs = () => {
  return axios.get("/api/logs/system");
};
