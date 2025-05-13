import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/UseAuth";

export default function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return auth?.user ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
}
