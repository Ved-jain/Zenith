import React from "react";

function Education() {
  const workflow = [
    "Review Portfolio Health Score on the Overview page.",
    "Check Sector Exposure before making allocation decisions.",
    "Use Portfolio tabs to compare Holdings and Positions.",
    "Open Insights to see what deserves attention next.",
  ];

  return (
    <section className="section-block" id="insights">
      <div className="section-heading">
        <p className="eyebrow">Analytics workflow</p>
        <h2>A calmer loop for portfolio decisions.</h2>
      </div>
      <div className="workflow-list">
        {workflow.map((item, index) => (
          <div className="workflow-item" key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Education;
