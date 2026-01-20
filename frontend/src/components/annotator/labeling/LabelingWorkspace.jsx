import React, { useState } from "react";
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
import { addAnnotation } from "../../../store/annotator/labelling/labelingSlice";

const LabelingWorkspace = ({ imageUrl }) => {
  const [image, status] = useImage(imageUrl, "anonymous");
  const dispatch = useDispatch();

  const { annotations, selectedLabel } = useSelector(
    (state) => state.labeling || { annotations: [] },
  );
  const [newRect, setNewRect] = useState(null);

  if (status === "loading") return <div className="text-white">Loading...</div>;

  const handleMouseDown = (e) => {
    if (!selectedLabel) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      id: Date.now().toString(),
    });
  };

  const handleMouseMove = (e) => {
    if (!newRect) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewRect({
      ...newRect,
      width: pos.x - newRect.x,
      height: pos.y - newRect.y,
    });
  };

  const handleMouseUp = () => {
    if (newRect && Math.abs(newRect.width) > 5) {
      dispatch(
        addAnnotation({
          ...newRect,
          labelId: selectedLabel.id,
          color: selectedLabel.color,
          isAi: false,
        }),
      );
    }
    setNewRect(null);
  };

  return (
    <div className="bg-dark rounded overflow-hidden d-flex justify-content-center shadow-lg border border-secondary">
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {image && <KonvaImage image={image} width={800} height={600} />}

          {annotations &&
            annotations.map((ann) => (
              <Group key={ann.id}>
                <Rect
                  x={ann.x}
                  y={ann.y}
                  width={ann.width}
                  height={ann.height}
                  stroke={ann.color}
                  strokeWidth={2}
                  dash={ann.isAi ? [5, 5] : []}
                />
              </Group>
            ))}

          {newRect && (
            <Rect {...newRect} stroke="yellow" strokeWidth={2} dash={[4, 4]} />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default LabelingWorkspace;
