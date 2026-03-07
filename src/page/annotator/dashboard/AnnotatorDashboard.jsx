import { useEffect, useMemo, useState } from "react";
import useAnnotatorDashboard from "../../../hooks/annotator/dashboard/useAnnotatorDashboard";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import TaskTable from "../../../components/annotator/dashboard/TaskTable";
import ReviewerFeedbackTable from "../../../components/annotator/dashboard/ReviewerFeedbackTable";
import StatCard from "../../../components/annotator/dashboard/StatCard";

const AnnotatorDashboard = () => {
  const [projectId, setProjectId] = useState(null);

  const { profile, projects, tasksByProject, reviewerFeedback } =
    useAnnotatorDashboard(projectId);

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
