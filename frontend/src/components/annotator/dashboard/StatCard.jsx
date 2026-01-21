import React from "react";

export default function StatCard({
  title,
  value,
  icon,
  loading = false,
  color = "primary",
}) {
  return (
    <div className={`card card-animate h-100`}>
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <p className="text-uppercase fw-medium text-muted mb-0">{title}</p>

            {loading ? (
              <div className="placeholder-glow mt-2">
                <span className="placeholder col-6"></span>
              </div>
            ) : (
              <h4 className="fs-22 fw-semibold ff-secondary mb-0">
                {value ?? 0}
              </h4>
            )}
          </div>

          <div className="flex-shrink-0">
            <span className={`avatar-sm rounded-circle bg-${color}-subtle`}>
              <span className={`avatar-title rounded-circle text-${color}`}>
                <i className={icon}></i>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
