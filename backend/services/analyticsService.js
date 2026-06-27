const { HoldingsModel } = require("../models/HoldingsModel");
const { PriceHistoryModel } = require("../models/PriceHistoryModel");
const { StockModel } = require("../models/StockModel");

const CASH_READY_PLACEHOLDER = 3740;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const round = (value, digits = 2) => Number((value || 0).toFixed(digits));

const normalizeSymbol = (holding) =>
  String(holding.symbol || holding.name || "").trim().toUpperCase();

const getRangeStartDate = (range = "3M") => {
  const normalized = String(range || "3M").toUpperCase();
  const supportedRanges = { "1M": 1, "3M": 3, "6M": 6 };
  const months = supportedRanges[normalized] || supportedRanges["3M"];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  return { range: supportedRanges[normalized] ? normalized : "3M", startDate };
};

const getLatestHistoryBySymbol = async (symbols) => {
  if (!symbols.length) return new Map();

  const latestRows = await PriceHistoryModel.aggregate([
    { $match: { symbol: { $in: symbols }, interval: "1d" } },
    { $sort: { symbol: 1, date: -1 } },
    { $group: { _id: "$symbol", row: { $first: "$$ROOT" } } },
  ]);

  return new Map(latestRows.map((item) => [item._id, item.row]));
};

const loadPortfolioContext = async (userId) => {
  const holdings = await HoldingsModel.find({ userId }).lean();
  const symbols = [...new Set(holdings.map(normalizeSymbol).filter(Boolean))];

  if (!symbols.length) {
    return {
      holdings,
      symbols,
      stocksBySymbol: new Map(),
      latestHistoryBySymbol: new Map(),
    };
  }

  const [stocks, latestHistoryBySymbol] = await Promise.all([
    StockModel.find({ symbol: { $in: symbols }, active: true }).lean(),
    getLatestHistoryBySymbol(symbols),
  ]);

  return {
    holdings,
    symbols,
    stocksBySymbol: new Map(stocks.map((stock) => [stock.symbol, stock])),
    latestHistoryBySymbol,
  };
};

const getHoldingMarketPrice = (holding, latestHistoryBySymbol) => {
  const symbol = normalizeSymbol(holding);
  return latestHistoryBySymbol.get(symbol)?.close || holding.price || 0;
};

const getHoldingValue = (holding, latestHistoryBySymbol) =>
  holding.qty * getHoldingMarketPrice(holding, latestHistoryBySymbol);

const calculateBaseMetrics = (context) => {
  const currentValue = context.holdings.reduce(
    (sum, holding) => sum + getHoldingValue(holding, context.latestHistoryBySymbol),
    0
  );
  const investedValue = context.holdings.reduce(
    (sum, holding) => sum + holding.qty * holding.avg,
    0
  );
  const pnl = currentValue - investedValue;
  const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

  return {
    currentValue,
    investedValue,
    pnl,
    pnlPercent,
  };
};

