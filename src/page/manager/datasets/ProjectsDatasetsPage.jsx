import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import projectService from "../../../services/manager/project/projectService";
import datasetService from "../../../services/manager/dataset/datasetService";
import analyticsService from "../../../services/manager/analytics/analyticsService";
import disputeService from "../../../services/manager/dispute/disputeService";
import labelService from "../../../services/manager/project/labelService";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [addingLabel, setAddingLabel] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabel, setNewLabel] = useState({
    name: "",
    color: "#3b82f6",
    guideLine: "",
    checklist: [""],
    isDefault: false,
  });
  const [collapsedSections, setCollapsedSections] = useState({
    labelConfig: false,
    annotators: false,
    reviewers: false,
  });
  const toggleSection = (section) =>
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const startEditLabel = (label) => {
    setEditingLabel(label);
    setNewLabel({
      name: label.name || "",
      color: label.color || "#3b82f6",
      guideLine: label.guideLine || "",
      checklist: label.checklist?.length > 0 ? [...label.checklist] : [""],
      isDefault: label.isDefault || false,
    });
    setShowAddLabel(true);
  };

  const resetLabelForm = () => {
    setShowAddLabel(false);
    setEditingLabel(null);
    setNewLabel({ name: "", color: "#3b82f6", guideLine: "", checklist: [""], isDefault: false });
  };

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    return projects.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const fetchList = async () => {
    try {
      const res = await projectService.getManagerProjects(managerId);
      setProjects(res.data || []);
    } catch (error) {
      toast.error(t('datasets.loadProjectFailed'), error);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerId, t]);

  useEffect(() => {
    if (paramId && projects.length > 0 && !selectedProject) {
      handleProjectClick(Number(paramId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId, projects, selectedProject]);

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
    } catch {
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-2-line search-icon" />
          </div>

          <div
            className="flex-grow-1 overflow-auto pe-2"
            style={{ maxHeight: "100%" }}
          >
            <ul className="list-unstyled file-manager-menu">
              {filteredProjects.map((p) => (
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
              {filteredProjects.length === 0 && searchTerm && (
                <li className="text-center text-muted small py-3">
                  <i className="ri-search-line d-block fs-20 mb-1 opacity-50" />
                  {t('datasets.noProjectFound')}
                </li>
              )}
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
              style={{ minWidth: '160px' }}
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
                  <div
                    className="card-header bg-light-subtle d-flex align-items-center justify-content-between"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleSection('labelConfig')}
                  >
                    <h6 className="card-title mb-0 fs-13 text-uppercase fw-bold text-muted d-flex align-items-center">
                      <i className={`ri-arrow-${collapsedSections.labelConfig ? 'right' : 'down'}-s-line me-1 fs-16`} />
                      {t('datasets.labelConfig')}
                      <span className="badge bg-primary-subtle text-primary ms-2">
                        {selectedProject.labels?.length || 0}
                      </span>
                    </h6>
                    <button
                      className="btn btn-sm btn-soft-primary"
                      onClick={(e) => { e.stopPropagation(); setEditingLabel(null); setNewLabel({ name: "", color: "#3b82f6", guideLine: "", checklist: [""], isDefault: false }); setShowAddLabel(true); }}
                    >
                      <i className="ri-add-line align-middle me-1" />
                      {t('datasets.addLabel')}
                    </button>
                  </div>
                  {!collapsedSections.labelConfig && <div className="card-body p-0">
                      <table className="table table-hover align-middle mb-0" style={{ tableLayout: 'fixed' }}>
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '16%', whiteSpace: 'nowrap' }}>{t('datasets.labelName')}</th>
                            <th style={{ width: '15%', whiteSpace: 'nowrap' }}>{t('datasets.labelType')}</th>
                            <th style={{ width: '12%', whiteSpace: 'nowrap' }}>{t('datasets.color')}</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>{t('datasets.guideline')}</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>{t('datasets.checklist')}</th>
                            <th style={{ width: '17%', whiteSpace: 'nowrap', textAlign: 'center' }}>{t('common.actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.labels?.map((label) => (
                            <tr key={label.id}>
                              <td className="fw-semibold text-truncate" style={{ maxWidth: 0 }} title={label.name}>{label.name}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                {label.isDefault ? (
                                  <span className="badge bg-warning-subtle text-warning px-2 py-1" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                    <i className="ri-error-warning-line me-1" />
                                    {t('datasets.labelDefault')}
                                  </span>
                                ) : (
                                  <span className="badge bg-info-subtle text-info px-2 py-1" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                    <i className="ri-folder-line me-1" />
                                    {t('datasets.labelProject')}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span
                                  className="badge px-2 py-1"
                                  style={{ backgroundColor: label.color }}
                                >
                                  {label.color}
                                </span>
                              </td>
                              <td className="text-muted small text-truncate" style={{ maxWidth: 0 }} title={label.guideLine}>
                                {label.guideLine}
                              </td>
                              <td>
                                {label.checklist?.length > 0 ? (
                                  <ul className="list-unstyled mb-0">
                                    {label.checklist.map((item, idx) => (
                                      <li key={idx} className="small text-truncate" title={item}>
                                        <i className="ri-checkbox-circle-line text-success me-1"></i>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-1 justify-content-center">
                                  <button
                                    className="btn btn-sm btn-soft-primary p-1"
                                    title={t('common.edit')}
                                    onClick={() => startEditLabel(label)}
                                  >
                                    <i className="ri-pencil-line" />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-soft-danger p-1"
                                    title={t('common.delete')}
                                    onClick={async () => {
                                      if (!window.confirm(t('datasets.confirmDeleteLabel'))) return;
                                      try {
                                        await labelService.deleteLabel(label.id);
                                        toast.success(t('datasets.deleteLabelSuccess'));
                                        await handleProjectClick(selectedProject.id);
                                      } catch {
                                        toast.error(t('datasets.deleteLabelFailed'));
                                      }
                                    }}
                                  >
                                    <i className="ri-delete-bin-line" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>}

                  {/* Add Label Modal */}
                  {showAddLabel && (
                    <div className="card-footer bg-white border-top p-3">
                      <h6 className="fw-bold fs-13 mb-3">
                        <i className={`${editingLabel ? 'ri-pencil-line' : 'ri-add-circle-line'} me-1 text-primary`} />
                        {editingLabel ? t('datasets.editLabelTitle') : t('datasets.addLabelTitle')}
                      </h6>
                      <div className="row g-2">
                        <div className="col-12 mb-1">
                          <label className="form-label small fw-semibold">{t('datasets.labelType')}</label>
                          <div className="d-flex gap-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                id="labelTypeProject"
                                checked={!newLabel.isDefault}
                                onChange={() => setNewLabel({ ...newLabel, isDefault: false })}
                              />
                              <label className="form-check-label small" htmlFor="labelTypeProject">
                                <span className="badge bg-info-subtle text-info me-1"><i className="ri-folder-line" /></span>
                                {t('datasets.labelProject')}
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                id="labelTypeDefault"
                                checked={newLabel.isDefault}
                                onChange={() => setNewLabel({ ...newLabel, isDefault: true })}
                              />
                              <label className="form-check-label small" htmlFor="labelTypeDefault">
                                <span className="badge bg-warning-subtle text-warning me-1"><i className="ri-error-warning-line" /></span>
                                {t('datasets.labelDefault')}
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-5">
                          <label className="form-label small fw-semibold">{t('datasets.labelName')}</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder={t('datasets.labelNamePlaceholder')}
                            value={newLabel.name}
                            onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold">{t('datasets.labelColorLabel')}</label>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="color"
                              className="form-control form-control-color form-control-sm"
                              value={newLabel.color}
                              onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                              style={{ width: '40px', height: '32px' }}
                            />
                            <span className="small text-muted">{newLabel.color}</span>
                          </div>
                        </div>
                        <div className="col-md-5">
                          <label className="form-label small fw-semibold">{t('datasets.guideline')}</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder={t('datasets.labelGuidelinePlaceholder')}
                            value={newLabel.guideLine}
                            onChange={(e) => setNewLabel({ ...newLabel, guideLine: e.target.value })}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold">{t('datasets.checklist')}</label>
                          {newLabel.checklist.map((item, idx) => (
                            <div key={idx} className="d-flex gap-2 mb-1">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder={`${t('datasets.checklistItem')} ${idx + 1}`}
                                value={item}
                                onChange={(e) => {
                                  const updated = [...newLabel.checklist];
                                  updated[idx] = e.target.value;
                                  setNewLabel({ ...newLabel, checklist: updated });
                                }}
                              />
                              {newLabel.checklist.length > 1 && (
                                <button
                                  className="btn btn-sm btn-soft-danger"
                                  onClick={() => {
                                    const updated = newLabel.checklist.filter((_, i) => i !== idx);
                                    setNewLabel({ ...newLabel, checklist: updated });
                                  }}
                                >
                                  <i className="ri-close-line" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            className="btn btn-sm btn-outline-secondary mt-1"
                            onClick={() => setNewLabel({ ...newLabel, checklist: [...newLabel.checklist, ""] })}
                          >
                            <i className="ri-add-line me-1" />
                            {t('datasets.addChecklistItem')}
                          </button>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-primary px-3"
                          disabled={addingLabel || !newLabel.name.trim()}
                          onClick={async () => {
                            setAddingLabel(true);
                            try {
                              const checklistStr = newLabel.checklist
                                .filter((c) => c.trim())
                                .join("|");
                              if (editingLabel) {
                                await labelService.updateLabel(editingLabel.id, {
                                  name: newLabel.name.trim(),
                                  color: newLabel.color,
                                  guideLine: newLabel.guideLine.trim() || null,
                                  defaultChecklist: checklistStr || null,
                                  isDefault: newLabel.isDefault,
                                  projectId: selectedProject.id,
                                });
                                toast.success(t('datasets.editLabelSuccess'));
                              } else {
                                await labelService.createLabel({
                                  name: newLabel.name.trim(),
                                  color: newLabel.color,
                                  guideLine: newLabel.guideLine.trim() || null,
                                  defaultChecklist: checklistStr || null,
                                  isDefault: newLabel.isDefault,
                                  projectId: selectedProject.id,
                                });
                                toast.success(t('datasets.addLabelSuccess'));
                              }
                              resetLabelForm();
                              await handleProjectClick(selectedProject.id);
                            } catch {
                              toast.error(editingLabel ? t('datasets.editLabelFailed') : t('datasets.addLabelFailed'));
                            } finally {
                              setAddingLabel(false);
                            }
                          }}
                        >
                          {addingLabel ? (
                            <span className="spinner-border spinner-border-sm me-1" />
                          ) : (
                            <i className="ri-check-line me-1" />
                          )}
                          {t('common.save')}
                        </button>
                        <button
                          className="btn btn-sm btn-light px-3"
                          onClick={resetLabelForm}
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card shadow-none border">
                  <div
                    className="card-header bg-light-subtle"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleSection('annotators')}
                  >
                    <h6 className="card-title mb-0 fs-13 text-uppercase fw-bold text-muted d-flex align-items-center">
                      <i className={`ri-arrow-${collapsedSections.annotators ? 'right' : 'down'}-s-line me-1 fs-16`} />
                      <i className="ri-user-star-line me-1 text-success"></i>
                      {t('datasets.annotatorsSectionTitle')}
                      <span className="badge bg-success-subtle text-success ms-2">
                        {selectedProject.members?.filter(
                          (m) => m.role === "Annotator",
                        ).length || 0}
                      </span>
                    </h6>
                  </div>
                  {!collapsedSections.annotators && (
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
                  )}
                </div>

                <div className="card shadow-none border">
                  <div
                    className="card-header bg-light-subtle"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleSection('reviewers')}
                  >
                    <h6 className="card-title mb-0 fs-13 text-uppercase fw-bold text-muted d-flex align-items-center">
                      <i className={`ri-arrow-${collapsedSections.reviewers ? 'right' : 'down'}-s-line me-1 fs-16`} />
                      <i className="ri-shield-star-line me-1 text-info"></i>
                      {t('datasets.reviewersSectionTitle')}
                      <span className="badge bg-info-subtle text-info ms-2">
                        {selectedProject.members?.filter(
                          (m) => m.role === "Reviewer",
                        ).length || 0}
                      </span>
                    </h6>
                  </div>
                  {!collapsedSections.reviewers && (
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
                  )}
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
                        <span className="text-muted">{t('datasets.rejected')}:</span>
                        <span className="fw-bold text-danger">
                          {projectStats?.rejectedAssignments ?? 0}
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

                      <div className="border-top pt-3 mt-1">
                        <h6 className="mb-2 fw-bold text-uppercase fs-11 text-muted">
                          <i className="ri-team-line me-1" />
                          {t('datasets.teamOverview')}
                        </h6>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">
                            <i className="ri-group-line me-1 text-primary" />
                            {t('datasets.totalStaff')}:
                          </span>
                          <span className="fw-bold text-primary">
                            {selectedProject.members?.length || 0}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <span className="text-muted">
                            <i className="ri-user-star-line me-1 text-success" />
                            {t('datasets.totalAnnotators')}:
                          </span>
                          <span className="fw-bold text-success">
                            {selectedProject.members?.filter(m => m.role === "Annotator").length || 0}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <span className="text-muted">
                            <i className="ri-shield-star-line me-1 text-info" />
                            {t('datasets.totalReviewers')}:
                          </span>
                          <span className="fw-bold text-info">
                            {selectedProject.members?.filter(m => m.role === "Reviewer").length || 0}
                          </span>
                        </div>
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
