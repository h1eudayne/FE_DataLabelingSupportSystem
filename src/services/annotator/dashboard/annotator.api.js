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
  const res = await axios.get(`/api/Task/my-tasks?projectId=${projectId || 0}`);
  return res.data;
};

export const getAllReviewerFeedback = async () => {
  const projectRes = await axios.get("/api/Project/annotator/assigned");
  const projects = projectRes.data || [];

  if (projects.length === 0) return [];

  const reviewRequests = projects.map((p) =>
    axios.get(`/api/Task/my-tasks?projectId=${p.id}`).then((res) => {
      return res.data.map((task) => ({
        ...task,
        projectName: p.name,
      }));
    }),
  );

  const responses = await Promise.all(reviewRequests);
  const allTasks = responses.flat();

  return allTasks.filter((task) => task.status === "Returned");
};
