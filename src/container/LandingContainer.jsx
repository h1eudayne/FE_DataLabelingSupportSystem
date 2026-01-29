import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import LandingFooter from "../components/landing/LandingFooter";
import CTASection from "../components/landing/CTASection";

const LandingContainer = () => {
  const navigate = useNavigate();

  const styles = {
    primary: "#405189",
    slate900: "#1e293b",
  };

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const goToLogin = () => navigate("/login");

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <LandingNavbar styles={styles} onLogin={goToLogin} />
      <HeroSection styles={styles} onExplore={goToLogin} />
      <FeaturesSection styles={styles} />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingContainer;
