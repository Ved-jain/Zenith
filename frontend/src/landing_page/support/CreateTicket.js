import React from "react";

function CreateTicket() {
  const topics = [
    {
      title: "Portfolio Health Score",
      links: ["How the score is framed", "Why concentration matters", "Interpreting low-score signals"],
    },
    {
      title: "Sector Exposure",
      links: ["Reading exposure cards", "Understanding sector weights", "Reviewing concentration"],
    },
    {
      title: "Portfolio Data",
      links: ["Holdings tab", "Positions tab", "Table values and P&L"],
    },
    {
      title: "Watchlist",
      links: ["Adding symbols", "Using local search", "Asset detail panel"],
    },
    {
      title: "Insights",
      links: ["Insight severity", "Score drivers", "Contributor breakdown"],
    },
    {
      title: "Settings",
      links: ["Profile", "Display preferences", "Account and funds"],
    },
  ];

  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Support topics</p>
        <h2>Choose the area you want to review.</h2>
      </div>
      <div className="support-grid">
        {topics.map((topic) => (
          <article className="support-card" key={topic.title}>
            <h3>{topic.title}</h3>
            {topic.links.map((link) => (
              <a href="#support" key={link}>
                {link}
              </a>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

export default CreateTicket;
