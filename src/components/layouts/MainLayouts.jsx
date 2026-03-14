import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";

const MainLayouts = () => {
  const [sidebarSize, setSidebarSize] = useState("lg");

  useEffect(() => {
    document.body.setAttribute("data-layout", "vertical");
    const currentTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute(
      "data-sidebar",
      currentTheme === "dark" ? "dark" : "light",
    );
    document.body.setAttribute("data-sidebar-size", sidebarSize);

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
    };
  }, [sidebarSize]);

  const toggleSidebar = () => {
    setSidebarSize((prev) => (prev === "lg" ? "sm-hover" : "lg"));
  };

  return (
    <div id="layout-wrapper">
      <Header toggleSidebar={toggleSidebar} sidebarSize={sidebarSize} />

      <Navbar />

      <div
        className="vertical-overlay"
        onClick={() => {
          document.body.classList.remove("sidebar-enable");
        }}
      ></div>

      <div className="main-content" style={{ minHeight: "100vh" }}>
        <div
          className="page-content"
          style={{ minHeight: "calc(100vh - 70px)" }}
        >
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayouts;
