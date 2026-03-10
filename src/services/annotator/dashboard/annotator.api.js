import axios from "/src/services/axios.customize.js";

export const getProfile = async () => {
  const res = await axios.get("/api/users/me");
  return res.data;
};

export const getAssignedProjects = async () => {
  const res = await axios.get("/api/tasks/projects");
  return res.data;
};

export const getDashboardStats = async () => {
  const projects = await getAssignedProjects();

  let totalAssigned = 0;
  let submitted = 0;
  let inProgress = 0;

  projects.forEach((p) => {
    totalAssigned += p.totalImages || 0;
    submitted += p.completedImages || 0;

    if (p.status === "InProgress") {
      inProgress += (p.totalImages || 0) - (p.completedImages || 0);
    }
  });

  return {
    totalAssigned,
    submitted,
    inProgress,
    pendingReview: 0,
    returned: 0,
  };
};

export const getMyTasks = async (projectId) => {
  if (!projectId) return [];
  const res = await axios.get(`/api/tasks/projects/${projectId}/images`);
  return res.data;
};

export const getReviewerFeedbackByProject = async (projectId) => {
  if (!projectId) return [];

  try {
    const res = await axios.get(`/api/reviews/projects/${projectId}/tasks`);
    return res.data;
  } catch {
    return [];
  }
};

export const getAllReviewerFeedback = async () => {
  const projects = await getAssignedProjects();
  if (!projects || projects.length === 0) return [];

  const validProjects = projects.filter(
    (p) => p.status === "Submitted" || p.status === "Returned",
  );

  const requests = validProjects.map((p) =>
    getReviewerFeedbackByProject(p.id).then((reviews) =>
      reviews.map((r) => ({
        ...r,
        projectName: p.name,
      })),
    ),
  );

  const responses = await Promise.all(requests);
  return responses.flat();
};

export const getProjectProgressDetails = async () => {
  const projects = await getAssignedProjects();
  if (!projects || projects.length === 0) return [];

  const results = await Promise.all(
    projects.map(async (p) => {
      const projectId = p.projectId;
      const annDone = p.completedImages || 0;
      const annTotal = p.totalImages || 0;
      const annProgress =
        annTotal > 0 ? Math.round((annDone / annTotal) * 100) : 0;

      let revProgress = 0;
      let overallProgress = 0;
      let revDone = 0;
      let revTotal = 0;
      let approvedCount = 0;
      let totalAssignments = 0;

      try {
        const statsRes = await axios.get(
          `/api/projects/${projectId}/statistics`,
        );
        const s = statsRes.data;
        totalAssignments = s.totalAssignments ?? 0;
        approvedCount = s.approvedAssignments ?? 0;
        const rejectedCount = s.rejectedAssignments ?? 0;
        revDone = approvedCount + rejectedCount;
        revTotal = totalAssignments;
        revProgress = revTotal > 0 ? Math.round((revDone / revTotal) * 100) : 0;
        overallProgress =
          totalAssignments > 0
            ? Math.round((approvedCount / totalAssignments) * 100)
            : 0;
      } catch {
        overallProgress = 0;
      }

      return {
        projectId,
        projectName: p.projectName,
        status: p.status,
        deadline: p.deadline,
        annotator: { done: annDone, total: annTotal, progress: annProgress },
        reviewer: { done: revDone, total: revTotal, progress: revProgress },
        overall: {
          done: approvedCount,
          total: totalAssignments,
          progress: overallProgress,
        },
      };
    }),
  );

  return results;
};
