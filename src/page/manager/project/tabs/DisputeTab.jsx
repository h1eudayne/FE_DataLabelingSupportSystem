import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "reactstrap";
import { toast } from "react-toastify";
import projectService from "../../../../services/manager/project/projectService";
import disputeService from "../../../../services/manager/dispute/disputeService";
import useSignalRRefresh from "../../../../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";

const DisputeTab = ({ projectId }) => {
  const { t } = useTranslation();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isAccepted, setIsAccepted] = useState(true);
  const [managerComment, setManagerComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ESCALATION_DAYS = 3;

  const isEscalated = (dispute) => {
    if (dispute.status !== "Pending" || !dispute.createdAt) return false;
    const diffMs = new Date() - new Date(dispute.createdAt);
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) >= ESCALATION_DAYS;
  };

  const getDaysPending = (createdAt) => {
    if (!createdAt) return 0;
    return Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
  };

  const stats = useMemo(() => {
    const total = disputes.length;
    const pending = disputes.filter((d) => d.status === "Pending").length;
    const resolved = disputes.filter((d) => d.status === "Resolved").length;
    const rejected = disputes.filter((d) => d.status === "Rejected").length;
    const escalated = disputes.filter((d) => isEscalated(d)).length;
    return { total, pending, resolved, rejected, escalated };
  }, [disputes]);

  const fetchDisputes = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [resDisputes, resDetail] = await Promise.all([
        disputeService.getDisputes(projectId),
        projectService.getProjectById(projectId),
      ]);
      setDisputes(resDisputes.data || []);
      setProjectDetail(resDetail.data || null);
    } catch {
      toast.error(t("dispute.loadDisputeError"));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  useSignalRRefresh(
    useCallback(() => {
      if (projectId) fetchDisputes();
    }, [projectId, fetchDisputes])
  );

  const openResolveModal = (dispute) => {
    setSelectedDispute(dispute);
    setIsAccepted(true);
    setManagerComment("");
    setModalOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;
    if (!managerComment.trim()) {
      toast.warning(t("dispute.commentWarning"));
      return;
    }
    setSubmitting(true);
    try {
      await disputeService.resolveDispute({
        disputeId: selectedDispute.id,
        isAccepted,
        managerComment,
      });
      toast.success(t("dispute.resolveSuccess"));
      setModalOpen(false);
      fetchDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || t("dispute.resolveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: { cls: "dispute-badge-pending", text: t("dispute.statusPending") },
      Resolved: { cls: "dispute-badge-resolved", text: t("dispute.statusResolved") },
      Rejected: { cls: "dispute-badge-rejected", text: t("dispute.statusRejected") },
    };
    const s = map[status] || { cls: "dispute-badge-pending", text: status };
    return <span className={`dispute-badge ${s.cls}`}>{s.text}</span>;
  };

  const getVerdictBadge = (verdict) => {
    if (verdict === "Approved" || verdict === "Approve") {
      return <Badge color="success"><i className="ri-check-line me-1"></i>Approved</Badge>;
    }
    return <Badge color="danger"><i className="ri-close-line me-1"></i>Rejected</Badge>;
  };

  const analyzeReviewerFeedback = (feedbacks) => {
    const approved = feedbacks?.find(f => f.verdict === "Approved" || f.verdict === "Approve");
    const rejected = feedbacks?.find(f => f.verdict === "Rejected" || f.verdict === "Reject");
    return { approved, rejected };
  };

  const countVotes = (feedbacks) => {
    const approved = feedbacks?.filter(f => f.verdict === "Approved" || f.verdict === "Approve") || [];
    const rejected = feedbacks?.filter(f => f.verdict === "Rejected" || f.verdict === "Reject") || [];
    const total = approved.length + rejected.length;
    const isConflict = total >= 2 && approved.length === rejected.length;
    return { approvedCount: approved.length, rejectedCount: rejected.length, total, isConflict };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2" style={{ color: "var(--pd-text-secondary)" }}>
          {t("dispute.loadingData")}
        </p>
      </div>
    );
  }

  return (
    <>
      { }
      <Row className="mb-3 g-3">
        <Col md={3}>
          <div className="pd-stat-card stat-primary">
            <div className="stat-label">{t("dispute.totalDisputes")}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="pd-stat-card stat-warning">
            <div className="stat-label">{t("dispute.statusPending")}</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="pd-stat-card stat-success">
            <div className="stat-label">{t("dispute.statusResolved")}</div>
            <div className="stat-value">{stats.resolved}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="pd-stat-card stat-danger">
            <div className="stat-label">{t("dispute.statusRejected")}</div>
            <div className="stat-value">{stats.rejected}</div>
          </div>
        </Col>
      </Row>

      { }
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ color: "var(--pd-text-primary)" }}>
                {t("dispute.disputeLog")}
              </h5>
              <Button color="light" size="sm" className="border">
                <i className="ri-filter-3-line me-1"></i>
                {t("dispute.filter")}
              </Button>
            </CardHeader>
            <CardBody>
              {disputes.length === 0 ? (
                <div className="pd-empty-state">
                  <i className="ri-scales-3-line"></i>
                  <p>{t("dispute.noDisputes")}</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table className="table-hover align-middle mb-0 dispute-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{t("dispute.colAssignmentId")}</th>
                          <th>{t("dispute.colReason")}</th>
                          <th>{t("dispute.colStatus")}</th>
                          <th>{t("dispute.colCreatedAt")}</th>
                          <th className="text-end">{t("dispute.colAction")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disputes.map((d, idx) => (
                          <tr key={d.id}>
                            <td style={{ color: "var(--pd-text-muted)" }}>{idx + 1}</td>
                            <td>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  color: "var(--pd-tab-active-text)",
                                  fontWeight: 500,
                                }}
                              >
                                #{d.assignmentId}
                              </span>
                            </td>
                            <td style={{ maxWidth: "300px" }}>
                              <span className="d-block fw-medium" style={{ color: "var(--pd-text-primary)" }}>
                                {d.reason?.length > 40 ? d.reason.substring(0, 40) + "..." : d.reason}
                              </span>
                              {d.reason?.length > 40 && (
                                <small style={{ color: "var(--pd-text-muted)" }}>
                                  {d.reason.substring(40, 80)}...
                                </small>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                {getStatusBadge(d.status)}
                                {isEscalated(d) && (
                                  <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: "10px" }}>
                                    <i className="ri-alarm-warning-line me-1"></i>
                                    {t("dispute.escalated")}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ color: "var(--pd-text-muted)" }}>
                              {d.createdAt
                                ? new Date(d.createdAt).toLocaleDateString("vi-VN")
                                : "—"}
                              {d.status === "Pending" && d.createdAt && (
                                <div style={{ fontSize: "10px", color: isEscalated(d) ? "var(--bs-danger)" : "var(--pd-text-muted)" }}>
                                  {getDaysPending(d.createdAt)}d {t("dispute.ago")}
                                </div>
                              )}
                            </td>
                            <td className="text-end">
                              {d.status === "Pending" ? (
                                <button className="dispute-btn-resolve" onClick={() => openResolveModal(d)}>
                                  {t("dispute.resolve")}
                                </button>
                              ) : (
                                <button className="dispute-btn-view" onClick={() => openResolveModal(d)}>
                                  {t("dispute.view")}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  { }
                  <div
                    className="d-flex align-items-center justify-content-between px-3 py-3 border-top"
                    style={{
                      color: "var(--pd-text-muted)",
                      fontSize: "0.8rem",
                      borderColor: "var(--pd-table-border)",
                    }}
                  >
                    <span>
                      {t("dispute.showing")} {disputes.length} {t("dispute.of")} {stats.total} {t("dispute.results")}
                    </span>
                    <div className="d-flex gap-2">
                      <Button color="light" size="sm" disabled className="border">
                        {t("dispute.previous")}
                      </Button>
                      <Button color="light" size="sm" className="border">
                        {t("dispute.next")}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      { }
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setModalOpen(false)}>
          <i className="ri-scales-3-line me-2 text-primary"></i>
          {selectedDispute?.status === "Pending"
            ? t("dispute.modalTitle")
            : t("dispute.viewModalTitle")}{" "}
          #{selectedDispute?.id}
        </ModalHeader>
        <ModalBody>
          {selectedDispute && (
            <>
              {isEscalated(selectedDispute) && (
                <Alert color="danger" className="d-flex align-items-start gap-2 mb-3">
                  <i className="ri-alarm-warning-line fs-5 mt-1"></i>
                  <div>
                    <strong>{t("dispute.escalationWarning")}</strong>
                    <p className="mb-0 small">
                      {t("dispute.escalationDesc", {
                        days: getDaysPending(selectedDispute.createdAt),
                        defaultValue: `This dispute has been pending for ${getDaysPending(selectedDispute.createdAt)} days. It may be escalated to Admin if not resolved soon.`
                      })}
                    </p>
                  </div>
                </Alert>
              )}



              <div className="mb-3 p-3 rounded" style={{ background: "var(--pd-table-header-bg)" }}>
                <h6 className="fw-bold mb-2" style={{ color: "var(--pd-text-primary)" }}>
                  {t("dispute.complaintInfo")}
                </h6>
                <p className="mb-1">
                  <strong>Assignment ID:</strong>{" "}
                  <Badge color="primary">#{selectedDispute.assignmentId}</Badge>
                </p>
                <p className="mb-1" style={{ color: "var(--pd-text-primary)" }}>
                  <strong>{t("dispute.reason")}</strong> {selectedDispute.reason}
                </p>
                <p className="mb-1">
                  <strong>{t("dispute.colCreatedAt")}:</strong>{" "}
                  {selectedDispute.createdAt
                    ? new Date(selectedDispute.createdAt).toLocaleString("vi-VN")
                    : "—"}
                  {selectedDispute.status === "Pending" && (
                    <span className={`ms-2 small fw-semibold ${isEscalated(selectedDispute) ? "text-danger" : "text-muted"}`}>
                      ({getDaysPending(selectedDispute.createdAt)}d {t("dispute.pending")})
                    </span>
                  )}
                </p>
                <p className="mb-0">
                  <strong>{t("dispute.colStatus")}:</strong>{" "}
                  {getStatusBadge(selectedDispute.status)}
                  {isEscalated(selectedDispute) && (
                    <Badge color="danger" className="ms-2">
                      <i className="ri-alarm-warning-line me-1"></i>
                      {t("dispute.escalated")}
                    </Badge>
                  )}
                </p>
              </div>

              {selectedDispute.reviewerFeedbacks && selectedDispute.reviewerFeedbacks.length > 0 && (() => {
                const voteInfo = countVotes(selectedDispute.reviewerFeedbacks);
                const approvedFeedbacks = selectedDispute.reviewerFeedbacks.filter(f => f.verdict === "Approved" || f.verdict === "Approve");
                const rejectedFeedbacks = selectedDispute.reviewerFeedbacks.filter(f => f.verdict === "Rejected" || f.verdict === "Reject");
                const majorityDecision = voteInfo.approvedCount > voteInfo.rejectedCount ? "APPROVED" : "REJECTED";
                const majorityClass = voteInfo.approvedCount > voteInfo.rejectedCount ? "success" : "danger";

                return (
                  <div className="mb-3 p-3 border rounded" style={{ borderColor: "var(--pd-table-border)" }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="fw-bold mb-0" style={{ color: "var(--pd-tab-active-text)" }}>
                        <i className="ri-user-follow-line me-1"></i>
                        Reviewer Votes ({voteInfo.total} reviewers)
                      </h6>
                      <div className="d-flex gap-2">
                        <Badge color="success" style={{ fontSize: "12px" }}>
                          <i className="ri-check-line me-1"></i>{voteInfo.approvedCount}
                        </Badge>
                        <Badge color="danger" style={{ fontSize: "12px" }}>
                          <i className="ri-close-line me-1"></i>{voteInfo.rejectedCount}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3 p-2 rounded" style={{ background: "var(--pd-table-header-bg)" }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="small fw-bold">Majority Decision:</span>
                        {voteInfo.isConflict ? (
                          <Badge color="warning" className="px-2 py-1">
                            <i className="ri-alert-line me-1"></i>CONFLICT (50-50)
                          </Badge>
                        ) : (
                          <Badge color={majorityClass} className="px-2 py-1">
                            <i className={`ri-${majorityClass === "success" ? "check-line" : "close-line"} me-1`}></i>
                            {majorityDecision} (Majority)
                          </Badge>
                        )}
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${(voteInfo.approvedCount / voteInfo.total) * 100}%` }}
                        ></div>
                        <div
                          className="progress-bar bg-danger"
                          style={{ width: `${(voteInfo.rejectedCount / voteInfo.total) * 100}%` }}
                        ></div>
                      </div>
                      <small className="text-muted mt-1 d-block">
                        {voteInfo.isConflict
                          ? "Equal votes detected - Manager decision required"
                          : voteInfo.approvedCount > voteInfo.rejectedCount
                            ? `${voteInfo.approvedCount} approved, ${voteInfo.rejectedCount} rejected - APPROVED by majority`
                            : `${voteInfo.approvedCount} approved, ${voteInfo.rejectedCount} rejected - REJECTED by majority`
                        }
                      </small>
                    </div>

                    <div className="mb-3">
                      {voteInfo.approvedCount > 0 && (
                        <>
                          <small className="text-success fw-bold d-block mb-2">
                            <i className="ri-check-line me-1"></i>Approved ({voteInfo.approvedCount})
                          </small>
                          <div className="d-flex flex-column gap-2 mb-3">
                            {approvedFeedbacks.map((feedback, idx) => (
                              <div key={`approved-${idx}`} className="p-3 rounded border border-success bg-success-subtle">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <strong className="text-success">
                                      <i className="ri-user-line me-1"></i>
                                      {feedback.reviewerName || "Unknown Reviewer"}
                                    </strong>
                                    <Badge color="success" className="ms-2" pill style={{ fontSize: "10px" }}>
                                      APPROVED
                                    </Badge>
                                  </div>
                                  <small className="text-muted">
                                    {feedback.reviewedAt ? new Date(feedback.reviewedAt).toLocaleString("vi-VN") : ""}
                                  </small>
                                </div>
                                {feedback.comment && (
                                  <p className="mb-0 mt-2 small" style={{ color: "var(--pd-text-primary)" }}>
                                    "{feedback.comment}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {voteInfo.rejectedCount > 0 && (
                        <>
                          <small className="text-danger fw-bold d-block mb-2">
                            <i className="ri-close-line me-1"></i>Rejected ({voteInfo.rejectedCount})
                          </small>
                          <div className="d-flex flex-column gap-2">
                            {rejectedFeedbacks.map((feedback, idx) => (
                              <div key={`rejected-${idx}`} className="p-3 rounded border border-danger bg-danger-subtle">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <strong className="text-danger">
                                      <i className="ri-user-line me-1"></i>
                                      {feedback.reviewerName || "Unknown Reviewer"}
                                    </strong>
                                    <Badge color="danger" className="ms-2" pill style={{ fontSize: "10px" }}>
                                      REJECTED
                                    </Badge>
                                  </div>
                                  <small className="text-muted">
                                    {feedback.reviewedAt ? new Date(feedback.reviewedAt).toLocaleString("vi-VN") : ""}
                                  </small>
                                </div>
                                {feedback.comment && (
                                  <p className="mb-0 mt-2 small" style={{ color: "var(--pd-text-primary)" }}>
                                    "{feedback.comment}"
                                  </p>
                                )}
                                {feedback.errorCategories && (
                                  <div className="mt-2 d-flex flex-wrap gap-1">
                                    {(() => {
                                      try {
                                        const errors = JSON.parse(feedback.errorCategories);
                                        return errors.map((err, i) => (
                                          <Badge key={i} color="warning" pill style={{ fontSize: "10px" }}>
                                            {err}
                                          </Badge>
                                        ));
                                      } catch { return null; }
                                    })()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {selectedDispute.status === "Pending" && (
                      <div className="mt-3 p-2 rounded" style={{ background: "#fff3cd", border: "1px solid #ffc107" }}>
                        <small className="text-warning-emphasis">
                          <i className="ri-information-line me-1"></i>
                          <strong>Note:</strong> Annotator disputes when rejected. Manager's decision will determine the final outcome.
                          <br />
                          <span className="text-muted">
                            Accept = Annotator correct, Rejectors must re-review | Reject = Annotator wrong, all must redo
                          </span>
                        </small>
                      </div>
                    )}
                  </div>
                );
              })()}

              {projectDetail?.labels?.length > 0 && (
                <div className="mb-3 p-3 border rounded" style={{ borderColor: "var(--pd-table-border)" }}>
                  <h6 className="fw-bold mb-2" style={{ color: "var(--pd-tab-active-text)" }}>
                    <i className="ri-book-read-line me-1"></i>
                    {t("dispute.guidelineRef")}
                  </h6>
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0" bordered>
                      <thead>
                        <tr>
                          <th>{t("dispute.labelCol")}</th>
                          <th>{t("dispute.colorCol")}</th>
                          <th>{t("dispute.guideCol")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectDetail.labels.map((label) => (
                          <tr key={label.id}>
                            <td className="fw-semibold">{label.name}</td>
                            <td>
                              <span className="badge px-2 py-1" style={{ backgroundColor: label.color }}>
                                {label.color}
                              </span>
                            </td>
                            <td className="small" style={{ color: "var(--pd-text-muted)" }}>
                              {label.guideLine || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {selectedDispute.status === "Pending" ? (() => {
                const voteInfo = selectedDispute.reviewerFeedbacks
                  ? countVotes(selectedDispute.reviewerFeedbacks)
                  : { approvedCount: 0, rejectedCount: 0, total: 0, isConflict: false };
                return (
                <div className="mb-3 p-3 border rounded" style={{ borderColor: "#e9ecef" }}>
                  <h6 className="fw-bold mb-3" style={{ color: "var(--pd-text-primary)" }}>
                    <i className="ri-decision-tree me-1"></i>
                    Manager Decision
                  </h6>

                  <Alert color={voteInfo.isConflict ? "warning" : "info"} className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`ri-${voteInfo.isConflict ? "alert" : "information"}-line`}></i>
                      <div>
                        <strong>Current Vote: {voteInfo.approvedCount} Approve / {voteInfo.rejectedCount} Reject</strong>
                        <br />
                        <small>
                          {voteInfo.isConflict
                            ? "CONFLICT detected (50-50). You are the deciding vote."
                            : voteInfo.approvedCount > voteInfo.rejectedCount
                              ? "Majority voted APPROVE. This dispute contests the rejection."
                              : "Majority voted REJECT. Annotator is disputing the decision."
                          }
                        </small>
                      </div>
                    </div>
                  </Alert>

                  <FormGroup>
                    <Label className="fw-semibold">{t("dispute.decision")}</Label>
                    <div className="d-flex flex-column gap-2">
                      <FormGroup check className="p-3 border border-success rounded">
                        <Input type="radio" name="decision" checked={isAccepted} onChange={() => setIsAccepted(true)} />
                        <Label check className="text-success fw-semibold w-100">
                          <div className="d-flex align-items-start">
                            <i className="ri-check-line me-2 mt-1 fs-5"></i>
                            <div>
                              <strong>Accept Dispute</strong>
                              <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>Annotator Correct</span>
                              <p className="mb-0 small text-muted fw-normal mt-1">
                                <strong>Decision:</strong> Annotator's labeling was correct.
                                <br />
                                <strong>Action:</strong> Task remains APPROVED.
                                {voteInfo.rejectedCount > 0 && (
                                  <>
                                    <br />
                                    <span className="text-danger">
                                      <i className="ri-user-follow-line me-1"></i>
                                      {voteInfo.rejectedCount} Rejector(s) must re-review their decision.
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </Label>
                      </FormGroup>
                      <FormGroup check className="p-3 border border-danger rounded">
                        <Input type="radio" name="decision" checked={!isAccepted} onChange={() => setIsAccepted(false)} />
                        <Label check className="text-danger fw-semibold w-100">
                          <div className="d-flex align-items-start">
                            <i className="ri-close-line me-2 mt-1 fs-5"></i>
                            <div>
                              <strong>Reject Dispute</strong>
                              <span className="badge bg-danger ms-2" style={{ fontSize: "10px" }}>Annotator Wrong</span>
                              <p className="mb-0 small text-muted fw-normal mt-1">
                                <strong>Decision:</strong> Annotator's labeling was incorrect.
                                <br />
                                <strong>Action:</strong>
                                <br />
                                <span className="text-danger">
                                  <i className="ri-edit-line me-1"></i>
                                  Annotator must redo the labeling.
                                </span>
                                <br />
                                <span className="text-warning">
                                  <i className="ri-refresh-line me-1"></i>
                                  ALL {voteInfo.total} reviewer(s) must re-review when resubmitted.
                                </span>
                              </p>
                            </div>
                          </div>
                        </Label>
                      </FormGroup>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label className="fw-semibold">
                      {t("dispute.managerComment")}
                      <small className="text-danger ms-1">{t("dispute.required")}</small>
                    </Label>
                    <Input
                      type="textarea"
                      rows="3"
                      value={managerComment}
                      onChange={(e) => setManagerComment(e.target.value)}
                      placeholder={t("dispute.commentPlaceholder")}
                      className={!managerComment.trim() ? "border-danger" : ""}
                    />
                    {!managerComment.trim() && (
                      <small className="text-danger">
                        <i className="ri-error-warning-line me-1"></i>{t("dispute.commentRequired")}
                      </small>
                    )}
                  </FormGroup>
                </div>
                );
              })() : (
                <div className="mb-3 p-3 rounded" style={{ background: "var(--pd-table-header-bg)" }}>
                  <h6 className="fw-bold mb-3" style={{ color: "var(--pd-text-primary)" }}>
                    <i className="ri-checkbox-circle-line me-1"></i>
                    Resolution Result
                  </h6>
                  <div className="mb-3">
                    <strong>Decision:</strong>{" "}
                    <Badge color={selectedDispute.status === "Resolved" ? "success" : "danger"} className="ms-1">
                      {selectedDispute.status === "Resolved" ? "ACCEPTED" : "REJECTED"}
                    </Badge>
                    <Badge color="info" className="ms-2">
                      {selectedDispute.resolutionType === "annotator_correct" ? "Annotator Correct" : "Annotator Wrong"}
                    </Badge>
                  </div>

                  {selectedDispute.resolutionType === "annotator_correct" && (
                    <Alert color="success" className="mb-2">
                      <div className="d-flex align-items-start gap-2">
                        <i className="ri-check-line fs-5"></i>
                        <div>
                          <strong>Decision:</strong> Annotator was correct.
                          <div className="mt-1">
                            <i className="ri-user-follow-line me-1"></i>
                            <strong>Actions Taken:</strong>
                            <ul className="mb-0 mt-1 small">
                              <li>Task status: <strong>APPROVED</strong></li>
                              {selectedDispute.reviewerFeedbacks?.filter(f => f.verdict === "Rejected" || f.verdict === "Reject").map((f, i) => (
                                <li key={i}>Reviewer <strong>{f.reviewerName}</strong> has been notified to re-review</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {selectedDispute.resolutionType === "annotator_wrong" && (
                    <Alert color="danger" className="mb-2">
                      <div className="d-flex align-items-start gap-2">
                        <i className="ri-close-line fs-5"></i>
                        <div>
                          <strong>Decision:</strong> Annotator was incorrect.
                          <div className="mt-1">
                            <i className="ri-refresh-line me-1"></i>
                            <strong>Actions Taken:</strong>
                            <ul className="mb-0 mt-1 small">
                              <li><strong>Annotator</strong> must redo the labeling</li>
                              <li>ALL reviewers have been notified to re-review when resubmitted</li>
                              <li className="text-muted">Even reviewers who previously approved must review again</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {selectedDispute.managerComment && (
                    <div className="mt-3 p-2 rounded" style={{ background: "white", border: "1px solid #dee2e6" }}>
                      <small className="text-muted">Manager's Comment:</small>
                      <p className="mb-0 fw-normal" style={{ color: "var(--pd-text-primary)" }}>
                        "{selectedDispute.managerComment}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setModalOpen(false)}>
            {selectedDispute?.status === "Pending" ? t("dispute.cancel") : t("dispute.close")}
          </Button>
          {selectedDispute?.status === "Pending" && (
            <Button color="primary" onClick={handleResolve} disabled={submitting || !managerComment.trim()}>
              {submitting ? <Spinner size="sm" className="me-1" /> : <i className="ri-check-double-line me-1"></i>}
              {t("dispute.confirmArbitrate")}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default DisputeTab;
