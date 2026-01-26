import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import taskService from "../../../services/annotator/labeling/taskService";
import { toast } from "react-toastify";

const AnnotatorTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
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
        toast.error("Không thể tải danh sách nhiệm vụ");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-3">Nhiệm vụ gán nhãn của tôi</h4>

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
                  {task.completedImages}/{task.totalImages} ảnh hoàn thành
                </p>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Tiến độ</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className={`progress-bar bg-${statusColor(task.status)}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                <p className="text-muted small mb-3">
                  <i className="ri-time-line me-1" />
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "N/A"}
                </p>

                <button
                  className="btn btn-primary w-100"
                  disabled={task.status === "Completed"}
                  onClick={() =>
                    navigate(`/workplace-labeling-task/${task.assignmentId}`)
                  }
                >
                  {task.status === "Completed" ? "Đã hoàn thành" : "Tiếp tục"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotatorTaskList;
