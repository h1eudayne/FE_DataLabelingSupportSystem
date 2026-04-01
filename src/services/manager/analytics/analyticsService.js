import axios from "../../axios.customize";
import {
  PROJECT_WORKFLOW_STATUS,
  isAwaitingManagerConfirmation,
} from "../../../utils/projectWorkflowStatus";

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

        let projectStatus =
          s.projectStatus || project.status || PROJECT_WORKFLOW_STATUS.NEW;

        if (total === 0) {
          newProjects++;
          projectStatus = PROJECT_WORKFLOW_STATUS.NEW;
        } else if (projectStatus === PROJECT_WORKFLOW_STATUS.COMPLETED) {
          completed++;
        } else if (isAwaitingManagerConfirmation(projectStatus)) {
          submitted++;
          inProgress++;
        } else if (approved === 0 && sub === 0 && rej > 0) {
          rejected++;
        } else {
          inProgress++;
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
          pendingDisputeCount: project.pendingDisputeCount || 0,
          pendingPenaltyCount: project.pendingPenaltyCount || 0,
          rejectedImageCount: project.rejectedImageCount || 0,
          priorityIssueCount: project.priorityIssueCount || 0,
          hasPriorityIssue: Boolean(project.hasPriorityIssue),
          defaultActionTab: project.defaultActionTab || "datasets",
        });
      } catch (err) {
        if (err.response?.status === 400) {
          activeProjects.push({
            id: project.id,
            name: project.name,
            status: project.status || PROJECT_WORKFLOW_STATUS.NEW,
            progress: Number(project.progress || 0),
            totalImages: Number(project.totalDataItems || 0),
            completedImages: 0,
            deadline: project.deadline,
            pendingDisputeCount: project.pendingDisputeCount || 0,
            pendingPenaltyCount: project.pendingPenaltyCount || 0,
            rejectedImageCount: project.rejectedImageCount || 0,
            priorityIssueCount: project.priorityIssueCount || 0,
            hasPriorityIssue: Boolean(project.hasPriorityIssue),
            defaultActionTab: project.defaultActionTab || "datasets",
          });
          newProjects++;
          continue;
        }
        throw err;
      }
    }

    const sortedActiveProjects = [...activeProjects].sort((left, right) => {
      if (Boolean(right.hasPriorityIssue) !== Boolean(left.hasPriorityIssue)) {
        return Number(Boolean(right.hasPriorityIssue)) - Number(Boolean(left.hasPriorityIssue));
      }

      if ((right.priorityIssueCount || 0) !== (left.priorityIssueCount || 0)) {
        return (right.priorityIssueCount || 0) - (left.priorityIssueCount || 0);
      }

      return right.id - left.id;
    });

    return {
      total: projects.length,
      totalProjects: projects.length,
      completed,
      inProgress,
      submitted,
      rejected,
      pending: inProgress + newProjects,
      totalMembers: managerStats?.totalMembers || 0,
      activeProjects: sortedActiveProjects,
      priorityProjects: sortedActiveProjects.filter((project) => project.hasPriorityIssue),
    };
  },
  getManagerStats: (managerId) =>
    axios.get(`/api/projects/managers/${managerId}/statistics`),

  getUsers: (page = 1, pageSize = 100) =>
    axios.get(`/api/users?page=${page}&pageSize=${pageSize}`),
};

export default analyticsService;
