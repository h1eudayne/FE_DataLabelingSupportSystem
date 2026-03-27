import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import taskService from "../../../services/annotator/labeling/taskService";
import { toast } from "react-toastify";
import useSignalRRefresh from "../../../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";

const AnnotatorTaskList = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await taskService.getMyProjects();

      const projects = (res.data || []).map((p) => ({
        assignmentId: p.projectId,
        projectName: p.projectName,
        description: p.description,
        deadline: p.deadline,
        assignedDate: p.assignedDate,

        status: p.status,
        progress: Number(p.progressPercent ?? 0),

        totalImages: p.totalImages ?? 0,
        completedImages: p.completedImages ?? 0,

        thumbnailUrl: p.thumbnailUrl,
      }));

      setTasks(projects);
    } catch (err) {
      console.error(err);
      toast.error(t("annotatorTasks.loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [location.key, fetchTasks]);

  // Realtime: auto-refetch when notification arrives
  useSignalRRefresh(fetchTasks);

  const getRemainingTime = (deadline) => {
    if (!deadline) return { text: "N/A", color: "text-muted", icon: "ri-time-line" };
    const now = new Date();
    const dl = new Date(deadline);
    const diffMs = dl - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: t("annotatorTasks.overdue", { days: Math.abs(diffDays), defaultValue: `Overdue ${Math.abs(diffDays)}d` }), color: "text-danger", icon: "ri-error-warning-line" };
    }
    if (diffDays === 0) {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return { text: t("annotatorTasks.dueToday", { hours: Math.max(0, diffHours), defaultValue: `Due today (${Math.max(0, diffHours)}h)` }), color: "text-danger", icon: "ri-alarm-warning-line" };
    }
    if (diffDays <= 3) {
      return { text: t("annotatorTasks.daysLeft", { days: diffDays, defaultValue: `${diffDays}d left` }), color: "text-warning", icon: "ri-timer-flash-line" };
    }
    return { text: t("annotatorTasks.daysLeft", { days: diffDays, defaultValue: `${diffDays}d left` }), color: "text-success", icon: "ri-time-line" };
  };

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "InProgress":
        return "warning";
      case "Assigned":
        return "info";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const totalImages = tasks.reduce((sum, t) => sum + t.totalImages, 0);
  const completedImages = tasks.reduce((sum, t) => sum + t.completedImages, 0);
  const inProgressCount = tasks.filter((t) => t.status === "InProgress").length;

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-3">{t("annotatorTasks.title")}</h4>

      {/* Summary Stats Bar */}
      {tasks.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 text-center">
                <i className="ri-folder-line text-primary fs-4"></i>
                <h5 className="mb-0 fw-bold">{tasks.length}</h5>
                <small className="text-muted">{t("annotatorTasks.totalProjects", { defaultValue: "Projects" })}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 text-center">
                <i className="ri-image-line text-info fs-4"></i>
                <h5 className="mb-0 fw-bold">{totalImages}</h5>
                <small className="text-muted">{t("annotatorTasks.totalImages", { defaultValue: "Total Images" })}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 text-center">
                <i className="ri-check-double-line text-success fs-4"></i>
                <h5 className="mb-0 fw-bold">{completedImages}</h5>
                <small className="text-muted">{t("annotatorTasks.completed", { defaultValue: "Completed" })}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 text-center">
                <i className="ri-loader-line text-warning fs-4"></i>
                <h5 className="mb-0 fw-bold">{inProgressCount}</h5>
                <small className="text-muted">{t("annotatorTasks.inProgress", { defaultValue: "In Progress" })}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="ri-inbox-unarchive-line display-1 text-muted opacity-50"></i>
          </div>
          <h5 className="text-muted">{t("annotatorTasks.noTasks", { defaultValue: "No tasks assigned yet" })}</h5>
          <p className="text-muted small">
            {t("annotatorTasks.noTasksDesc", { defaultValue: "You will see your assigned projects here once a manager assigns tasks to you." })}
          </p>
        </div>
      ) : (
        <div className="row">
          {tasks.map((task) => (
            <div className="col-xl-3 col-md-6 mb-4" key={task.assignmentId}>
              <div className="card h-100 shadow-sm border-0">
                {task.thumbnailUrl && (
                  <img
                    src={task.thumbnailUrl}
                    className="card-img-top"
                    alt="thumbnail"
                    style={{ height: 160, objectFit: "cover" }}
                  />
                )}

                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="badge bg-light text-primary">
                      ID: {task.assignmentId}
                    </span>
                    <span className={`badge bg-${statusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  <h5 className="fs-15 fw-semibold text-truncate">
                    {task.projectName}
                  </h5>

                  <p className="text-muted small mb-2">
                    {task.completedImages}/{task.totalImages} {t("annotatorTasks.imagesCompleted")}
                  </p>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{t("annotatorTasks.progress")}</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className={`progress-bar bg-${statusColor(task.status)}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {(() => {
                    const remaining = getRemainingTime(task.deadline);
                    return (
                      <div className="mb-3">
                        <div className={`d-flex align-items-center gap-1 small fw-semibold ${remaining.color}`}>
                          <i className={remaining.icon} />
                          <span>{remaining.text}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: "11px" }}>
                          <i className="ri-calendar-line me-1" />
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    className="btn btn-primary w-100"
                    disabled={task.status === "Completed" && task.progress >= 100}
                    onClick={() =>
                      navigate(`/annotator-project-packs/${task.assignmentId}`)
                    }
                  >
                    {task.status === "Completed" && task.progress >= 100
                      ? t("annotatorTasks.done")
                      : task.status === "Completed"
                        ? t("annotatorTasks.review")
                        : t("annotatorTasks.continue")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnotatorTaskList;
