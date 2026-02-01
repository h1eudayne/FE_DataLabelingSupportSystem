import React from "react";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    transition: "all 0.3s ease",
    // padding: "12px 20px",
    borderRadius: "8px",
    // margin: "4px 10px",
    marginTop: "30px",
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
          /* Màu chữ mặc định (màu tối để nổi trên nền trắng) */
          .nav-item .menu-link {
            color: #495057 !important;
          }

          /* HIỆU ỨNG HOVER - Sửa lại để thấy rõ trên nền trắng */
          .nav-item .menu-link:hover {
            background-color: #f3f3f9 !important; /* Màu xám xanh rất nhạt */
            color: #405189 !important;           /* Chữ chuyển sang màu xanh đậm chuyên nghiệp */
          }
          
          .nav-item .menu-link:hover i {
            color: #405189 !important;           /* Icon cũng đổi màu theo chữ */
            transform: scale(1.1);
          }

          /* Giữ nguyên Workplace và các tiêu đề */
          .menu-title {
            padding: 20px 20px 10px !important; 
            margin: 0 !important;
            color: #adb5bd !important; /* Màu tiêu đề xám nhạt */
          }
        `}
      </style>

      <div className="navbar-brand-box" style={{ textAlign: "left" }}>
        <Link to="/" className="logo logo-dark">
          <span className="logo-sm">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842133/logo-2_v1wquw.png"
              alt=""
              height="50"
            />
          </span>
          <span className="logo-lg">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
              alt=""
              height="55"
            />
          </span>
        </Link>
        <Link to="/" className="logo logo-light">
          <span className="logo-sm">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842133/logo-2_v1wquw.png"
              alt=""
              height="50"
            />
          </span>
          <span className="logo-lg">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
              alt=""
              height="55"
            />
          </span>
        </Link>
      </div>

      <SimpleBar
        style={{ maxHeight: "100%", marginTop: "10px" }}
        className="h-100"
      >
        <ul
          className="navbar-nav d-flex flex-column h-100"
          id="navbar-nav"
          style={{
            minHeight: "calc(100vh - 60px)",
            gap: "50px",
          }}
        >
          <div className="flex-grow-1">
            {["Admin", "Manager"].includes(role) && (
              <>
                <li className="menu-title">
                  <span style={{ transition: "0.3s" }}>Main</span>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/dashboard-analytics"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-dashboard-2-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>Dashboard</span>
                  </Link>
                </li>

                <li className="menu-title">
                  <span>Management</span>
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
                    <span>Projects</span>
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
                    <span>Datasets</span>
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
                    <span>Export Data</span>
                  </Link>
                </li>
              </>
            )}

            {["Annotator", "Reviewer"].includes(role) && (
              <>
                {/* <li className="menu-title">
                  <span>Workplace</span>
                </li> */}
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link fs-18"
                    to="/my-dashboard"
                    style={menuItemStyle}
                  >
                    <i
                      className="ri-home-4-line fs-20 me-2"
                      style={iconStyle}
                    ></i>
                    <span>Dashboard</span>
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
                        <span>My Task</span>
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
                        <span>Projects</span>
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
                        <span>Team</span>
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
                      <span>Review Task</span>
                    </Link>
                  </li>
                )}
              </>
            )}
          </div>

          <div className="mt-auto mb-4">
            <hr
              className="mx-3 my-2"
              style={{ borderColor: "rgba(0,0,0,0.1)" }}
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
                    <span>User Management</span>
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
                    <span>System Logs</span>
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
                  <span>Settings</span>
                </Link>
              </li>
            )}
          </div>
        </ul>
      </SimpleBar>
    </div>
  );
};

export default Navbar;
