const { model } = require("mongoose");

const { StockSchema } = require("../schemas/StockSchema");

const StockModel = model("Stock", StockSchema);

module.exports = { StockModel };
