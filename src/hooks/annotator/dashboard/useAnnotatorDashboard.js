import { useQuery } from "@tanstack/react-query";
import {
  getProfile,
  getDashboardStats,
  getAssignedProjects,
  getMyTasks,
  getAllReviewerFeedback,
} from "../../../services/annotator/dashboard/annotator.api";

const useAnnotatorDashboard = (projectId) => {
  const profile = useQuery({
    queryKey: ["annotator-profile"],
    queryFn: getProfile,
  });

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    retry: false,
  });

  const projects = useQuery({
    queryKey: ["assigned-projects"],
    queryFn: getAssignedProjects,
  });

  const tasksByProject = useQuery({
    queryKey: ["my-tasks", projectId],
    queryFn: () => getMyTasks(projectId),
    enabled: !!projectId,
  });

  const reviewerFeedback = useQuery({
    queryKey: ["reviewer-feedback"],
    queryFn: getAllReviewerFeedback,
    retry: false,
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
