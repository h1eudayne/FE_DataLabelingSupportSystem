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
} from "../../../store/annotator/labelling/labelingSlice";

const LabelingWorkspace = ({ imageUrl }) => {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const { annotations, selectedLabel } = useSelector((state) => state.labeling);

  const [image, status] = useImage(imageUrl, "anonymous");
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [newRect, setNewRect] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 600 });

  // Căn giữa ảnh và tính toán Scale khi ảnh load xong
  useEffect(() => {
    if (containerRef.current && image) {
      const stageWidth = containerRef.current.offsetWidth;
      const stageHeight = 600;
      setSize({ width: stageWidth, height: stageHeight });

      const scale =
        Math.min(stageWidth / image.width, stageHeight / image.height) * 0.85;
      setStageScale(scale);

      // Công thức căn giữa Stage để không bị lệch phải
      setStagePos({
        x: (stageWidth - image.width * scale) / 2,
        y: (stageHeight - image.height * scale) / 2,
      });
    }
  }, [image]);

  const handleMouseDown = (e) => {
    if (!selectedLabel) return;
    const stage = e.currentTarget.getStage();
    const pointer = stage.getPointerPosition();
    const x = (pointer.x - stage.x()) / stageScale;
    const y = (pointer.y - stage.y()) / stageScale;
    setNewRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!newRect) return;
    const stage = e.currentTarget.getStage();
    const pointer = stage.getPointerPosition();
    setNewRect((prev) => ({
      ...prev,
      width: (pointer.x - stage.x()) / stageScale - prev.x,
      height: (pointer.y - stage.y()) / stageScale - prev.y,
    }));
  };

  const handleMouseUp = () => {
    if (newRect && Math.abs(newRect.width) > 5) {
      dispatch(
        addAnnotation({
          id: Date.now().toString(),
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
    <div
      ref={containerRef}
      className="bg-dark rounded overflow-hidden position-relative w-100"
      style={{ height: "600px" }}
    >
      <Stage
        width={size.width}
        height={size.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={!selectedLabel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={(e) => {
          e.evt.preventDefault();
          const scaleBy = 1.1;
          const oldScale = stageScale;
          const pointer = e.target.getStage().getPointerPosition();
          const newScale =
            e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
          setStageScale(newScale);
          setStagePos({
            x: pointer.x - ((pointer.x - stagePos.x) / oldScale) * newScale,
            y: pointer.y - ((pointer.y - stagePos.y) / oldScale) * newScale,
          });
        }}
      >
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={image.width}
              height={image.height}
              listening={true}
            />
          )}
          {annotations.map((ann) => (
            <Group key={ann.id}>
              <Rect
                x={ann.x}
                y={ann.y}
                width={ann.width}
                height={ann.height}
                stroke={ann.color}
                strokeWidth={2 / stageScale}
                fill={ann.color + "33"}
                onDblClick={(e) => {
                  e.cancelBubble = true;
                  dispatch(removeAnnotation(ann.id));
                }}
              />
              <Group x={ann.x} y={ann.y - 18 / stageScale} listening={false}>
                <Rect
                  fill={ann.color}
                  height={18 / stageScale}
                  width={
                    ann.labelName.length * (8 / stageScale) + 12 / stageScale
                  }
                />
                <Text
                  text={ann.labelName}
                  fill="white"
                  fontSize={12 / stageScale}
                  fontStyle="bold"
                  padding={4 / stageScale}
                />
              </Group>
            </Group>
          ))}
          {newRect && (
            <Rect
              {...newRect}
              stroke={selectedLabel?.color}
              strokeWidth={1 / stageScale}
              dash={[4, 4]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
export default LabelingWorkspace;
