import axios from "../../axios.customize";

const reviewAuditService = {
  getTasksForReview: (projectId) =>
    axios.get(`/api/reviews/projects/${projectId}/tasks`),

  auditReview: (data) => axios.post("/api/reviews/audits", data),

  getEscalations: (projectId) =>
    axios.get(`/api/reviews/projects/${projectId}/escalations`),

  resolveEscalation: (data) =>
    axios.post("/api/reviews/escalations/resolve", data),
};

export default reviewAuditService;
