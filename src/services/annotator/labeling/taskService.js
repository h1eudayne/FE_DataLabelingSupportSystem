import axios from "/src/services/axios.customize";

const taskService = {
  getMyProjects: () => axios.get("/api/Task/my-projects"),
  getProjectImages: (id) => axios.get(`/api/Task/project/${id}/images`),
  saveDraft: (data) => axios.post("/api/Task/save-draft", data),
  submitTask: (data) => axios.post("/api/Task/submit", data),
};

export default taskService;
