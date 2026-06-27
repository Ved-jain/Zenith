import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "../constants/routes";

function OpenAccount() {
  const { isAuthenticated } = useAuth();
  const dashboardTarget = isAuthenticated
    ? DASHBOARD_ROUTES.OVERVIEW
    : PUBLIC_ROUTES.LOGIN;

  return (
    <section className="cta-section">
      <p className="eyebrow">Ready for a cleaner dashboard?</p>
      <h2>Start with portfolio health, then go deeper.</h2>
      <p>
        Move from scattered market rows to a structured review of performance,
        exposure, and watchlist signals.
      </p>
      <Link className="button button--primary" to={dashboardTarget}>
        {isAuthenticated ? "Open dashboard" : "Login to continue"}
      </Link>
    </section>
  );
}

export default OpenAccount;
