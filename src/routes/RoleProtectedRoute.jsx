import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const RoleProtectedRoute = ({ allowRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowRoles && !allowRoles.includes(user?.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
