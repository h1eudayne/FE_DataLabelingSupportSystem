import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Group, Text, Line, Circle, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { resolveBackendAssetUrl } from "../../../config/runtime";

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const ZOOM_STEP = 1.15;
const ZOOM_BTN_STEP = 1.25;

const EvidenceCanvasViewer = ({
  imageUrl,
  annotations = [],
  highlightedAnnotationId = null,
  onAnnotationSelect,
  emptyState,
  height = 420,
}) => {
  const containerRef = useRef(null);
  const [image] = useImage(resolveBackendAssetUrl(imageUrl), "anonymous");
  const [size, setSize] = useState({ width: 0, height });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [defaultView, setDefaultView] = useState({
    scale: 1,
    pos: { x: 0, y: 0 },
  });

  const fitImageToStage = useCallback(() => {
    if (!containerRef.current || !image) {
      return;
    }

    const width = containerRef.current.offsetWidth || 640;
    const nextHeight = height;
    const scale = Math.min(width / image.width, nextHeight / image.height) * 0.92;
    const pos = {
      x: (width - image.width * scale) / 2,
      y: (nextHeight - image.height * scale) / 2,
    };

    setSize({ width, height: nextHeight });
    setStageScale(scale);
    setStagePos(pos);
    setDefaultView({ scale, pos });
  }, [height, image]);

  useEffect(() => {
    fitImageToStage();
  }, [fitImageToStage]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => fitImageToStage());
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [fitImageToStage]);

  const handleWheel = (event) => {
    event.evt.preventDefault();
    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();

    if (!pointer) {
      return;
    }

    const direction = event.evt.deltaY < 0 ? 1 : -1;
    const newScale =
      direction > 0
        ? Math.min(stageScale * ZOOM_STEP, MAX_SCALE)
        : Math.max(stageScale / ZOOM_STEP, MIN_SCALE);

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / stageScale,
      y: (pointer.y - stagePos.y) / stageScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleZoomIn = () => {
    const center = { x: size.width / 2, y: size.height / 2 };
    const newScale = Math.min(stageScale * ZOOM_BTN_STEP, MAX_SCALE);
    const mousePointTo = {
      x: (center.x - stagePos.x) / stageScale,
      y: (center.y - stagePos.y) / stageScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  };

  const handleZoomOut = () => {
    const center = { x: size.width / 2, y: size.height / 2 };
    const newScale = Math.max(stageScale / ZOOM_BTN_STEP, MIN_SCALE);
    const mousePointTo = {
      x: (center.x - stagePos.x) / stageScale,
      y: (center.y - stagePos.y) / stageScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  };

  const handleReset = () => {
    setStageScale(defaultView.scale || 1);
    setStagePos(defaultView.pos || { x: 0, y: 0 });
  };

  const zoomPercent = Math.round(
    (stageScale / (defaultView.scale || 1)) * 100,
  );

  return (
    <div
      className="border rounded overflow-hidden"
      style={{ background: "#0f172a" }}
    >
      <div
        className="d-flex align-items-center gap-2 px-3 py-2 border-bottom"
        style={{ background: "rgba(15, 23, 42, 0.96)", borderColor: "rgba(148, 163, 184, 0.2)" }}
      >
        <button
          className="btn btn-sm btn-light"
          type="button"
          onClick={handleZoomOut}
        >
          <i className="ri-zoom-out-line"></i>
        </button>
        <span className="text-white fw-semibold" style={{ minWidth: 56, textAlign: "center" }}>
          {zoomPercent}%
        </span>
        <button
          className="btn btn-sm btn-light"
          type="button"
          onClick={handleZoomIn}
        >
          <i className="ri-zoom-in-line"></i>
        </button>
        <button
          className="btn btn-sm btn-outline-light ms-2"
          type="button"
          onClick={handleReset}
        >
          <i className="ri-fullscreen-line me-1"></i>
          Reset
        </button>
        <span className="ms-auto text-white-50 small">
          {annotations.length} evidence shape{annotations.length === 1 ? "" : "s"}
        </span>
      </div>

      <div ref={containerRef} style={{ height }}>
        {imageUrl ? (
          <Stage
            width={size.width}
            height={size.height}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePos.x}
            y={stagePos.y}
            onWheel={handleWheel}
          >
            <Layer>
              {image && <KonvaImage image={image} />}

              {annotations.map((annotation) => {
                const isHighlighted = highlightedAnnotationId === annotation.id;
                const stroke = isHighlighted ? "#ffffff" : annotation.color || "#14b8a6";
                const fill = `${annotation.color || "#14b8a6"}22`;
                const tagFontSize = 11 / stageScale;
                const tagPadding = 4 / stageScale;
                const tagText = annotation.labelName || "Label";
                const tagWidth =
                  tagText.length * tagFontSize * 0.65 + tagPadding * 2;
                const tagHeight = tagFontSize + tagPadding * 2;

                const commonEvents = {
                  onClick: () => onAnnotationSelect?.(annotation.id),
                };

                if (annotation.type === "POLYGON" && annotation.points.length > 0) {
                  const minX = Math.min(...annotation.points.map((point) => point.x));
                  const minY = Math.min(...annotation.points.map((point) => point.y));

                  return (
                    <Group key={annotation.id}>
                      <Line
                        points={annotation.points.flatMap((point) => [point.x, point.y])}
                        closed={true}
                        stroke={stroke}
                        strokeWidth={(isHighlighted ? 3 : 2) / stageScale}
                        fill={fill}
                        dash={isHighlighted ? [6 / stageScale, 3 / stageScale] : undefined}
                        {...commonEvents}
                      />
                      <Rect
                        x={minX}
                        y={minY - tagHeight}
                        width={tagWidth}
                        height={tagHeight}
                        fill={annotation.color || "#14b8a6"}
                        cornerRadius={2 / stageScale}
                      />
                      <Text
                        x={minX + tagPadding}
                        y={minY - tagHeight + tagPadding}
                        text={tagText}
                        fill="#ffffff"
                        fontSize={tagFontSize}
                        fontStyle="bold"
                      />
                      {isHighlighted &&
                        annotation.points.map((point, index) => (
                          <Circle
                            key={`${annotation.id}-${index}`}
                            x={point.x}
                            y={point.y}
                            radius={4 / stageScale}
                            fill="#ffffff"
                            listening={false}
                          />
                        ))}
                    </Group>
                  );
                }

                return (
                  <Group key={annotation.id}>
                    <Rect
                      x={annotation.x}
                      y={annotation.y}
                      width={annotation.width}
                      height={annotation.height}
                      stroke={stroke}
                      strokeWidth={(isHighlighted ? 3 : 2) / stageScale}
                      fill={fill}
                      dash={isHighlighted ? [6 / stageScale, 3 / stageScale] : undefined}
                      {...commonEvents}
                    />
                    <Rect
                      x={annotation.x}
                      y={annotation.y - tagHeight}
                      width={tagWidth}
                      height={tagHeight}
                      fill={annotation.color || "#14b8a6"}
                      cornerRadius={2 / stageScale}
                    />
                    <Text
                      x={annotation.x + tagPadding}
                      y={annotation.y - tagHeight + tagPadding}
                      text={tagText}
                      fill="#ffffff"
                      fontSize={tagFontSize}
                      fontStyle="bold"
                    />
                  </Group>
                );
              })}
            </Layer>
          </Stage>
        ) : (
          <div className="h-100 d-flex align-items-center justify-content-center text-white-50 px-4 text-center">
            {emptyState}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceCanvasViewer;
