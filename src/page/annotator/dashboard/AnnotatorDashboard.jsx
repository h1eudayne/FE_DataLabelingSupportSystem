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
    if (projects.data?.length > 0 && !projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjectId(projects.data[0].projectId);
    }
  }, [projects.data, projectId]);

  const stats = useMemo(() => {
    const tasks = tasksByProject.data || [];

    return {
      assigned: tasks.length,
      inProgress: tasks.filter((t) => t.status === "InProgress").length,
      submitted: tasks.filter((t) => t.status === "Submitted").length,
      approved: tasks.filter((t) => t.status === "Approved").length,
      rejected: tasks.filter((t) => t.status === "Rejected").length,
    };
  }, [tasksByProject.data]);

  const isLoadingStats = tasksByProject.isLoading;

  return (
    <DashboardLayout title="My Dashboard" className="page-content">
      <h4>Welcome, {profile?.data?.fullName}</h4>

      <div className="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-4 mt-3">
        <StatCard
          title="Assigned"
          value={stats.assigned}
          icon="ri-task-line"
          color="primary"
          loading={isLoadingStats}
        />

        <StatCard
          title="Submitted"
          value={stats.submitted}
          icon="ri-checkbox-circle-line"
          color="success"
          loading={isLoadingStats}
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon="ri-loader-4-line"
          color="warning"
          loading={isLoadingStats}
        />

        <StatCard
          title="Approved"
          value={stats.approved}
          icon="ri-check-double-line"
          color="info"
          loading={isLoadingStats}
        />

        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon="ri-close-circle-line"
          color="danger"
          loading={isLoadingStats}
        />
      </div>

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
                  {projects.data?.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectName}
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
