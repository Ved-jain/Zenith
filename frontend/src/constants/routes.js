export const PUBLIC_ROUTES = {
  HOME: "/",
  SIGNUP: "/signup",
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  PRODUCT: "/product",
  PRICING: "/pricing",
  SUPPORT: "/support",
};

export const DASHBOARD_ROUTES = {
  OVERVIEW: "/overview",
  PORTFOLIO: "/portfolio",
  WATCHLIST: "/watchlist",
  INSIGHTS: "/insights",
  SETTINGS: "/settings",
  STOCK_DETAIL: "/stock/:symbol",
};

export const getStockDetailPath = (symbol) =>
  `/stock/${encodeURIComponent(String(symbol || "").toUpperCase())}`;
