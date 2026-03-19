import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProjectCard = ({ project, onDelete }) => {
  const { t } = useTranslation();
  const annotatorCount = project.totalMembers ?? 0;
  const isAssigned = annotatorCount > 0;

  const totalItems = project.totalDataItems ?? 0;
  const progress = Math.round(Number(project.progress ?? 0));
  const safeProgress = progress === 0 ? 1 : progress;

  const deadlineStr = project.deadline
    ? new Date(project.deadline).toLocaleDateString("vi-VN")
    : t('projectCard.noDeadline');

  const isExpired = project.status === "Expired";

  return (
    <div className="col-xxl-3 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm border-0 card-animate">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="flex-grow-1" style={{ overflow: 'hidden' }}>
              <h5 className="fs-15 mb-1 text-dark fw-bold text-truncate" title={project.name}>
                <Link to={`/projects/${project.id}`} className="text-dark">
                  {project.name}
                </Link>
              </h5>
              <small className="text-muted d-flex align-items-center">
                <i className="ri-stack-line me-1 text-primary"></i>
                {totalItems} {t('projectCard.dataItems')}
              </small>
            </div>
            <div className="flex-shrink-0">
              {isExpired ? (
                <span className="badge bg-danger-subtle text-danger">
                  {t('managerProjectCard.expired')}
                </span>
              ) : isAssigned ? (
                <span className="badge bg-success-subtle text-success">
                  {t('managerProjectCard.assigned')}
                </span>
              ) : (
                <span className="badge bg-warning-subtle text-warning">
                  {t('managerProjectCard.unassigned')}
                </span>
              )}
            </div>
          </div>

          <div className="row gy-3 mb-4">
            <div className="col-6">
              <p className="text-muted mb-1 small">{t('managerProjectCard.deadline')}</p>
              <h6 className="mb-0">
                <i className="ri-calendar-event-line me-1 text-muted"></i>
                {deadlineStr}
              </h6>
            </div>
            <div className="col-6 text-end">
              <p className="text-muted mb-1 small">{t('managerProjectCard.status')}</p>
              <h6 className="mb-0">
                <span
                  className={`badge ${isExpired ? "bg-danger" : "bg-success"}`}
                >
                  {project.status === "Expired" ? t('managerProjectCard.expired') : (project.status ? t('projectCard.statusActive') : t('projectCard.statusActive'))}
                </span>
              </h6>
            </div>
          </div>

          <div className="mt-4">
            <div className="d-flex justify-content-between mb-2">
              <small className="text-muted">{t('managerProjectCard.progress')}</small>
              <small className="fw-bold text-success">{progress}%</small>
            </div>
            <div className="progress progress-sm">
              <div
                className="progress-bar bg-success"
                style={{ width: `${safeProgress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 border-top border-top-dashed pt-3 mt-4">
            <div className="d-flex align-items-center text-muted small">
              <i className="ri-image-2-line me-2 fs-16 text-info"></i>
              <span>{t('managerProjectCard.images', { count: totalItems })}</span>
            </div>
            <div
              className="vr text-muted opacity-25"
              style={{ height: "15px" }}
            ></div>
            <div className="d-flex align-items-center text-muted small">
              <i className="ri-user-star-line me-2 fs-16 text-warning"></i>
              <span>{t('managerProjectCard.staff', { count: annotatorCount })}</span>
            </div>
          </div>
        </div>

        <div className="card-footer bg-transparent border-top-dashed d-flex gap-2">
          <Link
            to={`/project-detail/${project.id}`}
            className="btn btn-soft-info btn-sm flex-grow-1"
          >
            <i className="ri-database-2-line me-1"></i> {t('projectCard.dataBtn')}
          </Link>
          <Link
            to={`/projects-assign/${project.id}`}
            className="btn btn-soft-primary btn-sm flex-grow-1"
          >
            <i className="ri-user-add-line me-1"></i> {t('projectCard.assignBtn')}
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
