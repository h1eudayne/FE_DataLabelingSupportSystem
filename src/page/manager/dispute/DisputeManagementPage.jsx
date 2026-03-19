import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
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
import { useSelector } from "react-redux";
import projectService from "../../../services/manager/project/projectService";
import disputeService from "../../../services/manager/dispute/disputeService";
import useSignalRRefresh from "../../../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";

const DisputeManagementPage = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isAccepted, setIsAccepted] = useState(true);
  const [managerComment, setManagerComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getManagerProjects(managerId);
        setProjects(res.data || []);
      } catch {
        toast.error(t("dispute.loadProjectError"));
      }
    };
    if (managerId) fetchProjects();
  }, [managerId, t]);

  const handleProjectChange = useCallback(async (projectId) => {
    setSelectedProjectId(projectId);
    if (!projectId) {
      setDisputes([]);
      setProjectDetail(null);
      return;
    }
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
  }, [t]);

  // Realtime: auto-refetch disputes when notification arrives
  useSignalRRefresh(
    useCallback(() => {
      if (selectedProjectId) handleProjectChange(selectedProjectId);
    }, [selectedProjectId, handleProjectChange])
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
      toast.warning(
        t("dispute.commentWarning"),
      );
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
      handleProjectChange(selectedProjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || t("dispute.resolveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: { color: "warning", text: t("dispute.statusPending") },
      Resolved: { color: "success", text: t("dispute.statusResolved") },
      Rejected: { color: "danger", text: t("dispute.statusRejected") },
    };
    const s = map[status] || { color: "secondary", text: status };
    return <Badge color={s.color}>{s.text}</Badge>;
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 text-uppercase fw-bold text-primary">
              {t("dispute.title")}
            </h4>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Label className="fw-semibold">{t("dispute.selectProjectLabel")}</Label>
          <Input
            type="select"
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">{t("dispute.selectProject")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Input>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">{t("dispute.loadingData")}</p>
        </div>
      ) : selectedProjectId ? (
        <Row>
          <Col xl={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t("dispute.disputeList")} ({disputes.length})</h5>
              </CardHeader>
              <CardBody>
                {disputes.length === 0 ? (
                  <Alert color="info" className="text-center">
                    {t("dispute.noDisputes")}
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table className="table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>{t("dispute.colAssignmentId")}</th>
                          <th>{t("dispute.colReason")}</th>
                          <th>{t("dispute.colStatus")}</th>
                          <th>{t("dispute.colCreatedAt")}</th>
                          <th>{t("dispute.colAction")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disputes.map((d, idx) => (
                          <tr key={d.id}>
                            <td>{idx + 1}</td>
                            <td>
                              <Badge color="soft-primary" className="fs-12">
                                #{d.assignmentId}
                              </Badge>
                            </td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "300px" }}
                            >
                              {d.reason}
                            </td>
                            <td>{getStatusBadge(d.status)}</td>
                            <td>
                              {d.createdAt
                                ? new Date(d.createdAt).toLocaleDateString(
                                    "vi-VN",
                                  )
                                : "—"}
                            </td>
                            <td>
                              {d.status === "Pending" ? (
                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={() => openResolveModal(d)}
                                >
                                  <i className="ri-scales-3-line me-1"></i>
                                  {t("dispute.arbitrate")}
                                </Button>
                              ) : (
                                <span className="text-muted fs-12">
                                  {t("dispute.resolved")}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="ri-scales-3-line display-1 opacity-25"></i>
          <h5 className="mt-3">{t("dispute.noProjectSelected")}</h5>
          <p>{t("dispute.noProjectHint")}</p>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setModalOpen(false)}>
          <i className="ri-scales-3-line me-2 text-primary"></i>
          {t("dispute.modalTitle")} #{selectedDispute?.id}
        </ModalHeader>
        <ModalBody>
          {selectedDispute && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">{t("dispute.complaintInfo")}</h6>
                <p className="mb-1">
                  <strong>Assignment ID:</strong>{" "}
                  <Badge color="primary">#{selectedDispute.assignmentId}</Badge>
                </p>
                <p className="mb-0">
                  <strong>{t("dispute.reason")}</strong> {selectedDispute.reason}
                </p>
              </div>

              {projectDetail?.labels?.length > 0 && (
                <div className="mb-3 p-3 border rounded">
                  <h6 className="fw-bold mb-2 text-info">
                    <i className="ri-book-read-line me-1"></i>
                    {t("dispute.guidelineRef")}
                  </h6>
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0" bordered>
                      <thead className="table-light">
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
                <Label className="fw-semibold">{t("dispute.decision")}</Label>
                <div className="d-flex gap-3">
                  <FormGroup check>
                    <Input
                      type="radio"
                      name="decision"
                      checked={isAccepted}
                      onChange={() => setIsAccepted(true)}
                    />
                    <Label check className="text-success fw-semibold">
                      <i className="ri-check-line me-1"></i>
                      {t("dispute.acceptComplaint")}
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Input
                      type="radio"
                      name="decision"
                      checked={!isAccepted}
                      onChange={() => setIsAccepted(false)}
                    />
                    <Label check className="text-danger fw-semibold">
                      <i className="ri-close-line me-1"></i>
                      {t("dispute.rejectComplaint")}
                    </Label>
                  </FormGroup>
                </div>
              </FormGroup>

              <FormGroup>
                <Label className="fw-semibold">
                  {t("dispute.managerComment")}
                  <small className="text-danger ms-1">
                    {t("dispute.required")}
                  </small>
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
                    <i className="ri-error-warning-line me-1"></i>
                    {t("dispute.commentRequired")}
                  </small>
                )}
              </FormGroup>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setModalOpen(false)}>
            {t("dispute.cancel")}
          </Button>
          <Button
            color="primary"
            onClick={handleResolve}
            disabled={submitting || !managerComment.trim()}
          >
            {submitting ? (
              <Spinner size="sm" className="me-1" />
            ) : (
              <i className="ri-check-double-line me-1"></i>
            )}
            {t("dispute.confirmArbitrate")}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default DisputeManagementPage;
