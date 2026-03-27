import axios from "../../axios.customize";

const taskService = {
  assignTask: (data) => {
    console.log('Sending request to /api/tasks/assign-team:', data);
    return axios.post("/api/tasks/assign-team", data);
  },

  getMyTasks: () => axios.get("/api/tasks/projects"),

  getTaskDetail: (assignmentId) =>
    axios.get(`/api/tasks/assignments/${assignmentId}`),

  submitTask: (data) => axios.post("/api/tasks/submissions", data),
};

export default taskService;
