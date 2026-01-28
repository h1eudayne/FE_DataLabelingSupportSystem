import React from "react";
import { useSelector } from "react-redux";
import AdminDashboard from "./AdminDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AnnotatorDashboard from "./AnnotatorDashboard";
import ReviewerDashboard from "./ReviewerDashboard";

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated)
    return <div className="p-10 text-center">Vui lòng đăng nhập...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.email}
        </h1>
        <p className="text-gray-500 italic text-sm">Role: {user?.role}</p>
      </header>

      {/* Render component dựa trên Role giải mã từ JWT */}
      {user?.role === "Admin" && <AdminDashboard />}
      {user?.role === "Manager" && <ManagerDashboard />}
      {user?.role === "Annotator" && <AnnotatorDashboard />}
      {user?.role === "Reviewer" && <ReviewerDashboard />}
    </div>
  );
};

export default Home;
