import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tick } from "../../../store/annotator/labelling/taskSlice";

export const useTimer = () => {
  const dispatch = useDispatch();
  const { seconds, isActive } = useSelector((state) => state.task.timer);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, dispatch]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return { timeString: formatTime(seconds), isActive };
};
