const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const normalizeOrder = (order = {}) => {
  const qty = toNumber(order.qty ?? order.quantity);
  const price = toNumber(order.price);
  const symbol = String(order.symbol || order.name || "UNKNOWN").toUpperCase();
  const side = String(order.mode || order.side || "UNKNOWN").toUpperCase();
  const status = String(order.status || "PENDING").toUpperCase();
  const date = order.executedAt || order.createdAt || order.updatedAt || new Date();

  return {
    ...order,
    id: order.id || order._id,
    date,
    price,
    qty,
    side,
    status,
    symbol,
    value: toNumber(order.totalValue) || qty * price,
  };
};

export const calculateExecutionStats = (orders = []) => {
  const normalizedOrders = orders.map(normalizeOrder);
  const totalOrders = normalizedOrders.length;
  const executedOrders = normalizedOrders.filter(
    (order) => order.status === "EXECUTED"
  ).length;
  const rejectedOrders = normalizedOrders.filter(
    (order) => order.status === "REJECTED"
  ).length;
  const pendingOrders = normalizedOrders.filter(
    (order) => order.status === "PENDING"
  ).length;
  const executionRate =
    totalOrders > 0 ? (executedOrders / totalOrders) * 100 : 0;

  return {
    totalOrders,
    executedOrders,
    rejectedOrders,
    pendingOrders,
    executionRate,
  };
};

export const calculateTradingSummary = (orders = []) =>
  calculateExecutionStats(orders);

export const calculateOrderTimeline = (orders = []) => {
  const groupedOrders = orders.map(normalizeOrder).reduce((groups, order) => {
    const date = new Date(order.date);

    if (Number.isNaN(date.getTime())) {
      return groups;
    }

    const key = date.toISOString().slice(0, 10);
    const existing = groups.get(key) || {
      date: key,
      totalOrders: 0,
      executedOrders: 0,
      rejectedOrders: 0,
      totalValue: 0,
    };

    existing.totalOrders += 1;
    existing.totalValue += order.value;

    if (order.status === "EXECUTED") {
      existing.executedOrders += 1;
    }

    if (order.status === "REJECTED") {
      existing.rejectedOrders += 1;
    }

    groups.set(key, existing);
    return groups;
  }, new Map());

  return [...groupedOrders.values()].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

export const calculateMostTradedStocks = (orders = []) => {
  const groupedOrders = orders.map(normalizeOrder).reduce((groups, order) => {
    const existing = groups.get(order.symbol) || {
      symbol: order.symbol,
      tradeCount: 0,
      totalVolume: 0,
    };

    existing.tradeCount += 1;
    existing.totalVolume += order.qty;

    groups.set(order.symbol, existing);
    return groups;
  }, new Map());

  return [...groupedOrders.values()].sort(
    (a, b) => b.tradeCount - a.tradeCount || b.totalVolume - a.totalVolume
  );
};

export const sortOrdersNewestFirst = (orders = []) =>
  orders
    .map(normalizeOrder)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
