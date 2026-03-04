import axios from "../../axios.customize";

const projectService = {
  getManagerProjects: (managerId) =>
    axios.get(`/api/Project/manager/${managerId}`),

  getProjectById: (id) => axios.get(`/api/Project/${id}`),

  createProject: async (data) => {
    const response = await axios.post("/api/Project", data);
    return response;
  },

  updateProject: (id, data) => axios.put(`/api/Project/${id}`, data),

  deleteProject: (id) => axios.delete(`/api/Project/${id}`),

  importData: (projectId, urls) =>
    axios.post(`/api/projects/${projectId}/import`, {
      storageUrls: urls,
    }),

  getProjectStats: (id) => axios.get(`/api/ProjectStats/${id}`),
};

export default projectService;
