import axios from "../axios.customize";

const projectService = {
  getReviewProjects: () => axios.get("/api/reviews/projects"),
  getReviewWorkspace: (id) => axios.get(`/api/reviews/projects/${id}/tasks`),
};

export default projectService;
