const EMPTY_EVIDENCE = Object.freeze({
  annotations: [],
  checklist: {},
  defaultFlags: [],
});

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const parseStoredAnnotationData = (annotationData) => {
  if (!annotationData) {
    return EMPTY_EVIDENCE;
  }

  let parsed = annotationData;

  if (typeof annotationData === "string") {
    try {
      parsed = JSON.parse(annotationData);
    } catch {
      return EMPTY_EVIDENCE;
    }
  }

  if (Array.isArray(parsed)) {
    return {
      annotations: parsed,
      checklist: {},
      defaultFlags: [],
    };
  }

  if (!isPlainObject(parsed)) {
    return EMPTY_EVIDENCE;
  }

  return {
    annotations: Array.isArray(parsed.annotations) ? parsed.annotations : [],
    checklist: isPlainObject(parsed.__checklist) ? parsed.__checklist : {},
    defaultFlags: Array.isArray(parsed.__defaultFlags)
      ? parsed.__defaultFlags
      : [],
  };
};

const getLabelLookup = (labels = []) => {
  const byId = new Map();
  const byName = new Map();

  labels.forEach((label) => {
    if (label?.id !== undefined && label?.id !== null) {
      byId.set(String(label.id), label);
    }

    if (typeof label?.name === "string" && label.name.trim()) {
      byName.set(label.name.trim().toLowerCase(), label);
    }
  });

  return { byId, byName };
};

const getLabelMeta = (annotation, lookups) => {
  const labelId =
    annotation?.labelId !== undefined && annotation?.labelId !== null
      ? String(annotation.labelId)
      : null;
  const labelName =
    typeof annotation?.labelName === "string" && annotation.labelName.trim()
      ? annotation.labelName.trim()
      : null;

  const byId = labelId ? lookups.byId.get(labelId) : null;
  const byName = labelName ? lookups.byName.get(labelName.toLowerCase()) : null;
  const label = byId || byName || null;

  return {
    labelId: label?.id ?? annotation?.labelId ?? null,
    labelName: label?.name || labelName || `Label ${annotation?.labelId ?? "?"}`,
    color: label?.color || annotation?.color || "#14b8a6",
    checklist: Array.isArray(label?.checklist) ? label.checklist : [],
    guideLine:
      typeof label?.guideLine === "string" && label.guideLine.trim()
        ? label.guideLine
        : "",
  };
};

const normalizePoint = (point) => {
  const x = Number(point?.x);
  const y = Number(point?.y);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x,
    y,
  };
};

