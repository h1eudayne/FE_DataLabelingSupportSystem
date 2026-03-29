import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Badge,
  Button,
  Spinner,
  InputGroup,
  Form,
} from "react-bootstrap";
import {
  LayoutGrid,
  List,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import projectService from "../../../services/reviewer/project.service";
import { useTranslation } from "react-i18next";

const WorkplaceReviewTask = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
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
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()),
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
        alert(alert(t("workplace.noTaskAlert")));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container>
        <div className="mb-4">
          <h3 className="fw-bold text-dark mb-1">{t("workplace.title")}</h3>
          <p className="text-muted">{t("workplace.subtitle")}</p>
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
              <InputGroup.Text className="bg-white border-0">
                <Search size={18} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                placeholder={t("workplace.searchPlaceholder")}
                className="border-0 py-2 shadow-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="d-flex gap-2">
            <Button variant="white" className="shadow-sm border-0">
              <LayoutGrid size={18} />
            </Button>
            <Button variant="white" className="shadow-sm border-0 text-muted">
              <List size={18} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row className="g-4">
            {filteredProjects.map((project) => {
              const isOverdue =
                new Date() > new Date(project.deadline) &&
                project.progressPercent < 100;
              const isFinished = project.progressPercent >= 100;
              return (
                <Col key={project.projectId} xl={4} lg={6}>
                  <Card className="border-0 shadow-sm rounded-4 h-100 hover-lift overflow-hidden">
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div
                          className="bg-info-subtle text-info p-3 rounded-4 d-flex align-items-center justify-content-center"
                          style={{ width: "56px", height: "56px" }}
                        >
                          <span className="fw-bold h5 mb-0">
                            #{project.projectId}
                          </span>
                        </div>
                        <Badge
                          bg={
                            isFinished
                              ? "success-subtle"
                              : isOverdue
                                ? "danger-subtle"
                                : "warning-subtle"
                          }
                          className={`${isFinished ? "text-success" : isOverdue ? "text-danger" : "text-warning"} border-0 px-3 py-2 rounded-pill`}
                        >
                          {isFinished
                            ? "Finished"
                            : isOverdue
                              ? "Overdue"
                              : "Processing"}
                        </Badge>
                      </div>

                      <h5 className="fw-bold text-dark mb-2">
                        {project.projectName}
                      </h5>

                      <div className="text-muted small mb-4">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Calendar size={14} className="text-primary" />
                          <span>
                            <strong>
                              {t("workplace.projectCard.assigned")}
                            </strong>{" "}
                            {new Date(project.assignedDate).toLocaleDateString(
                              i18n.language === "vi" ? "vi-VN" : "en-US",
                            )}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Clock
                            size={14}
                            className={isOverdue ? "text-danger" : "text-muted"}
                          />
                          <span
                            className={isOverdue ? "text-danger fw-bold" : ""}
                          >
                            <strong>
                              {t("workplace.projectCard.deadline")}
                            </strong>{" "}
                            {new Date(project.deadline).toLocaleDateString(
                              i18n.language === "vi" ? "vi-VN" : "en-US",
                            )}
                            {isOverdue && (
                              <AlertTriangle size={12} className="ms-1" />
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-end mb-2">
                          <span className="small text-muted fw-bold">
                            {t("workplace.projectCard.overallProgress")}
                          </span>
                          <span className="h6 mb-0 fw-bold">
                            {project.progressPercent}%
                          </span>
                        </div>
                        <ProgressBar
                          now={project.progressPercent}
                          variant={
                            isFinished
                              ? "success"
                              : isOverdue
                                ? "danger"
                                : "primary"
                          }
                          className="rounded-pill mb-4"
                          style={{ height: "8px" }}
                        />

                        <Button
                          variant={
                            project.progressPercent >= 100
                              ? "outline-success"
                              : "primary"
                          }
                          className="w-100 rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                          disabled={project.progressPercent >= 100}
                          onClick={() => {
                            getReviewWorkspace(project.projectId);
                          }}
                        >
                          {project.progressPercent >= 100 ? (
                            <>
                              <CheckCircle2 size={18} />
                              {t("workplace.projectCard.button.completed")}
                            </>
                          ) : (
                            <>
                              {t("workplace.projectCard.button.enter")}
                              <ArrowRight size={18} />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      <style>{`
            .hover-lift {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important;
            }
            .bg-info-subtle { background-color: #e0f7fa !important; }
            .bg-success-subtle { background-color: #e8f5e9 !important; }
            .bg-warning-subtle { background-color: #fff8e1 !important; }
        `}</style>
    </div>
  );
};

export default WorkplaceReviewTask;
