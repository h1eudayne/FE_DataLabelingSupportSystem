import axios from "../../axios.customize";

const projectService = {
  getManagerProjects: (managerId) =>
    axios.get(`/api/projects/managers/${managerId}`),

  getProjectById: (id) => axios.get(`/api/projects/${id}`),

  createProject: async (data) => {
    const response = await axios.post("/api/projects", data);
    return response;
  },

  updateProject: (id, data) => axios.put(`/api/projects/${id}`, data),

  deleteProject: (id) => axios.delete(`/api/projects/${id}`),

  importData: (projectId, urls) =>
    axios.post(`/api/projects/${projectId}/imports`, {
      storageUrls: urls,
    }),

  uploadDirect: (projectId, formData) =>
    axios.post(`/api/projects/${projectId}/uploads/direct`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getProjectStats: (id) => axios.get(`/api/projects/${id}/statistics`),
};

export default projectService;
