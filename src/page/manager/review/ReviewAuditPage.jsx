import React, { useState, useEffect } from "react";
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
import reviewAuditService from "../../../services/manager/review/reviewAuditService";

const ReviewAuditPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCorrectDecision, setIsCorrectDecision] = useState(true);
  const [auditComment, setAuditComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.nameid;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getManagerProjects(managerId);
        setProjects(res.data || []);
      } catch {
        toast.error("Không thể tải danh sách dự án");
      }
    };
    fetchProjects();
  }, []);

  const handleProjectChange = async (projectId) => {
    setSelectedProjectId(projectId);
    if (!projectId) {
      setTasks([]);
      setProjectDetail(null);
      return;
    }
    setLoading(true);
    try {
      const [resTasks, resDetail] = await Promise.all([
        reviewAuditService.getTasksForReview(projectId),
        projectService.getProjectById(projectId),
      ]);
      setTasks(resTasks.data || []);
      setProjectDetail(resDetail.data || null);
    } catch {
      toast.error("Không thể tải danh sách review tasks");
    } finally {
      setLoading(false);
    }
  };

  const openAuditModal = (task) => {
    setSelectedTask(task);
    setIsCorrectDecision(true);
    setAuditComment("");
    setModalOpen(true);
  };

  const handleAudit = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await reviewAuditService.auditReview({
        reviewLogId: selectedTask.reviewLogId || selectedTask.id,
        isCorrectDecision,
        auditComment: auditComment || null,
      });
      toast.success("Audit đã được ghi nhận thành công!");
      setModalOpen(false);
      handleProjectChange(selectedProjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể ghi nhận audit");
    } finally {
      setSubmitting(false);
    }
  };

  const getDecisionBadge = (task) => {
    if (task.isApproved === true)
      return <Badge color="success">Approved</Badge>;
    if (task.isApproved === false)
      return <Badge color="danger">Rejected</Badge>;
    return <Badge color="warning">Pending</Badge>;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs={12}>
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 text-uppercase fw-bold text-primary">
                Review Audit — Sampling
              </h4>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Label className="fw-semibold">Chọn dự án</Label>
            <Input
              type="select"
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">-- Chọn dự án --</option>
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
            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : selectedProjectId ? (
          <Row>
            <Col xl={12}>
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Danh sách Reviewed Tasks ({tasks.length})
                  </h5>
                  <small className="text-muted">
                    Manager chấm xác suất — không chấm toàn bộ
                  </small>
                </CardHeader>
                <CardBody>
                  {tasks.length === 0 ? (
                    <Alert color="info" className="text-center">
                      Không có task nào đã được review cho dự án này.
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Assignment ID</th>
                            <th>Annotator</th>
                            <th>Reviewer Decision</th>
                            <th>Comment</th>
                            <th>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((t, idx) => (
                            <tr key={t.id || idx}>
                              <td>{idx + 1}</td>
                              <td>
                                <Badge color="soft-primary" className="fs-12">
                                  #{t.assignmentId || t.id}
                                </Badge>
                              </td>
                              <td>{t.annotatorName || t.annotatorId || "—"}</td>
                              <td>{getDecisionBadge(t)}</td>
                              <td
                                className="text-truncate text-muted small"
                                style={{ maxWidth: "200px" }}
                              >
                                {t.comment || "—"}
                              </td>
                              <td>
                                <Button
                                  color="info"
                                  size="sm"
                                  outline
                                  onClick={() => openAuditModal(t)}
                                >
                                  <i className="ri-shield-check-line me-1"></i>
                                  Audit
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
            <i className="ri-shield-check-line display-1 opacity-25"></i>
            <h5 className="mt-3">Chưa chọn dự án</h5>
            <p>Chọn một dự án để xem danh sách review cần audit</p>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          toggle={() => setModalOpen(false)}
          size="lg"
          centered
        >
          <ModalHeader toggle={() => setModalOpen(false)}>
            <i className="ri-shield-check-line me-2 text-info"></i>
            Audit Review — Assignment #
            {selectedTask?.assignmentId || selectedTask?.id}
          </ModalHeader>
          <ModalBody>
            {selectedTask && (
              <>
                <div className="mb-3 p-3 bg-light rounded">
                  <h6 className="fw-bold mb-2">Thông tin Review</h6>
                  <Row>
                    <Col md={6}>
                      <p className="mb-1">
                        <strong>Reviewer Decision:</strong>{" "}
                        {getDecisionBadge(selectedTask)}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-1">
                        <strong>Error Category:</strong>{" "}
                        {selectedTask.errorCategory || "N/A"}
                      </p>
                    </Col>
                  </Row>
                  {selectedTask.comment && (
                    <p className="mb-0 mt-2">
                      <strong>Reviewer Comment:</strong> {selectedTask.comment}
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
                    <h6 className="fw-bold mb-2 text-info">
                      <i className="ri-book-read-line me-1"></i>
                      Guideline tham khảo
                    </h6>
                    <div className="table-responsive">
                      <Table size="sm" className="mb-0" bordered>
                        <thead className="table-light">
                          <tr>
                            <th>Nhãn</th>
                            <th>Màu</th>
                            <th>Hướng dẫn</th>
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
                    Bạn có đồng ý với quyết định của Reviewer?
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
                        Đồng ý (Correct)
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
                        Không đồng ý (Incorrect)
                      </Label>
                    </FormGroup>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label className="fw-semibold">
                    Nhận xét Audit (dựa trên Guideline)
                  </Label>
                  <Input
                    type="textarea"
                    rows="3"
                    value={auditComment}
                    onChange={(e) => setAuditComment(e.target.value)}
                    placeholder="Nhập nhận xét audit (tham khảo Guideline ở trên)..."
                  />
                </FormGroup>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button color="info" onClick={handleAudit} disabled={submitting}>
              {submitting ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <i className="ri-check-double-line me-1"></i>
              )}
              Ghi nhận Audit
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default ReviewAuditPage;
