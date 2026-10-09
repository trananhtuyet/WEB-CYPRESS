import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function HomeRoute({ children }) {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default HomeRoute;
