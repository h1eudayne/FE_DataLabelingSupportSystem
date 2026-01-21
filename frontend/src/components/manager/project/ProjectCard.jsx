import React from "react";
import { Link } from "react-router-dom";

const ProjectCard = ({ project, onDelete }) => {
  const totalItems = project.totalDataItems || 0;
  const progress = project.progress || 0;

  const annotatorCount = project.annotatorCount || 0;
  const isAssigned = annotatorCount > 0;

  return (
    <div className="col-xxl-3 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm border-0 card-animate">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="flex-grow-1">
              <h5 className="fs-15 mb-1 text-dark fw-bold">
                <Link to={`/projects/${project.id}`} className="text-dark">
                  {project.name}
                </Link>
              </h5>
              <small className="text-muted d-flex align-items-center">
                <i className="ri-stack-line me-1 text-primary"></i>
                {project.allowGeometryTypes || "Object Detection"}
              </small>
            </div>
            <div className="flex-shrink-0">
              <span
                className={`badge ${isAssigned ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
              >
                {isAssigned ? "Đã giao việc" : "Chưa giao"}
              </span>
            </div>
          </div>

          <div className="row gy-3 mb-4">
            <div className="col-6">
              <p className="text-muted mb-1 small">Ngân sách</p>
              <h6 className="mb-0 text-primary">
                <i className="ri-money-dollar-circle-line me-1"></i>$
                {project.totalBudget || 0}
              </h6>
            </div>
            <div className="col-6 text-end">
              <p className="text-muted mb-1 small">Hạn chót</p>
              <h6 className="mb-0">
                <i className="ri-calendar-event-line me-1 text-muted"></i>
                {project.deadline
                  ? new Date(project.deadline).toLocaleDateString()
                  : "N/A"}
              </h6>
            </div>
          </div>

          <div className="mt-4">
            <div className="d-flex justify-content-between mb-2">
              <small className="text-muted">Tiến độ</small>
              <small className="fw-bold text-success">{progress}%</small>
            </div>
            <div className="progress progress-sm">
              <div
                className="progress-bar bg-success"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 border-top border-top-dashed pt-3 mt-4">
            <div className="d-flex align-items-center text-muted small">
              <i className="ri-image-2-line me-2 fs-16 text-info"></i>
              <span>{totalItems} Ảnh</span>
            </div>
            <div
              className="vr text-muted opacity-25"
              style={{ height: "15px" }}
            ></div>
            <div className="d-flex align-items-center text-muted small">
              <i className="ri-user-star-line me-2 fs-16 text-warning"></i>
              <span>{annotatorCount} Nhân viên</span>
            </div>
          </div>
        </div>

        <div className="card-footer bg-transparent border-top-dashed d-flex gap-2">
          <Link
            to={`/projects-datasets/${project.id}`}
            className="btn btn-soft-info btn-sm flex-grow-1"
          >
            <i className="ri-database-2-line me-1"></i> Data
          </Link>
          <Link
            to={`/projects-assign/${project.id}`}
            className="btn btn-soft-primary btn-sm flex-grow-1"
          >
            <i className="ri-user-add-line me-1"></i> Assign
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
