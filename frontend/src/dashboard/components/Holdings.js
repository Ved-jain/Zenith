import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Positions from "./Positions";
import { holdings as fallbackHoldings } from "../data/data";
import apiClient from "../../api/client";
import {
  getAllocation,
  getPortfolioPerformance,
  getSectorExposure,
} from "../../api/analytics";
import AllocationChart from "../../charts/AllocationChart";
import PortfolioPerformanceChart from "../../charts/PortfolioPerformanceChart";
import SectorExposureChart from "../../charts/SectorExposureChart";
import { getStockDetailPath } from "../../constants/routes";
import { formatCurrency, formatPercent } from "../../utils/formatters";

const HoldingsTable = ({ holdings }) => {
  if (!holdings.length) {
    return (
      <div className="empty-state">
        <h3>No holdings yet</h3>
        <p>Add holdings to see value, returns, and sector exposure.</p>
      </div>
    );
  }

  return (
    <div className="order-table">
      <table>
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg. cost</th>
            <th>LTP</th>
            <th>Cur. val</th>
            <th>P&L</th>
            <th>Net chg.</th>
            <th>Day chg.</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((stock, index) => {
            const curValue = stock.price * stock.qty;
            const pnl = curValue - stock.avg * stock.qty;
            const isProfit = pnl >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = stock.isLoss ? "loss" : "profit";

            const instrument = stock.symbol || stock.name;

            return (
              <tr key={`${instrument}-${index}`}>
                <td data-label="Instrument">
                  <Link className="symbol-link" to={getStockDetailPath(instrument)}>
                    {instrument}
                  </Link>
                </td>
                <td data-label="Qty.">{stock.qty}</td>
                <td data-label="Avg. cost">{formatCurrency(stock.avg)}</td>
                <td data-label="LTP">{formatCurrency(stock.price)}</td>
                <td data-label="Cur. val">{formatCurrency(curValue)}</td>
                <td data-label="P&L" className={profClass}>
                  {pnl >= 0 ? "+" : ""}
                  {formatCurrency(pnl)}
                </td>
                <td data-label="Net chg." className={profClass}>
                  {stock.net}
                </td>
                <td data-label="Day chg." className={dayClass}>
                  {stock.day}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Holdings = () => {
  const [activeTab, setActiveTab] = useState("holdings");
  const [remoteHoldings, setRemoteHoldings] = useState([]);
  const [didHoldingsRequestFail, setDidHoldingsRequestFail] = useState(false);
  const [allocation, setAllocation] = useState([]);
  const [sectorExposure, setSectorExposure] = useState([]);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    apiClient
      .get("/allHoldings")
      .then((res) => {
        setRemoteHoldings(res.data);
        setDidHoldingsRequestFail(false);
      })
      .catch(() => {
        setRemoteHoldings([]);
        setDidHoldingsRequestFail(true);
      });

    Promise.all([
      getAllocation(),
      getSectorExposure(),
      getPortfolioPerformance("3M"),
    ])
      .then(([allocationRes, sectorRes, performanceRes]) => {
        setAllocation(allocationRes.data);
        setSectorExposure(sectorRes.data);
        setPerformance(performanceRes.data);
      })
      .catch(() => {
        setAllocation([]);
        setSectorExposure([]);
        setPerformance([]);
      });
  }, []);

  const allHoldings = didHoldingsRequestFail ? fallbackHoldings : remoteHoldings;

  const totals = useMemo(() => {
    const invested = allHoldings.reduce(
      (sum, stock) => sum + stock.avg * stock.qty,
      0
    );
    const current = allHoldings.reduce(
      (sum, stock) => sum + stock.price * stock.qty,
      0
    );
    const pnl = current - invested;
    return { invested, current, pnl };
  }, [allHoldings]);

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Portfolio workspace</h1>
        </div>
      </div>

      <div className="trading-strip portfolio-summary-strip">
        <article className="strip-metric">
          <span>Total investment</span>
          <strong>{formatCurrency(totals.invested)}</strong>
          <p>Cost basis</p>
        </article>
        <article className="strip-metric">
          <span>Current value</span>
          <strong>{formatCurrency(totals.current)}</strong>
          <p>Marked to latest price</p>
        </article>
        <article className="strip-metric">
          <span>Unrealized P&L</span>
          <strong className={totals.pnl >= 0 ? "positive" : "negative"}>
            {totals.pnl >= 0 ? "+" : ""}
            {formatCurrency(totals.pnl)}
          </strong>
          <p>
            {totals.invested > 0
              ? `${formatPercent((totals.pnl / totals.invested) * 100)} return`
              : "No holdings yet"}
          </p>
        </article>
        <article className="strip-metric">
          <span>Holdings</span>
          <strong>{allHoldings.length}</strong>
          <p>Active instruments</p>
        </article>
      </div>

      <section className="panel trading-chart-panel portfolio-performance-panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Performance</p>
            <h2>Portfolio value over 3 months</h2>
          </div>
        </div>
        <PortfolioPerformanceChart data={performance} />
      </section>

      <section className="panel portfolio-table-panel">
        <div className="tabs" role="tablist" aria-label="Portfolio tabs">
          <button
            className={activeTab === "holdings" ? "tab active" : "tab"}
            onClick={() => setActiveTab("holdings")}
            type="button"
          >
            Holdings
          </button>
          <button
            className={activeTab === "positions" ? "tab active" : "tab"}
            onClick={() => setActiveTab("positions")}
            type="button"
          >
            Positions
          </button>
        </div>

        {activeTab === "holdings" ? (
          <>
            <HoldingsTable holdings={allHoldings} />
            <div className="dashboard-grid dashboard-grid--two chart-grid portfolio-support-grid">
              <section className="support-panel">
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Allocation</p>
                    <h2>Capital by symbol</h2>
                  </div>
                </div>
                <AllocationChart data={allocation} />
              </section>
              <section className="support-panel">
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Sector mix</p>
                    <h2>Capital by sector</h2>
                  </div>
                </div>
                <SectorExposureChart data={sectorExposure} />
              </section>
            </div>
            <div className="sector-grid sector-grid--compact portfolio-sector-strip">
              {sectorExposure.map((sector) => (
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
          </>
        ) : (
          <Positions />
        )}
      </section>
    </section>
  );
};

export default Holdings;
