import React, { useEffect, useState, useCallback, useRef } from "react";
import { Container, Row, Col, Spinner, Card, Alert } from "react-bootstrap";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Target,
} from "lucide-react";
import ReviewerActionBar from "../components/reviewer/home/ReviewerActionBar";
import ShortcutSidebar from "../components/reviewer/home/ShortcutSidebar";
import CommonHeader from "../components/home/CommonHeader";
import projectService from "../services/reviewer/project.service";
import { useNavigate } from "react-router-dom";
import useSignalRRefresh from "../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";
import ProjectCardItem from "../components/reviewer/home/ProjectCardItem";
import { toast } from "react-toastify";
import {
  isAwaitingManagerConfirmation,
  isCompletedProjectStatus,
} from "../utils/projectWorkflowStatus";

const REVIEWER_REFRESH_INTERVAL_MS = 30000;

const isForbiddenError = (error) => Number(error?.response?.status) === 403;

const getApiErrorMessage = (error) => {
  const rawMessage =
    error?.response?.data?.message ??
    error?.response?.data?.Message ??
    error?.message;

  return typeof rawMessage === "string" ? rawMessage.trim() : "";
};

const ReviewerContainer = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalAccuracy, setGlobalAccuracy] = useState(null);
  const [accessForbiddenMessage, setAccessForbiddenMessage] = useState("");

  const navigate = useNavigate();
  const hasReviewerAccess = accessForbiddenMessage.length === 0;
  const reviewerAccessRef = useRef(true);

  const handleForbiddenAccess = useCallback(
    (error) => {
      const serverMessage = getApiErrorMessage(error);
      reviewerAccessRef.current = false;
      setProjects([]);
      setGlobalAccuracy(null);
      setAccessForbiddenMessage(
        serverMessage || t("reviewer.accessForbiddenMessage"),
      );
    },
    [t],
  );

  const today = new Date();
  const pendingProjectsCount = projects.filter(
    (p) =>
      !isCompletedProjectStatus(p.status) &&
      !isAwaitingManagerConfirmation(p.status) &&
      new Date(p.deadline) >= today,
  ).length;
  const completedProjectsCount = projects.filter(
    (p) => isCompletedProjectStatus(p.status),
  ).length;
  const overdueProjectsCount = projects.filter(
    (p) => !isCompletedProjectStatus(p.status) && new Date(p.deadline) < today,
  ).length;

  const overdueProjects = projects.filter(
    (p) => !isCompletedProjectStatus(p.status) && new Date(p.deadline) < today,
  );

  const nearDeadlineProjects = projects.filter((p) => {
    const deadlineDate = new Date(p.deadline);
    const diffInHours = (deadlineDate - today) / (1000 * 60 * 60);
    return (
      !isCompletedProjectStatus(p.status) &&
      !isAwaitingManagerConfirmation(p.status) &&
      diffInHours > 0 &&
      diffInHours <= 48
    );
  });

  const fetchProjects = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const [projectsRes, reviewerStatsRes] = await Promise.all([
        projectService.getReviewProjects(),
        projectService.getReviewerStats(),
      ]);

      const projectsData = projectsRes.data || [];
      const reviewerStats = reviewerStatsRes.data || {};
      const reviewerAccuracyValue =
        reviewerStats.KQSScore ?? reviewerStats.kqsScore ??
        reviewerStats.AuditAccuracy ?? reviewerStats.auditAccuracy ??
        null;
      reviewerAccessRef.current = true;
      setAccessForbiddenMessage("");
      setProjects(projectsData);
      setGlobalAccuracy(
        reviewerAccuracyValue != null
          ? Number(reviewerAccuracyValue).toFixed(1)
          : null,
      );
    } catch (err) {
      if (isForbiddenError(err)) {
        handleForbiddenAccess(err);
        return;
      }

      setAccessForbiddenMessage("");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [handleForbiddenAccess]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!hasReviewerAccess) {
      return undefined;
    }

    const refreshSilently = () => {
      if (
        reviewerAccessRef.current &&
        document.visibilityState === "visible"
      ) {
        fetchProjects({ showLoading: false });
      }
    };

    const intervalId = window.setInterval(
      refreshSilently,
      REVIEWER_REFRESH_INTERVAL_MS,
    );

    window.addEventListener("focus", refreshSilently);
    document.addEventListener("visibilitychange", refreshSilently);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshSilently);
      document.removeEventListener("visibilitychange", refreshSilently);
    };
  }, [fetchProjects, hasReviewerAccess]);

  useSignalRRefresh(() => fetchProjects({ showLoading: false }), {
    enabled: hasReviewerAccess,
  });

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
        toast.info(t("reviewer.noReviewData"));
      }
    } catch (error) {
      if (isForbiddenError(error)) {
        toast.warn(t("reviewer.projectAccessRevoked"));
        fetchProjects({ showLoading: false });
        return;
      }
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
    {
      label: t("reviewer.stats.accuracy"),
      value: globalAccuracy === null ? "—" : `${globalAccuracy}%`,
      icon: <Target size={22} />,
      color:
        globalAccuracy === null
          ? "secondary"
          : globalAccuracy < 80
          ? "danger"
          : globalAccuracy < 90
            ? "warning"
            : "success",
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

        {!hasReviewerAccess && (
          <Alert
            variant="warning"
            className="border-0 shadow-sm rounded-4 d-flex align-items-start gap-3 mb-4"
          >
            <AlertCircle size={20} className="mt-1 flex-shrink-0" />
            <div>
              <div className="fw-semibold mb-1">
                {t("reviewer.accessForbiddenTitle")}
              </div>
              <div className="mb-1">{accessForbiddenMessage}</div>
              <small className="text-muted">
                {t("reviewer.accessForbiddenHint")}
              </small>
            </div>
          </Alert>
        )}

        <div
          className="mb-4 d-grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {statsConfig.map((stat, idx) => (
            <Card
              key={idx}
              className={`border-0 shadow-sm rounded-4 transition-all hover-lift ${
                stat.color === "danger"
                  ? "border-start border-danger border-4"
                  : ""
              }`}
            >
              <Card.Body className="p-3 d-flex align-items-center gap-3">
                <div
                  className={`p-3 bg-${stat.color}-subtle rounded-4 text-${stat.color} d-flex align-items-center justify-content-center shadow-sm`}
                  style={{ minWidth: "52px", height: "52px" }}
                >
                  {stat.icon}
                </div>
                <div className="overflow-hidden">
                  <div
                    className="text-muted fw-bold text-uppercase text-truncate"
                    style={{ fontSize: "10px", letterSpacing: "1px" }}
                  >
                    {stat.label}
                  </div>
                  <h4 className={`fw-bold mb-0 text-dark`}>{stat.value}</h4>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>

        {(overdueProjects.length > 0 || nearDeadlineProjects.length > 0) && (
          <div className="mb-4 d-flex flex-column gap-2">
            {overdueProjects.map((p) => (
              <div
                key={`overdue-${p.projectId}`}
                className="alert alert-danger d-flex align-items-center justify-content-between border-0 shadow-sm rounded-4 mb-0 py-2 px-3 animate__animated animate__fadeIn"
              >
                <div className="d-flex align-items-center gap-2">
                  <AlertCircle size={18} className="text-danger" />
                  <div>
                    <span className="fw-bold text-dark">
                      {t("reviewer.alerts.overdue")}:
                    </span>{" "}
                    <span className="text-danger fw-medium">
                      {p.projectName}
                    </span>
                    <small className="ms-2 text-muted">
                      ({new Date(p.deadline).toLocaleDateString("vi-VN")})
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-danger rounded-pill px-3"
                  onClick={() => getReviewWorkspace(p.projectId)}
                >
                  {t("reviewer.action.reviewNow")}
                </button>
              </div>
            ))}

            {nearDeadlineProjects.map((p) => (
              <div
                key={`near-${p.projectId}`}
                className="alert alert-warning d-flex align-items-center justify-content-between border-0 shadow-sm rounded-4 mb-0 py-2 px-3 animate__animated animate__fadeIn"
              >
                <div className="d-flex align-items-center gap-2">
                  <Clock size={18} className="text-warning" />
                  <div>
                    <span className="fw-bold text-dark">
                      {t("reviewer.alerts.nearDeadline")}:
                    </span>{" "}
                    <span className="text-warning-emphasis fw-medium">
                      {p.projectName}
                    </span>
                    <small className="ms-2 text-muted">
                      ({t("reviewer.alerts.endsIn")}{" "}
                      {Math.round(
                        (new Date(p.deadline) - today) / (1000 * 60 * 60),
                      )}
                      h)
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-warning rounded-pill px-3 text-dark fw-medium"
                  onClick={() => getReviewWorkspace(p.projectId)}
                >
                  {t("reviewer.action.reviewNow")}
                </button>
              </div>
            ))}
          </div>
        )}
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
                <p className="text-muted mb-0">
                  {hasReviewerAccess
                    ? t("reviewer.noTasks")
                    : t("reviewer.accessForbiddenEmptyState")}
                </p>
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

export default ReviewerContainer;
