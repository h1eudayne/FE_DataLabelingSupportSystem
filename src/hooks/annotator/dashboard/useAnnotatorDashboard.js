import { useQuery } from "@tanstack/react-query";
import {
  getProfile,
  getAssignedProjects,
  getMyTasks,
  getAllReviewerFeedback,
  getProjectProgressDetails,
  getMyAccuracy,
} from "../../../services/annotator/dashboard/annotator.api";
import { sortProjectsByNewestId } from "../../../utils/projectSort";

const useAnnotatorDashboard = (projectId) => {
  const profile = useQuery({
    queryKey: ["annotator-profile"],
    queryFn: getProfile,
  });

  const projects = useQuery({
    queryKey: ["assigned-projects"],
    queryFn: getAssignedProjects,
    select: (data) => sortProjectsByNewestId(Array.isArray(data) ? data : []),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30,
  });

  const defaultProjectId = projectId ?? projects.data?.[0]?.projectId ?? null;

  const tasksByProject = useQuery({
    queryKey: ["my-tasks", defaultProjectId],
    queryFn: () => getMyTasks(defaultProjectId),
    enabled: !!defaultProjectId,
    retry: false,
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 30,
  });

  const reviewerFeedback = useQuery({
    queryKey: ["reviewer-feedback"],
    queryFn: getAllReviewerFeedback,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30,
  });

  const projectProgress = useQuery({
    queryKey: ["project-progress-details"],
    queryFn: getProjectProgressDetails,
    retry: false,
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 30,
  });

  const myAccuracy = useQuery({
    queryKey: ["my-accuracy"],
    queryFn: getMyAccuracy,
    retry: false,
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 30,
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
