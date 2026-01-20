import { useState } from "react";
import useAnnotatorDashboard from "../../../hooks/annotator/dashboard/useAnnotatorDashboard";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import StatCard from "../../../components/annotator/dashboard/StatCard";
import TaskTable from "../../../components/annotator/dashboard/TaskTable";
import ReviewerFeedbackTable from "../../../components/annotator/dashboard/ReviewerFeedbackTable";

const AnnotatorDashboard = () => {
  const [projectId, setProjectId] = useState(null);

  const { profile, stats, projects, tasksByProject, reviewerFeedback } =
    useAnnotatorDashboard(projectId);

  const dashboardStats = stats.data || [];

  console.log("reviewer", reviewerFeedback);

  return (
    <DashboardLayout title="My Dashboard" className="page-content">
      <h4>Welcome, {profile.data?.name}</h4>

      {/* KPI */}
      <div className="row">
        <StatCard title="Assigned" value={dashboardStats.totalAssigned} />
        <StatCard title="In Progress" value={dashboardStats.inProgress} />
        <StatCard title="Pending Review" value={dashboardStats.pendingReview} />
        <StatCard title="Returned" value={dashboardStats.returned} />
      </div>

      {/* My Assigned Tasks */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">My Assigned Tasks</h5>
            </div>

            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-bold">Project</label>
                <select
                  className="form-select"
                  value={projectId || ""}
                  onChange={(e) =>
                    setProjectId(e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">Select Project</option>
                  {Array.isArray(projects.data) &&
                    projects.data.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
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

      {/* Reviewer Feedback – ĐỘC LẬP */}
      <ReviewerFeedbackTable
        loading={reviewerFeedback.isLoading}
        data={reviewerFeedback.data?.data || []}
      />
    </DashboardLayout>
  );
};

export default AnnotatorDashboard;
