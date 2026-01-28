// import "./App.css";
import "./assets/css/app.min.css";
import "./assets/css/bootstrap.min.css";
import "./assets/css/custom.min.css";
import "./assets/css/icons.min.css";

import { SpeedInsights } from "@vercel/speed-insights/react";
import MainLayouts from "./components/layouts/MainLayouts";
import HomePage from "./page/HomePage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./page/auth/RegisterPage";
import WorkplaceLabelingTaskPage from "./page/annotator/labeling/WorkplaceLabelingTaskPage";
import ProjectsAllProjectPage from "./page/manager/project/ProjectsAllProjectsPage";
import WorkplaceReviewTaskPage from "./page/WorkplaceReviewTaskPage";
import ExportPage from "./page/ExportPage";
import DashboardProjectStatus from "./page/manager/status/DashboardProjectStatus";
import SettingUserManagement from "./page/admin/SettingUserManagement";
import SettingsSystemLogs from "./page/SettingsSystemLogs";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import AccessDenied from "./routes/AccessDenied";
import AnnotatorDashboard from "./page/annotator/dashboard/AnnotatorDashboard";
import AnnotatorTaskList from "./page/annotator/tasks/AnnotatorTaskList";
import ProjectImportData from "./page/manager/project/ProjectImportData";
import ProjectAssignTask from "./page/manager/project/ProjectAssignTask";
import CreateProject from "./page/manager/project/CreateProject";
import ProjectsDatasetsPage from "./page/manager/datasets/ProjectsDatasetsPage";
import DashboardAnalytics from "./page/manager/analytics/DashboardAnalyticsPage";
import LoginPage from "./page/auth/login/LoginPage";
import { ROLES } from "./constants/roles";

function App() {
  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        {/* PROTECTED ROUTES */}
        <Route path="/" element={<MainLayouts />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<HomePage />} />

          {/* NHÓM ADMIN: Quản trị hệ thống */}
          <Route element={<RoleProtectedRoute allowRoles={["Admin"]} />}>
            <Route
              path="settings-user-management"
              element={<SettingUserManagement />}
            />
            <Route
              path="settings-system-logs"
              element={<SettingsSystemLogs />}
            />
          </Route>

          {/* NHÓM MANAGER & ADMIN: Quản lý dự án */}
          <Route
            element={<RoleProtectedRoute allowRoles={["Admin", "Manager"]} />}
          >
            <Route
              path="dashboard-analytics"
              element={<DashboardAnalytics />}
            />
            <Route
              path="projects-all-projects"
              element={<ProjectsAllProjectPage />}
            />
            <Route
              path="projects-datasets"
              element={<ProjectsDatasetsPage />}
            />
            <Route path="projects-create" element={<CreateProject />} />
            {/* ... các route manager khác */}
          </Route>

          {/* NHÓM ANNOTATOR: Làm việc */}
          <Route element={<RoleProtectedRoute allowRoles={["Annotator"]} />}>
            <Route path="my-dashboard" element={<AnnotatorDashboard />} />
            <Route path="annotator-my-tasks" element={<AnnotatorTaskList />} />
            <Route
              path="workplace-labeling-task/:assignmentId"
              element={<WorkplaceLabelingTaskPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/access-denied" replace />} />
      </Routes>
      <SpeedInsights />
    </>
  );
}

export default App;