const normalizePolygonAnnotation = (annotation, meta, index) => {
  const points = Array.isArray(annotation?.points)
    ? annotation.points.map(normalizePoint).filter(Boolean)
    : [];

  if (points.length < 3) {
    return null;
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    id: annotation?.id || `annotation-${index + 1}`,
    type: "POLYGON",
    labelId: meta.labelId,
    labelName: meta.labelName,
    color: meta.color,
    points,
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const normalizeBboxAnnotation = (annotation, meta, index) => {
  const x = Number(annotation?.x);
  const y = Number(annotation?.y);
  const width = Number(annotation?.width);
  const height = Number(annotation?.height);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return {
    id: annotation?.id || `annotation-${index + 1}`,
    type: "BBOX",
    labelId: meta.labelId,
    labelName: meta.labelName,
    color: meta.color,
    x,
    y,
    width,
    height,
    points: [],
  };
};

export const normalizeEvidenceAnnotations = (annotations = [], labels = []) => {
  const lookups = getLabelLookup(labels);

  return annotations
    .map((annotation, index) => {
      const meta = getLabelMeta(annotation, lookups);

      if (
        String(annotation?.type || "").toUpperCase() === "POLYGON" ||
        Array.isArray(annotation?.points)
      ) {
        return normalizePolygonAnnotation(annotation, meta, index);
      }

      return normalizeBboxAnnotation(annotation, meta, index);
    })
    .filter(Boolean);
};

export const parseErrorCategories = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const summarizeReviewerFeedbacks = (feedbacks = []) => {
  const summary = {
    approvedCount: 0,
    rejectedCount: 0,
    neutralCount: 0,
    total: 0,
    majorityVerdict: null,
    isConflict: false,
  };

  feedbacks.forEach((feedback) => {
    const verdict = String(feedback?.verdict || "").toLowerCase();

    if (verdict === "approved" || verdict === "approve") {
      summary.approvedCount += 1;
    } else if (verdict === "rejected" || verdict === "reject") {
      summary.rejectedCount += 1;
    } else {
      summary.neutralCount += 1;
    }
  });

  summary.total =
    summary.approvedCount + summary.rejectedCount + summary.neutralCount;
  summary.isConflict =
    summary.approvedCount > 0 &&
    summary.approvedCount === summary.rejectedCount;

  if (summary.approvedCount > summary.rejectedCount) {
    summary.majorityVerdict = "approved";
  } else if (summary.rejectedCount > summary.approvedCount) {
    summary.majorityVerdict = "rejected";
  }

  return summary;
};

export const summarizeEvidence = ({
  annotations = [],
  checklist = {},
  defaultFlags = [],
  labels = [],
  reviewerFeedbacks = [],
} = {}) => {
  const normalizedAnnotations = normalizeEvidenceAnnotations(annotations, labels);
  const feedbackSummary = summarizeReviewerFeedbacks(reviewerFeedbacks);

  const labelMap = new Map();
  const labelCatalog = getLabelLookup(labels);
  const checklistEntries = isPlainObject(checklist) ? checklist : {};

  normalizedAnnotations.forEach((annotation) => {
    const key = String(annotation.labelId ?? annotation.labelName);
    if (!labelMap.has(key)) {
      const label =
        (annotation.labelId !== null && annotation.labelId !== undefined
          ? labelCatalog.byId.get(String(annotation.labelId))
          : null) ||
        labelCatalog.byName.get(annotation.labelName.toLowerCase()) ||
        null;

      labelMap.set(key, {
        id: annotation.labelId,
        name: annotation.labelName,
        color: annotation.color,
        guideLine: label?.guideLine || "",
        checklist: Array.isArray(label?.checklist) ? label.checklist : [],
        annotationCount: 0,
        checkedItems: [],
      });
    }

    labelMap.get(key).annotationCount += 1;
  });

  Object.entries(checklistEntries).forEach(([labelId, checks]) => {
    const catalogLabel =
      labelCatalog.byId.get(String(labelId)) ||
      labels.find((label) => String(label?.id) === String(labelId)) ||
      null;
    const key = String(labelId);

    if (!labelMap.has(key)) {
      labelMap.set(key, {
        id: catalogLabel?.id ?? labelId,
        name: catalogLabel?.name || `Label ${labelId}`,
        color: catalogLabel?.color || "#0ea5e9",
        guideLine: catalogLabel?.guideLine || "",
        checklist: Array.isArray(catalogLabel?.checklist)
          ? catalogLabel.checklist
          : [],
        annotationCount: 0,
        checkedItems: [],
      });
    }

    const checklistItems = Array.isArray(checks)
      ? checks
          .map((checked, index) =>
            checked
              ? labelMap.get(key).checklist[index] || `Checklist ${index + 1}`
              : null,
          )
          .filter(Boolean)
      : [];

    labelMap.get(key).checkedItems = checklistItems;
  });

  const flags = Array.isArray(defaultFlags)
    ? defaultFlags
        .map((flagId) => {
          const label =
            labelCatalog.byId.get(String(flagId)) ||
            labels.find((item) => String(item?.id) === String(flagId)) ||
            null;

          return {
            id: label?.id ?? flagId,
            name: label?.name || `Label ${flagId}`,
            color: label?.color || "#f97316",
          };
        })
        .filter(Boolean)
    : [];

  const labelSummaries = Array.from(labelMap.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return {
    annotations: normalizedAnnotations,
    labelSummaries,
    flaggedLabels: flags,
    feedbackSummary,
    annotationCount: normalizedAnnotations.length,
    bboxCount: normalizedAnnotations.filter((item) => item.type === "BBOX")
      .length,
    polygonCount: normalizedAnnotations.filter(
      (item) => item.type === "POLYGON",
    ).length,
  };
};
