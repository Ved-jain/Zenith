import React from "react";
import { Link } from "react-router-dom";

function Universe() {
  return (
    <section className="analytics-showcase">
      <div>
        <p className="eyebrow">Signature view</p>
        <h2>Portfolio health plus sector exposure.</h2>
        <p>
          The redesigned dashboard uses health scoring and exposure cards as
          first-class product elements, making Zenith feel like its own
          analytics platform rather than a broker interface.
        </p>
        <Link className="button button--secondary" to="/signup">
          Preview workflow
        </Link>
      </div>
      <div className="showcase-card">
        <div className="showcase-card__score">
          <span>Health score</span>
          <strong>82</strong>
        </div>
        <div className="exposure-bars">
          <span style={{ width: "78%" }}>Financials</span>
          <span style={{ width: "62%" }}>Technology</span>
          <span style={{ width: "38%" }}>Consumer</span>
        </div>
      </div>
    </section>
  );
}

export default Universe;
