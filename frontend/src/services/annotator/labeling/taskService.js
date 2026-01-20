import axiosInstance from "../../axios.customize";
const taskService = {
  getTaskDetail: (assignmentId) => {
    return axiosInstance.get(`/api/Task/detail/${assignmentId}`);
  },

  getProjectLabels: (projectId) => {
    return axiosInstance.get(`/api/Project/${projectId}`);
  },

  submitTask: (assignmentId, annotations) => {
    return axiosInstance.post(`/api/Task/submit`, {
      assignmentId,
      annotations,
      status: "Submitted",
    });
  },
};

export default taskService;
