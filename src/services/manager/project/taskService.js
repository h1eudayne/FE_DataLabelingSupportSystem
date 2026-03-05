import axios from "../../axios.customize";

const taskService = {
  assignTask: (data) => axios.post("/api/tasks/assignments", data),

  getMyTasks: () => axios.get("/api/tasks/projects"),

  getTaskDetail: (assignmentId) =>
    axios.get(`/api/tasks/assignments/${assignmentId}`),

  submitTask: (data) => axios.post("/api/tasks/submissions", data),
};

export default taskService;
