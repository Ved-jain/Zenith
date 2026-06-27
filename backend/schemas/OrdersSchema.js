const { Schema } = require("mongoose");

const OrdersSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mode: {
      type: String,
      required: true,
      enum: ["BUY", "SELL"],
      uppercase: true,
    },
    orderType: {
      type: String,
      required: true,
      enum: ["MARKET"],
      default: "MARKET",
      uppercase: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["EXECUTED", "REJECTED"],
      default: "EXECUTED",
      uppercase: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

OrdersSchema.index({ userId: 1, createdAt: -1 });

module.exports = { OrdersSchema };
