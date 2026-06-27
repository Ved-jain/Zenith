require("dotenv").config();

const mongoose = require("mongoose");

const { indianStocks } = require("../data/indianStocks.seed");
const { generatePriceHistory, TRADING_DAYS } = require("../data/priceHistory.seed");
const { PriceHistoryModel } = require("../models/PriceHistoryModel");
const { StockModel } = require("../models/StockModel");

const seedStocks = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required.");
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });

  let stocksUpserted = 0;
  let historyUpserted = 0;

  for (const stock of indianStocks) {
    const savedStock = await StockModel.findOneAndUpdate(
      { symbol: stock.symbol },
      { $set: stock },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    stocksUpserted += 1;

    const historyRows = generatePriceHistory(stock, TRADING_DAYS).map((row) => ({
      updateOne: {
        filter: {
          symbol: row.symbol,
          interval: row.interval,
          date: row.date,
        },
        update: {
          $set: {
            ...row,
            stockId: savedStock._id,
          },
        },
        upsert: true,
      },
    }));

    if (historyRows.length) {
      const result = await PriceHistoryModel.bulkWrite(historyRows, {
        ordered: false,
      });
      historyUpserted += result.upsertedCount + result.modifiedCount;
    }
  }

  console.log(
    JSON.stringify(
      {
        stocksInSeed: indianStocks.length,
        stocksUpserted,
        tradingDaysPerStock: TRADING_DAYS,
        historyUpserted,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

seedStocks().catch(async (error) => {
  console.error("Stock seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
