import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "admin" ? children || <Outlet /> : <Navigate to="/" replace />;
}

export default AdminRoute;
