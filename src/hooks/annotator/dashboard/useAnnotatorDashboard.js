import { useQuery } from "@tanstack/react-query";
import {
  getProfile,
  getAssignedProjects,
  getMyTasks,
  getAllReviewerFeedback,
  getProjectProgressDetails,
  getMyAccuracy,
} from "../../../services/annotator/dashboard/annotator.api";

const useAnnotatorDashboard = (projectId) => {
  const profile = useQuery({
    queryKey: ["annotator-profile"],
    queryFn: getProfile,
  });

  const projects = useQuery({
    queryKey: ["assigned-projects"],
    queryFn: getAssignedProjects,
  });

  const defaultProjectId = projectId ?? projects.data?.[0]?.projectId ?? null;

  const tasksByProject = useQuery({
    queryKey: ["my-tasks", defaultProjectId],
    queryFn: () => getMyTasks(defaultProjectId),
    enabled: !!defaultProjectId,
    retry: false,
    staleTime: 1000 * 30,
  });

  const reviewerFeedback = useQuery({
    queryKey: ["reviewer-feedback"],
    queryFn: getAllReviewerFeedback,
    retry: false,
  });

  const projectProgress = useQuery({
    queryKey: ["project-progress-details"],
    queryFn: getProjectProgressDetails,
    retry: false,
    staleTime: 1000 * 60,
  });

  const myAccuracy = useQuery({
    queryKey: ["my-accuracy"],
    queryFn: getMyAccuracy,
    retry: false,
    staleTime: 1000 * 60,
  });

  return {
    profile,
    projects,
    defaultProjectId,
    tasksByProject,
    reviewerFeedback,
    projectProgress,
    myAccuracy,
  };
};

export default useAnnotatorDashboard;
