import React from "react";

export default function StatCard({
  title,
  value,
  icon,
  loading = false,
  color = "primary",
}) {
  return (
    <div className="card card-animate h-100 shadow-sm">
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <p className="text-uppercase fw-semibold text-muted mb-1 fs-12">
            {title}
          </p>

          {loading ? (
            <div className="placeholder-glow">
              <span className="placeholder col-6"></span>
            </div>
          ) : (
            <h3 className="fw-bold mb-0">{value ?? 0}</h3>
          )}
        </div>

        {icon && (
          <div
            className={`stat-icon bg-${color} bg-opacity-10 text-${color}`}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className={icon} style={{ fontSize: 26 }}></i>
          </div>
        )}
      </div>
    </div>
  );
}
