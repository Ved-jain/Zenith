import React from "react";

function Stats() {
  const stats = [
    ["82", "sample health score"],
    ["4", "sector groups tracked"],
    ["13", "holdings analyzed"],
    ["0", "terminal distractions"],
  ];

  return (
    <section className="analytics-band" id="sector-exposure">
      <div>
        <p className="eyebrow">Workspace principles</p>
        <h2>Built around review, not impulse.</h2>
        <p>
          The product experience favors measured portfolio review: summary
          cards, sector exposure, holdings tabs, and plain-language insight
          prompts.
        </p>
      </div>
      <div className="stat-grid">
        {stats.map(([value, label]) => (
          <div className="stat-card" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;
