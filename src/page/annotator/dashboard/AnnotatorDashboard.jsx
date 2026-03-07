import { useEffect, useMemo, useState } from "react";
import useAnnotatorDashboard from "../../../hooks/annotator/dashboard/useAnnotatorDashboard";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import TaskTable from "../../../components/annotator/dashboard/TaskTable";
import ReviewerFeedbackTable from "../../../components/annotator/dashboard/ReviewerFeedbackTable";
import StatCard from "../../../components/annotator/dashboard/StatCard";

const AnnotatorDashboard = () => {
  const [projectId, setProjectId] = useState(null);

  const {
    profile,
    projects,
    tasksByProject,
    reviewerFeedback,
    projectProgress,
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
    };
  }, [projects.data]);

  const kqs = useMemo(() => {
    const feedbackList = reviewerFeedback.data || [];
    if (feedbackList.length === 0) return null;

    const scores = feedbackList
      .filter((f) => f.qualityScore != null)
      .map((f) => f.qualityScore);

    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [reviewerFeedback.data]);

  const isLoadingStats = projects.isLoading;
  const progressData = projectProgress.data || [];

  const getProgressColor = (value) => {
    if (value >= 80) return "#0ab39c";
    if (value >= 50) return "#f7b84b";
    return "#f06548";
  };

  return (
    <DashboardLayout title="Dashboard" className="page-content">
      <h4>Welcome, {profile?.data?.fullName}</h4>

      <div className="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-4 mt-3">
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
          title="KQS"
          value={kqs !== null ? kqs : "N/A"}
          icon="ri-star-line"
          color={
            kqs !== null && kqs >= 80
              ? "success"
              : kqs !== null && kqs >= 50
                ? "warning"
                : "info"
          }
          loading={reviewerFeedback.isLoading}
        />
      </div>

      {/* Project Progress Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">
                <i className="ri-bar-chart-grouped-line me-2 text-primary"></i>
                Tiến độ dự án
              </h5>
            </div>
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
                <div className="table-responsive">
                  <p className="text-muted small mb-3">
                    <i className="ri-information-line me-1"></i>
                    <strong>Annotator</strong> = (Submitted + Approved) / Total
                    |<strong className="ms-1">Reviewer</strong> = (Approved +
                    Rejected) / Total |<strong className="ms-1">Overall</strong>{" "}
                    = Approved / Total
                  </p>
                  {progressData.map((pp) => (
                    <div
                      key={pp.projectId}
                      className="mb-4 p-3 border rounded bg-light"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 fw-semibold">
                          <i className="ri-folder-line me-1 text-primary"></i>
                          {pp.projectName}
                        </h6>
                        <span
                          className={`badge bg-${
                            pp.status === "Completed"
                              ? "success"
                              : pp.status === "Expired"
                                ? "danger"
                                : "warning"
                          }`}
                        >
                          {pp.status}
                        </span>
                      </div>

                      {/* Annotator Progress */}
                      <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-semibold">
                            <span
                              className="badge bg-primary me-1"
                              style={{ fontSize: "0.65em" }}
                            >
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
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${pp.annotator.progress}%`,
                              backgroundColor: "#405189",
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Reviewer Progress */}
                      <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-semibold">
                            <span
                              className="badge bg-info me-1"
                              style={{ fontSize: "0.65em" }}
                            >
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
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${pp.reviewer.progress}%`,
                              backgroundColor: "#299cdb",
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Overall Progress */}
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-semibold">
                            <span
                              className="badge bg-success me-1"
                              style={{ fontSize: "0.65em" }}
                            >
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
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${pp.overall.progress}%`,
                              backgroundColor: "#0ab39c",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="ri-bar-chart-grouped-line display-5 mb-3 d-block"></i>
                  <p>Chưa có dữ liệu tiến độ dự án.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Danh sách ảnh theo dự án</h5>
            </div>

            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-bold">Dự án</label>
                <select
                  className="form-select"
                  value={projectId || ""}
                  onChange={(e) =>
                    setProjectId(e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">Chọn dự án</option>
                  {projects.data?.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectName} ({p.completedImages}/{p.totalImages} ảnh)
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
