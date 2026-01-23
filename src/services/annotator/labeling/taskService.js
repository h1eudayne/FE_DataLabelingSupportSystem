import axiosInstance from "../../axios.customize";
const taskService = {
  getMyTasks: () => {
    return axiosInstance.get(`/api/Task/my-tasks`);
  },
  getTaskDetail: (assignmentId) => {
    if (!assignmentId) {
      console.error("Lỗi: assignmentId bị undefined khi gọi API detail");
      return Promise.reject("ID không hợp lệ");
    }
    return axiosInstance.get(`/api/Task/detail/${assignmentId}`);
  },

  getProjectLabels: (projectId) => {
    return axiosInstance.get(`/api/Project/${projectId}`);
  },

  submitTask: (payload) => {
    return axiosInstance.post(`/api/Task/submit`, payload);
  },
};

export default taskService;
