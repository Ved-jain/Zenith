const { Schema } = require("mongoose");

const PriceHistorySchema = new Schema(
  {
    stockId: {
      type: Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    interval: {
      type: String,
      enum: ["1d"],
      default: "1d",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    open: {
      type: Number,
      required: true,
      min: 0,
    },
    high: {
      type: Number,
      required: true,
      min: 0,
    },
    low: {
      type: Number,
      required: true,
      min: 0,
    },
    close: {
      type: Number,
      required: true,
      min: 0,
    },
    volume: {
      type: Number,
      default: 0,
      min: 0,
    },
    previousClose: Number,
    change: Number,
    changePercent: Number,
    source: {
      type: String,
      default: "seed",
    },
  },
  { timestamps: true }
);

PriceHistorySchema.index(
  { symbol: 1, interval: 1, date: 1 },
  { unique: true }
);
PriceHistorySchema.index({ stockId: 1, interval: 1, date: 1 });

module.exports = { PriceHistorySchema };
