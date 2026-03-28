import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import projectService from "../../../services/manager/project/projectService";
import { userService } from "../../../services/manager/project/userService";
import taskService from "../../../services/manager/project/taskService";
import Swal from "sweetalert2";

const ProjectAssignTask = ({ embeddedProjectId } = {}) => {
  const { t } = useTranslation();
  const { id: paramId } = useParams();
  const id = embeddedProjectId || paramId;
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.id;
  const [annotators, setAnnotators] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [annotatorMode, setAnnotatorMode] = useState("all");
  const [reviewerMode, setReviewerMode] = useState("all");
  const [selectedAnnotators, setSelectedAnnotators] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [quantityMode, setQuantityMode] = useState("all");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  const [assignLog, setAssignLog] = useState([]);
  const [annotatorSearch, setAnnotatorSearch] = useState("");
  const [reviewerSearch, setReviewerSearch] = useState("");
  const [lockingUserId, setLockingUserId] = useState(null);

  const fetchProject = useCallback(() => {
    setLoading(true);
    projectService
      .getProjectById(id)
      .then((res) => setProjectInfo(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchProject();

    userService.getUsers().then((res) => {
      const userList = res.data?.items || res.data || [];
      const annotatorList = (Array.isArray(userList) ? userList : []).filter(
        (u) => u.role?.toLowerCase() === "annotator" && u.id !== managerId,
      );
      const reviewerList = (Array.isArray(userList) ? userList : []).filter(
        (u) => u.role?.toLowerCase() === "reviewer",
      );
      setAnnotators(annotatorList);
      setReviewers(reviewerList);
    });
  }, [id, fetchProject]);

  
  const projectAnnotators = projectInfo?.members?.filter(
    (m) => m.role === "Annotator"
  ) || [];
  const projectReviewers = projectInfo?.members?.filter(
    (m) => m.role === "Reviewer"
  ) || [];

  const handleAssign = async () => {
    if (!projectInfo?.labels || projectInfo.labels.length === 0) {
      return Swal.fire(
        t("projectAssign.noLabelsError"),
        t("projectAssign.noLabelsErrorDesc"),
        "error",
      );
    }

    
    let targetAnnotators = [];
    if (annotatorMode === "all") {
      
      targetAnnotators = projectAnnotators.map((m) => ({
        id: m.id || m.userId,
        name: m.fullName,
      }));
      if (targetAnnotators.length === 0) {
        
        targetAnnotators = annotators.map((u) => ({
          id: u.id,
          name: u.fullName,
        }));
      }
    } else {
      if (selectedAnnotators.length === 0) {
        return Swal.fire(t("projectAssign.warning"), t("projectAssign.selectAnnotatorWarn"), "warning");
      }
      targetAnnotators = selectedAnnotators.map((aId) => {
        const found = annotators.find((u) => String(u.id) === String(aId));
        return { id: aId, name: found?.fullName || aId };
      });
    }

    if (targetAnnotators.length === 0) {
      return Swal.fire(t("projectAssign.warning"), t("projectAssign.selectAnnotatorWarn"), "warning");
    }

    
    let targetReviewers = [];
    if (reviewerMode === "all") {
      targetReviewers = projectReviewers.map((m) => ({
        id: m.id || m.userId,
        name: m.fullName,
      }));
      if (targetReviewers.length === 0) {
        targetReviewers = reviewers.map((u) => ({
          id: u.id,
          name: u.fullName,
        }));
      }
    } else {
      if (selectedReviewers.length === 0) {
        return Swal.fire(t("projectAssign.warning"), t("projectAssign.selectReviewerWarn"), "warning");
      }
      targetReviewers = selectedReviewers.map((rId) => {
        const found = reviewers.find((u) => String(u.id) === String(rId));
        return { id: rId, name: found?.fullName || rId };
      });
    }

    if (targetReviewers.length === 0) {
      return Swal.fire(t("projectAssign.warning"), t("projectAssign.selectReviewerWarn"), "warning");
    }

    
    const safeAvailable = Math.max(availableItems, 0);
    let qtyPerAnnotator;
    if (quantityMode === "all") {
      qtyPerAnnotator = Math.floor(safeAvailable / targetAnnotators.length);
      if (qtyPerAnnotator <= 0) {
        return Swal.fire(t("projectAssign.warning"), t("projectAssign.noImagesAvailable"), "warning");
      }
    } else {
      if (!quantity || Number(quantity) <= 0) {
        return Swal.fire(t("projectAssign.warning"), t("projectAssign.invalidQuantity"), "warning");
      }
      qtyPerAnnotator = Number(quantity);
    }

    
    const totalAssignments = targetAnnotators.length;
    const totalImages = quantityMode === "all" ? safeAvailable : qtyPerAnnotator * targetAnnotators.length;
    const confirmResult = await Swal.fire({
      title: t("projectAssign.confirmTitle") || "Confirm Assignment",
      html: `
        <div style="text-align:left; font-size:14px;">
          <p><strong>${t("projectAssign.annotatorCount") || "Annotators"}:</strong> ${targetAnnotators.length}</p>
          <p><strong>${t("projectAssign.reviewerCount") || "Reviewers"}:</strong> ${targetReviewers.length}</p>
          <p><strong>${t("projectAssign.imagesPerAnnotator") || "Images/Annotator"}:</strong> ~${qtyPerAnnotator}</p>
          <p><strong>${t("projectAssign.totalAssignments") || "Total calls"}:</strong> ${totalAssignments}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("projectAssign.submitBtn"),
      cancelButtonText: t("projectAssign.cancelBtn") || "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);
    const log = [];
    let successCount = 0;
    let errorCount = 0;
    let remaining = safeAvailable;

    try {
      for (let i = 0; i < targetAnnotators.length; i++) {
        const ann = targetAnnotators[i];
        
        const rev = targetReviewers[i % targetReviewers.length];

        let qty = qtyPerAnnotator;
        
        if (quantityMode === "all" && i === targetAnnotators.length - 1) {
          qty = remaining;
        }

        if (qty <= 0) continue;

        try {
          await taskService.assignTask({
            projectId: Number(id),
            annotatorIds: [String(ann.id)],
            totalQuantity: Number(qty),
            reviewerIds: rev.id ? [String(rev.id)] : [],
          });
          log.push({ annotator: ann.name, reviewer: rev.name, qty, status: "success" });
          successCount++;
          remaining -= qty;
        } catch (err) {
          console.error("Task assignment error:", err);
          log.push({
            annotator: ann.name,
            reviewer: rev.name,
            qty,
            status: "error",
            message: err.response?.data?.message || err.message,
          });
          errorCount++;
        }
      }

      setAssignLog(log);

      if (errorCount === 0) {
        Swal.fire(t("projectAssign.assignSuccess"), `${successCount} ${t("projectAssign.assignmentsCreated") || "assignments created successfully"}`, "success");
      } else {
        Swal.fire(
          t("projectAssign.partialSuccess") || "Partial Success",
          `${successCount} ${t("projectAssign.successMsgShort") || "succeeded"}, ${errorCount} ${t("projectAssign.failedMsgShort") || "failed"}`,
          "warning",
        );
      }

      
      setSelectedAnnotators([]);
      setSelectedReviewers([]);
      setQuantity("");
      setQuantityMode("custom");
      fetchProject();
    } catch (error) {
      console.error("API error details:", error.response?.data);
      Swal.fire(
        t("projectAssign.assignError"),
        error.response?.data?.message || t("projectAssign.assignErrorMsg"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !projectInfo)
    return <div className="p-5 text-center">{t("projectAssign.loading")}</div>;

  const totalItems = projectInfo?.totalDataItems ?? 0;
  const unassignedFromApi = projectInfo?.unassignedDataItemCount;
  const assignedItems =
    typeof unassignedFromApi === "number"
      ? Math.max(0, totalItems - unassignedFromApi)
      : (projectInfo?.members
          ?.filter((m) => m.role === "Annotator")
          .reduce((sum, m) => sum + (m.tasksAssigned || 0), 0) ?? 0);
  const processedItems = projectInfo?.processedItems ?? 0;
  const availableItems =
    typeof unassignedFromApi === "number"
      ? Math.max(0, unassignedFromApi)
      : Math.max(0, totalItems - assignedItems);
  const progressPercent = totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0;
  const assignPercent = totalItems > 0 ? Math.min(Math.round((assignedItems / totalItems) * 100), 100) : 0;

  
  const defaultLabels = projectInfo?.labels?.filter((l) => l.isDefault) || [];
  const projectLabels = projectInfo?.labels?.filter((l) => !l.isDefault) || [];

  return (
    <>
      <div className="row">
        <div className="col-12">
          <h4 className="mb-3 text-truncate" title={projectInfo?.name} style={{ maxWidth: '100%' }}>
            {t("projectAssign.title")}{" "}
            <span className="text-primary">{projectInfo?.name}</span>
          </h4>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">{t("projectAssign.projectInfo")}</h6>
              <button
                className="btn btn-sm btn-soft-primary"
                onClick={fetchProject}
                disabled={loading}
                title={t("common.refresh") || "Refresh"}
              >
                <i className={`ri-refresh-line ${loading ? 'ri-spin' : ''}`}></i>
              </button>
            </div>
            <div className="card-body">
              {}
              <div className="row mb-3 g-2">
                <div className="col-md-3 col-6">
                  <div className="border rounded p-2 text-center bg-primary-subtle">
                    <p className="text-muted mb-0 small">{t("projectAssign.totalImages")}</p>
                    <h5 className="text-primary mb-0 fw-bold">{totalItems}</h5>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="border rounded p-2 text-center bg-warning-subtle">
                    <p className="text-muted mb-0 small">{t("projectAssign.assigned")}</p>
                    <h5 className="text-warning mb-0 fw-bold">{assignedItems}</h5>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="border rounded p-2 text-center bg-info-subtle">
                    <p className="text-muted mb-0 small">{t("projectAssign.approved")}</p>
                    <h5 className="text-info mb-0 fw-bold">{processedItems}</h5>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className={`border rounded p-2 text-center ${availableItems > 0 ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                    <p className="text-muted mb-0 small">{t("projectAssign.available")}</p>
                    <h5 className={`mb-0 fw-bold ${availableItems > 0 ? "text-success" : "text-danger"}`}>
                      {Math.max(availableItems, 0)}
                    </h5>
                  </div>
                </div>
              </div>

              {}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-muted">{t("projectAssign.assignProgress") || "Assignment Progress"}</span>
                  <span className="fw-semibold">{assignPercent}%</span>
                </div>
                <div className="progress progress-sm mb-2" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: `${assignPercent}%` }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-muted">{t("projectAssign.completionProgress") || "Completion Progress"}</span>
                  <span className="fw-semibold">{progressPercent}%</span>
                </div>
                <div className="progress progress-sm" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {}
              {(!projectInfo?.labels || projectInfo.labels.length === 0) && (
                <div className="alert alert-danger py-2 small mb-3">
                  <i className="ri-error-warning-line me-1"></i>
                  <strong>BR-MNG-03:</strong> {t("projectAssign.noLabelsWarning")}
                </div>
              )}
              {availableItems < 0 && (
                <div className="alert alert-danger py-2 small mb-3">
                  <i className="ri-error-warning-line me-1"></i>
                  {t("projectAssign.overAssignedWarning")}
                </div>
              )}
              {availableItems === 0 && totalItems > 0 && (
                <div className="alert alert-warning py-2 small mb-3">
                  <i className="ri-information-line me-1"></i>
                  {t("projectAssign.allAssignedWarning")} <strong>(BR-MNG-08)</strong>.
                </div>
              )}
              {processedItems > 0 && availableItems > 0 && (
                <div className="alert alert-info py-2 small mb-3">
                  <i className="ri-shield-check-line me-1"></i>
                  <strong>{processedItems}</strong> {t("projectAssign.partialApprovedInfo")} <strong>{availableItems}</strong>{" "}
                  {t("projectAssign.canAssign")}
                </div>
              )}

              {}
              <div className="mb-3">
                <h6 className="fw-bold mb-2">{t("projectAssign.projectLabels")}</h6>
                {defaultLabels.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted fw-semibold d-block mb-1">
                      <i className="ri-flag-line me-1"></i>
                      {t("datasets.labelDefault") || "Default"}
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {defaultLabels.map((l) => (
                        <span key={l.id} className="badge" style={{ backgroundColor: l.color + "20", color: l.color, border: `1px solid ${l.color}`, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.name}>
                          <i className="ri-error-warning-line me-1"></i>{l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {projectLabels.length > 0 && (
                  <div>
                    <small className="text-muted fw-semibold d-block mb-1">
                      <i className="ri-folder-line me-1"></i>
                      {t("datasets.labelProject") || "Project"}
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {projectLabels.map((l) => (
                        <span key={l.id} className="badge" style={{ backgroundColor: l.color + "20", color: l.color, border: `1px solid ${l.color}`, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.name}>
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {defaultLabels.length === 0 && projectLabels.length === 0 && projectInfo?.labels?.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {projectInfo.labels.map((l) => (
                      <span key={l.id} className="badge" style={{ backgroundColor: l.color + "20", color: l.color, border: `1px solid ${l.color}`, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.name}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {}
              {projectInfo?.members?.length > 0 && (
                <div>
                  <h6 className="fw-bold mb-2">{t("projectAssign.assignedMembers")}</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>{t("projectAssign.colName")}</th>
                          <th>{t("projectAssign.colRole")}</th>
                          <th className="text-center">{t("projectAssign.colTasks")}</th>
                          <th className="text-center">{t("projectAssign.colCompleted")}</th>
                          <th className="text-center">{t("projectAssign.colProgress")}</th>
                          <th className="text-center">{t("projectAssign.colStatus", { defaultValue: "Status" })}</th>
                          <th className="text-center">{t("projectAssign.colAction", { defaultValue: "Action" })}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectInfo.members.map((m) => {
                          const memberProgress = m.tasksAssigned > 0 ? Math.round((m.tasksCompleted / m.tasksAssigned) * 100) : 0;
                          return (
                            <tr key={m.id}>
                              <td className="text-truncate" style={{ maxWidth: '150px' }} title={m.fullName}>{m.fullName}</td>
                              <td>
                                <span className={`badge ${m.role === "Annotator" ? "bg-success-subtle text-success" : "bg-info-subtle text-info"}`}>{m.role}</span>
                              </td>
                              <td className="text-center">{m.tasksAssigned}</td>
                              <td className="text-center">{m.tasksCompleted}</td>
                              <td className="text-center" style={{ minWidth: '100px' }}>
                                <div className="d-flex align-items-center gap-1">
                                  <div className="progress flex-grow-1" style={{ height: '5px' }}>
                                    <div className="progress-bar bg-success" style={{ width: `${memberProgress}%` }}></div>
                                  </div>
                                  <small className="fw-semibold" style={{ minWidth: '30px' }}>{memberProgress}%</small>
                                </div>
                              </td>
                              <td className="text-center">
                                {m.isLocked ? (
                                  <span className="badge bg-danger-subtle text-danger">
                                    <i className="ri-lock-line me-1"></i>
                                    {t("projectAssign.locked", { defaultValue: "Locked" })}
                                  </span>
                                ) : (
                                  <span className="badge bg-success-subtle text-success">
                                    <i className="ri-lock-unlock-line me-1"></i>
                                    {t("projectAssign.active", { defaultValue: "Active" })}
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <button
                                  className={`btn btn-sm ${m.isLocked ? 'btn-soft-success' : 'btn-soft-warning'} border-0`}
                                  disabled={lockingUserId === (m.id || m.userId)}
                                  title={m.isLocked
                                    ? t("projectAssign.unlockUser", { defaultValue: "Unlock user" })
                                    : t("projectAssign.lockUser", { defaultValue: "Lock user" })
                                  }
                                  onClick={async () => {
                                    const userId = m.id || m.userId;
                                    const newLock = !m.isLocked;
                                    const confirm = await Swal.fire({
                                      title: newLock
                                        ? t("projectAssign.confirmLock", { defaultValue: "Lock this user?" })
                                        : t("projectAssign.confirmUnlock", { defaultValue: "Unlock this user?" }),
                                      text: newLock
                                        ? t("projectAssign.lockDesc", { defaultValue: "Locked users cannot work on tasks in this project." })
                                        : t("projectAssign.unlockDesc", { defaultValue: "This user will be able to work on tasks again." }),
                                      icon: "question",
                                      showCancelButton: true,
                                      confirmButtonText: newLock
                                        ? t("projectAssign.lockBtn", { defaultValue: "Lock" })
                                        : t("projectAssign.unlockBtn", { defaultValue: "Unlock" }),
                                    });
                                    if (!confirm.isConfirmed) return;
                                    setLockingUserId(userId);
                                    try {
                                      await projectService.toggleUserLock(id, userId, newLock);
                                      fetchProject();
                                      Swal.fire({
                                        icon: "success",
                                        title: newLock
                                          ? t("projectAssign.lockSuccess", { defaultValue: "User locked" })
                                          : t("projectAssign.unlockSuccess", { defaultValue: "User unlocked" }),
                                        timer: 1500,
                                        showConfirmButton: false,
                                      });
                                    } catch (err) {
                                      Swal.fire("Error", err.response?.data?.message || err.message, "error");
                                    } finally {
                                      setLockingUserId(null);
                                    }
                                  }}
                                >
                                  {lockingUserId === (m.id || m.userId) ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : m.isLocked ? (
                                    <i className="ri-lock-unlock-line"></i>
                                  ) : (
                                    <i className="ri-lock-line"></i>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="card mt-3 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">{t("projectAssign.guideline")}</h6>
                <span className="badge bg-soft-primary text-primary fs-12">
                  {projectInfo?.labels?.length || 0} {t("projectAssign.labels")}
                </span>
              </div>
              <div className="p-3 bg-light rounded text-muted">
                {projectInfo?.description || t("projectAssign.noGuideline")}
              </div>
            </div>
          </div>

          {}
          {assignLog.length > 0 && (
            <div className="card mt-3 shadow-sm border-0">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0">
                  <i className="ri-file-list-3-line me-1"></i>
                  {t("projectAssign.assignmentLog") || "Assignment Log"}
                </h6>
                <button className="btn btn-sm btn-soft-secondary" onClick={() => setAssignLog([])}>
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Annotator</th>
                        <th>Reviewer</th>
                        <th className="text-center">{t("projectAssign.colTasks")}</th>
                        <th className="text-center">{t("projectAssign.colStatus") || "Status"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignLog.map((entry, idx) => (
                        <tr key={idx}>
                          <td className="small">{entry.annotator}</td>
                          <td className="small">{entry.reviewer}</td>
                          <td className="text-center">{entry.qty}</td>
                          <td className="text-center">
                            {entry.status === "success" ? (
                              <span className="badge bg-success-subtle text-success">✓</span>
                            ) : (
                              <span className="badge bg-danger-subtle text-danger" title={entry.message}>✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-bold mb-3 text-uppercase fs-12">
                {t("projectAssign.newAssignment")}
              </h6>

              <div className="alert alert-info py-2 small mb-2">
                <i className="ri-shield-user-line me-1"></i>
                {t("projectAssign.onlyManager")}
              </div>

              <div className="alert alert-light border py-2 small mb-3">
                <i className="ri-group-line me-1"></i>
                {t("projectAssign.multiAssign")}
              </div>

              {}
              <div className="mb-3">
                <label className="form-label fw-bold mb-1">
                  <i className="ri-user-line me-1 text-success"></i>
                  {t("projectAssign.selectAnnotator")}
                </label>
                <div className="btn-group w-100 mb-2" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${annotatorMode === "all" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setAnnotatorMode("all")}
                  >
                    <i className="ri-team-line me-1"></i>
                    {t("projectAssign.allInProject") || "All in Project"} ({projectAnnotators.length || annotators.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${annotatorMode === "individual" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setAnnotatorMode("individual")}
                  >
                    <i className="ri-user-line me-1"></i>
                    {t("projectAssign.individual") || "Individual"}
                  </button>
                </div>
                {annotatorMode === "individual" && (
                  <div className="border rounded">
                    <div className="p-2 border-bottom">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={t("projectAssign.searchPlaceholder") || "Search by name or email..."}
                        value={annotatorSearch}
                        onChange={(e) => setAnnotatorSearch(e.target.value)}
                      />
                    </div>
                    <div className="p-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {annotators.length === 0 ? (
                        <small className="text-muted">{t("projectAssign.noAnnotatorsAvailable") || "No annotators available"}</small>
                      ) : (() => {
                        const filtered = annotators.filter((u) =>
                          u.fullName?.toLowerCase().includes(annotatorSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(annotatorSearch.toLowerCase())
                        );
                        return filtered.length === 0 ? (
                          <small className="text-muted">{t("projectAssign.noResults") || "No results found"}</small>
                        ) : filtered.map((u) => (
                          <div key={u.id} className="form-check mb-1">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`ann-${u.id}`}
                              checked={selectedAnnotators.includes(String(u.id))}
                              onChange={() => {
                                setSelectedAnnotators((prev) =>
                                  prev.includes(String(u.id))
                                    ? prev.filter((id) => id !== String(u.id))
                                    : [...prev, String(u.id)]
                                );
                              }}
                            />
                            <label className="form-check-label small" htmlFor={`ann-${u.id}`}>
                              {u.fullName} <span className="text-muted">({u.email})</span>
                            </label>
                          </div>
                        ));
                      })()}
                    </div>
                    {annotators.length > 0 && (
                      <div className="border-top px-2 py-1">
                        <small className="text-muted">
                          {t("projectAssign.selected") || "Selected"}: {selectedAnnotators.length}/{annotators.length}
                        </small>
                      </div>
                    )}
                  </div>
                )}
                {annotatorMode === "all" && (
                  <div className="border rounded p-2 bg-success-subtle">
                    <small className="text-success">
                      <i className="ri-check-double-line me-1"></i>
                      {t("projectAssign.allAnnotatorsSelected") || "All annotators in project will be assigned"}
                      {projectAnnotators.length > 0 && (
                        <span className="d-block mt-1 text-muted">
                          {projectAnnotators.map((m) => m.fullName).join(", ")}
                        </span>
                      )}
                    </small>
                  </div>
                )}
              </div>

              {}
              <div className="mb-3">
                <label className="form-label fw-bold mb-1">
                  <i className="ri-user-star-line me-1 text-info"></i>
                  {t("projectAssign.selectReviewer")}
                </label>
                <div className="btn-group w-100 mb-2" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${reviewerMode === "all" ? "btn-info" : "btn-outline-info"}`}
                    onClick={() => setReviewerMode("all")}
                  >
                    <i className="ri-team-line me-1"></i>
                    {t("projectAssign.allInProject") || "All in Project"} ({projectReviewers.length || reviewers.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${reviewerMode === "individual" ? "btn-info" : "btn-outline-info"}`}
                    onClick={() => setReviewerMode("individual")}
                  >
                    <i className="ri-user-line me-1"></i>
                    {t("projectAssign.individual") || "Individual"}
                  </button>
                </div>
                {reviewerMode === "individual" && (
                  <div className="border rounded">
                    <div className="p-2 border-bottom">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={t("projectAssign.searchPlaceholder") || "Search by name or email..."}
                        value={reviewerSearch}
                        onChange={(e) => setReviewerSearch(e.target.value)}
                      />
                    </div>
                    <div className="p-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {reviewers.length === 0 ? (
                        <small className="text-muted">{t("projectAssign.noReviewersAvailable") || "No reviewers available"}</small>
                      ) : (() => {
                        const filtered = reviewers.filter((u) =>
                          u.fullName?.toLowerCase().includes(reviewerSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(reviewerSearch.toLowerCase())
                        );
                        return filtered.length === 0 ? (
                          <small className="text-muted">{t("projectAssign.noResults") || "No results found"}</small>
                        ) : filtered.map((u) => (
                          <div key={u.id} className="form-check mb-1">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`rev-${u.id}`}
                              checked={selectedReviewers.includes(String(u.id))}
                              onChange={() => {
                                setSelectedReviewers((prev) =>
                                  prev.includes(String(u.id))
                                    ? prev.filter((id) => id !== String(u.id))
                                    : [...prev, String(u.id)]
                                );
                              }}
                            />
                            <label className="form-check-label small" htmlFor={`rev-${u.id}`}>
                              {u.fullName} <span className="text-muted">({u.email})</span>
                            </label>
                          </div>
                        ));
                      })()}
                    </div>
                    {reviewers.length > 0 && (
                      <div className="border-top px-2 py-1">
                        <small className="text-muted">
                          {t("projectAssign.selected") || "Selected"}: {selectedReviewers.length}/{reviewers.length}
                        </small>
                      </div>
                    )}
                  </div>
                )}
                {reviewerMode === "all" && (
                  <div className="border rounded p-2 bg-info-subtle">
                    <small className="text-info">
                      <i className="ri-check-double-line me-1"></i>
                      {t("projectAssign.allReviewersSelected") || "Reviewers assigned by round-robin"}
                      {projectReviewers.length > 0 && (
                        <span className="d-block mt-1 text-muted">
                          {projectReviewers.map((m) => m.fullName).join(", ")}
                        </span>
                      )}
                    </small>
                  </div>
                )}
              </div>

              {}
              <div className="mb-3">
                <label className="form-label fw-bold mb-1">
                  <i className="ri-image-line me-1 text-primary"></i>
                  {t("projectAssign.imageQuantity")}
                </label>
                <div className="btn-group w-100 mb-2" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${quantityMode === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => { setQuantityMode("all"); setQuantity(""); }}
                  >
                    <i className="ri-checkbox-multiple-line me-1"></i>
                    {t("projectAssign.allAvailable") || "All Available"} ({Math.max(availableItems, 0)})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${quantityMode === "custom" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setQuantityMode("custom")}
                  >
                    <i className="ri-edit-line me-1"></i>
                    {t("projectAssign.customQuantity") || "Custom"}
                  </button>
                </div>
                {quantityMode === "custom" ? (
                  <>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="1"
                      max={Math.max(availableItems, 0)}
                      placeholder={`${t("projectAssign.maxPlaceholder")} ${Math.max(availableItems, 0)}`}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <small className={`${availableItems <= 0 ? 'text-danger' : 'text-muted'}`}>
                      {availableItems <= 0
                        ? t("projectAssign.noImagesAvailable")
                        : t("projectAssign.unassignedCount", { count: Math.max(availableItems, 0) })
                      }
                    </small>
                  </>
                ) : (
                  <div className="border rounded p-2 bg-primary-subtle">
                    <small className="text-primary">
                      <i className="ri-check-double-line me-1"></i>
                      {t("projectAssign.allAvailableDesc") || "All available images will be distributed evenly across selected annotators"}
                      <span className="d-block mt-1 fw-semibold">
                        ~{Math.max(availableItems, 0)} {t("projectAssign.imagesToAssign") || "images to assign"}
                      </span>
                    </small>
                  </div>
                )}
              </div>

              {}
              <div className="border rounded p-2 mb-3 bg-light">
                <small className="fw-bold d-block mb-1">{t("projectAssign.summary") || "Summary"}:</small>
                <small className="text-muted d-block">
                  • Annotators: {annotatorMode === "all" ? `${t("projectAssign.allLabel") || "All"} (${projectAnnotators.length || annotators.length})` : (selectedAnnotators.length > 0 ? selectedAnnotators.length : "—")}
                </small>
                <small className="text-muted d-block">
                  • Reviewers: {reviewerMode === "all" ? `${t("projectAssign.allLabel") || "All"} (${projectReviewers.length || reviewers.length})` : (selectedReviewers.length > 0 ? selectedReviewers.length : "—")}
                </small>
                <small className="text-muted d-block">
                  • {t("projectAssign.imagesLabel") || "Images"}: {quantityMode === "all" ? `${t("projectAssign.allLabel") || "All"} (${Math.max(availableItems, 0)})` : (quantity || "—")}
                </small>
              </div>

              <button
                className="btn btn-success w-100 py-2 fw-bold"
                onClick={handleAssign}
                disabled={
                  loading ||
                  availableItems <= 0 ||
                  !projectInfo?.labels?.length
                }
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    {t("projectAssign.processingBtn")}
                  </>
                ) : t("projectAssign.submitBtn")}
              </button>

              <button
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={() => navigate("/projects-all-projects")}
              >
                <i className="ri-arrow-left-line me-1"></i>
                {t("projectAssign.backToProjects")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectAssignTask;
