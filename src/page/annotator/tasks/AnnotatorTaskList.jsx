import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import taskService from "../../../services/annotator/labeling/taskService";
import { toast } from "react-toastify";

const groupTasksByAssignment = (tasks) => {
  const map = {};

  tasks.forEach((t) => {
    if (!map[t.assignmentId]) {
      map[t.assignmentId] = {
        assignmentId: t.assignmentId,
        projectName: t.projectName,
        status: t.status,
        deadline: t.deadline,
        totalImages: 0,
      };
    }
    map[t.assignmentId].totalImages += 1;
  });

  return Object.values(map);
};

const AnnotatorTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // 👉 API ĐÚNG: trả về từng ảnh
        const res = await taskService.getMyTasks();

        const rawTasks = res.data || [];
        const groupedTasks = groupTasksByAssignment(rawTasks);

        setTasks(groupedTasks);
      } catch (error) {
        console.error("Lỗi khi tải nhiệm vụ:", error);
        toast.error("Không thể tải danh sách nhiệm vụ");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col-12 text-start">
          <h4 className="mb-0 fw-bold">Nhiệm vụ gán nhãn của tôi</h4>
          <p className="text-muted small">
            Chọn một nhiệm vụ bên dưới để bắt đầu làm việc ({tasks.length} nhiệm
            vụ).
          </p>
        </div>
      </div>

      <div className="row">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div className="col-xl-3 col-md-6 mb-4" key={task.assignmentId}>
              <div className="card card-animate shadow-sm h-100 border-0">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="flex-grow-1">
                      <span className="badge bg-light text-primary text-uppercase">
                        ID: {task.assignmentId}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`badge ${
                          task.status === "Completed"
                            ? "bg-success"
                            : task.status === "InProgress"
                              ? "bg-warning"
                              : "bg-info"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <h5 className="fs-15 text-dark text-truncate mb-2 fw-semibold">
                    {task.projectName || `Dự án #${task.assignmentId}`}
                  </h5>

                  <div className="text-muted mb-2 small">
                    <i className="ri-image-line me-1"></i>
                    Số lượng:{" "}
                    <span className="fw-bold text-primary">
                      {task.totalImages} hình ảnh
                    </span>
                  </div>

                  <div className="text-muted mb-4 small">
                    <i className="ri-time-line me-1"></i>
                    Deadline:{" "}
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : "N/A"}
                  </div>

                  <button
                    className="btn btn-primary w-100 shadow-none py-2"
                    onClick={() =>
                      navigate(`/workplace-labeling-task/${task.assignmentId}`)
                    }
                  >
                    Làm việc ({task.totalImages} ảnh)
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <i className="ri-inbox-archive-line display-4 text-muted"></i>
            <p className="mt-2 text-muted fw-medium">
              Bạn hiện chưa có nhiệm vụ nào được giao.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotatorTaskList;
