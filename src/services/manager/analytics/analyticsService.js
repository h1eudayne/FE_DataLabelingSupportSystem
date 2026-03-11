import axios from "../../axios.customize";

const analyticsService = {
  getMyProjects: (managerId) =>
    axios.get(`/api/projects/managers/${managerId}`),

  getProjectStats: (projectId) => {
    if (!projectId) throw new Error("projectId is required");
    return axios.get(`/api/projects/${projectId}/statistics`);
  },

  getDashboardStats: async (managerId) => {
    const [resProjects, resManagerStats] = await Promise.all([
      axios.get(`/api/projects/managers/${managerId}`),
      axios
        .get(`/api/projects/managers/${managerId}/statistics`)
        .catch(() => ({ data: null })),
    ]);
    const projects = resProjects.data || [];
    const managerStats = resManagerStats.data;

    let completed = 0;
    let inProgress = 0;
    let submitted = 0;
    let rejected = 0;
    let newProjects = 0;

    const activeProjects = [];

    for (const project of projects) {
      try {
        const res = await axios.get(`/api/projects/${project.id}/statistics`);
        const s = res.data;

        const total = s.totalAssignments ?? 0;
        const approved = s.approvedAssignments ?? 0;
        const rej = s.rejectedAssignments ?? 0;
        const sub = s.submittedAssignments ?? 0;
        const pend = s.pendingAssignments ?? 0;

        let projectStatus = "New";
        if (total === 0) {
          newProjects++;
          projectStatus = "New";
        } else if (approved === total) {
          completed++;
          projectStatus = "Completed";
        } else if (approved === 0 && sub === 0 && rej > 0) {
          rejected++;
          projectStatus = "Rejected";
        } else {
          inProgress++;
          projectStatus = "InProgress";
        }

        activeProjects.push({
          id: project.id,
          name: project.name,
          status: projectStatus,
          progress:
            s.totalItems > 0
              ? Math.round((s.completedItems / s.totalItems) * 100)
              : 0,
          totalImages: s.totalItems ?? project.totalDataItems ?? 0,
          completedImages: s.completedItems ?? 0,
          deadline: project.deadline,
        });
      } catch (err) {
        if (err.response?.status === 400) {
          activeProjects.push({
            id: project.id,
            name: project.name,
            status: "New",
            progress: Number(project.progress || 0),
            totalImages: Number(project.totalDataItems || 0),
            completedImages: 0,
            deadline: project.deadline,
          });
          newProjects++;
          continue;
        }
        throw err;
      }
    }

    return {
      total: projects.length,
      totalProjects: projects.length,
      completed,
      inProgress,
      submitted,
      rejected,
      pending: inProgress + newProjects,
      totalMembers: managerStats?.totalMembers || 0,
      activeProjects,
    };
  },
  getManagerStats: (managerId) =>
    axios.get(`/api/projects/managers/${managerId}/statistics`),

  getUsers: (page = 1, pageSize = 100) =>
    axios.get(`/api/users?page=${page}&pageSize=${pageSize}`),
};

export default analyticsService;
