import axios from "../../axios.customize";

const taskService = {
  assignTask: (data) => axios.post("/api/Task/assign", data),

  getMyTasks: () => axios.get("/api/Task/my-tasks"),

  getTaskDetail: (assignmentId) =>
    axios.get(`/api/Task/detail/${assignmentId}`),

  submitTask: (data) => axios.post("/api/Task/submit", data),
};

export default taskService;
