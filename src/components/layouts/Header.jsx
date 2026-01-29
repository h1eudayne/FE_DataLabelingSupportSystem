import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/store/auth/auth.slice";

const Header = ({ toggleSidebar, sidebarSize }) => {
  const DEFAULT_AVATAR =
    "https://res.cloudinary.com/deu3ur8w9/image/upload/v1769402498/ipkoqezcvbqy997mcqhm.jpg";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <header id="page-topbar">
      <div className="layout-width">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box horizontal-logo">
              <Link to="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src="assets/images/logo-sm.png" alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src="assets/images/logo-dark.png" alt="" height="17" />
                </span>
              </Link>
              <Link to="/" className="logo logo-light">
                <span className="logo-sm">
                  <img src="assets/images/logo-sm.png" alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src="assets/images/logo-light.png" alt="" height="17" />
                </span>
              </Link>
            </div>

            <button
              onClick={toggleSidebar}
              className="btn btn-sm px-3 fs-16 header-item shadow-none"
              id="topnav-hamburger-icon"
              aria-label="Toggle Sidebar"
            >
              {sidebarSize === "lg" ? (
                <i className="ri-menu-2-line"></i>
              ) : (
                <i className="ri-arrow-right-line" style={{ fontSize: 28 }}></i>
              )}
            </button>

            <form className="app-search d-none d-md-block">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  autoComplete="off"
                  id="search-options"
                />
                <span className="mdi mdi-magnify search-widget-icon" />
                <span
                  className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                  id="search-close-options"
                />
              </div>

              <div
                className="dropdown-menu dropdown-menu-lg"
                id="search-dropdown"
              >
                <div data-simplebar style={{ maxHeight: "320px" }}>
                  <div className="dropdown-header">
                    <h6 className="text-overflow text-muted mb-0 text-uppercase">
                      Recent Searches
                    </h6>
                  </div>
                  <div className="dropdown-item bg-transparent text-wrap">
                    <Link
                      to="/"
                      className="btn btn-soft-secondary btn-sm rounded-pill"
                    >
                      how to setup <i className="mdi mdi-magnify ms-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="d-flex align-items-center">
            <div className="dropdown d-md-none topbar-head-dropdown header-item">
              <button
                type="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle shadow-none"
                data-bs-toggle="dropdown"
                aria-label="Search"
              >
                <i className="bx bx-search fs-22" />
              </button>
            </div>

            <div className="dropdown ms-1 topbar-head-dropdown header-item">
              <button
                type="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle shadow-none"
                data-bs-toggle="dropdown"
                aria-label="Language"
              >
                <img
                  src="assets/images/flags/us.svg"
                  alt="user-dt"
                  height="18"
                  className="rounded"
                />
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <button
                  type="button"
                  className="dropdown-item notify-item py-2"
                >
                  <span className="align-middle">English</span>
                </button>
              </div>
            </div>

            <div className="ms-1 header-item d-none d-sm-flex">
              <button
                type="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle shadow-none"
                aria-label="Fullscreen"
                onClick={() =>
                  document.fullscreenElement
                    ? document.exitFullscreen()
                    : document.documentElement.requestFullscreen()
                }
              >
                <i className="bx bx-fullscreen fs-22" />
              </button>
            </div>

            {isAuthenticated && user ? (
              <div className="dropdown ms-sm-3 header-item topbar-user">
                <button
                  type="button"
                  className="btn shadow-none"
                  id="page-header-user-dropdown"
                  data-bs-toggle="dropdown"
                >
                  <span className="d-flex align-items-center">
                    <img
                      className="rounded-circle header-profile-user"
                      src={DEFAULT_AVATAR}
                      alt="Header Avatar"
                    />
                    <span className="text-start ms-xl-2">
                      <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text user-name-display">
                        {user?.name || user?.fullName || "Nguyễn Văn A"}
                      </span>
                      <span className="d-none d-xl-block ms-1 fs-12 user-name-sub-text">
                        {user?.role || "Manager"}
                      </span>
                    </span>
                  </span>
                </button>
                <div
                  className="dropdown-menu dropdown-menu-end"
                  data-testid="user-profile-menu"
                >
                  <h6 className="dropdown-header">
                    Welcome {user?.name || "User"}!
                  </h6>
                  <Link className="dropdown-item" to="/profile">
                    <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1" />
                    <span className="align-middle">Profile</span>
                  </Link>
                  <Link className="dropdown-item" to="/settings">
                    <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1" />
                    <span className="align-middle">Settings</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    <i className="mdi mdi-logout text-muted fs-16 align-middle me-1" />
                    <span className="align-middle">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-sm-3">
                <Link to="/login" className="btn btn-outline-primary btn-md">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary btn-md">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
