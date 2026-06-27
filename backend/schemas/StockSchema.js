const { Schema } = require("mongoose");

const StockSchema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    exchange: {
      type: String,
      required: true,
      enum: ["NSE", "BSE"],
      default: "NSE",
    },
    currency: {
      type: String,
      required: true,
      enum: ["INR"],
      default: "INR",
    },
    tickSize: {
      type: Number,
      min: 0,
      default: 0.05,
    },
    isin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    marketCapCategory: {
      type: String,
      enum: ["Large Cap", "Mid Cap", "Small Cap"],
      default: "Large Cap",
    },
    description: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    tags: [String],
    latestPrice: {
      price: Number,
      previousClose: Number,
      change: Number,
      changePercent: Number,
      asOf: Date,
    },
    fundamentals: {
      marketCap: Number,
      peRatio: Number,
      eps: Number,
      dividendYield: Number,
    },
    availableQuantity: {
      type: Number,
      default: 1000000,
      min: 0,
    },
    version: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

StockSchema.index({ symbol: 1 }, { unique: true });
StockSchema.index({ sector: 1, active: 1 });
StockSchema.index({
  companyName: "text",
  symbol: "text",
  displayName: "text",
});

module.exports = { StockSchema };
