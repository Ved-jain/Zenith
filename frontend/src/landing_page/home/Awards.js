import React from "react";

function Awards() {
  const pillars = [
    {
      title: "Portfolio health",
      text: "A single score summarizes diversification, return quality, cash balance, and concentration risk.",
    },
    {
      title: "Sector exposure",
      text: "See where your capital is actually clustered before one theme quietly dominates the account.",
    },
    {
      title: "Decision context",
      text: "Review top movers, contributors, and watchlist signals without switching into trading-terminal mode.",
    },
  ];

  return (
    <section className="section-block" id="portfolio-health">
      <div className="section-heading">
        <p className="eyebrow">Designed for investors</p>
        <h2>Less broker terminal. More portfolio clarity.</h2>
        <p>
          Zenith keeps the useful parts of a trading dashboard but reshapes
          the experience around understanding allocation, performance, and risk.
        </p>
      </div>
      <div className="feature-grid">
        {pillars.map((pillar) => (
          <article className="feature-card" key={pillar.title}>
            <span className="feature-card__marker" />
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Awards;
