export const buildAnnotatorWorkspaceUrl = (projectId, task) => {
  if (!projectId || !task?.id) {
    return null;
  }

  const searchParams = new URLSearchParams();

  if (task.id != null) {
    searchParams.set("imageId", String(task.id));
  }

  if (task.dataItemId != null) {
    searchParams.set("dataItemId", String(task.dataItemId));
  }

  const queryString = searchParams.toString();
  return `/workplace-labeling-task/${projectId}${queryString ? `?${queryString}` : ""}`;
};
