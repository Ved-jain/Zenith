import React, { useEffect, useMemo, useState } from "react";

import apiClient from "../../api/client";
import OrdersOverTimeChart from "../../charts/OrdersOverTimeChart";
import {
  calculateMostTradedStocks,
  calculateOrderTimeline,
  calculateTradingSummary,
  sortOrdersNewestFirst,
} from "../../utils/tradingAnalytics";
import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatPercent,
} from "../../utils/formatters";

const getStatusClassName = (status) => {
  if (status === "EXECUTED") return "positive";
  if (status === "REJECTED") return "negative";
  return "";
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [didRequestFail, setDidRequestFail] = useState(false);

  useEffect(() => {
    apiClient
      .get("/orders")
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
        setDidRequestFail(false);
      })
      .catch(() => {
        setOrders([]);
        setDidRequestFail(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const sortedOrders = useMemo(() => sortOrdersNewestFirst(orders), [orders]);
  const summary = useMemo(() => calculateTradingSummary(orders), [orders]);
  const timeline = useMemo(() => calculateOrderTimeline(orders), [orders]);
  const mostTradedStocks = useMemo(
    () => calculateMostTradedStocks(orders).slice(0, 5),
    [orders]
  );
  const recentFeed = sortedOrders.slice(0, 10);

  const metrics = [
    {
      label: "Total Orders",
      value: summary.totalOrders,
      detail: "All submitted orders",
    },
    {
      label: "Executed Orders",
      value: summary.executedOrders,
      detail: "Completed successfully",
      tone: "positive",
    },
    {
      label: "Rejected Orders",
      value: summary.rejectedOrders,
      detail: "Rejected by validation",
      tone: summary.rejectedOrders > 0 ? "negative" : "",
    },
    {
      label: "Execution Rate",
      value: formatPercent(summary.executionRate, { showSign: false }),
      detail: "Executed / total orders",
    },
  ];

  return (
    <section className="dashboard-page orders-workspace">
      <div className="page-header">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Trading analytics workspace</h1>
        </div>
        <span className="page-header__meta">
          {didRequestFail ? "Orders unavailable" : "Real order history"}
        </span>
      </div>

      <div className="trading-strip orders-summary-strip">
        {metrics.map((metric) => (
          <article className="strip-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong className={metric.tone || ""}>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <section className="panel trading-chart-panel orders-chart-panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Orders over time</p>
            <h2>Daily order count</h2>
          </div>
          <span className="page-header__meta">
            {timeline.length ? `${timeline.length} trading days` : "No timeline"}
          </span>
        </div>
        {isLoading ? (
          <div className="empty-state">
            <h3>Loading orders</h3>
            <p>Fetching trading history.</p>
          </div>
        ) : (
          <OrdersOverTimeChart data={timeline} />
        )}
      </section>

      <div className="dashboard-grid dashboard-grid--two orders-analytics-grid">
        <section className="panel orders-table-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Order book</p>
              <h2>Orders table</h2>
            </div>
          </div>
          {sortedOrders.length ? (
            <div className="order-table orders-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order, index) => (
                    <tr key={order.id || `${order.symbol}-${order.date}-${index}`}>
                      <td data-label="Date">{formatDate(order.date)}</td>
                      <td data-label="Symbol">
                        <strong>{order.symbol}</strong>
                      </td>
                      <td data-label="Side">{order.side}</td>
                      <td data-label="Quantity">{formatCompactNumber(order.qty)}</td>
                      <td data-label="Price">{formatCurrency(order.price)}</td>
                      <td data-label="Value">{formatCurrency(order.value)}</td>
                      <td
                        data-label="Status"
                        className={getStatusClassName(order.status)}
                      >
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No orders yet</h3>
              <p>Buy or sell from the watchlist to build trading history.</p>
            </div>
          )}
        </section>

        <div className="orders-side-stack">
          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Most traded stocks</p>
                <h2>Top symbols</h2>
              </div>
            </div>
            {mostTradedStocks.length ? (
              <div className="data-table data-table--compact most-traded-table">
                <div className="data-table__head">
                  <span>Symbol</span>
                  <span>Trades</span>
                  <span>Volume</span>
                </div>
                {mostTradedStocks.map((stock) => (
                  <div className="data-table__row" key={stock.symbol}>
                    <strong>{stock.symbol}</strong>
                    <span>{stock.tradeCount}</span>
                    <span>{formatCompactNumber(stock.totalVolume)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state empty-state--compact">
                <h3>No traded symbols</h3>
                <p>Symbol analytics appear after orders exist.</p>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Trading activity feed</p>
                <h2>Recent orders</h2>
              </div>
            </div>
            {recentFeed.length ? (
              <div className="activity-feed">
                {recentFeed.map((order, index) => (
                  <article
                    className="activity-feed__item"
                    key={order.id || `${order.symbol}-${order.date}-${index}`}
                  >
                    <div>
                      <strong className={order.side === "SELL" ? "negative" : "positive"}>
                        {order.side}
                      </strong>
                      <span>{order.symbol}</span>
                    </div>
                    <small className={getStatusClassName(order.status)}>
                      {order.status}
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state empty-state--compact">
                <h3>No activity</h3>
                <p>Your latest orders will appear here.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
};

export default Orders;
