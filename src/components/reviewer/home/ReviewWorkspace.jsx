import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Spinner, Container, Row, Col, Button, Badge } from "react-bootstrap";
import projectService from "../../../services/reviewer/project.service";
import { BACKEND_URL } from "../../../services/axios.customize";
import { Clock } from "lucide-react";

const ReviewWorkspace = () => {
  const { assignmentId } = useParams();

  const location = useLocation();

  const [data, setData] = useState(location.state?.workspaceData || null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (!data) {
      fetchWorkspaceData();
    }
  }, [assignmentId]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const res = await projectService.getReviewWorkspaceDetail(assignmentId);
      setData(res.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu chi tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (!data) return <div className="text-center">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="workspace-layout bg-dark min-vh-100 text-white">
      <Container fluid className="p-0">
        <div className="d-flex justify-content-between align-items-center p-3 bg-secondary">
          <h5 className="mb-0">{data.projectName}</h5>
          <div className="d-flex gap-2">
            <Button variant="danger">Reject</Button>
            <Button variant="success">Approve</Button>
          </div>
        </div>

        <Row className="g-0">
          <Col
            lg={9}
            className="position-relative overflow-hidden"
            style={{ height: "calc(100vh - 70px)" }}
          >
            <div className="d-flex align-items-center justify-content-center h-100">
              <img
                src={`${BACKEND_URL}${data.storageUrl}`}
                alt="Task"
                className="img-fluid shadow-lg"
              />
            </div>
          </Col>

          <Col
            lg={3}
            className="bg-light text-dark p-3 overflow-auto"
            style={{ height: "calc(100vh - 70px)" }}
          >
            <h6>Thông tin gán nhãn</h6>
            <hr />

            <p>
              <strong>Người kiểm duyệt:</strong> {data.reviewerName}
            </p>
            <p className="d-flex align-items-center gap-2">
              <strong>Hạn chót:</strong>{" "}
              <Badge
                bg={new Date(data.deadline) < new Date() ? "danger" : "info"}
                className="d-flex align-items-center gap-1"
              >
                <Clock size={12} />
                {new Date(data.deadline).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Badge>
            </p>

            <h6 className="mt-4">Danh sách nhãn khả dụng:</h6>
            {data.labels?.map((label) => (
              <div
                key={label.id}
                className="d-flex mb-2 shadow-sm rounded overflow-hidden border"
              >
                <div
                  style={{ width: "6px", backgroundColor: label.color }}
                ></div>

                <div className="p-2 bg-white flex-grow-1">
                  <small className="fw-bold d-block text-dark">
                    {label.name}
                  </small>
                  <div
                    className="small text-muted"
                    style={{ fontSize: "11px" }}
                  >
                    {label.guideLine}
                  </div>
                </div>
              </div>
            ))}

            <h6 className="mt-4">Annotations từ Annotator:</h6>
            <pre className="bg-secondary text-white p-2 rounded small">
              {JSON.stringify(data.existingAnnotations, null, 2)}
            </pre>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewWorkspace;
