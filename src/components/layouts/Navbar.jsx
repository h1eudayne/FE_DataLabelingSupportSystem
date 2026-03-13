import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SimpleBar from "simplebar-react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;
  const { t } = useTranslation();

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    transition: "all 0.3s ease",
    // padding: "12px 20px",
    borderRadius: "8px",
    // margin: "4px 10px",
    marginTop: "12px",
  };

  const iconStyle = {
    minWidth: "24px",
    display: "inline-block",
    textAlign: "center",
  };

  return (
    <div className="app-menu navbar-menu">
      <style>
        {`
          /* ── Light mode defaults ── */
          .nav-item .menu-link {
            color: #495057 !important;
            transition: all 0.2s ease;
          }

          .nav-item .menu-link:hover {
            background-color: #f3f3f9 !important;
            color: #405189 !important;
          }
          
          .nav-item .menu-link:hover i {
            color: #405189 !important;
            transform: scale(1.1);
          }

          .menu-title {
            padding: 20px 20px 10px !important; 
            margin: 0 !important;
            color: #adb5bd !important;
          }

          /* ================================================================
             DARK MODE - Stitch Design System
             ================================================================ */

          /* Sidebar background */
          [data-bs-theme="dark"] .app-menu.navbar-menu {
            background-color: #111827 !important;
            border-right: 1px solid rgba(51, 65, 85, 0.4) !important;
          }

          /* Brand box */
          [data-bs-theme="dark"] .navbar-brand-box {
            background-color: #111827 !important;
            border-bottom: 1px solid rgba(51, 65, 85, 0.3) !important;
          }

          /* Menu links in dark mode */
          [data-bs-theme="dark"] .nav-item .menu-link {
            color: #94A3B8 !important;
            border-radius: 8px !important;
            margin: 2px 12px !important;
            padding: 10px 16px !important;
          }

          [data-bs-theme="dark"] .nav-item .menu-link:hover {
            background-color: rgba(59, 130, 246, 0.1) !important;
            color: #3B82F6 !important;
            transform: translateX(2px);
          }

          [data-bs-theme="dark"] .nav-item .menu-link:hover i {
            color: #3B82F6 !important;
          }

          /* Active state */
          [data-bs-theme="dark"] .nav-item .menu-link.active {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05)) !important;
            color: #3B82F6 !important;
            border-left: 3px solid #3B82F6 !important;
            font-weight: 600 !important;
          }

          /* Menu title */
          [data-bs-theme="dark"] .menu-title {
            color: #64748B !important;
            text-transform: uppercase !important;
            font-size: 0.65rem !important;
            letter-spacing: 1.2px !important;
            font-weight: 700 !important;
          }

          /* Divider in dark mode */
          [data-bs-theme="dark"] hr {
            border-color: #334155 !important;
            opacity: 0.3;
          }

          /* Scrollbar within sidebar */
          [data-bs-theme="dark"] .app-menu ::-webkit-scrollbar {
            width: 4px;
          }
          [data-bs-theme="dark"] .app-menu ::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 2px;
          }

          /* ================================================================
             LOGO TOGGLE - Override based on data-bs-theme
             ================================================================ */
          /* Dark mode: show logo-dark, hide logo-light */
          [data-bs-theme="dark"] .navbar-brand-box .logo-dark {
            display: block !important;
          }
          [data-bs-theme="dark"] .navbar-brand-box .logo-light {
            display: none !important;
          }

          /* Light mode: show logo-light, hide logo-dark */
          [data-bs-theme="light"] .navbar-brand-box .logo-dark {
            display: none !important;
          }
          [data-bs-theme="light"] .navbar-brand-box .logo-light {
            display: block !important;
          }
        `}
      </style>

      <div className="navbar-brand-box" style={{ textAlign: "left" }}>
        {/* Logo cho Dark Mode sidebar (text trắng) */}
        <Link to="/" className="logo logo-dark">
          <span className="logo-sm">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1773346579/logo-darkmode-small_lknbuk.png"
              alt="Logo"
              height="50"
            />
          </span>
          <span className="logo-lg">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1773346453/logo-darkmode_txjdzq.png"
              alt="Logo"
              height="55"
            />
          </span>
        </Link>
        {/* Logo cho Light Mode sidebar (text đen) */}
        <Link to="/" className="logo logo-light">
          <span className="logo-sm">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842133/logo-2_v1wquw.png"
              alt="Logo"
              height="50"
            />
          </span>
          <span className="logo-lg">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
              alt="Logo"
              height="55"
            />
          </span>
        </Link>
      </div>

      <div>
        <ul
          className="navbar-nav d-flex flex-column h-100"
          id="navbar-nav"
          style={{
            minHeight: "calc(100vh - 60px)",
            gap: "8px",
          }}
        >
          <div className="flex-grow-1">
            {["Admin", "Manager"].includes(role) && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/dashboard"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-dashboard-2-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.dashboard")}</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/projects-all-projects"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-stack-fill fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.projects")}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/projects-datasets"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-database-2-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.datasets")}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/export"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-file-download-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.exportData")}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/dispute-management"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-scales-3-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.disputes")}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/review-audit"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-shield-check-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.reviewAudit")}</span>
                  </Link>
                </li>
              </>
            )}

            {["Annotator", "Reviewer"].includes(role) && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/dashboard"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-home-4-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.dashboard")}</span>
                  </Link>
                </li>

                {role === "Annotator" && (
                  <>
                    <li className="nav-item">
                      <Link
                        className="nav-link menu-link fs-18"
                        to="/annotator-my-tasks"
                        style={menuItemStyle}
                      >
                        <i
                          className="ri-task-line fs-20 me-2"
                          style={iconStyle}
                        ></i>
                        <span>{t("navbar.myTask")}</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link menu-link fs-18"
                        to="/annotator-projects"
                        style={menuItemStyle}
                      >
                        <i
                          className="ri-folders-line fs-20 me-2"
                          style={iconStyle}
                        ></i>
                        <span>{t("navbar.projects")}</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link menu-link fs-18"
                        to="/annotator-team"
                        style={menuItemStyle}
                      >
                        <i
                          className="ri-group-line fs-20 me-2"
                          style={iconStyle}
                        ></i>
                        <span>{t("navbar.team")}</span>
                      </Link>
                    </li>
                  </>
                )}
                {role === "Reviewer" && (
                  <li className="nav-item">
                    <Link
                      className="nav-link menu-link fs-18"
                      to="/workplace-review-task"
                      style={menuItemStyle}
                    >
                      <i
                        className="ri-shield-check-line fs-20 me-2"
                        style={iconStyle}
                      ></i>
                      <span>{t("navbar.reviewTask")}</span>
                    </Link>
                  </li>
                )}
              </>
            )}
          </div>

          <div className="mt-auto mb-4">
            <hr
              className="mx-3 my-2"
              style={{ borderColor: "var(--border-color, rgba(0,0,0,0.1))" }}
            />
            {role === "Admin" && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/settings-user-management"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-user-settings-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.userManagement")}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/settings-system-logs"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-list-settings-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>{t("navbar.systemLogs")}</span>
                  </Link>
                </li>
              </>
            )}
            {["Annotator", "Manager", "Reviewer"].includes(role) && (
              <li className="nav-item">
                <Link
                  className="nav-link menu-link fs-18"
                  to="/annotator-settings"
                  style={menuItemStyle}
                >
                  <i
                    className="ri-settings-4-line fs-20 me-2"
                    style={iconStyle}
                  ></i>
                  <span>{t("navbar.settingsMenu")}</span>
                </Link>
              </li>
            )}
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
