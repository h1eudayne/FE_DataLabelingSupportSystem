import axios from "../axios.customize";

const projectService = {
  getReviewProjects: () => axios.get("/api/reviews/projects"),
  getReviewWorkspace: (id) => axios.get(`/api/reviews/projects/${id}/tasks`),
  submitReview: (data) => axios.post(`/api/reviews`, data),
};

export default projectService;
