import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Thêm useLocation để làm Active Menu
import SimpleBar from "simplebar-react";
import Collapse from "react-bootstrap/Collapse";

// Import ảnh
import logoSm from "../../assets/images/logo-sm.png";
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";

const Navbar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");
  const [subMenu, setSubMenu] = useState("");
  const [isApexcharts, setIsApexcharts] = useState(false);
  const [isLevel12, setIsLevel12] = useState(false);
  const [isLevel22, setIsLevel22] = useState(false);

  const handleToggle = (menuId) => {
    setOpenMenu(openMenu === menuId ? "" : menuId);
  };

  const handleSubToggle = (subMenuId) => {
    setSubMenu(subMenu === subMenuId ? "" : subMenuId);
  };

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box">
        {/* Logo Dark */}
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
          <li className="menu-title">
            <span data-key="t-menu">Menu</span>
          </li>
          {/* Dashboard */}
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
              <i className="ri-dashboard-2-line"></i> <span>Dashboards</span>
            </a>

            <Collapse in={openMenu === "sidebarDashboards"}>
              <div>
                <div className="menu-dropdown">
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a href="#!" className="nav-link">
                        Analytics
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="#!" className="nav-link">
                        CRM
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
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
              <i className="ri-apps-2-line"></i>{" "}
              <span data-key="t-apps">Apps</span>
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
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarCalendar" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarCalendar");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarCalendar"}
                      >
                        Calendar
                      </a>
                      <Collapse in={subMenu === "sidebarCalendar"}>
                        <div>
                          <div className="menu-dropdown">
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="apps-calendar.html"
                                  className="nav-link"
                                >
                                  Main Calendar
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="apps-calendar-month-grid.html"
                                  className="nav-link"
                                >
                                  Month Grid
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>

                    <li className="nav-item">
                      <a href="apps-chat.html" className="nav-link">
                        {" "}
                        Chat{" "}
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarEcommerce" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarEcommerce");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarEcommerce"}
                      >
                        Ecommerce
                      </a>
                      <Collapse in={subMenu === "sidebarEcommerce"}>
                        <div>
                          <div
                            className={`menu-dropdown ${
                              subMenu === "sidebarEcommerce" ? "show" : ""
                            }`}
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="apps-ecommerce-products.html"
                                  className="nav-link"
                                >
                                  Products
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="apps-ecommerce-orders.html"
                                  className="nav-link"
                                >
                                  Orders
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>
          {/* Layouts */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarLayouts" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarLayouts");
              }}
              data-bs-toggle="collapse"
              aria-expanded={openMenu === "sidebarLayouts"}
            >
              <i className="ri-layout-3-line" />{" "}
              <span data-key="t-layouts">Layouts</span>{" "}
              <span className="badge badge-pill bg-danger" data-key="t-hot">
                Hot
              </span>
            </a>

            <Collapse in={openMenu === "sidebarLayouts"}>
              <div>
                <div
                  className={`menu-dropdown ${
                    openMenu === "sidebarLayouts" ? "show" : ""
                  }`}
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a
                        href="layouts-horizontal.html"
                        target="_blank"
                        className="nav-link"
                        data-key="t-horizontal"
                      >
                        Horizontal
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="layouts-detached.html"
                        target="_blank"
                        className="nav-link"
                        data-key="t-detached"
                      >
                        Detached
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="layouts-two-column.html"
                        target="_blank"
                        className="nav-link"
                        data-key="t-two-column"
                      >
                        Two Column
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="layouts-vertical-hovered.html"
                        target="_blank"
                        className="nav-link"
                        data-key="t-hovered"
                      >
                        Hovered
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>
          {/* end Dashboard Menu */}
          <li className="menu-title">
            <i className="ri-more-fill" /> <span data-key="t-pages">Pages</span>
          </li>

          {/* Authentication */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarAuth" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarAuth");
              }}
              data-bs-toggle="collapse"
              aria-expanded={openMenu === "sidebarAuth"}
            >
              <i className="ri-account-circle-line" />{" "}
              <span data-key="t-authentication">Authentication</span>
            </a>

            <Collapse in={openMenu === "sidebarAuth"}>
              <div>
                <div
                  className={`menu-dropdown ${
                    openMenu === "sidebarAuth" ? "show" : ""
                  }`}
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarSignIn" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarSignIn");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarSignIn"}
                      >
                        Sign In
                      </a>
                      <Collapse in={subMenu === "sidebarSignIn"}>
                        <div>
                          <div
                            className={`menu-dropdown ${
                              subMenu === "sidebarSignIn" ? "show" : ""
                            }`}
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="auth-signin-basic.html"
                                  className="nav-link"
                                >
                                  Basic
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="auth-signin-cover.html"
                                  className="nav-link"
                                >
                                  Cover
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>

                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarSignUp" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarSignUp");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarSignUp"}
                      >
                        Sign Up
                      </a>
                      <Collapse in={subMenu === "sidebarSignUp"}>
                        <div>
                          <div
                            className={`menu-dropdown ${
                              subMenu === "sidebarSignUp" ? "show" : ""
                            }`}
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="auth-signup-basic.html"
                                  className="nav-link"
                                >
                                  Basic
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="auth-signup-cover.html"
                                  className="nav-link"
                                >
                                  Cover
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>

                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarResetPass" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarResetPass");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarResetPass"}
                      >
                        Password Reset
                      </a>
                      <Collapse in={subMenu === "sidebarResetPass"}>
                        <div>
                          <div
                            className={`menu-dropdown ${
                              subMenu === "sidebarResetPass" ? "show" : ""
                            }`}
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="auth-pass-reset-basic.html"
                                  className="nav-link"
                                >
                                  Basic
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="auth-pass-reset-cover.html"
                                  className="nav-link"
                                >
                                  Cover
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>

                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarErrors" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarErrors");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarErrors"}
                      >
                        Errors
                      </a>
                      <Collapse in={subMenu === "sidebarErrors"}>
                        <div>
                          <div
                            className={`menu-dropdown ${
                              subMenu === "sidebarErrors" ? "show" : ""
                            }`}
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="auth-404-basic.html"
                                  className="nav-link"
                                >
                                  404 Basic
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="auth-404-cover.html"
                                  className="nav-link"
                                >
                                  404 Cover
                                </a>
                              </li>
                              <li className="nav-item">
                                <a href="auth-500.html" className="nav-link">
                                  500
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>

                    <li className="nav-item">
                      <a href="auth-logout-basic.html" className="nav-link">
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Pages */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarPages" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarPages");
              }}
              data-bs-toggle="collapse"
              aria-expanded={openMenu === "sidebarPages"}
            >
              <i className="ri-pages-line" />{" "}
              <span data-key="t-pages">Pages</span>
            </a>

            <Collapse in={openMenu === "sidebarPages"}>
              <div>
                <div
                  className={`menu-dropdown ${
                    openMenu === "sidebarPages" ? "show" : ""
                  }`}
                >
                  <ul className="nav nav-sm flex-column">
                    {/* Link đơn: Starter */}
                    <li className="nav-item">
                      <a
                        href="pages-starter.html"
                        className="nav-link"
                        data-key="t-starter"
                      >
                        Starter
                      </a>
                    </li>

                    {/* Submenu: Profile */}
                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarProfile" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarProfile");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarProfile"}
                      >
                        Profile
                      </a>
                      <Collapse in={subMenu === "sidebarProfile"}>
                        <div>
                          <div
                            className={`menu-dropdown ${
                              subMenu === "sidebarProfile" ? "show" : ""
                            }`}
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="pages-profile.html"
                                  className="nav-link"
                                >
                                  {" "}
                                  Simple Page{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="pages-profile-settings.html"
                                  className="nav-link"
                                >
                                  {" "}
                                  Settings{" "}
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>

                    <li className="nav-item">
                      <a href="pages-team.html" className="nav-link">
                        Team
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-timeline.html" className="nav-link">
                        Timeline
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-faqs.html" className="nav-link">
                        FAQs
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-pricing.html" className="nav-link">
                        Pricing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-gallery.html" className="nav-link">
                        Gallery
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-maintenance.html" className="nav-link">
                        Maintenance
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-coming-soon.html" className="nav-link">
                        Coming Soon
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-sitemap.html" className="nav-link">
                        Sitemap
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-search-results.html" className="nav-link">
                        Search Results
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-privacy-policy.html" className="nav-link">
                        Privacy Policy
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="pages-term-conditions.html" className="nav-link">
                        Term & Conditions
                      </a>
                    </li>

                    {/* Submenu: Blogs */}
                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          subMenu === "sidebarBlogs" ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubToggle("sidebarBlogs");
                        }}
                        data-bs-toggle="collapse"
                        aria-expanded={subMenu === "sidebarBlogs"}
                      >
                        <span data-key="t-blogs">Blogs</span>{" "}
                        <span
                          className="badge badge-pill bg-success"
                          data-key="t-new"
                        >
                          New
                        </span>
                      </a>
                      <Collapse in={subMenu === "sidebarBlogs"}>
                        <div>
                          <div
                            className={`menu-dropdown ${
                              subMenu === "sidebarBlogs" ? "show" : ""
                            }`}
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="pages-blog-list.html"
                                  className="nav-link"
                                >
                                  {" "}
                                  List View{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="pages-blog-grid.html"
                                  className="nav-link"
                                >
                                  {" "}
                                  Grid View{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="pages-blog-overview.html"
                                  className="nav-link"
                                >
                                  {" "}
                                  Overview{" "}
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Landing */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarLanding" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarLanding");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarLanding"}
              aria-controls="sidebarLanding"
            >
              <i className="ri-rocket-line" />{" "}
              <span data-key="t-landing">Landing</span>
            </a>

            <Collapse in={openMenu === "sidebarLanding"}>
              <div id="sidebarLanding">
                <ul className="nav nav-sm flex-column">
                  <li className="nav-item">
                    <a
                      href="landing.html"
                      className="nav-link"
                      data-key="t-one-page"
                    >
                      One Page
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      href="nft-landing.html"
                      className="nav-link"
                      data-key="t-nft-landing"
                    >
                      NFT Landing
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      href="job-landing.html"
                      className="nav-link"
                      data-key="t-job"
                    >
                      Job
                    </a>
                  </li>
                </ul>
              </div>
            </Collapse>
          </li>

          <li className="menu-title">
            <i className="ri-more-fill" />{" "}
            <span data-key="t-components">Components</span>
          </li>

          {/* Base UI */}
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
              <i className="ri-pencil-ruler-2-line" />{" "}
              <span data-key="t-base-ui">Base UI</span>
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
                            href="ui-alerts.html"
                            className="nav-link"
                            data-key="t-alerts"
                          >
                            {" "}
                            Alerts{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-badges.html"
                            className="nav-link"
                            data-key="t-badges"
                          >
                            {" "}
                            Badges{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-buttons.html"
                            className="nav-link"
                            data-key="t-buttons"
                          >
                            {" "}
                            Buttons{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-colors.html"
                            className="nav-link"
                            data-key="t-colors"
                          >
                            {" "}
                            Colors{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-cards.html"
                            className="nav-link"
                            data-key="t-cards"
                          >
                            {" "}
                            Cards{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-carousel.html"
                            className="nav-link"
                            data-key="t-carousel"
                          >
                            {" "}
                            Carousel{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-dropdowns.html"
                            className="nav-link"
                            data-key="t-dropdowns"
                          >
                            {" "}
                            Dropdowns{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-grid.html"
                            className="nav-link"
                            data-key="t-grid"
                          >
                            {" "}
                            Grid{" "}
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="col-lg-4">
                      <ul className="nav nav-sm flex-column">
                        <li className="nav-item">
                          <a
                            href="ui-images.html"
                            className="nav-link"
                            data-key="t-images"
                          >
                            {" "}
                            Images{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-tabs.html"
                            className="nav-link"
                            data-key="t-tabs"
                          >
                            {" "}
                            Tabs{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-accordions.html"
                            className="nav-link"
                            data-key="t-accordion-collapse"
                          >
                            {" "}
                            Accordion & Collapse{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-modals.html"
                            className="nav-link"
                            data-key="t-modals"
                          >
                            {" "}
                            Modals{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-offcanvas.html"
                            className="nav-link"
                            data-key="t-offcanvas"
                          >
                            {" "}
                            Offcanvas{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-placeholders.html"
                            className="nav-link"
                            data-key="t-placeholders"
                          >
                            {" "}
                            Placeholders{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-progress.html"
                            className="nav-link"
                            data-key="t-progress"
                          >
                            {" "}
                            Progress{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-notifications.html"
                            className="nav-link"
                            data-key="t-notifications"
                          >
                            {" "}
                            Notifications{" "}
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="col-lg-4">
                      <ul className="nav nav-sm flex-column">
                        <li className="nav-item">
                          <a
                            href="ui-media.html"
                            className="nav-link"
                            data-key="t-media-object"
                          >
                            {" "}
                            Media object{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-embed-video.html"
                            className="nav-link"
                            data-key="t-embed-video"
                          >
                            {" "}
                            Embed Video{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-typography.html"
                            className="nav-link"
                            data-key="t-typography"
                          >
                            {" "}
                            Typography{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-lists.html"
                            className="nav-link"
                            data-key="t-lists"
                          >
                            {" "}
                            Lists{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a href="ui-links.html" className="nav-link">
                            <span data-key="t-links">Links</span>{" "}
                            <span
                              className="badge badge-pill bg-success"
                              data-key="t-new"
                            >
                              New
                            </span>
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-general.html"
                            className="nav-link"
                            data-key="t-general"
                          >
                            {" "}
                            General{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-ribbons.html"
                            className="nav-link"
                            data-key="t-ribbons"
                          >
                            {" "}
                            Ribbons{" "}
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            href="ui-utilities.html"
                            className="nav-link"
                            data-key="t-utilities"
                          >
                            {" "}
                            Utilities{" "}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Advance UI */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarAdvanceUI" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarAdvanceUI");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarAdvanceUI"}
              aria-controls="sidebarAdvanceUI"
            >
              <i className="ri-stack-line" />{" "}
              <span data-key="t-advance-ui">Advance UI</span>
            </a>

            <Collapse in={openMenu === "sidebarAdvanceUI"}>
              <div>
                <div
                  className={`collapse menu-dropdown ${
                    openMenu === "sidebarAdvanceUI" ? "show" : ""
                  }`}
                  id="sidebarAdvanceUI"
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a
                        href="advance-ui-sweetalerts.html"
                        className="nav-link"
                        data-key="t-sweet-alerts"
                      >
                        Sweet Alerts
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-nestable.html"
                        className="nav-link"
                        data-key="t-nestable-list"
                      >
                        Nestable List
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-scrollbar.html"
                        className="nav-link"
                        data-key="t-scrollbar"
                      >
                        Scrollbar
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-animation.html"
                        className="nav-link"
                        data-key="t-animation"
                      >
                        Animation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-tour.html"
                        className="nav-link"
                        data-key="t-tour"
                      >
                        Tour
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-swiper.html"
                        className="nav-link"
                        data-key="t-swiper-slider"
                      >
                        Swiper Slider
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-ratings.html"
                        className="nav-link"
                        data-key="t-ratings"
                      >
                        Ratings
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-highlight.html"
                        className="nav-link"
                        data-key="t-highlight"
                      >
                        Highlight
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="advance-ui-scrollspy.html"
                        className="nav-link"
                        data-key="t-scrollSpy"
                      >
                        ScrollSpy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Widgets */}
          <li className="nav-item">
            <a className="nav-link menu-link" href="widgets.html">
              <i className="ri-honour-line" />{" "}
              <span data-key="t-widgets">Widgets</span>
            </a>
          </li>

          {/* Forms */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarForms" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarForms");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarForms"}
              aria-controls="sidebarForms"
            >
              <i className="ri-file-list-3-line" />{" "}
              <span data-key="t-forms">Forms</span>
            </a>

            <Collapse in={openMenu === "sidebarForms"}>
              <div>
                <div
                  className={`collapse menu-dropdown ${
                    openMenu === "sidebarForms" ? "show" : ""
                  }`}
                  id="sidebarForms"
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a
                        href="forms-elements.html"
                        className="nav-link"
                        data-key="t-basic-elements"
                      >
                        Basic Elements
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-select.html"
                        className="nav-link"
                        data-key="t-form-select"
                      >
                        Form Select
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-checkboxs-radios.html"
                        className="nav-link"
                        data-key="t-checkboxs-radios"
                      >
                        Checkboxs &amp; Radios
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-pickers.html"
                        className="nav-link"
                        data-key="t-pickers"
                      >
                        Pickers
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-masks.html"
                        className="nav-link"
                        data-key="t-input-masks"
                      >
                        Input Masks
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-advanced.html"
                        className="nav-link"
                        data-key="t-advanced"
                      >
                        Advanced
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-range-sliders.html"
                        className="nav-link"
                        data-key="t-range-slider"
                      >
                        Range Slider
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-validation.html"
                        className="nav-link"
                        data-key="t-validation"
                      >
                        Validation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-wizard.html"
                        className="nav-link"
                        data-key="t-wizard"
                      >
                        Wizard
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-editors.html"
                        className="nav-link"
                        data-key="t-editors"
                      >
                        Editors
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-file-uploads.html"
                        className="nav-link"
                        data-key="t-file-uploads"
                      >
                        File Uploads
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-layouts.html"
                        className="nav-link"
                        data-key="t-form-layouts"
                      >
                        Form Layouts
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="forms-select2.html"
                        className="nav-link"
                        data-key="t-select2"
                      >
                        Select2
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Tables */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarTables" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarTables");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarTables"}
              aria-controls="sidebarTables"
            >
              <i className="ri-layout-grid-line" />{" "}
              <span data-key="t-tables">Tables</span>
            </a>

            <Collapse in={openMenu === "sidebarTables"}>
              <div>
                <div
                  className={`collapse menu-dropdown ${
                    openMenu === "sidebarTables" ? "show" : ""
                  }`}
                  id="sidebarTables"
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a
                        href="tables-basic.html"
                        className="nav-link"
                        data-key="t-basic-tables"
                      >
                        Basic Tables
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="tables-gridjs.html"
                        className="nav-link"
                        data-key="t-grid-js"
                      >
                        Grid Js
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="tables-listjs.html"
                        className="nav-link"
                        data-key="t-list-js"
                      >
                        List Js
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="tables-datatables.html"
                        className="nav-link"
                        data-key="t-datatables"
                      >
                        Datatables
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Charts */}
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
              <i className="ri-pie-chart-line" />{" "}
              <span data-key="t-charts">Charts</span>
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
                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${
                          isApexcharts ? "" : "collapsed"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsApexcharts(!isApexcharts); // Quản lý đóng mở menu con Apexcharts
                        }}
                        data-bs-toggle="collapse"
                        role="button"
                        aria-expanded={isApexcharts}
                        aria-controls="sidebarApexcharts"
                        data-key="t-apexcharts"
                      >
                        Apexcharts
                      </a>
                      <Collapse in={isApexcharts}>
                        <div>
                          <div
                            className={`collapse menu-dropdown ${
                              isApexcharts ? "show" : ""
                            }`}
                            id="sidebarApexcharts"
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="charts-apex-line.html"
                                  className="nav-link"
                                  data-key="t-line"
                                >
                                  {" "}
                                  Line{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-area.html"
                                  className="nav-link"
                                  data-key="t-area"
                                >
                                  {" "}
                                  Area{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-column.html"
                                  className="nav-link"
                                  data-key="t-column"
                                >
                                  {" "}
                                  Column{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-bar.html"
                                  className="nav-link"
                                  data-key="t-bar"
                                >
                                  {" "}
                                  Bar{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-mixed.html"
                                  className="nav-link"
                                  data-key="t-mixed"
                                >
                                  {" "}
                                  Mixed{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-timeline.html"
                                  className="nav-link"
                                  data-key="t-timeline"
                                >
                                  {" "}
                                  Timeline{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-range-area.html"
                                  className="nav-link"
                                  data-key="t-range-area"
                                >
                                  {" "}
                                  Range Area{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-funnel.html"
                                  className="nav-link"
                                  data-key="t-funnel"
                                >
                                  {" "}
                                  Funnel{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-candlestick.html"
                                  className="nav-link"
                                  data-key="t-candlstick"
                                >
                                  {" "}
                                  Candlstick{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-boxplot.html"
                                  className="nav-link"
                                  data-key="t-boxplot"
                                >
                                  {" "}
                                  Boxplot{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-bubble.html"
                                  className="nav-link"
                                  data-key="t-bubble"
                                >
                                  {" "}
                                  Bubble{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-scatter.html"
                                  className="nav-link"
                                  data-key="t-scatter"
                                >
                                  {" "}
                                  Scatter{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-heatmap.html"
                                  className="nav-link"
                                  data-key="t-heatmap"
                                >
                                  {" "}
                                  Heatmap{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-treemap.html"
                                  className="nav-link"
                                  data-key="t-treemap"
                                >
                                  {" "}
                                  Treemap{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-pie.html"
                                  className="nav-link"
                                  data-key="t-pie"
                                >
                                  {" "}
                                  Pie{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-radialbar.html"
                                  className="nav-link"
                                  data-key="t-radialbar"
                                >
                                  {" "}
                                  Radialbar{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-radar.html"
                                  className="nav-link"
                                  data-key="t-radar"
                                >
                                  {" "}
                                  Radar{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-polar.html"
                                  className="nav-link"
                                  data-key="t-polar-area"
                                >
                                  {" "}
                                  Polar Area{" "}
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="charts-apex-slope.html"
                                  className="nav-link"
                                >
                                  <span data-key="t-slope">Slope</span>{" "}
                                  <span
                                    className="badge badge-pill bg-success"
                                    data-key="t-new"
                                  >
                                    {" "}
                                    New{" "}
                                  </span>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>
                    <li className="nav-item">
                      <a
                        href="charts-chartjs.html"
                        className="nav-link"
                        data-key="t-chartjs"
                      >
                        {" "}
                        Chartjs{" "}
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="charts-echarts.html"
                        className="nav-link"
                        data-key="t-echarts"
                      >
                        {" "}
                        Echarts{" "}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Icons */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarIcons" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarIcons");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarIcons"}
              aria-controls="sidebarIcons"
            >
              <i className="ri-compasses-2-line" />{" "}
              <span data-key="t-icons">Icons</span>
            </a>

            <Collapse in={openMenu === "sidebarIcons"}>
              <div>
                <div
                  className={`collapse menu-dropdown ${
                    openMenu === "sidebarIcons" ? "show" : ""
                  }`}
                  id="sidebarIcons"
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a href="icons-remix.html" className="nav-link">
                        <span data-key="t-remix">Remix</span>{" "}
                        <span className="badge badge-pill bg-info">v4.3</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="icons-boxicons.html" className="nav-link">
                        <span data-key="t-boxicons">Boxicons</span>{" "}
                        <span className="badge badge-pill bg-info">v2.1.4</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="icons-materialdesign.html" className="nav-link">
                        <span data-key="t-material-design">
                          Material Design
                        </span>{" "}
                        <span className="badge badge-pill bg-info">
                          v7.2.96
                        </span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="icons-lineawesome.html"
                        className="nav-link"
                        data-key="t-line-awesome"
                      >
                        Line Awesome
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="icons-feather.html" className="nav-link">
                        <span data-key="t-feather">Feather</span>{" "}
                        <span className="badge badge-pill bg-info">
                          v4.29.2
                        </span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="icons-crypto.html" className="nav-link">
                        <span data-key="t-crypto-svg">Crypto SVG</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Maps */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarMaps" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarMaps");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarMaps"}
              aria-controls="sidebarMaps"
            >
              <i className="ri-map-pin-line" />{" "}
              <span data-key="t-maps">Maps</span>
            </a>

            <Collapse in={openMenu === "sidebarMaps"}>
              <div>
                <div
                  className={`collapse menu-dropdown ${
                    openMenu === "sidebarMaps" ? "show" : ""
                  }`}
                  id="sidebarMaps"
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a
                        href="maps-google.html"
                        className="nav-link"
                        data-key="t-google"
                      >
                        Google
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="maps-vector.html"
                        className="nav-link"
                        data-key="t-vector"
                      >
                        Vector
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="maps-leaflet.html"
                        className="nav-link"
                        data-key="t-leaflet"
                      >
                        Leaflet
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>

          {/* Multi Level */}
          <li className="nav-item">
            <a
              className={`nav-link menu-link ${
                openMenu === "sidebarMultilevel" ? "" : "collapsed"
              }`}
              href="#!"
              onClick={(e) => {
                e.preventDefault();
                handleToggle("sidebarMultilevel");
              }}
              data-bs-toggle="collapse"
              role="button"
              aria-expanded={openMenu === "sidebarMultilevel"}
              aria-controls="sidebarMultilevel"
            >
              <i className="ri-share-line" />{" "}
              <span data-key="t-multi-level">Multi Level</span>
            </a>

            <Collapse in={openMenu === "sidebarMultilevel"}>
              <div>
                <div
                  className={`collapse menu-dropdown ${
                    openMenu === "sidebarMultilevel" ? "show" : ""
                  }`}
                  id="sidebarMultilevel"
                >
                  <ul className="nav nav-sm flex-column">
                    <li className="nav-item">
                      <a href="#!" className="nav-link" data-key="t-level-1.1">
                        Level 1.1
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="#!"
                        className={`nav-link ${isLevel12 ? "" : "collapsed"}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsLevel12(!isLevel12); // State cho Level 1.2
                        }}
                        data-bs-toggle="collapse"
                        role="button"
                        aria-expanded={isLevel12}
                        aria-controls="sidebarAccount"
                        data-key="t-level-1.2"
                      >
                        Level 1.2
                      </a>
                      <Collapse in={isLevel12}>
                        <div>
                          <div
                            className={`collapse menu-dropdown ${
                              isLevel12 ? "show" : ""
                            }`}
                            id="sidebarAccount"
                          >
                            <ul className="nav nav-sm flex-column">
                              <li className="nav-item">
                                <a
                                  href="#!"
                                  className="nav-link"
                                  data-key="t-level-2.1"
                                >
                                  Level 2.1
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  href="#!"
                                  className={`nav-link ${
                                    isLevel22 ? "" : "collapsed"
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIsLevel22(!isLevel22); // State cho Level 2.2
                                  }}
                                  data-bs-toggle="collapse"
                                  role="button"
                                  aria-expanded={isLevel22}
                                  aria-controls="sidebarCrm"
                                  data-key="t-level-2.2"
                                >
                                  Level 2.2
                                </a>
                                <Collapse in={isLevel22}>
                                  <div>
                                    <div
                                      className={`collapse menu-dropdown ${
                                        isLevel22 ? "show" : ""
                                      }`}
                                      id="sidebarCrm"
                                    >
                                      <ul className="nav nav-sm flex-column">
                                        <li className="nav-item">
                                          <a
                                            href="#!"
                                            className="nav-link"
                                            data-key="t-level-3.1"
                                          >
                                            Level 3.1
                                          </a>
                                        </li>
                                        <li className="nav-item">
                                          <a
                                            href="#!"
                                            className="nav-link"
                                            data-key="t-level-3.2"
                                          >
                                            Level 3.2
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                </Collapse>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </li>
                  </ul>
                </div>
              </div>
            </Collapse>
          </li>
        </ul>{" "}
      </SimpleBar>
    </div>
  );
};

export default Navbar;
