// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";


const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists but user role not allowed, redirect to dashboard depending on role
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
