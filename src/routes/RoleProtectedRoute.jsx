import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ allowRoles, children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowRoles.includes(user?.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
