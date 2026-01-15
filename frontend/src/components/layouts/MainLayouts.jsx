import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayouts = () => {
  const [sidebarSize, setSidebarSize] = useState("lg");

  useEffect(() => {
    document.body.setAttribute("data-layout", "vertical");
    document.body.setAttribute("data-sidebar-size", sidebarSize);
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
