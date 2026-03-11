import axios from "../../axios.customize";

const commentService = {
  getCommentsByProject: (projectId) =>
    axios.get(`/api/reviews/projects/${projectId}/tasks`),
};

export default commentService;
