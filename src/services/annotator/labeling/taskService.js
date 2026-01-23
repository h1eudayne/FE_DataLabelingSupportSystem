// services/annotator/labeling/taskService.js
import axiosInstance from "../../axios.customize";

const taskService = {
  getMyAssignments: () => {
    return axiosInstance.get(`/api/Project/annotator/assigned`);
  },

  getTaskDetail: (assignmentId) => {
    if (!assignmentId) {
      console.error("assignmentId undefined");
      return Promise.reject("ID không hợp lệ");
    }
    return axiosInstance.get(`/api/Task/detail/${assignmentId}`);
  },

  submitTask: (payload) => {
    return axiosInstance.post(`/api/Task/submit`, payload);
  },
};

export default taskService;
