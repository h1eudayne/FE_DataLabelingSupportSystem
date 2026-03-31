import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge,
  Button,
  Input,
  Label,
  Spinner,
  Alert,
} from "reactstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import projectService from "../../../services/manager/project/projectService";
import disputeService from "../../../services/manager/dispute/disputeService";
import useSignalRRefresh from "../../../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";
import ManagerDecisionEvidenceModal from "../../../components/manager/dispute/ManagerDecisionEvidenceModal";

const DisputeManagementPage = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    item: null,
  });
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
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
    fetchProjects();
  }, []);

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
  }, []);

  
  useSignalRRefresh(
    useCallback(() => {
      if (selectedProjectId) handleProjectChange(selectedProjectId);
    }, [selectedProjectId, handleProjectChange])
  );

  const openResolveModal = (dispute) => {
    setDecisionModal({
      isOpen: true,
      item: dispute,
    });
  };

  const closeDecisionModal = () => {
    setDecisionModal({
      isOpen: false,
      item: null,
    });
  };

  const handleResolve = async ({ decision, comment }) => {
    if (!decisionModal.item) return;
    if (!comment?.trim()) {
      toast.warning(
        t("dispute.commentWarning"),
      );
      return;
    }
    setDecisionSubmitting(true);
    try {
      await disputeService.resolveDispute({
        disputeId: decisionModal.item.id,
        isAccepted: decision === "accept",
        managerComment: comment,
      });
      toast.success(t("dispute.resolveSuccess"));
      closeDecisionModal();
      await handleProjectChange(selectedProjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || t("dispute.resolveError"));
    } finally {
      setDecisionSubmitting(false);
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
                              <Button
                                color={d.status === "Pending" ? "primary" : "light"}
                                size="sm"
                                className={d.status === "Pending" ? "" : "border"}
                                onClick={() => openResolveModal(d)}
                              >
                                <i className={`me-1 ${d.status === "Pending" ? "ri-scales-3-line" : "ri-eye-line"}`}></i>
                                {d.status === "Pending"
                                  ? t("dispute.arbitrate")
                                  : t("dispute.view")}
                              </Button>
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

      <ManagerDecisionEvidenceModal
        isOpen={decisionModal.isOpen}
        toggle={closeDecisionModal}
        caseItem={decisionModal.item}
        projectDetail={projectDetail}
        mode="dispute"
        submitting={decisionSubmitting}
        onConfirm={handleResolve}
      />
    </>
  );
};

export default DisputeManagementPage;
