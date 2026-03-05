import axios from "/src/services/axios.customize";

const taskService = {
  getMyProjects: () => axios.get("/api/tasks/projects"),
  getProjectImages: (projectId) =>
    axios.get(`/api/tasks/projects/${projectId}/images`),
  saveDraft: (data) => axios.put("/api/tasks/drafts", data),
  submitTask: (data) => axios.post("/api/tasks/submissions", data),
  submitMultiple: (data) => axios.post("/api/tasks/submissions/batch", data),
};

export default taskService;
