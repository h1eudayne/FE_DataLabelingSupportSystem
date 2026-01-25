// services/annotator/labeling/taskService.js
import axiosInstance from "../../axios.customize";

const taskService = {
  // 1️⃣ Lấy danh sách project đã được backend gom
  getMyProjects: () => {
    return axiosInstance.get("/api/Task/my-projects");
  },

  // 2️⃣ Lấy toàn bộ ảnh của 1 project
  getProjectImages: (projectId) => {
    return axiosInstance.get(`/api/Task/project/${projectId}/images`);
  },

  // 3️⃣ Lưu nháp
  saveDraft: (payload) => {
    return axiosInstance.post("/api/Task/save-draft", payload);
  },

  // 4️⃣ Nộp task
  submitTask: (payload) => {
    return axiosInstance.post("/api/Task/submit", payload);
  },
};

export default taskService;
