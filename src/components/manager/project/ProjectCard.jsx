import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProjectCard = ({ project, onDelete }) => {
  const { t } = useTranslation();
  const annotatorCount = project.totalMembers ?? 0;
  const isAssigned = annotatorCount > 0;

  const totalItems = project.totalDataItems ?? 0;
  const progress = Math.round(Number(project.progress ?? 0));

  const deadlineStr = project.deadline
    ? new Date(project.deadline).toLocaleDateString("vi-VN")
    : t("projectCard.noDeadline");

  const isExpired = project.status === "Expired";
  const projectLifecycle = (() => {
    if (isExpired) {
      return {
        label: t("managerProjectCard.expired"),
        badgeClass: "bg-danger-subtle text-danger",
      };
    }

    if (!isAssigned) {
      return {
        label: t("managerProjectCard.unassigned"),
        badgeClass: "bg-warning-subtle text-warning",
      };
    }

    if (progress >= 100) {
      return {
        label: t("statusCommon.completed"),
        badgeClass: "bg-success-subtle text-success",
      };
    }

    if (progress > 0) {
      return {
        label: t("statusCommon.inProgress"),
        badgeClass: "bg-success-subtle text-success",
      };
    }

    return {
      label: t("statusCommon.pending"),
      badgeClass: "bg-info-subtle text-info",
    };
  })();

  return (
    <div className="col-xxl-3 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm border-0 card-animate">
        <div className="card-body p-3">
          <div className="d-flex align-items-start mb-3">
            <div className="flex-grow-1" style={{ overflow: "hidden" }}>
              <h6
                className="fs-16 mb-1 text-dark fw-bold text-truncate"
                title={project.name}
              >
                <Link
                  to={`/project-detail/${project.id}`}
                  className="text-dark text-decoration-none"
                >
                  {project.name}
                </Link>
              </h6>
              <small className="text-muted d-flex align-items-center fs-13">
                <i className="ri-stack-line me-1 text-primary fs-14"></i>
                {totalItems} {t("projectCard.dataItems")}
              </small>
            </div>
            <div className="flex-shrink-0">
              {isExpired ? (
                <span className="badge bg-danger-subtle text-danger small fw-semibold px-2 py-2">
                  {t("managerProjectCard.expired")}
                </span>
              ) : isAssigned ? (
                <span className="badge bg-success-subtle text-success small fw-semibold px-2 py-2">
                  {t("managerProjectCard.assigned")}
                </span>
              ) : (
                <span className="badge bg-warning-subtle text-warning small fw-semibold px-2 py-2">
                  {t("managerProjectCard.unassigned")}
                </span>
              )}
            </div>
          </div>

          <div className="row gy-3 mb-3">
            <div className="col-6">
              <p className="text-muted mb-1 small">
                {t("managerProjectCard.deadline")}
              </p>
              <h6 className="mb-0 fs-18 fw-bold">
                <i className="ri-calendar-event-line me-1 text-muted fs-18"></i>
                {deadlineStr}
              </h6>
            </div>
            <div className="col-6 text-end">
              <p className="text-muted mb-1 small">
                {t("managerProjectCard.status")}
              </p>
              <h6 className="mb-0">
                <span className={`badge small fw-semibold px-2 py-2 ${projectLifecycle.badgeClass}`}>
                  {projectLifecycle.label}
                </span>
              </h6>
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between mb-2">
              <small className="text-muted fs-13">
                {t("managerProjectCard.progress")}
              </small>
              <small className="fw-bold text-success fs-14">{progress}%</small>
            </div>
            <div className="progress progress-sm">
              <div
                className="progress-bar bg-success"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 border-top border-top-dashed pt-3 mt-3">
            <div className="d-flex align-items-center text-muted small fs-13">
              <i className="ri-image-2-line me-2 fs-15 text-info"></i>
              <span>
                {t("managerProjectCard.images", { count: totalItems })}
              </span>
            </div>
            <div
              className="vr text-muted opacity-25"
              style={{ height: "15px" }}
            ></div>
            <div className="d-flex align-items-center text-muted small fs-13">
              <i className="ri-user-star-line me-2 fs-15 text-warning"></i>
              <span>
                {t("managerProjectCard.staff", { count: annotatorCount })}
              </span>
            </div>
          </div>
        </div>

        <div className="card-footer bg-transparent border-top-dashed d-flex gap-2 p-3">
          <Link
            to={`/project-detail/${project.id}`}
            className="btn btn-soft-info btn-sm flex-grow-1 text-decoration-none fw-semibold"
          >
            <i className="ri-database-2-line me-1"></i>{" "}
            {t("projectCard.dataBtn")}
          </Link>
          <button
            onClick={() => onDelete(project.id)}
            className="btn btn-soft-danger btn-sm"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
