import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const hasToken = !!localStorage.getItem("access_token");

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
