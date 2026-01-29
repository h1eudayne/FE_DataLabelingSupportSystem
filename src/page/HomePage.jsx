import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { LogOut } from "lucide-react";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import AdminContainer from "../container/AdminContainer";
import ManagerContainer from "../container/ManagerContainer";
import AnnotatorContainer from "../container/AnnotatorContainer";
import ReviewerContainer from "../container/ReviewerContainer";

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
    <div className="dashboard-layout bg-light min-vh-100">
      {/* <UserHeader user={user} /> */}

      <Container fluid className="px-4 py-2">
        <RoleBasedRenderer role={user?.role} />
      </Container>
    </div>
  );
};

const RoleBasedRenderer = ({ role }) => {
  switch (role) {
    case "Admin":
      return <AdminContainer />;
    case "Manager":
      return <ManagerContainer />;
    case "Annotator":
      return <AnnotatorContainer />;
    case "Reviewer":
      return <ReviewerContainer />;
    default:
      return <div className="text-center p-5">Quyền truy cập không hợp lệ</div>;
  }
};

export default HomePage;
