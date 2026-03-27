import axios from "../axios.customize";

const projectService = {
  getReviewProjects: () => axios.get("/api/reviews/projects"),
  getReviewWorkspace: (id) => axios.get(`/api/reviews/projects/${id}/tasks`),
  submitReview: (data) => axios.post(`/api/reviews`, data),
  getProjectStatistics: (id) => axios.get(`/api/projects/${id}/statistics`),
  
  getReviewerStats: () => axios.get(`/api/reviews/stats`),
  
  getReviewQueueGroupedByAnnotator: (projectId) => axios.get(`/api/reviews/projects/${projectId}/queue`),
  
  getBatchCompletionStatus: (projectId) => axios.get(`/api/reviews/projects/${projectId}/batch-status`),
};

export default projectService;
