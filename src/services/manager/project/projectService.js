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

  getBuckets: (projectId) => axios.get(`/api/projects/${projectId}/buckets`),

  exportData: (projectId) =>
    axios.get(`/api/projects/${projectId}/exports`, { responseType: "blob" }),

  exportCsv: (projectId) =>
    axios.get(`/api/projects/${projectId}/export-csv`, { responseType: "blob" }),

  getProjectStats: (id) => axios.get(`/api/projects/${id}/statistics`),

  assignReviewers: (data) => axios.post("/api/projects/assign-reviewers", data),

  removeUserFromProject: (projectId, userId) =>
    axios.delete(`/api/projects/${projectId}/users/${userId}`),

  toggleUserLock: (projectId, userId, lockStatus) =>
    axios.post(`/api/projects/${projectId}/users/${userId}/toggle-lock?lockStatus=${lockStatus}`),
};

export default projectService;
