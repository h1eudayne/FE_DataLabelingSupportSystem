import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import UserHeader from "../home/UserHeader";

const MainLayouts = () => {
  const [sidebarSize, setSidebarSize] = useState("lg");
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    document.body.setAttribute("data-layout", "vertical");
    document.body.setAttribute("data-sidebar", "dark");
    document.body.setAttribute("data-sidebar-size", sidebarSize);

    return () => {
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

      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayouts;
