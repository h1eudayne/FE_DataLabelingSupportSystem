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
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import ReviewerActionBar from "../components/reviewer/home/ReviewerActionBar";
import ShortcutSidebar from "../components/reviewer/home/ShortcutSidebar";
import CommonHeader from "../components/home/CommonHeader";
import projectService from "../services/reviewer/project.service";
import { useNavigate } from "react-router-dom";
import useSignalRRefresh from "../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";

const ReviewerContainer = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const today = new Date();
  const pendingProjectsCount = projects.filter(
    (p) => p.progressPercent < 100 && new Date(p.deadline) >= today,
  ).length;
  const completedProjectsCount = projects.filter(
    (p) => p.progressPercent >= 100,
  ).length;
  const overdueProjectsCount = projects.filter(
    (p) => p.progressPercent < 100 && new Date(p.deadline) < today,
  ).length;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getReviewProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useSignalRRefresh(fetchProjects);

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
        alert(t("reviewer.noReviewData"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const statsConfig = [
    {
      label: t("reviewer.stats.totalProjects"),
      value: projects.length,
      icon: <Briefcase size={22} />,
      color: "primary",
    },
    {
      label: t("reviewer.stats.pending"),
      value: pendingProjectsCount,
      icon: <Clock size={22} />,
      color: "info",
    },
    {
      label: t("reviewer.stats.completed"),
      value: completedProjectsCount,
      icon: <CheckCircle size={22} />,
      color: "success",
    },
    {
      label: t("reviewer.stats.overdue"),
      value: overdueProjectsCount,
      icon: <AlertCircle size={22} />,
      color: "danger",
    },
  ];

  return (
    <div className="dashboard-wrapper p-4 bg-body-tertiary min-vh-100 transition-all">
      <Container fluid>
        <CommonHeader
          role="Reviewer"
          title={t("reviewer.title")}
          subtitle={t("reviewer.subtitle")}
        />

        <Row className="mb-4 g-3">
          {statsConfig.map((stat, idx) => (
            <Col key={idx} xl={3} md={6} sm={6}>
              <Card
                className={`border-0 shadow-sm rounded-4 h-100 transition-all ${
                  stat.color === "danger"
                    ? "border-start border-danger border-4"
                    : ""
                }`}
              >
                <Card.Body className="p-3 d-flex align-items-center gap-3">
                  <div
                    className={`p-3 bg-${stat.color}-subtle rounded-4 text-${stat.color} d-flex align-items-center justify-content-center`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div
                      className="text-muted fw-bold text-uppercase"
                      style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                    >
                      {stat.label}
                    </div>
                    <h3 className={`fw-bold mb-0 text-${stat.color}`}>
                      {stat.value}
                    </h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
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
                <p className="text-muted">{t("reviewer.noTasks")}</p>
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
  const { t, i18n } = useTranslation();
  const isCompleted = project.progressPercent >= 100;
  const isOverdue = !isCompleted && new Date(project.deadline) < new Date();

  const dateFormat = i18n.language === "vi" ? "vi-VN" : "en-US";

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
                <Badge bg={isOverdue ? "danger" : "primary"}>
                  #{project.projectId}
                </Badge>
              </div>
              <div>
                <h5
                  className={`fw-bold mb-1 ${isOverdue ? "text-danger" : ""}`}
                >
                  {project.projectName}
                  {isOverdue && (
                    <Badge
                      bg="danger"
                      className="ms-2 small"
                      style={{ fontSize: "10px" }}
                    >
                      {t("reviewer.status.overdue")}
                    </Badge>
                  )}
                </h5>
                <small className="text-muted">
                  {t("reviewer.deadline")}:{" "}
                  <span className={isOverdue ? "text-danger fw-bold" : ""}>
                    {new Date(project.deadline).toLocaleDateString(dateFormat)}
                  </span>
                </small>
              </div>
            </div>
          </Col>

          <Col md={4}>
            <div className="mb-1 d-flex justify-content-between small">
              <span className="text-muted">{t("reviewer.labelProgress")}</span>
              <span className="fw-bold">{project.progressPercent}%</span>
            </div>
            <ProgressBar
              now={project.progressPercent}
              variant={isCompleted ? "success" : "primary"}
              style={{ height: 8 }}
            />
            <small className="text-muted mt-1 d-block">
              {project.completedImages}/{project.totalImages}{" "}
              {t("reviewer.imagesCompleted")}
            </small>
          </Col>

          <Col md={3} className="text-end">
            {isCompleted ? (
              <Button
                variant="light"
                className="rounded-pill px-4 d-inline-flex align-items-center gap-2 text-success border-success-subtle"
                disabled
                style={{ cursor: "not-allowed", opacity: 0.8 }}
              >
                <CheckCircle size={16} /> {t("reviewer.completed")}
              </Button>
            ) : (
              <Button
                variant="outline-primary"
                className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                onClick={() => onReview(project.projectId)}
              >
                {t("reviewer.startReview")} <ArrowRight size={16} />
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ReviewerContainer;
