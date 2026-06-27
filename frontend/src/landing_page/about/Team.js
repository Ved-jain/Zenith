import React from "react";

function Team() {
  const principles = [
    "Plain-language analytics over trading jargon.",
    "Light interfaces that support repeated daily review.",
    "Portfolio context before transaction prompts.",
  ];

  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Product principles</p>
        <h2>The operating system for the redesign.</h2>
      </div>
      <div className="feature-grid">
        {principles.map((principle) => (
          <article className="feature-card" key={principle}>
            <span className="feature-card__marker" />
            <p>{principle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Team;
