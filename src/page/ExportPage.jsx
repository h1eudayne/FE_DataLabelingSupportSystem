import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import projectService from "../services/manager/project/projectService";
import datasetService from "../services/manager/dataset/datasetService";

const ExportPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.nameid;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await projectService.getManagerProjects(managerId);
        setProjects(res.data || []);
      } catch {
        toast.error("Không thể tải danh sách dự án");
      } finally {
        setLoading(false);
      }
    };
    if (managerId) fetchProjects();
  }, [managerId]);

  const handleExport = async (project) => {
    setExportingId(project.id);
    try {
      const res = await datasetService.exportData(project.id);
      const blob = new Blob([res.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project_${project.id}_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Đã xuất dữ liệu "${project.name}" thành công!`);
    } catch {
      toast.error("Xuất dữ liệu thất bại.");
    } finally {
      setExportingId(null);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Xuất dữ liệu</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">Quản lý</li>
                <li className="breadcrumb-item active">Export Data</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-lg-4">
          <div className="search-box">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm tên dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line search-icon"></i>
          </div>
        </div>
        <div className="col-lg-8 text-end">
          <span className="text-muted">
            Tổng: <b>{filteredProjects.length}</b> dự án
          </span>
        </div>
      </div>

      <div className="row">
        {loading ? (
          <div className="col-12 text-center p-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted">Đang tải danh sách...</div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Tên dự án</th>
                        <th>Tổng Data</th>
                        <th>Tiến độ</th>
                        <th>Trạng thái</th>
                        <th>Hạn chót</th>
                        <th className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project, index) => (
                        <tr key={project.id}>
                          <td className="fw-medium">{index + 1}</td>
                          <td>
                            <span className="fw-semibold text-dark">
                              {project.name}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-soft-info text-info">
                              {project.totalDataItems ?? 0} items
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="progress progress-sm flex-grow-1"
                                style={{ width: "80px" }}
                              >
                                <div
                                  className="progress-bar bg-success"
                                  style={{
                                    width: `${Math.round(Number(project.progress ?? 0))}%`,
                                  }}
                                ></div>
                              </div>
                              <small className="text-muted fw-bold">
                                {Math.round(Number(project.progress ?? 0))}%
                              </small>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${project.status === "Expired" ? "bg-danger" : "bg-success"}`}
                            >
                              {project.status || "Active"}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {project.deadline
                              ? new Date(project.deadline).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "N/A"}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-soft-success btn-sm px-3"
                              onClick={() => handleExport(project)}
                              disabled={
                                exportingId === project.id ||
                                (project.totalDataItems ?? 0) === 0
                              }
                            >
                              {exportingId === project.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  Đang xuất...
                                </>
                              ) : (
                                <>
                                  <i className="ri-file-download-line me-1"></i>
                                  Export JSON
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-12">
            <div className="card py-5 text-center">
              <div className="card-body">
                <i className="ri-file-download-line display-4 text-muted"></i>
                <h5 className="mt-3">Không có dự án nào</h5>
                <p className="text-muted">
                  Bạn chưa có dự án nào để xuất dữ liệu.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ExportPage;
