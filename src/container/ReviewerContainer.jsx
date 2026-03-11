import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Badge,
  Card,
  ProgressBar,
  Button,
} from "react-bootstrap";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import ReviewerActionBar from "../components/reviewer/home/ReviewerActionBar";
import ShortcutSidebar from "../components/reviewer/home/ShortcutSidebar";
import CommonHeader from "../components/home/CommonHeader";
import projectService from "../services/reviewer/project.service";
import { useNavigate } from "react-router-dom";

const ReviewerContainer = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getReviewProjects();

      setProjects(res.data || []);
    } catch (err) {
      console.error("Lỗi tải dự án:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectId?.toString().includes(searchTerm),
  );

  const getReviewWorkspace = async (projectId) => {
    try {
      const res = await projectService.getReviewWorkspace(projectId);
      if (res.data && res.data.length > 0) {
        const allTasks = res.data;
        const firstTask = allTasks[0];

        navigate(
          `/reviewer/review-workspace/${projectId}/${firstTask.assignmentId}`,
          {
            state: { workspaceData: firstTask, taskList: allTasks },
          },
        );
      } else {
        alert(
          "Hiện tại không còn mục dữ liệu nào cần kiểm duyệt trong dự án này!",
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dashboard-wrapper p-4 bg-body-tertiary min-vh-100 transition-all">
      <Container fluid>
        <CommonHeader
          role="Reviewer"
          title="Bảng điều khiển Kiểm duyệt"
          subtitle="Theo dõi tiến độ và đảm bảo chất lượng gán nhãn dữ liệu."
        />

        <Row className="mb-4 g-3">
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className="p-3 bg-primary-subtle rounded-3 text-primary">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-muted small fw-bold">DỰ ÁN ĐANG CHỜ</div>
                  <h4 className="fw-bold mb-0">{projects.length}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <ReviewerActionBar onSearchChange={setSearchTerm} />

        <Row>
          <Col xl={9} lg={8}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {filteredProjects.map((item) => (
                  <ProjectCardItem
                    key={item.projectId}
                    project={item}
                    onReview={getReviewWorkspace}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-card rounded-4 shadow-sm border">
                <AlertCircle className="text-muted mb-2" size={40} />
                <p className="text-muted">Không có nhiệm vụ nào cần xử lý.</p>
              </div>
            )}
          </Col>
          <Col xl={3} lg={4}>
            <ShortcutSidebar />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const ProjectCardItem = ({ project, onReview }) => {
  const isCompleted = project.progressPercent >= 100;
  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden project-card-hover">
      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col md={5}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="project-icon bg-light rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 50, height: 50 }}
              >
                <Badge bg="primary">{project.projectId}</Badge>
              </div>
              <div>
                <h5 className="fw-bold mb-1">{project.projectName}</h5>
                <small className="text-muted">
                  Giao ngày:{" "}
                  {new Date(project.assignedDate).toLocaleDateString("vi-VN")}
                </small>
              </div>
            </div>
          </Col>

          <Col md={4}>
            <div className="mb-1 d-flex justify-content-between small">
              <span className="text-muted">Tiến độ gán nhãn</span>
              <span className="fw-bold">{project.progressPercent}%</span>
            </div>
            <ProgressBar
              now={project.progressPercent}
              variant="success"
              style={{ height: 8 }}
            />
            <small className="text-muted mt-1 d-block">
              {project.completedImages}/{project.totalImages} ảnh hoàn tất
            </small>
          </Col>

          <Col md={3} className="text-end">
            {isCompleted ? (
              <Button
                variant="light"
                className="rounded-pill px-4 d-inline-flex align-items-center gap-2 text-success fw-bold border-0"
                style={{ backgroundColor: "#e1f5fe", cursor: "default" }}
                disabled
              >
                <CheckCircle size={16} /> Completed
              </Button>
            ) : (
              <Button
                variant="outline-primary"
                className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                onClick={() => {
                  onReview(project.projectId);
                }}
              >
                Bắt đầu Review <ArrowRight size={16} />
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ReviewerContainer;
