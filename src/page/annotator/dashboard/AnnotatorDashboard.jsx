import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import useAnnotatorDashboard from "../../../hooks/annotator/dashboard/useAnnotatorDashboard";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import TaskTable from "../../../components/annotator/dashboard/TaskTable";
import ReviewerFeedbackTable from "../../../components/annotator/dashboard/ReviewerFeedbackTable";
import StatCard from "../../../components/annotator/dashboard/StatCard";
import useSignalRRefresh from "../../../hooks/useSignalRRefresh";

const AnnotatorDashboard = () => {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState(null);
  const queryClient = useQueryClient();

  // Realtime: invalidate all annotator queries when notification arrives
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["assigned-projects"] });
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["reviewer-feedback"] });
    queryClient.invalidateQueries({ queryKey: ["project-progress-details"] });
    queryClient.invalidateQueries({ queryKey: ["my-accuracy"] });
  }, [queryClient]);

  useSignalRRefresh(handleRefresh);

  useEffect(() => {
    const pageContent = document.querySelector(".page-content");
    if (pageContent) pageContent.classList.add("dashboard-flush");
    return () => {
      if (pageContent) pageContent.classList.remove("dashboard-flush");
    };
  }, []);

  const {
    profile,
    projects,
    tasksByProject,
    reviewerFeedback,
    projectProgress,
    myAccuracy,
  } = useAnnotatorDashboard(projectId);

  useEffect(() => {
    if (projects.data?.length > 0 && projectId !== projects.data[0].projectId) {
      setProjectId(projects.data[0].projectId);
    }
  }, [projects.data, projectId]);

  const stats = useMemo(() => {
    const projectList = projects.data || [];
    return {
      assigned: projectList.length,
      completed: projectList.filter((p) => p.status === "Completed").length,
      inProgress: projectList.filter(
        (p) => p.status === "Active" || p.status === "InProgress",
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
    return myAccuracy.data?.perProject || [];
  }, [myAccuracy.data]);

  const isLoadingStats = projects.isLoading;
  const progressData = projectProgress.data || [];

  const getProgressColor = (value) => {
    if (value >= 80) return "#10B981";
    if (value >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const getBadgeColor = (value) => {
    if (value >= 80) return "success";
    if (value >= 50) return "warning";
    return "danger";
  };

  return (
    <DashboardLayout
      title={t("annotatorDash.title")}
      subtitle={`${t("annotatorDash.welcome")}, ${profile?.data?.fullName || "Annotator"}`}
      style={{ padding: 0 }}
    >
      {/* ===== Stat Cards Grid ===== */}
      <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3">
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
          value={accuracy !== null ? `${accuracy}%` : t("statusCommon.notAvailable")}
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

      {/* ===== Accuracy by Project ===== */}
      {perProjectAccuracy.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card stitch-card">
              <div className="stitch-card-header">
                <h5>
                  <i className="ri-focus-2-line me-2 text-primary"></i>
                  {t("annotatorDash.accuracyByProject")}
                </h5>
                {accuracy !== null && (
                  <span
                    className={`badge bg-${getBadgeColor(accuracy)} stitch-badge`}
                  >
                    {t("annotatorDash.averageLabel")}: {accuracy}%
                  </span>
                )}
              </div>
              <div className="card-body">
                <p className="text-muted small mb-3">
                  <i className="ri-information-line me-1"></i>
                  {t("annotatorDash.accuracyDesc")}
                </p>
                <div className="table-responsive">
                  <table className="table table-hover stitch-table align-middle mb-0">
                    <thead>
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
                            <td className="text-center">{pa.tasksAssigned}</td>
                            <td
                              className="text-center fw-bold"
                              style={{ color: "#10B981" }}
                            >
                              {pa.tasksCompleted}
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge stitch-badge bg-${
                                  pa.accuracy > 0
                                    ? getBadgeColor(pa.accuracy)
                                    : pa.tasksCompleted > 0
                                      ? "danger"
                                      : "secondary"
                                }`}
                              >
                                {pa.accuracy > 0
                                  ? `${pa.accuracy}%`
                                  : pa.tasksCompleted > 0
                                    ? "0%"
                                    : "—"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress stitch-progress flex-grow-1">
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
                                <small
                                  className="fw-bold"
                                  style={{
                                    minWidth: 36,
                                    color: getProgressColor(taskRate),
                                  }}
                                >
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
            </div>
          </div>
        </div>
      )}

      {/* ===== Project Progress ===== */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card stitch-card">
            <div className="stitch-card-header">
              <h5>
                <i className="ri-bar-chart-grouped-line me-2 text-primary"></i>
                {t("annotatorDash.projectProgress")}
              </h5>
            </div>
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
                    <strong>Annotator</strong> = {t('statusCommon.formulaAnnotator')}
                    | <strong className="ms-1">Reviewer</strong> = {t('statusCommon.formulaReviewer')} |{" "}
                    <strong className="ms-1">{t('statusCommon.overall')}</strong> = {t('statusCommon.formulaOverall')}
                  </p>
                  {progressData.map((pp) => (
                    <div key={pp.projectId} className="stitch-progress-item">
                      {/* Project header */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6
                          className="mb-0 fw-semibold"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <i className="ri-folder-line me-1 text-primary"></i>
                          {pp.projectName}
                        </h6>
                        <span
                          className={`badge stitch-badge bg-${
                            pp.status === "Completed"
                              ? "success"
                              : pp.status === "Expired"
                                ? "danger"
                                : "warning"
                          }`}
                        >
                          {pp.status === "Completed" && (
                            <i className="ri-checkbox-circle-line me-1"></i>
                          )}
                          {pp.status === "Expired" && (
                            <i className="ri-time-line me-1"></i>
                          )}
                          {pp.status !== "Completed" &&
                            pp.status !== "Expired" && (
                              <i className="ri-loader-4-line me-1"></i>
                            )}
                          {pp.status}
                        </span>
                      </div>

                      {/* Annotator progress */}
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
                              color: getProgressColor(pp.annotator.progress),
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

                      {/* Reviewer progress */}
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
                              color: getProgressColor(pp.reviewer.progress),
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

                      {/* Overall progress */}
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
                              color: getProgressColor(pp.overall.progress),
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
                  ))}
                </>
              ) : (
                <div className="stitch-empty-state">
                  <i className="ri-bar-chart-grouped-line"></i>
                  <p>{t("annotatorDash.noProgressData")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Task List by Project ===== */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card stitch-card">
            <div className="stitch-card-header">
              <h5>
                <i className="ri-image-line me-2 text-info"></i>
                {t("annotatorDash.imageListByProject")}
              </h5>
            </div>

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
                  value={projectId || ""}
                  onChange={(e) =>
                    setProjectId(e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">{t("annotatorDash.selectProject")}</option>
                  {projects.data?.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectName} ({p.completedImages}/{p.totalImages} {t("annotatorDash.imageUnit")})
                    </option>
                  ))}
                </select>
              </div>

              <TaskTable
                loading={tasksByProject.isLoading}
                data={tasksByProject.data || []}
              />
            </div>
          </div>
        </div>
      </div>

      <ReviewerFeedbackTable
        loading={reviewerFeedback.isLoading}
        data={reviewerFeedback.data || []}
      />
    </DashboardLayout>
  );
};

export default AnnotatorDashboard;
