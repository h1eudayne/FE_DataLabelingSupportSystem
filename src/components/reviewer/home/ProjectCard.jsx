import React from "react";
import { Row, Col, Card, ProgressBar, Badge, Button } from "react-bootstrap";
import { ClipboardCheck, ChevronRight } from "lucide-react";

const ProjectCard = ({ project, onReview }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { bg: "info", color: "#0dcaf0" };
      case "IN PROGRESS":
        return { bg: "warning", color: "#f7b84b" };
      default:
        return { bg: "secondary", color: "#6c757d" };
    }
  };

  const statusStyle = getStatusColor(project.status);

  return (
    <Card
      className="project-card p-4 border-0 shadow-sm mb-3"
      style={{ borderRadius: "12px" }}
    >
      <Row className="align-items-center">
        <Col lg={5} className="project-info">
          <div className="d-flex align-items-center gap-4">
            <div className="icon-box d-none d-sm-block bg-light p-3 rounded-3 text-primary-velzon">
              <ClipboardCheck size={28} />
            </div>
            <div>
              <h5 className="fw-bold mb-1">{project.name}</h5>
              <div className="d-flex align-items-center gap-3 text-muted small">
                <span>
                  ID: <b className="text-primary-velzon">{project.id}</b>
                </span>
                <span>•</span>
                <span>{project.count} tasks</span>
              </div>
            </div>
          </div>
        </Col>

        <Col lg={4} className="mb-3 mb-lg-0">
          <div className="d-flex justify-content-between mb-2 small fw-bold">
            <span>Tiến độ</span>
            <span className="text-primary-velzon">{project.progress}%</span>
          </div>
          <ProgressBar
            now={project.progress}
            style={{ height: "8px" }}
            className="rounded-pill"
          />
        </Col>

        <Col lg={3} className="text-lg-end">
          <Badge
            bg={statusStyle.bg}
            className="bg-opacity-10 text-uppercase px-3 py-2 mb-2"
            style={{ color: statusStyle.color, fontSize: "0.65rem" }}
          >
            {project.status}
          </Badge>
          <div>
            <Button
              variant="link"
              onClick={() => onReview(project.id)}
              className="p-0 text-primary-velzon fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
            >
              Review <ChevronRight size={18} />
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ProjectCard;
