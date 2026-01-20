// import "./App.css";

import MainLayouts from "./components/layouts/MainLayouts";
import HomePage from "./page/HomePage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./page/auth/LoginPage";
import RegisterPage from "./page/RegisterPage";
import WorkplaceLabelingTaskPage from "./page/annotator/labeling/WorkplaceLabelingTaskPage";
import ProjectsAllProjectPage from "./page/ProjectsAllProjectsPage";
import WorkplaceReviewTaskPage from "./page/WorkplaceReviewTaskPage";
import DashboardAnalytics from "./page/DashboardAnalytics";
import ExportPage from "./page/ExportPage";
import DashboardProjectStatus from "./page/DashboardProjectStatus";
import ProjectsDatasetPage from "./page/ProjectsDatasetsPage";
import SettingUserManagement from "./page/SettingUserManagement";
import SettingsSystemLogs from "./page/SettingsSystemLogs";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import AccessDenied from "./routes/AccessDenied";
import AnnotatorDashboard from "./page/annotator/dashboard/AnnotatorDashboard";

function App() {
  /*
    Annotator |  Workplace > Labeling Task  |  Làm việc ngay với các task được giao.
    Manager   |  Projects > All Projects    |  Quản lý tiến độ và phân công.
    Reviewer  |  Workplace > Review Task    |  Kiểm duyệt chất lượng dữ liệu đầu vào.
    Admin     |  Dashboard > Analytics      |  Theo dõi sức khỏe hệ thống và người dùng.
  */
  return (
    <Routes>
      <Route path="/" element={<MainLayouts />}>
        {/* Default */}
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<HomePage />} />
        <Route
          path="/workplace-labeling-task"
          element={
            <RoleProtectedRoute allowRoles={["Annotator"]}>
              <WorkplaceLabelingTaskPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/workplace-review-task"
          element={
            <RoleProtectedRoute allowRoles={["Reviewer"]}>
              <WorkplaceReviewTaskPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="/export" element={<ExportPage />} />
        <Route
          path="/dashboard-analytics"
          element={
            <RoleProtectedRoute allowRoles={["Admin", "Manager", "Annotator"]}>
              <DashboardAnalytics />
            </RoleProtectedRoute>
          }
        />{" "}
        <Route
          path="/dashboard-project-status"
          element={<DashboardProjectStatus />}
        />
        <Route
          path="/projects-all-projects"
          element={<ProjectsAllProjectPage />}
        />
        <Route path="/projects-datasets" element={<ProjectsDatasetPage />} />
        <Route
          path="/settings-user-management"
          element={
            <RoleProtectedRoute allowRoles={["Admin"]}>
              <SettingUserManagement />
            </RoleProtectedRoute>
          }
        />
        <Route path="/settings-system-logs" element={<SettingsSystemLogs />} />
        <Route path="/my-dashboard" element={<AnnotatorDashboard />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<Navigate to="/access-denied" replace />} />
    </Routes>
  );
}

export default App;
