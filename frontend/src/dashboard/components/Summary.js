import React, { useEffect, useState } from "react";
import {
  getAllocation,
  getOverview,
  getPortfolioPerformance,
  getSectorExposure,
  getTopMovers,
} from "../../api/analytics";
import apiClient from "../../api/client";
import PortfolioPerformanceChart from "../../charts/PortfolioPerformanceChart";
import TopMoversTable from "../../charts/TopMoversTable";
import { formatCurrency, formatPercent } from "../../utils/formatters";

const Summary = () => {
  const [overview, setOverview] = useState(null);
  const [allocation, setAllocation] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [topMovers, setTopMovers] = useState([]);
  const [didAnalyticsRequestFail, setDidAnalyticsRequestFail] = useState(false);

  useEffect(() => {
    Promise.all([
      getOverview(),
      getSectorExposure(),
      getTopMovers(),
      getPortfolioPerformance("3M"),
      getAllocation(),
    ])
      .then(([overviewRes, sectorRes, moversRes, performanceRes, allocationRes]) => {
        setOverview(overviewRes.data);
        setSectors(sectorRes.data);
        setTopMovers(moversRes.data);
        setPerformance(performanceRes.data);
        setAllocation(allocationRes.data);
        setDidAnalyticsRequestFail(false);
      })
      .catch(() => {
        setOverview(null);
        setSectors([]);
        setTopMovers([]);
        setPerformance([]);
        setAllocation([]);
        setDidAnalyticsRequestFail(true);
      });

    apiClient
      .get("/orders")
      .then((res) => setRecentOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecentOrders([]));
  }, []);

  const hasHoldings = overview?.investedValue > 0;
  const dailyPulse =
    topMovers.length > 0
      ? topMovers.reduce((sum, stock) => sum + stock.dayChangePercent, 0) /
        topMovers.length
      : 0;

  const metrics = [
    {
      label: "Portfolio value",
      value: formatCurrency(overview?.currentValue || 0),
      detail: hasHoldings ? "Across your holdings" : "No holdings yet",
    },
    {
      label: "Today's change",
      value: formatPercent(dailyPulse),
      detail: topMovers.length ? "Average watched move" : "Awaiting market data",
      tone: dailyPulse >= 0 ? "positive" : "negative",
    },
    {
      label: "Total P&L",
      value: `${(overview?.pnl || 0) >= 0 ? "+" : ""}${formatCurrency(
        overview?.pnl || 0
      )}`,
      detail: `${formatPercent(overview?.pnlPercent || 0)} overall`,
      tone: (overview?.pnl || 0) >= 0 ? "positive" : "negative",
    },
    {
      label: "Holdings count",
      value: allocation.length,
      detail: hasHoldings
        ? `${overview?.largestSector || "Mixed"} leads allocation`
        : "No active holdings",
    },
  ];

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Portfolio clarity at a glance</h1>
        </div>
        <span className="page-header__meta">
          {didAnalyticsRequestFail ? "Analytics unavailable" : "Live analytics"}
        </span>
      </div>

      <div className="trading-strip overview-strip">
        {metrics.map((metric) => (
          <article className="strip-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong className={metric.tone || ""}>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <section className="panel trading-chart-panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Portfolio performance</p>
            <h2>Value trend</h2>
          </div>
          <span className="page-header__meta">
            Health score {overview?.healthScore || 0}
          </span>
        </div>
        <PortfolioPerformanceChart data={performance} />
      </section>

      <div className="dashboard-grid dashboard-grid--two overview-market-grid">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Sector allocation</p>
              <h2>Capital by theme</h2>
            </div>
          </div>
          {sectors.length ? (
            <div className="sector-grid sector-grid--compact">
              {sectors.map((sector) => (
                <article className="sector-card" key={sector.sector}>
                  <div>
                    <strong>{sector.sector}</strong>
                    <span>{formatCurrency(sector.value)}</span>
                  </div>
                  <div className="sector-card__bar">
                    <span style={{ width: `${sector.percentage}%` }} />
                  </div>
                  <p>{formatPercent(sector.percentage, { showSign: false })} of portfolio</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No sector exposure</h3>
              <p>Sector analytics will appear after holdings are available.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Top movers</p>
              <h2>What changed today</h2>
            </div>
          </div>
          <TopMoversTable data={topMovers} />
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid--two activity-grid">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2>Portfolio signals</h2>
            </div>
          </div>
          <div className="data-table data-table--compact activity-table">
            <div className="data-table__head">
              <span>Signal</span>
              <span>Value</span>
              <span>Status</span>
            </div>
            <div className="data-table__row">
              <strong>Health score</strong>
              <span>{overview?.healthScore || 0}</span>
              <span>{hasHoldings ? "Active" : "Waiting"}</span>
            </div>
            <div className="data-table__row">
              <strong>Largest exposure</strong>
              <span>{overview?.largestSector || "None"}</span>
              <span>{hasHoldings ? "Tracked" : "None"}</span>
            </div>
            <div className="data-table__row">
              <strong>Cash ready</strong>
              <span>{formatCurrency(overview?.cashReady || 0)}</span>
              <span>Available</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Recent Trading Activity</p>
              <h2>Latest orders</h2>
            </div>
          </div>
          {recentOrders.length ? (
            <div className="data-table data-table--compact orders-mini-table">
              <div className="data-table__head">
                <span>Symbol</span>
                <span>Side</span>
                <span>Status</span>
              </div>
              {recentOrders.slice(0, 5).map((order, index) => (
                <div
                  className="data-table__row"
                  key={order.id || order._id || `${order.symbol || order.name}-${index}`}
                >
                  <strong>{order.symbol || order.name}</strong>
                  <span>{order.mode}</span>
                  <span className={order.status === "REJECTED" ? "negative" : "positive"}>
                    {order.status || "EXECUTED"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No recent orders</h3>
              <p>Executed orders will appear here after trading activity.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default Summary;
