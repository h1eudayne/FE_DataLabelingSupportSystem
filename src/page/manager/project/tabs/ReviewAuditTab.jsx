import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormGroup,
  Spinner,
  Alert,
  Progress,
} from "reactstrap";
import { toast } from "react-toastify";
import projectService from "../../../../services/manager/project/projectService";
import reviewAuditService from "../../../../services/manager/review/reviewAuditService";
import useSignalRRefresh from "../../../../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";

const ReviewAuditTab = ({ projectId }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCorrectDecision, setIsCorrectDecision] = useState(true);
  const [auditComment, setAuditComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const samplingStats = useMemo(() => {
    const total = tasks.length;
    const audited = tasks.filter(
      (t) =>
        t.managerAuditDecision !== undefined && t.managerAuditDecision !== null
    ).length;
    const notAudited = total - audited;
    const samplingRate = total > 0 ? ((audited / total) * 100).toFixed(1) : 0;
    return { total, audited, notAudited, samplingRate };
  }, [tasks]);

  const reviewerStats = useMemo(() => {
    const auditedTasks = tasks.filter(
      (t) =>
        t.managerAuditDecision !== undefined && t.managerAuditDecision !== null
    );
    const totalAudited = auditedTasks.length;
    const overridden = auditedTasks.filter(
      (t) => t.managerAuditDecision === false
    ).length;
    const overrideRate =
      totalAudited > 0 ? ((overridden / totalAudited) * 100).toFixed(1) : 0;
    return { totalAudited, overridden, overrideRate };
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [resTasks, resDetail] = await Promise.all([
        reviewAuditService.getTasksForReview(projectId),
        projectService.getProjectById(projectId),
      ]);
      setTasks(resTasks.data || []);
      setProjectDetail(resDetail.data || null);
    } catch {
      toast.error(t("reviewAudit.loadTaskError"));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useSignalRRefresh(
    useCallback(() => {
      if (projectId) fetchTasks();
    }, [projectId, fetchTasks])
  );

  const openAuditModal = (task) => {
    setSelectedTask(task);
    setIsCorrectDecision(true);
    setAuditComment("");
    setModalOpen(true);
  };

  const handleRandomPick = () => {
    const unaudited = tasks.filter(
      (t) =>
        t.managerAuditDecision === undefined || t.managerAuditDecision === null
    );
    if (unaudited.length === 0) {
      toast.info(t("reviewAudit.allAudited"));
      return;
    }
    const randomTask = unaudited[Math.floor(Math.random() * unaudited.length)];
    openAuditModal(randomTask);
  };

  const handleAudit = async () => {
    if (!selectedTask) return;
    if (!auditComment.trim()) {
      toast.warning(t("reviewAudit.auditCommentWarning"));
      return;
    }
    setSubmitting(true);
    try {
      await reviewAuditService.auditReview({
        reviewLogId: selectedTask.reviewLogId || selectedTask.id,
        isCorrectDecision,
        auditComment,
      });
      toast.success(t("reviewAudit.auditSuccess"));
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || t("reviewAudit.auditError"));
    } finally {
      setSubmitting(false);
    }
  };

  const getDecisionBadge = (task) => {
    if (task.isApproved === true)
      return <Badge color="success">{t("statusCommon.approved")}</Badge>;
    if (task.isApproved === false)
      return <Badge color="danger">{t("statusCommon.rejected")}</Badge>;
    return <Badge color="warning">{t("statusCommon.pending")}</Badge>;
  };

  const guidelineVersion = useMemo(() => {
    if (!projectDetail) return null;
    const labelCount = projectDetail.labels?.length || 0;
    const updatedDate =
      projectDetail.endDate ||
      projectDetail.startDate ||
      projectDetail.deadline;
    return {
      version: labelCount,
      date: updatedDate
        ? new Date(updatedDate).toLocaleDateString("vi-VN")
        : t("statusCommon.notAvailable"),
      labelCount,
    };
  }, [projectDetail]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2" style={{ color: "var(--pd-text-secondary)" }}>{t("reviewAudit.loadingData")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="pd-info-banner mb-3">
        <i className="ri-information-line info-icon"></i>
        <div>
          <strong>{t("reviewAudit.samplingInfo")}</strong> —{" "}
          {t("reviewAudit.samplingDesc")}
        </div>
      </div>

      {tasks.length > 0 && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <Button color="warning" onClick={handleRandomPick}>
              <i className="ri-shuffle-line me-1"></i>
              {t("reviewAudit.randomPick")}
            </Button>
          </div>

          <Row className="mb-3 g-3">
            <Col md={3}>
              <div className="pd-stat-card stat-primary">
                <div className="stat-icon"><i className="ri-file-list-3-line"></i></div>
                <div className="stat-label">{t("reviewAudit.totalReviewed")}</div>
                <div className="stat-value">{samplingStats.total}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="pd-stat-card stat-success">
                <div className="stat-icon"><i className="ri-shield-check-line"></i></div>
                <div className="stat-label">{t("reviewAudit.audited")}</div>
                <div className="stat-value">{samplingStats.audited}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="pd-stat-card stat-warning">
                <div className="stat-icon"><i className="ri-time-line"></i></div>
                <div className="stat-label">{t("reviewAudit.notAudited")}</div>
                <div className="stat-value">{samplingStats.notAudited}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="pd-stat-card stat-info">
                <div className="stat-icon"><i className="ri-percent-line"></i></div>
                <div className="stat-label">{t("reviewAudit.samplingRate")}</div>
                <div className="stat-value">{samplingStats.samplingRate}%</div>
                <Progress value={samplingStats.samplingRate} color="info" className="mt-2" style={{ height: "4px" }} />
              </div>
            </Col>
          </Row>
        </>
      )}

      {reviewerStats.totalAudited > 0 && (
        <Row className="mb-3 g-3">
          <Col md={4}>
            <div className={`pd-override-card ${
              Number(reviewerStats.overrideRate) > 30 ? "override-danger" :
              Number(reviewerStats.overrideRate) > 15 ? "override-warning" : "override-success"
            }`}>
              <div className="override-label mb-2">
                <i className="ri-bar-chart-grouped-line me-1"></i>
                {t("reviewAudit.overrideRate")}
              </div>
              <div className="override-value">
                {reviewerStats.overrideRate}%
              </div>
              <small style={{ color: "var(--pd-text-muted)" }}>
                ({reviewerStats.overridden}/{reviewerStats.totalAudited}{" "}
                {t("reviewAudit.overridden")})
              </small>
              <div className="override-progress">
                <div
                  className="override-progress-bar"
                  style={{ width: `${reviewerStats.overrideRate}%` }}
                />
              </div>
              <small style={{ color: "var(--pd-text-muted)" }} className="d-block mt-2">
                {Number(reviewerStats.overrideRate) > 30
                  ? t("reviewAudit.overrideHigh")
                  : Number(reviewerStats.overrideRate) > 15
                    ? t("reviewAudit.overrideMedium")
                    : t("reviewAudit.overrideLow")}
              </small>
            </div>
          </Col>
          <Col md={4}>
            <div className="pd-override-card override-success">
              <div className="override-label mb-2">
                <i className="ri-thumb-up-line me-1"></i>
                {t("reviewAudit.agreeCorrect")}
              </div>
              <div className="override-value" style={{ color: "#0ab39c" }}>
                {reviewerStats.totalAudited - reviewerStats.overridden}
              </div>
              <small style={{ color: "var(--pd-text-muted)" }}>
                {t("reviewAudit.reviewerCorrect")}
              </small>
            </div>
          </Col>
          <Col md={4}>
            <div className="pd-override-card override-danger">
              <div className="override-label mb-2">
                <i className="ri-thumb-down-line me-1"></i>
                {t("reviewAudit.overrideLabel")}
              </div>
              <div className="override-value" style={{ color: "#f06548" }}>
                {reviewerStats.overridden}
              </div>
              <small style={{ color: "var(--pd-text-muted)" }}>
                {t("reviewAudit.managerDisagree")}
              </small>
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col xl={12}>
          <Card className="shadow-sm border-0">
            <CardHeader className="d-flex justify-content-between align-items-center" style={{ background: "var(--pd-table-header-bg)", borderBottom: "1px solid var(--pd-table-border)" }}>
              <h5 className="mb-0">
                <i className="ri-shield-check-line me-2 text-info"></i>
                {t("reviewAudit.reviewedTaskList")} ({tasks.length})
              </h5>
              <Badge color="soft-info" className="fs-12">
                <i className="ri-bar-chart-line me-1"></i>
                {t("statusCommon.sampling")}: {samplingStats.audited}/
                {samplingStats.total}
              </Badge>
            </CardHeader>
            <CardBody>
              {tasks.length === 0 ? (
                <div className="pd-empty-state">
                  <i className="ri-shield-check-line"></i>
                  <p>{t("reviewAudit.noTasks")}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>{t("reviewAudit.colAssignmentId")}</th>
                        <th>{t("reviewAudit.colAnnotator")}</th>
                        <th>{t("reviewAudit.colReviewerDecision")}</th>
                        <th>{t("reviewAudit.colComment")}</th>
                        <th>{t("reviewAudit.colAuditStatus")}</th>
                        <th>{t("reviewAudit.colAction")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, idx) => {
                        const isAudited =
                          task.managerAuditDecision !== undefined &&
                          task.managerAuditDecision !== null;
                        return (
                          <tr key={task.id || idx}>
                            <td>{idx + 1}</td>
                            <td>
                              <Badge color="soft-primary" className="fs-12">
                                #{task.assignmentId || task.id}
                              </Badge>
                            </td>
                            <td>
                              {task.annotatorName || task.annotatorId || "—"}
                            </td>
                            <td>{getDecisionBadge(task)}</td>
                            <td
                              className="text-truncate text-muted small"
                              style={{ maxWidth: "200px" }}
                            >
                              {task.comment || "—"}
                            </td>
                            <td>
                              {isAudited ? (
                                <Badge color="success">
                                  <i className="ri-check-line me-1"></i>
                                  {t("reviewAudit.statusAudited")}
                                </Badge>
                              ) : (
                                <Badge color="light" className="text-muted">
                                  {t("reviewAudit.statusNotAudited")}
                                </Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                color="info"
                                size="sm"
                                outline
                                onClick={() => openAuditModal(task)}
                              >
                                <i className="ri-shield-check-line me-1"></i>
                                {t("reviewAudit.auditBtn")}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setModalOpen(false)}>
          <i className="ri-shield-check-line me-2 text-info"></i>
          {t("reviewAudit.modalTitle")} #
          {selectedTask?.assignmentId || selectedTask?.id}
        </ModalHeader>
        <ModalBody>
          {selectedTask && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">{t("reviewAudit.reviewInfo")}</h6>
                <Row>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>{t("reviewAudit.reviewerDecisionLabel")}</strong>{" "}
                      {getDecisionBadge(selectedTask)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>{t("reviewAudit.errorCategory")}</strong>{" "}
                      {selectedTask.errorCategory ||
                        t("statusCommon.notAvailable")}
                    </p>
                  </Col>
                </Row>
                {selectedTask.comment && (
                  <p className="mb-0 mt-2">
                    <strong>{t("reviewAudit.reviewerComment")}</strong>{" "}
                    {selectedTask.comment}
                  </p>
                )}
              </div>

              {selectedTask.imageUrl && (
                <div className="mb-3 text-center">
                  <img
                    src={selectedTask.imageUrl}
                    alt="Assignment"
                    className="img-fluid rounded border"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              )}

              {projectDetail?.labels?.length > 0 && (
                <div className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 text-info">
                      <i className="ri-book-read-line me-1"></i>
                      {t("reviewAudit.guidelineRef")}
                    </h6>
                    {guidelineVersion && (
                      <Badge color="soft-primary" className="fs-12">
                        v{guidelineVersion.version} —{" "}
                        {t("reviewAudit.guidelineVersion")}{" "}
                        {guidelineVersion.date} — {guidelineVersion.labelCount}{" "}
                        {t("reviewAudit.labelCount")}
                      </Badge>
                    )}
                  </div>
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0" bordered>
                      <thead className="table-light">
                        <tr>
                          <th>{t("reviewAudit.labelCol")}</th>
                          <th>{t("reviewAudit.colorCol")}</th>
                          <th>{t("reviewAudit.guideCol")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectDetail.labels.map((label) => (
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
                              {label.guideLine || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              <FormGroup>
                <Label className="fw-semibold">
                  {t("reviewAudit.agreeQuestion")}
                </Label>
                <div className="d-flex gap-3">
                  <FormGroup check>
                    <Input
                      type="radio"
                      name="auditDecision"
                      checked={isCorrectDecision}
                      onChange={() => setIsCorrectDecision(true)}
                    />
                    <Label check className="text-success fw-semibold">
                      <i className="ri-thumb-up-line me-1"></i>
                      {t("reviewAudit.agreeLabel")}
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Input
                      type="radio"
                      name="auditDecision"
                      checked={!isCorrectDecision}
                      onChange={() => setIsCorrectDecision(false)}
                    />
                    <Label check className="text-danger fw-semibold">
                      <i className="ri-thumb-down-line me-1"></i>
                      {t("reviewAudit.disagreeLabel")}
                    </Label>
                  </FormGroup>
                </div>
              </FormGroup>

              <FormGroup>
                <Label className="fw-semibold">
                  {t("reviewAudit.auditComment")}
                  <small className="text-danger ms-1">
                    {t("reviewAudit.auditRequired")}
                  </small>
                </Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={auditComment}
                  onChange={(e) => setAuditComment(e.target.value)}
                  placeholder={t("reviewAudit.auditPlaceholder")}
                  className={!auditComment.trim() ? "border-danger" : ""}
                />
                {!auditComment.trim() && (
                  <small className="text-danger">
                    <i className="ri-error-warning-line me-1"></i>
                    {t("reviewAudit.auditCommentRequired")}
                  </small>
                )}
              </FormGroup>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setModalOpen(false)}>
            {t("reviewAudit.cancel")}
          </Button>
          <Button
            color="info"
            onClick={handleAudit}
            disabled={submitting || !auditComment.trim()}
          >
            {submitting ? (
              <Spinner size="sm" className="me-1" />
            ) : (
              <i className="ri-check-double-line me-1"></i>
            )}
            {t("reviewAudit.confirmAudit")}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ReviewAuditTab;
