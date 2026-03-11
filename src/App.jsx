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
import { useSelector } from "react-redux";
import RegisterPage from "./page/auth/RegisterPage";
import WorkplaceLabelingTaskPage from "./page/annotator/labeling/WorkplaceLabelingTaskPage";
import ProjectsAllProjectPage from "./page/manager/project/ProjectsAllProjectsPage";
import WorkplaceReviewTaskPage from "./page/WorkplaceReviewTaskPage";
import ExportPage from "./page/ExportPage";
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
import ProjectsDatasetsPage from "./page/manager/datasets/ProjectsDatasetsPage";

import DisputeManagementPage from "./page/manager/dispute/DisputeManagementPage";
import ReviewAuditPage from "./page/manager/review/ReviewAuditPage";
import LoginPage from "./page/auth/login/LoginPage";
import { ROLES } from "./constants/roles";
import LandingPage from "./page/LandingPage";
import Profile from "./page/Profile";
import ReviewWorkspace from "./components/reviewer/home/ReviewWorkspace";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isLoggedIn = isAuthenticated;

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
            </Route>

            <Route
              element={<RoleProtectedRoute allowRoles={["Admin", "Manager"]} />}
            >
              <Route
                path="projects-all-projects"
                element={<ProjectsAllProjectPage />}
              />
              <Route
                path="projects-datasets"
                element={<ProjectsDatasetsPage />}
              />
              <Route
                path="projects-datasets/:id"
                element={<ProjectsDatasetsPage />}
              />
              <Route
                path="projects-assign/:id"
                element={<ProjectAssignTask />}
              />
              <Route path="projects-create" element={<CreateProject />} />
              <Route path="export" element={<ExportPage />} />
              <Route
                path="dispute-management"
                element={<DisputeManagementPage />}
              />
              <Route path="review-audit" element={<ReviewAuditPage />} />
            </Route>

            <Route element={<RoleProtectedRoute allowRoles={["Annotator"]} />}>
              <Route
                path="annotator-my-tasks"
                element={<AnnotatorTaskList />}
              />
              <Route
                path="annotator-projects"
                element={<AnnotatorTaskList />}
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
                element={
                  <div className="container-fluid">
                    <h4 className="fw-bold mb-3">Team</h4>
                    <div className="alert alert-info">
                      <i className="ri-team-line me-2"></i>
                      Tính năng đang được phát triển.
                    </div>
                  </div>
                }
              />
              <Route
                path="annotator-settings"
                element={
                  <div className="container-fluid">
                    <h4 className="fw-bold mb-3">Cài đặt</h4>
                    <div className="alert alert-info">
                      <i className="ri-settings-3-line me-2"></i>
                      Tính năng đang được phát triển.
                    </div>
                  </div>
                }
              />
            </Route>
            <Route element={<RoleProtectedRoute allowRoles={["Reviewer"]} />}>
              <Route
                path="/reviewer/review-workspace/:assignmentId"
                element={<ReviewWorkspace />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SpeedInsights />
    </>
  );
}

export default App;
