import apiClient from "./client";

export const getStocks = (params = {}) => apiClient.get("/stocks", { params });

export const searchStocks = (q, params = {}) =>
  apiClient.get("/stocks/search", { params: { ...params, q } });

export const getStock = (symbol) => apiClient.get(`/stocks/${symbol}`);

export const getStockHistory = (symbol, params = {}) =>
  apiClient.get(`/stocks/${symbol}/history`, { params });

export const getStockSectors = () => apiClient.get("/stocks/sectors");
