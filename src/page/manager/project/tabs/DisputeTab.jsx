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
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import projectService from "../../../../services/manager/project/projectService";
import disputeService from "../../../../services/manager/dispute/disputeService";
import reviewAuditService from "../../../../services/manager/review/reviewAuditService";
import useSignalRRefresh from "../../../../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";
import ManagerDecisionEvidenceModal from "../../../../components/manager/dispute/ManagerDecisionEvidenceModal";

const DisputeTab = ({ projectId }) => {
  const { t } = useTranslation();
  const [disputes, setDisputes] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    mode: "dispute",
    item: null,
  });
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

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
    const pendingPenalty = escalations.filter((item) => item.escalationType === "PenaltyReview").length;
    const repeatedReject = escalations.filter((item) => item.escalationType === "RepeatedReject").length;
    return { total, pending, resolved, rejected, escalated, pendingPenalty, repeatedReject };
  }, [disputes, escalations]);

  const fetchDisputes = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [resDisputes, resEscalations, resDetail] = await Promise.all([
        disputeService.getDisputes(projectId),
        reviewAuditService.getEscalations(projectId),
        projectService.getProjectById(projectId),
      ]);
      setDisputes(resDisputes.data || []);
      setEscalations(resEscalations.data || []);
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
    setDecisionModal({
      isOpen: true,
      mode: "dispute",
      item: dispute,
    });
  };

  const openEscalationModal = (escalation) => {
    setDecisionModal({
      isOpen: true,
      mode: "escalation",
      item: escalation,
    });
  };

  const closeDecisionModal = () => {
    setDecisionModal({
      isOpen: false,
      mode: "dispute",
      item: null,
    });
  };

  const handleDecisionConfirm = async ({ decision, comment }) => {
    if (!decisionModal.item) return;
    if (!comment?.trim()) {
      toast.warning(t("dispute.commentWarning"));
      return;
    }

    setDecisionSubmitting(true);
    try {
      if (decisionModal.mode === "dispute") {
        await disputeService.resolveDispute({
          disputeId: decisionModal.item.id,
          isAccepted: decision === "accept",
          managerComment: comment,
        });
      } else {
        await reviewAuditService.resolveEscalation({
          assignmentId: decisionModal.item.assignmentId,
          action: decision,
          comment,
        });
      }

      toast.success(t("dispute.resolveSuccess"));
      closeDecisionModal();
      await fetchDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || t("dispute.resolveError"));
    } finally {
      setDecisionSubmitting(false);
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

  const getEscalationBadge = (type) => {
    if (type === "PenaltyReview") {
      return (
        <Badge color="warning">
          <i className="ri-scales-3-line me-1"></i>
          {t("analytics.penaltyCases")}
        </Badge>
      );
    }

    return (
      <Badge color="danger">
        <i className="ri-alarm-warning-line me-1"></i>
        {t("analytics.rejectCases")}
      </Badge>
    );
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

      <Row className="mb-3">
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ color: "var(--pd-text-primary)" }}>
                {t("analytics.priorityQueue")}
              </h5>
              <div className="d-flex gap-2">
                <Badge color="warning">{stats.pendingPenalty} {t("analytics.penaltyCases")}</Badge>
                <Badge color="danger">{stats.repeatedReject} {t("analytics.rejectCases")}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              {escalations.length === 0 ? (
                <div className="pd-empty-state">
                  <i className="ri-checkbox-circle-line"></i>
                  <p>{t("analytics.priorityQueueEmpty")}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t("dispute.colAssignmentId")}</th>
                        <th>{t("analytics.project")}</th>
                        <th>{t("analytics.attention")}</th>
                        <th>{t("analytics.reviewed")}</th>
                        <th className="text-end">{t("dispute.colAction")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escalations.map((escalation, index) => {
                        const voteInfo = countVotes(escalation.reviewerFeedbacks);

                        return (
                          <tr key={`escalation-${escalation.assignmentId}`}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>#{escalation.assignmentId}</strong>
                              <div className="small text-muted">{escalation.annotatorName}</div>
                            </td>
                            <td>{escalation.projectName}</td>
                            <td>
                              <div className="d-flex flex-column gap-2">
                                {getEscalationBadge(escalation.escalationType)}
                                <small className="text-muted">
                                  {t("analytics.priorityQueueDetail", {
                                    penalty: escalation.escalationType === "PenaltyReview" ? 1 : 0,
                                    dispute: 0,
                                    reject: escalation.escalationType === "RepeatedReject" ? 1 : 0,
                                  })}
                                </small>
                                {escalation.rejectCount > 0 && (
                                  <small className="text-danger">
                                    {escalation.rejectCount}x reject
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <Badge color="success">{voteInfo.approvedCount} approve</Badge>
                                <Badge color="danger">{voteInfo.rejectedCount} reject</Badge>
                              </div>
                            </td>
                            <td className="text-end">
                              <Button color="danger" outline size="sm" onClick={() => openEscalationModal(escalation)}>
                                <i className="ri-scales-3-line me-1"></i>
                                {t("dispute.resolve")}
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

      <ManagerDecisionEvidenceModal
        isOpen={decisionModal.isOpen}
        toggle={closeDecisionModal}
        caseItem={decisionModal.item}
        projectDetail={projectDetail}
        mode={decisionModal.mode}
        submitting={decisionSubmitting}
        onConfirm={handleDecisionConfirm}
      />
    </>
  );
};

export default DisputeTab;
