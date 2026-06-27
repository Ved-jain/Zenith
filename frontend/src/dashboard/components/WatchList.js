import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import GeneralContext from "./GeneralContext";
import { getStock, getStockHistory, getStocks } from "../../api/stocks";
import StockPriceHistoryChart from "../../charts/StockPriceHistoryChart";
import { getStockDetailPath } from "../../constants/routes";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
} from "../../utils/formatters";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { watchlist } from "../data/data";

const mapStockToWatchlistItem = (stock) => {
  const latestPrice = stock.latestPrice || {};
  const changePercent = Number(latestPrice.changePercent || 0);
  const price = Number(latestPrice.price || stock.price || 0);
  const symbol = stock.symbol || stock.name;

  return {
    symbol,
    name: symbol,
    displayName: stock.displayName || stock.companyName || stock.name || symbol,
    companyName: stock.companyName,
    sector: stock.sector,
    logoUrl: stock.logoUrl,
    price,
    percent: formatPercent(changePercent),
    isDown: changePercent < 0,
    signal: stock.sector ? `${stock.sector} exposure` : stock.signal,
  };
};

const fallbackWatchlist = watchlist.map((stock) =>
  mapStockToWatchlistItem({
    ...stock,
    symbol: stock.symbol || stock.name,
    displayName: stock.displayName || stock.name,
    latestPrice: {
      price: stock.price,
      changePercent: Number.parseFloat(stock.percent),
    },
  })
);

