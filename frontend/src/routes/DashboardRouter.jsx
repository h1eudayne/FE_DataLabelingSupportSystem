// src/routes/DashboardRouter.jsx
// import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
// import ManagerDashboard from "../pages/dashboard/manager/ManagerDashboard";
import AnnotatorDashboard from "../page/dashboard/AnnotatorDashboard";

const DashboardRouter = ({ role }) => {
  //   if (role === "ADMIN") return <AdminDashboard />;
  //   if (role === "MANAGER") return <ManagerDashboard />;
  return <AnnotatorDashboard />;
};

export default DashboardRouter;
