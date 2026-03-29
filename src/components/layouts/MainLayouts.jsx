import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";
import Navbar from "./Navbar";
import MobileQuickNav from "./MobileQuickNav";

const MOBILE_BREAKPOINT = 992;
const FLUSH_LAYOUT_PREFIXES = [
  "/settings-user-management",
  "/settings-system-logs",
  "/projects-overview",
  "/view-detail-project/",
  "/project-detail/",
  "/workplace-labeling-task/",
  "/reviewer/review-workspace/",
];

const getIsMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

const MainLayouts = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [sidebarSize, setSidebarSize] = useState("lg");
  const [isMobile, setIsMobile] = useState(getIsMobileViewport);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isFlushLayout =
    FLUSH_LAYOUT_PREFIXES.some((prefix) => location.pathname.startsWith(prefix)) ||
    (location.pathname === "/dashboard" && user?.role === "Admin");

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = getIsMobileViewport();
      setIsMobile(nextIsMobile);
      setIsMobileSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-layout", "vertical");
    const currentTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute(
      "data-sidebar",
      currentTheme === "dark" ? "dark" : "light",
    );
    document.body.setAttribute("data-sidebar-size", isMobile ? "lg" : sidebarSize);
    document.body.classList.toggle("layout-mobile", isMobile);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-bs-theme") {
          const theme = document.documentElement.getAttribute("data-bs-theme");
          document.body.setAttribute(
            "data-sidebar",
            theme === "dark" ? "dark" : "light",
          );
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-bs-theme"],
    });

    return () => {
      observer.disconnect();
      document.body.removeAttribute("data-layout");
      document.body.removeAttribute("data-sidebar-size");
      document.body.removeAttribute("data-sidebar");
      document.body.classList.remove("sidebar-enable");
      document.body.classList.remove("layout-mobile");
    };
  }, [isMobile, sidebarSize]);

  useEffect(() => {
    document.body.classList.toggle(
      "sidebar-enable",
      isMobile && isMobileSidebarOpen,
    );

    return () => {
      document.body.classList.remove("sidebar-enable");
    };
  }, [isMobile, isMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileSidebarOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
      return;
    }

    setSidebarSize((prev) => (prev === "lg" ? "sm-hover" : "lg"));
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div id="layout-wrapper">
      <Header
        toggleSidebar={toggleSidebar}
        sidebarSize={sidebarSize}
        isMobile={isMobile}
      />

      <Navbar isMobile={isMobile} onCloseMobileMenu={closeMobileSidebar} />

      <div
        className="vertical-overlay"
        onClick={closeMobileSidebar}
      ></div>

      <div className="main-content" style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <div
          className={`page-content ${isFlushLayout ? "page-content--flush-shell" : ""}`}
          style={{ minHeight: "calc(100vh - 70px)" }}
        >
          <div
            className={`layout-content-shell ${isFlushLayout ? "layout-content-shell--flush" : ""}`}
          >
            <Outlet />
          </div>
        </div>
      </div>

      {isMobile && (
        <MobileQuickNav
          onOpenMenu={toggleSidebar}
          isSidebarOpen={isMobileSidebarOpen}
        />
      )}
    </div>
  );
};

export default MainLayouts;
