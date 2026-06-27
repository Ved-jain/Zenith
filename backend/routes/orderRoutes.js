const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

const orderRoutes = express.Router();

orderRoutes.post("/newOrder", authMiddleware, orderController.newOrder);
orderRoutes.get("/orders", authMiddleware, orderController.getOrders);

module.exports = { orderRoutes };
