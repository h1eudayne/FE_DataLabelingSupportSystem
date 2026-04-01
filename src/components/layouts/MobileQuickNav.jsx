import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const MobileQuickNav = ({ onOpenMenu, isSidebarOpen = false }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const items = useMemo(() => {
    if (role === "Admin") {
      return [
        {
          key: "dashboard",
          to: "/dashboard",
          icon: "ri-dashboard-2-line",
          label: t("navbar.dashboard"),
        },
        {
          key: "projects-overview",
          to: "/projects-overview",
          icon: "ri-stack-fill",
          label: t("navbar.projects-overview"),
        },
        {
          key: "users",
          to: "/settings-user-management",
          icon: "ri-user-settings-line",
          label: t("navbar.userManagement"),
        },
      ];
    }

    if (role === "Manager") {
      return [
        {
          key: "dashboard",
          to: "/dashboard",
          icon: "ri-dashboard-2-line",
          label: t("navbar.dashboard"),
        },
        {
          key: "projects",
          to: "/projects-all-projects",
          icon: "ri-stack-fill",
          label: t("navbar.projects"),
        },
        {
          key: "profile",
          to: "/profile",
          icon: "ri-settings-4-line",
          label: t("navbar.settingsMenu"),
        },
      ];
    }

    if (role === "Annotator") {
      return [
        {
          key: "dashboard",
          to: "/dashboard",
          icon: "ri-home-4-line",
          label: t("navbar.dashboard"),
        },
        {
          key: "tasks",
          to: "/annotator-my-tasks",
          icon: "ri-task-line",
          label: t("navbar.myTask"),
        },
      ];
    }

    if (role === "Reviewer") {
      return [
        {
          key: "dashboard",
          to: "/dashboard",
          icon: "ri-home-4-line",
          label: t("navbar.dashboard"),
        },
        {
          key: "review-task",
          to: "/reviewer/review-task/",
          icon: "ri-shield-check-line",
          label: t("navbar.myTask"),
        },
        {
          key: "profile",
          to: "/profile",
          icon: "ri-settings-4-line",
          label: t("navbar.settingsMenu"),
        },
      ];
    }

    return [];
  }, [role, t]);

  if (items.length === 0) return null;

  return (
    <nav className="mobile-quick-nav" aria-label={t("navbar.mobileNavigation")}>
      {items.map((item) => {
        const isActive =
          item.to === "/"
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

        return (
          <Link
            key={item.key}
            to={item.to}
            className={`mobile-quick-nav-item ${isActive ? "active" : ""}`}
          >
            <i className={`${item.icon} mobile-quick-nav-icon`}></i>
            <span className="mobile-quick-nav-label">{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        aria-label={isSidebarOpen ? t("navbar.closeMenu") : t("navbar.openMenu")}
        className={`mobile-quick-nav-item mobile-quick-nav-menu ${
          isSidebarOpen ? "active" : ""
        }`}
        onClick={onOpenMenu}
      >
        <i
          className={`${
            isSidebarOpen ? "ri-close-line" : "ri-menu-line"
          } mobile-quick-nav-icon`}
        ></i>
        <span className="mobile-quick-nav-label">
          {isSidebarOpen ? t("common.close") : t("common.menu")}
        </span>
      </button>
    </nav>
  );
};

export default MobileQuickNav;
