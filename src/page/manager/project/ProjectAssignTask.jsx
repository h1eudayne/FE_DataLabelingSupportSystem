import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import projectService from "../../../services/manager/project/projectService";
import { userService } from "../../../services/manager/project/userService";
import taskService from "../../../services/manager/project/taskService";
import Swal from "sweetalert2";

const ProjectAssignTask = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.id;
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
      .getProjectById(id)
      .then((res) => {
        setProjectInfo(res.data);
      })
      .finally(() => setLoading(false));

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
  }, [id]);

  const handleAssign = async () => {
    if (!projectInfo?.labels || projectInfo.labels.length === 0) {
      return Swal.fire(
        t("projectAssign.noLabelsError"),
        t("projectAssign.noLabelsErrorDesc"),
        "error",
      );
    }
    if (!selectedAnnotator) {
      return Swal.fire(t("projectAssign.warning"), t("projectAssign.selectAnnotatorWarn"), "warning");
    }
    if (selectedAnnotator === managerId) {
      return Swal.fire(
        t("projectAssign.selfAssignError"),
        t("projectAssign.managerSelfAssign"),
        "error",
      );
    }
    if (!selectedReviewer) {
      return Swal.fire(t("projectAssign.warning"), t("projectAssign.selectReviewerWarn"), "warning");
    }
    if (!quantity || Number(quantity) <= 0) {
      return Swal.fire(
        t("projectAssign.warning"),
        t("projectAssign.invalidQuantity"),
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

      Swal.fire(t("projectAssign.assignSuccess"), t("projectAssign.assignSuccessMsg"), "success");
      navigate("/projects-all-projects");
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
  const assignedItems =
    projectInfo?.members?.reduce((sum, m) => sum + (m.tasksAssigned || 0), 0) ??
    0;
  const processedItems = projectInfo?.processedItems ?? 0;
  const availableItems = totalItems - assignedItems;

  return (
    <>
      <div className="row">
        <div className="col-12">
          <h4 className="mb-3">{t("projectAssign.title")} {projectInfo?.name}</h4>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0">{t("projectAssign.projectInfo")}</h6>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-3">
                  <p className="text-muted mb-1 small">{t("projectAssign.totalImages")}</p>
                  <h5 className="text-primary">{totalItems}</h5>
                </div>
                <div className="col-md-3">
                  <p className="text-muted mb-1 small">{t("projectAssign.assigned")}</p>
                  <h5 className="text-warning">{assignedItems}</h5>
                </div>
                <div className="col-md-3">
                  <p className="text-muted mb-1 small">{t("projectAssign.approved")}</p>
                  <h5 className="text-info">{processedItems}</h5>
                </div>
                <div className="col-md-3">
                  <p className="text-muted mb-1 small">{t("projectAssign.available")}</p>
                  <h5
                    className={
                      availableItems > 0 ? "text-success" : "text-danger"
                    }
                  >
                    {availableItems}
                  </h5>
                </div>
              </div>

              {/* BR-MNG-03: Warning if no labels defined */}
              {(!projectInfo?.labels || projectInfo.labels.length === 0) && (
                <div className="alert alert-danger py-2 small mb-3">
                  <i className="ri-error-warning-line me-1"></i>
                  <strong>BR-MNG-03:</strong> {t("projectAssign.noLabelsWarning")}
                </div>
              )}

              {/* BR-MNG-08: Warning if all items approved or assigned */}
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

              <div className="mb-3">
                <h6 className="fw-bold mb-2">{t("projectAssign.projectLabels")}</h6>
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
                  <h6 className="fw-bold mb-2">{t("projectAssign.assignedMembers")}</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>{t("projectAssign.colName")}</th>
                          <th>{t("projectAssign.colRole")}</th>
                          <th>{t("projectAssign.colTasks")}</th>
                          <th>{t("projectAssign.colCompleted")}</th>
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">{t("projectAssign.guideline")}</h6>
                <span className="badge bg-soft-primary text-primary fs-12">
                  v{projectInfo?.labels?.length || 0} —{" "}
                  {projectInfo?.labels?.length || 0} {t("projectAssign.labels")}
                </span>
              </div>
              <div className="p-3 bg-light rounded text-muted">
                {projectInfo?.description || t("projectAssign.noGuideline")}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3 text-uppercase fs-12">
                {t("projectAssign.newAssignment")}
              </h6>

              <div className="alert alert-info py-2 small mb-3">
                <i className="ri-shield-user-line me-1"></i>
                {t("projectAssign.onlyManager")}
              </div>

              <div className="alert alert-danger py-2 small mb-3">
                <i className="ri-forbid-line me-1"></i>
                {t("projectAssign.managerSelfAssign")}
              </div>

              <div className="alert alert-light border py-2 small mb-3">
                <i className="ri-group-line me-1"></i>
                {t("projectAssign.multiAssign")}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">{t("projectAssign.selectAnnotator")}</label>
                <select
                  className="form-select"
                  value={selectedAnnotator}
                  onChange={(e) => setSelectedAnnotator(e.target.value)}
                >
                  <option value="">
                    {t("projectAssign.selectAnnotatorOption")} ({annotators.length}) --
                  </option>
                  {annotators.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">{t("projectAssign.selectReviewer")}</label>
                <select
                  className="form-select"
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                >
                  <option value="">
                    {t("projectAssign.selectReviewerOption")} ({reviewers.length}) --
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
                  {t("projectAssign.imageQuantity")}
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max={availableItems}
                  placeholder={`${t("projectAssign.maxPlaceholder")} ${availableItems}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <small className="text-muted">
                  {t("projectAssign.unassignedCount", { count: availableItems })}
                </small>
              </div>

              <button
                className="btn btn-success w-100 py-2 fw-bold"
                onClick={handleAssign}
                disabled={
                  loading ||
                  availableItems === 0 ||
                  !projectInfo?.labels?.length
                }
              >
                {loading ? t("projectAssign.processingBtn") : t("projectAssign.submitBtn")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectAssignTask;
