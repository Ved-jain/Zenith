import apiClient from "./client";

export const getStockDetail = (symbol) => apiClient.get(`/stocks/${symbol}`);

export const getStockDetailHistory = (symbol, range = "3M") =>
  apiClient.get(`/stocks/${symbol}/history`, { params: { range } });

export const getPortfolioHoldings = () => apiClient.get("/allHoldings");

export const getPortfolioPositions = () => apiClient.get("/allPositions");
