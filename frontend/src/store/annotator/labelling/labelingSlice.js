import React, { useEffect, useRef, useState } from "react";
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
    if (!containerRef.current || !image) return;

    const w = containerRef.current.offsetWidth;
    const h = 600;

    const scale = Math.min(w / image.width, h / image.height) * 0.9;

    setSize({ width: w, height: h });
    setStageScale(scale);
    setStagePos({
      x: (w - image.width * scale) / 2,
      y: (h - image.height * scale) / 2,
    });
  }, [image]);

  const getPointer = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    return {
      x: (pos.x - stagePos.x) / stageScale,
      y: (pos.y - stagePos.y) / stageScale,
    };
  };

  const handleMouseDown = (e) => {
    if (!selectedLabel) return;
    const { x, y } = getPointer(e);
    setNewRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!newRect) return;
    const { x, y } = getPointer(e);
    setNewRect((r) => ({
      ...r,
      width: x - r.x,
      height: y - r.y,
    }));
  };

  const handleMouseUp = () => {
    if (!newRect) return;

    if (Math.abs(newRect.width) > 5 && Math.abs(newRect.height) > 5) {
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
    <div ref={containerRef} style={{ height: 600 }}>
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
                fill={`${a.color}33`}
                onDblClick={() =>
                  dispatch(removeAnnotation({ assignmentId, id: a.id }))
                }
              />
              <Text
                x={a.x}
                y={a.y - 14 / stageScale}
                text={a.labelName}
                fill="white"
                fontSize={12 / stageScale}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default LabelingWorkspace;
