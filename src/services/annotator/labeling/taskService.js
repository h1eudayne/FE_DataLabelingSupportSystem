// services/annotator/labeling/taskService.js
import axiosInstance from "../../axios.customize";

const taskService = {
  getMyTasks: (projectId = 0, status) => {
    const params = new URLSearchParams();
    params.append("projectId", projectId);
    if (status) params.append("status", status);

    return axiosInstance.get(`/api/Task/my-tasks?${params.toString()}`);
  },

  getTaskDetail: (assignmentId) => {
    return axiosInstance.get(`/api/Task/detail/${assignmentId}`);
  },

  submitTask: (payload) => {
    return axiosInstance.post(`/api/Task/submit`, payload);
  },
};

export default taskService;
