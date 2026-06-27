const mongoose = require("mongoose");

const { HoldingsModel } = require("../models/HoldingsModel");
const { OrdersModel } = require("../models/OrdersModel");
const { PositionsModel } = require("../models/PositionsModel");
const { StockModel } = require("../models/StockModel");
const { calculatePortfolioSummary } = require("./portfolioSummary");

const PRODUCT = "CNC";
const MARKET_ORDER = "MARKET";

class TradeValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "TradeValidationError";
    this.statusCode = statusCode;
  }
}

const normalizeTradeInput = (body) => {
  const symbol = String(body.symbol || body.name || "").trim().toUpperCase();
  const name = String(body.name || symbol || "").trim().toUpperCase();
  const mode = String(body.mode || "").trim().toUpperCase();
  const orderType = String(body.orderType || MARKET_ORDER).trim().toUpperCase();
  const qty = Number(body.qty);
  const price = Number(body.price);

  if (!symbol || !name) {
    throw new TradeValidationError("Symbol is required.");
  }

  if (!["BUY", "SELL"].includes(mode)) {
    throw new TradeValidationError("Order mode must be BUY or SELL.");
  }

  if (orderType !== MARKET_ORDER) {
    throw new TradeValidationError("Only MARKET orders are supported.");
  }

  if (!Number.isFinite(qty) || qty <= 0) {
    throw new TradeValidationError("Quantity must be greater than 0.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new TradeValidationError("Price must be greater than 0.");
  }

  return { symbol, name, mode, orderType, qty, price };
};

const resolveStockTrade = async (trade, session) => {
  const stock = await StockModel.findOne({
    active: true,
    $or: [{ symbol: trade.symbol }, { displayName: trade.name }, { companyName: trade.name }],
  }).session(session || null).lean();

  if (!stock) {
    throw new TradeValidationError("Unknown stock symbol.");
  }

  return {
    ...trade,
    symbol: stock.symbol,
    name: stock.displayName || stock.companyName || stock.symbol,
    price: trade.price || stock.latestPrice?.price,
    stockId: stock._id,
    version: stock.version || 0,
    availableQuantity: stock.availableQuantity || 0
  };
};

const buildOrderPayload = (userId, trade, status, rejectionReason) => ({
  userId,
  symbol: trade.symbol,
  name: trade.name,
  qty: trade.qty,
  price: trade.price,
  mode: trade.mode,
  orderType: trade.orderType,
  status,
  rejectionReason,
  totalValue: trade.qty * trade.price,
  executedAt: new Date(),
});

const createOptions = (session) => (session ? { session } : undefined);

const findHolding = (userId, trade, session) =>
  HoldingsModel.findOne({
    userId,
    $or: [{ symbol: trade.symbol }, { name: trade.name }],
  }).session(session || null);

const findPosition = (userId, trade, session) =>
  PositionsModel.findOne({
    userId,
    product: PRODUCT,
    $or: [{ symbol: trade.symbol }, { name: trade.name }],
  }).session(session || null);

const executeBuy = async (userId, trade, session) => {
  let holding = await findHolding(userId, trade, session);

  if (holding) {
    const newQty = holding.qty + trade.qty;
    holding.avg = ((holding.qty * holding.avg) + (trade.qty * trade.price)) / newQty;
    holding.qty = newQty;
    holding.price = trade.price;
    holding.symbol = trade.symbol;
    holding.name = trade.name;
    holding.net = holding.net || 0;
    holding.day = holding.day || 0;
    await holding.save({ session });
  } else {
    holding = await HoldingsModel.create(
      [
        {
          userId,
          symbol: trade.symbol,
          name: trade.name,
          qty: trade.qty,
          avg: trade.price,
          price: trade.price,
          net: 0,
          day: 0,
        },
      ],
      createOptions(session)
    ).then((docs) => docs[0]);
  }

  let position = await findPosition(userId, trade, session);

  if (position) {
    const newQty = position.qty + trade.qty;
    position.avg = ((position.qty * position.avg) + (trade.qty * trade.price)) / newQty;
    position.qty = newQty;
    position.price = trade.price;
    position.symbol = trade.symbol;
    position.name = trade.name;
    position.net = position.net || 0;
    position.day = position.day || 0;
    position.isLoss = position.price < position.avg;
    await position.save({ session });
  } else {
    position = await PositionsModel.create(
      [
        {
          userId,
          product: PRODUCT,
          symbol: trade.symbol,
          name: trade.name,
          qty: trade.qty,
          avg: trade.price,
          price: trade.price,
          net: 0,
          day: 0,
          isLoss: false,
        },
      ],
      createOptions(session)
    ).then((docs) => docs[0]);
  }

  const order = await OrdersModel.create(
    [buildOrderPayload(userId, trade, "EXECUTED")],
    createOptions(session)
  ).then((docs) => docs[0]);

  return { order, holding, position };
};

const executeSell = async (userId, trade, session) => {
  const holding = await findHolding(userId, trade, session);

  if (!holding || holding.qty < trade.qty) {
    const ownedQty = holding ? holding.qty : 0;
    const rejectionReason = `Insufficient quantity. Owned ${ownedQty}, requested ${trade.qty}.`;
    const order = await OrdersModel.create(
      [buildOrderPayload(userId, trade, "REJECTED", rejectionReason)],
      createOptions(session)
    ).then((docs) => docs[0]);

    return {
      order,
      holding,
      position: await findPosition(userId, trade, session),
      rejected: true,
      rejectionReason,
    };
  }

  const nextHoldingQty = holding.qty - trade.qty;
  let updatedHolding = holding;

  if (nextHoldingQty === 0) {
    await HoldingsModel.deleteOne({ _id: holding._id }).session(session || null);
    updatedHolding = null;
  } else {
    holding.qty = nextHoldingQty;
    holding.price = trade.price;
    holding.symbol = trade.symbol;
    holding.name = trade.name;
    holding.isLoss = holding.price < holding.avg;
    await holding.save({ session });
  }

  const position = await findPosition(userId, trade, session);
  let updatedPosition = position;

  if (position) {
    const nextPositionQty = Math.max(position.qty - trade.qty, 0);

    if (nextPositionQty === 0) {
      await PositionsModel.deleteOne({ _id: position._id }).session(session || null);
      updatedPosition = null;
    } else {
      position.qty = nextPositionQty;
      position.price = trade.price;
      position.symbol = trade.symbol;
      position.name = trade.name;
      position.isLoss = position.price < position.avg;
      await position.save({ session });
    }
  }

  const order = await OrdersModel.create(
    [buildOrderPayload(userId, trade, "EXECUTED")],
    createOptions(session)
  ).then((docs) => docs[0]);

  return { order, holding: updatedHolding, position: updatedPosition };
};

const executeTradeInSession = async (userId, trade, session) => {
  const result =
    trade.mode === "BUY"
      ? await executeBuy(userId, trade, session)
      : await executeSell(userId, trade, session);
  const summary = await calculatePortfolioSummary(userId, { session });
  return { ...result, summary };
};

const executeOrder = async (userId, body) => {
  const normalizedTrade = normalizeTradeInput(body);
  const session = await mongoose.startSession();

  let attempt = 1;
  const MAX_RETRIES = 3;

  try {
    while (attempt <= MAX_RETRIES) {
      try {
        let result;
        const startTime = Date.now();
        
        console.log(`[Transaction] Started: ${normalizedTrade.mode} ${normalizedTrade.symbol} ${normalizedTrade.qty}`);
        
        // Why transactions are needed here:
        // We are modifying multiple collections (Stocks, Holdings, Positions, Orders) 
        // simultaneously. Without transactions, if one update succeeds but another fails 
        // (e.g. database crashes or network issue), we end up with data inconsistency 
        // (e.g., money deducted but stock not credited).
        
        session.startTransaction();

        // We resolve the stock trade inside the transaction to get the latest version for optimistic locking.
        const trade = await resolveStockTrade(normalizedTrade, session);

        // What optimistic locking means:
        // We check the document version before updating it. If the version has changed 
        // since we read it, it means another transaction modified it concurrently,
        // and we have a write conflict.
        
        let stockUpdateInc = 0;
        if (trade.mode === "BUY") {
          if (trade.availableQuantity < trade.qty) {
            throw new TradeValidationError(`Insufficient stock available. Only ${trade.availableQuantity} left.`);
          }
          stockUpdateInc = -trade.qty;
        } else {
          stockUpdateInc = trade.qty; // SELL adds back to available quantity
        }
        
        const stockUpdateResult = await StockModel.updateOne(
          { _id: trade.stockId, version: trade.version },
          { $inc: { availableQuantity: stockUpdateInc, version: 1 } },
          { session }
        );
        
        if (stockUpdateResult.modifiedCount === 0) {
          // Why we retry on write conflicts:
          // In high-concurrency systems, multiple users might try to buy the same stock 
          // at the exact same millisecond. Instead of failing the user's request immediately, 
          // we retry it a few times to see if it can succeed after the other transaction finishes.
          throw new Error("Write conflict: Stock was updated by another transaction");
        }

        result = await executeTradeInSession(userId, trade, session);
        
        await session.commitTransaction();
        const duration = Date.now() - startTime;
        console.log(`[Transaction] Committed in ${duration}ms`);
        
        return result;
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        
        const isWriteConflict = error.message.includes("Write conflict") || error.hasErrorLabel?.('TransientTransactionError');
        
        if (isWriteConflict) {
          console.log(`[Transaction] Aborted - Write conflict`);
          if (attempt < MAX_RETRIES) {
            console.log(`[Transaction] Retrying attempt ${attempt} of ${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
            attempt++;
            continue;
          } else {
            console.log(`[Transaction] Aborted - Max retries reached`);
            throw new TradeValidationError("Order failed due to high demand, please try again");
          }
        }
        
        console.log(`[Transaction] Aborted - ${error.message}`);
        
        // If it's not a write conflict or unsupported transaction, just throw
        const transactionUnsupported =
          error.message.includes("Transaction numbers are only allowed") ||
          error.message.includes("replica set member or mongos");

        if (!transactionUnsupported) {
          throw error;
        }

        // Fallback for non-transactional execution (if MongoDB doesn't support it locally)
        const tradeFallback = await resolveStockTrade(normalizedTrade, null);
        let fallbackInc = tradeFallback.mode === "BUY" ? -tradeFallback.qty : tradeFallback.qty;
        await StockModel.updateOne(
          { _id: tradeFallback.stockId },
          { $inc: { availableQuantity: fallbackInc, version: 1 } }
        );
        return executeTradeInSession(userId, tradeFallback, null);
      }
    }
  } finally {
    await session.endSession();
  }
};

module.exports = { TradeValidationError, executeOrder };
