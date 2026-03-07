import axios from "../../axios.customize";

const taskService = {
  getMyProjects: () => axios.get("/api/tasks/projects"),
  getProjectImages: (projectId) =>
    axios.get(`/api/tasks/projects/${projectId}/images`),
  saveDraft: (data) => axios.put("/api/tasks/drafts", data),
  submitTask: (data) => axios.post("/api/tasks/submissions", data),
  submitMultiple: (data) => axios.post("/api/tasks/submissions/batch", data),
  createDispute: (data) => axios.post("/api/disputes", data),
  getMyDisputes: (projectId) =>
    axios.get("/api/disputes", { params: { projectId } }),
};

export default taskService;
