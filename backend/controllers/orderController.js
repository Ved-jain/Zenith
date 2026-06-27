const { OrdersModel } = require("../models/OrdersModel");
const { TradeValidationError, executeOrder } = require("../services/tradingEngine");
const { redisClient } = require("../utils/redis");

const newOrder = async (req, res) => {
  try {
    const result = await executeOrder(req.user.id, req.body);
    const statusCode = result.rejected ? 422 : 201;

    // Cache invalidation: Ensure user sees fresh portfolio data after a trade
    if (!result.rejected) {
      const userId = req.user.id;
      try {
        await Promise.all([
          redisClient.del(`analytics:overview:${userId}`),
          redisClient.del(`analytics:sector-exposure:${userId}`),
          redisClient.del(`analytics:allocation:${userId}`),
          redisClient.del(`analytics:portfolio-performance:${userId}`),
          redisClient.del(`analytics:top-movers:${userId}`)
        ]);
        console.log(`[Cache Invalidation] Cleared analytics cache for user ${userId}`);
      } catch (err) {
        console.error(`[Redis Error] Failed to invalidate cache for user ${userId}:`, err.message);
      }
    }

    return res.status(statusCode).json({
      message: result.rejected ? "Order rejected" : "Order executed",
      order: result.order,
      holding: result.holding,
      position: result.position,
      summary: result.summary,
      rejectionReason: result.rejectionReason,
    });
  } catch (error) {
    if (error instanceof TradeValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("Order execution failed:", error);
    return res.status(500).json({ message: "Order execution failed." });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await OrdersModel.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(orders);
  } catch (error) {
    console.error("Orders fetch failed:", error);
    return res.status(500).json({ message: "Unable to fetch orders." });
  }
};

module.exports = {
  newOrder,
  getOrders,
};
