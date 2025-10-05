import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthProvider";

type ProtectedRouteProps = {
  requireSuperuser?: boolean;
};

export function ProtectedRoute({ requireSuperuser = false }: ProtectedRouteProps) {
  const { isAuthenticated, initializing, user } = useAuth();

  if (initializing) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperuser && !user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
