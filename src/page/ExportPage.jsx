import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import projectService from "../services/manager/project/projectService";
import datasetService from "../services/manager/dataset/datasetService";
import analyticsService from "../services/manager/analytics/analyticsService";
import disputeService from "../services/manager/dispute/disputeService";

const EXPORT_FORMATS = [
  { value: "json", label: "JSON", mime: "application/json", ext: ".json" },
  { value: "csv", label: "CSV", mime: "text/csv", ext: ".csv" },
  { value: "xml", label: "XML", mime: "application/xml", ext: ".xml" },
];

const convertToCSV = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    if (typeof data === "object" && !Array.isArray(data)) {
      data = [data];
    } else {
      return "";
    }
  }
  const flattenObj = (obj, prefix = "") => {
    const result = {};
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (
        obj[key] !== null &&
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(result, flattenObj(obj[key], fullKey));
      } else {
        result[fullKey] = Array.isArray(obj[key])
          ? JSON.stringify(obj[key])
          : obj[key];
      }
    }
    return result;
  };

  const flatData = data.map((item) => flattenObj(item));
  const headers = [...new Set(flatData.flatMap((d) => Object.keys(d)))];
  const csvRows = [headers.join(",")];

  for (const row of flatData) {
    const values = headers.map((h) => {
      const val = row[h] ?? "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};

const convertToXML = (data, rootName = "export") => {
  const escapeXml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const toXml = (obj, tag = "item") => {
    if (Array.isArray(obj)) {
      return obj.map((item) => toXml(item, tag)).join("\n");
    }
    if (typeof obj === "object" && obj !== null) {
      const inner = Object.entries(obj)
        .map(([key, val]) => toXml(val, key))
        .join("\n");
      return `<${tag}>\n${inner}\n</${tag}>`;
    }
    return `<${tag}>${escapeXml(obj)}</${tag}>`;
  };

  const items = Array.isArray(data) ? data : [data];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${items.map((item) => toXml(item, "item")).join("\n")}\n</${rootName}>`;
};

const ExportPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("json");
  const [eligibility, setEligibility] = useState({});
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await projectService.getManagerProjects(managerId);
        const list = res.data || [];
        setProjects(list);
        checkAllEligibility(list);
      } catch {
        toast.error("Không thể tải danh sách dự án");
      } finally {
        setLoading(false);
      }
    };
    if (managerId) fetchProjects();
  }, [managerId]);

  const checkAllEligibility = async (projectList) => {
    const checks = {};
    projectList.forEach((p) => {
      checks[p.id] = { checking: true, ready: false };
    });
    setEligibility({ ...checks });

    for (const project of projectList) {
      try {
        const [statsRes, disputesRes] = await Promise.all([
          analyticsService.getProjectStats(project.id),
          disputeService.getDisputes(project.id),
        ]);
        const stats = statsRes.data;
        const disputes = disputesRes.data || [];
        const totalTasks = stats.totalAssignments ?? 0;
        const approved = stats.approvedAssignments ?? 0;
        const allApproved = totalTasks > 0 && approved === totalTasks;
        const pendingDisputes = disputes.filter((d) => d.status === "Pending");
        const noPendingDisputes = pendingDisputes.length === 0;

        checks[project.id] = {
          checking: false,
          ready: allApproved && noPendingDisputes,
          allApproved,
          noPendingDisputes,
          totalTasks,
          approved,
          pendingDisputeCount: pendingDisputes.length,
        };
      } catch {
        checks[project.id] = {
          checking: false,
          ready: false,
          allApproved: false,
          noPendingDisputes: false,
        };
      }
      setEligibility({ ...checks });
    }
  };

  const handleExport = async (project) => {
    const check = eligibility[project.id];
    if (!check?.ready) {
      const reasons = [];
      if (!check?.allApproved)
        reasons.push(
          `Còn ${(check?.totalTasks || 0) - (check?.approved || 0)} task chưa Approved`,
        );
      if (!check?.noPendingDisputes)
        reasons.push(
          `Còn ${check?.pendingDisputeCount || 0} dispute đang chờ xử lý`,
        );
      toast.error(
        `Không thể Export "${project.name}"! ${reasons.join(". ")}.`,
        { autoClose: 5000 },
      );
      return;
    }

    setExportingId(project.id);
    try {
      const res = await datasetService.exportData(project.id);
      const format = EXPORT_FORMATS.find((f) => f.value === selectedFormat);
      let content;
      let rawData = res.data;

      if (typeof rawData === "string") {
        try {
          rawData = JSON.parse(rawData);
        } catch {}
      }

      switch (selectedFormat) {
        case "csv":
          content = convertToCSV(rawData);
          break;
        case "xml":
          content = convertToXML(rawData, "projectExport");
          break;
        default:
          content =
            typeof rawData === "string"
              ? rawData
              : JSON.stringify(rawData, null, 2);
      }

      const blob = new Blob([content], { type: format.mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project_${project.id}_export_${new Date().toISOString().slice(0, 10)}${format.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(
        `Đã xuất "${project.name}" dạng ${format.label} thành công!`,
      );
    } catch {
      toast.error("Xuất dữ liệu thất bại.");
    } finally {
      setExportingId(null);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentFormat = EXPORT_FORMATS.find((f) => f.value === selectedFormat);

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
        <div className="col-lg-4">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 fw-bold text-nowrap">
              Định dạng:
            </label>
            <select
              className="form-select"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label} ({f.ext})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-lg-4 text-end d-flex align-items-center justify-content-end">
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
                        <th>Export Eligibility</th>
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
                          <td>
                            {(() => {
                              const check = eligibility[project.id];
                              if (!check || check.checking) {
                                return (
                                  <span className="text-muted small">
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Đang kiểm tra...
                                  </span>
                                );
                              }
                              if (check.ready) {
                                return (
                                  <span className="badge bg-success-subtle text-success">
                                    <i className="ri-checkbox-circle-fill me-1"></i>
                                    Sẵn sàng
                                  </span>
                                );
                              }
                              return (
                                <div className="vstack gap-1">
                                  {!check.allApproved && (
                                    <small className="text-danger">
                                      <i className="ri-close-circle-fill me-1"></i>
                                      {(check.totalTasks || 0) -
                                        (check.approved || 0)}{" "}
                                      task chưa Approved
                                    </small>
                                  )}
                                  {!check.noPendingDisputes && (
                                    <small className="text-danger">
                                      <i className="ri-close-circle-fill me-1"></i>
                                      {check.pendingDisputeCount} dispute
                                      pending
                                    </small>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="text-center">
                            <button
                              className={`btn btn-sm px-3 ${eligibility[project.id]?.ready ? "btn-soft-success" : "btn-soft-secondary"}`}
                              onClick={() => handleExport(project)}
                              disabled={
                                exportingId === project.id ||
                                (project.totalDataItems ?? 0) === 0 ||
                                eligibility[project.id]?.checking
                              }
                              title={
                                !eligibility[project.id]?.ready
                                  ? "Chưa đủ điều kiện Export (BR-MNG-21)"
                                  : `Export ${currentFormat?.label}`
                              }
                            >
                              {exportingId === project.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  Đang xuất...
                                </>
                              ) : !eligibility[project.id]?.ready ? (
                                <>
                                  <i className="ri-lock-line me-1"></i>
                                  Locked
                                </>
                              ) : (
                                <>
                                  <i className="ri-file-download-line me-1"></i>
                                  Export {currentFormat?.label}
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
