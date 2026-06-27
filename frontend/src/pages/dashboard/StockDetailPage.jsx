import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import {
  getPortfolioHoldings,
  getPortfolioPositions,
  getStockDetail,
  getStockDetailHistory,
} from "../../api/stockDetails";
import StockPriceHistoryChart from "../../charts/StockPriceHistoryChart";
import GeneralContext, {
  GeneralContextProvider,
} from "../../dashboard/components/GeneralContext";
import { DASHBOARD_ROUTES } from "../../constants/routes";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  formatVolume,
} from "../../utils/formatters";

const SUPPORTED_RANGES = ["1M", "3M", "6M", "1Y"];

const normalizeSymbol = (value) => String(value || "").trim().toUpperCase();

function StockDetailContent() {
  const { symbol: routeSymbol } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const generalContext = useContext(GeneralContext);
  const symbol = normalizeSymbol(routeSymbol);
  const requestedRange = normalizeSymbol(searchParams.get("range"));
  const range = SUPPORTED_RANGES.includes(requestedRange) ? requestedRange : "3M";

  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [yearHistory, setYearHistory] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOwnership = useCallback(() => {
    // TODO: Replace with future GET /portfolio/symbol/:symbol when available.
    return Promise.all([getPortfolioHoldings(), getPortfolioPositions()]).then(
      ([holdingsRes, positionsRes]) => {
        setHoldings(holdingsRes.data);
        setPositions(positionsRes.data);
      }
    );
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    Promise.all([
      getStockDetail(symbol),
      getStockDetailHistory(symbol, "1Y"),
      loadOwnership(),
    ])
      .then(([stockRes, yearHistoryRes]) => {
        setStock(stockRes.data);
        setYearHistory(yearHistoryRes.data.data);
      })
      .catch(() => {
        setStock(null);
        setHistory([]);
        setYearHistory([]);
        setError("Stock not found.");
      })
      .finally(() => setIsLoading(false));
  }, [symbol, loadOwnership]);

  useEffect(() => {
    if (!symbol) return;

    setIsHistoryLoading(true);
    getStockDetailHistory(symbol, range)
      .then((res) => setHistory(res.data.data))
      .catch(() => setHistory([]))
      .finally(() => setIsHistoryLoading(false));
  }, [range, symbol]);

  useEffect(() => {
    const refreshOwnership = () => {
      loadOwnership().catch(() => {});
    };

    window.addEventListener("portfolio:refresh", refreshOwnership);
    return () => window.removeEventListener("portfolio:refresh", refreshOwnership);
  }, [loadOwnership]);

  const latestHistory = history[history.length - 1];
  const currentPrice =
    latestHistory?.close || stock?.latestPrice?.price || stock?.price || 0;
  const previousClose = latestHistory?.previousClose || stock?.latestPrice?.previousClose;
  const dayChangePercent =
    previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
  const high52Week = yearHistory.length
    ? Math.max(...yearHistory.map((row) => row.high || row.close || 0))
    : null;
  const low52Week = yearHistory.length
    ? Math.min(...yearHistory.map((row) => row.low || row.close || 0))
    : null;

  const holding = useMemo(
    () =>
      holdings.find(
        (item) => normalizeSymbol(item.symbol || item.name) === symbol
      ),
    [holdings, symbol]
  );
  const position = useMemo(
    () =>
      positions.find(
        (item) => normalizeSymbol(item.symbol || item.name) === symbol
      ),
    [positions, symbol]
  );
  const ownership = useMemo(() => {
    if (!holding) return null;

    const currentValue = holding.qty * currentPrice;
    const investedValue = holding.qty * holding.avg;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    const totalPortfolioValue = holdings.reduce((sum, item) => {
      const itemSymbol = normalizeSymbol(item.symbol || item.name);
      const value =
        itemSymbol === symbol ? item.qty * currentPrice : item.qty * item.price;
      return sum + value;
    }, 0);
    const allocationImpact =
      totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;

    return { currentValue, investedValue, pnl, pnlPercent, allocationImpact };
  }, [currentPrice, holding, holdings, symbol]);

  const handleRangeChange = (nextRange) => {
    setSearchParams({ range: nextRange });
  };

  const handleBuy = () => {
    generalContext.openBuyWindow(symbol, currentPrice);
  };

  const handleSell = () => {
    generalContext.openSellWindow(symbol, currentPrice);
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="content">
          <section className="dashboard-page">
            <div className="empty-state">
              <h3>Loading stock</h3>
              <p>Fetching company profile and price history.</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="dashboard-container">
        <div className="content">
          <section className="dashboard-page">
            <Link className="back-link" to={DASHBOARD_ROUTES.WATCHLIST}>
              Back to Watchlist
            </Link>
            <div className="empty-state">
              <h3>Stock not found</h3>
              <p>We could not find this symbol in the seeded stock universe.</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const infoFields = [
    ["Description", stock.description],
    ["Sector", stock.sector],
    ["Industry", stock.industry],
    [
      "Market cap",
      stock.fundamentals?.marketCap
        ? formatCompactNumber(stock.fundamentals.marketCap)
        : null,
    ],
    ["Currency", stock.currency],
    ["Tick size", stock.tickSize],
  ].filter(([, value]) => value);

  return (
    <div className="dashboard-container">
      <div className="content">
        <section className="dashboard-page stock-detail-page">
          <Link className="back-link" to={DASHBOARD_ROUTES.WATCHLIST}>
            Back to Watchlist
          </Link>

          <section className="panel stock-terminal-header">
            <div className="stock-quote-main">
              <div>
                <p className="eyebrow">Stock detail</p>
                <strong className="stock-symbol-title">{stock.symbol}</strong>
                <h1>{stock.companyName}</h1>
                <div className="stock-hero__meta">
                  <span>{stock.sector}</span>
                  <span>{stock.industry}</span>
                  <span>{stock.currency}</span>
                </div>
              </div>
            </div>
            <div className="stock-price-stack">
              <span>Last traded price</span>
              <strong>{formatCurrency(currentPrice)}</strong>
              <p className={dayChangePercent >= 0 ? "positive" : "negative"}>
                {formatPercent(dayChangePercent)} today
              </p>
            </div>
            <div className="stock-quote-grid">
              <div>
                <span>52W High</span>
                <strong>{high52Week ? formatCurrency(high52Week) : "NA"}</strong>
              </div>
              <div>
                <span>52W Low</span>
                <strong>{low52Week ? formatCurrency(low52Week) : "NA"}</strong>
              </div>
              <div>
                <span>Volume</span>
                <strong>{formatVolume(latestHistory?.volume || 0)}</strong>
              </div>
            </div>
            <div className="asset-actions">
              <button className="buy" type="button" onClick={handleBuy}>
                Buy
              </button>
              <button className="sell" type="button" onClick={handleSell}>
                Sell
              </button>
            </div>
          </section>

          <section className="panel stock-chart-dominant">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Price chart</p>
                <h2>{range} history</h2>
              </div>
              <div className="range-selector">
                {SUPPORTED_RANGES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={range === item ? "active" : ""}
                    onClick={() => handleRangeChange(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {isHistoryLoading ? (
              <div className="empty-state">
                <h3>Loading chart</h3>
                <p>Refreshing price history.</p>
              </div>
            ) : (
              <StockPriceHistoryChart data={history} />
            )}
          </section>

          <div className="dashboard-grid dashboard-grid--two">
            <section className="panel">
              <div className="panel__header">
                <div>
                  <p className="eyebrow">Company information</p>
                  <h2>About Company</h2>
                </div>
              </div>
              <div className="stock-info-list">
                {infoFields.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel__header">
                <div>
                  <p className="eyebrow">Portfolio ownership</p>
                  <h2>Your Position</h2>
                </div>
              </div>
              {holding && ownership ? (
                <div className="stock-info-list">
                  <div>
                    <span>Quantity</span>
                    <strong>{holding.qty}</strong>
                  </div>
                  <div>
                    <span>Average cost</span>
                    <strong>{formatCurrency(holding.avg)}</strong>
                  </div>
                  <div>
                    <span>Current value</span>
                    <strong>{formatCurrency(ownership.currentValue)}</strong>
                  </div>
                  <div>
                    <span>Unrealized P&L</span>
                    <strong className={ownership.pnl >= 0 ? "positive" : "negative"}>
                      {ownership.pnl >= 0 ? "+" : ""}
                      {formatCurrency(ownership.pnl)}
                    </strong>
                  </div>
                  <div>
                    <span>Unrealized P&L %</span>
                    <strong className={ownership.pnl >= 0 ? "positive" : "negative"}>
                      {ownership.pnl >= 0 ? "+" : ""}
                      {formatPercent(ownership.pnlPercent, { showSign: false })}
                    </strong>
                  </div>
                  <div>
                    <span>Position quantity</span>
                    <strong>{position?.qty || 0}</strong>
                  </div>
                  <div>
                    <span>Portfolio allocation impact</span>
                    <strong>
                      {formatPercent(ownership.allocationImpact, { showSign: false })}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="empty-state empty-state--compact">
                  <h3>Not Owned</h3>
                  <p>You do not currently hold this stock.</p>
                  <button className="buy" type="button" onClick={handleBuy}>
                    Buy Stock
                  </button>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

function StockDetailPage() {
  return (
    <GeneralContextProvider>
      <StockDetailContent />
    </GeneralContextProvider>
  );
}

export default StockDetailPage;
