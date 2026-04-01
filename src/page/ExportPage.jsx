import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import projectService from "../services/manager/project/projectService";
import datasetService from "../services/manager/dataset/datasetService";
import analyticsService from "../services/manager/analytics/analyticsService";
import disputeService from "../services/manager/dispute/disputeService";
import {
  EXPORT_FORMATS,
  buildExportFileContent,
  computeProjectExportEligibility,
  extractExportErrorMessage,
} from "../utils/projectExport";
import {
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from "../utils/projectWorkflowStatus";

const ExportPage = () => {
  const { t } = useTranslation();
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
        toast.error(t("exportPage.loadError"));
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
        checks[project.id] = computeProjectExportEligibility(
          statsRes.data,
          disputesRes.data || [],
        );
      } catch {
        checks[project.id] = {
          checking: false,
          hasDataItems: false,
          ready: false,
          allApproved: false,
          noPendingDisputes: false,
          totalItems: 0,
          approvedItems: 0,
          pendingDisputeCount: 0,
        };
      }
      setEligibility({ ...checks });
    }
  };

  const handleExport = async (project) => {
    const check = eligibility[project.id];
    if (!check?.ready) {
      const reasons = [];
      if (!check?.hasDataItems) {
        reasons.push(t("exportPage.noDataReason"));
      } else if (!check?.allApproved) {
        reasons.push(
          t("exportPage.taskNotApprovedReason", {
            count: (check?.totalItems || 0) - (check?.approvedItems || 0),
          }),
        );
      }
      if (!check?.noPendingDisputes)
        reasons.push(
          t("exportPage.disputePendingReason", { count: check?.pendingDisputeCount || 0 }),
        );
      toast.error(
        `${t("exportPage.cannotExport")} "${project.name}"! ${reasons.join(". ")}.`,
        { autoClose: 5000 },
      );
      return;
    }

    setExportingId(project.id);
    try {
      const res = await datasetService.exportData(project.id);
      const format = EXPORT_FORMATS.find((f) => f.value === selectedFormat);
      const { content } = await buildExportFileContent(res.data, selectedFormat);

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
        t("exportPage.exportSuccess", { name: project.name, format: format.label }),
      );
    } catch (error) {
      toast.error(await extractExportErrorMessage(error, t("exportPage.exportError")));
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
            <h4 className="mb-sm-0">{t("exportPage.title")}</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">{t("exportPage.breadcrumbManage")}</li>
                <li className="breadcrumb-item active">{t("exportPage.breadcrumbExport")}</li>
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
              placeholder={t("exportPage.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line search-icon"></i>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 fw-bold text-nowrap">
              {t("exportPage.format")}
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
            {t("exportPage.total")} <b>{filteredProjects.length}</b> {t("exportPage.projects")}
          </span>
        </div>
      </div>

      <div className="row">
        {loading ? (
          <div className="col-12 text-center p-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted">{t("exportPage.loadingList")}</div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t("exportPage.colIndex")}</th>
                        <th>{t("exportPage.colName")}</th>
                        <th>{t("exportPage.colTotalData")}</th>
                        <th>{t("exportPage.colProgress")}</th>
                        <th>{t("exportPage.colStatus")}</th>
                        <th>{t("exportPage.colDeadline")}</th>
                        <th>{t("exportPage.colEligibility")}</th>
                        <th className="text-center">{t("exportPage.colAction")}</th>
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
                            <span className={`badge ${getProjectStatusBadgeClass(project.status)}`}>
                              {getProjectStatusLabel(project.status, t)}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {project.deadline
                              ? new Date(project.deadline).toLocaleDateString(
                                  "vi-VN",
                                )
                              : t("statusCommon.notAvailable")}
                          </td>
                          <td>
                            {(() => {
                              const check = eligibility[project.id];
                              if (!check || check.checking) {
                                return (
                                  <span className="text-muted small">
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    {t("exportPage.checking")}
                                  </span>
                                );
                              }
                              if (check.ready) {
                                return (
                                  <span className="badge bg-success-subtle text-success">
                                    <i className="ri-checkbox-circle-fill me-1"></i>
                                    {t("exportPage.ready")}
                                  </span>
                                );
                              }
                              return (
                                <div className="vstack gap-1">
                                  {!check.hasDataItems && (
                                    <small className="text-danger">
                                      <i className="ri-close-circle-fill me-1"></i>
                                      {t("exportPage.noDataHint")}
                                    </small>
                                  )}
                                  {check.hasDataItems && !check.allApproved && (
                                    <small className="text-danger">
                                      <i className="ri-close-circle-fill me-1"></i>
                                      {(check.totalItems || 0) -
                                        (check.approvedItems || 0)}{" "}
                                      {t("exportPage.taskNotApproved")}
                                    </small>
                                  )}
                                  {!check.noPendingDisputes && (
                                    <small className="text-danger">
                                      <i className="ri-close-circle-fill me-1"></i>
                                      {check.pendingDisputeCount} {t("exportPage.disputePending")}
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
                                eligibility[project.id]?.checking ||
                                !eligibility[project.id]?.ready
                              }
                              title={
                                !eligibility[project.id]?.ready
                                  ? t("exportPage.notEligible")
                                  : `Export ${currentFormat?.label}`
                              }
                            >
                              {exportingId === project.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  {t("exportPage.exporting")}
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
                <h5 className="mt-3">{t("exportPage.noProjects")}</h5>
                <p className="text-muted">
                  {t("exportPage.noProjectsHint")}
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
