import React, { useEffect, useState } from "react";

const StatCard = ({ title, value = 0, icon: Icon, color = "primary" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  const strVal = String(value);
  const match = strVal.match(/^([\d.]+)(.*)$/);
  const numericPart = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const isNumeric = match !== null && !isNaN(numericPart);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(numericPart);
      return;
    }
    const end = numericPart;
    const duration = 1000;
    const startTime = performance.now();
    const hasDecimal = strVal.includes(".");

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const current = progress * end;
      setDisplayValue(
        hasDecimal ? Math.round(current * 10) / 10 : Math.floor(current),
      );
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon, {
        className: `text-${color}`,
        size: Icon.props.size ?? 24,
      });
    }

    const IconComponent = Icon;
    if (IconComponent) {
      return <IconComponent className={`text-${color}`} size={24} strokeWidth={2.2} />;
    }

    return null;
  };

  return (
    <div className="card card-animate shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 overflow-hidden">
            <p className="text-uppercase fw-medium text-muted text-truncate mb-0 small">
              {title}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-end justify-content-between mt-2">
          <div>
            <h4 className="fs-20 fw-semibold ff-secondary mb-0">
              {isNumeric ? `${displayValue.toLocaleString()}${suffix}` : strVal}
            </h4>
          </div>
          <div className="flex-shrink-0">
            <span
              className={`avatar-title d-inline-flex align-items-center justify-content-center bg-${color}-subtle text-${color} rounded-3 shadow-sm`}
              style={{ width: "3rem", height: "3rem" }}
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
