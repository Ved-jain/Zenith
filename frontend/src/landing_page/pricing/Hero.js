import React from "react";

function Hero() {
  const plans = [
    ["Starter", "Portfolio overview, watchlist, and sample insights"],
    ["Investor", "Health score, sector exposure, and full portfolio tabs"],
    ["Workspace", "Team-ready review flows and expanded insight history"],
  ];

  return (
    <section className="page-hero">
      <p className="eyebrow">Pricing</p>
      <h1>Simple access for a focused analytics workspace.</h1>
      <p>
        Pricing is framed around portfolio review capabilities, not brokerage
        charges or trading segments.
      </p>
      <div className="pricing-grid">
        {plans.map(([name, text]) => (
          <article className="plan-card" key={name}>
            <h3>{name}</h3>
            <p>{text}</p>
            <strong>Analytics access</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Hero;
