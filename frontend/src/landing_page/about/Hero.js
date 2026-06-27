import React from "react";

function Hero() {
  return (
    <section className="page-hero">
      <p className="eyebrow">About Zenith</p>
      <h1>Portfolio analytics for investors who prefer clarity over noise.</h1>
      <p>
        Zenith is designed as a focused workspace for understanding what you
        own, how it is performing, and where your portfolio may need attention.
        The experience is intentionally light, calm, and structured around
        review rather than rapid-fire execution.
      </p>
      <div className="mission-grid">
        <article>
          <h3>Make risk visible</h3>
          <p>
            Surface concentration, sector exposure, and portfolio health before
            they become difficult to reason about.
          </p>
        </article>
        <article>
          <h3>Keep decisions grounded</h3>
          <p>
            Present performance, watchlist movement, and insight prompts in one
            place without leaning on flashy patterns.
          </p>
        </article>
      </div>
    </section>
  );
}

export default Hero;