const calculateSectorRowsFromContext = (context) => {
  const totalsBySector = new Map();
  let totalValue = 0;

  context.holdings.forEach((holding) => {
    const symbol = normalizeSymbol(holding);
    const stock = context.stocksBySymbol.get(symbol);
    const sector = stock?.sector || "Unclassified";
    const value = getHoldingValue(holding, context.latestHistoryBySymbol);
    totalValue += value;
    totalsBySector.set(sector, (totalsBySector.get(sector) || 0) + value);
  });

  return [...totalsBySector.entries()]
    .map(([sector, value]) => ({
      sector,
      value: round(value),
      percentage: totalValue > 0 ? round((value / totalValue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
};

const calculateAllocationRowsFromContext = (context) => {
  const totalValue = context.holdings.reduce(
    (sum, holding) => sum + getHoldingValue(holding, context.latestHistoryBySymbol),
    0
  );

  return context.holdings
    .map((holding) => {
      const symbol = normalizeSymbol(holding);
      const value = getHoldingValue(holding, context.latestHistoryBySymbol);
      return {
        symbol,
        value: round(value),
        percentage: totalValue > 0 ? round((value / totalValue) * 100) : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
};

const calculateHealthScoreFromContext = (context) => {
  if (!context.holdings.length) return 0;

  const { pnlPercent } = calculateBaseMetrics(context);
  const allocation = calculateAllocationRowsFromContext(context);
  const sectorExposure = calculateSectorRowsFromContext(context);

  const diversificationScore = clamp((allocation.length / 8) * 100, 0, 100);
  const pnlScore = clamp(50 + pnlPercent * 2, 0, 100);
  const maxAllocation = allocation[0]?.percentage || 0;
  const concentrationScore = clamp(100 - Math.max(0, maxAllocation - 25) * 2, 0, 100);
  const maxSector = sectorExposure[0]?.percentage || 0;
  const sectorBalanceScore = clamp(
    sectorExposure.length <= 1 ? 35 : 100 - Math.max(0, maxSector - 40) * 1.5,
    0,
    100
  );

  return Math.round(
    diversificationScore * 0.4 +
      pnlScore * 0.3 +
      concentrationScore * 0.2 +
      sectorBalanceScore * 0.1
  );
};

const calculateHealthScore = async (userId) => {
  const context = await loadPortfolioContext(userId);
  return calculateHealthScoreFromContext(context);
};

const calculateSectorExposure = async (userId) => {
  const context = await loadPortfolioContext(userId);
  return calculateSectorRowsFromContext(context);
};

const calculateAllocation = async (userId) => {
  const context = await loadPortfolioContext(userId);
  return calculateAllocationRowsFromContext(context);
};

const calculateOverview = async (userId) => {
  const context = await loadPortfolioContext(userId);
  const metrics = calculateBaseMetrics(context);
  const sectorExposure = calculateSectorRowsFromContext(context);
  const healthScore = calculateHealthScoreFromContext(context);

  return {
    currentValue: round(metrics.currentValue),
    investedValue: round(metrics.investedValue),
    pnl: round(metrics.pnl),
    pnlPercent: round(metrics.pnlPercent),
    healthScore,
    largestSector: sectorExposure[0]?.sector || null,
    cashReady: CASH_READY_PLACEHOLDER,
  };
};

const calculateTopMovers = async (userId) => {
  const context = await loadPortfolioContext(userId);
  let symbols = context.symbols;

  if (!symbols.length) {
    const stocks = await StockModel.find({ active: true }).select("symbol").lean();
    symbols = stocks.map((stock) => stock.symbol);
  }

  const latestHistoryBySymbol = await getLatestHistoryBySymbol(symbols);
  return [...latestHistoryBySymbol.values()]
    .map((row) => ({
      symbol: row.symbol,
      price: round(row.close),
      dayChangePercent:
        row.previousClose > 0
          ? round(((row.close - row.previousClose) / row.previousClose) * 100)
          : round(row.changePercent),
    }))
    .sort(
      (a, b) => Math.abs(b.dayChangePercent) - Math.abs(a.dayChangePercent)
    )
    .slice(0, 10);
};

const calculatePortfolioPerformance = async (userId, range = "3M") => {
  const context = await loadPortfolioContext(userId);
  if (!context.holdings.length || !context.symbols.length) return [];

  const { startDate } = getRangeStartDate(range);
  const historyRows = await PriceHistoryModel.find({
    symbol: { $in: context.symbols },
    interval: "1d",
    date: { $gte: startDate },
  })
    .sort({ date: 1 })
    .select("symbol date close -_id")
    .lean();

  const rowsByDate = new Map();

  historyRows.forEach((row) => {
    const key = row.date.toISOString().slice(0, 10);
    if (!rowsByDate.has(key)) rowsByDate.set(key, new Map());
    rowsByDate.get(key).set(row.symbol, row.close);
  });

  return [...rowsByDate.entries()]
    .map(([date, closesBySymbol]) => {
      const value = context.holdings.reduce((sum, holding) => {
        const symbol = normalizeSymbol(holding);
        const close =
          closesBySymbol.get(symbol) ||
          context.latestHistoryBySymbol.get(symbol)?.close ||
          holding.price ||
          0;
        return sum + holding.qty * close;
      }, 0);

      return { date, value: round(value) };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
};

module.exports = {
  calculateOverview,
  calculateSectorExposure,
  calculateAllocation,
  calculatePortfolioPerformance,
  calculateTopMovers,
  calculateHealthScore,
};
