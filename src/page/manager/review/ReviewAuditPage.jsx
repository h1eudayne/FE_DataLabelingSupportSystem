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
import { useSelector } from "react-redux";
import projectService from "../../../services/manager/project/projectService";
import reviewAuditService from "../../../services/manager/review/reviewAuditService";
import useSignalRRefresh from "../../../hooks/useSignalRRefresh";

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
  const managerId = user?.id;

  const samplingStats = useMemo(() => {
    const total = tasks.length;
    const audited = tasks.filter(
      (t) =>
        t.managerAuditDecision !== undefined && t.managerAuditDecision !== null,
    ).length;
    const notAudited = total - audited;
    const samplingRate = total > 0 ? ((audited / total) * 100).toFixed(1) : 0;
    return { total, audited, notAudited, samplingRate };
  }, [tasks]);

  const reviewerStats = useMemo(() => {
    const auditedTasks = tasks.filter(
      (t) =>
        t.managerAuditDecision !== undefined && t.managerAuditDecision !== null,
    );
    const totalAudited = auditedTasks.length;
    const overridden = auditedTasks.filter(
      (t) => t.managerAuditDecision === false,
    ).length;
    const overrideRate =
      totalAudited > 0 ? ((overridden / totalAudited) * 100).toFixed(1) : 0;
    return { totalAudited, overridden, overrideRate };
  }, [tasks]);

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

  const handleProjectChange = useCallback(async (projectId) => {
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
  }, []);

  // Realtime: auto-refetch audit tasks when notification arrives
  useSignalRRefresh(
    useCallback(() => {
      if (selectedProjectId) handleProjectChange(selectedProjectId);
    }, [selectedProjectId, handleProjectChange]),
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
        t.managerAuditDecision === undefined || t.managerAuditDecision === null,
    );
    if (unaudited.length === 0) {
      toast.info("Tất cả task đã được audit!");
      return;
    }
    const randomTask = unaudited[Math.floor(Math.random() * unaudited.length)];
    openAuditModal(randomTask);
  };

  const handleAudit = async () => {
    if (!selectedTask) return;
    if (!auditComment.trim()) {
      toast.warning(
        "Vui lòng nhập nhận xét audit dựa trên Guideline (BR-MNG-15). Không được để trống.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await reviewAuditService.auditReview({
        reviewLogId: selectedTask.reviewLogId || selectedTask.id,
        isCorrectDecision,
        auditComment,
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
        : "N/A",
      labelCount,
    };
  }, [projectDetail]);

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 text-uppercase fw-bold text-primary">
              <i className="ri-shield-check-line me-2"></i>
              Review Audit — Sampling
            </h4>
          </div>
        </Col>
      </Row>

      <Alert color="info" className="border-0 shadow-sm mb-3">
        <div className="d-flex align-items-center">
          <i className="ri-information-line fs-4 me-2"></i>
          <div>
            <strong>Chế độ Sampling</strong> — Manager không chấm toàn bộ bài,
            mà chỉ chấm <strong>xác suất (sampling)</strong> để đánh giá chất
            lượng Reviewer. Kết quả audit được dùng để tính{" "}
            <strong>Override Rate</strong> và{" "}
            <strong>RQS (Reviewer Quality Score)</strong>.
          </div>
        </div>
      </Alert>

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
        {selectedProjectId && tasks.length > 0 && (
          <Col md={8} className="d-flex align-items-end">
            <Button
              color="warning"
              className="ms-auto"
              onClick={handleRandomPick}
            >
              <i className="ri-shuffle-line me-1"></i>
              Random Pick (Chọn ngẫu nhiên)
            </Button>
          </Col>
        )}
      </Row>

      {selectedProjectId && !loading && tasks.length > 0 && (
        <Row className="mb-3">
          <Col md={3}>
            <Card className="shadow-sm border-0 text-center">
              <CardBody className="py-3">
                <div className="text-muted small mb-1">Tổng Reviewed</div>
                <h4 className="mb-0 text-primary">{samplingStats.total}</h4>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 text-center">
              <CardBody className="py-3">
                <div className="text-muted small mb-1">Đã Audit</div>
                <h4 className="mb-0 text-success">{samplingStats.audited}</h4>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 text-center">
              <CardBody className="py-3">
                <div className="text-muted small mb-1">Chưa Audit</div>
                <h4 className="mb-0 text-warning">
                  {samplingStats.notAudited}
                </h4>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 text-center">
              <CardBody className="py-3">
                <div className="text-muted small mb-1">Tỷ lệ Sampling</div>
                <h4 className="mb-0 text-info">
                  {samplingStats.samplingRate}%
                </h4>
                <Progress
                  value={samplingStats.samplingRate}
                  color="info"
                  className="mt-2"
                  style={{ height: "4px" }}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* BR-MNG-17: Override Rate for Reviewer evaluation */}
      {selectedProjectId && !loading && reviewerStats.totalAudited > 0 && (
        <Row className="mb-3">
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <CardBody className="py-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="ri-bar-chart-grouped-line fs-4 text-warning me-2"></i>
                  <h6 className="mb-0 fw-bold">Override Rate (BR-MNG-17)</h6>
                </div>
                <div className="d-flex align-items-baseline gap-2">
                  <h3
                    className={`mb-0 ${Number(reviewerStats.overrideRate) > 30 ? "text-danger" : Number(reviewerStats.overrideRate) > 15 ? "text-warning" : "text-success"}`}
                  >
                    {reviewerStats.overrideRate}%
                  </h3>
                  <small className="text-muted">
                    ({reviewerStats.overridden}/{reviewerStats.totalAudited} bị
                    lật)
                  </small>
                </div>
                <Progress
                  value={reviewerStats.overrideRate}
                  color={
                    Number(reviewerStats.overrideRate) > 30
                      ? "danger"
                      : Number(reviewerStats.overrideRate) > 15
                        ? "warning"
                        : "success"
                  }
                  className="mt-2"
                  style={{ height: "6px" }}
                />
                <small className="text-muted d-block mt-2">
                  {Number(reviewerStats.overrideRate) > 30
                    ? "⚠️ Tỷ lệ Override cao — Cần đánh giá lại Reviewer"
                    : Number(reviewerStats.overrideRate) > 15
                      ? "⚠ Tỷ lệ Override trung bình — Cần theo dõi thêm"
                      : "✅ Tỷ lệ Override thấp — Reviewer đang làm tốt"}
                </small>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <CardBody className="py-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="ri-thumb-up-line fs-4 text-success me-2"></i>
                  <h6 className="mb-0 fw-bold">Đồng ý (Correct)</h6>
                </div>
                <h3 className="mb-0 text-success">
                  {reviewerStats.totalAudited - reviewerStats.overridden}
                </h3>
                <small className="text-muted">Reviewer đánh giá đúng</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <CardBody className="py-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="ri-thumb-down-line fs-4 text-danger me-2"></i>
                  <h6 className="mb-0 fw-bold">Bị Lật (Override)</h6>
                </div>
                <h3 className="mb-0 text-danger">{reviewerStats.overridden}</h3>
                <small className="text-muted">Manager không đồng ý</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

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
                <Badge color="soft-info" className="fs-12">
                  <i className="ri-bar-chart-line me-1"></i>
                  Sampling: {samplingStats.audited}/{samplingStats.total}
                </Badge>
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
                          <th>Audit Status</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((t, idx) => {
                          const isAudited =
                            t.managerAuditDecision !== undefined &&
                            t.managerAuditDecision !== null;
                          return (
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
                                {isAudited ? (
                                  <Badge color="success">
                                    <i className="ri-check-line me-1"></i>Đã
                                    audit
                                  </Badge>
                                ) : (
                                  <Badge color="light" className="text-muted">
                                    Chưa audit
                                  </Badge>
                                )}
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
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 text-info">
                      <i className="ri-book-read-line me-1"></i>
                      Guideline tham khảo
                    </h6>
                    {guidelineVersion && (
                      <Badge color="soft-primary" className="fs-12">
                        v{guidelineVersion.version} — Cập nhật:{" "}
                        {guidelineVersion.date} — {guidelineVersion.labelCount}{" "}
                        nhãn
                      </Badge>
                    )}
                  </div>
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
                      Không đồng ý (Incorrect — Override)
                    </Label>
                  </FormGroup>
                </div>
              </FormGroup>

              <FormGroup>
                <Label className="fw-semibold">
                  Nhận xét Audit (dựa trên Guideline) *
                  <small className="text-danger ms-1">
                    (Bắt buộc - BR-MNG-15)
                  </small>
                </Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={auditComment}
                  onChange={(e) => setAuditComment(e.target.value)}
                  placeholder="Nhập nhận xét audit (THAM KHẢO Guideline ở trên). Mọi quyết định phải dựa trên Guideline chính thức..."
                  className={!auditComment.trim() ? "border-danger" : ""}
                />
                {!auditComment.trim() && (
                  <small className="text-danger">
                    <i className="ri-error-warning-line me-1"></i>
                    Bắt buộc phải nhập nhận xét dựa trên Guideline.
                  </small>
                )}
              </FormGroup>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setModalOpen(false)}>
            Hủy
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
            Ghi nhận Audit
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ReviewAuditPage;
