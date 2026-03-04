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
import disputeService from "../../../services/manager/dispute/disputeService";

const DisputeManagementPage = () => {
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
      toast.error("Không thể tải dữ liệu disputes");
    } finally {
      setLoading(false);
    }
  };

  const openResolveModal = (dispute) => {
    setSelectedDispute(dispute);
    setIsAccepted(true);
    setManagerComment("");
    setModalOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;
    setSubmitting(true);
    try {
      await disputeService.resolveDispute({
        disputeId: selectedDispute.id,
        isAccepted,
        managerComment: managerComment || null,
      });
      toast.success("Dispute đã được xử lý thành công!");
      setModalOpen(false);
      handleProjectChange(selectedProjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xử lý dispute");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: { color: "warning", text: "Đang chờ" },
      Resolved: { color: "success", text: "Đã xử lý" },
      Rejected: { color: "danger", text: "Đã từ chối" },
    };
    const s = map[status] || { color: "secondary", text: status };
    return <Badge color={s.color}>{s.text}</Badge>;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs={12}>
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 text-uppercase fw-bold text-primary">
                Quản lý Tranh chấp (Disputes)
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
                    Danh sách Disputes ({disputes.length})
                  </h5>
                </CardHeader>
                <CardBody>
                  {disputes.length === 0 ? (
                    <Alert color="info" className="text-center">
                      Không có dispute nào cho dự án này.
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Assignment ID</th>
                            <th>Lý do khiếu nại</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
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
                                    Phân xử
                                  </Button>
                                ) : (
                                  <span className="text-muted fs-12">
                                    Đã xử lý
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
            <h5 className="mt-3">Chưa chọn dự án</h5>
            <p>Chọn một dự án để xem danh sách tranh chấp</p>
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
            Phân xử Dispute #{selectedDispute?.id}
          </ModalHeader>
          <ModalBody>
            {selectedDispute && (
              <>
                <div className="mb-3 p-3 bg-light rounded">
                  <h6 className="fw-bold mb-2">Thông tin khiếu nại</h6>
                  <p className="mb-1">
                    <strong>Assignment ID:</strong>{" "}
                    <Badge color="primary">
                      #{selectedDispute.assignmentId}
                    </Badge>
                  </p>
                  <p className="mb-0">
                    <strong>Lý do:</strong> {selectedDispute.reason}
                  </p>
                </div>

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
                  <Label className="fw-semibold">Quyết định</Label>
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
                        Chấp nhận khiếu nại
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
                        Từ chối khiếu nại
                      </Label>
                    </FormGroup>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label className="fw-semibold">
                    Nhận xét của Manager (dựa trên Guideline)
                  </Label>
                  <Input
                    type="textarea"
                    rows="3"
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                    placeholder="Nhập lý do quyết định (tham khảo Guideline ở trên)..."
                  />
                </FormGroup>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button
              color="primary"
              onClick={handleResolve}
              disabled={submitting}
            >
              {submitting ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <i className="ri-check-double-line me-1"></i>
              )}
              Xác nhận phân xử
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default DisputeManagementPage;
