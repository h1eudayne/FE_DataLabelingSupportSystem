import React, { useState, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Group,
  Text,
} from "react-konva";
import useImage from "use-image";
import { useDispatch, useSelector } from "react-redux";
import {
  addAnnotation,
  removeAnnotation,
  removeLastAnnotation,
} from "../../../store/annotator/labelling/labelingSlice";

const LabelingWorkspace = ({ imageUrl, assignmentId }) => {
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

  useEffect(() => {
    if (containerRef.current && image) {
      const w = containerRef.current.offsetWidth;
      const h = 600;
      setSize({ width: w, height: h });

      const scale = Math.min(w / image.width, h / image.height) * 0.85;
      setStageScale(scale);
      setStagePos({
        x: (w - image.width * scale) / 2,
        y: (h - image.height * scale) / 2,
      });
    }
  }, [image]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        dispatch(removeLastAnnotation(assignmentId));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, assignmentId]);

  const handleMouseDown = (e) => {
    if (!selectedLabel) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = (pos.x - stagePos.x) / stageScale;
    const y = (pos.y - stagePos.y) / stageScale;
    setNewRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!newRect) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setNewRect((r) => ({
      ...r,
      width: (pos.x - stagePos.x) / stageScale - r.x,
      height: (pos.y - stagePos.y) / stageScale - r.y,
    }));
  };

  const handleMouseUp = () => {
    if (newRect && Math.abs(newRect.width) > 5) {
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

  return (
    <div ref={containerRef} style={{ height: 600 }} className="bg-dark rounded">
      <Stage
        width={size.width}
        height={size.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {image && <KonvaImage image={image} />}
          {annotations.map((a) => (
            <Group key={a.id}>
              <Rect
                {...a}
                stroke={a.color}
                strokeWidth={2 / stageScale}
                fill={a.color + "33"}
                onDblClick={() =>
                  dispatch(removeAnnotation({ assignmentId, id: a.id }))
                }
              />
              <Text
                x={a.x}
                y={a.y - 16 / stageScale}
                text={a.labelName}
                fill="white"
                fontSize={12 / stageScale}
              />
            </Group>
          ))}

          {newRect && (
            <Rect
              {...newRect}
              stroke="yellow"
              dash={[6, 4]}
              strokeWidth={2 / stageScale}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default LabelingWorkspace;
