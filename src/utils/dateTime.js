const ISO_WITHOUT_TIMEZONE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
const SPACE_SEPARATED_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

export const normalizeServerDateTime = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "number") {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  if (ISO_WITHOUT_TIMEZONE_PATTERN.test(trimmedValue)) {
    return `${trimmedValue}Z`;
  }

  if (SPACE_SEPARATED_DATETIME_PATTERN.test(trimmedValue)) {
    return `${trimmedValue.replace(" ", "T")}Z`;
  }

  return trimmedValue;
};

export const parseDateTimeToMillis = (value) => {
  const normalizedValue = normalizeServerDateTime(value);
  const parsedValue = Date.parse(normalizedValue || "");
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

export const formatLocalDateTime = (value, locale = "en-US") => {
  const normalizedValue = normalizeServerDateTime(value);
  if (!normalizedValue) {
    return null;
  }

  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleString(locale);
};
