import axios from "../../axios.customize";
import { uploadToCloudinary } from "../../cloudinary/cloudinaryService";

const datasetService = {
  getProjectDetail: (id) => axios.get(`/api/projects/${id}`),

  uploadFiles: async (projectId, files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      uploadedUrls.push(url);
    }
    return axios.post(`/api/projects/${projectId}/imports`, {
      storageUrls: uploadedUrls,
    });
  },

  getStats: (id) => axios.get(`/api/projects/${id}/statistics`),

  exportData: (id) =>
    axios.get(`/api/projects/${id}/exports`, { responseType: "blob" }),

  exportCsv: (id) =>
    axios.get(`/api/projects/${id}/export-csv`, { responseType: "blob" }),
};

export default datasetService;
