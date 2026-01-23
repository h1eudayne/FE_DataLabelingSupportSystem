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
        const response = await taskService.getMyAssignments();
        setTasks(response.data?.data || response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải nhiệm vụ:", error);
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải nhiệm vụ...</span>
        </div>
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
        {tasks.map((task) => (
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
                      className={`badge ${task.status === "Submitted" ? "bg-success" : "bg-warning"}`}
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
                  Ngày giao:{" "}
                  {task.assignedDate
                    ? new Date(task.assignedDate).toLocaleDateString()
                    : "N/A"}
                </div>
                <button
                  className="btn btn-primary w-100 shadow-none py-2"
                  onClick={() => {
                    const targetId = task.assignmentId || task.id;

                    if (targetId) {
                      navigate(`/workplace-labeling-task/${targetId}`);
                    } else {
                      toast.error("Không tìm thấy ID nhiệm vụ!");
                      console.error("Task object missing ID:", task);
                    }
                  }}
                >
                  Làm việc ({task.totalImages} ảnh)
                </button>
              </div>
            </div>
          </div>
        ))}
        :{" "}
        {
          <div className="col-12 text-center py-5">
            <i className="ri-inbox-archive-line display-4 text-muted"></i>
            <p className="mt-2 text-muted fw-medium">
              Bạn hiện chưa có nhiệm vụ nào được giao.
            </p>
          </div>
        }
      </div>
    </div>
  );
};

export default AnnotatorTaskList;
