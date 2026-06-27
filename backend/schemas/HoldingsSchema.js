const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
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
  avg: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  net: { type: Number, default: 0 },
  day: { type: Number, default: 0 },
});

HoldingsSchema.index({ userId: 1, name: 1 });
HoldingsSchema.index({ userId: 1, symbol: 1 });

module.exports = { HoldingsSchema };
