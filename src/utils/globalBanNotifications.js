import { parseDateTimeToMillis } from "./dateTime";

const parseNotificationTimestamp = (value) => parseDateTimeToMillis(value);

const normalizeTextValue = (value) => {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
};

const normalizeProjectId = (project) => {
  const value =
    project?.id ??
    project?.Id ??
    project?.projectId ??
    project?.ProjectId ??
    null;
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return value;
};

const getGlobalBanRequestKey = (notification) => {
  const requestId = notification?.metadata?.banRequestId;
  if (requestId !== null && requestId !== undefined && requestId !== "") {
    return `request-${requestId}`;
  }

  if (notification?.id !== null && notification?.id !== undefined && notification?.id !== "") {
    return `notification-${notification.id}`;
  }

  return null;
};

const normalizeGlobalBanProject = (project) => {
  if (typeof project === "string") {
    return {
      id: null,
      name: normalizeTextValue(project),
      status: null,
    };
  }

  return {
    id: normalizeProjectId(project),
    name: normalizeTextValue(
      project?.name ??
        project?.Name ??
        project?.projectName ??
        project?.ProjectName ??
        project?.title ??
        project?.Title,
    ),
    status: normalizeTextValue(project?.status ?? project?.Status),
  };
};

const getGlobalBanProjectIdentity = (project, index) => {
  if (project?.id !== null && project?.id !== undefined && project.id !== "") {
    return `id-${project.id}`;
  }

  if (project?.name) {
    return `name-${project.name.toLowerCase()}`;
  }

  if (project?.status) {
    return `status-${project.status.toLowerCase()}`;
  }

  return `unknown-project-${index}`;
};

const collectGlobalBanProjects = (notification) =>
  Array.from(
    (
      Array.isArray(notification?.metadata?.unfinishedProjects)
        ? notification.metadata.unfinishedProjects
        : []
    ).reduce((accumulator, project, index) => {
      const normalizedProject = normalizeGlobalBanProject(project);
      const identity = getGlobalBanProjectIdentity(normalizedProject, index);
      const existingProject = accumulator.get(identity);

      accumulator.set(identity, {
        id: existingProject?.id ?? normalizedProject.id,
        name: existingProject?.name ?? normalizedProject.name,
        status: existingProject?.status ?? normalizedProject.status,
      });

      return accumulator;
    }, new Map()).values(),
  );

export const isPendingGlobalBanNotification = (notification) =>
  notification?.actionKey === "ResolveGlobalUserBanRequest" &&
  notification?.metadata?.requestStatus === "Pending";

export const getGlobalBanProjects = (notification) =>
  collectGlobalBanProjects(notification);

export const getPendingGlobalBanNotifications = (notifications = []) =>
  [...notifications]
    .filter(isPendingGlobalBanNotification)
    .sort(
      (left, right) =>
        parseNotificationTimestamp(right?.timestamp) -
        parseNotificationTimestamp(left?.timestamp),
    )
    .reduce(
      (accumulator, notification) => {
        const requestKey = getGlobalBanRequestKey(notification);

        if (!requestKey) {
          accumulator.items.push(notification);
          return accumulator;
        }

        if (accumulator.seenRequestKeys.has(requestKey)) {
          return accumulator;
        }

        accumulator.seenRequestKeys.add(requestKey);
        accumulator.items.push(notification);
        return accumulator;
      },
      { items: [], seenRequestKeys: new Set() },
    ).items;

export const getGlobalBanProjectKey = (project, index = 0, prefix = "project") =>
  [
    prefix,
    project?.id ?? "unknown-id",
    project?.name ?? "unknown-name",
    project?.status ?? "unknown-status",
    index,
  ].join("-");

export const getGlobalBanNotificationKey = (notification) =>
  getGlobalBanRequestKey(notification);

export const buildResolvedGlobalBanNotificationPatch = (
  notification,
  approve,
  decisionNote = "",
) => {
  const normalizedDecisionNote = decisionNote.trim();

  return {
    read: true,
    metadata: {
      ...(notification?.metadata || {}),
      requestStatus: approve ? "Approved" : "Rejected",
      decisionNote: normalizedDecisionNote || null,
      resolvedAt: new Date().toISOString(),
    },
  };
};

const SAFE_GLOBAL_BAN_ERROR_PATTERNS = [
  /not found/i,
  /already been resolved/i,
  /responsible manager/i,
  /decision note/i,
  /valid global ban/i,
];

export const getSafeGlobalBanErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data?.message;
  const responseStatus = error?.response?.status;

  if (
    typeof responseMessage === "string" &&
    [400, 403, 404].includes(responseStatus) &&
    SAFE_GLOBAL_BAN_ERROR_PATTERNS.some((pattern) => pattern.test(responseMessage))
  ) {
    return responseMessage;
  }

  return fallbackMessage;
};
