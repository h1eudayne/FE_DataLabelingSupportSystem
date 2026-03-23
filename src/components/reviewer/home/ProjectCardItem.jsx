import { useTranslation } from "react-i18next";

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

export default ProjectCardItem;
