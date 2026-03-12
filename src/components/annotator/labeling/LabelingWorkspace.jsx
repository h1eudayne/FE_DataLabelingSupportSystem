import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Group,
  Text,
  Line,
} from "react-konva";
import useImage from "use-image";
import { useDispatch, useSelector } from "react-redux";
import {
  addAnnotation,
  removeAnnotation,
  removeLastAnnotation,
  undoLastAction,
} from "../../../store/annotator/labelling/labelingSlice";

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
}) => {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  const { selectedLabel, annotationsByAssignment } = useSelector(
    (state) => state.labeling,
  );

  const annotations = annotationsByAssignment[assignmentId] || [];

  const [image] = useImage(imageUrl, "anonymous");
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

  const fitImageToStage = useCallback(() => {
    if (!containerRef.current || !image) return;
    const w = containerRef.current.offsetWidth;
    const h = 600;
    const scale = Math.min(w / image.width, h / image.height) * 0.85;
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
    const onKeyDown = (e) => {
      if (readOnly) return;

      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        dispatch(undoLastAction(assignmentId));
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        if (!readOnly) dispatch(removeLastAnnotation(assignmentId));
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
  }, [dispatch, assignmentId]);

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
    setNewRect({ x: imgCoords.x, y: imgCoords.y, width: 0, height: 0 });
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
          x: newRect.width > 0 ? newRect.x : newRect.x + newRect.width,
          y: newRect.height > 0 ? newRect.y : newRect.y + newRect.height,
          width: Math.abs(newRect.width),
          height: Math.abs(newRect.height),
        }),
      );
    }
    setNewRect(null);
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
    <div ref={containerRef} className="bg-dark rounded position-relative">
      <div
        className="d-flex align-items-center gap-2 px-3 py-2"
        style={{
          background: "rgba(0,0,0,0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.375rem 0.375rem 0 0",
        }}
      >
        <button
          className="btn btn-sm btn-outline-light"
          onClick={handleZoomOut}
          title="Thu nhỏ"
        >
          <i className="ri-zoom-out-line"></i>
        </button>
        <span
          className="text-white fw-bold small"
          style={{ minWidth: "48px", textAlign: "center" }}
        >
          {zoomPercent}%
        </span>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={handleZoomIn}
          title="Phóng to"
        >
          <i className="ri-zoom-in-line"></i>
        </button>
        <div
          style={{
            width: "1px",
            height: "20px",
            background: "rgba(255,255,255,0.3)",
          }}
        ></div>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={handleResetView}
          title="Về mặc định"
        >
          <i className="ri-fullscreen-line me-1"></i>
          <span className="small">Reset</span>
        </button>
        {!readOnly && (
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={handleUndo}
            title="Hoàn tác (Ctrl+Z)"
          >
            <i className="ri-arrow-go-back-line me-1"></i>
            <span className="small">Undo</span>
          </button>
        )}
        {annotations.length > 0 && (
          <span className="badge bg-info bg-opacity-25 text-info small ms-1">
            <i className="ri-shape-line me-1"></i>
            {annotations.length} box{annotations.length > 1 ? "es" : ""}
          </span>
        )}
        <div className="ms-auto d-flex align-items-center gap-3 text-white small opacity-75">
          <span>
            <i className="ri-mouse-line me-1"></i>
            Ctrl+Scroll: Zoom
          </span>
          <span>
            <i className="ri-drag-move-line me-1"></i>
            Scroll/Kéo: Di chuyển
          </span>
        </div>
      </div>

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

          {annotations.map((a) => {
            const isHighlighted = highlightedAnnotationId === a.id;
            const tagFontSize = 11 / stageScale;
            const tagPadding = 3 / stageScale;
            const tagText = a.labelName || "Box";
            const tagWidth =
              tagText.length * tagFontSize * 0.65 + tagPadding * 2;
            const tagHeight = tagFontSize + tagPadding * 2;

            return (
              <Group key={a.id}>
                <Rect
                  x={a.x}
                  y={a.y}
                  width={a.width}
                  height={a.height}
                  stroke={isHighlighted ? "#fff" : a.color || "#6c757d"}
                  strokeWidth={(isHighlighted ? 3 : 2) / stageScale}
                  fill={(a.color || "#6c757d") + (isHighlighted ? "55" : "22")}
                  dash={
                    isHighlighted ? [6 / stageScale, 3 / stageScale] : undefined
                  }
                  onDblClick={() => {
                    if (!readOnly)
                      dispatch(removeAnnotation({ assignmentId, id: a.id }));
                  }}
                  onClick={() => {
                    if (onAnnotationClick) onAnnotationClick(a.id);
                  }}
                />
                <Rect
                  x={a.x}
                  y={a.y - tagHeight}
                  width={tagWidth}
                  height={tagHeight}
                  fill={a.color || "#6c757d"}
                  cornerRadius={2 / stageScale}
                />
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

          {newRect && (
            <Rect
              {...newRect}
              stroke="yellow"
              dash={[6, 4]}
              strokeWidth={2 / stageScale}
            />
          )}

          {showCrosshair && (
            <>
              <Line
                points={[mouseImgPos.x, 0, mouseImgPos.x, imgH]}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1 / stageScale}
                dash={[4 / stageScale, 4 / stageScale]}
                listening={false}
              />
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

      <div
        className="d-flex align-items-center gap-3 px-3 py-2 text-white small"
        style={{
          background: "rgba(0,0,0,0.6)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0 0 0.375rem 0.375rem",
        }}
      >
        <span className="fw-bold text-info">
          <i className="ri-crosshair-2-line me-1"></i>Toạ độ:
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
          <span className="opacity-50">Di chuột vào canvas</span>
        )}

        {newRect && (
          <>
            <div
              style={{
                width: "1px",
                height: "16px",
                background: "rgba(255,255,255,0.3)",
              }}
            ></div>
            <span className="text-warning">
              <i className="ri-shape-line me-1"></i>
              W: <strong>{Math.abs(Math.round(newRect.width))}</strong>
              {" × "}
              H: <strong>{Math.abs(Math.round(newRect.height))}</strong>
            </span>
          </>
        )}

        {image && (
          <span className="ms-auto opacity-50">
            Ảnh gốc: {image.width} × {image.height}px
          </span>
        )}
      </div>
    </div>
  );
};

export default LabelingWorkspace;
