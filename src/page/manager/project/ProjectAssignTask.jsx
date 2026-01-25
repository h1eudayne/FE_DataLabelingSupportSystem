import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import projectService from "../../../services/manager/project/projectService";
import { userService } from "../../../services/manager/project/userService";
import taskService from "../../../services/manager/project/taskService";
import Swal from "sweetalert2";

const ProjectAssignTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataItems, setDataItems] = useState([]);
  const [annotators, setAnnotators] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    projectService
      .getProjectDetail(id)
      .then((res) => {
        setProjectInfo(res.data);
        setDataItems(res.data.dataItems || []);
      })
      .finally(() => setLoading(false));

    userService.getUsers().then((res) => {
      const list = res.data.filter(
        (u) => u.role?.toLowerCase() === "annotator",
      );
      setAnnotators(list);
    });
  }, [id]);

  const handleAssign = async () => {
    console.log("Dữ liệu chuẩn bị gửi:", {
      projectId: id,
      userIds: [selectedUser],
      dataItemIds: selectedItems,
      deadline: new Date().toISOString(),
    });

    if (!selectedUser || selectedItems.length === 0)
      return alert("Vui lòng chọn ảnh và người làm!");
    const payload = {
      projectId: id,
      userIds: [selectedUser],
      dataItemIds: selectedItems,
      deadline: new Date().toISOString(),
    };
    console.log("Dữ liệu gửi đi:", payload);

    setLoading(true);
    try {
      const response = await taskService.assignTask({
        projectId: id,
        userIds: [selectedUser],
        dataItemIds: selectedItems,
        deadline: new Date().toISOString(),
      });

      if (response.data && response.data.isSuccess === false) {
        alert("Lỗi từ hệ thống: " + response.data.message);
        return;
      }

      alert("Giao việc thành công!");
      navigate("/projects-all-projects");
    } catch (error) {
      console.error("Chi tiết lỗi API:", error.response?.data);
      alert(
        "Lỗi giao việc: " + (error.response?.data?.message || "Không xác định"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !projectInfo)
    return <div className="p-5 text-center">Đang tải...</div>;

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
              <div className="card-header bg-light d-flex justify-content-between">
                <h6 className="card-title mb-0">
                  Chọn dữ liệu ảnh ({selectedItems.length}/{dataItems.length})
                </h6>
              </div>
              <div
                className="card-body"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
                <div className="d-flex flex-wrap gap-2">
                  {dataItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() =>
                        setSelectedItems((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((i) => i !== item.id)
                            : [...prev, item.id],
                        )
                      }
                      className={`position-relative border rounded p-1 ${selectedItems.includes(item.id) ? "border-primary bg-soft-primary" : "border-transparent"}`}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={item.storageUrl}
                        alt="task"
                        width="120"
                        height="90"
                        style={{ objectFit: "cover" }}
                        className="rounded"
                      />
                      {selectedItems.includes(item.id) && (
                        <div className="position-absolute top-0 end-0 p-1">
                          <i className="ri-checkbox-circle-fill text-primary"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  Danh mục nhãn dự án
                </h6>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {projectInfo?.labelClasses?.map((l) => (
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

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Chọn Annotator thực hiện
                  </label>
                  <select
                    className="form-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">
                      -- Chọn nhân viên ({annotators.length}) --
                    </option>
                    {annotators.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-success w-100 py-2 fw-bold"
                  onClick={handleAssign}
                  disabled={loading || dataItems.length === 0}
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
