import axios from "../../axios.customize";
import { uploadToCloudinary } from "../../cloudinary/cloudinaryService";

const datasetService = {
  getProjectDetail: (id) => axios.get(`/api/Project/${id}`),

  uploadFiles: async (projectId, files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      uploadedUrls.push(url);
    }
    return axios.post(`/api/projects/${projectId}/import`, {
      storageUrls: uploadedUrls,
    });
  },

  getStats: (id) => axios.get(`/api/ProjectStats/${id}`),

  exportData: (id) =>
    axios.get(`/api/projects/${id}/export`, { responseType: "blob" }),
};

export default datasetService;
