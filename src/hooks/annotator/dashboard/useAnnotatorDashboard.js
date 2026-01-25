import { useQuery } from "@tanstack/react-query";
import * as api from "../../../services/annotator/dashboard/annotator.api";

const useAnnotatorDashboard = (projectId) => {
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
  });

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });

  const projects = useQuery({
    queryKey: ["assigned-projects"],
    queryFn: api.getAssignedProjects,
  });

  const tasksByProject = useQuery({
    queryKey: ["my-tasks", projectId],
    queryFn: () => api.getMyTasks(projectId),
    enabled: !!projectId,
  });

  const reviewerFeedback = useQuery({
    queryKey: ["reviewer-feedback"],
    queryFn: api.getAllReviewerFeedback,
  });

  return {
    profile,
    stats,
    projects,
    tasksByProject,
    reviewerFeedback,
  };
};

export default useAnnotatorDashboard;
