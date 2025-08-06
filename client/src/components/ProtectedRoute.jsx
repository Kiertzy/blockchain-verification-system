import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Get user from localStorage or sessionStorage
  const user = JSON.parse(localStorage.getItem("user_data"));

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
