import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAnnotation } from "../store/annotator/labelling/labelingSlice";

export const useLabeling = () => {
  const dispatch = useDispatch();
  const { selectedLabel } = useSelector((state) => state.labeling);
  const [newRect, setNewRect] = useState(null);

  const startDrawing = (pos) => {
    if (!selectedLabel) return;
    setNewRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      id: Date.now().toString(),
    });
  };

  const drawing = (pos) => {
    if (!newRect) return;
    setNewRect({
      ...newRect,
      width: pos.x - newRect.x,
      height: pos.y - newRect.y,
    });
  };

  const endDrawing = () => {
    if (newRect && Math.abs(newRect.width) > 5) {
      dispatch(
        addAnnotation({
          ...newRect,
          labelId: selectedLabel.id,
          labelName: selectedLabel.name,
          color: selectedLabel.color,
        }),
      );
    }
    setNewRect(null);
  };

  return { newRect, startDrawing, drawing, endDrawing };
};
