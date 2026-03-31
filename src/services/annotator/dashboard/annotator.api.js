import axios from "/src/services/axios.customize.js";
import { getCachedCurrentUser } from "/src/services/auth/currentUser.js";

export const getProfile = async () => {
  const cachedUser = getCachedCurrentUser();
  if (cachedUser) {
    return cachedUser;
  }

  try {
    const res = await axios.get("/api/users/me");
    return res.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallbackUser = getCachedCurrentUser();
      if (fallbackUser) {
        return fallbackUser;
      }
    }

    throw error;
  }
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
    const res = await axios.get(`/api/tasks/projects/${projectId}/images`);
    const tasks = res.data || [];
    return tasks
      .filter((t) => t.rejectionReason && t.rejectionReason.trim())
      .map((t) => ({
        assignmentId: t.id,
        comment: t.rejectionReason,
        isApproved: false,
        status: t.status,
      }));
  } catch {
    return [];
  }
};

export const getAllReviewerFeedback = async () => {
  const projects = await getAssignedProjects();
  if (!projects || projects.length === 0) return [];

  const requests = projects.map((p) =>
    getReviewerFeedbackByProject(p.projectId).then((reviews) =>
      reviews.map((r) => ({
        ...r,
        projectName: p.projectName,
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

export const getMyAccuracy = async () => {
  const projects = await getAssignedProjects();
  if (!projects || projects.length === 0) return null;

  let userId = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user.id;
    }
  } catch {
    return null;
  }
  if (!userId) return null;

  let totalWeight = 0;
  let weightedSum = 0;
  let hasAnyReviewData = false;
  const perProject = [];

  for (const p of projects) {
    try {
      const statsRes = await axios.get(
        `/api/projects/${p.projectId}/statistics`,
      );
      const s = statsRes.data;
      const me = s.annotatorPerformances?.find((a) => a.annotatorId === userId);
      if (me) {
        const weight = me.tasksAssigned || 1;
        const hasReviewData = (me.tasksCompleted || 0) > 0 || (me.annotatorAccuracy || 0) > 0;
        const acc = hasReviewData ? (me.annotatorAccuracy ?? 0) : 100;
        perProject.push({
          projectName: p.projectName,
          accuracy: acc,
          tasksAssigned: me.tasksAssigned,
          tasksCompleted: me.tasksCompleted,
        });
        weightedSum += acc * weight;
        totalWeight += weight;
        if (me.tasksCompleted > 0 || acc > 0) {
          hasAnyReviewData = true;
        }
      }
    } catch {
      
    }
  }

  const overallAccuracy =
    totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null;

  return {
    overallAccuracy:
      overallAccuracy === null && !hasAnyReviewData
        ? null
        : (overallAccuracy ?? 0),
    perProject,
  };
};
