export const FLAG_ENABLED_MARKER = "__flag_enabled";
export const RELABEL_EDITABLE_MARKER = "__relabelEditable";

const EMPTY_OBJECT = Object.freeze({});
const EMPTY_ARRAY = Object.freeze([]);

const isPlainObject = (value) =>
  value != null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeRestrictedLabelIds = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isFinite(item));
};

const annotationHasLabel = (annotation, labelId) => {
  const parsedLabelId = Number.parseInt(
    annotation?.labelId ?? annotation?.classId ?? annotation?.LabelId ?? annotation?.ClassId,
    10,
  );

  return Number.isFinite(parsedLabelId) && parsedLabelId === labelId;
};

const flagMatchesLabel = (flag, labelId) => {
  const parsedFlagId = Number.parseInt(flag, 10);
  return Number.isFinite(parsedFlagId) && parsedFlagId === labelId;
};

const dedupeByJson = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const stripDraftOnlyAnnotationFields = (annotation) => {
  if (!isPlainObject(annotation)) {
    return annotation;
  }

  const {
    [RELABEL_EDITABLE_MARKER]: _relabelEditable,
    isRelabelEditable: _legacyRelabelEditable,
    ...rest
  } = annotation;

  return rest;
};

export const getActionableDefaultFlags = (flags = EMPTY_ARRAY) =>
  (Array.isArray(flags) ? flags : []).filter((flag) => flag !== FLAG_ENABLED_MARKER);

export const isFlagPanelEnabled = (flags = EMPTY_ARRAY) =>
  Array.isArray(flags) && flags.includes(FLAG_ENABLED_MARKER);

export const parseAnnotationPayload = (annotationData) => {
  if (!annotationData) {
    return {
      annotations: [],
      checklist: {},
      defaultFlags: [],
      lockedAnnotations: [],
      lockedDefaultFlags: [],
      restrictedLabelIds: [],
      relabelReason: "",
    };
  }

  let parsed = annotationData;

  if (typeof annotationData === "string") {
    try {
      parsed = JSON.parse(annotationData);
    } catch {
      return {
        annotations: [],
        checklist: {},
        defaultFlags: [],
        lockedAnnotations: [],
        lockedDefaultFlags: [],
        restrictedLabelIds: [],
        relabelReason: "",
      };
    }
  }

  if (Array.isArray(parsed)) {
    return {
      annotations: parsed,
      checklist: {},
      defaultFlags: [],
      lockedAnnotations: [],
      lockedDefaultFlags: [],
      restrictedLabelIds: [],
      relabelReason: "",
    };
  }

  if (!isPlainObject(parsed)) {
    return {
      annotations: [],
      checklist: {},
      defaultFlags: [],
      lockedAnnotations: [],
      lockedDefaultFlags: [],
      restrictedLabelIds: [],
      relabelReason: "",
    };
  }

  return {
    annotations: Array.isArray(parsed.annotations) ? parsed.annotations : [],
    checklist: isPlainObject(parsed.__checklist) ? parsed.__checklist : {},
    defaultFlags: Array.isArray(parsed.__defaultFlags) ? parsed.__defaultFlags : [],
    lockedAnnotations: Array.isArray(parsed.__lockedAnnotations)
      ? parsed.__lockedAnnotations
      : [],
    lockedDefaultFlags: Array.isArray(parsed.__lockedDefaultFlags)
      ? parsed.__lockedDefaultFlags
      : [],
    restrictedLabelIds: normalizeRestrictedLabelIds(parsed.__relabelLabelIds),
    relabelReason:
      typeof parsed.__relabelReason === "string" ? parsed.__relabelReason : "",
  };
};

export const buildAnnotationPayload = ({
  annotations = EMPTY_ARRAY,
  checklist = EMPTY_OBJECT,
  defaultFlags = EMPTY_ARRAY,
  lockedAnnotations = EMPTY_ARRAY,
  lockedDefaultFlags = EMPTY_ARRAY,
  restrictedLabelIds = EMPTY_ARRAY,
  relabelReason = "",
}) =>
  JSON.stringify({
    annotations: Array.isArray(annotations) ? annotations : [],
    __checklist: isPlainObject(checklist) ? checklist : {},
    __defaultFlags: Array.isArray(defaultFlags) ? defaultFlags : [],
    ...(Array.isArray(lockedAnnotations) && lockedAnnotations.length > 0
      ? { __lockedAnnotations: lockedAnnotations }
      : {}),
    ...(Array.isArray(lockedDefaultFlags) && lockedDefaultFlags.length > 0
      ? { __lockedDefaultFlags: lockedDefaultFlags }
      : {}),
    ...(Array.isArray(restrictedLabelIds) && restrictedLabelIds.length > 0
      ? { __relabelLabelIds: restrictedLabelIds }
      : {}),
    ...(relabelReason ? { __relabelReason: relabelReason } : {}),
  });

export const buildSubmissionAnnotationPayload = (annotationData) => {
  const payload = parseAnnotationPayload(annotationData);
  const hasRestrictedRelabel =
    Array.isArray(payload.restrictedLabelIds) && payload.restrictedLabelIds.length > 0;

  if (!hasRestrictedRelabel) {
    return buildAnnotationPayload({
      annotations: payload.annotations,
      checklist: payload.checklist,
      defaultFlags: getActionableDefaultFlags(payload.defaultFlags),
    });
  }

  const lockedReferenceAnnotations = Array.isArray(payload.lockedAnnotations)
    ? payload.lockedAnnotations
    : [];
  const preservedAnnotations = lockedReferenceAnnotations.filter(
    (annotation) =>
      !payload.restrictedLabelIds.some((labelId) => annotationHasLabel(annotation, labelId)),
  );
  const finalAnnotations = dedupeByJson([
    ...preservedAnnotations,
    ...(Array.isArray(payload.annotations) ? payload.annotations : []),
  ]).map(stripDraftOnlyAnnotationFields);

  const lockedReferenceFlags = Array.isArray(payload.lockedDefaultFlags)
    ? payload.lockedDefaultFlags
    : [];
  const preservedFlags = lockedReferenceFlags.filter(
    (flag) =>
      flag !== FLAG_ENABLED_MARKER &&
      !payload.restrictedLabelIds.some((labelId) => flagMatchesLabel(flag, labelId)),
  );
  const finalFlags = dedupeByJson([
    ...preservedFlags,
    ...getActionableDefaultFlags(payload.defaultFlags),
  ]);

  return buildAnnotationPayload({
    annotations: finalAnnotations,
    checklist: payload.checklist,
    defaultFlags: finalFlags,
  });
};
