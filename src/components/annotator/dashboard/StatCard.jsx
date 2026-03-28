import React from "react";

export default function StatCard({
  title,
  value,
  icon,
  loading = false,
  color = "primary",
}) {
  return (
    <div className="col">
      <div className="card stitch-stat-card h-100">
        <div className="card-body d-flex align-items-center gap-3 p-3">
          {}
          {icon && (
            <div className={`stat-icon-gradient ${color}`}>
              <i className={icon}></i>
            </div>
          )}

          {}
          <div className="flex-grow-1 min-width-0">
            <p className="stitch-stat-title">{title}</p>

            {loading ? (
              <div className="placeholder-glow">
                <span
                  className="placeholder col-6"
                  style={{ borderRadius: 4, height: 24 }}
                ></span>
              </div>
            ) : (
              <h3 className="stitch-stat-value">{value ?? 0}</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
