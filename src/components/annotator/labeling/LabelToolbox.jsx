import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedLabel,
  toggleChecklistItem,
} from "../../../store/annotator/labelling/labelingSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const LabelToolbox = ({ labels, assignmentId, annotations = [] }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { selectedLabel } = useSelector((state) => state.labeling);
  const checklistState = useSelector(
    (state) => state.labeling.checklistByAssignment[assignmentId] || {},
  );

  const [expandedLabelId, setExpandedLabelId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

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
      toast.warning(t("labeling.checklistWarning", { name: label.name }));
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
      <div className="stitch-ws-card">
        <div
          className="stitch-ws-card-body text-center stitch-ws-text-muted"
          style={{ padding: 20 }}
        >
          {t("labeling.loadingLabels")}
        </div>
      </div>
    );
  }

  const showSearch = labels.length > 5;
  const unlockedCount = unlockedLabelIds.size;

  return (
    <div className="stitch-ws-card">
      {/* Header */}
      <div className="stitch-ws-card-header">
        <span>
          <i className="ri-tools-line me-1"></i>
          {t("labeling.labelChecklist")}
        </span>
        <span className="stitch-ws-badge stitch-ws-badge-inprogress">
          {unlockedCount}/{labels.length} {t("labeling.unlocked")}
        </span>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div style={{ padding: "8px 14px 0 14px", position: "relative" }}>
          <i
            className="ri-search-line"
            style={{
              position: "absolute",
              left: 22,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              opacity: 0.5,
            }}
          ></i>
          <input
            type="text"
            className="stitch-ws-search-input"
            placeholder={t("labeling.searchLabel", { count: labels.length })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              style={{
                position: "absolute",
                right: 22,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                opacity: 0.5,
                padding: 0,
                lineHeight: 1,
              }}
              onClick={() => setSearchTerm("")}
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
      )}

      {/* Label list — auto height, sidebar handles scroll */}
      <div className="stitch-ws-card-body p-0">
        {filteredLabels.length === 0 && (
          <div
            className="text-center stitch-ws-text-muted"
            style={{ padding: "16px 14px", fontSize: "0.78rem" }}
          >
            <i
              className="ri-search-line d-block"
              style={{ fontSize: 20, marginBottom: 4, opacity: 0.5 }}
            ></i>
            {t("labeling.noLabelFound", { term: searchTerm })}
          </div>
        )}

        {filteredLabels.map((label) => {
          const items = label.checklist || [];
          const checked = checklistState[label.id] || [];
          const checkedCount = items.filter(
            (_, idx) => checked[idx] === true,
          ).length;
          const hasChecklist = items.length > 0;
          const hasSampleImage = !!label.exampleImageUrl;
          const hasExpandableContent =
            hasChecklist || hasSampleImage || !!label.guideLine;
          const isUnlocked = unlockedLabelIds.has(label.id);
          const isSelected = selectedLabel?.id === label.id;
          const isExpanded = expandedLabelId === label.id;

          return (
            <div key={label.id}>
              {/* Label row */}
              <div
                className={`stitch-ws-label-item ${isSelected ? "selected" : ""} ${!isUnlocked ? "locked" : ""}`}
                style={{
                  borderLeftColor: isSelected ? label.color : "transparent",
                }}
              >
                {/* LEFT ZONE — click to select label */}
                <div
                  className="d-flex align-items-center flex-grow-1 px-2 py-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleLabelClick(label)}
                  title={t("labeling.clickToSelect", {
                    action: isSelected
                      ? t("labeling.deselectAction")
                      : t("labeling.selectAction"),
                    name: label.name,
                  })}
                >
                  <span
                    className="rounded-circle me-2 flex-shrink-0"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: label.color,
                      border: isSelected
                        ? "2px solid #3B82F6"
                        : "1px solid rgba(255,255,255,0.15)",
                    }}
                  ></span>

                  <span
                    className="flex-grow-1 fw-medium text-truncate"
                    style={{
                      fontSize: 12,
                      opacity: !isUnlocked ? 0.5 : 1,
                    }}
                    title={label.name}
                  >
                    {label.name}
                  </span>

                  {/* Sample image indicator */}
                  {hasSampleImage && (
                    <i
                      className="ri-image-line me-1"
                      style={{
                        fontSize: 13,
                        color: "#22D3EE",
                        opacity: 0.8,
                        cursor: "pointer",
                      }}
                      title={t("labeling.hasSampleImage")}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage({
                          url: label.exampleImageUrl,
                          name: label.name,
                        });
                      }}
                    ></i>
                  )}

                  {/* Annotation count badge */}
                  {annotationCountByLabel[label.id] > 0 && (
                    <span
                      className="stitch-ws-badge stitch-ws-badge-count me-1"
                      title={`${annotationCountByLabel[label.id]} ${t("labeling.boxDrawn")}`}
                    >
                      {annotationCountByLabel[label.id]}
                    </span>
                  )}

                  {hasChecklist && (
                    <span
                      className={`stitch-ws-badge me-1 ${isUnlocked ? "stitch-ws-badge-success" : "stitch-ws-badge-warning"}`}
                    >
                      <i
                        className={`ri-${isUnlocked ? "lock-unlock" : "lock"}-line`}
                      ></i>
                      {checkedCount}/{items.length}
                    </span>
                  )}

                  {isSelected && (
                    <i
                      className="ri-checkbox-circle-fill me-1"
                      style={{ fontSize: 14, color: "#3B82F6" }}
                    ></i>
                  )}
                </div>

                {/* RIGHT ZONE — toggle button for expandable content */}
                {hasExpandableContent && (
                  <button
                    className={`stitch-ws-chevron-btn ${isExpanded ? "expanded" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLabelId((prev) =>
                        prev === label.id ? null : label.id,
                      );
                    }}
                    title={
                      isExpanded
                        ? t("labeling.collapseChecklist")
                        : t("labeling.expandChecklist")
                    }
                  >
                    <i
                      className={`ri-arrow-${isExpanded ? "up" : "down"}-s-line`}
                    ></i>
                  </button>
                )}
              </div>

              {/* Inline expanded panel */}
              {isExpanded && hasExpandableContent && (
                <div
                  className="stitch-ws-checklist-panel stitch-ws-expand-enter"
                  style={{ borderLeft: `4px solid ${label.color}` }}
                >
                  {label.guideLine && (
                    <div className="stitch-ws-guideline">
                      <i className="ri-lightbulb-line me-1"></i>
                      {label.guideLine}
                    </div>
                  )}

                  {/* Sample image display */}
                  {hasSampleImage && (
                    <div
                      style={{
                        padding: "6px 0",
                        marginBottom: hasChecklist ? 6 : 0,
                      }}
                    >
                      <div
                        style={{
                          cursor: "pointer",
                          borderRadius: 6,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.12)",
                          position: "relative",
                        }}
                        onClick={() =>
                          setPreviewImage({
                            url: label.exampleImageUrl,
                            name: label.name,
                          })
                        }
                        title={t("labeling.clickToEnlarge")}
                      >
                        <img
                          src={label.exampleImageUrl}
                          alt={`${label.name} sample`}
                          style={{
                            width: "100%",
                            maxHeight: 80,
                            objectFit: "contain",
                            display: "block",
                            borderRadius: 5,
                            background: "rgba(0,0,0,0.03)",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "4px 6px",
                            background:
                              "linear-gradient(transparent, rgba(0,0,0,0.55))",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            justifyContent: "center",
                          }}
                        >
                          <i
                            className="ri-zoom-in-line"
                            style={{ fontSize: 11, color: "#fff" }}
                          ></i>
                          <span style={{ fontSize: 10, color: "#e2e8f0" }}>
                            {t("labeling.clickToEnlarge")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasChecklist && (
                    <div className="d-flex flex-column gap-1">
                      {items.map((item, itemIdx) => {
                        const isChecked = checked[itemIdx] === true;
                        return (
                          <div
                            key={itemIdx}
                            className={`stitch-ws-checklist-item ${isChecked ? "checked" : ""}`}
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
                              className="form-check-input ms-0 flex-shrink-0"
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              style={{ cursor: "pointer" }}
                            />
                            <label
                              style={{
                                cursor: "pointer",
                                fontSize: 12,
                                textDecoration: isChecked
                                  ? "line-through"
                                  : "none",
                                opacity: isChecked ? 0.6 : 1,
                              }}
                            >
                              {item}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="ri-image-line"></i>
            {t("labeling.sampleImageFor", { name: previewImage.name })}
          </div>
          <img
            src={previewImage.url}
            alt={`${previewImage.name} sample`}
            style={{
              maxWidth: "85vw",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              marginTop: 12,
            }}
          >
            {t("labeling.clickOutsideToClose")}
          </div>
          <button
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: 18,
            }}
            onClick={() => setPreviewImage(null)}
            title={t("labeling.close")}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default LabelToolbox;
