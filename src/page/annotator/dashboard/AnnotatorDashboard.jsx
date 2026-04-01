import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../../assets/css/AnnotatorDashboard.css";
import useAnnotatorDashboard from "../../../hooks/annotator/dashboard/useAnnotatorDashboard";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import ReviewerFeedbackTable from "../../../components/annotator/dashboard/ReviewerFeedbackTable";
import StatCard from "../../../components/annotator/dashboard/StatCard";
import { buildAnnotatorWorkspaceUrl } from "../../../utils/annotatorWorkspaceNavigation";
import useSignalRRefresh from "../../../hooks/useSignalRRefresh";
import {
  getProjectStatusLabel,
  getProjectStatusTone,
  isAwaitingManagerConfirmation,
} from "../../../utils/projectWorkflowStatus";
import { sortProjectsByNewestId } from "../../../utils/projectSort";

const AnnotatorDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const localeTag = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
  const [projectId, setProjectId] = useState(null);
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const [progressCollapsed, setProgressCollapsed] = useState(false);
  const [taskListCollapsed, setTaskListCollapsed] = useState(false);
  const [feedbackCollapsed, setFeedbackCollapsed] = useState(false);
  const [accuracyCollapsed, setAccuracyCollapsed] = useState(false);

  const {
    profile,
    projects,
    defaultProjectId,
    tasksByProject,
    reviewerFeedback,
    projectProgress,
    myAccuracy,
  } = useAnnotatorDashboard(projectId);
  const activeProjectId = projectId ?? defaultProjectId;

  useSignalRRefresh(
    () => {
      projects.refetch();
      tasksByProject.refetch();
      reviewerFeedback.refetch();
      projectProgress.refetch();
      myAccuracy.refetch();
    },
    { showToast: false },
  );

  const stats = useMemo(() => {
    const projectList = projects.data || [];
    return {
      assigned: projectList.length,
      completed: projectList.filter((p) => p.status === "Completed").length,
      inProgress: projectList.filter(
        (p) =>
          p.status === "Active" ||
          p.status === "InProgress" ||
          isAwaitingManagerConfirmation(p.status),
      ).length,
      expired: projectList.filter((p) => p.status === "Expired").length,
      totalImages: projectList.reduce((s, p) => s + (p.totalImages || 0), 0),
      completedImages: projectList.reduce(
        (s, p) => s + (p.completedImages || 0),
        0,
      ),
    };
  }, [projects.data]);

  const accuracy = useMemo(() => {
    const accData = myAccuracy.data;
    if (!accData || accData.overallAccuracy == null) return null;
    return accData.overallAccuracy;
  }, [myAccuracy.data]);

  const perProjectAccuracy = useMemo(() => {
    return sortProjectsByNewestId(myAccuracy.data?.perProject || []);
  }, [myAccuracy.data]);

  const isLoadingStats = projects.isLoading;
  const progressData = useMemo(
    () => sortProjectsByNewestId(projectProgress.data || []),
    [projectProgress.data],
  );

  const getProgressColor = (value) => {
    if (value >= 80) return "#0ab39c";
    if (value >= 50) return "#f7b84b";
    return "#f06548";
  };

  const getBadgeColor = (value) => {
    if (value >= 80) return "success";
    if (value >= 50) return "warning";
    return "danger";
  };

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case "Assigned":
        return t("annotatorDashboardComp.assigned");
      case "InProgress":
        return t("annotatorTasks.inProgress");
      case "Submitted":
        return t("annotatorDashboardComp.submitted");
      case "Approved":
        return t("workspace.statusApproved");
      case "Rejected":
        return t("workspace.statusRejected");
      case "Completed":
      case "AwaitingManagerConfirmation":
        return getProjectStatusLabel(status, t);
      default:
        return status;
    }
  };

  const handleOpenFeedbackTask = (feedbackItem) => {
    const workspaceUrl = buildAnnotatorWorkspaceUrl(
      feedbackItem?.projectId,
      {
        id: feedbackItem?.assignmentId,
        dataItemId: feedbackItem?.dataItemId,
      },
    );

    if (workspaceUrl) {
      navigate(workspaceUrl);
    }
  };

  return (
    <DashboardLayout title={t("annotatorDash.title")}>
      <h4>{t("annotatorDash.welcome")}, {profile?.data?.fullName}</h4>

      <div className="row row-cols-1 row-cols-md-3 row-cols-xl-6 g-3 mt-3">
        <StatCard
          title={t("annotatorDash.assignedProjects")}
          value={stats.assigned}
          icon="ri-folder-line"
          color="primary"
          loading={isLoadingStats}
        />
        <StatCard
          title={t("annotatorDash.completed")}
          value={stats.completed}
          icon="ri-checkbox-circle-line"
          color="success"
          loading={isLoadingStats}
        />
        <StatCard
          title={t("annotatorDash.inProgress")}
          value={stats.inProgress}
          icon="ri-loader-4-line"
          color="warning"
          loading={isLoadingStats}
        />
        <StatCard
          title={t("annotatorDash.expired")}
          value={stats.expired}
          icon="ri-time-line"
          color="danger"
          loading={isLoadingStats}
        />
        <StatCard
          title={t("annotatorDash.imagesDone")}
          value={`${stats.completedImages}/${stats.totalImages}`}
          icon="ri-image-line"
          color="info"
          loading={isLoadingStats}
        />
        <StatCard
          title={t("annotatorDash.accuracy")}
          value={
            accuracy !== null
              ? `${accuracy}%`
              : t("annotatorDash.notAvailable")
          }
          icon="ri-focus-2-line"
          color={
            accuracy === null
              ? "secondary"
              : accuracy >= 80
                ? "success"
                : accuracy >= 50
                  ? "warning"
                  : "danger"
          }
          loading={myAccuracy.isLoading}
        />
      </div>

      {perProjectAccuracy.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card stitch-card">
              <div
                className="stitch-card-header stitch-card-header--clickable"
                onClick={() => setAccuracyCollapsed((prev) => !prev)}
                role="button"
                tabIndex={0}
              >
                <h5>
                  <i className="ri-focus-2-line me-2 text-primary"></i>
                  {t("annotatorDash.accuracyByProject")}
                </h5>
                <div className="d-flex align-items-center gap-2">
                  {accuracy !== null && (
                    <span
                      className={`badge bg-${getBadgeColor(accuracy)} bg-opacity-10 text-${getBadgeColor(accuracy)} stitch-badge`}
                    >
                      {t("annotatorDash.averageLabel")}: {accuracy}%
                    </span>
                  )}
                  <i
                    className={`ri-arrow-${accuracyCollapsed ? "down" : "up"}-s-line fs-5`}
                  ></i>
                </div>
              </div>
              {!accuracyCollapsed && (
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    <i className="ri-information-line me-1"></i>
                    {t("annotatorDash.accuracyDesc")}
                  </p>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>{t("annotatorDash.project")}</th>
                          <th className="text-center">{t("annotatorDash.tasksAssigned")}</th>
                          <th className="text-center">{t("annotatorDash.tasksDone")}</th>
                          <th className="text-center">{t("annotatorDash.accuracy")}</th>
                          <th style={{ minWidth: "180px" }}>{t("annotatorDash.progress")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {perProjectAccuracy.map((pa, idx) => {
                          const taskRate =
                            pa.tasksAssigned > 0
                              ? Math.round(
                                  (pa.tasksCompleted / pa.tasksAssigned) * 100,
                                )
                              : 0;
                          return (
                            <tr key={idx}>
                              <td className="fw-semibold">
                                <i className="ri-folder-line me-1 text-primary"></i>
                                {pa.projectName}
                              </td>
                              <td className="text-center">
                                {pa.tasksAssigned}
                              </td>
                              <td className="text-center text-success fw-bold">
                                {pa.tasksCompleted}
                              </td>
                              <td className="text-center">
                                <span
                                  className={`badge bg-${
                                    pa.accuracy !== null
                                      ? getBadgeColor(pa.accuracy)
                                      : "secondary"
                                  }`}
                                >
                                  {pa.accuracy !== null ? `${pa.accuracy}%` : "—"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="progress flex-grow-1"
                                    style={{ height: "6px" }}
                                  >
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${taskRate}%`,
                                        backgroundColor:
                                          getProgressColor(taskRate),
                                      }}
                                    ></div>
                                  </div>
                                  <small className="text-muted fw-bold">
                                    {taskRate}%
                                  </small>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card stitch-card">
            <div
              className="stitch-card-header stitch-card-header--clickable"
              onClick={() => setProgressCollapsed((prev) => !prev)}
              role="button"
              tabIndex={0}
            >
              <h5>
                <i className="ri-bar-chart-grouped-line me-2 text-primary"></i>
                {t("annotatorDash.projectProgress")}
              </h5>
              <div className="d-flex align-items-center gap-2">
                {progressData.length > 0 && (
                  <span className="badge bg-primary bg-opacity-10 text-primary stitch-badge">
                    {progressData.length} {t("annotatorDash.project")}
                  </span>
                )}
                <i
                  className={`ri-arrow-${progressCollapsed ? "down" : "up"}-s-line fs-5`}
                ></i>
              </div>
            </div>
            {!progressCollapsed && (
              <div className="card-body">
                {projectProgress.isLoading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    ></div>
                    {t("annotatorDash.loadingProgress")}
                  </div>
                ) : progressData.length > 0 ? (
                  <>
                    <p className="text-muted small mb-3">
                      <i className="ri-information-line me-1"></i>
                      <strong>Annotator</strong> = (Submitted + Approved) /
                      Total | <strong className="ms-1">Reviewer</strong> =
                      (Approved + Rejected) / Total |{" "}
                      <strong className="ms-1">Overall</strong> = Approved /
                      Total
                    </p>
                    <div
                      className="annotator-dash-scroll"
                      style={{ maxHeight: 480 }}
                    >
                      {progressData.map((pp) => {
                        const isCollapsed = !!collapsedProjects[pp.projectId];
                        return (
                          <div
                            key={pp.projectId}
                            className="stitch-progress-item"
                          >
                            {}
                            <div
                              className="d-flex justify-content-between align-items-center mb-2 stitch-progress-item__header"
                              onClick={() =>
                                setCollapsedProjects((prev) => ({
                                  ...prev,
                                  [pp.projectId]: !prev[pp.projectId],
                                }))
                              }
                              role="button"
                              tabIndex={0}
                            >
                              <h6
                                className="mb-0 fw-semibold d-flex align-items-center gap-1"
                                style={{ fontSize: "0.9rem" }}
                              >
                                <i
                                  className={`ri-arrow-${isCollapsed ? "right" : "down"}-s-line text-muted`}
                                ></i>
                                <i className="ri-folder-line text-primary"></i>
                                {pp.projectName}
                              </h6>
                              <span
                                className={`badge stitch-badge bg-${getProjectStatusTone(pp.status)}`}
                              >
                                {pp.status === "Completed" && (
                                  <i className="ri-checkbox-circle-line me-1"></i>
                                )}
                                {pp.status === "Expired" && (
                                  <i className="ri-time-line me-1"></i>
                                )}
                                {pp.status === "AwaitingManagerConfirmation" && (
                                  <i className="ri-time-line me-1"></i>
                                )}
                                {pp.status !== "Completed" &&
                                  pp.status !== "AwaitingManagerConfirmation" &&
                                  pp.status !== "Expired" && (
                                    <i className="ri-loader-4-line me-1"></i>
                                  )}
                                {getTaskStatusLabel(pp.status)}
                              </span>
                            </div>

                            {}
                            {!isCollapsed && (
                              <div className="ps-3">
                                {}
                                <div className="mb-2">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small className="fw-semibold">
                                      <span className="badge bg-primary stitch-badge me-1">
                                        Annotator
                                      </span>
                                      Submitted + Approved
                                    </small>
                                    <small
                                      className="fw-bold"
                                      style={{
                                        color: getProgressColor(
                                          pp.annotator.progress,
                                        ),
                                      }}
                                    >
                                      {pp.annotator.done}/{pp.annotator.total} (
                                      {pp.annotator.progress}%)
                                    </small>
                                  </div>
                                  <div className="progress stitch-progress">
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${pp.annotator.progress}%`,
                                        backgroundColor: "#3B82F6",
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                {}
                                <div className="mb-2">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small className="fw-semibold">
                                      <span className="badge bg-info stitch-badge me-1">
                                        Reviewer
                                      </span>
                                      Approved + Rejected
                                    </small>
                                    <small
                                      className="fw-bold"
                                      style={{
                                        color: getProgressColor(
                                          pp.reviewer.progress,
                                        ),
                                      }}
                                    >
                                      {pp.reviewer.done}/{pp.reviewer.total} (
                                      {pp.reviewer.progress}%)
                                    </small>
                                  </div>
                                  <div className="progress stitch-progress">
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${pp.reviewer.progress}%`,
                                        backgroundColor: "#06B6D4",
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                {}
                                <div>
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small className="fw-semibold">
                                      <span className="badge bg-success stitch-badge me-1">
                                        Overall
                                      </span>
                                      Approved / Total
                                    </small>
                                    <small
                                      className="fw-bold"
                                      style={{
                                        color: getProgressColor(
                                          pp.overall.progress,
                                        ),
                                      }}
                                    >
                                      {pp.overall.done}/{pp.overall.total} (
                                      {pp.overall.progress}%)
                                    </small>
                                  </div>
                                  <div className="progress stitch-progress">
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${pp.overall.progress}%`,
                                        backgroundColor: "#10B981",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="stitch-empty-state">
                    <i className="ri-bar-chart-grouped-line"></i>
                    <p>{t("annotatorDash.noProgressData")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card stitch-card">
            <div
              className="stitch-card-header stitch-card-header--clickable"
              onClick={() => setTaskListCollapsed((prev) => !prev)}
              role="button"
              tabIndex={0}
            >
              <h5>
                <i className="ri-image-line me-2 text-info"></i>
                {t("annotatorDash.imageListByProject")}
              </h5>
              <i
                className={`ri-arrow-${taskListCollapsed ? "down" : "up"}-s-line fs-5`}
              ></i>
            </div>

            {!taskListCollapsed && (
              <div className="card-body">
                <div className="mb-4">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {t("annotatorDash.selectProject")}
                  </label>
                  <select
                    className="form-select stitch-select"
                    value={activeProjectId || ""}
                    onChange={(e) =>
                      setProjectId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">{t("annotatorDash.selectProject")}</option>
                    {projects.data?.map((p) => (
                      <option key={p.projectId} value={p.projectId}>
                        {p.projectName} ({p.completedImages}/{p.totalImages}{" "}
                        {t("annotatorDash.imageUnit")})
                      </option>
                    ))}
                  </select>
                </div>

                {}
                <div
                  className="annotator-dash-scroll"
                  style={{ maxHeight: 420 }}
                >
                  {tasksByProject.isLoading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border spinner-border-sm text-primary me-2"
                        role="status"
                      ></div>
                      {t("annotatorDashboardComp.loadingImages")}
                    </div>
                  ) : !tasksByProject.data ||
                    tasksByProject.data.length === 0 ? (
                    <p className="text-muted">
                      {t("annotatorDashboardComp.noImages")}
                    </p>
                  ) : (
                    <table className="table table-bordered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: 80 }}>
                            {t("annotatorDashboardComp.colId")}
                          </th>
                          <th>{t("annotatorDashboardComp.colData")}</th>
                          <th style={{ width: 130 }}>
                            {t("annotatorDashboardComp.colStatus")}
                          </th>
                          <th style={{ width: 120 }}>
                            {t("annotatorDashboardComp.colDeadline")}
                          </th>
                          <th style={{ width: 100 }}>
                            {t("annotatorDashboardComp.colAction")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasksByProject.data.map((task) => {
                          const isLocked =
                            task.status === "Submitted" ||
                            task.status === "Approved";
                          return (
                            <tr key={`${task.id}-${task.dataItemId ?? "img"}`}>
                              <td>{task.id}</td>
                              <td>
                                {task.dataItemUrl
                                  ? task.dataItemUrl.split("/").pop()
                                  : `${t("annotatorDashboardComp.itemPrefix")} #${task.dataItemId}`}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    task.status === "Assigned"
                                      ? "bg-secondary"
                                      : task.status === "InProgress"
                                        ? "bg-primary"
                                        : task.status === "Submitted"
                                          ? "bg-info"
                                          : task.status === "Approved"
                                            ? "bg-success"
                                            : task.status === "Rejected"
                                              ? "bg-danger"
                                              : "bg-dark"
                                  }`}
                                >
                                  {getTaskStatusLabel(task.status)}
                                </span>
                              </td>
                              <td>
                                {task.deadline
                                  ? new Date(task.deadline).toLocaleDateString(
                                      localeTag,
                                    )
                                  : t("annotatorDash.notAvailable")}
                              </td>
                              <td>
                                {isLocked ? (
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled
                                    title={t("annotatorDash.taskLockedTitle")}
                                  >
                                    <i className="ri-lock-line me-1"></i>
                                    {t("annotatorDash.lockedAction")}
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      const workspaceUrl = buildAnnotatorWorkspaceUrl(
                                        activeProjectId,
                                        task,
                                      );
                                      if (workspaceUrl) {
                                        navigate(workspaceUrl);
                                      }
                                    }}
                                  >
                                    <i className="ri-external-link-line me-1"></i>
                                    {t("annotatorDash.openAction")}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="row mt-4 mb-4">
        <div className="col-12">
          <div className="card stitch-card">
            <div
              className="stitch-card-header stitch-card-header--clickable"
              onClick={() => setFeedbackCollapsed((prev) => !prev)}
              role="button"
              tabIndex={0}
            >
              <h5>
                <i className="ri-chat-3-line me-2 text-warning"></i>
                {t("annotatorDashboardComp.reviewerFeedback")}
              </h5>
              <div className="d-flex align-items-center gap-2">
                {(reviewerFeedback.data || []).length > 0 && (
                  <span className="badge bg-warning bg-opacity-10 text-warning stitch-badge">
                    {reviewerFeedback.data.length} {t("annotatorDashboardComp.feedbackCount")}
                  </span>
                )}
                <i
                  className={`ri-arrow-${feedbackCollapsed ? "down" : "up"}-s-line fs-5`}
                ></i>
              </div>
            </div>
            {!feedbackCollapsed && (
              <div
                className="card-body annotator-dash-scroll"
                style={{ maxHeight: 400 }}
              >
                <ReviewerFeedbackTable
                  data={reviewerFeedback.data || []}
                  loading={reviewerFeedback.isLoading}
                  onOpenTask={handleOpenFeedbackTask}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnnotatorDashboard;
