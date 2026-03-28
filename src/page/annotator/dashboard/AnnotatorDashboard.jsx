import { useEffect, useMemo, useState, useCallback } from "react";
import "../../../assets/css/AnnotatorDashboard.css";
import useAnnotatorDashboard from "../../../hooks/annotator/dashboard/useAnnotatorDashboard";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import TaskTable from "../../../components/annotator/dashboard/TaskTable";
import ReviewerFeedbackTable from "../../../components/annotator/dashboard/ReviewerFeedbackTable";
import StatCard from "../../../components/annotator/dashboard/StatCard";

const AnnotatorDashboard = () => {
  const [projectId, setProjectId] = useState(null);
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const [progressCollapsed, setProgressCollapsed] = useState(false);
  const [taskListCollapsed, setTaskListCollapsed] = useState(false);
  const [feedbackCollapsed, setFeedbackCollapsed] = useState(false);
  const [accuracyCollapsed, setAccuracyCollapsed] = useState(false);

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
    if (value >= 80) return "#0ab39c";
    if (value >= 50) return "#f7b84b";
    return "#f06548";
  };

  const getBadgeColor = (value) => {
    if (value >= 80) return "success";
    if (value >= 50) return "warning";
    return "danger";
  };

  return (
    <DashboardLayout title="Dashboard" className="page-content">
      <h4>Welcome, {profile?.data?.fullName}</h4>

      <div className="row row-cols-1 row-cols-md-3 row-cols-xl-6 g-3 mt-3">
        <StatCard
          title="Dự án được giao"
          value={stats.assigned}
          icon="ri-folder-line"
          color="primary"
          loading={isLoadingStats}
        />
        <StatCard
          title="Đã hoàn thành"
          value={stats.completed}
          icon="ri-checkbox-circle-line"
          color="success"
          loading={isLoadingStats}
        />
        <StatCard
          title="Đang thực hiện"
          value={stats.inProgress}
          icon="ri-loader-4-line"
          color="warning"
          loading={isLoadingStats}
        />
        <StatCard
          title="Hết hạn"
          value={stats.expired}
          icon="ri-time-line"
          color="danger"
          loading={isLoadingStats}
        />
        <StatCard
          title="Ảnh đã xong"
          value={`${stats.completedImages}/${stats.totalImages}`}
          icon="ri-image-line"
          color="info"
          loading={isLoadingStats}
        />
        <StatCard
          title="Accuracy"
          value={accuracy !== null ? `${accuracy}%` : "N/A"}
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
                  Độ chính xác theo dự án
                </h5>
                <div className="d-flex align-items-center gap-2">
                  {accuracy !== null && (
                    <span
                      className={`badge bg-${getBadgeColor(accuracy)} bg-opacity-10 text-${getBadgeColor(accuracy)} stitch-badge`}
                    >
                      Trung bình: {accuracy}%
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
                    Accuracy = % ảnh bạn gán nhãn được Manager xác nhận đúng /
                    Tổng ảnh Manager đã đánh giá.
                  </p>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Dự án</th>
                          <th className="text-center">Tasks giao</th>
                          <th className="text-center">Tasks xong</th>
                          <th className="text-center">Accuracy</th>
                          <th style={{ minWidth: "180px" }}>Tiến độ</th>
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
                Tiến độ dự án
              </h5>
              <div className="d-flex align-items-center gap-2">
                {progressData.length > 0 && (
                  <span className="badge bg-primary bg-opacity-10 text-primary stitch-badge">
                    {progressData.length} {"dự án"}
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
                    Đang tải tiến độ...
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
                    <p>Chưa có dữ liệu tiến độ dự án.</p>
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
                Danh sách ảnh theo dự án
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
                    Chọn dự án
                  </label>
                  <select
                    className="form-select stitch-select"
                    value={projectId || ""}
                    onChange={(e) =>
                      setProjectId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">Chọn dự án</option>
                    {projects.data?.map((p) => (
                      <option key={p.projectId} value={p.projectId}>
                        {p.projectName} ({p.completedImages}/{p.totalImages}{" "}
                        ảnh)
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
                      Đang tải danh sách ảnh...
                    </div>
                  ) : !tasksByProject.data ||
                    tasksByProject.data.length === 0 ? (
                    <p className="text-muted">
                      Chưa có ảnh nào trong dự án này.
                    </p>
                  ) : (
                    <table className="table table-bordered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: 80 }}>ID</th>
                          <th>Data</th>
                          <th style={{ width: 130 }}>Status</th>
                          <th style={{ width: 120 }}>Deadline</th>
                          <th style={{ width: 100 }}>Tool</th>
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
                                  : `Item #${task.dataItemId}`}
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
                                  {task.status}
                                </span>
                              </td>
                              <td>
                                {task.deadline
                                  ? new Date(task.deadline).toLocaleDateString(
                                      "vi-VN",
                                    )
                                  : "N/A"}
                              </td>
                              <td>
                                {isLocked ? (
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled
                                    title="Task đã hoàn tất, không thể chỉnh sửa"
                                  >
                                    <i className="ri-lock-line me-1"></i>
                                    Locked
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      if (task.id) {
                                        window.location.href = `/workplace-labeling-task/${task.id}`;
                                      }
                                    }}
                                  >
                                    <i className="ri-external-link-line me-1"></i>
                                    Open
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
                Phản hồi từ Reviewer
              </h5>
              <div className="d-flex align-items-center gap-2">
                {(reviewerFeedback.data || []).length > 0 && (
                  <span className="badge bg-warning bg-opacity-10 text-warning stitch-badge">
                    {reviewerFeedback.data.length} phản hồi
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
                <ReviewerFeedbackTable data={reviewerFeedback.data || []} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnnotatorDashboard;
