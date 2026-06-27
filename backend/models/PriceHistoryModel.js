const { model } = require("mongoose");

const { PriceHistorySchema } = require("../schemas/PriceHistorySchema");

const PriceHistoryModel = model("PriceHistory", PriceHistorySchema);

module.exports = { PriceHistoryModel };
