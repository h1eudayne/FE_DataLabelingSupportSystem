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

const getProjectContext = (projectOrId) => {
  if (projectOrId && typeof projectOrId === "object") {
    return {
      projectId: projectOrId.projectId ?? projectOrId.id ?? null,
      projectName: projectOrId.projectName ?? projectOrId.name ?? "",
    };
  }

  return {
    projectId: projectOrId ?? null,
    projectName: "",
  };
};

const getTaskDisplayName = (task) => {
  const fileName = task?.dataItemUrl?.split("/").pop();
  return fileName || `Item #${task?.dataItemId ?? task?.id ?? "?"}`;
};

const normalizeOptionalText = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const buildDisputeLookup = (disputes = []) => {
  const lookup = new Map();

  disputes.forEach((dispute) => {
    if (dispute?.assignmentId != null) {
      lookup.set(`assignment-${dispute.assignmentId}`, dispute);
    }

    if (dispute?.dataItemId != null) {
      lookup.set(`data-item-${dispute.dataItemId}`, dispute);
    }
  });

  return lookup;
};

const getMatchingDispute = (disputeLookup, task) =>
  disputeLookup.get(`assignment-${task.id}`) ??
  disputeLookup.get(`data-item-${task.dataItemId}`) ??
  null;

const buildFeedbackEntriesFromTask = (task, projectContext, disputeLookup) => {
  const dispute = getMatchingDispute(disputeLookup, task);
  const baseFeedback = {
    assignmentId: task.id,
    dataItemId: task.dataItemId,
    dataItemUrl: task.dataItemUrl,
    taskName: getTaskDisplayName(task),
    projectId: projectContext.projectId,
    projectName: projectContext.projectName,
    taskStatus: task.status,
  };
  const feedbackEntries = [];
  const normalizedReviewerComment = normalizeOptionalText(task.rejectionReason);
  const normalizedManagerComment = normalizeOptionalText(task.managerComment);
  const normalizedReviewerFeedbacks = Array.isArray(task.reviewerFeedbacks)
    ? task.reviewerFeedbacks
    : [];

  if (task.status === "Rejected" && normalizedReviewerFeedbacks.length > 0) {
    normalizedReviewerFeedbacks.forEach((feedback, index) => {
      const normalizedComment = normalizeOptionalText(feedback?.comment);
      if (!normalizedComment) {
        return;
      }

      feedbackEntries.push({
        ...baseFeedback,
        feedbackId:
          feedback?.reviewLogId ??
          `reviewer-${task.id ?? "task"}-${feedback?.reviewerId ?? index}`,
        reviewLogId: feedback?.reviewLogId ?? null,
        sourceRole: "Reviewer",
        sourceName:
          normalizeOptionalText(feedback?.reviewerName) ||
          normalizeOptionalText(feedback?.reviewerId) ||
          null,
        errorType:
          normalizeOptionalText(
            feedback?.errorCategories ?? feedback?.errorCategory,
          ) || null,
        comment: normalizedComment,
        returnedDate: feedback?.reviewedAt || task.latestReviewAt || null,
      });
    });
  } else if (task.status === "Rejected" && normalizedReviewerComment) {
    feedbackEntries.push({
      ...baseFeedback,
      feedbackId: `reviewer-${task.id ?? "task"}-legacy`,
      sourceRole: "Reviewer",
      sourceName: dispute?.reviewerName || null,
      errorType: normalizeOptionalText(task.errorCategory) || null,
      comment: normalizedReviewerComment,
      returnedDate: task.latestReviewAt || dispute?.createdAt || null,
    });
  }

  if (
    task.status === "Rejected" &&
    normalizedManagerComment &&
    String(task.managerDecision || "").toLowerCase() === "reject"
  ) {
    feedbackEntries.push({
      ...baseFeedback,
      feedbackId: `manager-${task.id ?? "task"}`,
      sourceRole: "Manager",
      sourceName: dispute?.managerName || null,
      errorType: normalizeOptionalText(task.errorCategory) || null,
      comment: normalizedManagerComment,
      returnedDate: dispute?.resolvedAt || task.latestReviewAt || null,
    });
  }

  return feedbackEntries;
};

export const getReviewerFeedbackByProject = async (projectOrId) => {
  const projectContext = getProjectContext(projectOrId);
  if (!projectContext.projectId) return [];

  try {
    const [taskResponse, disputeResponse] = await Promise.all([
      axios.get(`/api/tasks/projects/${projectContext.projectId}/images`),
      axios
        .get("/api/disputes", {
          params: { projectId: projectContext.projectId },
        })
        .catch(() => ({ data: [] })),
    ]);
    const tasks = Array.isArray(taskResponse?.data) ? taskResponse.data : [];
    const disputes = Array.isArray(disputeResponse?.data) ? disputeResponse.data : [];
    const disputeLookup = buildDisputeLookup(disputes);

    return tasks
      .flatMap((task) =>
        buildFeedbackEntriesFromTask(task, projectContext, disputeLookup),
      )
      .sort((left, right) => {
        const leftTime = Date.parse(left.returnedDate || "");
        const rightTime = Date.parse(right.returnedDate || "");

        if (!Number.isNaN(rightTime) || !Number.isNaN(leftTime)) {
          return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime);
        }

        return (right.assignmentId || 0) - (left.assignmentId || 0);
      });
  } catch {
    return [];
  }
};

export const getAllReviewerFeedback = async () => {
  const projects = await getAssignedProjects();
  if (!projects || projects.length === 0) return [];

  const requests = projects.map((p) =>
    getReviewerFeedbackByProject(p),
  );

  const responses = await Promise.all(requests);
  return responses
    .flat()
    .sort((left, right) => {
      const leftTime = Date.parse(left.returnedDate || "");
      const rightTime = Date.parse(right.returnedDate || "");
      return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime);
    });
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
  const perProject = [];

  for (const p of projects) {
    try {
      const statsRes = await axios.get(
        `/api/projects/${p.projectId}/statistics`,
      );
      const s = statsRes.data;
      const me = s.annotatorPerformances?.find((a) => a.annotatorId === userId);
      if (me) {
        const resolvedTasks =
          me.resolvedTasks ?? ((me.tasksCompleted || 0) + (me.tasksRejected || 0));
        const acc = me.finalAccuracy ?? me.annotatorAccuracy ?? 0;
        perProject.push({
          projectName: p.projectName,
          accuracy: resolvedTasks > 0 ? acc : null,
          tasksAssigned: me.tasksAssigned,
          tasksCompleted: me.tasksCompleted,
          tasksResolved: resolvedTasks,
        });
        if (resolvedTasks > 0) {
          weightedSum += acc * resolvedTasks;
          totalWeight += resolvedTasks;
        }
      }
    } catch {
      // ignore
    }
  }

  const overallAccuracy =
    totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null;

  return {
    overallAccuracy,
    perProject,
  };
};
