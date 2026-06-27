const { HoldingsModel } = require("../models/HoldingsModel");
const { PositionsModel } = require("../models/PositionsModel");

const calculatePortfolioSummary = async (userId, options = {}) => {
  const queryOptions = options.session ? { session: options.session } : {};
  const holdings = await HoldingsModel.find({ userId }, null, queryOptions).lean();
  const positions = await PositionsModel.find({ userId }, null, queryOptions).lean();

  const invested = holdings.reduce(
    (sum, holding) => sum + holding.avg * holding.qty,
    0
  );
  const current = holdings.reduce(
    (sum, holding) => sum + holding.price * holding.qty,
    0
  );
  const pnl = current - invested;

  return {
    invested,
    current,
    pnl,
    holdingsCount: holdings.length,
    positionsCount: positions.length,
  };
};

module.exports = { calculatePortfolioSummary };
