import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Container, Dropdown, Form, InputGroup, Button, Badge } from "react-bootstrap";
import {
  LogOut,
  User,
  Settings,
  Bell,
  Check,
  Trash2,
  Clock,
  Menu,
  Maximize,
  Minimize,
  Search,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/auth/auth.slice";
import { getUserProfile } from "../../services/admin/managementUsers/user.api";
import { updateUser } from "../../store/auth/auth.slice";
import { BACKEND_URL } from "../../services/axios.customize";
import useNotifications from "../../hooks/useNotifications";

const Header = ({ toggleSidebar, sidebarSize }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { t, i18n } = useTranslation();

  const [userData, setUserData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem("i18nLang") || "vi";
    return saved === "en"
      ? { code: "en", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg", name: "English" }
      : { code: "vi", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg", name: "Tiếng Việt" };
  });

  // Apply theme to <html> and persist
  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const fetchSelf = async () => {
    try {
      const res = await getUserProfile();
      dispatch(updateUser(res.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSelf();
    }
  }, [isAuthenticated]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const popperConfig = {
    modifiers: [{ name: "offset", options: { offset: [0, 25] } }],
  };

  return (
    <>
      <style>{`
        /* ── Base resets ── */
        .hide-extra-icon::after, .hide-extra-icon::before { display: none !important; content: none !important; }
        .no-caret::after { display: none !important; }

        /* ── Toggle sidebar button ── */
        .custom-toggle-btn {
          background-color: #f5f7ff !important;
          border-radius: 10px !important;
          transition: all 0.3s ease !important;
        }
        .custom-toggle-btn:hover {
          background-color: #4e73df !important;
          transform: rotate(90deg);
        }
        .custom-toggle-btn:hover .toggle-icon { color: white !important; }

        /* ── Dropdown animation ── */
        .dropdown-menu-animated {
          display: block !important; visibility: hidden; opacity: 0;
          transform: translateY(10px); transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dropdown-menu-animated.show { visibility: visible; opacity: 1; transform: translateY(0); }

        /* ── Theme toggle ── */
        .theme-toggle-btn { transition: all 0.2s ease; }
        .theme-toggle-btn:hover { background-color: #f8f9fa !important; }

        /* ── Avatar ── */
        .avatar-wrapper { position: relative; }
        .status-indicator {
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px; background-color: #22c55e;
          border: 2px solid #fff; border-radius: 50%;
        }

        /* ── Header dropdown items ── */
        .header-dropdown .dropdown-item {
          margin: 0 8px; width: calc(100% - 16px);
          border-radius: 6px; transition: 0.2s ease;
        }
        .header-dropdown .dropdown-item:hover {
          background-color: #f4f6ff !important;
          color: #4e73df !important;
          transform: translateX(4px);
        }

        /* ── Notification pulse ── */
        .pulse-animation { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }

        /* ================================================================
           DARK MODE - Stitch Design System Overrides
           ================================================================ */

        /* Header container */
        [data-bs-theme="dark"] .app-header {
          background-color: #1E293B !important;
          border-color: #334155 !important;
          backdrop-filter: blur(16px);
        }

        /* Toggle sidebar button */
        [data-bs-theme="dark"] .custom-toggle-btn {
          background-color: #1F2937 !important;
          border: 1px solid #334155 !important;
        }
        [data-bs-theme="dark"] .custom-toggle-btn:hover {
          background-color: #3B82F6 !important;
          border-color: #3B82F6 !important;
        }
        [data-bs-theme="dark"] .custom-toggle-btn .toggle-icon {
          color: #94A3B8 !important;
        }

        /* Search input */
        [data-bs-theme="dark"] .header-search-input {
          background-color: #1F2937 !important;
          border: 1px solid #334155 !important;
        }
        [data-bs-theme="dark"] .header-search-input .form-control {
          color: #E2E8F0 !important;
        }
        [data-bs-theme="dark"] .header-search-input .form-control::placeholder {
          color: #64748B !important;
        }

        /* Theme toggle */
        [data-bs-theme="dark"] .theme-toggle-btn:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        /* Icon buttons */
        [data-bs-theme="dark"] .btn-light.bg-transparent {
          color: #94A3B8 !important;
        }
        [data-bs-theme="dark"] .btn-light.bg-transparent:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #3B82F6 !important;
        }

        /* Status indicator in dark mode */
        [data-bs-theme="dark"] .status-indicator {
          border-color: #1E293B !important;
        }

        /* Avatar border */
        [data-bs-theme="dark"] .avatar-wrapper img {
          border-color: #334155 !important;
        }

        /* User name */
        [data-bs-theme="dark"] .header-user-name {
          color: #E2E8F0 !important;
        }

        /* Dropdown glassmorphism */
        [data-bs-theme="dark"] .dropdown-menu-animated {
          background: rgba(30, 41, 59, 0.95) !important;
          border: 1px solid rgba(51, 65, 85, 0.5) !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4) !important;
        }

        /* Dropdown items in dark mode */
        [data-bs-theme="dark"] .header-dropdown .dropdown-item:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #3B82F6 !important;
        }

        /* Notification badge in dark mode */
        [data-bs-theme="dark"] .pulse-animation {
          border-color: #1E293B !important;
        }

        /* Vertical divider */
        [data-bs-theme="dark"] .vr {
          background-color: #475569 !important;
          opacity: 0.4 !important;
        }
      `}</style>

      <header
        className="border-bottom shadow-sm position-fixed top-0 end-0 app-header"
        style={{
          zIndex: 1001,
          height: "70px",
          left: sidebarSize === "lg" ? "250px" : "70px",
          width: `calc(100% - ${sidebarSize === "lg" ? "250px" : "70px"})`,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Container fluid className="h-100 px-4">
          <div className="d-flex justify-content-between align-items-center h-100">
            <div className="d-flex align-items-center gap-3">
              <Button
                id="topnav-hamburger-icon"
                onClick={toggleSidebar}
                variant="light"
                className="d-flex align-items-center justify-content-center p-0 border-0 custom-toggle-btn shadow-none"
                style={{ width: "40px", height: "40px" }}
              >
                {sidebarSize === "sm" ? (
                  <ChevronRight
                    size={20}
                    className="toggle-icon text-primary"
                  />
                ) : (
                  <Menu size={20} className="toggle-icon text-primary" />
                )}
              </Button>

              <Form className="d-none d-md-block ms-2">
                <InputGroup
                  size="sm"
                  className="rounded-pill px-3 py-1 border-0 header-search-input"
                >
                  <Search size={16} className="text-muted me-2" />
                  <Form.Control
                    className="bg-transparent border-0 shadow-none p-0"
                    placeholder={t("header.search")}
                    style={{ width: "180px" }}
                  />
                </InputGroup>
              </Form>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button
                variant="light"
                className="bg-transparent border-0 p-2 shadow-none rounded-circle theme-toggle-btn"
                onClick={toggleTheme}
              >
                {isDarkMode ? (
                  <Sun size={20} className="text-warning" fill="currentColor" />
                ) : (
                  <Moon size={20} className="text-muted" fill="none" />
                )}
              </Button>

              <Button
                variant="light"
                className="bg-transparent border-0 p-2 shadow-none rounded-circle"
                onClick={handleFullscreen}
                aria-label="Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize size={20} className="text-muted" />
                ) : (
                  <Maximize size={20} className="text-muted" />
                )}
              </Button>

              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  className="d-flex align-items-center gap-1 p-1 border-0 bg-transparent shadow-none hide-extra-icon"
                >
                  <img
                    src={currentLang.flag}
                    width="22"
                    className="rounded-1 shadow-sm"
                    alt="flag"
                  />
                  <ChevronDown
                    size={12}
                    className="text-muted"
                    strokeWidth={2}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  align="end"
                  className="shadow-lg border-0 dropdown-menu-animated"
                  popperConfig={popperConfig}
                >
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage("vi");
                      setCurrentLang({
                        code: "vi",
                        name: "Tiếng Việt",
                        flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg",
                      });
                    }}
                    className="d-flex align-items-center gap-2 py-2"
                  >
                    <img
                      src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg"
                      width="20"
                      alt="VN"
                    />{" "}
                    Tiếng Việt
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      i18n.changeLanguage("en");
                      setCurrentLang({
                        code: "en",
                        name: "English",
                        flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg",
                      });
                    }}
                    className="d-flex align-items-center gap-2 py-2"
                  >
                    <img
                      src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg"
                      width="20"
                      alt="US"
                    />{" "}
                    English
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="bg-transparent border-0 p-2 position-relative shadow-none rounded-circle hide-extra-icon"
                >
                  <Bell size={20} className="text-muted" />
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute pulse-animation"
                      style={{
                        top: "2px",
                        right: "2px",
                        fontSize: "9px",
                        minWidth: "16px",
                        padding: "2px 4px",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  align="end"
                  className="shadow-lg border-0 py-0 dropdown-menu-animated"
                  style={{
                    borderRadius: "12px",
                    minWidth: "340px",
                    maxHeight: "420px",
                    marginTop: "15px",
                  }}
                  popperConfig={popperConfig}
                >
                  <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-bold small">{t("header.notifications")}</span>
                    <div className="d-flex gap-1">
                      {unreadCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-primary text-decoration-none"
                          onClick={markAllAsRead}
                          title={t("header.markAllRead")}
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      {notifications.length > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-muted text-decoration-none ms-2"
                          onClick={clearAll}
                          title={t("header.clearAll")}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <Bell size={32} className="mb-2 opacity-25" />
                        <p className="small mb-0">{t("header.noNotifications")}</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Dropdown.Item
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`py-2 px-3 border-bottom ${
                            !n.read ? "bg-light" : ""
                          }`}
                          style={{ whiteSpace: "normal" }}
                        >
                          <div className="d-flex align-items-start gap-2">
                            <div
                              className={`rounded-circle mt-1 flex-shrink-0 ${
                                !n.read ? "bg-primary" : "bg-secondary opacity-25"
                              }`}
                              style={{ width: "8px", height: "8px" }}
                            />
                            <div className="flex-grow-1">
                              <div className="small">{n.message}</div>
                              <div
                                className="text-muted d-flex align-items-center gap-1"
                                style={{ fontSize: "10px" }}
                              >
                                <Clock size={10} />
                                {new Date(n.timestamp).toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US")}
                              </div>
                            </div>
                          </div>
                        </Dropdown.Item>
                      ))
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <div
                className="vr mx-2 opacity-10 d-none d-md-block"
                style={{ height: "20px" }}
              ></div>

              {isAuthenticated && user && (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="none"
                    className="p-0 border-0 shadow-none d-flex align-items-center gap-2 no-caret"
                  >
                    <div className="avatar-wrapper">
                      <img
                        src={
                          user?.avatarUrl
                            ? user.avatarUrl.startsWith("http")
                              ? user.avatarUrl
                              : `${BACKEND_URL}${user.avatarUrl}`
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                        }
                        className="rounded-circle shadow-sm border border-2 border-white"
                        width="36"
                        height="36"
                        alt="avatar"
                      />
                      <span className="status-indicator"></span>
                    </div>
                    <div className="d-none d-lg-block text-start">
                      <div className="fw-bold small lh-1 mb-1 header-user-name">
                        {user?.fullName || t("header.defaultUser")}
                      </div>
                      <small
                        className="text-muted"
                        style={{ fontSize: "10px" }}
                      >
                        {user?.role || "Annotator"}
                      </small>
                    </div>
                    <ChevronDown
                      size={14}
                      className="text-muted ms-1"
                      strokeWidth={3}
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="end"
                    className="shadow-lg border-0 py-2 dropdown-menu-animated"
                    style={{
                      borderRadius: "12px",
                      minWidth: "210px",
                      marginTop: "15px",
                    }}
                    popperConfig={popperConfig}
                  >
                    <div className="px-3 py-2 border-bottom mb-2">
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "10px" }}
                      >
                        {t("header.account")}
                      </small>
                      <div className="fw-bold text-primary small">
                        {user?.email || "staff1@gmail.com"}
                      </div>
                    </div>
                    <Dropdown.Item
                      as={Link}
                      to="/profile"
                      className="py-2 px-3 d-flex align-items-center gap-2"
                    >
                      <User size={16} /> {t("header.profile")}
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/settings"
                      className="py-2 px-3 d-flex align-items-center gap-2"
                    >
                      <Settings size={16} /> {t("header.settings")}
                    </Dropdown.Item>
                    <Dropdown.Divider className="mx-3" />
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="py-2 px-3 text-danger fw-bold d-flex align-items-center gap-2"
                    >
                      <LogOut size={16} /> {t("header.logout")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </div>
        </Container>
      </header>
    </>
  );
};

export default Header;
