require("dotenv").config();

const mongoose = require("mongoose");

const { HoldingsModel } = require("../models/HoldingsModel");
const { OrdersModel } = require("../models/OrdersModel");
const { PositionsModel } = require("../models/PositionsModel");
const { StockModel } = require("../models/StockModel");

const backfillCollection = async (label, model, stockSymbols) => {
  const records = await model.find({
    $or: [{ symbol: { $exists: false } }, { symbol: null }, { symbol: "" }],
  });
  let matched = 0;
  const unmatched = [];

  for (const record of records) {
    const candidate = String(record.name || "").trim().toUpperCase();

    if (stockSymbols.has(candidate)) {
      await model.updateOne({ _id: record._id }, { $set: { symbol: candidate } });
      matched += 1;
    } else {
      unmatched.push({ collection: label, id: record._id, name: record.name });
    }
  }

  return { matched, unmatched };
};

const run = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required.");
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });

  const stocks = await StockModel.find({ active: true }).select("symbol").lean();
  const stockSymbols = new Set(stocks.map((stock) => stock.symbol));

  const holdings = await backfillCollection("holdings", HoldingsModel, stockSymbols);
  const positions = await backfillCollection("positions", PositionsModel, stockSymbols);
  const orders = await backfillCollection("orders", OrdersModel, stockSymbols);

  console.log(
    JSON.stringify(
      {
        holdingsMatched: holdings.matched,
        positionsMatched: positions.matched,
        ordersMatched: orders.matched,
        unmatched: [
          ...holdings.unmatched,
          ...positions.unmatched,
          ...orders.unmatched,
        ],
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Symbol backfill failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
