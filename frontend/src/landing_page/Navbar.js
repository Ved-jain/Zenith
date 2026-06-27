import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "../constants/routes";

function Navbar() {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dashboardTarget = isAuthenticated
    ? DASHBOARD_ROUTES.OVERVIEW
    : PUBLIC_ROUTES.LOGIN;
  const navItems = [
    { label: "Product", to: PUBLIC_ROUTES.PRODUCT },
    { label: "Analytics", to: PUBLIC_ROUTES.HOME },
    { label: "Pricing", to: PUBLIC_ROUTES.PRICING },
    { label: "Support", to: PUBLIC_ROUTES.SUPPORT },
  ];

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <div className="site-nav__inner">
        <Link className="brand-mark" to="/" aria-label="Zenith home">
          <span className="brand-mark__glyph">Z</span>
          <span>Zenith</span>
        </Link>

        <button
          className="site-nav__toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="public-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          Menu
        </button>

        <div
          className={isMenuOpen ? "site-nav__menu is-open" : "site-nav__menu"}
          id="public-navigation"
        >
          <div className="site-nav__links">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "site-nav__link is-active" : "site-nav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
          </div>

          <div className="site-nav__actions">
          <Link
            className="site-nav__link"
            to={PUBLIC_ROUTES.ABOUT}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            className="button button--primary"
            to={dashboardTarget}
            onClick={() => setIsMenuOpen(false)}
          >
            {isAuthenticated ? "Dashboard" : "Login"}
          </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
