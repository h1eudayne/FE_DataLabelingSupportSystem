import axios from "../../axios.customize";

const analyticsService = {
  getMyProjects: (managerId) => axios.get(`/api/Project/manager/${managerId}`),

  getProjectStats: (projectId) => {
    if (!projectId) throw new Error("projectId is required");
    return axios.get(`/api/ProjectStats/${projectId}`);
  },

  getDashboardStats: async (managerId) => {
    const resProjects = await axios.get(`/api/Project/manager/${managerId}`);
    const projects = resProjects.data || [];

    let totalAssignments = 0;
    let completed = 0;
    let pending = 0;
    let submitted = 0;
    let rejected = 0;

    for (const project of projects) {
      try {
        const res = await axios.get(`/api/ProjectStats/${project.id}`);
        const s = res.data;

        totalAssignments += s.totalAssignments ?? 0;
        completed += s.approvedAssignments ?? 0;
        pending += s.pendingAssignments ?? 0;
        submitted += s.submittedAssignments ?? 0;
        rejected += s.rejectedAssignments ?? 0;
      } catch (err) {
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
