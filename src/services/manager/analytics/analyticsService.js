import axios from "../../axios.customize";

const analyticsService = {
  getMyProjects: () => axios.get("/api/Project/manager/me"),

  getProjectStats: (projectId) => {
    if (!projectId) throw new Error("projectId is required");
    return axios.get(`/api/Project/${projectId}/stats`);
  },

  getDashboardStats: async () => {
    const resProjects = await axios.get("/api/Project/manager/me");
    const projects = resProjects.data || [];

    let totalAssignments = 0;
    let completed = 0;
    let pending = 0;
    let submitted = 0;
    let rejected = 0;

    for (const project of projects) {
      try {
        const res = await axios.get(`/api/Project/${project.id}/stats`);
        const s = res.data;

        totalAssignments += s.totalAssignments ?? 0;
        completed += s.approvedAssignments ?? 0;
        pending += s.pendingAssignments ?? 0;
        submitted += s.submittedAssignments ?? 0;
        rejected += s.rejectedAssignments ?? 0;
      } catch (err) {
        // ✅ test yêu cầu
        if (err.response?.status === 400) continue;
        throw err;
      }
    }

    return {
      totalProjects: projects.length,
      totalAssignments,
      completed,
      pending,
      submitted,
      rejected,
    };
  },
  getUsers: () => axios.get("/api/User"),
};

export default analyticsService;
