import axios from "../../axios.customize";

export const getProfile = async () => {
  const res = await axios.get("/api/User/profile");
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await axios.get("/api/Task/dashboard-stats");
  return res.data;
};

export const getAssignedProjects = async () => {
  const res = await axios.get("/api/Project/annotator/assigned");
  return res.data;
};

export const getMyTasks = async (projectId) => {
  const res = await axios.get(`/api/Task/my-tasks/${projectId}`);
  return res.data;
};

export const getAllReviewerFeedback = async () => {
  const projectRes = await axios.get("/api/Project/annotator/assigned");
  const projects = projectRes.data || [];

  const reviewRequests = projects.map((p) =>
    axios.get(`/api/Review/project/${p.id}`),
  );

  const responses = await Promise.all(reviewRequests);

  return responses
    .flatMap((r) => r.data)
    .filter((task) => task.status === "RETURNED");
};
