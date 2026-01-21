import axios from "../../axios.customize";

const datasetService = {
  getProjectDetail: (id) => axios.get(`/api/Project/${id}`),

  uploadFiles: (projectId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return axios.post(`/api/Project/${projectId}/upload-direct`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getStats: (id) => axios.get(`/api/Project/${id}/stats`),

  exportData: (id) => axios.get(`/api/Project/${id}/export`),
};

export default datasetService;
