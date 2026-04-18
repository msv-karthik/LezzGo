import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    if (exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ redirectTo = "/login" }) => {
  return isAuthenticated() ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;