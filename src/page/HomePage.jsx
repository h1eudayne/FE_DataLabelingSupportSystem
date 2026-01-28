import { useSelector } from "react-redux";
import AdminDashboard from "../components/home/AdminDashboard";
import ManagerDashboard from "../components/home/ManagerDashboard";
import AnnotatorDashboard from "../components/home/AnnotatorDashboard";
import ReviewerDashboard from "../components/home/ReviewerDashboard";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="dashboard-container">
      <h1>Welcome back, {user?.email}</h1>
      <hr />

      {user?.role === "Admin" && <AdminDashboard />}
      {user?.role === "Manager" && <ManagerDashboard />}
      {user?.role === "Annotator" && <AnnotatorDashboard />}
      {user?.role === "Reviewer" && <ReviewerDashboard />}
    </div>
  );
};

export default HomePage;
