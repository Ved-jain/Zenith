import React from "react";
import { Link } from "react-router-dom";

import { getStockDetailPath } from "../constants/routes";
import { formatCurrency, formatPercent } from "../utils/formatters";

const TopMoversTable = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="empty-state">
        <h3>No movers yet</h3>
        <p>Top movers appear after price history is available.</p>
      </div>
    );
  }

  return (
    <div className="data-table data-table--compact">
      <div className="data-table__head">
        <span>Symbol</span>
        <span>Price</span>
        <span>Day</span>
      </div>
      {data.map((stock) => (
        <div className="data-table__row" key={stock.symbol}>
          <strong>
            <Link className="symbol-link" to={getStockDetailPath(stock.symbol)}>
              {stock.symbol}
            </Link>
          </strong>
          <span>{formatCurrency(stock.price)}</span>
          <span className={stock.dayChangePercent >= 0 ? "positive" : "negative"}>
            {formatPercent(stock.dayChangePercent)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TopMoversTable;
