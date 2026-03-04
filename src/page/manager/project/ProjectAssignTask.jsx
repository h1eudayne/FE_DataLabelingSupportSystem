import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import projectService from "../../../services/manager/project/projectService";
import { userService } from "../../../services/manager/project/userService";
import taskService from "../../../services/manager/project/taskService";
import Swal from "sweetalert2";

const ProjectAssignTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [annotators, setAnnotators] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedAnnotator, setSelectedAnnotator] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    projectService
      .getProjectDetail(id)
      .then((res) => {
        setProjectInfo(res.data);
      })
      .finally(() => setLoading(false));

    userService.getUsers().then((res) => {
      const annotatorList = res.data.filter(
        (u) => u.role?.toLowerCase() === "annotator",
      );
      const reviewerList = res.data.filter(
        (u) => u.role?.toLowerCase() === "reviewer",
      );
      setAnnotators(annotatorList);
      setReviewers(reviewerList);
    });
  }, [id]);

  const handleAssign = async () => {
    if (!selectedAnnotator) {
      return Swal.fire("Cảnh báo", "Vui lòng chọn Annotator!", "warning");
    }
    if (!selectedReviewer) {
      return Swal.fire("Cảnh báo", "Vui lòng chọn Reviewer!", "warning");
    }
    if (!quantity || Number(quantity) <= 0) {
      return Swal.fire(
        "Cảnh báo",
        "Vui lòng nhập số lượng ảnh hợp lệ!",
        "warning",
      );
    }

    setLoading(true);
    try {
      await taskService.assignTask({
        projectId: Number(id),
        annotatorId: String(selectedAnnotator),
        quantity: Number(quantity),
        reviewerId: String(selectedReviewer),
      });

      Swal.fire("Thành công!", "Giao việc thành công!", "success");
      navigate("/projects-all-projects");
    } catch (error) {
      console.error("Chi tiết lỗi API:", error.response?.data);
      Swal.fire(
        "Lỗi!",
        error.response?.data?.message || "Không thể giao việc",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !projectInfo)
    return <div className="p-5 text-center">Đang tải...</div>;

  const totalItems = projectInfo?.totalDataItems ?? 0;
  const assignedItems =
    projectInfo?.members?.reduce((sum, m) => sum + (m.tasksAssigned || 0), 0) ??
    0;
  const availableItems = totalItems - assignedItems;

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h4 className="mb-3">Phân công: {projectInfo?.name}</h4>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h6 className="card-title mb-0">Thông tin dự án</h6>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-4">
                    <p className="text-muted mb-1 small">Tổng ảnh</p>
                    <h5 className="text-primary">{totalItems}</h5>
                  </div>
                  <div className="col-md-4">
                    <p className="text-muted mb-1 small">Đã phân công</p>
                    <h5 className="text-warning">{assignedItems}</h5>
                  </div>
                  <div className="col-md-4">
                    <p className="text-muted mb-1 small">Còn trống</p>
                    <h5 className="text-success">{availableItems}</h5>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold mb-2">Nhãn dự án:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {projectInfo?.labels?.map((l) => (
                      <span
                        key={l.id}
                        className="badge"
                        style={{
                          backgroundColor: l.color + "20",
                          color: l.color,
                          border: `1px solid ${l.color}`,
                        }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>

                {projectInfo?.members?.length > 0 && (
                  <div>
                    <h6 className="fw-bold mb-2">Đã phân công:</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Tên</th>
                            <th>Vai trò</th>
                            <th>Tasks</th>
                            <th>Hoàn thành</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectInfo.members.map((m) => (
                            <tr key={m.id}>
                              <td>{m.fullName}</td>
                              <td>
                                <span className="badge bg-soft-info text-info">
                                  {m.role}
                                </span>
                              </td>
                              <td>{m.tasksAssigned}</td>
                              <td>{m.tasksCompleted}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card mt-3 shadow-sm border-0">
              <div className="card-body">
                <h6 className="fw-bold mb-2">Hướng dẫn (Guideline):</h6>
                <div className="p-3 bg-light rounded text-muted">
                  {projectInfo?.description || "Không có hướng dẫn."}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold mb-3 text-uppercase fs-12">
                  Giao việc mới
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-bold">Chọn Annotator *</label>
                  <select
                    className="form-select"
                    value={selectedAnnotator}
                    onChange={(e) => setSelectedAnnotator(e.target.value)}
                  >
                    <option value="">
                      -- Chọn Annotator ({annotators.length}) --
                    </option>
                    {annotators.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Chọn Reviewer *</label>
                  <select
                    className="form-select"
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                  >
                    <option value="">
                      -- Chọn Reviewer ({reviewers.length}) --
                    </option>
                    {reviewers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Số lượng ảnh giao *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={availableItems}
                    placeholder={`Tối đa: ${availableItems}`}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <small className="text-muted">
                    Có {availableItems} ảnh chưa phân công
                  </small>
                </div>

                <button
                  className="btn btn-success w-100 py-2 fw-bold"
                  onClick={handleAssign}
                  disabled={loading || availableItems === 0}
                >
                  {loading ? "Đang xử lý..." : "XÁC NHẬN GIAO VIỆC"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssignTask;
