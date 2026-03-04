import axios from "../../axios.customize";

const reviewAuditService = {
  getTasksForReview: (projectId) =>
    axios.get(`/api/Review/project/${projectId}`),

  auditReview: (data) => axios.post("/api/Review/audit", data),
};

export default reviewAuditService;
