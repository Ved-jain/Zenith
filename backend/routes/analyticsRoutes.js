const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const analyticsController = require("../controllers/analyticsController");
const { cacheMiddleware } = require("../utils/redis");

const analyticsRoutes = express.Router();

analyticsRoutes.get("/analytics/overview", authMiddleware, cacheMiddleware((req) => `analytics:overview:${req.user.id}`, 300), analyticsController.getOverview);
analyticsRoutes.get("/analytics/sector-exposure", authMiddleware, cacheMiddleware((req) => `analytics:sector-exposure:${req.user.id}`, 300), analyticsController.getSectorExposure);
analyticsRoutes.get("/analytics/allocation", authMiddleware, cacheMiddleware((req) => `analytics:allocation:${req.user.id}`, 300), analyticsController.getAllocation);
analyticsRoutes.get("/analytics/top-movers", authMiddleware, cacheMiddleware((req) => `analytics:top-movers:${req.user.id}`, 300), analyticsController.getTopMovers);
analyticsRoutes.get("/analytics/portfolio-performance", authMiddleware, cacheMiddleware((req) => `analytics:portfolio-performance:${req.user.id}`, 300), analyticsController.getPortfolioPerformance);

module.exports = { analyticsRoutes };
