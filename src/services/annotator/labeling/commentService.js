import axios from "../../axios.customize";

const commentService = {
  getCommentsByProject: (projectId) =>
    axios.get(`/api/reviews/projects/${projectId}/tasks`),

  postComment: (data) => axios.post("/api/reviews", data),
};

export default commentService;
