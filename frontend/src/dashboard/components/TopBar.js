import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Menu from "./Menu";
import apiClient from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { DASHBOARD_ROUTES } from "../../constants/routes";
import { PUBLIC_ROUTES } from "../../constants/routes";

const TopBar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(PUBLIC_ROUTES.LOGIN, { replace: true });
  };

  const handleSync = async () => {
    try {
      await apiClient.post("/sync/stocks");
      alert("Real market data sync initiated in the background! Refresh the page in about a minute to see the live NSE data.");
    } catch (error) {
      console.error(error);
      alert("Failed to initiate sync.");
    }
  };

  return (
    <header className={isMenuOpen ? "topbar-container is-open" : "topbar-container"}>
      <Link
        className="dashboard-brand dashboard-brand--mobile"
        to={DASHBOARD_ROUTES.OVERVIEW}
        aria-label="Zenith overview"
        onClick={() => setIsMenuOpen(false)}
      >
        <span>EF</span>
        <strong>Zenith</strong>
      </Link>
      <button
        className="dashboard-nav-toggle"
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="dashboard-navigation"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        Menu
      </button>
      <Menu onNavigate={() => setIsMenuOpen(false)} />
      <div className="topbar-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 650, fontSize: '0.95rem' }}>{user?.name || "Investor"}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 800, letterSpacing: '0.05em', background: 'var(--success-muted)', padding: '2px 8px', borderRadius: '4px' }}>LIVE NSE DATA</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button 
            className="logout-button" 
            style={{ margin: 0, width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }} 
            type="button" 
            onClick={handleSync}
          >
            Sync Data
          </button>
          <button className="logout-button" style={{ margin: 0, width: '100%' }} type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
