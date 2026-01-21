import React, { useState } from "react";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import Collapse from "react-bootstrap/Collapse";

import logoSm from "../../assets/images/logo-sm.png";
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role; // ADMIN | MANAGER | REVIEWER | ANNOTATOR

  const [openMenu, setOpenMenu] = useState("");

  const handleToggle = (menuId) => {
    setOpenMenu(openMenu === menuId ? "" : menuId);
  };

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box">
        <Link to="/" className="logo logo-dark">
          <span className="logo-sm">
            <img src={logoSm} alt="" height="22" />
          </span>
          <span className="logo-lg">
            <img src={logoDark} alt="" height="17" />
          </span>
        </Link>

        <Link to="/" className="logo logo-light">
          <span className="logo-sm">
            <img src={logoSm} alt="" height="22" />
          </span>
          <span className="logo-lg">
            <img src={logoLight} alt="" height="17" />
          </span>
        </Link>
        <button
          type="button"
          className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
          id="vertical-hover"
        >
          <i className="ri-record-circle-line" />
        </button>
      </div>
      <SimpleBar style={{ maxHeight: "100%" }}>
        <ul className="navbar-nav" id="navbar-nav">
          {["Admin", "Manager"].includes(role) && (
            <>
              <li className="menu-title">
                <span data-key="t-menu">Dashboard</span>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link menu-link ${
                    openMenu === "sidebarDashboards" ? "" : "collapsed"
                  }`}
                  href="#!"
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggle("sidebarDashboards");
                  }}
                  data-bs-toggle="collapse"
                  aria-expanded={openMenu === "sidebarDashboards"}
                >
                  <i className="ri-dashboard-2-line"></i>
                  <span>Dashboards</span>
                </a>

                <Collapse in={openMenu === "sidebarDashboards"}>
                  <div>
                    <div className="menu-dropdown">
                      <ul className="nav nav-sm flex-column">
                        <li className="nav-item">
                          <a href="/dashboard-analytics" className="nav-link">
                            Analytics
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="/dashboard-project-status"
                            className="nav-link"
                          >
                            Project Status
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Collapse>
              </li>
            </>
          )}
          {["Admin", "Manager"].includes(role) && (
            <>
              <li className="menu-title">
                <i className="ri-more-fill" />
                <span data-key="t-pages">Projects</span>
              </li>

              <li className="nav-item">
                <a
                  className={`nav-link menu-link ${
                    openMenu === "sidebarApps" ? "" : "collapsed"
                  }`}
                  href="#!"
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggle("sidebarApps");
                  }}
                  data-bs-toggle="collapse"
                  aria-expanded={openMenu === "sidebarApps"}
                >
                  <i className="ri-apps-2-line"></i>
                  <span data-key="t-apps">Projects</span>
                </a>

                <Collapse in={openMenu === "sidebarApps"}>
                  <div>
                    <div
                      className={`collapse menu-dropdown ${
                        openMenu === "sidebarApps" ? "show" : ""
                      }`}
                      id="sidebarApps"
                    >
                      <ul className="nav nav-sm flex-column">
                        <li className="nav-item">
                          <a href="/projects-all-projects" className="nav-link">
                            All Projects
                          </a>
                        </li>
                        <li className="nav-item">
                          <a href="/projects-datasets" className="nav-link">
                            Datasets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Collapse>
              </li>
            </>
          )}

          <li className="menu-title">
            <i className="ri-more-fill" />
            <span data-key="t-components">Workplace</span>
          </li>

          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarCharts" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarCharts");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarCharts"}
              aria-controls="sidebarCharts"
            >
              <i className="ri-pie-chart-line" />
              <span data-key="t-charts">Workplace</span>
            </a>

            <Collapse in={openMenu === "sidebarCharts"}>
              <div>
                <div
                  className={`collapse menu-dropdown ${
                    openMenu === "sidebarCharts" ? "show" : ""
                  }`}
                  id="sidebarCharts"
                >
                  <ul className="nav nav-sm flex-column">
                    {role === "Annotator" && (
                      <>
                        <li className="nav-item">
                          <a
                            href="/annotator-my-tasks"
                            className="nav-link"
                            data-key="t-chartjs"
                          >
                            My Task
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="/workplace-labeling-task"
                            className="nav-link"
                            data-key="t-chartjs"
                          >
                            Labeling Task
                          </a>
                        </li>
                        <li className="nav-item">
                          <a href="/my-dashboard" className="nav-link">
                            My Dashboard
                          </a>
                        </li>
                      </>
                    )}
                    {role === "Reviewer" && (
                      <>
                        <li className="nav-item">
                          <a
                            href="/workplace-review-task"
                            className="nav-link"
                            data-key="t-echarts"
                          >
                            Review Task
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {["Admin", "Manager"].includes(role) && (
            <li className="menu-title">
              <i className="ri-more-fill" />
              <span data-key="t-components">Export</span>
            </li>
          )}

          {["Admin", "Manager"].includes(role) && (
            <li className="nav-item">
              <a
                className={`nav-link menu-link ${
                  openMenu === "sidebarUI" ? "" : "collapsed"
                }`}
                href="/export"
              >
                <i className="ri-pencil-ruler-2-line" />
                <span data-key="t-base-ui">Export</span>
              </a>
            </li>
          )}
          {role === "Admin" && (
            <>
              <li className="menu-title">
                <i className="ri-more-fill" />
                <span data-key="t-components">Settings</span>
              </li>

              <li className="nav-item">
                <a
                  className={`nav-link menu-link ${
                    openMenu === "sidebarUI" ? "" : "collapsed"
                  }`}
                  href="#!"
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggle("sidebarUI");
                  }}
                  data-bs-toggle="collapse"
                  role="button"
                  aria-expanded={openMenu === "sidebarUI"}
                  aria-controls="sidebarUI"
                >
                  <i className="ri-pencil-ruler-2-line" />
                  <span data-key="t-base-ui">Settings</span>
                </a>

                <Collapse in={openMenu === "sidebarUI"}>
                  <div>
                    <div
                      className={`collapse menu-dropdown mega-dropdown-menu ${
                        openMenu === "sidebarUI" ? "show" : ""
                      }`}
                      id="sidebarUI"
                    >
                      <div className="row">
                        <div className="col-lg-4">
                          <ul className="nav nav-sm flex-column">
                            <li className="nav-item">
                              <a
                                href="/settings-user-management"
                                className="nav-link"
                                data-key="t-alerts"
                              >
                                User Management
                              </a>
                            </li>
                            <li className="nav-item">
                              <a
                                href="#!"
                                className="nav-link"
                                data-key="t-badges"
                              >
                                AI Config
                              </a>
                            </li>
                            <li className="nav-item">
                              <a
                                href="/settings-system-logs"
                                className="nav-link"
                                data-key="t-badges"
                              >
                                System Logs
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Collapse>
              </li>
            </>
          )}
        </ul>
      </SimpleBar>
    </div>
  );
};

export default Navbar;
