export const PROJECT_WORKFLOW_STATUS = {
  ACTIVE: "Active",
  ARCHIVED: "Archived",
  ASSIGNED: "Assigned",
  AWAITING_MANAGER_CONFIRMATION: "AwaitingManagerConfirmation",
  COMPLETED: "Completed",
  EXPIRED: "Expired",
  IN_PROGRESS: "InProgress",
  NEW: "New",
};

export const isAwaitingManagerConfirmation = (status) =>
  String(status || "") === PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION;

export const isCompletedProjectStatus = (status) =>
  String(status || "") === PROJECT_WORKFLOW_STATUS.COMPLETED;

export const getProjectStatusLabel = (status, t) => {
  switch (String(status || "")) {
    case PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION:
      return t("statusCommon.awaitingManagerConfirmation");
    case PROJECT_WORKFLOW_STATUS.COMPLETED:
      return t("statusCommon.completed");
    case PROJECT_WORKFLOW_STATUS.EXPIRED:
      return t("statusCommon.expired");
    case PROJECT_WORKFLOW_STATUS.IN_PROGRESS:
      return t("statusCommon.inProgress");
    case PROJECT_WORKFLOW_STATUS.ACTIVE:
      return t("statusCommon.active");
    case PROJECT_WORKFLOW_STATUS.ASSIGNED:
      return t("annotatorDashboardComp.assigned");
    case PROJECT_WORKFLOW_STATUS.ARCHIVED:
      return t("statusCommon.archived");
    case PROJECT_WORKFLOW_STATUS.NEW:
      return t("statusCommon.new");
    default:
      return status || t("statusCommon.notAvailable");
  }
};

export const getProjectStatusTone = (status) => {
  switch (String(status || "")) {
    case PROJECT_WORKFLOW_STATUS.COMPLETED:
      return "success";
    case PROJECT_WORKFLOW_STATUS.EXPIRED:
      return "danger";
    case PROJECT_WORKFLOW_STATUS.AWAITING_MANAGER_CONFIRMATION:
      return "warning";
    case PROJECT_WORKFLOW_STATUS.ACTIVE:
    case PROJECT_WORKFLOW_STATUS.IN_PROGRESS:
      return "primary";
    case PROJECT_WORKFLOW_STATUS.ASSIGNED:
    case PROJECT_WORKFLOW_STATUS.NEW:
      return "info";
    case PROJECT_WORKFLOW_STATUS.ARCHIVED:
      return "secondary";
    default:
      return "secondary";
  }
};

export const getProjectStatusBadgeClass = (status) => {
  switch (getProjectStatusTone(status)) {
    case "success":
      return "bg-success-subtle text-success";
    case "danger":
      return "bg-danger-subtle text-danger";
    case "warning":
      return "bg-warning-subtle text-warning";
    case "primary":
      return "bg-primary-subtle text-primary";
    case "info":
      return "bg-info-subtle text-info";
    default:
      return "bg-light text-muted";
  }
};
