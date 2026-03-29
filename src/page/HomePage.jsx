import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ReviewerContainer from "../container/ReviewerContainer";
import AnnotatorDashboard from "./annotator/dashboard/AnnotatorDashboard";
import DashboardAnalytics from "./manager/analytics/DashboardAnalyticsPage";
import AdminDashboard from "./home/AdminDashboard";

const HomePage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        <LandingNavbar />
        <HeroSection onStart={() => navigate("/login")} />
        <FeaturesSection />
        <footer className="py-4 text-center text-muted border-top bg-white">
          <small>© 2026 AI LABEL SYSTEM. ALL RIGHTS RESERVED.</small>
        </footer>
      </div>
    );
  }

  return (
    <div className="dashboard-layout min-vh-100">
      <RoleBasedRenderer role={user?.role} />
    </div>
  );
};

const RoleBasedRenderer = ({ role }) => {
  const { t } = useTranslation();
  switch (role) {
    case "Admin":
      return <AdminDashboard />;
    case "Manager":
      
      return <DashboardAnalytics />;
    case "Annotator":
      
      return <AnnotatorDashboard />;
    case "Reviewer":
      return <ReviewerContainer />;
    default:
      return (
        <div className="text-center p-5">{t("homePage.invalidAccess")}</div>
      );
  }
};

export default HomePage;
