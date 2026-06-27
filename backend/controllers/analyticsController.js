const {
  calculateOverview,
  calculateSectorExposure,
  calculateAllocation,
  calculatePortfolioPerformance,
  calculateTopMovers,
} = require("../services/analyticsService");

const handleAnalyticsError = (res, error) => {
  console.error("Analytics request failed:", error);
  return res.status(500).json({ message: "Unable to calculate analytics." });
};

const getOverview = async (req, res) => {
  try {
    return res.json(await calculateOverview(req.user.id));
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

const getSectorExposure = async (req, res) => {
  try {
    return res.json(await calculateSectorExposure(req.user.id));
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

const getAllocation = async (req, res) => {
  try {
    return res.json(await calculateAllocation(req.user.id));
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

const getTopMovers = async (req, res) => {
  try {
    return res.json(await calculateTopMovers(req.user.id));
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

const getPortfolioPerformance = async (req, res) => {
  try {
    return res.json(
      await calculatePortfolioPerformance(req.user.id, req.query.range)
    );
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

module.exports = {
  getOverview,
  getSectorExposure,
  getAllocation,
  getTopMovers,
  getPortfolioPerformance,
};
