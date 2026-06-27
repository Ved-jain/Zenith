const express = require("express");
const stockController = require("../controllers/stockController");
const { cacheMiddleware } = require("../utils/redis");

const stockRoutes = express.Router();

// Cache search and sectors briefly, catalogue for 5 mins, individual stocks for 2 mins, history for 10 mins
stockRoutes.get("/stocks/search", cacheMiddleware((req) => `search:${req.query.q}`, 60), stockController.searchStocks);
stockRoutes.get("/stocks/sectors", cacheMiddleware("stocks:sectors", 300), stockController.getSectors);
stockRoutes.get("/stocks/:symbol/history", cacheMiddleware((req) => `history:${req.params.symbol}:${req.query.range || '3M'}`, 600), stockController.getStockHistory);
stockRoutes.get("/stocks/:symbol", cacheMiddleware((req) => `stock:${req.params.symbol}`, 120), stockController.getStock);
stockRoutes.get("/stocks", cacheMiddleware("stocks:all", 300), stockController.getStocks);

module.exports = { stockRoutes };
