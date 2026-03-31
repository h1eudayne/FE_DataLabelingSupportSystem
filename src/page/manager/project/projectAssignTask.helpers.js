const summarizeNames = (items, fallbackLabel) => {
  const names = items
    .map((item) => item?.name)
    .filter((name) => typeof name === "string" && name.trim() !== "");

  if (names.length === 0) {
    return fallbackLabel;
  }

  if (names.length <= 3) {
    return names.join(", ");
  }

  return `${names.slice(0, 3).join(", ")} +${names.length - 3}`;
};

export const buildAssignmentRequest = ({
  projectId,
  targetAnnotators,
  targetReviewers,
  qtyPerAnnotator,
}) => {
  const annotatorIds = targetAnnotators
    .map((annotator) => annotator?.id)
    .filter((annotatorId) => annotatorId !== undefined && annotatorId !== null && String(annotatorId).trim() !== "")
    .map((annotatorId) => String(annotatorId));

  const reviewerIds = targetReviewers
    .map((reviewer) => reviewer?.id)
    .filter((reviewerId) => reviewerId !== undefined && reviewerId !== null && String(reviewerId).trim() !== "")
    .map((reviewerId) => String(reviewerId));

  const reviewerCount = reviewerIds.length;
  const annotatorCount = annotatorIds.length;
  const totalRecords = Number(qtyPerAnnotator) * annotatorCount * Math.max(reviewerCount, 1);

  return {
    annotatorSummary: summarizeNames(targetAnnotators, `${annotatorCount} annotators`),
    reviewerSummary: summarizeNames(targetReviewers, `${reviewerCount} reviewers`),
    qtyPerAnnotator: Number(qtyPerAnnotator),
    annotatorCount,
    reviewerCount,
    totalRecords,
    payload: {
      projectId: Number(projectId),
      annotatorIds,
      totalQuantity: Number(qtyPerAnnotator),
      reviewerIds,
    },
  };
};
