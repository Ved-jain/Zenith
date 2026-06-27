import React from "react";
import { Link } from "react-router-dom";

function Hero() {

  return (
    <section className="hero-section">
      <div className="hero-section__copy">
        <h1>Reach Your Financial Zenith</h1>
        <p className="hero-section__lead">
          Zenith brings portfolio health, watchlists, stock details, order
          history, and trading analytics into one quietly expensive, elite workspace built for
          serious investors.
        </p>
        <div className="hero-section__actions">
          <Link className="button button--primary" to="/signup">
            Get Started
          </Link>
          <Link className="button button--secondary" to="/product">
            Learn More
          </Link>
        </div>
      </div>

      <div className="product-preview product-preview--terminal" aria-label="Zenith dashboard preview">
        <div className="product-preview__topbar">
          <span>Overview</span>
          <span>Portfolio</span>
          <span>Orders</span>
        </div>
        <div className="product-preview__header">
          <div>
            <span className="eyebrow">Live workspace</span>
            <h2>Portfolio Value</h2>
          </div>
          <strong style={{fontFamily: "'JetBrains Mono', monospace", color: "var(--success)"}}>₹3.42L</strong>
        </div>
        <div className="product-preview__meter">
          <span style={{ width: "76%" }} />
        </div>
        <div className="product-preview__grid">
          <div>
            <span>Health score</span>
            <strong style={{fontFamily: "'JetBrains Mono', monospace"}}>82</strong>
          </div>
          <div>
            <span>Total return</span>
            <strong className="positive" style={{fontFamily: "'JetBrains Mono', monospace"}}>+5.20%</strong>
          </div>
          <div>
            <span>Orders</span>
            <strong style={{fontFamily: "'JetBrains Mono', monospace"}}>18</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
