import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Dropdown, Button, Badge } from "react-bootstrap";
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
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "@/store/auth/auth.thunk";
import { getUserProfile, resolveGlobalBanRequest } from "../../services/admin/managementUsers/user.api";
import { updateUser } from "../../store/auth/auth.slice";
import { resolveBackendAssetUrl } from "../../config/runtime";
import useNotifications from "../../hooks/useNotifications";
import { disconnect as disconnectSignalR } from "../../services/signalrManager";
import { toast } from "react-toastify";
import GlobalBanDecisionModal from "./GlobalBanDecisionModal";
import { formatLocalDateTime } from "../../utils/dateTime";
import {
  buildResolvedGlobalBanNotificationPatch,
  getGlobalBanNotificationKey,
  getGlobalBanProjectKey,
  getSafeGlobalBanErrorMessage,
  getGlobalBanProjects,
  isPendingGlobalBanNotification,
} from "../../utils/globalBanNotifications";

const getLanguageCode = (language) =>
  language?.toLowerCase().startsWith("en") ? "en" : "vi";

const HEADER_LOGOS = {
  lightLarge:
    "https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png",
  darkLarge:
    "https://res.cloudinary.com/deu3ur8w9/image/upload/v1773346453/logo-darkmode_txjdzq.png",
};

const Header = ({
  toggleSidebar,
  sidebarSize,
  isMobile = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, unreadNotifications } = useSelector((state) => state.auth);
  const { t, i18n } = useTranslation();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [banDecisionModal, setBanDecisionModal] = useState({
    show: false,
    decision: "approve",
    decisionNote: "",
    notification: null,
  });
  const [banDecisionLoading, setBanDecisionLoading] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateNotification,
    clearAll,
    refreshNotifications,
  } =
    useNotifications(user?.id, unreadNotifications);
  const displayNotifications = useMemo(() => {
    const seenPendingGlobalBanRequests = new Set();

    return notifications.filter((notification) => {
      if (!isPendingGlobalBanNotification(notification)) {
        return true;
      }

      const requestKey = getGlobalBanNotificationKey(notification);
      if (!requestKey) {
        return true;
      }

      if (seenPendingGlobalBanRequests.has(requestKey)) {
        return false;
      }

      seenPendingGlobalBanRequests.add(requestKey);
      return true;
    });
  }, [notifications]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const languageOptions = {
    vi: {
      code: "vi",
      flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg",
      label: t("header.languages.vietnamese"),
    },
    en: {
      code: "en",
      flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg",
      label: t("header.languages.english"),
    },
  };

  const currentLang = getLanguageCode(
    i18n.resolvedLanguage || i18n.language || localStorage.getItem("i18nLang"),
  );
  const currentLanguage = languageOptions[currentLang] || languageOptions.vi;

  
  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLanguageChange = (languageCode) => {
    localStorage.setItem("i18nLang", languageCode);
    i18n.changeLanguage(languageCode);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSelf = async () => {
      try {
        const res = await getUserProfile();
        dispatch(updateUser(res.data));
      } catch (error) {
        console.error(error);
      }
    };

    fetchSelf();
  }, [dispatch, isAuthenticated]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk());
    } finally {
      disconnectSignalR();
      navigate("/login", { replace: true });
    }
  };

  const openBanDecisionModal = (notification, decision = "approve") => {
    setBanDecisionModal({
      show: true,
      decision,
      decisionNote: notification?.metadata?.decisionNote || "",
      notification,
    });
  };

  const closeBanDecisionModal = (force = false) => {
    if (banDecisionLoading && !force) {
      return;
    }

    setBanDecisionModal({
      show: false,
      decision: "approve",
      decisionNote: "",
      notification: null,
    });
  };

  const handleResolveBanRequest = async () => {
    const requestId = banDecisionModal.notification?.metadata?.banRequestId;

    if (!requestId) {
      toast.error(t("header.globalBanInvalidRequest"));
      return;
    }

    const normalizedDecisionNote = banDecisionModal.decisionNote.trim();
    const approve = banDecisionModal.decision === "approve";

    if (!approve && !normalizedDecisionNote) {
      toast.error(t("header.globalBanRejectNoteRequired"));
      return;
    }

    setBanDecisionLoading(true);

    try {
      await resolveGlobalBanRequest(requestId, approve, normalizedDecisionNote);
      updateNotification(
        banDecisionModal.notification?.id,
        buildResolvedGlobalBanNotificationPatch(
          banDecisionModal.notification,
          approve,
          normalizedDecisionNote,
        ),
      );
      markAsRead(banDecisionModal.notification?.id);
      await refreshNotifications();
      window.dispatchEvent(new Event("notifications:refresh"));
      toast.success(
        approve
          ? t("header.globalBanApproveSuccess")
          : t("header.globalBanRejectSuccess"),
      );
      closeBanDecisionModal(true);
    } catch (error) {
      if (/already been resolved/i.test(error?.response?.data?.message || "")) {
        await refreshNotifications();
        window.dispatchEvent(new Event("notifications:refresh"));
        closeBanDecisionModal(true);
      }

      toast.error(getSafeGlobalBanErrorMessage(error, t("header.globalBanActionFailed")));
    } finally {
      setBanDecisionLoading(false);
    }
  };

  const popperConfig = {
    modifiers: [
      { name: "offset", options: { offset: [0, 50] } },
    ],
  };

  return (
    <>
      <style>{`
        .hide-extra-icon::after, .hide-extra-icon::before { display: none !important; content: none !important; }
        .no-caret::after { display: none !important; }

        .custom-toggle-btn {
          background-color: #f5f7ff !important;
          border: 1px solid rgba(78, 115, 223, 0.08) !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
          transition: all 0.25s ease !important;
        }
        .custom-toggle-btn:hover {
          background-color: #ecf2ff !important;
          transform: translateY(-1px);
        }
        .custom-toggle-btn.is-active {
          background-color: #e7efff !important;
          border-color: rgba(78, 115, 223, 0.18) !important;
        }
        .custom-toggle-btn .toggle-icon {
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .custom-toggle-btn:hover .toggle-icon,
        .custom-toggle-btn.is-active .toggle-icon {
          color: #405189 !important;
          transform: scale(0.96);
        }

        .header-mobile-brand {
          display: inline-flex;
          align-items: center;
          min-width: 0;
          padding: 4px 0;
        }
        .header-mobile-brand img {
          display: block;
          width: auto;
          height: 34px;
          max-width: min(42vw, 170px);
          object-fit: contain;
        }

        .app-header .dropdown-menu {
          transform: none !important;
          margin-top: 55px !important;
          border: none;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 1060;
        }
        .app-header .dropdown-menu.show {
          animation: dropdownFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-6px) !important; }
          to { opacity: 1; transform: translateY(0) !important; }
        }

        @media (max-width: 991.98px) {
          .header-mobile-brand img {
            height: 32px;
            max-width: min(40vw, 150px);
          }

          .app-header .dropdown-menu {
            position: fixed !important;
            top: 74px !important;
            right: 12px !important;
            left: auto !important;
            margin-top: 0 !important;
            max-width: calc(100vw - 24px);
          }
        }

        .theme-toggle-btn { transition: all 0.2s ease; }
        .theme-toggle-btn:hover { background-color: #f8f9fa !important; }

        .avatar-wrapper { position: relative; }
        .status-indicator {
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px; background-color: #22c55e;
          border: 2px solid #fff; border-radius: 50%;
        }

        .header-dropdown .dropdown-item {
          margin: 0 8px; width: calc(100% - 16px);
          border-radius: 6px; transition: 0.2s ease;
        }
        .header-dropdown .dropdown-item:hover {
          background-color: #f4f6ff !important;
          color: #4e73df !important;
          transform: translateX(4px);
        }

        .pulse-animation { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }

        [data-bs-theme="dark"] .app-header {
          background-color: #1E293B !important;
          border-color: #334155 !important;
          backdrop-filter: blur(16px);
        }

        [data-bs-theme="dark"] .custom-toggle-btn {
          background-color: #1F2937 !important;
          border: 1px solid #334155 !important;
          box-shadow: none;
        }
        [data-bs-theme="dark"] .custom-toggle-btn:hover {
          background-color: rgba(59, 130, 246, 0.14) !important;
          border-color: rgba(59, 130, 246, 0.28) !important;
        }
        [data-bs-theme="dark"] .custom-toggle-btn.is-active {
          background-color: rgba(59, 130, 246, 0.16) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
        }
        [data-bs-theme="dark"] .custom-toggle-btn .toggle-icon {
          color: #94A3B8 !important;
        }
        [data-bs-theme="dark"] .custom-toggle-btn:hover .toggle-icon,
        [data-bs-theme="dark"] .custom-toggle-btn.is-active .toggle-icon {
          color: #BFDBFE !important;
        }
        [data-bs-theme="dark"] .theme-toggle-btn:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        [data-bs-theme="dark"] .btn-light.bg-transparent {
          color: #94A3B8 !important;
        }
        [data-bs-theme="dark"] .btn-light.bg-transparent:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #3B82F6 !important;
        }

        [data-bs-theme="dark"] .status-indicator {
          border-color: #1E293B !important;
        }

        [data-bs-theme="dark"] .avatar-wrapper img {
          border-color: #334155 !important;
        }

        [data-bs-theme="dark"] .header-user-name {
          color: #E2E8F0 !important;
        }

        [data-bs-theme="dark"] .dropdown-menu-animated {
          background: rgba(30, 41, 59, 0.95) !important;
          border: 1px solid rgba(51, 65, 85, 0.5) !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4) !important;
        }

        [data-bs-theme="dark"] .header-dropdown .dropdown-item:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #3B82F6 !important;
        }

        [data-bs-theme="dark"] .pulse-animation {
          border-color: #1E293B !important;
        }

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
          left: isMobile ? 0 : sidebarSize === "lg" ? "250px" : "70px",
          width: isMobile
            ? "100%"
            : `calc(100% - ${sidebarSize === "lg" ? "250px" : "70px"})`,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Container fluid className="h-100 px-2 px-sm-3 px-lg-4">
          <div className="d-flex justify-content-between align-items-center h-100">
            <div
              className={`d-flex align-items-center ${isMobile ? "flex-grow-1 pe-2" : "gap-3"}`}
            >
              {!isMobile && (
                <Button
                  id="topnav-hamburger-icon"
                  onClick={toggleSidebar}
                  type="button"
                  variant="light"
                  aria-label={t("navbar.openMenu")}
                  className="d-flex align-items-center justify-content-center p-0 border-0 custom-toggle-btn shadow-none"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  {sidebarSize !== "lg" ? (
                    <ChevronRight
                      size={20}
                      className="toggle-icon text-primary"
                    />
                  ) : (
                    <Menu size={20} className="toggle-icon text-primary" />
                  )}
                </Button>
              )}

              {isMobile && (
                <div
                  className="header-mobile-brand"
                >
                  <img
                    src={isDarkMode ? HEADER_LOGOS.darkLarge : HEADER_LOGOS.lightLarge}
                    alt={t("common.logo")}
                  />
                </div>
              )}
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
                className="d-none d-sm-inline-flex bg-transparent border-0 p-2 shadow-none rounded-circle"
                onClick={handleFullscreen}
                aria-label={t("header.fullscreen")}
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
                    src={currentLanguage.flag}
                    width="22"
                    className="rounded-1 shadow-sm"
                    alt={t("header.language")}
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
                    onClick={() => handleLanguageChange("vi")}
                    className="d-flex align-items-center gap-2 py-2"
                  >
                    <img
                      src={languageOptions.vi.flag}
                      width="20"
                      alt={languageOptions.vi.label}
                    />{" "}
                    {languageOptions.vi.label}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleLanguageChange("en")}
                    className="d-flex align-items-center gap-2 py-2"
                  >
                    <img
                      src={languageOptions.en.flag}
                      width="20"
                      alt={languageOptions.en.label}
                    />{" "}
                    {languageOptions.en.label}
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
                    width: isMobile ? "calc(100vw - 24px)" : undefined,
                    minWidth: isMobile ? "0" : "340px",
                    maxWidth: "340px",
                    maxHeight: "420px",
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
                      {displayNotifications.length > 0 && (
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
                    {displayNotifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <Bell size={32} className="mb-2 opacity-25" />
                        <p className="small mb-0">{t("header.noNotifications")}</p>
                      </div>
                    ) : (
                      displayNotifications.map((n) => {
                        const pendingGlobalBan = isPendingGlobalBanNotification(n);
                        const globalBanProjects = getGlobalBanProjects(n);
                        const requestStatus = n?.metadata?.requestStatus;
                        const decisionNote = n?.metadata?.decisionNote?.trim();

                        return (
                          <Dropdown.Item
                            key={n.id}
                            onClick={() => {
                              if (pendingGlobalBan) {
                                openBanDecisionModal(n);
                                return;
                              }

                              markAsRead(n.id);
                            }}
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
                                <div className="d-flex align-items-start justify-content-between gap-2">
                                  <div className="d-flex flex-column gap-1">
                                    <div className="small fw-semibold text-wrap">
                                      {n.message}
                                    </div>
                                    {n?.metadata?.targetUserName && (
                                      <div className="small text-muted">
                                        {t("header.globalBanSubjectSummary", {
                                          userName: n.metadata.targetUserName,
                                          role: n.metadata.targetUserRole || t("header.defaultRole"),
                                        })}
                                      </div>
                                    )}
                                    {n?.metadata?.requestedByAdminName && (
                                      <div className="small text-muted">
                                        {t("header.globalBanRequesterSummary", {
                                          adminName: n.metadata.requestedByAdminName,
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  <div className="d-flex flex-column align-items-end gap-1">
                                    {pendingGlobalBan && (
                                      <Badge bg="warning" text="dark" pill>
                                        {t("header.approvalRequired")}
                                      </Badge>
                                    )}
                                    {!pendingGlobalBan && requestStatus === "Approved" && (
                                      <Badge bg="success" pill>
                                        {t("header.approved")}
                                      </Badge>
                                    )}
                                    {!pendingGlobalBan && requestStatus === "Rejected" && (
                                      <Badge bg="secondary" pill>
                                        {t("header.rejected")}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {globalBanProjects.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-muted fw-semibold" style={{ fontSize: "10px" }}>
                                      {t("header.globalBanProjects")}
                                    </div>
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                      {globalBanProjects.map((project, index) => (
                                        <span
                                          key={getGlobalBanProjectKey(project, index, n.id)}
                                          className="badge bg-light text-dark border"
                                          style={{ fontSize: "10px" }}
                                        >
                                          {project.name ||
                                            (project.id
                                              ? `${t("header.globalBanUnknownProject")} #${project.id}`
                                              : t("header.globalBanUnknownProject"))}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {pendingGlobalBan && (
                                  <div className="mt-2 small text-muted">
                                    {t("header.globalBanDecisionRequiredNote")}
                                  </div>
                                )}

                                {requestStatus && !pendingGlobalBan && (
                                  <div className="mt-2 text-muted" style={{ fontSize: "10px" }}>
                                    {requestStatus === "Approved"
                                      ? t("header.globalBanResolvedApproved")
                                      : t("header.globalBanResolvedRejected")}
                                  </div>
                                )}

                                {decisionNote && !pendingGlobalBan && (
                                  <div className="mt-2 small text-muted">
                                    <span className="fw-semibold">{t("header.globalBanDecisionNote")}:</span>{" "}
                                    {decisionNote}
                                  </div>
                                )}

                                {pendingGlobalBan && (
                                  <div className="mt-2 d-flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      className="py-1 px-2"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openBanDecisionModal(n);
                                      }}
                                    >
                                      {t("header.globalBanReviewRequestCta")}
                                    </Button>
                                  </div>
                                )}

                                <div
                                  className="text-muted d-flex align-items-center gap-1 mt-2"
                                  style={{ fontSize: "10px" }}
                                >
                                  <Clock size={10} />
                                  {formatLocalDateTime(
                                    n.timestamp,
                                    i18n.language === "vi" ? "vi-VN" : "en-US",
                                  )}
                                </div>
                              </div>
                            </div>
                          </Dropdown.Item>
                        );
                      })
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
                            ? resolveBackendAssetUrl(user.avatarUrl)
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                        }
                        className="rounded-circle shadow-sm border border-2 border-white"
                        width="36"
                        height="36"
                        alt={t("header.avatarAlt")}
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
                      minWidth: isMobile ? "200px" : "210px",
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
                        {user?.email || t("header.noEmail")}
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
      <GlobalBanDecisionModal
        show={banDecisionModal.show}
        onHide={() => closeBanDecisionModal()}
        onSubmit={handleResolveBanRequest}
        loading={banDecisionLoading}
        notification={banDecisionModal.notification}
        decision={banDecisionModal.decision}
        decisionNote={banDecisionModal.decisionNote}
        onDecisionChange={(nextDecision) =>
          setBanDecisionModal((prev) => ({
            ...prev,
            decision: nextDecision,
          }))
        }
        onDecisionNoteChange={(nextNote) =>
          setBanDecisionModal((prev) => ({
            ...prev,
            decisionNote: nextNote,
          }))
        }
      />
    </>
  );
};

export default Header;
