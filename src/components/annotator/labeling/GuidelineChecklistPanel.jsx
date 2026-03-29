import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleChecklistItem } from "../../../store/annotator/labelling/labelingSlice";
import { useTranslation } from "react-i18next";

const GuidelineChecklistPanel = ({ labels, assignmentId }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const checklistState = useSelector(
    (state) => state.labeling.checklistByAssignment[assignmentId] || {},
  );

  const unlockedLabelIds = useMemo(() => {
    const ids = new Set();
    labels.forEach((label) => {
      const items = label.checklist || [];
      if (items.length === 0) {
        ids.add(label.id);
        return;
      }
      const checked = checklistState[label.id] || [];
      const allChecked = items.every((_, idx) => checked[idx] === true);
      if (allChecked) {
        ids.add(label.id);
      }
    });
    return ids;
  }, [labels, checklistState]);

  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <div className="card shadow-sm border-0 mb-3">
      <div className="card-header bg-white border-bottom py-3">
        <h6 className="card-title mb-0 text-warning fw-bold">
          <i className="ri-file-list-3-line me-2"></i>{t("guidelineChecklist.title")}
        </h6>
        <small className="text-muted">
          {t("guidelineChecklist.hint")}
        </small>
      </div>
      <div
        className="card-body p-0"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <div className="accordion accordion-flush" id="guidelineAccordion">
          {labels.map((label, labelIdx) => {
            const items = label.checklist || [];
            const checked = checklistState[label.id] || [];
            const checkedCount = items.filter(
              (_, idx) => checked[idx] === true,
            ).length;
            const isUnlocked = unlockedLabelIds.has(label.id);
            const hasChecklist = items.length > 0;

            return (
              <div className="accordion-item" key={label.id}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed py-2 px-3"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#guidelineLabel${label.id}`}
                    style={{ fontSize: "0.875rem" }}
                  >
                    <span
                      className="rounded-circle me-2 flex-shrink-0"
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: label.color,
                        display: "inline-block",
                      }}
                    ></span>
                    <span className="fw-medium flex-grow-1">{label.name}</span>
                    {hasChecklist ? (
                      <span
                        className={`badge ${isUnlocked ? "bg-success" : "bg-warning text-dark"} me-2`}
                      >
                        {isUnlocked ? (
                          <>
                            <i className="ri-lock-unlock-line me-1"></i>
                            {checkedCount}/{items.length}
                          </>
                        ) : (
                          <>
                            <i className="ri-lock-line me-1"></i>
                            {checkedCount}/{items.length}
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="badge bg-success-subtle text-success me-2">
                        <i className="ri-check-line me-1"></i>{t("guidelineChecklist.free")}
                      </span>
                    )}
                  </button>
                </h2>
                <div
                  id={`guidelineLabel${label.id}`}
                  className={`accordion-collapse collapse ${labelIdx === 0 ? "show" : ""}`}
                  data-bs-parent="#guidelineAccordion"
                >
                  <div className="accordion-body p-3">
                    {label.guideLine && (
                      <div className="alert alert-info py-2 px-3 mb-2">
                        <small>
                          <i className="ri-lightbulb-line me-1"></i>
                          {label.guideLine}
                        </small>
                      </div>
                    )}

                    {hasChecklist ? (
                      <div className="vstack gap-2">
                        {items.map((item, itemIdx) => {
                          const isChecked = checked[itemIdx] === true;
                          return (
                            <div
                              key={itemIdx}
                              className={`form-check p-2 rounded ${isChecked ? "bg-success-subtle" : "bg-light"}`}
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                dispatch(
                                  toggleChecklistItem({
                                    assignmentId,
                                    labelId: label.id,
                                    itemIndex: itemIdx,
                                  }),
                                )
                              }
                            >
                              <input
                                className="form-check-input ms-0 me-2"
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                style={{ cursor: "pointer" }}
                              />
                              <label
                                className={`form-check-label ${isChecked ? "text-decoration-line-through text-muted" : ""}`}
                                style={{ cursor: "pointer" }}
                              >
                                {item}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">
                        <i className="ri-information-line me-1"></i>
                        {t("guidelineChecklist.noCriteria")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GuidelineChecklistPanel;
