import React from "react";

function Brokerage() {
  const details = [
    "Health score and exposure cards are included in the core dashboard.",
    "Holdings and Positions remain grouped inside Portfolio.",
    "Watchlist search is local to the Watchlist page only.",
    "The workspace stays focused on portfolio review instead of broad market browsing.",
  ];

  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Plan notes</p>
        <h2>What the workspace includes.</h2>
      </div>
      <div className="workflow-list">
        {details.map((detail, index) => (
          <div className="workflow-item" key={detail}>
            <span>{index + 1}</span>
            <p>{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Brokerage;
