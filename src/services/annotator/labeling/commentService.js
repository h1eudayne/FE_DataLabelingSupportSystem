import axios from "../../axios.customize";

const commentService = {
  getCommentsByProject: (projectId) =>
    axios.get(`/api/Review/project/${projectId}`),

  postComment: (data) => axios.post("/api/Review", data),
};

export default commentService;
