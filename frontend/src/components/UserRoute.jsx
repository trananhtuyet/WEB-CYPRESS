import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function UserRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "user" ? children || <Outlet /> : <Navigate to="/admin" replace />;
}

export default UserRoute;
