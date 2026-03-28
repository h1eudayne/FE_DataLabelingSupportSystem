import axios from "../../axios.customize";

const labelService = {
  getLabels: (projectId) => axios.get(`/api/labels?projectId=${projectId}`),
  createLabel: (projectId, data) =>
    axios.post(`/api/labels`, { ...data, projectId }),
  updateLabel: (id, data) => axios.put(`/api/labels/${id}`, data),
  deleteLabel: (id) => axios.delete(`/api/labels/${id}`),
  getLabelUsageCount: (id) => axios.get(`/api/labels/${id}/usage-count`),
};

export default labelService;
