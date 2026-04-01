import "./assets/css/usertable.min.css";
import "./App.css";
import "./assets/css/admin-ui.css";

import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import AppToastHost from "./components/ui/AppToastHost";
import MainLayouts from "./components/layouts/MainLayouts";
import HomePage from "./page/HomePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RegisterPage from "./page/auth/RegisterPage";
import WorkplaceLabelingTaskPage from "./page/annotator/labeling/WorkplaceLabelingTaskPage";
import ProjectsAllProjectPage from "./page/manager/project/ProjectsAllProjectsPage";
import WorkplaceReviewTaskPage from "./page/WorkplaceReviewTaskPage";
import ProjectDetailPage from "./page/manager/project/ProjectDetailPage";
import DashboardProjectStatus from "./page/manager/status/DashboardProjectStatus";
import SettingUserManagement from "./page/admin/SettingUserManagement";
import SettingsSystemLogs from "./page/SettingsSystemLogs";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import PrivateRoute from "./routes/PrivateRoute";
import AccessDenied from "./routes/AccessDenied";
import AnnotatorDashboard from "./page/annotator/dashboard/AnnotatorDashboard";
import AnnotatorTaskList from "./page/annotator/tasks/AnnotatorTaskList";
import AnnotatorProjectPacks from "./page/annotator/tasks/AnnotatorProjectPacks";
import ProjectImportData from "./page/manager/project/ProjectImportData";
import ProjectAssignTask from "./page/manager/project/ProjectAssignTask";
import CreateProject from "./page/manager/project/CreateProject";

import LoginPage from "./page/auth/login/LoginPage";
import ForgotPasswordPage from "./page/auth/ForgotPasswordPage";
import { ROLES } from "./constants/roles";
import LandingPage from "./page/LandingPage";
import Profile from "./page/Profile";
import ReviewWorkspace from "./components/reviewer/home/ReviewWorkspace";
import WorkplaceReviewTask from "./components/reviewer/home/WorkplaceReviewTask";
import ProjectUserManagement from "./page/admin/ProjectUserManagement";
import DetailProject from "./components/admin/home/DetailProject";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isLoggedIn = isAuthenticated;
  const shouldRenderSpeedInsights = import.meta.env.PROD;

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
          path="/forgot-password"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
          }
        />

        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayouts />}>
            <Route path="dashboard" element={<HomePage />} />
            <Route path="profile" element={<Profile />} />
            <Route element={<RoleProtectedRoute allowRoles={["Admin"]} />}>
              <Route
                path="settings-user-management"
                element={<SettingUserManagement />}
              />
              <Route
                path="settings-system-logs"
                element={<SettingsSystemLogs />}
              />
              <Route
                path="/projects-overview"
                element={<ProjectUserManagement />}
              />
              <Route
                path="/view-detail-project/:id"
                element={<DetailProject />}
              />
            </Route>

            <Route
              element={<RoleProtectedRoute allowRoles={["Manager"]} />}
            >
              <Route
                path="projects-all-projects"
                element={<ProjectsAllProjectPage />}
              />
              <Route
                path="projects-datasets"
                element={<Navigate to="/projects-all-projects" replace />}
              />
              <Route
                path="projects-datasets/:id"
                element={<Navigate to="/projects-all-projects" replace />}
              />
              <Route
                path="projects-assign/:id"
                element={<ProjectAssignTask />}
              />
              <Route path="projects-create" element={<CreateProject />} />
            </Route>

            <Route element={<RoleProtectedRoute allowRoles={["Manager", "Admin"]} />}>
              <Route
                path="project-detail/:id"
                element={<ProjectDetailPage />}
              />
            </Route>

            <Route element={<RoleProtectedRoute allowRoles={["Reviewer"]} />}>
              <Route
                path="/reviewer/review-workspace/:projectId/:assignmentId"
                element={<ReviewWorkspace />}
              />
              <Route
                path="/reviewer/review-task/"
                element={<WorkplaceReviewTask />}
              />
            </Route>

            <Route element={<RoleProtectedRoute allowRoles={["Annotator"]} />}>
              <Route
                path="annotator-my-tasks"
                element={<AnnotatorTaskList />}
              />
              <Route
                path="annotator-projects"
                element={<Navigate to="/annotator-my-tasks" replace />}
              />
              <Route
                path="annotator-project-packs/:assignmentId"
                element={<AnnotatorProjectPacks />}
              />
              <Route
                path="workplace-labeling-task/:assignmentId"
                element={<WorkplaceLabelingTaskPage />}
              />
              <Route
                path="annotator-team"
                element={<Navigate to="/annotator-my-tasks" replace />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AppToastHost />
      {shouldRenderSpeedInsights ? <SpeedInsights /> : null}
      {shouldRenderSpeedInsights ? <Analytics /> : null}
    </>
  );
}

export default App;