const WatchList = () => {
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState(fallbackWatchlist);
  const [selectedAsset, setSelectedAsset] = useState(fallbackWatchlist[0]);
  const [didStocksRequestFail, setDidStocksRequestFail] = useState(false);

  useEffect(() => {
    getStocks({ limit: 50 })
      .then((res) => {
        const mappedStocks = res.data.data.map(mapStockToWatchlistItem);
        if (mappedStocks.length) {
          setStocks(mappedStocks);
          setSelectedAsset(mappedStocks[0]);
          setDidStocksRequestFail(false);
        }
      })
      .catch(() => {
        setStocks(fallbackWatchlist);
        setSelectedAsset(fallbackWatchlist[0]);
        setDidStocksRequestFail(true);
      });
  }, []);

  const filteredWatchlist = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return stocks;
    return stocks.filter((stock) =>
      [stock.symbol, stock.displayName, stock.companyName, stock.sector]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [query, stocks]);

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h1>Tracked assets and local signals</h1>
        </div>
        <span className="page-header__meta">
          {stocks.length} tracked{didStocksRequestFail ? " - local fallback" : ""}
        </span>
      </div>

      <div className="watchlist-layout">
        <section className="panel watchlist-panel">
          <label className="field-label" htmlFor="watchlist-search">
            Search this watchlist
          </label>
          <input
            type="text"
            name="search"
            id="watchlist-search"
            placeholder="Search symbols"
            className="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="watchlist-tabs" aria-label="Saved watchlists">
            <button type="button" className="active">
              Core
            </button>
            <button type="button">Review</button>
            <button type="button">Long term</button>
          </div>

          {filteredWatchlist.length ? (
            <ul className="list">
              {filteredWatchlist.map((stock) => (
                <WatchListItem
                  stock={stock}
                  key={stock.symbol}
                  isSelected={selectedAsset?.symbol === stock.symbol}
                  onSelect={() => setSelectedAsset(stock)}
                />
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <h3>No matching assets</h3>
              <p>Clear the local watchlist search to see all tracked symbols.</p>
            </div>
          )}
        </section>

        <AssetDetail stock={selectedAsset} />
      </div>
    </section>
  );
};

export default WatchList;

const WatchListItem = ({ stock, isSelected, onSelect }) => {
  return (
    <li className={isSelected ? "selected" : ""}>
      <button className="watchlist-row" type="button" onClick={() => onSelect(stock)}>
        <div>
          <strong className={stock.isDown ? "down" : "up"}>{stock.symbol}</strong>
          <span>{stock.displayName}</span>
        </div>
        <div className="item-info">
          <span className={stock.isDown ? "negative" : "positive"}>
            {stock.percent}
          </span>
          {stock.isDown ? (
            <KeyboardArrowDown className="negative" />
          ) : (
            <KeyboardArrowUp className="positive" />
          )}
          <strong>{formatCurrency(stock.price)}</strong>
        </div>
      </button>
    </li>
  );
};

const AssetDetail = ({ stock }) => {
  const navigate = useNavigate();
  const [stockDetail, setStockDetail] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [yearHistory, setYearHistory] = useState([]);

  useEffect(() => {
    if (!stock?.symbol) return;

    setStockDetail(null);
    setPriceHistory([]);
    setYearHistory([]);

    Promise.all([
      getStock(stock.symbol),
      getStockHistory(stock.symbol, { range: "3M" }),
      getStockHistory(stock.symbol, { range: "1Y" }),
    ])
      .then(([detailRes, historyRes, yearHistoryRes]) => {
        setStockDetail(detailRes.data);
        setPriceHistory(historyRes.data.data);
        setYearHistory(yearHistoryRes.data.data);
      })
      .catch(() => {
        setStockDetail(null);
        setPriceHistory([]);
        setYearHistory([]);
      });
  }, [stock?.symbol]);

  if (!stock) {
    return (
      <section className="panel asset-detail">
        <div className="empty-state">
          <h3>Select an asset</h3>
          <p>Choose a watchlist row to review price, signal, and actions.</p>
        </div>
      </section>
    );
  }

  const detail = stockDetail || stock;
  const high52Week = yearHistory.length
    ? Math.max(...yearHistory.map((row) => row.high || row.close || 0))
    : null;
  const low52Week = yearHistory.length
    ? Math.min(...yearHistory.map((row) => row.low || row.close || 0))
    : null;

  return (
    <section className="panel asset-detail">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Asset detail</p>
          <h2>{stock.symbol}</h2>
          <p className="asset-detail__subtitle">{stock.displayName}</p>
        </div>
        <span className={stock.isDown ? "negative" : "positive"}>
          {stock.percent}
        </span>
      </div>

      <div className="asset-identity">
        {stock.logoUrl ? (
          <img src={stock.logoUrl} alt={`${stock.displayName} logo`} />
        ) : (
          <span>{stock.symbol.slice(0, 2)}</span>
        )}
        <div>
          <strong>{detail.companyName || stock.companyName || stock.displayName}</strong>
          <p>{detail.sector || stock.sector || stock.signal}</p>
        </div>
      </div>

      <div className="asset-price-card">
        <span>Last traded price</span>
        <strong>{formatCurrency(stock.price)}</strong>
        <p>{stock.signal}</p>
      </div>

      <div className="stock-meta-grid">
        <article>
          <span>Industry</span>
          <strong>{detail.industry || "Not available"}</strong>
        </article>
        <article>
          <span>Market cap</span>
          <strong>
            {detail.fundamentals?.marketCap
              ? formatCompactNumber(detail.fundamentals.marketCap)
              : "Not available"}
          </strong>
        </article>
        <article>
          <span>52 week high</span>
          <strong>{high52Week ? formatCurrency(high52Week) : "Not available"}</strong>
        </article>
        <article>
          <span>52 week low</span>
          <strong>{low52Week ? formatCurrency(low52Week) : "Not available"}</strong>
        </article>
        <article>
          <span>Currency</span>
          <strong>{detail.currency || "INR"}</strong>
        </article>
      </div>

      <StockPriceHistoryChart data={priceHistory} />

      <WatchListActions
        uid={stock.symbol}
        price={stock.price}
        onOpenDetail={() => navigate(getStockDetailPath(stock.symbol))}
      />
    </section>
  );
};

const WatchListActions = ({ uid, price, onOpenDetail }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid, price);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid, price);
  };

  return (
    <div className="asset-actions">
      <Tooltip
        title="Buy"
        placement="top"
        arrow
        TransitionComponent={Grow}
        onClick={handleBuyClick}
      >
        <button className="buy" type="button">
          Buy
        </button>
      </Tooltip>
      <Tooltip
        title="Sell"
        placement="top"
        arrow
        TransitionComponent={Grow}
        onClick={handleSellClick}
      >
        <button className="sell" type="button">
          Sell
        </button>
      </Tooltip>
      <Tooltip title="Open detail" placement="top" arrow TransitionComponent={Grow}>
        <button className="action" type="button" onClick={onOpenDetail}>
          <BarChartOutlined className="icon" />
        </button>
      </Tooltip>
      <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
        <button className="action" type="button">
          <MoreHoriz className="icon" />
        </button>
      </Tooltip>
    </div>
  );
};
