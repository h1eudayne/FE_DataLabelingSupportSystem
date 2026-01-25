import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import projectService from "../../../services/manager/project/projectService";
import taskService from "../../../services/manager/project/taskService";
import { userService } from "../../../services/manager/project/userService";
import Swal from "sweetalert2";

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [annotators, setAnnotators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [projectData, setProjectData] = useState({
    name: "",
    description: "Dự án mới khởi tạo",
    allowGeometryTypes: "BoundingBox",
    deadline: "",
  });
  const [labels, setLabels] = useState([
    { name: "", color: "#0ab39c", guideLine: "N/A" },
  ]);
  const [urlInput, setUrlInput] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        const rawData = res.data?.data || res.data || [];
        if (Array.isArray(rawData)) {
          setAnnotators(rawData.filter((u) => u.role === "Annotator"));
        }
      } catch (err) {
        console.error("Lỗi lấy user:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlArray = urlInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u !== "");

    if (selectedUsers.length === 0)
      return Swal.fire("Lỗi", "Hãy chọn ít nhất 1 người làm.", "warning");
    if (urlArray.length === 0)
      return Swal.fire("Lỗi", "Hãy nhập danh sách URL ảnh.", "warning");

    setLoading(true);
    try {
      const projectPayload = {
        ...projectData,
        pricePerLabel: 100,
        totalBudget: 1000,
        labelClasses: labels.filter((l) => l.name.trim() !== ""),
      };
      const projRes = await projectService.createProject(projectPayload);
      const projectId = projRes.data?.projectId;

      await projectService.importData(projectId, { storageUrls: urlArray });

      const quantityPerPerson = Math.floor(
        urlArray.length / selectedUsers.length,
      );
      const remain = urlArray.length % selectedUsers.length;

      for (let i = 0; i < selectedUsers.length; i++) {
        const finalQuantity =
          i === selectedUsers.length - 1
            ? quantityPerPerson + remain
            : quantityPerPerson;

        await taskService.assignTask({
          projectId: projectId,
          annotatorId: selectedUsers[i],
          quantity: finalQuantity,
        });
      }

      await Swal.fire(
        "Thành công",
        `Đã tạo dự án và chia ${urlArray.length} ảnh cho ${selectedUsers.length} người.`,
        "success",
      );
      navigate("/projects-all-projects");
    } catch (error) {
      console.error("Lỗi quy trình:", error);
      Swal.fire(
        "Lỗi",
        error.response?.data?.message || "Không thể hoàn thành quy trình.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content bg-light">
      <div className="container-fluid">
        <form onSubmit={handleSubmit}>
          <div className="row g-4 d-flex align-items-stretch">
            <div className="col-lg-7">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-primary py-3">
                  <h6 className="mb-0 text-white">1. CẤU HÌNH DỰ ÁN</h6>
                </div>
                <div className="card-body d-flex flex-column text-start">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Tên dự án</label>
                    http://localhost:3000/my-dashboard
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) =>
                        setProjectData({ ...projectData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Loại hình</label>
                      <select
                        className="form-select"
                        onChange={(e) =>
                          setProjectData({
                            ...projectData,
                            allowGeometryTypes: e.target.value,
                          })
                        }
                      >
                        <option value="BoundingBox">Bounding Box</option>
                        <option value="Polygon">Polygon</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Hạn chót</label>
                      <input
                        type="date"
                        className="form-control"
                        onChange={(e) =>
                          setProjectData({
                            ...projectData,
                            deadline: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 d-flex flex-column">
                    <label className="form-label fw-bold">
                      Danh sách URL ảnh (
                      {urlInput.split("\n").filter((x) => x).length})
                    </label>
                    <textarea
                      className="form-control flex-grow-1"
                      style={{ minHeight: "300px" }}
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card h-100 border-0 shadow-sm d-flex flex-column">
                <div className="card-header bg-dark py-3">
                  <h6 className="mb-0 text-white">2. PHÂN CÔNG NHÂN SỰ</h6>
                </div>
                <div className="card-body d-flex flex-column text-start">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Tìm annotator..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div
                    className="flex-grow-1 overflow-auto border rounded bg-light p-2"
                    style={{ maxHeight: "400px" }}
                  >
                    {annotators
                      .filter((u) =>
                        (u.fullName || u.userName || "")
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      )
                      .map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 mb-2 rounded border d-flex align-items-center ${selectedUsers.includes(user.id) ? "bg-soft-primary border-primary" : "bg-white"}`}
                          onClick={() =>
                            setSelectedUsers((prev) =>
                              prev.includes(user.id)
                                ? prev.filter((id) => id !== user.id)
                                : [...prev, user.id],
                            )
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input me-3"
                            checked={selectedUsers.includes(user.id)}
                            readOnly
                          />
                          <div>
                            <div className="fw-bold">
                              {user.fullName || user.userName}
                            </div>
                            <div className="small text-muted">{user.email}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 mt-4 fw-bold"
                    disabled={loading}
                  >
                    {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN TẠO DỰ ÁN"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
