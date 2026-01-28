// import "./App.css";
import "./assets/css/app.min.css";
import "./assets/css/bootstrap.min.css";
import "./assets/css/custom.min.css";
import "./assets/css/icons.min.css";
import "./assets/css/usertable.min.css";

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
import LandingPage from "./page/LandingPage";

function App() {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />
          }
        />

        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        <Route path="/access-denied" element={<AccessDenied />} />

        <Route element={<MainLayouts />}>
          <Route path="dashboard" element={<HomePage />} />

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
          </Route>

          <Route element={<RoleProtectedRoute allowRoles={["Annotator"]} />}>
            <Route path="my-dashboard" element={<AnnotatorDashboard />} />
            <Route path="annotator-my-tasks" element={<AnnotatorTaskList />} />
            <Route
              path="workplace-labeling-task/:assignmentId"
              element={<WorkplaceLabelingTaskPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SpeedInsights />
    </>
  );
}

export default App;
