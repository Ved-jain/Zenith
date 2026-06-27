import apiClient from "./client";

export const getOverview = () => apiClient.get("/analytics/overview");

export const getSectorExposure = () =>
  apiClient.get("/analytics/sector-exposure");

export const getAllocation = () => apiClient.get("/analytics/allocation");

export const getTopMovers = () => apiClient.get("/analytics/top-movers");

export const getPortfolioPerformance = (range = "3M") =>
  apiClient.get("/analytics/portfolio-performance", { params: { range } });
