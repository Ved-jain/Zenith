const { PriceHistoryModel } = require("../models/PriceHistoryModel");
const { StockModel } = require("../models/StockModel");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mapStock = (stock) => ({
  id: stock._id,
  symbol: stock.symbol,
  exchange: stock.exchange,
  currency: stock.currency,
  tickSize: stock.tickSize,
  isin: stock.isin,
  companyName: stock.companyName,
  displayName: stock.displayName,
  sector: stock.sector,
  industry: stock.industry,
  marketCapCategory: stock.marketCapCategory,
  description: stock.description,
  website: stock.website,
  logoUrl: stock.logoUrl,
  tags: stock.tags,
  latestPrice: stock.latestPrice,
  fundamentals: stock.fundamentals,
  active: stock.active,
});

const getRangeStartDate = (range) => {
  if (range === "ALL") return null;

  const start = new Date();
  const monthsByRange = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
  };

  start.setMonth(start.getMonth() - (monthsByRange[range] || 3));
  return start;
};

const buildStockQuery = ({ query, sector }) => {
  const filter = { active: true };

  if (sector) {
    filter.sector = sector;
  }

  if (query) {
    const regex = new RegExp(escapeRegex(query.trim()), "i");
    filter.$or = [
      { symbol: regex },
      { companyName: regex },
      { displayName: regex },
    ];
  }

  return filter;
};

const searchStocks = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    if (!q) {
      return res.json({ data: [] });
    }

    const stocks = await StockModel.find(buildStockQuery({ query: q }))
      .sort({ symbol: 1 })
      .limit(limit)
      .lean();

    return res.json({ data: stocks.map(mapStock) });
  } catch (error) {
    console.error("Stock search failed:", error);
    return res.status(500).json({ message: "Unable to search stocks." });
  }
};

const getSectors = async (req, res) => {
  try {
    const sectors = await StockModel.aggregate([
      { $match: { active: true } },
      { $group: { _id: "$sector", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, sector: "$_id", count: 1 } },
    ]);

    return res.json(sectors);
  } catch (error) {
    console.error("Stock sectors failed:", error);
    return res.status(500).json({ message: "Unable to fetch sectors." });
  }
};

const getStockHistory = async (req, res) => {
  try {
    const symbol = String(req.params.symbol || "").trim().toUpperCase();
    const range = String(req.query.range || "3M").trim().toUpperCase();
    const interval = String(req.query.interval || "1d").trim();
    const startDate = getRangeStartDate(range);
    const filter = { symbol, interval };

    if (!["1M", "3M", "6M", "1Y", "ALL"].includes(range)) {
      return res.status(400).json({ message: "Unsupported history range." });
    }

    if (interval !== "1d") {
      return res.status(400).json({ message: "Only 1d interval is supported." });
    }

    if (startDate) {
      filter.date = { $gte: startDate };
    }

    const stock = await StockModel.findOne({ symbol, active: true }).lean();

    if (!stock) {
      return res.status(404).json({ message: "Stock not found." });
    }

    const data = await PriceHistoryModel.find(filter)
      .sort({ date: 1 })
      .select("date open high low close volume previousClose change changePercent -_id")
      .lean();

    return res.json({ symbol, interval, range, data });
  } catch (error) {
    console.error("Stock history failed:", error);
    return res.status(500).json({ message: "Unable to fetch price history." });
  }
};

const getStock = async (req, res) => {
  try {
    const symbol = String(req.params.symbol || "").trim().toUpperCase();
    const stock = await StockModel.findOne({ symbol, active: true }).lean();

    if (!stock) {
      return res.status(404).json({ message: "Stock not found." });
    }

    return res.json(mapStock(stock));
  } catch (error) {
    console.error("Stock detail failed:", error);
    return res.status(500).json({ message: "Unable to fetch stock." });
  }
};

const getStocks = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const skip = (page - 1) * limit;
    const filter = buildStockQuery({
      query: req.query.query,
      sector: req.query.sector,
    });

    const [stocks, total] = await Promise.all([
      StockModel.find(filter).sort({ symbol: 1 }).skip(skip).limit(limit).lean(),
      StockModel.countDocuments(filter),
    ]);

    return res.json({
      data: stocks.map(mapStock),
      pagination: { page, limit, total },
    });
  } catch (error) {
    console.error("Stocks fetch failed:", error);
    return res.status(500).json({ message: "Unable to fetch stocks." });
  }
};

module.exports = {
  searchStocks,
  getSectors,
  getStockHistory,
  getStock,
  getStocks,
};
