import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedLabel,
  toggleChecklistItem,
} from "../../../store/annotator/labelling/labelingSlice";
import { toast } from "react-toastify";

const LabelToolbox = ({ labels, assignmentId, annotations = [] }) => {
  const dispatch = useDispatch();
  const { selectedLabel } = useSelector((state) => state.labeling);
  const checklistState = useSelector(
    (state) => state.labeling.checklistByAssignment[assignmentId] || {},
  );

  const [expandedLabelId, setExpandedLabelId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const unlockedLabelIds = useMemo(() => {
    const ids = new Set();
    labels.forEach((label) => {
      const items = label.checklist || [];
      if (items.length === 0) {
        ids.add(label.id);
        return;
      }
      const checked = checklistState[label.id] || [];
      if (items.every((_, idx) => checked[idx] === true)) {
        ids.add(label.id);
      }
    });
    return ids;
  }, [labels, checklistState]);

  const filteredLabels = useMemo(() => {
    if (!searchTerm.trim()) return labels;
    const term = searchTerm.toLowerCase();
    return labels.filter((l) => l.name.toLowerCase().includes(term));
  }, [labels, searchTerm]);

  // Count annotations per label for current image
  const annotationCountByLabel = useMemo(() => {
    const counts = {};
    annotations.forEach((a) => {
      if (a.labelId) {
        counts[a.labelId] = (counts[a.labelId] || 0) + 1;
      }
    });
    return counts;
  }, [annotations]);

  const handleLabelClick = (label) => {
    if (!unlockedLabelIds.has(label.id)) {
      toast.warning(
        `Vui lòng tick hết checklist của nhãn "${label.name}" trước khi sử dụng.`,
      );
      setExpandedLabelId(label.id);
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

  const showSearch = labels.length > 5;
  const unlockedCount = unlockedLabelIds.size;

  return (
    <div className="card shadow-sm border-0 mb-3">
      {/* Header */}
      <div className="card-header bg-white border-bottom py-2 px-3">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="card-title mb-0 text-primary fw-bold small">
            <i className="ri-tools-line me-1"></i>BỘ NHÃN & CHECKLIST
          </h6>
          <span
            className="badge bg-primary-subtle text-primary"
            style={{ fontSize: 10 }}
          >
            {unlockedCount}/{labels.length} mở khóa
          </span>
        </div>

        {showSearch && (
          <div className="mt-2 position-relative">
            <i
              className="ri-search-line position-absolute text-muted"
              style={{
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 13,
              }}
            ></i>
            <input
              type="text"
              className="form-control form-control-sm ps-4"
              placeholder={`Tìm nhãn (${labels.length})...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: 12 }}
            />
            {searchTerm && (
              <button
                className="btn btn-sm position-absolute p-0 text-muted"
                style={{
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  lineHeight: 1,
                }}
                onClick={() => setSearchTerm("")}
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Label list — FIXED 280px max, always scrollable */}
      <div
        className="card-body p-0"
        style={{ maxHeight: 280, overflowY: "auto" }}
      >
        {filteredLabels.length === 0 && (
          <div className="text-center text-muted small py-3">
            <i className="ri-search-line d-block fs-5 mb-1 opacity-50"></i>
            Không tìm thấy nhãn "{searchTerm}"
          </div>
        )}

        {filteredLabels.map((label) => {
          const items = label.checklist || [];
          const checked = checklistState[label.id] || [];
          const checkedCount = items.filter(
            (_, idx) => checked[idx] === true,
          ).length;
          const hasChecklist = items.length > 0;
          const isUnlocked = unlockedLabelIds.has(label.id);
          const isSelected = selectedLabel?.id === label.id;
          const isExpanded = expandedLabelId === label.id;

          return (
            <div key={label.id} className="border-bottom">
              {/* Label row: 2 zones — LEFT click = select label, RIGHT click = toggle checklist */}
              <div
                className={`d-flex align-items-stretch ${
                  isSelected
                    ? "bg-primary bg-opacity-10"
                    : !isUnlocked
                      ? "bg-light"
                      : ""
                }`}
                style={{
                  borderLeft: isSelected
                    ? `4px solid ${label.color}`
                    : "4px solid transparent",
                  transition: "all 0.15s",
                  minHeight: 38,
                }}
              >
                {/* LEFT ZONE — click to select label */}
                <div
                  className="d-flex align-items-center flex-grow-1 px-2 py-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleLabelClick(label)}
                  title={`Click để ${isSelected ? "bỏ chọn" : "chọn"} nhãn "${label.name}"`}
                >
                  <span
                    className="rounded-circle me-2 flex-shrink-0"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: label.color,
                      border: isSelected
                        ? "2px solid #0d6efd"
                        : "1px solid rgba(0,0,0,0.15)",
                    }}
                  ></span>

                  <span
                    className={`flex-grow-1 fw-medium text-truncate ${!isUnlocked ? "text-muted" : ""}`}
                    style={{ fontSize: 12 }}
                    title={label.name}
                  >
                    {label.name}
                  </span>

                  {/* Annotation count badge */}
                  {annotationCountByLabel[label.id] > 0 && (
                    <span
                      className="badge bg-dark bg-opacity-10 text-dark me-1"
                      style={{ fontSize: 9, padding: "2px 5px" }}
                      title={`${annotationCountByLabel[label.id]} box đã vẽ`}
                    >
                      {annotationCountByLabel[label.id]}
                    </span>
                  )}

                  {hasChecklist && (
                    <span
                      className={`badge me-1 ${isUnlocked ? "bg-success" : "bg-warning text-dark"}`}
                      style={{ fontSize: 9 }}
                    >
                      <i
                        className={`ri-${isUnlocked ? "lock-unlock" : "lock"}-line me-1`}
                      ></i>
                      {checkedCount}/{items.length}
                    </span>
                  )}

                  {isSelected && (
                    <i
                      className="ri-checkbox-circle-fill text-primary me-1"
                      style={{ fontSize: 14 }}
                    ></i>
                  )}
                </div>

                {/* RIGHT ZONE — big toggle button for checklist (easy to tap) */}
                {hasChecklist && (
                  <button
                    className={`btn btn-sm d-flex align-items-center justify-content-center border-start ${
                      isExpanded
                        ? "bg-primary bg-opacity-10 text-primary"
                        : "text-muted"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLabelId((prev) =>
                        prev === label.id ? null : label.id,
                      );
                    }}
                    title={isExpanded ? "Thu gọn checklist" : "Xem checklist"}
                    style={{
                      width: 36,
                      minWidth: 36,
                      borderRadius: 0,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={`ri-arrow-${isExpanded ? "up" : "down"}-s-line`}
                    ></i>
                  </button>
                )}
              </div>

              {/* Inline checklist panel */}
              {isExpanded && hasChecklist && (
                <div
                  className="px-3 py-2 bg-light bg-opacity-50"
                  style={{
                    borderLeft: `4px solid ${label.color}`,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {label.guideLine && (
                    <div
                      className="alert alert-info py-1 px-2 mb-2"
                      style={{ fontSize: 11 }}
                    >
                      <i className="ri-lightbulb-line me-1"></i>
                      {label.guideLine}
                    </div>
                  )}

                  <div className="vstack gap-1">
                    {items.map((item, itemIdx) => {
                      const isChecked = checked[itemIdx] === true;
                      return (
                        <div
                          key={itemIdx}
                          className={`form-check d-flex align-items-center p-1 px-2 rounded ${isChecked ? "bg-success-subtle" : ""}`}
                          style={{ cursor: "pointer", fontSize: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(
                              toggleChecklistItem({
                                assignmentId,
                                labelId: label.id,
                                itemIndex: itemIdx,
                              }),
                            );
                          }}
                        >
                          <input
                            className="form-check-input ms-0 me-2 flex-shrink-0"
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            style={{ cursor: "pointer" }}
                          />
                          <label
                            className={`form-check-label ${isChecked ? "text-decoration-line-through text-muted" : ""}`}
                            style={{ cursor: "pointer", fontSize: 12 }}
                          >
                            {item}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="card-footer bg-white py-2 px-3">
        <small className="text-muted" style={{ fontSize: 11 }}>
          <i className="ri-information-line me-1"></i>
          {selectedLabel
            ? `Đang vẽ: ${selectedLabel.name} — click lại để hủy`
            : "Tick checklist → mở khóa → chọn nhãn để vẽ"}
        </small>
      </div>
    </div>
  );
};

export default LabelToolbox;
