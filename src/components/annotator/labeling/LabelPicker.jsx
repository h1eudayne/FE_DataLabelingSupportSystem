import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedLabel } from "../../../store/annotator/labelling/labelingSlice";

const LabelPicker = ({ labels }) => {
  const dispatch = useDispatch();

  const { selectedLabel } = useSelector((state) => state.labeling);

  // Hàm xử lý Toggle chọn/bỏ chọn
  const handleLabelClick = (label) => {
    if (selectedLabel?.id === label.id) {
      // Nếu đang chọn nhãn này rồi thì dispatch null để bỏ chọn
      dispatch(setSelectedLabel(null));
    } else {
      // Nếu chưa chọn hoặc đang chọn nhãn khác thì chọn nhãn mới
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
    <div className="card mt-3 shadow-sm border-0">
      <div className="card-header bg-white border-bottom py-3">
        <h6 className="card-title mb-0 text-primary fw-bold">
          <i className="ri-list-check-2 me-2"></i>BỘ NHÃN CHUẨN
        </h6>
      </div>
      <div className="card-body p-2">
        <div className="vstack gap-2">
          {labels.map((label) => {
            const isSelected = selectedLabel?.id === label.id;
            return (
              <button
                key={label.id}
                onClick={() => handleLabelClick(label)} // Sử dụng hàm handle mới
                className={`btn text-start d-flex justify-content-between align-items-center p-2 transition-all ${
                  isSelected
                    ? "btn-dark shadow"
                    : "btn-outline-secondary border-dashed"
                }`}
                style={
                  isSelected
                    ? {
                        borderLeft: `5px solid ${label.color}`,
                        transform: "translateX(5px)",
                      }
                    : {}
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
                    className={`fw-medium ${isSelected ? "text-white" : "text-dark"}`}
                  >
                    {label.name}
                  </span>
                </div>
                {isSelected && (
                  <i className="ri-checkbox-circle-fill text-success"></i>
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
              : "Chọn một nhãn để bắt đầu vẽ vùng chọn."}
          </small>
        </div>
      </div>
    </div>
  );
};

export default LabelPicker;
