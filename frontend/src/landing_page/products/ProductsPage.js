import React from "react";

import Hero from "./Hero";
import Universe from "./Universe";

function ProductsPage() {
  const modules = [
    {
      title: "Overview",
      text: "Portfolio Health Score, core metrics, sector exposure, top movers, and review signals.",
    },
    {
      title: "Portfolio",
      text: "Holdings and Positions stay together as tabs with cleaner tables and allocation context.",
    },
    {
      title: "Watchlist",
      text: "A dedicated space for tracked assets, local search, detail panels, and secondary actions.",
    },
    {
      title: "Insights",
      text: "Plain-language prompts explaining score drivers, concentration, and contributors.",
    },
  ];

  return (
    <>
      <Hero />
      <section className="section-block">
        <div className="feature-grid">
          {modules.map((module) => (
            <article className="feature-card" key={module.title}>
              <span className="feature-card__marker" />
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </article>
          ))}
        </div>
      </section>
      <Universe />
    </>
  );
}

export default ProductsPage;
