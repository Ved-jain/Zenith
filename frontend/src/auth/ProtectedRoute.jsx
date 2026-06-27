import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "../constants/routes";
import { useAuth } from "./AuthContext";

function ProtectedRoute({ requireAuth = true }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="auth-loading">Checking session...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={PUBLIC_ROUTES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to={DASHBOARD_ROUTES.OVERVIEW} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
