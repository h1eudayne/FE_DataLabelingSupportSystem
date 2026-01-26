import axios from "/src/services/axios.customize.js";

// ================= USER =================
export const getProfile = async () => {
  const res = await axios.get("/api/User/profile");
  return res.data;
};

// ================= PROJECT =================
export const getAssignedProjects = async () => {
  const res = await axios.get("/api/Project/annotator/assigned");
  return res.data;
};

// ================= DASHBOARD (FIX) =================
// ❌ KHÔNG GỌI API KHÔNG TỒN TẠI
// ✅ TÍNH STATS TỪ PROJECT ASSIGNED
export const getDashboardStats = async () => {
  const projects = await getAssignedProjects();

  let totalAssigned = 0;
  let submitted = 0;
  let inProgress = 0;

  projects.forEach((p) => {
    totalAssigned += p.totalImages || 0;
    submitted += p.completedImages || 0;

    if (p.status === "InProgress") {
      inProgress += (p.totalImages || 0) - (p.completedImages || 0);
    }
  });

  return {
    totalAssigned,
    submitted,
    inProgress,
    pendingReview: 0,
    returned: 0,
  };
};

// ================= TASK =================
export const getMyTasks = async (projectId) => {
  if (!projectId) return [];
  const res = await axios.get(`/api/Task/project/${projectId}/images`);
  return res.data;
};

// ================= REVIEW =================
export const getReviewerFeedbackByProject = async (projectId) => {
  if (!projectId) return [];

  try {
    const res = await axios.get(`/api/Review/project/${projectId}`);
    return res.data;
  } catch (err) {
    // ✅ backend trả 400 là hợp lệ khi chưa có review
    return [];
  }
};

export const getAllReviewerFeedback = async () => {
  const projects = await getAssignedProjects();
  if (!projects || projects.length === 0) return [];

  // ✅ CHỈ LẤY PROJECT ĐÃ SUBMITTED / RETURNED
  const validProjects = projects.filter(
    (p) => p.status === "Submitted" || p.status === "Returned",
  );

  const requests = validProjects.map((p) =>
    getReviewerFeedbackByProject(p.id).then((reviews) =>
      reviews.map((r) => ({
        ...r,
        projectName: p.name,
      })),
    ),
  );

  const responses = await Promise.all(requests);
  return responses.flat();
};
