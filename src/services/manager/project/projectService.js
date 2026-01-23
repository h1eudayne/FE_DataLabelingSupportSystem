import axios from "../../axios.customize";

const projectService = {
  getManagerProjects: () => axios.get("/api/Project/manager/me"),

  getProjectById: (id) => axios.get(`/api/Project/${id}`),

  createProject: async (data) => {
    const response = await axios.post("/api/Project", data);
    return response;
  },
  createLabel: (labelData) => axios.post("/api/Label", labelData),

  deleteProject: (id) => axios.delete(`/api/Project/${id}`),

  importData: (projectId, data) =>
    axios.post(`/api/Project/${projectId}/import-data`, data),

  getProjectStats: (id) => axios.get(`/api/Project/${id}/stats`),

  getProjectDetail: (id) => axios.get(`/api/Project/${id}`),
};

export default projectService;
