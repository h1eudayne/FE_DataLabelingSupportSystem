import axios from "../../axios.customize";

const aiService = {
  detectObjects: (data) => axios.post("/api/ai/detect", data),
  getStatus: () => axios.get("/api/ai/status"),
};

export default aiService;
