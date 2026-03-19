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

  const stats = useMemo(() => {
    const total = disputes.length;
    const pending = disputes.filter((d) => d.status === "Pending").length;
    const resolved = disputes.filter((d) => d.status === "Resolved").length;
    const rejected = disputes.filter((d) => d.status === "Rejected").length;
    return { total, pending, resolved, rejected };
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
      {/* ── Stat Cards (Stitch-aligned: no icon, left-aligned) ── */}
      <Row className="mb-3 g-3">
        <Col md={3}>
          <div className="pd-stat-card stat-primary">
            <div className="stat-label">{t("dispute.totalDisputes", "Tổng tranh chấp")}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="pd-stat-card stat-warning">
            <div className="stat-label">{t("dispute.statusPending", "Đang chờ")}</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="pd-stat-card stat-success">
            <div className="stat-label">{t("dispute.statusResolved", "Đã giải quyết")}</div>
            <div className="stat-value">{stats.resolved}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="pd-stat-card stat-danger">
            <div className="stat-label">{t("dispute.statusRejected", "Đã từ chối")}</div>
            <div className="stat-value">{stats.rejected}</div>
          </div>
        </Col>
      </Row>

      {/* ── Disputes Table (Stitch-aligned: Dispute Log header, monospace IDs) ── */}
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ color: "var(--pd-text-primary)" }}>
                {t("dispute.disputeLog", "Dispute Log")}
              </h5>
              <Button color="light" size="sm" className="border">
                <i className="ri-filter-3-line me-1"></i>
                {t("dispute.filter", "Filter")}
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
                            <td>{getStatusBadge(d.status)}</td>
                            <td style={{ color: "var(--pd-text-muted)" }}>
                              {d.createdAt
                                ? new Date(d.createdAt).toLocaleDateString("vi-VN")
                                : "—"}
                            </td>
                            <td className="text-end">
                              {d.status === "Pending" ? (
                                <button className="dispute-btn-resolve" onClick={() => openResolveModal(d)}>
                                  {t("dispute.resolve", "Resolve")}
                                </button>
                              ) : (
                                <button className="dispute-btn-view" onClick={() => openResolveModal(d)}>
                                  {t("dispute.view", "View")}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  {/* Pagination footer (Stitch-aligned) */}
                  <div
                    className="d-flex align-items-center justify-content-between px-3 py-3 border-top"
                    style={{
                      color: "var(--pd-text-muted)",
                      fontSize: "0.8rem",
                      borderColor: "var(--pd-table-border)",
                    }}
                  >
                    <span>
                      {t("dispute.showing", "Showing")} {disputes.length} {t("dispute.of", "of")} {stats.total} {t("dispute.results", "results")}
                    </span>
                    <div className="d-flex gap-2">
                      <Button color="light" size="sm" disabled className="border">
                        {t("dispute.previous", "Previous")}
                      </Button>
                      <Button color="light" size="sm" className="border">
                        {t("dispute.next", "Next")}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ── Resolve Modal ── */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setModalOpen(false)}>
          <i className="ri-scales-3-line me-2 text-primary"></i>
          {selectedDispute?.status === "Pending"
            ? t("dispute.modalTitle")
            : t("dispute.viewModalTitle", "Chi tiết tranh chấp")}{" "}
          #{selectedDispute?.id}
        </ModalHeader>
        <ModalBody>
          {selectedDispute && (
            <>
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
                <p className="mb-0">
                  <strong>{t("dispute.colStatus")}:</strong>{" "}
                  {getStatusBadge(selectedDispute.status)}
                </p>
              </div>

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

              {selectedDispute.status === "Pending" ? (
                <>
                  <FormGroup>
                    <Label className="fw-semibold">{t("dispute.decision")}</Label>
                    <div className="d-flex gap-3">
                      <FormGroup check>
                        <Input type="radio" name="decision" checked={isAccepted} onChange={() => setIsAccepted(true)} />
                        <Label check className="text-success fw-semibold">
                          <i className="ri-check-line me-1"></i>{t("dispute.acceptComplaint")}
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Input type="radio" name="decision" checked={!isAccepted} onChange={() => setIsAccepted(false)} />
                        <Label check className="text-danger fw-semibold">
                          <i className="ri-close-line me-1"></i>{t("dispute.rejectComplaint")}
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
                </>
              ) : (
                <div className="mb-3 p-3 rounded" style={{ background: "var(--pd-table-header-bg)" }}>
                  <h6 className="fw-bold mb-2" style={{ color: "var(--pd-text-primary)" }}>
                    <i className="ri-checkbox-circle-line me-1"></i>
                    {t("dispute.resolutionResult", "Kết quả phân xử")}
                  </h6>
                  <p className="mb-1">
                    <strong>{t("dispute.decision")}:</strong>{" "}
                    <Badge color={selectedDispute.status === "Resolved" ? "success" : "danger"}>
                      {selectedDispute.status === "Resolved"
                        ? t("dispute.acceptComplaint")
                        : t("dispute.rejectComplaint")}
                    </Badge>
                  </p>
                  {selectedDispute.managerComment && (
                    <p className="mb-0" style={{ color: "var(--pd-text-primary)" }}>
                      <strong>{t("dispute.managerComment")}:</strong>{" "}
                      {selectedDispute.managerComment}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setModalOpen(false)}>
            {selectedDispute?.status === "Pending" ? t("dispute.cancel") : t("dispute.close", "Đóng")}
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
