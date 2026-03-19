import React, { useEffect, useState } from "react";

const StatCard = ({ title, value = 0, icon: Icon, color = "primary" }) => {
  const strVal = String(value);
  const match = strVal.match(/^([\d.]+)(.*)$/);
  const numericPart = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const isNumeric = match !== null && !isNaN(numericPart);

  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : numericPart);

  // Sync state on prop change if not numeric
  const [prevVal, setPrevVal] = useState(value);
  if (!isNumeric && value !== prevVal) {
    setDisplayValue(numericPart);
    setPrevVal(value);
  }

  useEffect(() => {
    if (!isNumeric) return;
    const end = numericPart;
    const duration = 1000;
    const startTime = performance.now();
    const hasDecimal = strVal.includes(".");
    let animationFrameId;

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const current = progress * end;
      setDisplayValue(
        hasDecimal ? Math.round(current * 10) / 10 : Math.floor(current),
      );
      if (progress < 1) animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isNumeric, numericPart, strVal]);

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
        <div className="d-flex align-items-end justify-content-between mt-2">
          <div>
            <h4 className="fs-22 fw-semibold ff-secondary mb-0">
              {isNumeric ? `${displayValue.toLocaleString()}${suffix}` : strVal}
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
