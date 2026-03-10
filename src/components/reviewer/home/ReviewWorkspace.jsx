import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Spinner,
  Container,
  Row,
  Col,
  Button,
  Badge,
  Card,
  ListGroup,
  Form,
} from "react-bootstrap";
import projectService from "../../../services/reviewer/project.service";
import { useDispatch } from "react-redux";
import { setAnnotations } from "../../../store/annotator/labelling/labelingSlice";
import LabelingWorkspace from "../../annotator/labeling/LabelingWorkspace";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSignature,
  ArrowLeft,
  Clock,
} from "lucide-react";

const ReviewWorkspace = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState(location.state?.workspaceData || null);
  const [loading, setLoading] = useState(!data);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    if (!data) {
      fetchWorkspaceData();
    }
  }, [assignmentId]);

  useEffect(() => {
    if (data && data.existingAnnotations) {
      const annotations = data.existingAnnotations[0]?.annotations || [];
      dispatch(
        setAnnotations({
          assignmentId: data.assignmentId,
          annotations: annotations,
        }),
      );
    }
  }, [data, dispatch]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const res = await projectService.getReviewWorkspace(assignmentId);
      setData(res.data[0]);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5 text-white">
        <Spinner animation="border" />
      </div>
    );
  if (!data)
    return (
      <div className="text-center py-5 text-white">
        Không tìm thấy dữ liệu nhiệm vụ.
      </div>
    );

  const annotations = data.existingAnnotations[0] || [];
  const isOverdue = new Date(data.deadline) < new Date();

  return (
    <div
      className="workspace-layout min-vh-100"
      style={{ backgroundColor: "#f8f9fa", fontSize: "13px", color: "#212529" }}
    >
      <Container fluid className="p-0 d-flex flex-column vh-100">
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-white shadow-sm"
          style={{ borderColor: "#dee2e6", zIndex: 10 }}
        >
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              className="border-1 px-3 d-flex align-items-center gap-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={14} /> Quay lại
            </Button>
            <div className="ms-2 border-start ps-3">
              <span
                className="text-muted small d-block"
                style={{ fontSize: "10px", fontWeight: "600" }}
              >
                PROJECT
              </span>
              <span className="fw-bold text-dark">{data.projectName}</span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <div className="vr mx-2 opacity-25"></div>
            <Button
              variant="danger"
              size="sm"
              className="px-4 fw-bold shadow-sm"
            >
              Reject
            </Button>
            <Button
              variant="success"
              size="sm"
              className="px-4 fw-bold shadow-sm"
            >
              Approve
            </Button>
          </div>
        </div>

        <Row className="g-0 flex-grow-1 overflow-hidden">
          <Col
            lg={9}
            className="position-relative d-flex flex-column"
            style={{ backgroundColor: "#e9ecef" }}
          >
            <LabelingWorkspace
              imageUrl={data.storageUrl}
              assignmentId={data.assignmentId}
              readOnly={true}
            />
          </Col>

          <Col
            lg={3}
            className="border-start d-flex flex-column bg-white shadow-sm"
            style={{ borderColor: "#dee2e6", height: "calc(100vh - 57px)" }}
          >
            <div
              className="p-3 border-bottom"
              style={{ backgroundColor: "#fdfdfd" }}
            >
              <h6
                className="text-uppercase text-muted fw-bold mb-3"
                style={{ fontSize: "11px", letterSpacing: "1px" }}
              >
                Thông tin nhiệm vụ
              </h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Người gán:</span>
                <span className="fw-semibold text-dark">
                  {data.reviewerName}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Hạn chót:</span>
                <Badge
                  bg={isOverdue ? "danger" : "light"}
                  className={`border ${isOverdue ? "text-white" : "text-primary"} fw-bold px-2 d-flex align-items-center`}
                >
                  <Clock size={12} className="me-1" />
                  {new Date(data.deadline).toLocaleDateString("vi-VN")}
                  {isOverdue && (
                    <span className="ms-1" style={{ fontSize: "9px" }}>
                      (Quá hạn)
                    </span>
                  )}
                </Badge>
              </div>
            </div>

            <div className="p-3 flex-grow-1 overflow-auto bg-white">
              <h6
                className="text-uppercase text-muted fw-bold mb-3"
                style={{ fontSize: "11px", letterSpacing: "1px" }}
              >
                Quy định gán nhãn
              </h6>
              {data.labels?.map((label) => (
                <div
                  key={label.id}
                  className="mb-3 p-3 rounded-3 border shadow-sm"
                  style={{
                    backgroundColor: "#fff",
                    borderLeft: `4px solid ${label.color}`,
                  }}
                >
                  <div
                    className="fw-bold mb-1"
                    style={{ color: label.color, fontSize: "13px" }}
                  >
                    {label.name}
                  </div>
                  <div className="text-muted mb-2" style={{ fontSize: "11px" }}>
                    {label.guideLine}
                  </div>

                  {label.checklist?.length > 0 && (
                    <div
                      className="mt-2 pt-2 border-top"
                      style={{ borderColor: "#f1f3f5" }}
                    >
                      {label.checklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center gap-2 mb-1"
                        >
                          <CheckCircle size={12} className="text-success" />
                          <span
                            className="text-dark"
                            style={{ fontSize: "11px" }}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              className="p-3 border-top bg-light shadow-lg"
              style={{ zIndex: 5 }}
            >
              <Form.Group>
                <Form.Label className="small fw-bold text-muted d-flex justify-content-between">
                  <span>PHẢN HỒI KIỂM DUYỆT</span>
                  <span className="text-primary" style={{ cursor: "pointer" }}>
                    Mẫu phản hồi?
                  </span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Nhập lý do nếu từ chối hoặc yêu cầu sửa..."
                  className="border-2 shadow-sm"
                  style={{
                    fontSize: "12px",
                    borderColor: "#ced4da",
                    resize: "none",
                  }}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                />
                <div className="mt-2 d-grid">
                  <small
                    className="text-muted mb-2"
                    style={{ fontSize: "10px" }}
                  >
                    * Phản hồi sẽ được gửi trực tiếp đến người gán nhãn.
                  </small>
                </div>
              </Form.Group>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewWorkspace;
