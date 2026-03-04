import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import projectService from "../../../services/manager/project/projectService";
import datasetService from "../../../services/manager/dataset/datasetService";

const ProjectsDatasetsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.nameid;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await projectService.getManagerProjects(managerId);
      setProjects(res.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách dự án", error);
    }
  };

  const handleProjectClick = async (id) => {
    setLoading(true);
    try {
      const res = await projectService.getProjectById(id);
      setSelectedProject(res.data);
    } catch (error) {
      toast.error("Lỗi khi lấy chi tiết dự án", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      await datasetService.uploadFiles(selectedProject.id, files);
      toast.success(`Đã tải lên thành công ${files.length} tệp tin`);
      handleProjectClick(selectedProject.id);
    } catch (error) {
      toast.error("Tải lên thất bại.", error);
    } finally {
      setUploading(false);
      event.target.value = null;
    }
  };

  const handleExport = async () => {
    if (!selectedProject) return;
    setExporting(true);
    try {
      const res = await datasetService.exportData(selectedProject.id);
      const blob = new Blob([res.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project_${selectedProject.id}_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Xuất dữ liệu thành công!");
    } catch (error) {
      toast.error("Xuất dữ liệu thất bại.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1"
      style={{ height: "calc(100vh - 70px)", overflow: "hidden" }}
    >
      <div
        className="file-manager-sidebar border-end"
        style={{ minWidth: "300px", maxWidth: "300px" }}
      >
        <div className="p-3 d-flex flex-column h-100">
          <div className="mb-3">
            <h5 className="mb-0 fw-bold text-uppercase fs-13">Dự án của tôi</h5>
          </div>

          <div className="search-box mb-3">
            <input
              type="text"
              className="form-control bg-light border-light"
              placeholder="Tìm dự án..."
            />
            <i className="ri-search-2-line search-icon" />
          </div>

          <div
            className="flex-grow-1 overflow-auto pe-2"
            style={{ maxHeight: "100%" }}
          >
            <ul className="list-unstyled file-manager-menu">
              {projects.map((p) => (
                <li key={p.id} className="mb-1">
                  <a
                    href="#!"
                    onClick={() => handleProjectClick(p.id)}
                    className={`d-flex align-items-center rounded p-2 text-decoration-none ${selectedProject?.id === p.id ? "bg-primary text-white" : "text-dark"}`}
                  >
                    <i
                      className={`ri-folder-2-fill me-2 ${selectedProject?.id === p.id ? "text-white" : "text-warning"}`}
                    />
                    <span className="text-truncate small fw-medium">
                      {p.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 border-top pt-3">
            <p className="text-muted mb-1 fs-11 text-uppercase">Thống kê</p>
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <p className="mb-1 fs-12">
                  Tổng dự án: <b>{projects.length}</b>
                </p>
                <div className="progress progress-sm">
                  <div
                    className="progress-bar bg-info"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="file-manager-content w-100 d-flex flex-column bg-white">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white shadow-sm z-3">
          <h5 className="fs-16 mb-0 fw-bold">
            {selectedProject
              ? `📂 Project: ${selectedProject.name}`
              : "Vui lòng chọn dự án"}
          </h5>
          <div className="hstack gap-2">
            <input
              type="file"
              multiple
              className="d-none"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
            />
            <button
              className="btn btn-success btn-sm px-3"
              disabled={!selectedProject || exporting}
              onClick={handleExport}
            >
              {exporting ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="ri-file-download-line align-middle me-1" />
              )}
              {exporting ? "Đang xuất..." : "Export JSON"}
            </button>
            <button
              className="btn btn-primary btn-sm px-3"
              disabled={!selectedProject || uploading}
              onClick={() => fileInputRef.current.click()}
            >
              {uploading ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="ri-upload-cloud-2-line align-middle me-1" />
              )}
              {uploading ? "Đang tải..." : "Upload Data"}
            </button>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : selectedProject ? (
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="card shadow-none border mb-3">
                  <div className="card-header bg-light-subtle">
                    <h6 className="card-title mb-0 fs-13 text-uppercase fw-bold text-muted">
                      Cấu hình nhãn
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Tên Nhãn</th>
                            <th>Màu sắc</th>
                            <th>Hướng dẫn</th>
                            <th>Checklist</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.labels?.map((label) => (
                            <tr key={label.id}>
                              <td className="fw-semibold">{label.name}</td>
                              <td>
                                <span
                                  className="badge px-2 py-1"
                                  style={{ backgroundColor: label.color }}
                                >
                                  {label.color}
                                </span>
                              </td>
                              <td className="text-muted small">
                                {label.guideLine}
                              </td>
                              <td>
                                {label.checklist?.length > 0 ? (
                                  <ul className="list-unstyled mb-0">
                                    {label.checklist.map((item, idx) => (
                                      <li key={idx} className="small">
                                        <i className="ri-checkbox-circle-line text-success me-1"></i>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="card shadow-none border">
                  <div className="card-header bg-light-subtle">
                    <h6 className="card-title mb-0 fs-13 text-uppercase fw-bold text-muted">
                      <i className="ri-user-star-line me-1 text-success"></i>
                      Annotators
                      <span className="badge bg-success-subtle text-success ms-2">
                        {selectedProject.members?.filter(
                          (m) => m.role === "Annotator",
                        ).length || 0}
                      </span>
                    </h6>
                  </div>
                  <div className="card-body">
                    {selectedProject.members?.filter(
                      (m) => m.role === "Annotator",
                    ).length > 0 ? (
                      <div className="d-flex flex-wrap gap-4">
                        {selectedProject.members
                          ?.filter((m) => m.role === "Annotator")
                          .map((m) => (
                            <div
                              key={m.id}
                              className="text-center"
                              style={{ width: "80px" }}
                            >
                              <div className="avatar-sm mx-auto mb-2">
                                <div className="avatar-title bg-soft-success text-success rounded-circle fw-bold">
                                  {m.fullName?.charAt(0)}
                                </div>
                              </div>
                              <p className="mb-0 fs-12 fw-bold text-truncate">
                                {m.fullName}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">
                        Chưa có annotator nào
                      </p>
                    )}
                  </div>
                </div>

                <div className="card shadow-none border">
                  <div className="card-header bg-light-subtle">
                    <h6 className="card-title mb-0 fs-13 text-uppercase fw-bold text-muted">
                      <i className="ri-shield-star-line me-1 text-info"></i>
                      Reviewers
                      <span className="badge bg-info-subtle text-info ms-2">
                        {selectedProject.members?.filter(
                          (m) => m.role === "Reviewer",
                        ).length || 0}
                      </span>
                    </h6>
                  </div>
                  <div className="card-body">
                    {selectedProject.members?.filter(
                      (m) => m.role === "Reviewer",
                    ).length > 0 ? (
                      <div className="d-flex flex-wrap gap-4">
                        {selectedProject.members
                          ?.filter((m) => m.role === "Reviewer")
                          .map((m) => (
                            <div
                              key={m.id}
                              className="text-center"
                              style={{ width: "80px" }}
                            >
                              <div className="avatar-sm mx-auto mb-2">
                                <div className="avatar-title bg-soft-info text-info rounded-circle fw-bold">
                                  {m.fullName?.charAt(0)}
                                </div>
                              </div>
                              <p className="mb-0 fs-12 fw-bold text-truncate">
                                {m.fullName}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">
                        Chưa có reviewer nào
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div
                  className="card shadow-none border bg-light-subtle sticky-top"
                  style={{ top: "0" }}
                >
                  <div className="card-body">
                    <h6 className="mb-3 fw-bold text-uppercase fs-12 border-bottom pb-2">
                      Tiến độ tổng thể
                    </h6>
                    <div className="vstack gap-3">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Tổng Data:</span>
                        <span className="fw-bold text-dark">
                          {selectedProject.totalDataItems}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Đã xong:</span>
                        <span className="fw-bold text-success">
                          {selectedProject.processedItems}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Deadline:</span>
                        <span className="fw-bold text-danger">
                          {new Date(
                            selectedProject.deadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Hoàn thành</span>
                        <span className="fw-bold text-success">
                          {selectedProject.progress}%
                        </span>
                      </div>
                      <div className="progress progress-sm">
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${selectedProject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
              <i className="ri-folder-zip-line display-1 opacity-25"></i>
              <h5 className="mt-3">Chưa chọn dự án</h5>
              <p>Chọn một dự án ở cột bên trái để xem dữ liệu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsDatasetsPage;
