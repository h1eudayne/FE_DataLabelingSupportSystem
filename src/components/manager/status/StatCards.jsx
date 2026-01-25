import React, { useEffect, useState } from "react";

const StatCard = ({ title, value = 0, icon: Icon, color = "primary" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = Math.floor(progress * end);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="card card-animate shadow-sm border-0">
      <div className="card-body">
        <p className="text-uppercase fw-medium text-muted mb-0">{title}</p>

        <div className="d-flex align-items-end justify-content-between mt-4">
          <h4 className="fs-22 fw-semibold mb-4">
            {displayValue.toLocaleString()}
          </h4>

          <span className={`avatar-title bg-${color}-subtle rounded fs-3 p-2`}>
            {Icon && <Icon className={`text-${color}`} size={28} />}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
