import React from "react";
import { Link } from "react-router-dom";

function Pricing() {
  return (
    <section className="split-section">
      <div>
        <p className="eyebrow">Simple product shape</p>
        <h2>One analytics workspace for everyday portfolio review.</h2>
        <p>
          Zenith is structured around Overview, Portfolio, Watchlist,
          Insights, and Settings. Holdings and Positions stay together inside
          Portfolio, so the app feels like one workspace instead of scattered
          broker screens.
        </p>
        <Link className="text-link" to="/pricing">
          Explore access plans
        </Link>
      </div>
      <div className="plan-card">
        <span className="eyebrow">Prototype plan</span>
        <h3>Investor workspace</h3>
        <p>Portfolio health, sector exposure, watchlists, and insight cards.</p>
        <strong>Focused analytics</strong>
      </div>
    </section>
  );
}

export default Pricing;
