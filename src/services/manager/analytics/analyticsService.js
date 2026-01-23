import axios from "../../axios.customize";

export const analyticsService = {
  getDashboardStats: () => axios.get("/api/Task/dashboard-stats"),
  getMyProjects: () => axios.get("/api/Project/manager/me"),
  getUsers: () => axios.get("/api/User"),
  getProjectReviews: (projectId) =>
    axios.get(`/api/Review/project/${projectId}`),
};
