import axios from "../axios.customize";

const projectService = {
  getReviewProjects: () => axios.get("/api/reviews/projects"),
};

export default projectService;
