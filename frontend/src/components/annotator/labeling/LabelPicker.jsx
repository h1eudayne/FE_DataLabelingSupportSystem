import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedLabel } from "../../../store/annotator/labelling/labelingSlice";

const LabelPicker = () => {
  const dispatch = useDispatch();

  const staticLabels = [
    { id: 1, name: "Xe hơi (Car)", color: "#f44336" },
    { id: 2, name: "Người đi bộ", color: "#4caf50" },
    { id: 3, name: "Biển báo giao thông", color: "#2196f3" },
    { id: 4, name: "Vạch kẻ đường", color: "#ffeb3b" },
    { id: 5, name: "Xe máy", color: "#9c27b0" },
  ];

  const { selectedLabel } = useSelector((state) => state.labeling);

  return (
    <div className="card mt-3 shadow-sm">
      <div className="card-header bg-light border-bottom">
        <h6 className="card-title mb-0 text-primary fw-bold">
          <i className="ri-list-check-2 me-2"></i>BỘ NHÃN CHUẨN
        </h6>
      </div>
      <div className="card-body p-2">
        <div className="vstack gap-2">
          {staticLabels.map((label) => {
            const isSelected = selectedLabel?.id === label.id;
            return (
              <button
                key={label.id}
                onClick={() => dispatch(setSelectedLabel(label))}
                className={`btn text-start d-flex justify-content-between align-items-center p-2 transition-all ${
                  isSelected
                    ? "btn-dark shadow"
                    : "btn-outline-secondary border-light-subtle"
                }`}
                style={
                  isSelected ? { borderLeft: `5px solid ${label.color}` } : {}
                }
              >
                <div className="d-flex align-items-center">
                  <span
                    className="rounded-circle me-3"
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: label.color,
                      display: "inline-block",
                      boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                    }}
                  ></span>
                  <span
                    className={`fw-medium ${isSelected ? "text-white" : "text-dark"}`}
                  >
                    {label.name}
                  </span>
                </div>
                {isSelected && (
                  <i className="ri-check-double-line text-white"></i>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="card-footer bg-light-subtle p-2">
        <small className="text-muted italic">
          * Chọn một nhãn phía trên để bắt đầu vẽ.
        </small>
      </div>
    </div>
  );
};

export default LabelPicker;
