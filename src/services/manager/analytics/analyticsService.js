import axios from "../../axios.customize";

export const getMyProjects = () => axios.get("/api/Project/manager/me");

export const getProjectStats = (projectId) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }
  return axios.get(`/api/Project/${projectId}/stats`);
};

export const getUsers = () => axios.get("/api/User");

export const getDashboardStats = async () => {
  const resProjects = await getMyProjects();
  const projects = resProjects.data || [];

  let totalProjects = projects.length;
  let totalAssignments = 0;
  let completed = 0;
  let pending = 0;
  let submitted = 0;
  let rejected = 0;

  for (const project of projects) {
    try {
      const res = await getProjectStats(project.id);
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
    totalProjects,
    totalAssignments,
    completed,
    pending,
    submitted,
    rejected,
  };
};
