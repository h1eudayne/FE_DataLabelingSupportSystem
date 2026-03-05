import axios from "../../axios.customize";

const reviewAuditService = {
  getTasksForReview: (projectId) =>
    axios.get(`/api/reviews/projects/${projectId}/tasks`),

  auditReview: (data) => axios.post("/api/reviews/audits", data),
};

export default reviewAuditService;
