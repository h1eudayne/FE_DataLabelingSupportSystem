import axios from "./axios.customize";


const activityLogService = {
  
  getSystemLogs: () => {
    return axios.get("/api/logs/system");
  },

  
  getProjectLogs: (projectId) => {
    return axios.get(`/api/logs/projects/${projectId}`);
  },
};

export default activityLogService;
