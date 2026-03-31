import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Group,
  Text,
  Line,
  Circle,
} from "react-konva";
import useImage from "use-image";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  addAnnotation,
  removeAnnotation,
  removeLastAnnotation,
  undoLastAction,
} from "../../../store/annotator/labelling/labelingSlice";
import { resolveBackendAssetUrl } from "../../../config/runtime";

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const ZOOM_STEP = 1.1;
const PAN_STEP = 30;
const ZOOM_BTN_STEP = 1.25;

const LabelingWorkspace = ({
  imageUrl,
  assignmentId,
  readOnly = false,
  highlightedAnnotationId = null,
  onAnnotationClick,
  projectType = "BBOX",
  onRunAiPreview,
  aiDetecting = false,
  aiExemplarCount = 0,
  aiPreviewEnabled = false,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const stageWrapperRef = useRef(null);
  const lastPolyClickTime = useRef(0);

  const { selectedLabel, annotationsByAssignment } = useSelector(
    (state) => state.labeling,
  );

  const annotations = annotationsByAssignment[assignmentId] || [];
  const resolvedImageUrl = resolveBackendAssetUrl(imageUrl);

  const [image] = useImage(resolvedImageUrl, "anonymous");
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [newRect, setNewRect] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 600 });
  const [cursorPos, setCursorPos] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [defaultView, setDefaultView] = useState({
    scale: 1,
    pos: { x: 0, y: 0 },
  });
  const [mouseImgPos, setMouseImgPos] = useState(null);

  const projTypeUp = projectType?.toUpperCase() || "";
  const allowBbox =
    !projTypeUp ||
    projTypeUp.includes("BBOX") ||
    projTypeUp.includes("RECTANGLE");
  const allowPolygon = projTypeUp.includes("POLYGON");
  const defaultMode = allowPolygon && !allowBbox ? "polygon" : "bbox";
  const [drawingMode, setDrawingMode] = useState(defaultMode);

  useEffect(() => {
    setDrawingMode(allowPolygon && !allowBbox ? "polygon" : "bbox");
  }, [projectType, allowPolygon, allowBbox]);

  const [currentPolygon, setCurrentPolygon] = useState([]);

  const finishPolygon = useCallback(() => {
    if (currentPolygon.length >= 3) {
      dispatch(
        addAnnotation({
          id: Date.now().toString(),
          assignmentId,
          labelId: selectedLabel.id,
          labelName: selectedLabel.name,
          color: selectedLabel.color,
          type: "POLYGON",
          points: currentPolygon,
        }),
      );
    }
    setCurrentPolygon([]);
    setMouseImgPos(null);
  }, [currentPolygon, dispatch, assignmentId, selectedLabel]);

  const fitImageToStage = useCallback(() => {
    
    const el = stageWrapperRef.current || containerRef.current;
    if (!el || !image) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight || 600;
    const scale = Math.min(w / image.width, h / image.height) * 0.92;
    const pos = {
      x: (w - image.width * scale) / 2,
      y: (h - image.height * scale) / 2,
    };
    setStageScale(scale);
    setStagePos(pos);
    setDefaultView({ scale, pos });
    setSize({ width: w, height: h });
  }, [image]);

  useEffect(() => {
    fitImageToStage();
  }, [fitImageToStage]);

  
  useEffect(() => {
    const el = stageWrapperRef.current || containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => fitImageToStage());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitImageToStage]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (readOnly) return;
      
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable;
      if (isInput) return;

      if (e.key === "Enter" && drawingMode === "polygon") {
        e.preventDefault();
        finishPolygon();
        return;
      }
      
      
      
      if (e.key === "Escape") {
        e.preventDefault();
        if (drawingMode === "polygon" && currentPolygon.length > 0) {
          setCurrentPolygon([]);
        }
        
        return;
      }

      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        dispatch(undoLastAction(assignmentId));
        return;
      }

      
      
      
      
      if ((e.key === "Backspace" || e.key === "Delete")) {
        if (!newRect && currentPolygon.length === 0 && !isPanning) {
          e.preventDefault();
          dispatch(removeLastAnnotation(assignmentId));
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setStagePos((p) => ({ ...p, y: p.y + PAN_STEP }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setStagePos((p) => ({ ...p, y: p.y - PAN_STEP }));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStagePos((p) => ({ ...p, x: p.x + PAN_STEP }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setStagePos((p) => ({ ...p, x: p.x - PAN_STEP }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, assignmentId, readOnly, drawingMode, finishPolygon, newRect, currentPolygon, isPanning]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    if (e.evt.ctrlKey) {
      const direction = e.evt.deltaY < 0 ? 1 : -1;
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
    } else {
      setStagePos((p) => ({
        x: p.x - e.evt.deltaX,
        y: p.y - e.evt.deltaY,
      }));
    }
  };

  const getImageCoords = (pointerPos) => {
    return {
      x: (pointerPos.x - stagePos.x) / stageScale,
      y: (pointerPos.y - stagePos.y) / stageScale,
    };
  };

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (e.evt.button === 1) {
      e.evt.preventDefault();
      setIsPanning(true);
      setPanStart({ x: pos.x - stagePos.x, y: pos.y - stagePos.y });
      return;
    }

    if (readOnly || !selectedLabel) {
      setIsPanning(true);
      setPanStart({ x: pos.x - stagePos.x, y: pos.y - stagePos.y });
      return;
    }

    const imgCoords = getImageCoords(pos);
    if (drawingMode === "polygon") {
      const now = Date.now();
      const delta = now - lastPolyClickTime.current;
      lastPolyClickTime.current = now;
      
      if (delta < 350 && currentPolygon.length >= 3) {
        finishPolygon();
        return;
      }
      setCurrentPolygon((prev) => [
        ...prev,
        { x: imgCoords.x, y: imgCoords.y },
      ]);
    } else {
      setNewRect({ x: imgCoords.x, y: imgCoords.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    const imgCoords = getImageCoords(pos);
    setCursorPos({ x: Math.round(imgCoords.x), y: Math.round(imgCoords.y) });
    setMouseImgPos(imgCoords);

    if (isPanning && panStart) {
      setStagePos({
        x: pos.x - panStart.x,
        y: pos.y - panStart.y,
      });
      return;
    }

    if (!newRect) return;
    setNewRect((r) => ({
      ...r,
      width: imgCoords.x - r.x,
      height: imgCoords.y - r.y,
    }));
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (drawingMode === "bbox") {
      if (
        newRect &&
        Math.abs(newRect.width) > 5 &&
        Math.abs(newRect.height) > 5
      ) {
        dispatch(
          addAnnotation({
            id: Date.now().toString(),
            assignmentId,
            labelId: selectedLabel.id,
            labelName: selectedLabel.name,
            color: selectedLabel.color,
            type: "BBOX",
            x: newRect.width > 0 ? newRect.x : newRect.x + newRect.width,
            y: newRect.height > 0 ? newRect.y : newRect.y + newRect.height,
            width: Math.abs(newRect.width),
            height: Math.abs(newRect.height),
          }),
        );
      }
      setNewRect(null);
    }
  };

  const handleMouseEnter = () => {
    if (!containerRef.current) return;
    containerRef.current.style.cursor = readOnly
      ? "default"
      : selectedLabel
        ? "crosshair"
        : "grab";
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.cursor = "default";
    setCursorPos(null);
    setMouseImgPos(null);
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

  const handleResetView = () => {
    fitImageToStage();
  };

  const handleUndo = () => {
    if (readOnly) return;
    dispatch(undoLastAction(assignmentId));
  };

  const zoomPercent = Math.round((stageScale / (defaultView.scale || 1)) * 100);

  
  const imgW = image ? image.width : 0;
  const imgH = image ? image.height : 0;
  const showCrosshair = !readOnly && selectedLabel && mouseImgPos && !isPanning;

  return (
    <div ref={containerRef} className="stitch-ws-canvas-container">
      {}
      <div className="stitch-ws-toolbar">
        <button
          className="stitch-ws-toolbar-btn"
          onClick={handleZoomOut}
          title={t("workspace.zoomOut")}
        >
          <i className="ri-zoom-out-line"></i>
        </button>
        <span
          className="text-white fw-bold"
          style={{ minWidth: "48px", textAlign: "center", fontSize: "0.75rem" }}
        >
          {zoomPercent}%
        </span>
        <button
          className="stitch-ws-toolbar-btn"
          onClick={handleZoomIn}
          title={t("workspace.zoomIn")}
        >
          <i className="ri-zoom-in-line"></i>
        </button>
        {allowBbox && allowPolygon && !readOnly && (
          <>
            <div className="stitch-ws-toolbar-divider"></div>
            <button
              className={`stitch-ws-toolbar-btn ${drawingMode === "bbox" ? "primary" : ""}`}
              onClick={() => setDrawingMode("bbox")}
              title={t("workspace.drawBBox")}
            >
              <i className="ri-shape-line me-1"></i> {t("workspace.bboxTool")}
            </button>
            <button
              className={`stitch-ws-toolbar-btn ${drawingMode === "polygon" ? "primary" : ""}`}
              onClick={() => {
                setDrawingMode("polygon");
                setNewRect(null);
              }}
              title={t("workspace.drawPolygon")}
            >
              <i className="ri-share-line me-1"></i> {t("workspace.polygonTool")}
            </button>
          </>
        )}
        <div className="stitch-ws-toolbar-divider"></div>
        <button
          className="stitch-ws-toolbar-btn"
          onClick={handleResetView}
          title={t("workspace.resetView")}
        >
          <i className="ri-fullscreen-line me-1"></i>
          {t("workspace.reset")}
        </button>
        {!readOnly && (
          <button
            className="stitch-ws-toolbar-btn warning"
            onClick={handleUndo}
            title={t("workspace.undoShortcut")}
          >
            <i className="ri-arrow-go-back-line me-1"></i>
            {t("workspace.undo")}
          </button>
        )}
        {typeof onRunAiPreview === "function" && !readOnly && (
          <>
            <div className="stitch-ws-toolbar-divider"></div>
            <button
              className="stitch-ws-toolbar-btn"
              onClick={onRunAiPreview}
              disabled={!aiPreviewEnabled || aiDetecting}
              title={
                aiPreviewEnabled
                  ? t("workspace.aiToolbarButton")
                  : t("workspace.aiNeedExemplars")
              }
            >
              {aiDetecting ? (
                <span
                  className="spinner-border spinner-border-sm me-1"
                  aria-hidden="true"
                ></span>
              ) : (
                <i className="ri-sparkling-line me-1"></i>
              )}
              {t("workspace.aiToolbarButton")}
            </button>
            <span
              className={`stitch-ws-badge ${aiExemplarCount > 0 ? "stitch-ws-badge-inprogress" : "stitch-ws-badge-rejected"}`}
            >
              {aiExemplarCount}/3
            </span>
          </>
        )}
        {annotations.length > 0 && (
          <span className="stitch-ws-badge stitch-ws-badge-inprogress ms-1">
            <i className="ri-shape-line"></i>
            {annotations.length}{" "}
            {t(annotations.length === 1 ? "workspace.shape" : "workspace.shapes")}
          </span>
        )}
        <div
          className="ms-auto d-flex align-items-center gap-2 stitch-ws-toolbar-hint"
          style={{
            fontSize: "0.7rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {drawingMode === "polygon" && !readOnly && (
            <span style={{ color: "#FACC15", whiteSpace: "nowrap" }}>
              <i className="ri-corner-down-left-line"></i> {t("workspace.finishDraw")}
            </span>
          )}
          {drawingMode === "polygon" && currentPolygon.length > 0 && (
            <span style={{ color: "#F87171", whiteSpace: "nowrap" }}>
              <i className="ri-close-line"></i> {t("workspace.cancelDraw")}
            </span>
          )}
          <span style={{ whiteSpace: "nowrap" }}>
            <i className="ri-mouse-line"></i> {t("workspace.zoomHint")}
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            <i className="ri-drag-move-line"></i> {t("workspace.moveDraw")}
          </span>
        </div>
      </div>

      {}
      <div ref={stageWrapperRef} className="stitch-ws-stage-wrapper">
        <Stage
          width={size.width}
          height={size.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={handleWheel}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {image && <KonvaImage image={image} />}

            {}
            {annotations.map((a) => {
              const isHighlighted = highlightedAnnotationId === a.id;
              const tagFontSize = 11 / stageScale;
              const tagPadding = 3 / stageScale;
              const tagText = a.labelName || "Box";
              
              const tagWidth =
                tagText.length * tagFontSize * 0.65 + tagPadding * 2;
              const tagHeight = tagFontSize + tagPadding * 2;

              if (a.type === "POLYGON" || a.points) {
                const minX = Math.min(...a.points.map((p) => p.x));
                const minY = Math.min(...a.points.map((p) => p.y));
                return (
                  <Group key={a.id}>
                    <Line
                      points={a.points.flatMap((p) => [p.x, p.y])}
                      closed={true}
                      stroke={isHighlighted ? "#fff" : a.color || "#6c757d"}
                      strokeWidth={(isHighlighted ? 3 : 2) / stageScale}
                      fill={
                        (a.color || "#6c757d") + (isHighlighted ? "55" : "22")
                      }
                      dash={
                        isHighlighted
                          ? [6 / stageScale, 3 / stageScale]
                          : undefined
                      }
                      onDblClick={() => {
                        if (!readOnly)
                          dispatch(
                            removeAnnotation({ assignmentId, id: a.id }),
                          );
                      }}
                      onClick={() => {
                        if (onAnnotationClick) onAnnotationClick(a.id);
                      }}
                    />
                    <Rect
                      x={minX}
                      y={minY - tagHeight}
                      width={tagWidth}
                      height={tagHeight}
                      fill={a.color || "#6c757d"}
                      cornerRadius={2 / stageScale}
                    />
                    <Text
                      x={minX + tagPadding}
                      y={minY - tagHeight + tagPadding}
                      text={tagText}
                      fill="white"
                      fontSize={tagFontSize}
                      fontStyle="bold"
                    />
                  </Group>
                );
              }

              return (
                <Group key={a.id}>
                  {}
                  <Rect
                    x={a.x}
                    y={a.y}
                    width={a.width}
                    height={a.height}
                    stroke={isHighlighted ? "#fff" : a.color || "#6c757d"}
                    strokeWidth={(isHighlighted ? 3 : 2) / stageScale}
                    fill={
                      (a.color || "#6c757d") + (isHighlighted ? "55" : "22")
                    }
                    dash={
                      isHighlighted
                        ? [6 / stageScale, 3 / stageScale]
                        : undefined
                    }
                    onDblClick={() => {
                      if (!readOnly)
                        dispatch(removeAnnotation({ assignmentId, id: a.id }));
                    }}
                    onClick={() => {
                      if (onAnnotationClick) onAnnotationClick(a.id);
                    }}
                  />
                  {}
                  <Rect
                    x={a.x}
                    y={a.y - tagHeight}
                    width={tagWidth}
                    height={tagHeight}
                    fill={a.color || "#6c757d"}
                    cornerRadius={2 / stageScale}
                  />
                  {}
                  <Text
                    x={a.x + tagPadding}
                    y={a.y - tagHeight + tagPadding}
                    text={tagText}
                    fill="white"
                    fontSize={tagFontSize}
                    fontStyle="bold"
                  />
                </Group>
              );
            })}

            {}
            {newRect && drawingMode === "bbox" && (
              <Rect
                {...newRect}
                stroke="yellow"
                dash={[6, 4]}
                strokeWidth={2 / stageScale}
              />
            )}

            {}
            {drawingMode === "polygon" && currentPolygon.length > 0 && (
              <Group>
                <Line
                  points={currentPolygon.flatMap((p) => [p.x, p.y])}
                  stroke="yellow"
                  strokeWidth={2 / stageScale}
                  closed={false}
                />
                {mouseImgPos && (
                  <Line
                    points={[
                      currentPolygon[currentPolygon.length - 1].x,
                      currentPolygon[currentPolygon.length - 1].y,
                      mouseImgPos.x,
                      mouseImgPos.y,
                    ]}
                    stroke="yellow"
                    strokeWidth={2 / stageScale}
                    dash={[6 / stageScale, 4 / stageScale]}
                  />
                )}
                {currentPolygon.map((p, i) => (
                  <Circle
                    key={i}
                    x={p.x}
                    y={p.y}
                    radius={4 / stageScale}
                    fill={i === 0 ? "#22c55e" : "yellow"}
                    onDblClick={(e) => {
                      
                      e.cancelBubble = true;
                      if (!readOnly && i === 0 && currentPolygon.length >= 3) {
                        finishPolygon();
                      }
                    }}
                  />
                ))}
              </Group>
            )}

            {}
            {showCrosshair && (
              <>
                {}
                <Line
                  points={[mouseImgPos.x, 0, mouseImgPos.x, imgH]}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1 / stageScale}
                  dash={[4 / stageScale, 4 / stageScale]}
                  listening={false}
                />
                {}
                <Line
                  points={[0, mouseImgPos.y, imgW, mouseImgPos.y]}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1 / stageScale}
                  dash={[4 / stageScale, 4 / stageScale]}
                  listening={false}
                />
              </>
            )}
          </Layer>
        </Stage>
      </div>

      {}
      <div className="stitch-ws-coord-bar">
        <span className="fw-bold" style={{ color: "#22D3EE" }}>
          <i className="ri-crosshair-2-line me-1"></i>{t("workspace.coordinates")}:
        </span>
        {cursorPos ? (
          <>
            <span>
              X: <strong>{cursorPos.x}</strong>
            </span>
            <span>
              Y: <strong>{cursorPos.y}</strong>
            </span>
          </>
        ) : (
          <span style={{ opacity: 0.5 }}>{t("workspace.hoverCanvas")}</span>
        )}

        {newRect && drawingMode === "bbox" && (
          <>
            <div
              className="stitch-ws-toolbar-divider"
              style={{ height: 16 }}
            ></div>
            <span style={{ color: "#FACC15" }}>
              <i className="ri-shape-line me-1"></i>
              W: <strong>{Math.abs(Math.round(newRect.width))}</strong>
              {" × "}
              H: <strong>{Math.abs(Math.round(newRect.height))}</strong>
            </span>
          </>
        )}

        {drawingMode === "polygon" && currentPolygon.length > 0 && (
          <>
            <div
              className="stitch-ws-toolbar-divider"
              style={{ height: 16 }}
            ></div>
            <span style={{ color: "#FACC15" }}>
              <i className="ri-share-line me-1"></i>
              {t("workspace.points", { count: currentPolygon.length })}
            </span>
          </>
        )}

        {image && (
          <span className="ms-auto" style={{ opacity: 0.5 }}>
            {t("workspace.originalImage", { width: image.width, height: image.height })}
          </span>
        )}
      </div>
    </div>
  );
};

export default LabelingWorkspace;
