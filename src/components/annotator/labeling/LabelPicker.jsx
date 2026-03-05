import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedLabel } from "../../../store/annotator/labelling/labelingSlice";
import { toast } from "react-toastify";

const LabelPicker = ({ labels, unlockedLabelIds }) => {
  const dispatch = useDispatch();

  const { selectedLabel } = useSelector((state) => state.labeling);

  const handleLabelClick = (label) => {
    if (unlockedLabelIds && !unlockedLabelIds.has(label.id)) {
      toast.warning(
        `Vui lòng tick hết checklist của nhãn "${label.name}" trước khi sử dụng.`,
      );
      return;
    }

    if (selectedLabel?.id === label.id) {
      dispatch(setSelectedLabel(null));
    } else {
      dispatch(setSelectedLabel(label));
    }
  };

  if (!labels || labels.length === 0) {
    return (
      <div className="p-3 text-muted text-center border rounded">
        Đang tải bộ nhãn...
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white border-bottom py-3">
        <h6 className="card-title mb-0 text-primary fw-bold">
          <i className="ri-list-check-2 me-2"></i>BỘ NHÃN
        </h6>
      </div>
      <div className="card-body p-2">
        <div className="vstack gap-2">
          {labels.map((label) => {
            const isSelected = selectedLabel?.id === label.id;
            const isLocked =
              unlockedLabelIds && !unlockedLabelIds.has(label.id);

            return (
              <button
                key={label.id}
                onClick={() => handleLabelClick(label)}
                disabled={isLocked}
                className={`btn text-start d-flex justify-content-between align-items-center p-2 transition-all ${
                  isLocked
                    ? "btn-light border text-muted"
                    : isSelected
                      ? "btn-dark shadow"
                      : "btn-outline-secondary border-dashed"
                }`}
                style={
                  isSelected
                    ? {
                        borderLeft: `5px solid ${label.color}`,
                        transform: "translateX(5px)",
                      }
                    : isLocked
                      ? { opacity: 0.6 }
                      : {}
                }
                title={
                  isLocked
                    ? "Vui lòng tick hết checklist để mở khóa nhãn này"
                    : ""
                }
              >
                <div className="d-flex align-items-center">
                  <span
                    className="rounded-circle me-3"
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: label.color,
                      border: isSelected ? "2px solid white" : "none",
                    }}
                  ></span>
                  <span
                    className={`fw-medium ${isSelected ? "text-white" : isLocked ? "text-muted" : "text-dark"}`}
                  >
                    {label.name}
                  </span>
                </div>
                {isLocked ? (
                  <i className="ri-lock-line text-muted"></i>
                ) : isSelected ? (
                  <i className="ri-checkbox-circle-fill text-success"></i>
                ) : (
                  <i className="ri-lock-unlock-line text-success opacity-50"></i>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="card-footer bg-light-subtle p-3">
        <div className="d-flex align-items-center text-muted">
          <i className="ri-information-line me-2"></i>
          <small style={{ fontStyle: "italic" }}>
            {selectedLabel
              ? "Click lại vào nhãn để hủy chọn."
              : "Tick hết checklist → mở khóa → chọn nhãn để vẽ."}
          </small>
        </div>
      </div>
    </div>
  );
};

export default LabelPicker;
