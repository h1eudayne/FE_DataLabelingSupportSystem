import axiosInstance from "../utils/axiosInstance";

const commentService = {
  getComments: (taskId) => {
    return axiosInstance.get(`/api/Review/project/${taskId}`);
  },

  postComment: (taskId, content) => {
    return axiosInstance.post(`/api/Review`, {
      projectId: taskId,
      comment: content,
      errorCategory: "General",
    });
  },
};

export default commentService;
