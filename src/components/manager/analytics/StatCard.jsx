import React, { useEffect, useState } from "react";

const StatCard = ({ title, value = 0, icon: Icon, color = "primary" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === "function")
      return <Icon className={`text-${color}`} size={24} />;
    if (React.isValidElement(Icon)) return Icon;
    return null;
  };

  return (
    <div className="card card-animate shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 overflow-hidden">
            <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
              {title}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-end justify-content-between mt-4">
          <div>
            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
              {displayValue.toLocaleString()}
            </h4>
          </div>
          <div className="avatar-sm flex-shrink-0">
            <span
              className={`avatar-title bg-${color}-subtle rounded fs-3 p-2`}
            >
              {renderIcon()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
