const TRADING_DAYS = 280;

const hashSymbol = (symbol) =>
  symbol.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

const roundPrice = (value) => Number(Math.max(value, 0.05).toFixed(2));

const getPreviousTradingDate = (fromDate, offset) => {
  const date = new Date(fromDate);
  let remaining = offset;

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() - 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return date;
};

const generatePriceHistory = (stock, tradingDays = TRADING_DAYS) => {
  const seed = hashSymbol(stock.symbol);
  const latestPrice = stock.latestPrice.price;
  const endDate = stock.latestPrice.asOf || new Date();
  const rows = [];
  let previousClose = latestPrice * (0.82 + (seed % 11) / 100);

  for (let index = tradingDays - 1; index >= 0; index -= 1) {
    const date = getPreviousTradingDate(endDate, index);
    const wave = Math.sin((tradingDays - index + seed) / 9) * 0.014;
    const drift = ((seed % 17) - 8) / 10000;
    const close = index === 0 ? latestPrice : previousClose * (1 + wave + drift);
    const open = previousClose * (1 + wave / 2);
    const high = Math.max(open, close) * (1 + 0.006 + (seed % 5) / 1000);
    const low = Math.min(open, close) * (1 - 0.006 - (seed % 3) / 1000);
    const change = close - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    rows.push({
      symbol: stock.symbol,
      interval: "1d",
      date,
      open: roundPrice(open),
      high: roundPrice(high),
      low: roundPrice(low),
      close: roundPrice(close),
      volume: Math.round(500000 + seed * 1000 + (tradingDays - index) * 1375),
      previousClose: roundPrice(previousClose),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      source: "seed",
    });

    previousClose = close;
  }

  return rows;
};

module.exports = { TRADING_DAYS, generatePriceHistory };
