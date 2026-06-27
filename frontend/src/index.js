import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import "./index.css";

import HomePage from "./landing_page/home/HomePage";
import AboutPage from "./landing_page/about/AboutPage";
import ProductPage from "./landing_page/products/ProductsPage";
import PricingPage from "./landing_page/pricing/PricingPage";
import SupportPage from "./landing_page/support/SupportPage";

import NotFound from "./landing_page/NotFound";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "./constants/routes";

import Login from "./pages/Login";
import Register from "./pages/Register";
import OverviewPage from "./pages/dashboard/OverviewPage";
import PortfolioPage from "./pages/dashboard/PortfolioPage";
import WatchlistPage from "./pages/dashboard/WatchlistPage";
import InsightsPage from "./pages/dashboard/InsightsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import StockDetailPage from "./pages/dashboard/StockDetailPage";
import Orders from "./dashboard/components/Orders";

function PublicLayout() {
  return (
    <div className="site-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={PUBLIC_ROUTES.HOME} element={<HomePage />} />
          <Route path={PUBLIC_ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={PUBLIC_ROUTES.PRODUCT} element={<ProductPage />} />
          <Route path={PUBLIC_ROUTES.PRICING} element={<PricingPage />} />
          <Route path={PUBLIC_ROUTES.SUPPORT} element={<SupportPage />} />

          <Route element={<ProtectedRoute requireAuth={false} />}>
            <Route path={PUBLIC_ROUTES.LOGIN} element={<Login />} />
            <Route path={PUBLIC_ROUTES.REGISTER} element={<Register />} />
            <Route path={PUBLIC_ROUTES.SIGNUP} element={<Register />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={DASHBOARD_ROUTES.OVERVIEW} element={<OverviewPage />} />
            <Route path={DASHBOARD_ROUTES.PORTFOLIO} element={<PortfolioPage />} />
            <Route path={DASHBOARD_ROUTES.WATCHLIST} element={<WatchlistPage />} />
            <Route path={DASHBOARD_ROUTES.INSIGHTS} element={<InsightsPage />} />
            <Route path={DASHBOARD_ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={DASHBOARD_ROUTES.STOCK_DETAIL} element={<StockDetailPage />} />
            <Route path="/orders" element={<div className="dashboard-container"><div className="content"><Orders /></div></div>} />
            <Route path="/holdings" element={<Navigate to={DASHBOARD_ROUTES.PORTFOLIO} replace />} />
            <Route path="/positions" element={<Navigate to={DASHBOARD_ROUTES.PORTFOLIO} replace />} />
            <Route path="/funds" element={<Navigate to={DASHBOARD_ROUTES.SETTINGS} replace />} />
            <Route path="/apps" element={<Navigate to={DASHBOARD_ROUTES.INSIGHTS} replace />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
