import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import projectService from "../../../services/manager/project/projectService";
import datasetService from "../../../services/manager/dataset/datasetService";
import analyticsService from "../../../services/manager/analytics/analyticsService";
import disputeService from "../../../services/manager/dispute/disputeService";

const ProjectsDatasetsPage = () => {
  const { t } = useTranslation();
  const { id: paramId } = useParams();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportCheck, setExportCheck] = useState({
    ready: false,
    allApproved: false,
    noPendingDisputes: false,
    checking: false,
  });
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.id;

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (paramId && projects.length > 0 && !selectedProject) {
      handleProjectClick(Number(paramId));
    }
  }, [paramId, projects]);

  const fetchList = async () => {
    try {
      const res = await projectService.getManagerProjects(managerId);
      setProjects(res.data || []);
    } catch (error) {
      toast.error(t('datasets.loadProjectFailed'), error);
    }
  };

  const fetchProjectStats = async (id) => {
    try {
      const statsRes = await analyticsService.getProjectStats(id);
      setProjectStats(statsRes.data);
    } catch {
      setProjectStats(null);
    }
  };

  const handleProjectClick = async (id) => {
    setLoading(true);
    setProjectStats(null);
    setExportCheck({
      ready: false,
      allApproved: false,
      noPendingDisputes: false,
      checking: true,
    });
    try {
      const [res] = await Promise.all([
        projectService.getProjectById(id),
        fetchProjectStats(id),
      ]);
      setSelectedProject(res.data);
      checkExportEligibility(id);
    } catch (error) {
      toast.error(t('datasets.projectDetailError'), error);
    } finally {
      setLoading(false);
    }
  };

  const checkExportEligibility = async (projectId) => {
    try {
      const [statsRes, disputesRes] = await Promise.all([
        analyticsService.getProjectStats(projectId),
        disputeService.getDisputes(projectId),
      ]);
      const stats = statsRes.data;
      const disputes = disputesRes.data || [];

      const totalTasks = stats.totalAssignments ?? 0;
      const approved = stats.approvedAssignments ?? 0;
      const allApproved = totalTasks > 0 && approved === totalTasks;
      const pendingDisputes = disputes.filter((d) => d.status === "Pending");
      const noPendingDisputes = pendingDisputes.length === 0;

      setExportCheck({
        ready: allApproved && noPendingDisputes,
        allApproved,
        noPendingDisputes,
        checking: false,
        totalTasks,
        approved,
        pendingDisputeCount: pendingDisputes.length,
      });
    } catch {
      setExportCheck({
        ready: false,
        allApproved: false,
        noPendingDisputes: false,
        checking: false,
      });
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      await datasetService.uploadFiles(selectedProject.id, files);
      toast.success(t('datasets.uploadSuccess', { count: files.length }));
      await handleProjectClick(selectedProject.id);
      await fetchList();
    } catch (error) {
      toast.error(t('datasets.uploadFailed'), error);
    } finally {
      setUploading(false);
      event.target.value = null;
    }
  };

  const handleExport = async () => {
    if (!selectedProject) return;

    if (!exportCheck.ready) {
      const reasons = [];
      if (!exportCheck.allApproved)
        reasons.push(
          t('datasets.tasksNotApprovedDetail', { remaining: (exportCheck.totalTasks || 0) - (exportCheck.approved || 0), approved: exportCheck.approved || 0, total: exportCheck.totalTasks || 0 }),
        );
      if (!exportCheck.noPendingDisputes)
        reasons.push(
          t('datasets.disputesPendingDetail', { count: exportCheck.pendingDisputeCount || 0 }),
        );
      toast.error(`${t('datasets.cannotExport')} ${reasons.join(". ")}.`, {
        autoClose: 5000,
      });
      return;
    }

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
      toast.success(t('datasets.exportSuccess'));
    } catch (error) {
      toast.error(t('datasets.exportFailed'));
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
            <h5 className="mb-0 fw-bold text-uppercase fs-13">{t('datasets.myProjects')}</h5>
          </div>

          <div className="search-box mb-3">
            <input
              type="text"
              className="form-control bg-light border-light"
              placeholder={t('datasets.searchProject')}
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
            <p className="text-muted mb-1 fs-11 text-uppercase">{t('datasets.statistics')}</p>
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <p className="mb-1 fs-12">
                  {t('datasets.totalProjects')}: <b>{projects.length}</b>
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
              ? `${t('datasets.projectPrefix')}: ${selectedProject.name}`
              : t('datasets.selectProject')}
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
              className={`btn btn-sm px-3 ${exportCheck.ready ? "btn-success" : "btn-outline-secondary"}`}
              disabled={!selectedProject || exporting || exportCheck.checking}
              onClick={handleExport}
              title={
                !exportCheck.ready && selectedProject
                  ? `${t('datasets.exportNotReady')}: ${!exportCheck.allApproved ? t('datasets.notAllApproved') : ""} ${!exportCheck.noPendingDisputes ? t('datasets.disputePendingShort') : ""}`
                  : t('datasets.exportJson')
              }
            >
              {exporting ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : exportCheck.checking ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : !exportCheck.ready && selectedProject ? (
                <i className="ri-lock-line align-middle me-1" />
              ) : (
                <i className="ri-file-download-line align-middle me-1" />
              )}
              {exporting
                ? t('datasets.exporting')
                : exportCheck.checking
                  ? t('datasets.checking')
                  : !exportCheck.ready && selectedProject
                    ? t('datasets.exportNotEligible')
                    : "Export JSON"}
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
              {uploading ? t('datasets.uploading') : "Upload Data"}
            </button>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">{t('datasets.loadingData')}</p>
            </div>
          ) : selectedProject ? (
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="card shadow-none border mb-3">
                  <div className="card-header bg-light-subtle">
                    <h6 className="card-title mb-0 fs-13 text-uppercase fw-bold text-muted">
                      {t('datasets.labelConfig')}
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>{t('datasets.labelName')}</th>
                            <th>{t('datasets.color')}</th>
                            <th>{t('datasets.guideline')}</th>
                            <th>{t('datasets.checklist')}</th>
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
                        {t('datasets.noAnnotators')}
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
                        {t('datasets.noReviewers')}
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
                      {t('datasets.overallProgress')}
                    </h6>
                    <div className="vstack gap-3">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">{t('datasets.totalData')}:</span>
                        <span className="fw-bold text-dark">
                          {projectStats?.totalItems ??
                            selectedProject.totalDataItems}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">{t('datasets.assigned')}:</span>
                        <span className="fw-bold text-info">
                          {projectStats?.totalAssignments ?? 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">{t('datasets.approved')}:</span>
                        <span className="fw-bold text-success">
                          {projectStats?.approvedAssignments ??
                            selectedProject.processedItems}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">{t('datasets.pending')}:</span>
                        <span className="fw-bold text-warning">
                          {projectStats?.submittedAssignments ?? 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">{t('datasets.deadline')}:</span>
                        <span className="fw-bold text-danger">
                          {new Date(
                            selectedProject.deadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const statsProgress =
                        projectStats?.totalItems > 0
                          ? Math.round(
                              (projectStats.completedItems /
                                projectStats.totalItems) *
                                100,
                            )
                          : selectedProject.progress;
                      return (
                        <div className="mt-4">
                          <div className="d-flex justify-content-between mb-2">
                            <span>{t('datasets.completed')}</span>
                            <span className="fw-bold text-success">
                              {statsProgress ?? selectedProject.progress}%
                            </span>
                          </div>
                          <div className="progress progress-sm">
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${statsProgress ?? selectedProject.progress}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="mt-4 border-top pt-3">
                      <h6 className="mb-2 fw-bold text-uppercase fs-11 text-muted">
                        <i className="ri-shield-check-line me-1"></i>
                        {t('datasets.exportStatus')}
                      </h6>
                      {exportCheck.checking ? (
                        <div className="text-center py-2">
                          <span className="spinner-border spinner-border-sm text-primary"></span>
                          <span className="ms-1 small text-muted">
                            {t('datasets.checking')}
                          </span>
                        </div>
                      ) : (
                        <div className="vstack gap-2">
                          <div className="d-flex align-items-center">
                            <i
                              className={`me-2 ${exportCheck.allApproved ? "ri-checkbox-circle-fill text-success" : "ri-close-circle-fill text-danger"}`}
                            ></i>
                            <small
                              className={
                                exportCheck.allApproved
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              {exportCheck.allApproved
                                ? t('datasets.allTasksApproved')
                                : t('datasets.tasksNotApproved', { count: (exportCheck.totalTasks || 0) - (exportCheck.approved || 0) })}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <i
                              className={`me-2 ${exportCheck.noPendingDisputes ? "ri-checkbox-circle-fill text-success" : "ri-close-circle-fill text-danger"}`}
                            ></i>
                            <small
                              className={
                                exportCheck.noPendingDisputes
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              {exportCheck.noPendingDisputes
                                ? t('datasets.noDisputePending')
                                : t('datasets.disputesPending', { count: exportCheck.pendingDisputeCount })}
                            </small>
                          </div>
                          {exportCheck.ready && (
                            <div className="alert alert-success py-1 px-2 mb-0 mt-1 small">
                              <i className="ri-check-double-line me-1"></i>
                              <strong>{t('datasets.readyToExport')}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
              <i className="ri-folder-zip-line display-1 opacity-25"></i>
              <h5 className="mt-3">{t('datasets.noProjectSelected')}</h5>
              <p>{t('datasets.selectProjectHint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsDatasetsPage;
