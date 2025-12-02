import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Allow public certificate routes to bypass authentication
  if (
    location.pathname.startsWith("/certificates/student/certificate/view") ||
    location.pathname.startsWith("/certificates/student/verify")
  ) {
    return <Outlet />;
  }

  // Normal protection rules
  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/dashboard" replace />;
      case "STUDENT":
        return <Navigate to="/student-dashboard" replace />;
      case "INSTITUTION":
        return <Navigate to="/institution-dashboard" replace />;
      case "VERIFIER":
        return <Navigate to="/verifier/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;