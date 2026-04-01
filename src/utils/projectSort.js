import { compareNaturalText } from "./naturalSort";

const toNumericId = (item) => {
  const candidate =
    item?.projectId ??
    item?.id ??
    item?.assignmentId ??
    item?.ProjectId ??
    null;
  const numericValue = Number(candidate);

  return Number.isFinite(numericValue) ? numericValue : null;
};

const getProjectName = (item) =>
  item?.projectName ?? item?.name ?? item?.project ?? item?.title ?? "";

export const sortProjectsByNewestId = (items = []) =>
  [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const leftId = toNumericId(left);
    const rightId = toNumericId(right);

    if (rightId !== null || leftId !== null) {
      const normalizedRight = rightId ?? Number.NEGATIVE_INFINITY;
      const normalizedLeft = leftId ?? Number.NEGATIVE_INFINITY;

      if (normalizedRight !== normalizedLeft) {
        return normalizedRight - normalizedLeft;
      }
    }

    return compareNaturalText(getProjectName(left), getProjectName(right));
  });
