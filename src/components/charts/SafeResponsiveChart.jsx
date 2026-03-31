import React, { useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

const DEFAULT_HEIGHT = 260;

const SafeResponsiveChart = ({
  height = DEFAULT_HEIGHT,
  minHeight,
  className = "",
  fallback = null,
  children,
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const updateReadiness = () => {
      const width = element.clientWidth;
      const resolvedHeight = element.clientHeight || height;
      setDimensions({
        width: Math.max(0, width),
        height: Math.max(0, resolvedHeight),
      });
    };

    updateReadiness();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updateReadiness();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height, minHeight: minHeight ?? height }}
    >
      {dimensions.width > 0 && dimensions.height > 0 ? (
        <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
          {children}
        </ResponsiveContainer>
      ) : (
        fallback ?? (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
            <span>Preparing chart...</span>
          </div>
        )
      )}
    </div>
  );
};

export default SafeResponsiveChart;
