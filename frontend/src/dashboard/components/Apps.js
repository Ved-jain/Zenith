import React, { useEffect, useState } from "react";
import { holdings as fallbackHoldings, insightCards } from "../data/data";
import apiClient from "../../api/client";
import { getOverview, getSectorExposure } from "../../api/analytics";
import { formatCurrency, formatPercent } from "../../utils/formatters";

const Apps = () => {
  const [remoteHoldings, setRemoteHoldings] = useState([]);
  const [didHoldingsRequestFail, setDidHoldingsRequestFail] = useState(false);
  const [overview, setOverview] = useState(null);
  const [sectorExposure, setSectorExposure] = useState([]);

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

    Promise.all([getOverview(), getSectorExposure()])
      .then(([overviewRes, sectorRes]) => {
        setOverview(overviewRes.data);
        setSectorExposure(sectorRes.data);
      })
      .catch(() => {
        setOverview(null);
        setSectorExposure([]);
      });
  }, []);

  const holdings = didHoldingsRequestFail ? fallbackHoldings : remoteHoldings;
  const healthScore = overview?.healthScore || 0;
  const winners = holdings
    .map((stock) => ({
      name: stock.name,
      contribution: stock.price * stock.qty - stock.avg * stock.qty,
    }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Insights</p>
          <h1>Signals for the next portfolio review</h1>
        </div>
      </div>

      <div className="overview-grid">
        <article className="health-card">
          <div>
            <p className="eyebrow">Portfolio Health Score</p>
            <h2>{healthScore}</h2>
            <p>
              {holdings.length
                ? "Score reflects diversification, total return, cash readiness, and concentration risk."
                : "Insights will become portfolio-specific once this user has holdings."}
            </p>
          </div>
          <div className="health-card__meter">
            <span style={{ width: `${healthScore}%` }} />
          </div>
        </article>

        <div className="metric-grid">
          {sectorExposure.slice(0, 3).map((sector) => (
            <article className="metric-card" key={sector.sector}>
              <span>{sector.sector}</span>
              <strong>{formatPercent(sector.percentage, { showSign: false })}</strong>
              <p>{formatCurrency(sector.value)} allocated</p>
            </article>
          ))}
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--two">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Insight feed</p>
              <h2>What deserves attention</h2>
            </div>
          </div>
          <div className="insight-list">
            {insightCards.map((insight) => (
              <article className="insight-card" key={insight.title}>
                <span>{insight.severity}</span>
                <h3>{insight.title}</h3>
                <p>{insight.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Contributors</p>
              <h2>Return leaders</h2>
            </div>
          </div>
          {winners.length ? (
            <div className="data-table data-table--compact">
              <div className="data-table__head">
                <span>Asset</span>
                <span>Contribution</span>
              </div>
              {winners.map((stock) => (
                <div className="data-table__row" key={stock.name}>
                  <strong>{stock.name}</strong>
                  <span className={stock.contribution >= 0 ? "positive" : "negative"}>
                    {stock.contribution >= 0 ? "+" : ""}
                    {formatCurrency(stock.contribution)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No contributors yet</h3>
              <p>Contributor analytics will render after this user has holdings.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default Apps;
